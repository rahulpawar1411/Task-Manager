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

json_response(['updates' => list_activity_updates($activityId)]);
