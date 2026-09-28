<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/activity_helpers.php';
require_once __DIR__ . '/update_helpers.php';

$user = require_auth();
$userId = (int) $user['id'];
$activityId = (int) ($_GET['id'] ?? 0);

$row = fetch_activity_for_user($activityId, $userId);
if (!$row) {
    json_response(['error' => 'Activity not found or access denied'], 404);
}

$body = read_json_body();
$message = trim($body['message'] ?? '');
$type = strtoupper(trim($body['update_type'] ?? 'COMMENT'));

if ($message === '') {
    json_response(['error' => 'Message is required'], 422);
}

if (mb_strlen($message) > 2000) {
    json_response(['error' => 'Message is too long (max 2000 characters)'], 422);
}

$allowedTypes = ['COMMENT', 'PROGRESS'];
if (!in_array($type, $allowedTypes, true)) {
    $type = 'COMMENT';
}

$update = add_activity_update($activityId, $userId, $message, $type);

json_response(['update' => $update], 201);
