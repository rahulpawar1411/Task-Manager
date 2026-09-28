<?php

require_once __DIR__ . '/helpers.php';

cors();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = '/backend';

// Support running from /backend or document root
if (strpos($uri, $base) === 0) {
    $path = substr($uri, strlen($base)) ?: '/';
} else {
    $path = $uri;
}

$path = '/' . trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Normalize empty path
if ($path === '/') {
    json_response([
        'name' => 'Founders Activity API',
        'version' => '1.0',
        'endpoints' => [
            'POST /api/login',
            'POST /api/logout',
            'GET /api/me',
            'GET /api/users',
            'GET /api/activities',
            'POST /api/activities',
            'GET /api/activities/{id}',
            'PATCH /api/activities/{id}',
        ],
    ]);
}

if ($path === '/api/login' && $method === 'POST') {
    require __DIR__ . '/api/login.php';
}

if ($path === '/api/logout' && $method === 'POST') {
    require __DIR__ . '/api/logout.php';
}

if ($path === '/api/me' && $method === 'GET') {
    require __DIR__ . '/api/me.php';
}

if ($path === '/api/users' && $method === 'GET') {
    require __DIR__ . '/api/users.php';
}

if ($path === '/api/activities' && $method === 'GET') {
    require __DIR__ . '/api/activities_list.php';
}

if ($path === '/api/activities' && $method === 'POST') {
    require __DIR__ . '/api/activities_create.php';
}

if (preg_match('#^/api/activities/(\d+)$#', $path, $m)) {
    $_GET['id'] = (int) $m[1];
    if ($method === 'GET') {
        require __DIR__ . '/api/activities_get.php';
    }
    if ($method === 'PATCH' || $method === 'PUT') {
        require __DIR__ . '/api/activities_update.php';
    }
}

if (preg_match('#^/api/activities/(\d+)/updates$#', $path, $m)) {
    $_GET['id'] = (int) $m[1];
    if ($method === 'GET') {
        require __DIR__ . '/api/updates_list.php';
    }
    if ($method === 'POST') {
        require __DIR__ . '/api/updates_create.php';
    }
}

json_response(['error' => 'Not found', 'path' => $path], 404);
