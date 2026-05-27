<?php
// admin/categories.php

ini_set('display_errors', 0);
error_reporting(0);

require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (ob_get_level() === 0) ob_start();

function checkAdminAuth() {
    // TODO: реальная проверка токена/роли администратора
    return true;
}

function isSlugValid($s) {
    if (!is_string($s)) return false;
    $t = trim($s);
    if ($t === '' || strlen($t) > 255) return false;
    // допустим: латиница/цифры/дефис/подчеркивание
    return (bool) preg_match('/^[a-z0-9_-]+$/i', $t);
}

function isImageUrlAllowed($s) {
    if ($s === null) return true;
    if (!is_string($s)) return false;
    $t = trim($s);
    if ($t === '') return true;
    if (strlen($t) > 500) return false;
    return filter_var($t, FILTER_VALIDATE_URL) || strpos($t, '/') === 0;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    switch ($method) {
        case 'GET':
            checkAdminAuth();
            if ($id) {
                $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ? LIMIT 1");
                $stmt->execute([$id]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$row) {
                    http_response_code(404);
                    ob_clean();
                    echo json_encode(['error' => 'Категория не найдена'], JSON_UNESCAPED_UNICODE);
                    break;
                }
                ob_clean();
                echo json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                break;
            }

            $stmt = $conn->prepare("SELECT * FROM categories ORDER BY name ASC");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            ob_clean();
            echo json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        case 'POST':
            checkAdminAuth();
            $input = json_decode(file_get_contents('php://input'), true);
            if (!is_array($input)) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'Некорректный JSON'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $name = trim((string)($input['name'] ?? ''));
            $slug = trim((string)($input['slug'] ?? ''));
            $description = trim((string)($input['description'] ?? ''));
            $imageUrl = array_key_exists('image_url', $input) ? $input['image_url'] : null;
            $isActive = array_key_exists('is_active', $input) ? intval($input['is_active']) : 1;

            $parentId = null;
            if (array_key_exists('parent_id', $input) && $input['parent_id'] !== null && $input['parent_id'] !== '') {
                $parentId = intval($input['parent_id']);
            }

            $errors = [];
            if ($name === '') $errors[] = 'Название обязательно';
            if (!isSlugValid($slug)) $errors[] = 'Некорректный SLUG (только латиница/цифры/дефис/подчёркивание)';
            if (!isImageUrlAllowed($imageUrl)) $errors[] = 'Некорректная ссылка на картинку (url или путь /...)';

            if (!empty($errors)) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'Ошибка валидации', 'details' => $errors], JSON_UNESCAPED_UNICODE);
                break;
            }

            // parent_id может быть NULL (категория без родителя)
            if ($parentId !== null) {
                $p = $conn->prepare("SELECT id FROM categories WHERE id = ? LIMIT 1");
                $p->execute([$parentId]);
                if (!$p->fetchColumn()) {
                    http_response_code(400);
                    ob_clean();
                    echo json_encode(['error' => 'Родительская категория не найдена'], JSON_UNESCAPED_UNICODE);
                    break;
                }
            }

            // slug должен быть уникальным
            $c = $conn->prepare("SELECT id FROM categories WHERE slug = ? LIMIT 1");
            $c->execute([$slug]);
            if ($c->fetchColumn()) {
                http_response_code(409);
                ob_clean();
                echo json_encode(['error' => 'SLUG уже занят'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $conn->prepare("INSERT INTO categories (name, slug, description, image_url, is_active, parent_id) VALUES (?, ?, ?, ?, ?, ?)");
            $ok = $stmt->execute([
                $name,
                $slug,
                $description !== '' ? $description : null,
                (is_string($imageUrl) && trim($imageUrl) !== '') ? trim($imageUrl) : null,
                $isActive ? 1 : 0,
                $parentId
            ]);

            if (!$ok) {
                http_response_code(500);
                ob_clean();
                $err = $stmt->errorInfo();
                echo json_encode(['error' => 'Не удалось создать категорию', 'message' => $err[2] ?? ''], JSON_UNESCAPED_UNICODE);
                break;
            }

            $newId = $conn->lastInsertId();
            $get = $conn->prepare("SELECT * FROM categories WHERE id = ? LIMIT 1");
            $get->execute([$newId]);
            http_response_code(201);
            ob_clean();
            echo json_encode($get->fetch(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        case 'PUT':
            checkAdminAuth();
            if (!$id) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'ID категории не указан'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!is_array($input)) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'Некорректный JSON'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $get = $conn->prepare("SELECT * FROM categories WHERE id = ? LIMIT 1");
            $get->execute([$id]);
            $current = $get->fetch(PDO::FETCH_ASSOC);
            if (!$current) {
                http_response_code(404);
                ob_clean();
                echo json_encode(['error' => 'Категория не найдена'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $updates = [];
            $params = [];

            if (array_key_exists('name', $input)) {
                $updates[] = "name = ?";
                $params[] = trim((string)$input['name']);
            }

            if (array_key_exists('slug', $input)) {
                $slug = trim((string)$input['slug']);
                if (!isSlugValid($slug)) {
                    http_response_code(400);
                    ob_clean();
                    echo json_encode(['error' => 'Некорректный SLUG'], JSON_UNESCAPED_UNICODE);
                    break;
                }
                // уникальность slug (кроме текущей)
                $c = $conn->prepare("SELECT id FROM categories WHERE slug = ? AND id <> ? LIMIT 1");
                $c->execute([$slug, $id]);
                if ($c->fetchColumn()) {
                    http_response_code(409);
                    ob_clean();
                    echo json_encode(['error' => 'SLUG уже занят'], JSON_UNESCAPED_UNICODE);
                    break;
                }
                $updates[] = "slug = ?";
                $params[] = $slug;
            }

            if (array_key_exists('description', $input)) {
                $d = trim((string)$input['description']);
                $updates[] = "description = ?";
                $params[] = ($d !== '') ? $d : null;
            }

            if (array_key_exists('image_url', $input)) {
                $imageUrl = $input['image_url'];
                if (!isImageUrlAllowed($imageUrl)) {
                    http_response_code(400);
                    ob_clean();
                    echo json_encode(['error' => 'Некорректная ссылка на картинку'], JSON_UNESCAPED_UNICODE);
                    break;
                }
                $t = is_string($imageUrl) ? trim($imageUrl) : '';
                $updates[] = "image_url = ?";
                $params[] = ($t !== '') ? $t : null;
            }

            if (array_key_exists('is_active', $input)) {
                $updates[] = "is_active = ?";
                $params[] = intval($input['is_active']) ? 1 : 0;
            }

            if (array_key_exists('parent_id', $input)) {
                $parentId = null;
                if ($input['parent_id'] !== null && $input['parent_id'] !== '') {
                    $parentId = intval($input['parent_id']);
                }
                if ($parentId !== null) {
                    if ($parentId === $id) {
                        http_response_code(400);
                        ob_clean();
                        echo json_encode(['error' => 'Категория не может быть родителем самой себя'], JSON_UNESCAPED_UNICODE);
                        break;
                    }
                    $p = $conn->prepare("SELECT id FROM categories WHERE id = ? LIMIT 1");
                    $p->execute([$parentId]);
                    if (!$p->fetchColumn()) {
                        http_response_code(400);
                        ob_clean();
                        echo json_encode(['error' => 'Родительская категория не найдена'], JSON_UNESCAPED_UNICODE);
                        break;
                    }
                }
                $updates[] = "parent_id = ?";
                $params[] = $parentId;
            }

            if (empty($updates)) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'Нет данных для обновления'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $sql = "UPDATE categories SET " . implode(', ', $updates) . " WHERE id = ?";
            $params[] = $id;
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);

            $get2 = $conn->prepare("SELECT * FROM categories WHERE id = ? LIMIT 1");
            $get2->execute([$id]);
            ob_clean();
            echo json_encode($get2->fetch(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        case 'DELETE':
            checkAdminAuth();
            if (!$id) {
                http_response_code(400);
                ob_clean();
                echo json_encode(['error' => 'ID категории не указан'], JSON_UNESCAPED_UNICODE);
                break;
            }

            // Нельзя удалять категорию, если есть товары с этим category_slug
            $cat = $conn->prepare("SELECT slug FROM categories WHERE id = ? LIMIT 1");
            $cat->execute([$id]);
            $slug = $cat->fetchColumn();
            if (!$slug) {
                http_response_code(404);
                ob_clean();
                echo json_encode(['error' => 'Категория не найдена'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $pcount = $conn->prepare("SELECT COUNT(*) FROM products WHERE category_slug = ? LIMIT 1");
            $pcount->execute([$slug]);
            $cnt = intval($pcount->fetchColumn() ?: 0);
            if ($cnt > 0) {
                http_response_code(409);
                ob_clean();
                echo json_encode(['error' => 'Нельзя удалить категорию, в которой есть товары'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            ob_clean();
            echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            break;

        default:
            http_response_code(405);
            ob_clean();
            echo json_encode(['error' => 'Метод не поддерживается'], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Throwable $e) {
    http_response_code(500);
    if (ob_get_length()) ob_clean();
    echo json_encode(['error' => 'Ошибка сервера', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} finally {
    exit;
}
?>
