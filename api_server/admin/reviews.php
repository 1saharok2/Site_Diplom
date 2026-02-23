<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
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
        switch ($action) {
            case 'pending':
                // Получаем отзывы на модерации
                $query = "SELECT r.*, u.email as user_email, p.name as product_name 
                         FROM reviews r 
                         LEFT JOIN users u ON r.user_id = u.id 
                         LEFT JOIN products p ON r.product_id = p.id 
                         WHERE r.status = 'pending' 
                         ORDER BY r.created_at DESC";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                ob_clean();
                echo json_encode($reviews);
                break;
                
            case 'stats':
                // Статистика отзывов
                $stats = [];
                
                // Общее количество отзывов
                $query = "SELECT COUNT(*) as count FROM reviews";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $stats['total'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                // Отзывы на модерации
                $query = "SELECT COUNT(*) as count FROM reviews WHERE status = 'pending'";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $stats['pending'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                // Одобренные отзывы
                $query = "SELECT COUNT(*) as count FROM reviews WHERE status = 'approved'";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $stats['approved'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                // Отклоненные отзывы
                $query = "SELECT COUNT(*) as count FROM reviews WHERE status = 'rejected'";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $stats['rejected'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                ob_clean();
                echo json_encode($stats);
                break;
                
            default:
                // Получаем все отзывы
                $query = "SELECT r.*, u.email as user_email, p.name as product_name 
                         FROM reviews r 
                         LEFT JOIN users u ON r.user_id = u.id 
                         LEFT JOIN products p ON r.product_id = p.id 
                         ORDER BY r.created_at DESC";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                ob_clean();
                echo json_encode($reviews);
                break;
        }
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