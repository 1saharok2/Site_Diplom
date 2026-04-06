<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Получаем статистику
        $stats = [];
        
        // Количество пользователей
        $query = "SELECT COUNT(*) as count FROM users";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $stats['users'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Количество товаров
        $query = "SELECT COUNT(*) as count FROM products";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $stats['products'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Количество заказов
        $query = "SELECT COUNT(*) as count FROM orders";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $stats['orders'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Количество категорий
        $query = "SELECT COUNT(*) as count FROM categories";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $stats['categories'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Общая сумма заказов
        $query = "SELECT SUM(total_amount) as total FROM orders";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $rev = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        $stats['revenue'] = $rev;
        // Алиас для фронта (adminService ожидает sales / totalSales)
        $stats['sales'] = $rev;

        // Последние заказы (для дашборда)
        $recentStmt = $db->prepare("
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.status,
                o.created_at,
                COALESCE(o.customer_name, CONCAT(u.first_name, ' ', u.last_name), 'Клиент') AS customer_name,
                COALESCE(o.customer_email, u.email) AS customer_email
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
            LIMIT 8
        ");
        $recentStmt->execute();
        $stats['recentOrders'] = $recentStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        
        ob_clean();
        echo json_encode($stats);
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