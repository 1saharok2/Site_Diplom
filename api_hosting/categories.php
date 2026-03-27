<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once __DIR__ . '/config/database.php';
$database = new Database();
$conn = $database->getConnection();

header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit; 
}

if (ob_get_level() === 0) { 
    ob_start(); 
}

function isImageAccessible($url) {
    if (empty($url) || !is_string($url)) return false;
    if (preg_match('/^https?:\/\//', $url)) return true;
    if (preg_match('/^\//', $url)) return true;
    return false;
}

try {
    // 1. ПОЛУЧЕНИЕ ОДНОЙ КАТЕГОРИИ ПО SLUG
    if (isset($_GET['slug'])) {
        $slug = $_GET['slug'];
        $sql = "
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM products p WHERE p.category_slug = c.slug AND p.is_active = 1) AS product_count
            FROM categories c 
            WHERE c.slug = ? 
            LIMIT 1
        ";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([$slug]); // В PDO передаем параметры массивом в execute
        $category = $stmt->fetch(PDO::FETCH_ASSOC); // Прямой fetch вместо get_result

        if ($category) {
            $imageUrl = $category['image_url'];
            $category['image_url'] = (!empty($imageUrl) && isImageAccessible($imageUrl)) ? $imageUrl : '/images/placeholder.jpg';
            
            ob_clean();
            echo json_encode($category, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            http_response_code(404);
            ob_clean();
            echo json_encode(['error' => 'Категория не найдена'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

    // 2. ПОЛУЧЕНИЕ ВСЕХ КАТЕГОРИЙ
    $sql = "
        SELECT 
            c.id, c.name, c.slug, c.description, c.image_url, 
            c.is_active, c.created_at, c.parent_id,
            (SELECT COUNT(*) FROM products p WHERE p.category_slug = c.slug AND p.is_active = 1) AS product_count
        FROM categories c
        WHERE c.is_active = 1
        ORDER BY c.name ASC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC); // Получаем все строки сразу

    $categories = [];
    foreach ($rows as $row) { 
        $imageUrl = $row['image_url'];
        $processedImageUrl = (!empty($imageUrl) && isImageAccessible($imageUrl)) ? $imageUrl : '/images/placeholder.jpg';
        
        $categories[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'description' => $row['description'] ?? '',
            'image_url' => $processedImageUrl,
            'is_active' => (bool)$row['is_active'],
            'created_at' => $row['created_at'],
            'parent_id' => $row['parent_id'] ? (int)$row['parent_id'] : null,
            'product_count' => (int)$row['product_count']
        ];
    }

    ob_clean();
    echo json_encode($categories, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'error' => 'Ошибка при получении категорий',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    // В PDO не нужно закрывать соединение вручную через close(), оно закроется само
    exit;
}
?>