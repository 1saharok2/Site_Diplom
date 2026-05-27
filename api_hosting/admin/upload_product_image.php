<?php
/**
 * POST multipart/form-data, поле image — файл изображения товара.
 * Authorization: Bearer <token> (как у upload_avatar.php).
 * Ответ: { "success": true, "url": "/api/uploads/products/..." }
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешён']);
    exit();
}

require_once __DIR__ . '/../config/database.php';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
if (!$authHeader) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Токен отсутствует']);
    exit();
}

$parts = explode(' ', $authHeader);
$token = $parts[1] ?? null;
if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Некорректный токен']);
    exit();
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $err = $_FILES['image']['error'] ?? 'no file';
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Файл не получен', 'code' => $err]);
    exit();
}

$file = $_FILES['image'];
$maxBytes = 5 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Размер файла не больше 5 МБ']);
    exit();
}

$tmp = $file['tmp_name'];
$mime = '';
if (class_exists('finfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp) ?: '';
}
if ($mime === '' && function_exists('getimagesize')) {
    $info = @getimagesize($tmp);
    if (!empty($info['mime'])) {
        $mime = $info['mime'];
    }
}
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];
if (!isset($allowed[$mime])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Допустимы только JPEG, PNG, WebP или GIF']);
    exit();
}
$ext = $allowed[$mime];

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare('SELECT id FROM users WHERE token = :token LIMIT 1');
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Пользователь не найден или токен недействителен']);
        exit();
    }

    $uploadDir = __DIR__ . '/../uploads/products';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('Не удалось создать каталог загрузок');
        }
    }

    $baseName = 'product_' . bin2hex(random_bytes(12)) . '.' . $ext;
    $destPath = $uploadDir . '/' . $baseName;

    if (!move_uploaded_file($tmp, $destPath)) {
        throw new Exception('Не удалось сохранить файл');
    }

    $publicPath = '/api/uploads/products/' . $baseName;

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'url' => $publicPath,
        'message' => 'Файл загружен'
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
