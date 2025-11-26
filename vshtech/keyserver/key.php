<?php
// Lấy referer (nếu có)
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';

// Trả về kiểu nội dung JS
header('Content-Type: application/javascript; charset=UTF-8');

// Kiểm tra referer có phải từ domain của bạn không
if (strpos($referer, 'https://vshtech.online/') === 0) {
    // ===== CODE THẬT =====
    ?>
    // Real key.js
    console.log("Real key loaded");
    // Ví dụ:
    // const API_KEY = "abcd1234";
    <?php
} else {
    // ===== CODE GIẢ =====
    ?>
    // Fake key.js
    console.log("Fake key loaded");
    // Ở đây có thể để code fake hoặc rỗng
    <?php
}
