<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once __DIR__ . '/config/database.php';
$database = new Database();
$conn = $database->getConnection();

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

/**
 * Удаляет BOM и невидимые символы из строки
 */
function cleanString($str) {
    $bom = pack('H*', 'EFBBBF');
    $str = preg_replace("/^$bom/", '', $str);
    $str = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $str);
    return trim($str);
}

/**
 * Очищает URL от лишних параметров
 */
function cleanImageUrl($url) {
    if (empty($url) || !is_string($url)) return null;
    $url = preg_replace('/[?&]token=[^&]*/', '', $url);
    $url = preg_replace('/[?&]t=[^&]*/', '', $url);
    $url = rtrim($url, '?&');
    return $url;
}

/**
 * Извлечение массива изображений
 */
function extractImages($imageData) {
    if (empty($imageData)) return ['/images/placeholder.jpg'];

    if (is_array($imageData)) {
        $images = [];
        foreach ($imageData as $url) {
            if (is_string($url) && trim($url) !== '') {
                $cleanUrl = cleanImageUrl(trim($url));
                if ($cleanUrl) $images[] = $cleanUrl;
            }
        }
        return !empty($images) ? $images : ['/images/placeholder.jpg'];
    }

    if (is_string($imageData)) {
        $cleaned = cleanString($imageData);
        $decoded = json_decode($cleaned, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $images = [];
            foreach ($decoded as $url) {
                if (is_string($url) && trim($url) !== '') {
                    $cleanUrl = cleanImageUrl(trim($url));
                    if ($cleanUrl) $images[] = $cleanUrl;
                }
            }
            if (!empty($images)) return $images;
        }
        
        // Запасной вариант - регулярка для кавычек
        if (preg_match_all('/"((?:[^"\\\\]|\\\\.)*)"/', $cleaned, $matches)) {
            $images = [];
            foreach ($matches[1] as $url) {
                $url = stripslashes($url);
                if (trim($url) !== '') {
                    $cleanUrl = cleanImageUrl(trim($url));
                    if ($cleanUrl) $images[] = $cleanUrl;
                }
            }
            if (!empty($images)) return $images;
        }
    }
    return ['/images/placeholder.jpg'];
}

/**
 * Форматирует товар для ответа API
 */
function formatProduct($product) {
    $images = extractImages($product['image_url'] ?? '');
    $specs = null;
    if (!empty($product['specifications'])) {
        $specsDecoded = json_decode($product['specifications'], true);
        if (json_last_error() === JSON_ERROR_NONE) $specs = $specsDecoded;
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
        'image_url'      => $images[0] ?? '/images/placeholder.jpg',
        'images'         => $images,
        'specifications' => $specs,
        'created_at'     => $product['created_at'] ?? null
    ];
}

try {
    // 1. Запрос одного товара по ID
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            http_response_code(404);
            ob_clean();
            echo json_encode(['error' => 'Товар не найден'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        ob_clean();
        echo json_encode(formatProduct($product), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // 2. Запрос товаров по категории
    if (isset($_GET['category'])) {
        $categorySlug = $_GET['category'];
        $stmt = $conn->prepare("SELECT * FROM products WHERE category_slug = ? AND is_active = 1 ORDER BY id DESC");
        $stmt->execute([$categorySlug]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $products = array_map('formatProduct', $rows);
        ob_clean();
        echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // 3. Поиск по строке
    if (isset($_GET['q'])) {
        $query = '%' . $_GET['q'] . '%';
        $stmt = $conn->prepare("SELECT * FROM products WHERE (name LIKE ? OR description LIKE ? OR brand LIKE ?) AND is_active = 1 ORDER BY id DESC");
        $stmt->execute([$query, $query, $query]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $products = array_map('formatProduct', $rows);
        ob_clean();
        echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // 4. Все активные товары (с лимитом)
    $limit = isset($_GET['limit']) ? max(1, min(200, intval($_GET['limit']))) : 200;
    $stmt = $conn->prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC LIMIT ?");
    // Важно: для LIMIT в PDO нужно передать тип явно или отключить эмуляцию, 
    // но проще всего передать как число напрямую если эмуляция включена:
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $products = array_map('formatProduct', $rows);
    ob_clean();
    echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'error' => 'Ошибка при получении товаров',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    exit;
}