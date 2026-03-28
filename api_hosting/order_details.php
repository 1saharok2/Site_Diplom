<?php
// order_details.php - Получение деталей заказа по ID
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен.'], JSON_UNESCAPED_UNICODE);
    exit();
}

require_once 'config/database.php';
require_once __DIR__ . '/utils/shipping_address.php';
$db = (new Database())->getConnection();

// Получаем и очищаем параметр id
$orderId = isset($_GET['id']) ? trim($_GET['id']) : '';

// Проверка: параметр не пустой и состоит только из цифр
if ($orderId === '' || !ctype_digit($orderId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Неверный или отсутствующий ID заказа.'], JSON_UNESCAPED_UNICODE);
    exit();
}

$orderId = (int)$orderId;

try {
    // Получаем информацию о заказе
    $orderQuery = "
        SELECT 
            id, order_number, total_amount, status, 
            customer_name, customer_phone, customer_email,
            shipping_address, payment_method, created_at, user_id
        FROM orders 
        WHERE id = ?
    ";
    $orderStmt = $db->prepare($orderQuery);
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Заказ не найден.'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Получаем товары заказа
    $itemsQuery = "
        SELECT 
            product_id, product_name, quantity, price 
        FROM order_items 
        WHERE order_id = ?
    ";
    $itemsStmt = $db->prepare($itemsQuery);
    $itemsStmt->execute([$orderId]);
    $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    $shippingAddress = normalize_shipping_address_for_api($order['shipping_address']);
    
    $response = [
        'id' => (int)$order['id'],
        'order_number' => $order['order_number'],
        'total_amount' => (float)$order['total_amount'],
        'status' => $order['status'],
        'customer_name' => $order['customer_name'],
        'customer_phone' => $order['customer_phone'],
        'customer_email' => $order['customer_email'],
        'shipping_address' => $shippingAddress,
        'payment_method' => $order['payment_method'],
        'created_at' => $order['created_at'],
        'user_id' => $order['user_id'],
        'items' => $orderItems
    ];

    echo json_encode(['success' => true, 'data' => $response], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log("Database Error fetching order {$orderId}: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных.'], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Неизвестная ошибка: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>