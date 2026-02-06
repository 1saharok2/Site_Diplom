<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../utils/auth.php';

$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$orderId = $data['order_id'] ?? null;

if (!$orderId) {
    http_response_code(400);
    echo json_encode(["message" => "Order ID required"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Сначала удаляем связанные товары из order_items (если есть внешние ключи без cascade)
    $queryItems = "DELETE FROM order_items WHERE order_id = :id";
    $stmtItems = $db->prepare($queryItems);
    $stmtItems->bindParam(':id', $orderId);
    $stmtItems->execute();

    // Затем удаляем сам заказ
    $queryOrder = "DELETE FROM orders WHERE id = :id";
    $stmtOrder = $db->prepare($queryOrder);
    $stmtOrder->bindParam(':id', $orderId);

    if ($stmtOrder->execute()) {
        echo json_encode(["success" => true, "message" => "Заказ удален"]);
    } else {
        throw new Exception("Ошибка при удалении");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => $e->getMessage()]);
}