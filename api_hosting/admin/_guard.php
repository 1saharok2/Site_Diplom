<?php
try {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../utils/auth.php';

    header('Content-Type: application/json; charset=utf-8');

    $token = getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['message' => 'Unauthorized']);
        exit;
    }

    $db = (new Database())->getConnection();

    $stmt = $db->prepare("SELECT id, role FROM users WHERE token = ? LIMIT 1");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid token']);
        exit;
    }

    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Forbidden']);
        exit;
    }

    $GLOBALS['admin'] = $user;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Server error',
        'error' => $e->getMessage()
    ]);
    exit;
}
