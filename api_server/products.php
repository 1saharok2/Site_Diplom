<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once 'db.php';

header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (ob_get_level() === 0) {
    ob_start();
}

// Функция для проверки доступности изображения
function isImageAccessible($url) {
    if (empty($url) || !is_string($url)) {
        return false;
    }
    
    // Проверяем, что URL начинается с http
    if (!preg_match('/^https?:\/\//', $url)) {
        return false;
    }
    
    return true;
}

// Функция для очистки URL
function cleanImageUrl($url) {
    if (empty($url) || !is_string($url)) {
        return null;
    }
    
    // Если URL уже чистый, возвращаем как есть
    if (isImageAccessible($url)) {
        return $url;
    }
    
    // Удаляем только проблемные токены
    $url = preg_replace('/[?&]token=[^&]*/', '', $url);
    $url = preg_replace('/[?&]t=[^&]*/', '', $url);
    
    // Убираем лишние знаки вопроса и амперсанды
    $url = rtrim($url, '?&');
    
    return $url;
}

// Функция для обработки изображений товара
function processProductImages($imageData) {
    $images = [];
    
    if (!empty($imageData)) {
        // Пытаемся декодировать JSON
        $decoded = json_decode($imageData, true);
        
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            // Это JSON массив
            foreach ($decoded as $url) {
                if (is_string($url) && $url !== '') {
                    $cleanUrl = cleanImageUrl($url);
                    if ($cleanUrl) {
                        $images[] = $cleanUrl;
                    }
                }
            }
        } elseif (is_string($imageData)) {
            // Это строка - возможно, один URL или разделенный чем-то
            // Сначала попробуем разбить по запятой
            $possibleUrls = explode(',', $imageData);
            foreach ($possibleUrls as $url) {
                $url = trim($url);
                if (!empty($url)) {
                    $cleanUrl = cleanImageUrl($url);
                    if ($cleanUrl) {
                        $images[] = $cleanUrl;
                    }
                }
            }
            
            // Если не нашли URL в разделенной строке, используем всю строку
            if (empty($images) && !empty(trim($imageData))) {
                $cleanUrl = cleanImageUrl(trim($imageData));
                if ($cleanUrl) {
                    $images[] = $cleanUrl;
                }
            }
        }
    }
    
    // Если нет изображений, используем placeholder
    if (empty($images)) {
        $images = ['/images/placeholder.jpg'];
    }
    
    return $images;
}

// Функция для форматирования товара
function formatProduct($product) {
    // Обработка изображений
    $images = processProductImages($product['image_url'] ?? '');
    
    // Обработка спецификаций
    $specs = null;
    if (!empty($product['specifications'])) {
        $specsDecoded = json_decode($product['specifications'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $specs = $specsDecoded;
        }
    }
    
    return [
        'id'             => (int)$product['id'],
        'slug'           => $product['slug'] ?? null,
        'name'           => $product['name'],
        'price'          => isset($product['price']) ? (float)$product['price'] : 0,
        'old_price'      => isset($product['old_price']) && $product['old_price'] !== null ? (float)$product['old_price'] : null,
        'discount'       => isset($product['discount']) ? (int)$product['discount'] : 0,
        'rating'         => isset($product['rating']) ? (float)$product['rating'] : 0,
        'reviews_count'  => isset($product['reviews_count']) ? (int)$product['reviews_count'] : 0,
        'stock'          => isset($product['stock']) ? (int)$product['stock'] : 0,
        'is_new'         => !empty($product['is_new']) ? (bool)$product['is_new'] : false,
        'brand'          => $product['brand'] ?? '',
        'description'    => $product['description'] ?? '',
        'category_slug'  => $product['category_slug'],
        'category_name'  => $product['category_name'] ?? '',
        'image_url'      => $images[0], // Первое изображение как основное
        'images'         => $images,    // Все изображения как массив
        'image'          => $images[0], // Дублируем для совместимости
        'specifications' => $specs,
        'created_at'     => $product['created_at'] ?? null
    ];
}

try {
    $products = [];
    
    // Проверяем, запрашивается ли конкретный товар по ID
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM products WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
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
        
        $formattedProduct = formatProduct($product);
        
        ob_clean();
        echo json_encode($formattedProduct, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Проверяем, запрашивается ли конкретная категория
    if (isset($_GET['category'])) {
        $categorySlug = $_GET['category'];
        $sql = "SELECT * FROM products WHERE category_slug = ? AND is_active = 1 ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param("s", $categorySlug);
        $stmt->execute();
        $res = $stmt->get_result();
        
        while ($row = $res->fetch_assoc()) { 
            $formattedProduct = formatProduct($row);
            $products[] = $formattedProduct;
        }
        $stmt->close();
        
        ob_clean();
        echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Проверяем поиск
    if (isset($_GET['q'])) {
        $query = '%' . $_GET['q'] . '%';
        $sql = "SELECT * FROM products WHERE (name LIKE ? OR description LIKE ? OR brand LIKE ?) AND is_active = 1 ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param("sss", $query, $query, $query);
        $stmt->execute();
        $res = $stmt->get_result();
        
        while ($row = $res->fetch_assoc()) { 
            $formattedProduct = formatProduct($row);
            $products[] = $formattedProduct;
        }
        $stmt->close();
        
        ob_clean();
        echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Иначе возвращаем все товары (для главной страницы)
    $limit = isset($_GET['limit']) ? max(1, min(200, intval($_GET['limit']))) : 200;
    $sql = "SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC LIMIT ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    $res = $stmt->get_result();
    
    while ($row = $res->fetch_assoc()) { 
        $formattedProduct = formatProduct($row);
        $products[] = $formattedProduct;
    }
    $stmt->close();

    ob_clean();
    echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'error' => 'Ошибка при получении товаров',
        'message' => $e->getMessage(),
        'sql_error' => isset($conn) ? $conn->error : null
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
    exit;
}
?>