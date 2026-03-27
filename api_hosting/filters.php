<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 1. Подключаем новый класс БД
require_once __DIR__ . '/config/database.php';

// --- Вспомогательные функции (обязательно должны быть в файле) ---
function toYesNo($val) {
    if (is_bool($val)) return $val ? 'Да' : 'Нет';
    $v = strtolower(trim((string)$val));
    if (in_array($v, ['true', '1', 'yes', 'да', 'есть'])) return 'Да';
    if (in_array($v, ['false', '0', 'no', 'нет', 'отсутствует'])) return 'Нет';
    return $val;
}

function cleanString($val) {
    if ($val === null || $val === '') return null;
    $s = trim((string)$val);
    return $s !== '' ? $s : null;
}

function boolLoose($val) {
    if ($val === null) return null;
    $v = strtolower(trim((string)$val));
    if (in_array($v, ['true', '1', 'yes', 'да'])) return true;
    if (in_array($v, ['false', '0', 'no', 'нет'])) return false;
    return null;
}

// Функции для диапазонов (Buckets)
function getScreenSizeRange($val) {
    $n = floatval($val);
    if ($n === 0.0) return null;
    if ($n < 5.0) return 'До 5"';
    if ($n < 6.0) return '5" - 6"';
    if ($n < 6.5) return '6" - 6.5"';
    return 'Более 6.5"';
}

function getBatteryCapacityBucket($val) {
    $n = intval($val);
    if ($n === 0) return null;
    if ($n < 3000) return 'До 3000 мАч';
    if ($n < 4500) return '3000 - 4500 мАч';
    return 'Более 4500 мАч';
}

function getFastChargeRange($val) {
    $n = intval($val);
    if ($n === 0) return null;
    if ($n < 20) return 'До 20 Вт';
    if ($n < 65) return '20 - 65 Вт';
    return 'Сверхбыстрая (65+ Вт)';
}

function getCameraCountBucket($val) {
    $n = intval($val);
    if ($n === 0) return null;
    if ($n === 1) return 'Одна камера';
    if ($n === 2) return 'Две камеры';
    return 'Три и более';
}

function getResolutionClass($val) {
    $s = strtolower((string)$val);
    if (strpos($s, '3840') !== false || strpos($s, '4k') !== false) return '4K Ultra HD';
    if (strpos($s, '1920') !== false || strpos($s, '1080') !== false || strpos($s, 'fhd') !== false) return 'Full HD';
    if (strpos($s, '1280') !== false || strpos($s, '720') !== false) return 'HD';
    return null;
}

function getProcessorCompany($val) {
    $s = strtolower((string)$val);
    if (preg_match('/snapdragon|qualcomm/i', $s)) return 'Qualcomm';
    if (preg_match('/apple|a\d+|m\d+/i', $s)) return 'Apple';
    if (preg_match('/helio|dimensity|mediatek/i', $s)) return 'MediaTek';
    if (preg_match('/exynos/i', $s)) return 'Samsung';
    if (preg_match('/intel/i', $s)) return 'Intel';
    if (preg_match('/amd|ryzen/i', $s)) return 'AMD';
    return 'Другие';
}

function getCpuCores($p, $c) {
    $s = strtolower((string)$p . ' ' . (string)$c);
    if (preg_match('/8[ -]?core|восемь|octa/i', $s)) return '8 ядер';
    if (preg_match('/6[ -]?core|шесть|hexa/i', $s)) return '6 ядер';
    if (preg_match('/4[ -]?core|четыре|quad/i', $s)) return '4 ядра';
    return null;
}

// --- Основная логика ---

try {
    $db = new Database();
    $conn = $db->getConnection();

    if (!isset($_GET['category'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Требуется параметр category'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $categorySlug = $_GET['category'];

    // PDO запрос
    $sql = "SELECT specifications FROM products WHERE category_slug = ? AND is_active = 1";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$categorySlug]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $valuesByKey = [];
    $countByKeyValue = [];

    foreach ($results as $row) {
        if (empty($row['specifications'])) continue;
        
        $specs = json_decode($row['specifications'], true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($specs)) continue;

        // Обработка всех характеристик из JSON
        foreach ($specs as $key => $val) {
            $vals_to_process = is_array($val) ? $val : [$val];
            
            foreach ($vals_to_process as $item) {
                $norm = toYesNo($item);
                $clean = cleanString($norm);
                if ($clean === null) continue;
                
                $valuesByKey[$key][$clean] = true;
                $mapKey = $key . '-' . $clean;
                $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
            }
        }

        // --- Генерация "умных" фильтров (Derived) ---
        
        // 5G
        $network = $specs['network'] ?? '';
        if (preg_match('/5G/i', (string)$network)) {
            $key = 'supports_5g'; $val = 'Да';
            $valuesByKey[$key][$val] = true;
            $mapKey = "$key-$val";
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        // Беспроводная зарядка
        $wireless = boolLoose($specs['wireless_charge'] ?? null);
        if ($wireless !== null) {
            $key = 'wireless_charge_support'; $val = $wireless ? 'Да' : 'Нет';
            $valuesByKey[$key][$val] = true;
            $mapKey = "$key-$val";
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        // Экраны, Батареи, Камеры
        $derived = [
            'screen_size_range' => getScreenSizeRange($specs['screen_size'] ?? null),
            'battery_capacity_bucket' => getBatteryCapacityBucket($specs['battery'] ?? null),
            'camera_count_bucket' => getCameraCountBucket($specs['camera'] ?? null),
            'resolution_class' => getResolutionClass($specs['resolution'] ?? null),
            'processor_company' => getProcessorCompany($specs['processor'] ?? null),
            'cpu_cores' => getCpuCores($specs['processor'] ?? null, $specs['chip'] ?? null)
        ];

        foreach ($derived as $key => $val) {
            if ($val !== null) {
                $valuesByKey[$key][$val] = true;
                $mapKey = "$key-$val";
                $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
            }
        }
    }

    // Форматирование ответа
    $specifications = [];
    foreach ($valuesByKey as $key => $vals) {
        $arr = array_keys($vals);
        sort($arr, SORT_NATURAL | SORT_FLAG_CASE);
        $specifications[$key] = $arr;
    }

    ksort($countByKeyValue);

    echo json_encode([
        'category' => $categorySlug,
        'specifications' => $specifications,
        'counts' => $countByKeyValue
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Ошибка сервера',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}