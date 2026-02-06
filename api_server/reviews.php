<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ob_start();

try {
    include_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    // Получаем userId из URL или GET параметров
    $path = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
    $userIdFromUrl = end($path);
    $userIdFromGet = $_GET['userId'] ?? null;
    
    // Используем userId из URL или GET параметра
    $userId = $userIdFromUrl !== 'user' ? $userIdFromUrl : $userIdFromGet;
    
    // Преобразуем в число
    $userId = (int)$userId;
    
    // Для GET запросов: если userId = 0, возвращаем пустой массив
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($userId <= 0) {
            ob_clean();
            echo json_encode([
                'success' => true,
                'reviews' => [],
                'count' => 0,
                'message' => 'Отзывы не найдены'
            ]);
            exit();
        }
        
        // Получаем отзывы пользователя из таблицы reviews
        $query = "SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        ob_clean();
        echo json_encode([
            'success' => true,
            'reviews' => $reviews,
            'count' => count($reviews)
        ]);
        exit();
    }
    
    // Для других методов возвращаем ошибку
    http_response_code(405);
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка: ' . $e->getMessage(),
        'error' => true
    ]);
}

ob_end_flush();
?>