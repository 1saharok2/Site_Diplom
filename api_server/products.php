<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once 'db.php'; // Подключение к базе данных

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
    if (empty($url) || !is_string($url)) {
        return null;
    }
    $url = preg_replace('/[?&]token=[^&]*/', '', $url);
    $url = preg_replace('/[?&]t=[^&]*/', '', $url);
    $url = rtrim($url, '?&');
    return $url;
}

/**
 * Максимально надёжное извлечение массива изображений из поля БД
 * Возвращает всегда массив, даже если изображение одно.
 */
function extractImages($imageData) {
    // Если данных нет – возвращаем заглушку
    if (empty($imageData)) {
        return ['/images/placeholder.jpg'];
    }

    // Если это уже массив (например, при использовании mysqlnd)
    if (is_array($imageData)) {
        $images = [];
        foreach ($imageData as $url) {
            if (is_string($url) && trim($url) !== '') {
                $cleanUrl = cleanImageUrl(trim($url));
                if ($cleanUrl) {
                    $images[] = $cleanUrl;
                }
            }
        }
        return !empty($images) ? $images : ['/images/placeholder.jpg'];
    }

    // Если строка – пробуем все возможные варианты
    if (is_string($imageData)) {
        $cleaned = cleanString($imageData);

        // 1. Прямой JSON-декод
        $decoded = json_decode($cleaned, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $images = [];
            foreach ($decoded as $url) {
                if (is_string($url) && trim($url) !== '') {
                    $cleanUrl = cleanImageUrl(trim($url));
                    if ($cleanUrl) {
                        $images[] = $cleanUrl;
                    }
                }
            }
            if (!empty($images)) {
                return $images;
            }
        }

        // 2. Возможно, строка содержит экранированные кавычки (JSON с экранированием)
        $stripped = stripslashes($cleaned);
        if ($stripped !== $cleaned) {
            $decoded = json_decode($stripped, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $images = [];
                foreach ($decoded as $url) {
                    if (is_string($url) && trim($url) !== '') {
                        $cleanUrl = cleanImageUrl(trim($url));
                        if ($cleanUrl) {
                            $images[] = $cleanUrl;
                        }
                    }
                }
                if (!empty($images)) {
                    return $images;
                }
            }
        }

        // 3. Извлекаем все строки в кавычках (даже с экранированными символами)
        if (preg_match_all('/"((?:[^"\\\\]|\\\\.)*)"/', $cleaned, $matches)) {
            $images = [];
            foreach ($matches[1] as $url) {
                $url = stripslashes($url); // убираем экранирование внутри строки
                if (trim($url) !== '') {
                    $cleanUrl = cleanImageUrl(trim($url));
                    if ($cleanUrl) {
                        $images[] = $cleanUrl;
                    }
                }
            }
            if (!empty($images)) {
                return $images;
            }
        }

        // 4. Пробуем разбить по запятой (запасной вариант)
        $possibleUrls = explode(',', $cleaned);
        if (count($possibleUrls) > 1) {
            $images = [];
            foreach ($possibleUrls as $url) {
                $url = trim($url);
                if (!empty($url)) {
                    $cleanUrl = cleanImageUrl($url);
                    if ($cleanUrl) {
                        $images[] = $cleanUrl;
                    }
                }
            }
            if (!empty($images)) {
                return $images;
            }
        }

        // 5. Если ничего не помогло, используем всю строку как один URL
        if (trim($cleaned) !== '') {
            $cleanUrl = cleanImageUrl(trim($cleaned));
            if ($cleanUrl) {
                return [$cleanUrl];
            }
        }
    }

    // Полный провал – заглушка
    return ['/images/placeholder.jpg'];
}

/**
 * Форматирует товар для ответа API
 */
function formatProduct($product) {
    // Извлекаем массив изображений
    $images = extractImages($product['image_url'] ?? '');

    // Парсим спецификации, если есть
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
        'image_url'      => $images[0] ?? '/images/placeholder.jpg', // для обратной совместимости
        'images'         => $images,                                 // основной массив для галереи
        'image'          => $images[0] ?? '/images/placeholder.jpg', // для обратной совместимости
        'specifications' => $specs,
        'created_at'     => $product['created_at'] ?? null
    ];
}

// --- Основная логика API ---
try {
    $products = [];

    // Запрос одного товара по ID
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

    // Запрос товаров по категории
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
            $products[] = formatProduct($row);
        }
        $stmt->close();

        ob_clean();
        echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Поиск по строке
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
            $products[] = formatProduct($row);
        }
        $stmt->close();

        ob_clean();
        echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Все активные товары (с лимитом)
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
        $products[] = formatProduct($row);
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