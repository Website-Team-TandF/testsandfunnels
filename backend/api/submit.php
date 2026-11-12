<?php
// backend/api/submit.php
// Public endpoint for tests&funnels frontend forms

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

require_once __DIR__ . '/../config.php';

// Parse payload (either JSON or POST form)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data) || empty($data)) {
    $data = $_POST;
}

if (empty($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No form data submitted.']);
    exit;
}

// Clean & sanitize inputs
function cleanInput($val) {
    if (is_array($val)) {
        return array_map('cleanInput', $val);
    }
    return htmlspecialchars(trim((string)$val), ENT_QUOTES, 'UTF-8');
}

$sanitized = [];
foreach ($data as $k => $v) {
    $sanitized[cleanInput($k)] = cleanInput($v);
}

// Validate that at least one contact method exists (phone or email or name)
$name  = $sanitized['name'] ?? ($sanitized['full_name'] ?? '');
$email = $sanitized['email'] ?? '';
$phone = $sanitized['phone'] ?? ($sanitized['mobile'] ?? ($sanitized['whatsapp'] ?? ''));

if (empty($name) && empty($email) && empty($phone)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Please provide at least a name, email, or phone number.']);
    exit;
}

// Create new lead record
$leadId = 'lead_' . bin2hex(random_bytes(6));
$now = date('Y-m-d H:i:s');

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] 
    ?? $_SERVER['HTTP_X_FORWARDED_FOR'] 
    ?? $_SERVER['REMOTE_ADDR'] 
    ?? 'unknown';

if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

$leadRecord = [
    'id'               => $leadId,
    'created_at'       => $now,
    'name'             => $name ?: 'Anonymous',
    'phone'            => $phone,
    'email'            => $email,
    'form_type'        => $sanitized['form_type'] ?? 'General Inquiry',
    'industry'         => $sanitized['industry'] ?? '',
    'monthly_ad_spend' => $sanitized['monthly_ad_spend'] ?? '',
    'website'          => $sanitized['website'] ?? ($sanitized['company'] ?? ''),
    'message'          => $sanitized['message'] ?? ($sanitized['notes'] ?? ''),
    'source_page'      => $sanitized['page_url'] ?? ($_SERVER['HTTP_REFERER'] ?? ''),
    'ip_address'       => $ip,
    'status'           => 'New',
    'admin_notes'      => '',
    'raw_data'         => $sanitized
];

// Append to storage
$leads = getLeads();
array_unshift($leads, $leadRecord); // newest first

if (!saveLeads($leads)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save lead record.']);
    exit;
}

// Optional Email Notification
if (ENABLE_EMAIL_NOTIFICATION && !empty(NOTIFY_EMAIL)) {
    $subject = "🎯 New Lead: {$leadRecord['name']} ({$leadRecord['form_type']})";
    $body = "New lead submitted on tests&funnels:\n\n"
          . "Name: {$leadRecord['name']}\n"
          . "Phone: {$leadRecord['phone']}\n"
          . "Email: {$leadRecord['email']}\n"
          . "Form Type: {$leadRecord['form_type']}\n"
          . "Industry: {$leadRecord['industry']}\n"
          . "Ad Spend: {$leadRecord['monthly_ad_spend']}\n"
          . "Message: {$leadRecord['message']}\n"
          . "Page: {$leadRecord['source_page']}\n"
          . "Time: {$now}\n";
    @mail(NOTIFY_EMAIL, $subject, $body, "From: no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'testsandfunnels.com'));
}

echo json_encode([
    'success' => true,
    'message' => 'Thank you! Your request has been received.',
    'id'      => $leadId
]);
