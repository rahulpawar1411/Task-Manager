<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/activity_helpers.php';

$user = require_auth();
$userId = (int) $user['id'];

$sql = 'SELECT a.*,
               b.name AS assigned_by_name
        FROM activities a
        INNER JOIN users b ON b.id = a.assigned_by
        WHERE a.assigned_by = :uid
           OR EXISTS (
             SELECT 1 FROM activity_assignees aa
             WHERE aa.activity_id = a.id AND aa.user_id = :uid2
           )
        ORDER BY
          FIELD(a.status, \'PENDING\', \'IN_PROGRESS\', \'COMPLETED\'),
          FIELD(a.priority, \'HIGH\', \'MEDIUM\', \'LOW\'),
          a.due_date IS NULL, a.due_date ASC,
          a.created_at DESC';

$stmt = db()->prepare($sql);
$stmt->execute(['uid' => $userId, 'uid2' => $userId]);
$rows = $stmt->fetchAll();

$activities = array_map('format_activity', $rows);

json_response(['activities' => $activities]);
