<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'CORS preflight OK']);
    exit;
}

$BASE_URL = 'https://electronic.tw1.ru';
$DEFAULT_IMAGE = $BASE_URL . '/images/placeholder.jpg';

function get_first_image_from_field($field, $baseUrl, $default) {
    if (empty($field)) return $default;

    $s = trim($field);
    if ($s !== '' && ($s[0] === '[' || $s[0] === '"' || $s[0] === '{')) {
        $decoded = @json_decode($s, true);
        if (json_last_error() === JSON_ERROR_NONE && !empty($decoded)) {
            if (is_array($decoded)) {
                foreach ($decoded as $v) {
                    if (is_string($v) && trim($v) !== '') {
                        $first = $v;
                        break;
                    }
                }
                if (!isset($first)) return $default;
            } elseif (is_string($decoded) && trim($decoded) !== '') {
                $first = $decoded;
            } else {
                return $default;
            }
        } else {
            $first = $s;
        }
    } else {
        $first = $s;
    }

    $first = trim($first);
    if (preg_match('#^https?://#i', $first)) return $first;
    if (strpos($first, '/images/') === 0) return rtrim($baseUrl, '/') . $first;
    if (strpos($first, 'images/') === 0) return rtrim($baseUrl, '/') . '/' . ltrim($first, '/');
    return rtrim($baseUrl, '/') . '/images/' . ltrim($first, '/');
}

try {
    include_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    // ===== GET: список избранного =====
    if ($method === 'GET') {
        $userId = $_GET['userId'] ?? 0;
        
        // Для GET запросов всегда возвращаем успех, даже если userId = 0
        if ($userId <= 0) {
            echo json_encode([
                'success' => true,
                'items' => [],
                'count' => 0,
                'message' => 'Избранное пусто'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $query = "SELECT 
                    w.id AS wishlist_id,
                    w.user_id,
                    w.product_id,
                    w.created_at,
                    p.id AS pid,
                    p.name AS product_name,
                    p.price,
                    p.image_url,
                    p.description,
                    p.category_slug
                  FROM user_wishlist w
                  LEFT JOIN products p ON w.product_id = p.id
                  WHERE w.user_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $result = [];
        foreach ($wishlist as $item) {
            $imageUrl = get_first_image_from_field($item['image_url'] ?? '', $GLOBALS['BASE_URL'], $GLOBALS['DEFAULT_IMAGE']);

            $result[] = [
                'id' => (int)$item['wishlist_id'],
                'user_id' => $item['user_id'],
                'product_id' => (int)$item['product_id'],
                'products' => [
                    'id' => (int)$item['pid'],
                    'name' => $item['product_name'] ?? 'Без названия',
                    'price' => (float)$item['price'],
                    'image_url' => $imageUrl,
                    'description' => $item['description'] ?? '',
                    'category_slug' => $item['category_slug'] ?? null
                ],
                'created_at' => $item['created_at']
            ];
        }

        echo json_encode([
            'success' => true,
            'items' => $result,
            'count' => count($result)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ===== POST: toggle =====
    if ($method === 'POST') {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
            exit;
        }

        $userId = $data['user_id'] ?? $data['userId'] ?? 0;
        $productId = $data['product_id'] ?? $data['productId'] ?? null;

        // Для неавторизованных пользователей возвращаем ошибку
        if ($userId <= 0) {
            http_response_code(401);
            echo json_encode([
                'success' => false, 
                'message' => 'Требуется авторизация для работы с избранным'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!$productId) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Product ID required'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $check = $db->prepare("SELECT id FROM user_wishlist WHERE user_id=? AND product_id=?");
        $check->execute([$userId, $productId]);
        $exists = $check->fetchColumn();

        if ($exists) {
            $del = $db->prepare("DELETE FROM user_wishlist WHERE user_id=? AND product_id=?");
            $del->execute([$userId, $productId]);
            echo json_encode([
                'success' => true,
                'action' => 'removed',
                'message' => 'Товар удалён из избранного'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        } else {
            $ins = $db->prepare("INSERT INTO user_wishlist (user_id, product_id) VALUES (?, ?)");
            $ins->execute([$userId, $productId]);
            echo json_encode([
                'success' => true,
                'action' => 'added',
                'message' => 'Товар добавлен в избранное'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // ===== DELETE by wishlist id =====
    if ($method === 'DELETE') {
        $uri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
        $wishlistId = end($uri);
        
        if (!is_numeric($wishlistId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid wishlist ID']);
            exit;
        }
        
        $del = $db->prepare("DELETE FROM user_wishlist WHERE id = ?");
        $del->execute([$wishlistId]);
        
        echo json_encode([
            'success' => true,
            'action' => 'removed',
            'message' => 'Товар удалён из избранного'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);

} catch (Exception $e) {
    error_log("Wishlist error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>