<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once 'db.php';

header('Access-Control-Allow-Origin: https://electronic.tw1.ru');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (ob_get_level() === 0) {
    ob_start();
}

function toYesNo($v) {
    if (is_bool($v)) return $v ? 'Да' : 'Нет';
    if ($v === 'true' || $v === 'True' || $v === 1 || $v === '1') return 'Да';
    if ($v === 'false' || $v === 'False' || $v === 0 || $v === '0') return 'Нет';
    return $v;
}

function cleanString($v) {
    if ($v === null) return null;
    if (is_bool($v)) return $v ? '1' : '0';
    $s = trim((string)$v);
    return $s === '' ? null : $s;
}

function boolLoose($v) {
    if (is_bool($v)) return $v;
    if (is_int($v)) return $v !== 0;
    $s = strtolower(trim((string)$v));
    if ($s === '') return null;
    if (in_array($s, ['true','да','yes','y','1','on'], true)) return true;
    if (in_array($s, ['false','нет','no','n','0','off'], true)) return false;
    return null;
}

function getScreenSizeRange($sizeStr) {
    if (!$sizeStr) return null;
    $num = floatval(preg_replace('/[^0-9.]/', '', (string)$sizeStr));
    if (!$num) return null;
    if ($num < 6.0) return 'до 6.0"';
    if ($num <= 6.5) return '6.1-6.5"';
    if ($num <= 6.9) return '6.6-6.9"';
    return '7.0+"';
}

function getBatteryCapacityBucket($capStr) {
    if (!$capStr) return null;
    $num = intval(preg_replace('/[^0-9]/', '', (string)$capStr), 10);
    if (!$num) return null;
    if ($num < 2000) return '<2000 мАч';
    if ($num < 3000) return '2000–3000 мАч';
    if ($num < 4000) return '3000–4000 мАч';
    if ($num < 5000) return '4000–5000 мАч';
    if ($num < 6000) return '5000–6000 мАч';
    return '6000+ мАч';
}

function getFastChargeRange($wattStr) {
    if (!$wattStr) return null;
    $num = intval(preg_replace('/[^0-9]/', '', (string)$wattStr), 10);
    if (!$num) return 'Нет';
    if ($num < 30) return '15-30 Вт';
    if ($num <= 65) return '30-65 Вт';
    return '65+ Вт';
}

function getCameraCountBucket($cameraStr) {
    if (!$cameraStr) return null;
    $plusCount = substr_count((string)$cameraStr, '+') + 1;
    if ($plusCount <= 2) return '2';
    if ($plusCount === 3) return '3';
    if ($plusCount === 4) return '4';
    return '5+';
}

function getResolutionClass($res) {
    if (!$res) return null;
    if (!preg_match('/(\d+)x(\d+)/', (string)$res, $m)) {
        return null;
    }
    $w = intval($m[1], 10);
    $h = intval($m[2], 10);
    $maxSide = max($w, $h);
    if ($maxSide >= 3000) return 'Quad HD+';
    if ($maxSide >= 2300) return 'Full HD+';
    return 'HD+';
}

function getProcessorCompany($proc) {
    $s = strtolower((string)$proc);
    if (strpos($s, 'qualcomm') !== false || strpos($s, 'snapdragon') !== false) return 'Qualcomm';
    if (strpos($s, 'mediatek') !== false) return 'MediaTek';
    if (strpos($s, 'exynos') !== false) return 'Samsung';
    if (strpos($s, 'apple') !== false || strpos($s, 'a18') !== false || strpos($s, 'a17') !== false || strpos($s, 'a-series') !== false) return 'Apple';
    if (strpos($s, 'google') !== false || strpos($s, 'tensor') !== false) return 'Google';
    return null;
}

function getCpuCores($processor, $chip) {
    $texts = [(string)$processor, (string)$chip];
    foreach ($texts as $t) {
        if (preg_match('/(\d+)\s*-?\s*core/i', $t, $mEn) && !empty($mEn[1])) {
            return intval($mEn[1], 10) . ' ядер';
        }
        if (preg_match('/(\d+)\s*-?\s*ядер/i', $t, $mRu) && !empty($mRu[1])) {
            return intval($mRu[1], 10) . ' ядер';
        }
        if (preg_match('/(\d+)\s*-?\s*ядерн/i', $t, $mRu2) && !empty($mRu2[1])) {
            return intval($mRu2[1], 10) . ' ядер';
        }
        if (preg_match('/(\d+)\s*-?\s*ядерн.*CPU/i', $t, $mCpu) && !empty($mCpu[1])) {
            return intval($mCpu[1], 10) . ' ядер';
        }
    }
    return null;
}

