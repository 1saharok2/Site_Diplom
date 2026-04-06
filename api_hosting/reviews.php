<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
ob_start();
function getBearerToken(): ?string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    if (!$authHeader) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    }
    if (!$authHeader) return null;
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    return null;
}
try {
    require_once __DIR__ . '/config/database.php';
    $db = (new Database())->getConnection();
    // GET  /reviews/product/{id} -> reviews.php?product_id={id}
    // GET  /reviews/user/{id}    -> reviews.php?userId={id}
    // POST /reviews              -> reviews.php
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // 1) Product reviews: only approved
        $productId = null;
        if (isset($_GET['product_id'])) {
            $productId = (int)$_GET['product_id'];
        } elseif (isset($_GET['id'])) {
            // Поддержка старого формата запроса: reviews.php?id=...
            $productId = (int)$_GET['id'];
        }
        if (!empty($productId)) {
            if ($productId <= 0) {
                ob_clean();
                echo json_encode([], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $query = "
                SELECT 
                    r.*,
                    u.email AS user_email,
                    u.first_name,
                    u.last_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.product_id = ?
                  AND r.status = 'approved'
                ORDER BY r.created_at DESC
            ";
            $stmt = $db->prepare($query);
            $stmt->execute([$productId]);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            ob_clean();
            echo json_encode($reviews, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
        // 2) User reviews
        // Поддерживаем оба параметра: `userId` (роутинг) и `user_id` (старая версия/совместимость)
        $userId = '';
        if (isset($_GET['userId'])) {
            $userId = (string)$_GET['userId'];
        } elseif (isset($_GET['user_id'])) {
            $userId = (string)$_GET['user_id'];
        }
        $userId = trim($userId);
        if (empty($userId)) {
            ob_clean();
            echo json_encode([
                'success' => true,
                'reviews' => [],
                'count' => 0,
                'message' => 'Отзывы не найдены'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        // Для страницы "Мои отзывы" добавляем данные товара.
        // image_url может быть JSON-массивом или строкой, поэтому парсим его в PHP.
        $query = "
            SELECT
                r.*,
                p.name AS product_name,
                p.image_url AS product_image_raw
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        ";
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        foreach ($reviews as &$review) {
            $rawImage = $review['product_image_raw'] ?? null;
            $firstImage = '';

            if (is_string($rawImage) && $rawImage !== '') {
                $decoded = json_decode($rawImage, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded) && !empty($decoded)) {
                    $firstImage = (string)$decoded[0];
                } else {
                    // fallback, если в БД хранится одиночная строка URL
                    $firstImage = trim($rawImage, "\"' ");
                }
            }

            $review['product_image'] = $firstImage;
            unset($review['product_image_raw']);
        }
        unset($review);
        ob_clean();
        echo json_encode([
            'success' => true,
            'reviews' => $reviews,
            'count' => count($reviews)
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create review: force pending. Must be authenticated.
        $token = getBearerToken();
        if (!$token) {
            http_response_code(401);
            ob_clean();
            echo json_encode(['message' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $stmt = $db->prepare("SELECT id, first_name, last_name, email FROM users WHERE token = ? LIMIT 1");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            http_response_code(401);
            ob_clean();
            echo json_encode(['message' => 'Invalid token'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['message' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $productId = isset($data['product_id']) ? (int)$data['product_id'] : 0;
        $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
        $comment = isset($data['comment']) ? trim((string)$data['comment']) : '';
        if ($productId <= 0) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['message' => 'product_id is required'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['message' => 'rating must be between 1 and 5'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        if ($comment === '' || mb_strlen($comment) < 3) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['message' => 'comment is required'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        // Вставка отзыва (исправлено: user_id не приводится к int)
        $status = 'pending';
        $stmt = $db->prepare("INSERT INTO reviews (user_id, product_id, rating, comment, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$user['id'], $productId, $rating, $comment, $status]);
        $newId = (int)$db->lastInsertId();
        ob_clean();
        echo json_encode([
            'id' => $newId,
            'user_id' => $user['id'],        // строка, не число
            'product_id' => $productId,
            'rating' => $rating,
            'comment' => $comment,
            'status' => $status,
            'created_at' => date('Y-m-d H:i:s'),
            'user_email' => $user['email'] ?? null,
            'first_name' => $user['first_name'] ?? null,
            'last_name' => $user['last_name'] ?? null
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    http_response_code(405);
    ob_clean();
    echo json_encode(['message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'message' => 'Ошибка: ' . $e->getMessage(),
        'error' => true
    ], JSON_UNESCAPED_UNICODE);
} finally {
    ob_end_flush();
}
?>