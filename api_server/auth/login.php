<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET') {
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = file_get_contents("php://input");
            $data = json_decode($input);
        } else {
            // Для GET запроса - тестовые данные
            $data = (object)[
                'email' => 'admin@mail.com',
                'password' => 'admin123'
            ];
        }
        
        if ($data === null) {
            throw new Exception('Некорректный JSON');
        }
        
        if (!isset($data->email) || !isset($data->password)) {
            throw new Exception('Отсутствуют email или пароль');
        }
        
        // Простой поиск пользователя
        $query = "SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ? LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->email]);
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($data->password, $row['password_hash'])) {
                $token = bin2hex(random_bytes(32)); 
                
                // ВАЖНО: Сохраняем токен в базу данных!
                $updateQuery = "UPDATE users SET token = ? WHERE id = ?";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([$token, $row['id']]);
                
                ob_clean();
                echo json_encode([
                    'message' => 'Login successful',
                    'token' => $token, // Теперь этот токен есть и в БД, и у клиента
                    'user' => [
                        'id' => $row['id'],
                        'email' => $row['email'],
                        'firstName' => $row['first_name'],
                        'lastName' => $row['last_name'],
                        'role' => $row['role']
                    ]
                ]);
            } else {
                throw new Exception('Неверный пароль');
            }
        } else {
            throw new Exception('Пользователь не найден');
        }
    } else {
        throw new Exception('Метод не разрешен: ' . $_SERVER['REQUEST_METHOD']);
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