<?php
ini_set('display_errors', 0);
error_reporting(0);

header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔹 Подключение к базе MySQL
$host = 'localhost';
$user = 'cd371444_dbsite';
$pass = 'dbsite1234';
$dbname = 'cd371444_dbsite';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных: ' . $conn->connect_error]);
    exit();
}

$conn->set_charset('utf8mb4');
?>