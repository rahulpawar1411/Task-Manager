<?php

require_once __DIR__ . '/../helpers.php';

$user = require_auth();
$token = get_bearer_token();

if ($token) {
    $stmt = db()->prepare('DELETE FROM sessions WHERE token = :token');
    $stmt->execute(['token' => $token]);
}

json_response(['message' => 'Logged out', 'user_id' => (int) $user['id']]);
