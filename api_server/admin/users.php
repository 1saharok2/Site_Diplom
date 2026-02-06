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
        // получаем ID из URL: /api/admin/users/{id}
        $uri = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
        $userId = end($uri);

        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID пользователя не передан']);
            exit;
        }

        // читаем JSON тело
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Некорректные данные']);
            exit;
        }

        // ✅ Поддержка старого поля "name"
        if (isset($data['name']) && !isset($data['first_name'])) {
            $fullName = trim($data['name']);
            $parts = preg_split('/\s+/', $fullName, 2); // разделяем по первому пробелу
            $data['first_name'] = $parts[0];
            if (count($parts) > 1 && !isset($data['last_name'])) {
                $data['last_name'] = $parts[1];
            }
        }

        // динамическое обновление только переданных полей
        $fields = [];
        $params = [];

        $allowed = ['first_name', 'last_name', 'email', 'phone', 'address', 'role'];
        foreach ($allowed as $key) {
            if (isset($data[$key])) {
                $fields[] = "$key = ?";
                $params[] = $data[$key];
            }
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Нет данных для обновления']);
            exit;
        }

        $params[] = $userId;
        $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute($params);

        echo json_encode([
            'success' => true,
            'message' => $stmt->rowCount() > 0
                ? 'Профиль успешно обновлён'
                : 'Изменений не было (возможно, те же данные)',
            'user_id' => $userId,
            'updated_fields' => $fields,
            'affected_rows' => $stmt->rowCount()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    //
    // ======== DELETE — удаление пользователя ========
    //
if ($method === 'DELETE') {
    $uri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
    $userId = end($uri);

    if (empty($userId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID пользователя не передан']);
        exit;
    }

    try {
        // Начинаем транзакцию для целостности данных
        $db->beginTransaction();

        // 1. Проверяем, существует ли пользователь
        $checkStmt = $db->prepare("SELECT id, role FROM users WHERE id = ?");
        $checkStmt->execute([$userId]);
        $user = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
            exit;
        }

        // 2. Проверяем, не пытается ли пользователь удалить себя
        // Нужно получить ID текущего пользователя из токена
        // Пока пропустим эту проверку, если нет информации о текущем пользователе

        // 3. Проверяем, не удаляем ли последнего администратора
        if ($user['role'] === 'admin') {
            $adminCountStmt = $db->prepare("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'");
            $adminCountStmt->execute();
            $adminCount = $adminCountStmt->fetch(PDO::FETCH_ASSOC)['admin_count'];
            
            if ($adminCount <= 1) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Нельзя удалить последнего администратора']);
                exit;
            }
        }

        // 4. УДАЛЯЕМ СВЯЗАННЫЕ ДАННЫЕ (важно для внешних ключей)
        // Список таблиц, которые могут содержать ссылки на пользователя
        
        // user_cart (из ошибки видно, что есть внешний ключ)
        try {
            $deleteCartStmt = $db->prepare("DELETE FROM user_cart WHERE user_id = ?");
            $deleteCartStmt->execute([$userId]);
            error_log("Удалены записи из user_cart для пользователя: " . $userId);
        } catch (Exception $e) {
            error_log("Ошибка при удалении из user_cart: " . $e->getMessage());
        }
        
        // wishlist
        try {
            $deleteWishlistStmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ?");
            $deleteWishlistStmt->execute([$userId]);
            error_log("Удалены записи из wishlist для пользователя: " . $userId);
        } catch (Exception $e) {
            error_log("Ошибка при удалении из wishlist: " . $e->getMessage());
        }
        
        // user_activity или activity_log (если есть такая таблица)
        try {
            $deleteActivityStmt = $db->prepare("DELETE FROM user_activity WHERE user_id = ?");
            $deleteActivityStmt->execute([$userId]);
            error_log("Удалены записи из user_activity для пользователя: " . $userId);
        } catch (Exception $e) {
            // Игнорируем, если таблицы нет
        }
        
        // orders (если есть таблица заказов)
        try {
            $deleteOrdersStmt = $db->prepare("DELETE FROM orders WHERE user_id = ?");
            $deleteOrdersStmt->execute([$userId]);
            error_log("Удалены записи из orders для пользователя: " . $userId);
        } catch (Exception $e) {
            // Игнорируем, если таблицы нет
        }
        
        // reviews (если есть таблица отзывов)
        try {
            $deleteReviewsStmt = $db->prepare("DELETE FROM reviews WHERE user_id = ?");
            $deleteReviewsStmt->execute([$userId]);
            error_log("Удалены записи из reviews для пользователя: " . $userId);
        } catch (Exception $e) {
            // Игнорируем, если таблицы нет
        }
        
        // 5. Теперь удаляем самого пользователя
        $deleteUserStmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $deleteUserStmt->execute([$userId]);
        
        if ($deleteUserStmt->rowCount() > 0) {
            $db->commit();
            echo json_encode([
                'success' => true, 
                'message' => 'Пользователь и все связанные данные успешно удалены',
                'deleted_id' => $userId
            ]);
        } else {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Не удалось удалить пользователя']);
        }
        
    } catch (Exception $e) {
        // Откатываем транзакцию при ошибке
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        
        http_response_code(500);
        error_log("DELETE User Error: " . $e->getMessage() . " - User ID: " . $userId);
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка при удалении пользователя: ' . $e->getMessage()
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