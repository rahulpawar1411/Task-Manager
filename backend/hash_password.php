<?php
/**
 * One-time helper: generate a password hash.
 * Usage: php hash_password.php password
 */
$password = $argv[1] ?? 'password';
echo password_hash($password, PASSWORD_DEFAULT) . PHP_EOL;
