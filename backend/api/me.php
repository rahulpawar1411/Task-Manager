<?php

require_once __DIR__ . '/../helpers.php';

$user = require_auth();

json_response([
    'user' => [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ],
]);
