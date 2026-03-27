<?php
// orders_user.php - Обрабатывает GET-запросы для получения заказов пользователя

// Устанавливаем заголовки
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка OPTIONS-запроса (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверяем, что это GET-запрос
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен.'], JSON_UNESCAPED_UNICODE);
    exit();
}

// 1. Подключение к БД
// Убедитесь, что 'config/database.php' доступен
require_once 'config/database.php'; 
$db = (new Database())->getConnection();

// 2. Получение userId
// Фронтенд передает userId как Query Parameter (см лог: ?userId=...)
$userId = $_GET['userId'] ?? null; 

// Проверка на наличие userId
if (empty($userId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Неверный запрос или отсутствует ID пользователя.'], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // 3. Запрос для получения всех заказов пользователя
    $query = "
        SELECT 
            id, order_number, total_amount, status, shipping_address, created_at
        FROM 
            orders 
        WHERE 
            user_id = ? 
        ORDER BY 
            created_at DESC
    ";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    $userOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $responseOrders = [];

// 4. Получение товаров для каждого заказа
foreach ($userOrders as $order) {
    $orderId = $order['id'];
    
    $itemsQuery = "
        SELECT 
            product_id, product_name, quantity, price 
        FROM 
            order_items 
        WHERE 
            order_id = ?
    ";
    $itemsStmt = $db->prepare($itemsQuery);
    $itemsStmt->execute([$orderId]);
    $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Декодирование адреса, который был сохранен как JSON
    $shippingAddress = json_decode($order['shipping_address'], true) ?? null;

    // ВНИМАНИЕ: ВСЕ ПОЛЯ, ИДУЩИЕ ИЗ БАЗЫ, ИСПОЛЬЗУЮТСЯ В SNAKE_CASE
    $responseOrders[] = [
        'id' => $order['id'],
        'order_number' => $order['order_number'],         // snake_case
        'total_amount' => (float)$order['total_amount'],   // snake_case
        'status' => $order['status'],
        'shipping_address' => $shippingAddress,            // snake_case
        'created_at' => $order['created_at'],              // snake_case
        'items' => $orderItems
    ];
}

// 5. Успешный ответ
http_response_code(200);
echo json_encode(['success' => true, 'data' => $responseOrders], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log("Database Error fetching user orders for {$userId}: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных при получении заказов.'], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Неизвестная ошибка: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>