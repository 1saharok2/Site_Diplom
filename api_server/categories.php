<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once 'db.php';

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

// Функция для проверки доступности изображения
function isImageAccessible($url) {
    if (empty($url) || !is_string($url)) {
        return false;
    }
    
    // Проверяем абсолютные URL (http/https)
    if (preg_match('/^https?:\/\//', $url)) {
        return true;
    }
    
    // Проверяем относительные пути (начинающиеся с /)
    if (preg_match('/^\//', $url)) {
        return true;
    }
    
    return false;
}

// Функция для очистки URL
function cleanImageUrl($url) {
    if (empty($url) || !is_string($url)) {
        return null;
    }
    
    // Если URL уже валидный (абсолютный или относительный), возвращаем как есть
    if (isImageAccessible($url)) {
        return $url;
    }
    
    // Для невалидных URL возвращаем null
    return null;
}

try {
    // Если запрашивают конкретную категорию по slug
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
        if (!$stmt) { 
            throw new Exception('Prepare failed: ' . $conn->error); 
        }
        $stmt->bind_param("s", $slug);
        $stmt->execute();
        $res = $stmt->get_result();
        $category = $res->fetch_assoc();
        $stmt->close();

        if ($category) {
            // Обработка изображения категории - УПРОЩЕННАЯ ЛОГИКА
            $imageUrl = $category['image_url']; // Берем оригинальный URL из базы
            
            // Если URL не пустой и валидный - используем его, иначе placeholder
            if (!empty($imageUrl) && isImageAccessible($imageUrl)) {
                // Используем оригинальный URL из базы
                $category['image_url'] = $imageUrl;
            } else {
                // Только если URL пустой или невалидный
                $category['image_url'] = '/images/placeholder.jpg';
            }
            
            ob_clean();
            echo json_encode($category, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            http_response_code(404);
            ob_clean();
            echo json_encode(['error' => 'Категория не найдена'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

    // Все категории с подсчетом товаров
    $sql = "
        SELECT 
            c.id, 
            c.name, 
            c.slug, 
            c.description, 
            c.image_url, 
            c.is_active, 
            c.created_at, 
            c.parent_id,
            (SELECT COUNT(*) FROM products p WHERE p.category_slug = c.slug AND p.is_active = 1) AS product_count
        FROM categories c
        WHERE c.is_active = 1
        ORDER BY c.name ASC
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { 
        throw new Exception('Prepare failed: ' . $conn->error); 
    }
    $stmt->execute();
    $res = $stmt->get_result();

    $categories = [];
    while ($row = $res->fetch_assoc()) { 
        // Обработка изображений категории - УПРОЩЕННАЯ ЛОГИКА
        $imageUrl = $row['image_url']; // Берем оригинальный URL из базы
        
        // Если URL не пустой и валидный - используем его, иначе placeholder
        if (!empty($imageUrl) && isImageAccessible($imageUrl)) {
            // Используем оригинальный URL из базы
            $processedImageUrl = $imageUrl;
        } else {
            // Только если URL пустой или невалидный
            $processedImageUrl = '/images/placeholder.jpg';
        }
        
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
    $stmt->close();

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
    if ($conn && $conn->ping()) { 
        $conn->close(); 
    }
    exit;
}
?>