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
    include_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    $action = $_GET['action'] ?? '';
    
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
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input);
        
        if ($data && isset($data->reviewId) && isset($data->action)) {
            $reviewId = $data->reviewId;
            $action = $data->action;
            
            if ($action === 'approve') {
                $query = "UPDATE reviews SET status = 'approved' WHERE id = ?";
            } elseif ($action === 'reject') {
                $query = "UPDATE reviews SET status = 'rejected' WHERE id = ?";
            } else {
                throw new Exception('Invalid action');
            }
            
            $stmt = $db->prepare($query);
            $stmt->execute([$reviewId]);
            
            ob_clean();
            echo json_encode(['message' => 'Review updated successfully']);
        }
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