<?php
error_reporting(E_ALL);
ini_set('display_errors', 1); // Включаем для отладки, чтобы увидеть ошибку в Preview

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

try {
    require_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);
    
    // Генерируем UUID
    $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $email = $data['email'] ?? '';
    $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
    
    // Обработка имени
    $fullName = trim($data['firstName'] ?? '');
    $parts = explode(' ', $fullName, 2);
    $firstName = $parts[0] ?? 'User';
    $lastName = $parts[1] ?? '';
    
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    $token = bin2hex(random_bytes(32));

    // Явно перечисляем ВСЕ колонки из вашего скриншота
    $sql = "INSERT INTO users (
                id, email, password_hash, first_name, last_name, 
                phone, role, is_active, token, address, avatar_url
            ) VALUES (
                :id, :email, :pw, :fn, :ln, 
                :ph, 'customer', 1, :tk, :adr, ''
            )";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':id' => $id,
        ':email' => $email,
        ':pw' => $password,
        ':fn' => $firstName,
        ':ln' => $lastName,
        ':ph' => $phone,
        ':tk' => $token,
        ':adr' => $address
    ]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $id,
            'email' => $email,
            'name' => trim($firstName . ' ' . $lastName),
            'firstName' => $firstName,
            'lastName' => $lastName,
            'phone' => $phone
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => $e->getMessage()]);
}