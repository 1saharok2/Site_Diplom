<?php
// admin/products.php

ini_set('display_errors', 0);
error_reporting(0);

require_once '../db.php';

// Настройки CORS
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (ob_get_level() === 0) {
    ob_start();
}

// Проверка авторизации администратора
function checkAdminAuth() {
    $headers = getallheaders();
    
    // Для отладки - временно разрешаем без авторизации
    // УДАЛИТЕ ЭТУ СТРОКУ В ПРОДАКШЕНЕ!
    return true;
    
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Требуется авторизация']);
        exit();
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    
    // Здесь должна быть реальная проверка JWT токена
    // Для примера проверяем наличие токена
    if (empty($token)) {
        http_response_code(403);
        echo json_encode(['error' => 'Доступ запрещен']);
        exit();
    }
    
    // В реальном приложении:
    // 1. Проверяем JWT токен
    // 2. Извлекаем данные пользователя
    // 3. Проверяем роль 'admin'
    
    return true;
}

// Функция для валидации данных товара
function validateProductData($data) {
    $errors = [];
    
    if (empty(trim($data['name'] ?? ''))) {
        $errors[] = 'Название товара обязательно';
    }
    
    if (!isset($data['price']) || !is_numeric($data['price']) || $data['price'] < 0) {
        $errors[] = 'Цена должна быть положительным числом';
    }
    
    if (isset($data['old_price']) && $data['old_price'] !== null && 
        (!is_numeric($data['old_price']) || $data['old_price'] < 0)) {
        $errors[] = 'Старая цена должна быть положительным числом';
    }
    
    if (isset($data['discount']) && (!is_numeric($data['discount']) || $data['discount'] < 0 || $data['discount'] > 100)) {
        $errors[] = 'Скидка должна быть числом от 0 до 100';
    }
    
    if (empty(trim($data['category_slug'] ?? ''))) {
        $errors[] = 'Категория обязательна';
    }
    
    return $errors;
}

// Функция для генерации slug
function generateSlug($name) {
    $slug = mb_strtolower(trim($name), 'UTF-8');
    
    // Заменяем пробелы и спецсимволы на дефисы
    $slug = preg_replace('/[^\p{L}\p{N}]+/u', '-', $slug);
    
    // Убираем лишние дефисы
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    
    // Если slug пустой, используем timestamp
    if (empty($slug)) {
        $slug = 'product-' . time();
    }
    
    return $slug;
}

// Функция для обработки изображений
function processImageData($imageData) {
    if (empty($imageData)) {
        return null;
    }
    
    // Если это строка с URL
    if (is_string($imageData)) {
        $url = trim($imageData);
        if (!empty($url) && (filter_var($url, FILTER_VALIDATE_URL) || strpos($url, '/') === 0)) {
            return json_encode([$url]);
        }
        return null;
    }
    
    // Если это массив URL
    if (is_array($imageData)) {
        $filtered = array_filter($imageData, function($url) {
            $url = trim($url);
            return !empty($url) && (filter_var($url, FILTER_VALIDATE_URL) || strpos($url, '/') === 0);
        });
        
        if (!empty($filtered)) {
            return json_encode(array_values($filtered));
        }
    }
    
    return null;
}

