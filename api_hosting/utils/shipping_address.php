<?php
/**
 * Адрес в БД может быть JSON-объектом или обычной строкой (как при orders.php).
 */
function normalize_shipping_address_for_api($raw)
{
    if ($raw === null || $raw === '') {
        return null;
    }
    if (!is_string($raw)) {
        return $raw;
    }
    $trim = trim($raw);
    if ($trim === '') {
        return null;
    }
    $decoded = json_decode($trim, true);
    if (json_last_error() === JSON_ERROR_NONE && $decoded !== null) {
        return $decoded;
    }
    return $trim;
}
