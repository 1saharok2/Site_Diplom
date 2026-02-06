<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Проверка авторизации (аналогично другим админ-файлам)
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        throw new Exception('Требуется авторизация');
    }
    
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    
    // Проверяем, что пользователь админ
    $query = "SELECT id, role FROM users WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'admin') {
        throw new Exception('Доступ запрещен. Требуются права администратора');
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    if ($method === 'GET') {
        // Получаем параметры фильтрации
        $status = $_GET['status'] ?? null;
        $priority = $_GET['priority'] ?? null;
        $search = $_GET['search'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;
        
        // Базовый запрос
        $query = "SELECT 
                    st.*,
                    u.email as user_email,
                    u.first_name as user_first_name,
                    u.last_name as user_last_name,
                    a.email as admin_email,
                    a.first_name as admin_first_name,
                    a.last_name as admin_last_name
                  FROM support_tickets st
                  LEFT JOIN users u ON st.user_id = u.id
                  LEFT JOIN users a ON st.responded_by = a.id
                  WHERE 1=1";
        
        $params = [];
        
        // Фильтры
        if ($status && $status !== 'all') {
            $query .= " AND st.status = :status";
            $params[':status'] = $status;
        }
        
        if ($priority && $priority !== 'all') {
            $query .= " AND st.priority = :priority";
            $params[':priority'] = $priority;
        }
        
        if ($search) {
            $query .= " AND (st.name LIKE :search OR st.email LIKE :search OR st.subject LIKE :search OR st.ticket_number LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        $query .= " ORDER BY 
                    CASE st.priority 
                        WHEN 'urgent' THEN 1
                        WHEN 'high' THEN 2
                        WHEN 'medium' THEN 3
                        WHEN 'low' THEN 4
                    END,
                    st.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $params[':limit'] = $limit;
        $params[':offset'] = $offset;
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            if ($key === ':limit' || $key === ':offset') {
                $stmt->bindValue($key, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue($key, $value);
            }
        }
        
        $stmt->execute();
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Получаем общее количество для пагинации
        $countQuery = "SELECT COUNT(*) as total FROM support_tickets st WHERE 1=1";
        if ($status && $status !== 'all') {
            $countQuery .= " AND st.status = :status";
        }
        if ($priority && $priority !== 'all') {
            $countQuery .= " AND st.priority = :priority";
        }
        if ($search) {
            $countQuery .= " AND (st.name LIKE :search OR st.email LIKE :search OR st.subject LIKE :search)";
        }
        
        $countStmt = $db->prepare($countQuery);
        
        $countParams = [];
        if ($status && $status !== 'all') {
            $countParams[':status'] = $status;
        }
        if ($priority && $priority !== 'all') {
            $countParams[':priority'] = $priority;
        }
        if ($search) {
            $countParams[':search'] = "%$search%";
        }
        
        foreach ($countParams as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'tickets' => $tickets,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } elseif ($method === 'PUT' || $method === 'POST') {
        // Обновление обращения
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('Не указан ID обращения');
        }
        
        $allowedFields = ['status', 'priority', 'response', 'admin_notes'];
        $updates = [];
        $params = [':id' => $data['id']];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        // Если есть ответ, записываем кто ответил и когда
        if (isset($data['response']) && !empty($data['response'])) {
            $updates[] = "responded_by = :responded_by";
            $updates[] = "responded_at = NOW()";
            $params[':responded_by'] = $user['id'];
        }
        
        if (empty($updates)) {
            throw new Exception('Нет данных для обновления');
        }
        
        $query = "UPDATE support_tickets SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        
        // Получаем обновленное обращение
        $getQuery = "SELECT * FROM support_tickets WHERE id = :id";
        $getStmt = $db->prepare($getQuery);
        $getStmt->execute([':id' => $data['id']]);
        $updatedTicket = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Обращение обновлено',
            'ticket' => $updatedTicket
        ]);
        
    } elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('Не указан ID обращения');
        }
        
        $query = "DELETE FROM support_tickets WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $data['id']]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Обращение удалено'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>