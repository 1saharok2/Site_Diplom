<?php
// 1. Установка заголовков для CORS и формата JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Обработка Preflight-запроса (браузер сначала шлет OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Подключение необходимых файлов
// Пути могут отличаться в зависимости от того, где лежит файл. 
// Предполагаем: api/admin/orders/update.php
require_once '../../config/database.php'; // Путь к вашему PDO подключению
require_once '../../utils/auth.php';     // Здесь лежит наша исправленная getBearerToken()

// 3. Проверка авторизации
$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(["message" => "Токен не найден. Авторизуйтесь."]);
    exit;
}

// ВАЖНО: Здесь должна быть ваша логика проверки JWT токена (декодирование)
// Если у вас есть функция verifyToken($token), используйте её здесь.
// Для примера предположим, что если токен есть, мы продолжаем.

// 4. Получение данных из тела запроса
$data = json_decode(file_get_contents("php://input"), true);

$orderId = $data['order_id'] ?? null;
$status = $data['status'] ?? null;

if (!$orderId || !$status) {
    http_response_code(400);
    echo json_encode(["message" => "Недостаточно данных. Требуется order_id и status."]);
    exit;
}

try {
    // 5. Инициализация базы данных (предполагаем использование PDO)
    $database = new Database();
    $db = $database->getConnection();

    // 6. Подготовка и выполнение запроса
    $query = "UPDATE orders SET status = :status, updated_at = NOW() WHERE id = :id";
    $stmt = $db->prepare($query);

    // Привязка параметров
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $orderId);

    if ($stmt->execute()) {
        // Проверяем, была ли обновлена хоть одна строка
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Статус заказа #$orderId успешно обновлен на '$status'."
            ]);
        } else {
            // Если rowCount 0, значит либо ID нет, либо статус уже такой же
            http_response_code(200);
            echo json_encode([
                "success" => true, 
                "message" => "Изменений не внесено (возможно, статус уже совпадает или ID не найден)."
            ]);
        }
    } else {
        throw new Exception("Ошибка при выполнении запроса в БД.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Ошибка сервера: " . $e->getMessage()
    ]);
}
?>