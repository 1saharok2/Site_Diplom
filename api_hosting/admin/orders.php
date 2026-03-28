<?php
/**
 * Admin Orders API
 * GET /api/admin/orders
 * GET /api/admin/orders/{id}
 */

require_once __DIR__ . '/_guard.php'; // 🔐 Проверка токена и роли admin
require_once __DIR__ . '/../utils/shipping_address.php';

$db = (new Database())->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

/**
 * Пытаемся получить ID заказа из URL
 * Примеры:
 * /api/admin/orders
 * /api/admin/orders/12
 */
$path = parse_url($requestUri, PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));

$orderId = null;
$ordersIndex = array_search('orders', $parts);
if ($ordersIndex !== false && isset($parts[$ordersIndex + 1]) && is_numeric($parts[$ordersIndex + 1])) {
    $orderId = (int)$parts[$ordersIndex + 1];
}

try {
    if ($method === 'GET') {

        // =========================
        // GET ONE ORDER
        // =========================
        if ($orderId) {
            $stmt = $db->prepare("
                SELECT 
                    o.*,
                    u.email AS user_email,
                    CONCAT(u.first_name, ' ', u.last_name) AS customer_name
                FROM orders o
                LEFT JOIN users u ON u.id = o.user_id
                WHERE o.id = ?
                LIMIT 1
            ");
            $stmt->execute([$orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(['message' => 'Заказ не найден']);
                exit;
            }

            // Товары заказа
            $itemsStmt = $db->prepare("
                SELECT product_id, product_name, quantity, price
                FROM order_items
                WHERE order_id = ?
            ");
            $itemsStmt->execute([$orderId]);

            $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
            $order['shipping_address'] = normalize_shipping_address_for_api($order['shipping_address']);

            echo json_encode([
                'success' => true,
                'data' => $order
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // =========================
        // GET ALL ORDERS
        // =========================
        $stmt = $db->query("
            SELECT 
                o.*,
                u.email AS user_email,
                CONCAT(u.first_name, ' ', u.last_name) AS customer_name
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
        ");

        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Подгружаем товары для каждого заказа
        $itemsStmt = $db->prepare("
            SELECT product_id, product_name, quantity, price
            FROM order_items
            WHERE order_id = ?
        ");

        foreach ($orders as &$order) {
            $itemsStmt->execute([$order['id']]);
            $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
            $order['shipping_address'] = normalize_shipping_address_for_api($order['shipping_address']);
        }

        echo json_encode([
            'success' => true,
            'data' => $orders
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // =========================
    // METHOD NOT ALLOWED
    // =========================
    http_response_code(405);
    echo json_encode(['message' => 'Метод не поддерживается']);

} catch (Throwable $e) {
    error_log('ADMIN ORDERS ERROR: ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'message' => 'Ошибка сервера',
        'error' => $e->getMessage()
    ]);
}