// Основная логика
try {
    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    switch ($method) {
        case 'GET':
            // Проверяем авторизацию для GET запросов в админке
            checkAdminAuth();
            
            if ($id) {
                // Получение конкретного товара
                $sql = "SELECT * FROM products WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $res = $stmt->get_result();
                
                if ($res->num_rows === 0) {
                    http_response_code(404);
                    ob_clean();
                    echo json_encode(['error' => 'Товар не найден'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $product = $res->fetch_assoc();
                $stmt->close();
                
                ob_clean();
                echo json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } else {
                // Получение всех товаров с пагинацией
                $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
                $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
                $offset = ($page - 1) * $limit;
                
                // Подсчет общего количества
                $count_sql = "SELECT COUNT(*) as total FROM products";
                $count_res = $conn->query($count_sql);
                $total_row = $count_res->fetch_assoc();
                $total = $total_row['total'];
                
                // Получение товаров
                $sql = "SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ii", $limit, $offset);
                $stmt->execute();
                $res = $stmt->get_result();
                
                $products = [];
                while ($row = $res->fetch_assoc()) {
                    $products[] = $row;
                }
                
                $stmt->close();
                
                ob_clean();
                echo json_encode([
                    'products' => $products,
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total' => $total,
                        'pages' => ceil($total / $limit)
                    ]
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }
            break;
            
        case 'POST':
            // Создание нового товара
            checkAdminAuth();
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'Некорректный JSON'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Валидация данных
            $errors = validateProductData($input);
            if (!empty($errors)) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['errors' => $errors], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Генерация slug
            $slug = generateSlug($input['name']);
            
            // Проверка уникальности slug
            $check_sql = "SELECT id FROM products WHERE slug = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("s", $slug);
            $check_stmt->execute();
            $check_res = $check_stmt->get_result();
            
            if ($check_res->num_rows > 0) {
                $slug = $slug . '-' . time();
            }
            $check_stmt->close();
            
            // Подготовка данных
            $image_url = processImageData($input['image'] ?? $input['images'] ?? null);
            
            $specifications = null;
            if (isset($input['specifications']) && !empty($input['specifications'])) {
                $specifications = json_encode($input['specifications'], JSON_UNESCAPED_UNICODE);
            }
            
            // SQL запрос
            $sql = "INSERT INTO products (
                name, slug, price, old_price, description, category_slug,
                brand, rating, reviews_count, is_new, discount, stock,
                specifications, is_active, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            
            // Привязка параметров
            $name = trim($input['name']);
            $price = floatval($input['price']);
            $old_price = isset($input['old_price']) && $input['old_price'] !== null ? floatval($input['old_price']) : null;
            $description = trim($input['description'] ?? '');
            $category_slug = trim($input['category_slug']);
            $brand = trim($input['brand'] ?? '');
            $rating = isset($input['rating']) ? floatval($input['rating']) : 0.0;
            $reviews_count = isset($input['reviews_count']) ? intval($input['reviews_count']) : 0;
            $is_new = isset($input['is_new']) ? intval($input['is_new']) : 0;
            $discount = isset($input['discount']) ? intval($input['discount']) : 0;
            $stock = isset($input['stock']) ? intval($input['stock']) : 0;
            $is_active = isset($input['is_active']) ? intval($input['is_active']) : 1;
            
            $stmt->bind_param(
                "ssddsssdiiiiiss",
                $name, $slug, $price, $old_price, $description, $category_slug,
                $brand, $rating, $reviews_count, $is_new, $discount, $stock,
                $specifications, $is_active, $image_url
            );
            
            if ($stmt->execute()) {
                $new_id = $stmt->insert_id;
                
                // Получаем созданный товар
                $get_sql = "SELECT * FROM products WHERE id = ?";
                $get_stmt = $conn->prepare($get_sql);
                $get_stmt->bind_param("i", $new_id);
                $get_stmt->execute();
                $get_res = $get_stmt->get_result();
                $product = $get_res->fetch_assoc();
                
                $stmt->close();
                $get_stmt->close();
                
                http_response_code(201);
                ob_clean();
                echo json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } else {
                http_response_code(500);
                ob_clean();
                echo json_encode(['error' => 'Ошибка при создании товара: ' . $conn->error], JSON_UNESCAPED_UNICODE);
            }
            break;
            
        case 'PUT':
            // Обновление товара
            checkAdminAuth();
            
            if (!$id) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'ID товара не указан'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'Некорректный JSON'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Проверка существования товара
            $check_sql = "SELECT id FROM products WHERE id = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("i", $id);
            $check_stmt->execute();
            $check_res = $check_stmt->get_result();
            
            if ($check_res->num_rows === 0) {
                $check_stmt->close();
                http_response_code(404);
                ob_clean();
                echo json_encode(['error' => 'Товар не найден'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $check_stmt->close();
            
            // Подготовка данных для обновления
            $updates = [];
            $params = [];
            $types = '';
            
            if (isset($input['name'])) {
                $updates[] = "name = ?";
                $params[] = trim($input['name']);
                $types .= "s";
                
                // Обновляем slug если изменилось имя
                $new_slug = generateSlug($input['name']);
                $updates[] = "slug = ?";
                $params[] = $new_slug;
                $types .= "s";
            }
            
            if (isset($input['price'])) {
                $updates[] = "price = ?";
                $params[] = floatval($input['price']);
                $types .= "d";
            }
            
            if (array_key_exists('old_price', $input)) {
                $updates[] = "old_price = ?";
                $params[] = $input['old_price'] !== null ? floatval($input['old_price']) : null;
                $types .= "d";
            }
            
            if (isset($input['description'])) {
                $updates[] = "description = ?";
                $params[] = trim($input['description']);
                $types .= "s";
            }
            
            if (isset($input['category_slug'])) {
                $updates[] = "category_slug = ?";
                $params[] = trim($input['category_slug']);
                $types .= "s";
            }
            
            if (isset($input['brand'])) {
                $updates[] = "brand = ?";
                $params[] = trim($input['brand']);
                $types .= "s";
            }
            
            if (isset($input['rating'])) {
                $updates[] = "rating = ?";
                $params[] = floatval($input['rating']);
                $types .= "d";
            }
            
            if (isset($input['reviews_count'])) {
                $updates[] = "reviews_count = ?";
                $params[] = intval($input['reviews_count']);
                $types .= "i";
            }
            
            if (isset($input['is_new'])) {
                $updates[] = "is_new = ?";
                $params[] = intval($input['is_new']);
                $types .= "i";
            }
            
            if (isset($input['discount'])) {
                $updates[] = "discount = ?";
                $params[] = intval($input['discount']);
                $types .= "i";
            }
            
            if (isset($input['stock'])) {
                $updates[] = "stock = ?";
                $params[] = intval($input['stock']);
                $types .= "i";
            }
            
            if (isset($input['is_active'])) {
                $updates[] = "is_active = ?";
                $params[] = intval($input['is_active']);
                $types .= "i";
            }
            
            // Обработка изображений
            if (isset($input['image']) || isset($input['images'])) {
                $image_data = $input['images'] ?? $input['image'] ?? null;
                $image_url = processImageData($image_data);
                
                $updates[] = "image_url = ?";
                $params[] = $image_url;
                $types .= "s";
            }
            
            // Обработка спецификаций
            if (isset($input['specifications'])) {
                $specifications = null;
                if (!empty($input['specifications'])) {
                    $specifications = json_encode($input['specifications'], JSON_UNESCAPED_UNICODE);
                }
                
                $updates[] = "specifications = ?";
                $params[] = $specifications;
                $types .= "s";
            }
            
            // Обновляем время изменения
            $updates[] = "updated_at = CURRENT_TIMESTAMP";
            
            if (empty($updates)) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'Нет данных для обновления'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Добавляем ID в параметры
            $params[] = $id;
            $types .= "i";
            
            // Собираем SQL
            $sql = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            
            // Динамическая привязка параметров
            $stmt->bind_param($types, ...$params);
            
            if ($stmt->execute()) {
                // Получаем обновленный товар
                $get_sql = "SELECT * FROM products WHERE id = ?";
                $get_stmt = $conn->prepare($get_sql);
                $get_stmt->bind_param("i", $id);
                $get_stmt->execute();
                $get_res = $get_stmt->get_result();
                $product = $get_res->fetch_assoc();
                
                $stmt->close();
                $get_stmt->close();
                
                ob_clean();
                echo json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } else {
                http_response_code(500);
                ob_clean();
                echo json_encode(['error' => 'Ошибка при обновлении товара: ' . $stmt->error], JSON_UNESCAPED_UNICODE);
            }
            break;
            
        case 'DELETE':
            // Удаление товара
            checkAdminAuth();
            
            if (!$id) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'ID товара не указан'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Проверка существования товара
            $check_sql = "SELECT id FROM products WHERE id = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("i", $id);
            $check_stmt->execute();
            $check_res = $check_stmt->get_result();
            
            if ($check_res->num_rows === 0) {
                $check_stmt->close();
                http_response_code(404);
                ob_clean();
                echo json_encode(['error' => 'Товар не найден'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $check_stmt->close();
            
            // Удаление товара
            $sql = "DELETE FROM products WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                $stmt->close();
                http_response_code(200);
                ob_clean();
                echo json_encode(['success' => true, 'message' => 'Товар успешно удален']);
            } else {
                http_response_code(500);
                ob_clean();
                echo json_encode(['error' => 'Ошибка при удалении товара: ' . $conn->error], JSON_UNESCAPED_UNICODE);
            }
            break;
            
        default:
            http_response_code(405);
            ob_clean();
            echo json_encode(['error' => 'Метод не поддерживается'], JSON_UNESCAPED_UNICODE);
            break;
    }
    
} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'error' => 'Внутренняя ошибка сервера',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
    exit;
}
?>