try {
    if (!isset($_GET['category'])) {
        http_response_code(400);
        ob_clean();
        echo json_encode(['error' => 'Требуется параметр category'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $categorySlug = $_GET['category'];

    $sql = "SELECT specifications FROM products WHERE category_slug = ? AND is_active = 1";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param("s", $categorySlug);
    $stmt->execute();
    $res = $stmt->get_result();

    $valuesByKey = [];
    $countByKeyValue = [];

    while ($row = $res->fetch_assoc()) {
        if (empty($row['specifications'])) {
            continue;
        }
        $specs = json_decode($row['specifications'], true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($specs)) {
            continue;
        }

        // Сырые значения
        foreach ($specs as $key => $val) {
            if (is_array($val)) {
                foreach ($val as $item) {
                    $norm = toYesNo($item);
                    $clean = cleanString($norm);
                    if ($clean === null) continue;
                    $valuesByKey[$key][$clean] = true;
                    $mapKey = $key . '-' . $clean;
                    $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
                }
            } else {
                $norm = toYesNo($val);
                $clean = cleanString($norm);
                if ($clean === null) continue;
                $valuesByKey[$key][$clean] = true;
                $mapKey = $key . '-' . $clean;
                $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
            }
        }

        // Derived признаки
        $network = isset($specs['network']) ? $specs['network'] : '';
        $supports5g = preg_match('/(^|\b)5G(\b|,)/i', (string)$network) === 1;
        $key = 'supports_5g';
        $val = $supports5g ? 'Да' : 'Нет';
        $valuesByKey[$key][$val] = true;
        $mapKey = $key . '-' . $val;
        $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;

        $wireless = isset($specs['wireless_charge']) ? $specs['wireless_charge'] : null;
        $wirelessBool = boolLoose($wireless);
        $hasWireless = $wirelessBool !== null ? $wirelessBool : (bool)($wireless && strtolower(trim((string)$wireless)) !== 'false');
        $key = 'wireless_charge_support';
        $val = $hasWireless ? 'Да' : 'Нет';
        $valuesByKey[$key][$val] = true;
        $mapKey = $key . '-' . $val;
        $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;

        $key = 'screen_size_range';
        $val = getScreenSizeRange(isset($specs['screen_size']) ? $specs['screen_size'] : null);
        if ($val !== null) {
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $key = 'battery_capacity_bucket';
        $val = getBatteryCapacityBucket(isset($specs['battery']) ? $specs['battery'] : null);
        if ($val !== null) {
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $key = 'fast_charge_range';
        $val = getFastChargeRange(isset($specs['fast_charge']) ? $specs['fast_charge'] : null);
        if ($val !== null) {
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $key = 'camera_count_bucket';
        $val = getCameraCountBucket(isset($specs['camera']) ? $specs['camera'] : null);
        if ($val !== null) {
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $video = isset($specs['video']) ? (string)$specs['video'] : '';
        $key = 'video_recording';
        if (preg_match('/8k/i', $video)) {
            $val = '8K';
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }
        if (preg_match('/4k/i', $video)) {
            $val = '4K';
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $key = 'resolution_class';
        $val = getResolutionClass(isset($specs['resolution']) ? $specs['resolution'] : null);
        if ($val !== null) {
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $key = 'processor_company';
        $val = getProcessorCompany(isset($specs['processor']) ? $specs['processor'] : null);
        if ($val !== null) {
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $key = 'cpu_cores';
        $val = getCpuCores(isset($specs['processor']) ? $specs['processor'] : null, isset($specs['chip']) ? $specs['chip'] : null);
        if ($val !== null) {
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }

        $materialRaw = strtolower((string)($specs['material'] ?? ''));
        $materialBasic = null;
        if (preg_match('/стекл|glass/', $materialRaw)) $materialBasic = 'Стекло';
        if (preg_match('/алюм|металл|metal|steel/', $materialRaw)) $materialBasic = 'Металл';
        if (preg_match('/пласт|plastic/', $materialRaw)) $materialBasic = 'Пластик';
        if ($materialBasic !== null) {
            $key = 'material_basic';
            $val = $materialBasic;
            $valuesByKey[$key][$val] = true;
            $mapKey = $key . '-' . $val;
            $countByKeyValue[$mapKey] = ($countByKeyValue[$mapKey] ?? 0) + 1;
        }
    }

    $stmt->close();

    $specifications = [];
    foreach ($valuesByKey as $key => $vals) {
        $arr = array_keys($vals);
        sort($arr, SORT_NATURAL | SORT_FLAG_CASE);
        $specifications[$key] = $arr;
    }

    ksort($countByKeyValue);

    ob_clean();
    echo json_encode([
        'category' => $categorySlug,
        'specifications' => $specifications,
        'counts' => $countByKeyValue
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'error' => 'Ошибка при получении фильтров категории',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
    exit;
}
?>

