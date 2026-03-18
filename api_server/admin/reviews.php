<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ob_start();

try {
    require_once __DIR__ . '/_guard.php';
    include_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    $action = $_GET['action'] ?? '';
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($action === 'stats') {
            $stats = ['total' => 0, 'pending' => 0, 'approved' => 0, 'rejected' => 0];
            $query = "SELECT status, COUNT(*) as count FROM reviews GROUP BY status";
            $stmt = $db->prepare($query);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $stats[$row['status']] = (int)$row['count'];
                $stats['total'] += (int)$row['count'];
            }
            ob_clean();
            echo json_encode($stats);
            exit;
        }

        // Базовая часть запроса
        $baseQuery = "SELECT 
            r.id,
            r.rating,
            r.comment,
            r.status,
            r.created_at,
            r.rejection_reason,
            u.id as user_id,
            u.email as user_email,
            CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as user_name,
            p.id as product_id,
            p.name as product_name,
            p.image_url as product_image
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id";

        // Добавляем WHERE в зависимости от action
        if ($action === 'pending') {
            $query = $baseQuery . " WHERE r.status = 'pending'";
        } elseif ($action === 'approved') {
            $query = $baseQuery . " WHERE r.status = 'approved'";
        } elseif ($action === 'rejected') {
            $query = $baseQuery . " WHERE r.status = 'rejected'";
        } else {
            $query = $baseQuery;
        }

        $query .= " ORDER BY r.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Преобразуем в формат с вложенными объектами
        $reviews = [];
        foreach ($rows as $row) {
            $userName = trim($row['user_name']);
            if (empty($userName)) {
                $userName = $row['user_email'] ?? 'Аноним';
            }

            $reviews[] = [
                'id' => $row['id'],
                'rating' => (int)$row['rating'],
                'comment' => $row['comment'],
                'status' => $row['status'],
                'rejection_reason' => $row['rejection_reason'],
                'created_at' => $row['created_at'],
                'user' => [
                    'id' => $row['user_id'],
                    'name' => $userName,
                    'email' => $row['user_email'],
                    'avatar' => null 
                ],
                'product' => [
                    'id' => $row['product_id'],
                    'name' => $row['product_name'],
                    'image' => $row['product_image']
                ]
            ];
        }

        ob_clean();
        echo json_encode($reviews, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        if ($id <= 0) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['message' => 'Review id is required']);
            exit();
        }

        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) $data = [];

        if ($action === 'approve') {
            $stmt = $db->prepare("UPDATE reviews SET status = 'approved' WHERE id = ?");
            $stmt->execute([$id]);
            ob_clean();
            echo json_encode(['message' => 'Review approved', 'id' => $id]);
            exit();
        }

        if ($action === 'reject') {
            $reason = trim((string)($data['rejection_reason'] ?? 'Отклонено модератором'));

            // Пытаемся сохранить причину, если колонка есть
            try {
                $stmt = $db->prepare("UPDATE reviews SET status = 'rejected', rejection_reason = ? WHERE id = ?");
                $stmt->execute([$reason, $id]);
            } catch (Throwable $e) {
                $stmt = $db->prepare("UPDATE reviews SET status = 'rejected' WHERE id = ?");
                $stmt->execute([$id]);
            }

            ob_clean();
            echo json_encode(['message' => 'Review rejected', 'id' => $id]);
            exit();
        }

        http_response_code(400);
        ob_clean();
        echo json_encode(['message' => 'Invalid action']);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if ($id <= 0) {
            http_response_code(400);
            ob_clean();
            echo json_encode(['message' => 'Review id is required']);
            exit();
        }

        $stmt = $db->prepare("DELETE FROM reviews WHERE id = ?");
        $stmt->execute([$id]);

        ob_clean();
        echo json_encode(['message' => 'Review deleted', 'id' => $id]);
        exit();
    }
    
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'message' => 'Ошибка: ' . $e->getMessage(),
        'error' => true
    ]);
}

ob_end_flush();
?>