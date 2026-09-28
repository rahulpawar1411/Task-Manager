<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/activity_helpers.php';

$user = require_auth();
require_founder($user);

$body = read_json_body();

$title = trim($body['title'] ?? '');
$description = trim($body['description'] ?? '');
$assigneeIds = normalize_assignee_ids($body['assigned_to'] ?? ($body['assigned_to_ids'] ?? []));
$priority = strtoupper(trim($body['priority'] ?? 'MEDIUM'));
$dueDate = $body['due_date'] ?? null;

$allowedPriorities = ['LOW', 'MEDIUM', 'HIGH'];

if ($title === '') {
    json_response(['error' => 'Title is required'], 422);
}

if (!$assigneeIds) {
    json_response(['error' => 'Select at least one person to assign'], 422);
}

if (!in_array($priority, $allowedPriorities, true)) {
    json_response(['error' => 'Invalid priority'], 422);
}

if ($dueDate === '') {
    $dueDate = null;
}

if ($dueDate !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dueDate)) {
    json_response(['error' => 'Due date must be YYYY-MM-DD'], 422);
}

assert_users_exist($assigneeIds);

$primaryAssignee = $assigneeIds[0];

$stmt = db()->prepare(
    'INSERT INTO activities
      (title, description, assigned_to, assigned_by, priority, due_date, status)
     VALUES
      (:title, :description, :assigned_to, :assigned_by, :priority, :due_date, \'PENDING\')'
);

$stmt->execute([
    'title' => $title,
    'description' => $description !== '' ? $description : null,
    'assigned_to' => $primaryAssignee,
    'assigned_by' => (int) $user['id'],
    'priority' => $priority,
    'due_date' => $dueDate,
]);

$newId = (int) db()->lastInsertId();
save_activity_assignees($newId, $assigneeIds);

$row = fetch_activity_for_user($newId, (int) $user['id']);

json_response(['activity' => format_activity($row)], 201);
