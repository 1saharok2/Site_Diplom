<?php
/**
 * GET — обращения текущего пользователя (токен как у get_user.php).
 * Возвращает вопрос, статус и ответ поддержки (response, responded_at).
 */
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

try {
    $database = new Database();
    $db = $database->getConnection();

    $uStmt = $db->prepare('SELECT id, email FROM users WHERE token = :token LIMIT 1');
    $uStmt->execute([':token' => $token]);
    $me = $uStmt->fetch(PDO::FETCH_ASSOC);

    if (!$me) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
        exit();
    }

    $uid = $me['id'];
    $email = (string) ($me['email'] ?? '');

    $query = "
        SELECT 
            id,
            ticket_number,
            subject,
            message,
            status,
            priority,
            response,
            responded_at,
            created_at,
            updated_at
        FROM support_tickets
        WHERE user_id = :uid
           OR (user_id IS NULL AND email IS NOT NULL AND LOWER(TRIM(email)) = LOWER(TRIM(:email)))
        ORDER BY created_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->execute([':uid' => $uid, ':email' => $email]);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'tickets' => $tickets,
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка сервера',
    ], JSON_UNESCAPED_UNICODE);
    error_log('my-tickets: ' . $e->getMessage());
}
