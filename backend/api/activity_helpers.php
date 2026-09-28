<?php

require_once __DIR__ . '/../helpers.php';

function user_can_see_activity_sql(): string
{
    return '(a.assigned_by = :uid
            OR EXISTS (
              SELECT 1 FROM activity_assignees aa
              WHERE aa.activity_id = a.id AND aa.user_id = :uid2
            ))';
}

function get_activity_assignees(int $activityId): array
{
    $stmt = db()->prepare(
        'SELECT u.id, u.name, u.email, u.role
         FROM activity_assignees aa
         INNER JOIN users u ON u.id = aa.user_id
         WHERE aa.activity_id = :activity_id
         ORDER BY u.name ASC'
    );
    $stmt->execute(['activity_id' => $activityId]);
    $rows = $stmt->fetchAll();

    return array_map(static function (array $row): array {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'role' => $row['role'],
        ];
    }, $rows);
}

function attach_assignees(array $row): array
{
    $assignees = get_activity_assignees((int) $row['id']);
    $names = array_map(static fn(array $a): string => $a['name'], $assignees);

    $row['assignees'] = $assignees;
    $row['assigned_to_ids'] = array_map(static fn(array $a): int => $a['id'], $assignees);
    $row['assigned_to_name'] = $names ? implode(', ', $names) : ($row['assigned_to_name'] ?? null);

    return $row;
}

function format_activity(array $row): array
{
    $row = attach_assignees($row);

    return [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'assigned_to' => (int) $row['assigned_to'],
        'assigned_to_ids' => $row['assigned_to_ids'],
        'assignees' => $row['assignees'],
        'assigned_by' => (int) $row['assigned_by'],
        'assigned_to_name' => $row['assigned_to_name'] ?? null,
        'assigned_by_name' => $row['assigned_by_name'] ?? null,
        'priority' => $row['priority'],
        'due_date' => $row['due_date'],
        'status' => $row['status'],
        'completion_date' => $row['completion_date'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

function fetch_activity_for_user(int $id, int $userId): ?array
{
    $sql = 'SELECT a.*,
                   b.name AS assigned_by_name
            FROM activities a
            INNER JOIN users b ON b.id = a.assigned_by
            WHERE a.id = :id
              AND (a.assigned_by = :uid
                   OR EXISTS (
                     SELECT 1 FROM activity_assignees aa
                     WHERE aa.activity_id = a.id AND aa.user_id = :uid2
                   ))
            LIMIT 1';

    $stmt = db()->prepare($sql);
    $stmt->execute([
        'id' => $id,
        'uid' => $userId,
        'uid2' => $userId,
    ]);

    $row = $stmt->fetch();
    return $row ?: null;
}

function save_activity_assignees(int $activityId, array $userIds): void
{
    $delete = db()->prepare('DELETE FROM activity_assignees WHERE activity_id = :activity_id');
    $delete->execute(['activity_id' => $activityId]);

    $insert = db()->prepare(
        'INSERT INTO activity_assignees (activity_id, user_id) VALUES (:activity_id, :user_id)'
    );

    foreach ($userIds as $userId) {
        $insert->execute([
            'activity_id' => $activityId,
            'user_id' => $userId,
        ]);
    }
}

function normalize_assignee_ids($raw): array
{
    if ($raw === null) {
        return [];
    }

    if (!is_array($raw)) {
        $raw = [$raw];
    }

    $ids = [];
    foreach ($raw as $value) {
        $id = (int) $value;
        if ($id > 0) {
            $ids[] = $id;
        }
    }

    return array_values(array_unique($ids));
}

function assert_users_exist(array $userIds): void
{
    if (!$userIds) {
        return;
    }

    $placeholders = implode(',', array_fill(0, count($userIds), '?'));
    $stmt = db()->prepare("SELECT id FROM users WHERE id IN ($placeholders)");
    $stmt->execute($userIds);
    $found = array_map('intval', array_column($stmt->fetchAll(), 'id'));

    if (count($found) !== count($userIds)) {
        json_response(['error' => 'One or more assigned users were not found'], 404);
    }
}
