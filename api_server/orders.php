<?php
// orders.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php'; 
$db = (new Database())->getConnection();

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Данные не получены'], JSON_UNESCAPED_UNICODE);
    exit();
}

// 1. Подготовка данных из запроса
$orderNumber = 'ORDER-' . time() . '-' . rand(100, 999);
$userId = $data['userId'] ?? null;
$fName = $data['first_name'] ?? 'Пусто';
$lName = $data['last_name'] ?? 'Пусто';
$customerName = trim($fName . ' ' . $lName);
$customerPhone = $data['phone'] ?? 'Нет телефона';
$customerEmail = $data['email'] ?? 'Не указан';
$city = $data['city'] ?? '';
$address = $data['address'] ?? '';
$shippingAddress = trim($address . ($city ? ', ' . $city : '')); // Объединяем адрес и город
$totalAmountFromFront = (float)($data['total_amount'] ?? 0);
$paymentMethod = $data['payment_method'] ?? 'card';
$items = $data['items'] ?? []; // Получаем товары из запроса

$db->beginTransaction();

try {
    $calculatedTotal = 0;
    $validatedItems = [];
    
    // 2. Валидация товаров и расчет суммы
    foreach ($items as $item) {
        $productId = $item['product_id'] ?? 0;
        $quantity = $item['quantity'] ?? 1;

        if ((int)$productId <= 0) continue;

        $productQuery = "SELECT name, price FROM products WHERE id = ?";
        $productStmt = $db->prepare($productQuery);
        $productStmt->execute([$productId]);
        $product = $productStmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            $price = (float)$product['price'];
            $calculatedTotal += $price * $quantity;
            $validatedItems[] = [
                'id' => $productId,
                'name' => $product['name'],
                'quantity' => $quantity,
                'price' => $price
            ];
        }
    }

    // Используем расчетную сумму, если она > 0, иначе ту, что пришла с фронта
    $finalTotal = $calculatedTotal > 0 ? $calculatedTotal : $totalAmountFromFront;

    // 3. Вставка в таблицу orders (каждое поле в свою колонку)
    $stmt = $db->prepare("
        INSERT INTO orders (
            order_number, 
            customer_name, 
            customer_phone, 
            customer_email, 
            shipping_address, 
            total_amount, 
            payment_method, 
            status, 
            user_id, 
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
    ");
    
    $stmt->execute([
        $orderNumber,      
        $customerName,     
        $customerPhone,    
        $customerEmail,    
        $shippingAddress,  
        $finalTotal,       
        $paymentMethod,    
        $userId            
    ]);
    
    $orderId = $db->lastInsertId();

    // 4. Вставка товаров в order_items
    if (!empty($validatedItems)) {
        $stmt_item = $db->prepare("
            INSERT INTO order_items (order_id, product_id, product_name, quantity, price, name) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($validatedItems as $item) {
            $stmt_item->execute([
                $orderId, 
                $item['id'], 
                $item['name'], // product_name
                $item['quantity'], 
                $item['price'],
                $item['name']  // name (дублируем для совместимости)
            ]);
        }
    }

    // 5. Очистка корзины
    $db->prepare("DELETE FROM user_cart WHERE user_id = ?")->execute([$userId]);

    $db->commit();
    
    echo json_encode([
        'success' => true,
        'orderId' => (int)$orderId,
        'orderNumber' => $orderNumber,
        'order_number' => $orderNumber, 
        'message' => 'Заказ успешно создан',
        'total_amount' => $finalTotal,
        'items_count' => count($validatedItems)
    ], JSON_UNESCAPED_UNICODE);
    exit();

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    
    // Логирование ошибки для отладки
    error_log("Order creation error: " . $e->getMessage() . " Data: " . json_encode($data));
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка создания заказа: ' . $e->getMessage(),
        'debug_data' => $data // Только для отладки, удалить в продакшене
    ], JSON_UNESCAPED_UNICODE);
}
?>