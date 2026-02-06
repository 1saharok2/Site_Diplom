<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

if (!$authHeader) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Доступ запрещен. Токен отсутствует."]);
    exit();
}

$tks = explode(" ", $authHeader);
$token = $tks[1] ?? null;

try {
    $query = "SELECT id, email, first_name, last_name, phone, address, created_at, role 
              FROM users 
              WHERE token = :token 
              LIMIT 0,1";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $user_data = [
            "id" => $row['id'],
            "email" => $row['email'],
            "first_name" => $row['first_name'],
            "last_name" => $row['last_name'],
            "phone" => $row['phone'],
            "address" => $row['address'],
            "created_at" => $row['created_at'],
            "role" => $row['role']
        ];

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "user" => $user_data
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Пользователь не найден или токен недействителен."]);
    }

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        "success" => false, 
        "message" => "Ошибка авторизации",
        "error" => $e->getMessage()
    ]);
}
?>