<?php

require_once __DIR__ . '/../helpers.php';

$body = read_json_body();
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if ($email === '' || $password === '') {
    json_response(['error' => 'Email and password are required'], 422);
}

$stmt = db()->prepare('SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    json_response(['error' => 'Invalid email or password'], 401);
}

$token = bin2hex(random_bytes(32));
$expires = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

$insert = db()->prepare(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)'
);
$insert->execute([
    'user_id' => $user['id'],
    'token' => $token,
    'expires_at' => $expires,
]);

json_response([
    'token' => $token,
    'user' => [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ],
]);
