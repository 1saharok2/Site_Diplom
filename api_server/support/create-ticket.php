<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Нет данных в запросе');
    }
    
    // Проверка обязательных полей
    $required = ['name', 'email', 'subject', 'message'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Поле '$field' обязательно для заполнения");
        }
    }
    
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Некорректный email адрес');
    }
    
    // Пытаемся получить user_id из токена
    $userId = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            
            // Проверяем токен в вашей таблице users
            $query = "SELECT id FROM users WHERE token = :token";
            $stmt = $db->prepare($query);
            $stmt->execute([':token' => $token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                $userId = $user['id'];
            }
        }
    }
    
    // Генерируем номер обращения
    $ticketNumber = 'TICKET-' . date('ym') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    // Проверяем уникальность номера
    $checkQuery = "SELECT COUNT(*) as count FROM support_tickets WHERE ticket_number = :ticket_number";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([':ticket_number' => $ticketNumber]);
    $check = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    while ($check['count'] > 0) {
        $ticketNumber = 'TICKET-' . date('ym') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $checkStmt->execute([':ticket_number' => $ticketNumber]);
        $check = $checkStmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Вставляем обращение
    $query = "INSERT INTO support_tickets 
              (user_id, name, email, phone, subject, message, status, priority, ticket_number, created_at) 
              VALUES 
              (:user_id, :name, :email, :phone, :subject, :message, 'new', 'medium', :ticket_number, NOW())";
    
    $stmt = $db->prepare($query);
    
    $success = $stmt->execute([
        ':user_id' => $userId,
        ':name' => htmlspecialchars(strip_tags($data['name'])),
        ':email' => htmlspecialchars(strip_tags($data['email'])),
        ':phone' => isset($data['phone']) ? htmlspecialchars(strip_tags($data['phone'])) : '',
        ':subject' => htmlspecialchars(strip_tags($data['subject'])),
        ':message' => htmlspecialchars(strip_tags($data['message'])),
        ':ticket_number' => $ticketNumber
    ]);
    
    if ($success) {
        $ticketId = $db->lastInsertId();
        
        // Получаем созданное обращение для ответа
        $getQuery = "SELECT * FROM support_tickets WHERE id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->execute([':id' => $ticketId]);
        $ticket = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Обращение успешно создано',
            'ticket_id' => $ticketId,
            'ticket_number' => $ticketNumber,
            'data' => $ticket
        ]);
    } else {
        throw new Exception('Ошибка при создании обращения');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>