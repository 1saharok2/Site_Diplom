<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

// Под тот же домен, что и остальное API (как в products.php)
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверка пути к конфигу — скорректируйте в зависимости от расположения файла
$configPath = __DIR__ . '/config/database.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Configuration file not found']);
    exit;
}
require_once $configPath;

$db = (new Database())->getConnection();

$userId = isset($_GET['userId']) && $_GET['userId'] !== '' ? (int)$_GET['userId'] : null;

$exclude = isset($_GET['exclude']) ? (int)$_GET['exclude'] : 0;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
if ($limit <= 0) $limit = 10;
if ($limit > 48) $limit = 48;

function cleanString($str) {
    $bom = pack('H*', 'EFBBBF');
    $str = preg_replace("/^$bom/", '', $str);
    $str = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $str);
    return trim($str);
}

function cleanImageUrl($url) {
    if (empty($url) || !is_string($url)) return null;
    $url = preg_replace('/[?&]token=[^&]*/', '', $url);
    $url = preg_replace('/[?&]t=[^&]*/', '', $url);
    $url = rtrim($url, '?&');
    return $url;
}

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

function formatProduct($product) {
    $images = extractImages($product['image_url'] ?? '');
    $stock = isset($product['stock']) ? (int)$product['stock'] : 0;

    // Делаем ответ совместимым с ProductCard (camelCase) и остальным API
    return [
        'id' => (int)$product['id'],
        'name' => $product['name'] ?? '',
        'price' => isset($product['price']) ? (float)$product['price'] : 0,
        'oldPrice' => isset($product['old_price']) && $product['old_price'] !== null ? (float)$product['old_price'] : null,
        'old_price' => isset($product['old_price']) && $product['old_price'] !== null ? (float)$product['old_price'] : null,
        'discount' => isset($product['discount']) ? (int)$product['discount'] : 0,
        'rating' => isset($product['rating']) ? (float)$product['rating'] : 0,
        'reviewsCount' => isset($product['reviews_count']) ? (int)$product['reviews_count'] : 0,
        'reviews_count' => isset($product['reviews_count']) ? (int)$product['reviews_count'] : 0,
        'stock' => $stock,
        'inStock' => $stock > 0,
        'category_slug' => $product['category_slug'] ?? null,
        'brand' => $product['brand'] ?? '',
        'image_url' => $images[0] ?? '/images/placeholder.jpg',
        'images' => $images,
    ];
}

function getPopularProducts($db, $excludeId, $limit, $excludeIds = []) {
    $stmt = $db->prepare("
        SELECT product_id, COUNT(*) as cnt
        FROM user_actions
        WHERE action_type='view'
          AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY product_id
        ORDER BY cnt DESC
        LIMIT 200
    ");
    $stmt->execute();
    $popularIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $excludeSet = [];
    if ($excludeId > 0) $excludeSet[(int)$excludeId] = true;
    foreach ($excludeIds as $id) $excludeSet[(int)$id] = true;

    $filtered = [];
    foreach ($popularIds as $id) {
        $iid = (int)$id;
        if (!isset($excludeSet[$iid])) $filtered[] = $iid;
        if (count($filtered) >= $limit) break;
    }

    if (empty($filtered)) return [];

    $placeholders = implode(',', array_fill(0, count($filtered), '?'));
    $sql = "SELECT * FROM products WHERE id IN ($placeholders)";
    $stmt = $db->prepare($sql);
    $stmt->execute($filtered);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Важно сохранить порядок как в $filtered
    $byId = [];
    foreach ($rows as $row) $byId[(int)$row['id']] = $row;
    $ordered = [];
    foreach ($filtered as $id) {
        if (isset($byId[$id])) $ordered[] = formatProduct($byId[$id]);
    }
    return $ordered;
}

try {
    // Если пользователь не передан — отдаём "популярное" (холодный старт/гости)
    if (!$userId) {
        $products = getPopularProducts($db, $exclude, $limit);
        echo json_encode(['success' => true, 'items' => $products], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // 1. Получаем все товары, с которыми взаимодействовал текущий пользователь
    $stmt = $db->prepare("SELECT DISTINCT product_id FROM user_actions WHERE user_id = ?");
    $stmt->execute([$userId]);
    $myProducts = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($myProducts)) {
        // Холодный старт: популярные товары за последние 30 дней
        $stmt = $db->prepare("SELECT product_id, COUNT(*) as cnt FROM user_actions WHERE action_type='view' AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY product_id ORDER BY cnt DESC LIMIT 10");
        $stmt->execute();
        $popularIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if ($exclude > 0) {
            $popularIds = array_values(array_filter($popularIds, fn($id) => (int)$id !== $exclude));
        }
        if (empty($popularIds)) {
            echo json_encode(['success' => true, 'items' => []]);
            exit;
        }
        $popularIds = array_slice($popularIds, 0, $limit);
        $placeholders = implode(',', array_fill(0, count($popularIds), '?'));
        $sql = "SELECT * FROM products WHERE id IN ($placeholders)";
        $stmt = $db->prepare($sql);
        $stmt->execute($popularIds);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $products = array_map('formatProduct', $rows);
        echo json_encode(['success' => true, 'items' => $products], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // 2. Находим похожих пользователей (с общими товарами)
    $placeholders = implode(',', array_fill(0, count($myProducts), '?'));
    $sql = "SELECT user_id, product_id, action_weight 
            FROM user_actions 
            WHERE user_id != ? AND product_id IN ($placeholders)";
    $params = array_merge([$userId], $myProducts);
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $similarUsersData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Группируем по пользователям и считаем вес схожести (сумма весов общих действий)
    $userSimilarity = [];
    $userProducts = [];
    foreach ($similarUsersData as $row) {
        $uid = $row['user_id'];
        $pid = $row['product_id'];
        $weight = $row['action_weight'];
        $userSimilarity[$uid] = ($userSimilarity[$uid] ?? 0) + $weight;
        $userProducts[$uid][] = $pid;
    }

    // 3. Собираем кандидатов товаров от похожих пользователей
    $candidates = [];
    foreach ($userSimilarity as $uid => $simWeight) {
        // Получаем веса всех товаров этого пользователя
        $stmt = $db->prepare("SELECT product_id, action_weight FROM user_actions WHERE user_id = ?");
        $stmt->execute([$uid]);
        $actions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($actions as $act) {
            $pid = $act['product_id'];
            if (!in_array($pid, $myProducts) && (int)$pid !== $exclude) {
                $candidates[$pid] = ($candidates[$pid] ?? 0) + $act['action_weight'] * $simWeight;
            }
        }
    }

    arsort($candidates);
    $recommendedIds = array_slice(array_keys($candidates), 0, $limit);

    if (empty($recommendedIds)) {
        echo json_encode(['success' => true, 'items' => []]);
        exit;
    }

    $placeholders = implode(',', array_fill(0, count($recommendedIds), '?'));
    $sql = "SELECT * FROM products WHERE id IN ($placeholders)";
    $stmt = $db->prepare($sql);
    $stmt->execute($recommendedIds);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $products = array_map('formatProduct', $rows);

    // Если персонализации недостаточно — добиваем популярными
    $have = count($products);
    if ($have < $limit) {
        $alreadyIds = array_map(fn($p) => (int)($p['id'] ?? 0), $products);
        $need = $limit - $have;
        $popular = getPopularProducts($db, $exclude, $need, $alreadyIds);
        $products = array_merge($products, $popular);
    }

    echo json_encode(['success' => true, 'items' => $products], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}