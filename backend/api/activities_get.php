<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/activity_helpers.php';

$user = require_auth();
$id = (int) ($_GET['id'] ?? 0);

$row = fetch_activity_for_user($id, (int) $user['id']);
if (!$row) {
    json_response(['error' => 'Activity not found or access denied'], 404);
}

json_response(['activity' => format_activity($row)]);
