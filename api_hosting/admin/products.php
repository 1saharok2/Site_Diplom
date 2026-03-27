<?php
// admin/products.php

ini_set('display_errors', 0);
error_reporting(0);

// 1. МЕНЯЕМ ПУТЬ К НОВОМУ ПОДКЛЮЧЕНИЮ
require_once __DIR__ . '/../config/Database.php'; 

header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (ob_get_level() === 0) ob_start();

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
    // 2. ИНИЦИАЛИЗИРУЕМ ПОДКЛЮЧЕНИЕ ЧЕРЕЗ НОВЫЙ КЛАСС
    $db = new Database();
    $conn = $db->getConnection(); 

    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    switch ($method) {
        case 'GET':
            checkAdminAuth();
            if ($id) {
                $sql = "SELECT * FROM products WHERE id = ?";
                $stmt = $conn->prepare($sql);
                // Если PDO:
                $stmt->execute([$id]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$product) {
                    http_response_code(404);
                    ob_clean();
                    echo json_encode(['error' => 'Товар не найден'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                ob_clean();
                echo json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } else {
                $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
                $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
                $offset = ($page - 1) * $limit;
                
                // Общее количество
                $count_res = $conn->query("SELECT COUNT(*) as total FROM products");
                $total_row = $count_res->fetch(PDO::FETCH_ASSOC);
                $total = $total_row['total'];
                
                // Товары
                $sql = "SELECT * FROM products ORDER BY id DESC LIMIT $limit OFFSET $offset";
                $res = $conn->query($sql);
                $products = $res->fetchAll(PDO::FETCH_ASSOC);
                
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
            checkAdminAuth();
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) { /* ошибка JSON */ }
            
            $errors = validateProductData($input);
            if (!empty($errors)) { /* ошибка валидации */ }
            
            $slug = generateSlug($input['name']);
            // Проверка уникальности slug через PDO
            $check_stmt = $conn->prepare("SELECT id FROM products WHERE slug = ?");
            $check_stmt->execute([$slug]);
            if ($check_stmt->fetch()) {
                $slug = $slug . '-' . time();
            }
            
            $image_url = processImageData($input['image'] ?? $input['images'] ?? null);
            $specifications = isset($input['specifications']) ? json_encode($input['specifications'], JSON_UNESCAPED_UNICODE) : null;
            
            $sql = "INSERT INTO products (name, slug, price, old_price, description, category_slug, brand, rating, reviews_count, is_new, discount, stock, specifications, is_active, image_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $success = $stmt->execute([
                trim($input['name']), $slug, floatval($input['price']), 
                $input['old_price'] ?? null, trim($input['description'] ?? ''), 
                trim($input['category_slug']), trim($input['brand'] ?? ''), 
                $input['rating'] ?? 0, $input['reviews_count'] ?? 0, 
                $input['is_new'] ?? 0, $input['discount'] ?? 0, 
                $input['stock'] ?? 0, $specifications, $input['is_active'] ?? 1, $image_url
            ]);
            
            if ($success) {
                $new_id = $conn->lastInsertId();
                $get_stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
                $get_stmt->execute([$new_id]);
                ob_clean();
                echo json_encode($get_stmt->fetch(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            }
            break;
            
        case 'PUT':
            // 1. Проверка авторизации
            checkAdminAuth();
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID товара не указан'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Некорректный JSON'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 2. Сборка полей для обновления
            $updates = [];
            $params = [];
            
            // Текстовые поля
            if (isset($input['name'])) {
                $updates[] = "name = ?";
                $params[] = trim($input['name']);
                
                $updates[] = "slug = ?";
                $params[] = generateSlug($input['name']);
            }
            
            if (isset($input['description'])) {
                $updates[] = "description = ?";
                $params[] = trim($input['description']);
            }

            if (isset($input['category_slug'])) {
                $updates[] = "category_slug = ?";
                $params[] = trim($input['category_slug']);
            }

            if (isset($input['brand'])) {
                $updates[] = "brand = ?";
                $params[] = trim($input['brand']);
            }

            // Числовые поля (цены, скидки, остатки)
            if (isset($input['price'])) {
                $updates[] = "price = ?";
                $params[] = floatval($input['price']);
            }

            if (array_key_exists('old_price', $input)) {
                $updates[] = "old_price = ?";
                $params[] = ($input['old_price'] !== null) ? floatval($input['old_price']) : null;
            }

            if (isset($input['rating'])) {
                $updates[] = "rating = ?";
                $params[] = floatval($input['rating']);
            }

            if (isset($input['reviews_count'])) {
                $updates[] = "reviews_count = ?";
                $params[] = intval($input['reviews_count']);
            }

            if (isset($input['is_new'])) {
                $updates[] = "is_new = ?";
                $params[] = intval($input['is_new']);
            }

            if (isset($input['discount'])) {
                $updates[] = "discount = ?";
                $params[] = intval($input['discount']);
            }

            if (isset($input['stock'])) {
                $updates[] = "stock = ?";
                $params[] = intval($input['stock']);
            }

            if (isset($input['is_active'])) {
                $updates[] = "is_active = ?";
                $params[] = intval($input['is_active']);
            }

            // JSON поля (картинки и характеристики)
            if (isset($input['image']) || isset($input['images'])) {
                $image_data = $input['images'] ?? $input['image'] ?? null;
                $updates[] = "image_url = ?";
                $params[] = processImageData($image_data);
            }

            if (isset($input['specifications'])) {
                $updates[] = "specifications = ?";
                $params[] = !empty($input['specifications']) ? json_encode($input['specifications'], JSON_UNESCAPED_UNICODE) : null;
            }

            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['error' => 'Нет данных для обновления'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Добавляем техническое поле
            $updates[] = "updated_at = CURRENT_TIMESTAMP";

            // 3. Выполнение запроса
            $sql = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?";
            $params[] = $id; // ID всегда последний в массиве параметров для WHERE

            $stmt = $conn->prepare($sql);
            
            if ($stmt->execute($params)) {
                // Возвращаем обновленный товар
                $get_stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
                $get_stmt->execute([$id]);
                $product = $get_stmt->fetch(PDO::FETCH_ASSOC);
                
                ob_clean();
                echo json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Ошибка при обновлении товара'], JSON_UNESCAPED_UNICODE);
            }
            break;
            
        case 'DELETE':
                    checkAdminAuth();
                    if (!$id) { /* ошибка ID */ }
                    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
                    if ($stmt->execute([$id])) {
                        ob_clean();
                        echo json_encode(['success' => true, 'message' => 'Товар успешно удален']);
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
    if (ob_get_length()) ob_clean();
    echo json_encode(['error' => 'Ошибка сервера', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($db) && method_exists($db, 'closeConnection')) {
        $db->closeConnection();
    }
    exit;
}
?>