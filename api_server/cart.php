<?php
// cart.php - работа с корзиной пользователя (исправленная версия с обработкой изображений)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    include_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    // Функция для получения первого изображения из JSON массива
    function getFirstImage($imageData) {
        if (empty($imageData)) {
            return '';
        }
        
        try {
            // Если это JSON строка, декодируем
            if (is_string($imageData) && $imageData[0] === '[') {
                $images = json_decode($imageData, true);
                if (is_array($images) && count($images) > 0) {
                    return $images[0];
                }
            }
        } catch (Exception $e) {
            error_log("Error parsing image JSON: " . $e->getMessage());
        }
        
        return $imageData;
    }

    // GET: Получение корзины пользователя
    if ($method === 'GET') {
        $userId = $_GET['userId'] ?? 0;
        
        // Если userId не указан или равен 0, возвращаем пустую корзину
        if (!$userId || $userId === '0') {
            echo json_encode([
                'success' => true,
                'items' => [],
                'count' => 0,
                'total' => 0,
                'message' => 'Корзина пуста'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Получаем товары из корзины пользователя
        $query = "
            SELECT 
                c.id,
                c.user_id,
                c.product_id,
                c.quantity,
                c.added_at,
                p.name as product_name,
                p.price,
                p.image_url,
                p.description,
                p.stock,
                p.is_active
            FROM user_cart c
            LEFT JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ? 
            ORDER BY c.added_at DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Форматируем данные
        $formattedItems = [];
        foreach ($cartItems as $item) {
            // Проверяем активность товара
            $isActive = isset($item['is_active']) && $item['is_active'] == 1;
            
            // Определяем, есть ли товар в наличии
            $inStock = isset($item['stock']) && $item['stock'] > 0;
            
            // Получаем первое изображение
            $firstImage = getFirstImage($item['image_url'] ?? '');
            
            $formattedItems[] = [
                'id' => $item['id'],
                'user_id' => $item['user_id'],
                'product_id' => $item['product_id'],
                'quantity' => (int)$item['quantity'],
                'added_at' => $item['added_at'] ?? '',
                'product_name' => $item['product_name'] ?? 'Товар',
                'price' => (float)$item['price'] ?? 0,
                'image_url' => $firstImage, // Возвращаем только первое изображение
                'image_urls' => $item['image_url'] ?? '[]', // Полный JSON для возможного использования
                'description' => $item['description'] ?? '',
                'stock' => (int)($item['stock'] ?? 0),
                'is_active' => $isActive,
                'in_stock' => $inStock,
                'is_available' => $isActive && $inStock // Товар доступен только если активен и в наличии
            ];
        }
        
        // Расчет общей суммы
        $total = array_reduce($formattedItems, function($sum, $item) {
            if ($item['is_available']) {
                return $sum + ($item['price'] * $item['quantity']);
            }
            return $sum;
        }, 0);
        
        echo json_encode([
            'success' => true,
            'items' => $formattedItems,
            'count' => count($formattedItems),
            'total' => round($total, 2),
            'available_count' => count(array_filter($formattedItems, function($item) {
                return $item['is_available'];
            }))
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // POST: Добавление/обновление/удаление из корзины
    if ($method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Invalid JSON data'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        $action = $data['action'] ?? 'add';
        $userId = $data['user_id'] ?? $data['userId'] ?? 0;
        $productId = $data['product_id'] ?? $data['productId'] ?? null;
        $quantity = $data['quantity'] ?? 1;
        $cartItemId = $data['id'] ?? null;
        
        // Проверка авторизации
        if ($userId <= 0) {
            http_response_code(401);
            echo json_encode([
                'success' => false, 
                'message' => 'Требуется авторизация'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        switch ($action) {
            case 'add':
                if (!$productId) {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Product ID is required'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                // Проверяем, существует ли товар и активен ли он
                $productCheck = "SELECT id, is_active FROM products WHERE id = ?";
                $productStmt = $db->prepare($productCheck);
                $productStmt->execute([$productId]);
                
                if ($productStmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Товар не найден'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                $product = $productStmt->fetch(PDO::FETCH_ASSOC);
                if (!$product['is_active']) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Товар недоступен для покупки'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                // Проверяем, есть ли уже товар в корзине
                $checkQuery = "SELECT id, quantity FROM user_cart WHERE user_id = ? AND product_id = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$userId, $productId]);
                
                if ($checkStmt->rowCount() > 0) {
                    // Обновляем количество
                    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
                    $newQuantity = $existing['quantity'] + $quantity;
                    
                    $updateQuery = "UPDATE user_cart SET quantity = ? WHERE id = ?";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->execute([$newQuantity, $existing['id']]);
                    
                    $response = [
                        'success' => true, 
                        'message' => 'Количество обновлено',
                        'action' => 'updated',
                        'quantity' => $newQuantity
                    ];
                } else {
                    // Добавляем новый товар
                    $insertQuery = "INSERT INTO user_cart (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())";
                    $insertStmt = $db->prepare($insertQuery);
                    $insertStmt->execute([$userId, $productId, $quantity]);
                    
                    $response = [
                        'success' => true, 
                        'message' => 'Товар добавлен в корзину',
                        'action' => 'added'
                    ];
                }
                break;
                
            case 'update':
                if (!$cartItemId || !$quantity) {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Cart item ID and quantity are required'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                $updateQuery = "UPDATE user_cart SET quantity = ? WHERE id = ? AND user_id = ?";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([$quantity, $cartItemId, $userId]);
                
                $response = [
                    'success' => true, 
                    'message' => 'Количество обновлено',
                    'action' => 'updated'
                ];
                break;
                
            case 'remove':
                if (!$cartItemId) {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Cart item ID is required'
                    ], JSON_UNESCAPED_UNICODE);
                    exit();
                }
                
                $deleteQuery = "DELETE FROM user_cart WHERE id = ? AND user_id = ?";
                $deleteStmt = $db->prepare($deleteQuery);
                $deleteStmt->execute([$cartItemId, $userId]);
                
                $response = [
                    'success' => true, 
                    'message' => 'Товар удален из корзины',
                    'action' => 'removed'
                ];
                break;
                
            case 'clear':
                $clearQuery = "DELETE FROM user_cart WHERE user_id = ?";
                $clearStmt = $db->prepare($clearQuery);
                $clearStmt->execute([$userId]);
                
                $response = [
                    'success' => true, 
                    'message' => 'Корзина очищена',
                    'action' => 'cleared'
                ];
                break;
                
            default:
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'message' => 'Unknown action'
                ], JSON_UNESCAPED_UNICODE);
                exit();
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit();
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);

} catch (Exception $e) {
    error_log("Cart API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>