<?php
// backend/config.php
// Configuration & security helper for tests&funnels Leads Manager

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('DATA_DIR', __DIR__ . '/data');
define('DATA_FILE', DATA_DIR . '/leads.json');

// Admin credentials (customize these as needed)
define('ADMIN_USER', 'admin');
// Default password: admin@tandf2026 (BCrypt hashed)
define('ADMIN_PASS_HASH', '$2y$10$UoW089qfN1cEfgP5Wv6fEehN7J2lB8aRzN73bT1U9.5U2F1wI2xCe');
// Plain text fallback if password_verify isn't used:
define('ADMIN_PASS_DEFAULT', 'admin@tandf2026');

// Notification email (optional, set to your email to receive lead alerts)
define('NOTIFY_EMAIL', 'admin@testsandfunnels.com');
define('ENABLE_EMAIL_NOTIFICATION', false);

// Helper to check authentication
function isAuthenticated() {
    return !empty($_SESSION['tf_admin_logged_in']);
}

function requireAuth() {
    if (!isAuthenticated()) {
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        header('Location: /backend/index.php');
        exit;
    }
}

// Read leads from storage safely
function getLeads() {
    if (!file_exists(DATA_FILE)) {
        return [];
    }
    $content = file_get_contents(DATA_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

// Save leads atomically
function saveLeads($leads) {
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }
    $tmpFile = DATA_FILE . '.tmp';
    $json = json_encode(array_values($leads), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (file_put_contents($tmpFile, $json, LOCK_EX) !== false) {
        return rename($tmpFile, DATA_FILE);
    }
    return false;
}

