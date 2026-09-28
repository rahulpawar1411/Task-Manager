<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/activity_helpers.php';

function format_update(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'activity_id' => (int) $row['activity_id'],
        'user_id' => (int) $row['user_id'],
        'user_name' => $row['user_name'] ?? null,
        'user_role' => $row['user_role'] ?? null,
        'message' => $row['message'],
        'update_type' => $row['update_type'],
        'old_status' => $row['old_status'],
        'new_status' => $row['new_status'],
        'created_at' => $row['created_at'],
    ];
}

function add_activity_update(
    int $activityId,
    int $userId,
    string $message,
    string $type = 'COMMENT',
    ?string $oldStatus = null,
    ?string $newStatus = null
): array {
    $stmt = db()->prepare(
        'INSERT INTO activity_updates
          (activity_id, user_id, message, update_type, old_status, new_status)
         VALUES
          (:activity_id, :user_id, :message, :update_type, :old_status, :new_status)'
    );
    $stmt->execute([
        'activity_id' => $activityId,
        'user_id' => $userId,
        'message' => $message,
        'update_type' => $type,
        'old_status' => $oldStatus,
        'new_status' => $newStatus,
    ]);

    $id = (int) db()->lastInsertId();
    $fetch = db()->prepare(
        'SELECT u.*, usr.name AS user_name, usr.role AS user_role
         FROM activity_updates u
         INNER JOIN users usr ON usr.id = u.user_id
         WHERE u.id = :id
         LIMIT 1'
    );
    $fetch->execute(['id' => $id]);
    return format_update($fetch->fetch());
}

function list_activity_updates(int $activityId): array
{
    $stmt = db()->prepare(
        'SELECT u.*, usr.name AS user_name, usr.role AS user_role
         FROM activity_updates u
         INNER JOIN users usr ON usr.id = u.user_id
         WHERE u.activity_id = :activity_id
         ORDER BY u.created_at ASC, u.id ASC'
    );
    $stmt->execute(['activity_id' => $activityId]);
    return array_map('format_update', $stmt->fetchAll());
}
