<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/config/database.php';

$db = (new Database())->getConnection();

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? null;
$productId = $input['productId'] ?? null;
$action = $input['action'] ?? null;

if (!$userId || !$productId || !$action) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

// Определяем вес действия
$weights = [
    'view' => 1,
    'cart' => 2,
    'purchase' => 3
];
$weight = $weights[$action] ?? 1;

// Вставляем запись (можно добавить проверку дубликатов, но для простоты просто логируем)
$stmt = $db->prepare("INSERT INTO user_actions (user_id, product_id, action_type, action_weight) VALUES (?, ?, ?, ?)");
$success = $stmt->execute([$userId, $productId, $action, $weight]);

echo json_encode(['success' => $success]);