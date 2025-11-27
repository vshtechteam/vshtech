<?php
// Serve JS through PHP to avoid exposing the raw .js file directly.
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';

header('Content-Type: application/javascript; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// Only allow the real payload when the request comes from your domain.
if (strpos($referer, 'https://vshtech.online/') === 0) {
    $realFile = __DIR__ . '/key.js';
    if (is_readable($realFile)) {
        readfile($realFile);
        exit;
    }
    echo "// Real key.js is missing on the server.\n";
    exit;
}

// Fake / fallback response for disallowed referrers.
echo "// Fake key.js\n";
echo "console.log('Fake key loaded');\n";
