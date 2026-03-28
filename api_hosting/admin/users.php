<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ob_start();

/**
 * ID пользователя: из RewriteRule (?id=) или из пути .../admin/users/{id}
 */
function admin_users_resolve_id(): string
{
    if (!empty($_GET['id'])) {
        return trim((string) $_GET['id']);
    }
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    $segments = array_values(array_filter(explode('/', trim($path, '/'))));
    foreach ($segments as $i => $seg) {
        if (strcasecmp($seg, 'users') === 0 && isset($segments[$i + 1])) {
            $cand = $segments[$i + 1];
            if (stripos($cand, '.php') === false) {
                return $cand;
            }
        }
    }
    $last = end($segments);
    if ($last && stripos($last, '.php') === false) {
        return $last;
    }

    return '';
}

try {
    include_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    //
    // ======== GET — список пользователей ========
    //
    if ($method === 'GET') {
        $query = "SELECT id, email, first_name, last_name, role, created_at 
                  FROM users ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode($users, JSON_UNESCAPED_UNICODE);
        exit;
    }

    //
    // ======== PUT — обновление пользователя ========
    //
    if ($method === 'PUT') {
        error_log("===== НАЧАЛО PUT ЗАПРОСА =====");

        $userId = admin_users_resolve_id();

        error_log("PUT - ID пользователя: " . $userId);

        if ($userId === '') {
            error_log("PUT - ОШИБКА: ID пользователя не передан");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID пользователя не передан']);
            exit;
        }

        // читаем JSON тело
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        error_log("PUT - Получены данные: " . print_r($data, true));

        if (!$data) {
            error_log("PUT - ОШИБКА: Некорректные данные JSON");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Некорректные данные']);
            exit;
        }

        // ✅ Поддержка старого поля "name"
        if (isset($data['name']) && !isset($data['first_name'])) {
            error_log("PUT - Обнаружено поле 'name', конвертируем в first_name/last_name");
            $fullName = trim($data['name']);
            $parts = preg_split('/\s+/', $fullName, 2); // разделяем по первому пробелу
            $data['first_name'] = $parts[0];
            if (count($parts) > 1 && !isset($data['last_name'])) {
                $data['last_name'] = $parts[1];
            }
            error_log("PUT - После конвертации: first_name='{$data['first_name']}', last_name='{$data['last_name']}'");
        }

        // динамическое обновление только переданных полей
        $fields = [];
        $params = [];

        $allowed = ['first_name', 'last_name', 'email', 'phone', 'address', 'role', 'is_active', 'avatar_url'];
        foreach ($allowed as $key) {
            if (isset($data[$key])) {
                $fields[] = "$key = ?";
                $params[] = $data[$key];
                error_log("PUT - Поле для обновления: $key = " . $data[$key]);
            }
        }

        if (empty($fields)) {
            error_log("PUT - ОШИБКА: Нет данных для обновления");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Нет данных для обновления']);
            exit;
        }

        $params[] = $userId;
        $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        error_log("PUT - SQL запрос: " . $query);
        error_log("PUT - Параметры: " . print_r($params, true));
        $stmt = $db->prepare($query);
        $stmt->execute($params);

        $rowCount = $stmt->rowCount();
        error_log("PUT - Затронуто строк: " . $rowCount);
    
        // Можно также получить данные пользователя после обновления для проверки
        if ($rowCount > 0) {
            $checkStmt = $db->prepare("SELECT * FROM users WHERE id = ?");
            $checkStmt->execute([$userId]);
            $updatedUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
            error_log("PUT - Данные пользователя после обновления: " . print_r($updatedUser, true));
        }

        echo json_encode([
            'success' => true,
            'message' => $stmt->rowCount() > 0
                ? 'Профиль успешно обновлён'
                : 'Изменений не было (возможно, те же данные)',
            'user_id' => $userId,
            'updated_fields' => $fields,
            'affected_rows' => $stmt->rowCount()
        ], JSON_UNESCAPED_UNICODE);
        error_log("===== КОНЕЦ PUT ЗАПРОСА =====\n");
        exit;
    }

    //
    // ======== DELETE — удаление пользователя ========
    //
if ($method === 'DELETE') {
    $userId = admin_users_resolve_id();

    if ($userId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID пользователя не передан']);
        exit;
    }

    try {
        $db->beginTransaction();

        $checkStmt = $db->prepare("SELECT id, role FROM users WHERE id = ?");
        $checkStmt->execute([$userId]);
        $user = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
            exit;
        }

        if ($user['role'] === 'admin') {
            $adminCountStmt = $db->prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'");
            $adminCountStmt->execute();
            $adminCount = (int) $adminCountStmt->fetch(PDO::FETCH_ASSOC)['c'];

            if ($adminCount <= 1) {
                $db->rollBack();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Нельзя удалить последнего администратора']);
                exit;
            }
        }

        // Сотрудник: сначала убираем ссылки из заказов, иначе FK на employees
        $empIdsStmt = $db->prepare("SELECT id FROM employees WHERE user_id = ?");
        $empIdsStmt->execute([$userId]);
        $empIds = $empIdsStmt->fetchAll(PDO::FETCH_COLUMN);
        if (!empty($empIds)) {
            $ph = implode(',', array_fill(0, count($empIds), '?'));
            $db->prepare("UPDATE orders SET employee_id = NULL WHERE employee_id IN ($ph)")->execute($empIds);
            $db->prepare("DELETE FROM employees WHERE user_id = ?")->execute([$userId]);
        }

        $db->prepare("DELETE FROM user_cart WHERE user_id = ?")->execute([$userId]);
        $db->prepare("DELETE FROM user_wishlist WHERE user_id = ?")->execute([$userId]);
        $db->prepare("DELETE FROM reviews WHERE user_id = ?")->execute([$userId]);

        try {
            $db->prepare("DELETE FROM support_tickets WHERE user_id = ?")->execute([$userId]);
        } catch (Throwable $e) {
            error_log('support_tickets delete: ' . $e->getMessage());
        }

        try {
            $db->prepare("DELETE FROM user_activity WHERE user_id = ?")->execute([$userId]);
        } catch (Throwable $e) {
            // таблицы может не быть
        }

        $deleteUserStmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $deleteUserStmt->execute([$userId]);

        if ($deleteUserStmt->rowCount() > 0) {
            $db->commit();
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Пользователь и связанные данные удалены',
                'deleted_id' => $userId,
            ], JSON_UNESCAPED_UNICODE);
        } else {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось удалить пользователя']);
        }
    } catch (Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        error_log('DELETE User Error: ' . $e->getMessage() . ' - User ID: ' . $userId);
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка при удалении пользователя: ' . $e->getMessage(),
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

    //
    // ======== POST — создание (если нужно) ========
    //
    if ($method === 'POST') {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!$data || !isset($data['email'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Некорректные данные']);
            exit;
        }

        $query = "INSERT INTO users (email, first_name, last_name, role) VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data['email'],
            $data['first_name'] ?? null,
            $data['last_name'] ?? null,
            $data['role'] ?? 'user'
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Пользователь добавлен',
            'id' => $db->lastInsertId()
        ]);
        exit;
    }

    //
    // ======== Иное ========
    //
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешён']);

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

ob_end_flush();
?>