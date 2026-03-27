<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Проверка авторизации
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        throw new Exception('Требуется авторизация');
    }
    
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    
    $query = "SELECT id, role FROM users WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'admin') {
        throw new Exception('Доступ запрещен');
    }
    
    // Получаем статистику
    $statsQuery = "SELECT 
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
                    SUM(CASE WHEN priority = 'urgent' AND status IN ('new', 'in_progress') THEN 1 ELSE 0 END) as urgent_count,
                    COUNT(*) as total_count
                   FROM support_tickets";
    
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'new' => (int)$stats['new_count'],
        'urgent' => (int)$stats['urgent_count'],
        'total' => (int)$stats['total_count']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'new' => 0,
        'urgent' => 0,
        'total' => 0
    ]);
}
?>