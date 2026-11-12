<?php
// backend/api/update.php
// Update status or notes of a lead (authenticated)

header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config.php';
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: $_POST;

$id = $data['id'] ?? '';
if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Lead ID required']);
    exit;
}

$leads = getLeads();
$found = false;

foreach ($leads as &$lead) {
    if ($lead['id'] === $id) {
        if (isset($data['status'])) {
            $lead['status'] = htmlspecialchars(trim($data['status']), ENT_QUOTES, 'UTF-8');
        }
        if (isset($data['admin_notes'])) {
            $lead['admin_notes'] = htmlspecialchars(trim($data['admin_notes']), ENT_QUOTES, 'UTF-8');
        }
        $lead['updated_at'] = date('Y-m-d H:i:s');
        $found = true;
        break;
    }
}

if (!$found) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Lead not found']);
    exit;
}

if (!saveLeads($leads)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save changes']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Lead updated successfully']);

