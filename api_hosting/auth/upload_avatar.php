<?php
/**
 * POST multipart/form-data, поле avatar — файл изображения.
 * Заголовок Authorization: Bearer <token> (как у get_user.php).
 * Ответ: { "success": true, "url": "/api/uploads/avatars/..." }
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

if (empty($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    $err = $_FILES['avatar']['error'] ?? 'no file';
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Файл не получен', 'code' => $err]);
    exit();
}

$file = $_FILES['avatar'];
$maxBytes = 2 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Размер файла не больше 2 МБ']);
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

    $userId = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $row['id']);
    if ($userId === '') {
        $userId = 'user';
    }

    $uploadDir = __DIR__ . '/../uploads/avatars';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('Не удалось создать каталог загрузок');
        }
    }

    $baseName = 'avatar_' . $userId . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $destPath = $uploadDir . '/' . $baseName;

    if (!move_uploaded_file($tmp, $destPath)) {
        throw new Exception('Не удалось сохранить файл');
    }

    $publicPath = '/api/uploads/avatars/' . $baseName;

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
