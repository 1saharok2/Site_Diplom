<?php
function getBearerToken(): ?string {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    if (!$authHeader) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    }
    if (!$authHeader) return null;
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    return null;
}