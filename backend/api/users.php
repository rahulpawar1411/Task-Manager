<?php

require_once __DIR__ . '/../helpers.php';

$user = require_auth();

$stmt = db()->query(
    'SELECT id, name, email, role FROM users ORDER BY role ASC, name ASC'
);
$users = $stmt->fetchAll();

foreach ($users as &$row) {
    $row['id'] = (int) $row['id'];
}

json_response(['users' => $users]);
