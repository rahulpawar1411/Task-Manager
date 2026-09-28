<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/activity_helpers.php';
require_once __DIR__ . '/update_helpers.php';

$user = require_auth();
$userId = (int) $user['id'];
$id = (int) ($_GET['id'] ?? 0);

$row = fetch_activity_for_user($id, $userId);
if (!$row) {
    json_response(['error' => 'Activity not found or access denied'], 404);
}

$formatted = format_activity($row);
$isAssigner = (int) $row['assigned_by'] === $userId;
$isAssignee = in_array($userId, $formatted['assigned_to_ids'], true);

$body = read_json_body();

$title = array_key_exists('title', $body) ? trim((string) $body['title']) : $row['title'];
$description = array_key_exists('description', $body)
    ? trim((string) $body['description'])
    : $row['description'];
$priority = array_key_exists('priority', $body)
    ? strtoupper(trim((string) $body['priority']))
    : $row['priority'];
$dueDate = array_key_exists('due_date', $body) ? $body['due_date'] : $row['due_date'];
$status = array_key_exists('status', $body)
    ? strtoupper(trim((string) $body['status']))
    : $row['status'];

$allowedPriorities = ['LOW', 'MEDIUM', 'HIGH'];
$allowedStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

if ($title === '') {
    json_response(['error' => 'Title is required'], 422);
}

if (!in_array($priority, $allowedPriorities, true)) {
    json_response(['error' => 'Invalid priority'], 422);
}

if (!in_array($status, $allowedStatuses, true)) {
    json_response(['error' => 'Invalid status'], 422);
}

if ($dueDate === '') {
    $dueDate = null;
}

if ($dueDate !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $dueDate)) {
    json_response(['error' => 'Due date must be YYYY-MM-DD'], 422);
}

$coreChanged =
    $title !== $row['title']
    || (string) $description !== (string) $row['description']
    || $priority !== $row['priority']
    || (string) $dueDate !== (string) $row['due_date'];

if ($coreChanged && !$isAssigner) {
    json_response(['error' => 'Only the assigner can update activity details'], 403);
}

if ($status !== $row['status'] && !$isAssigner && !$isAssignee) {
    json_response(['error' => 'Not allowed to update status'], 403);
}

$completionDate = $row['completion_date'];
if ($status === 'COMPLETED' && $row['status'] !== 'COMPLETED') {
    $completionDate = date('Y-m-d');
} elseif ($status !== 'COMPLETED') {
    $completionDate = null;
}

$stmt = db()->prepare(
    'UPDATE activities SET
        title = :title,
        description = :description,
        priority = :priority,
        due_date = :due_date,
        status = :status,
        completion_date = :completion_date
     WHERE id = :id'
);

$stmt->execute([
    'title' => $title,
    'description' => $description !== '' ? $description : null,
    'priority' => $priority,
    'due_date' => $dueDate,
    'status' => $status,
    'completion_date' => $completionDate,
    'id' => $id,
]);

if ($status !== $row['status']) {
    $statusNote = trim((string) ($body['status_note'] ?? ''));
    $message = $statusNote !== ''
        ? $statusNote
        : sprintf('Status changed from %s to %s.', $row['status'], $status);

    add_activity_update(
        $id,
        $userId,
        $message,
        'STATUS',
        $row['status'],
        $status
    );
}

$updated = fetch_activity_for_user($id, $userId);
json_response(['activity' => format_activity($updated)]);
