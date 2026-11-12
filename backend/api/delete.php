<?php
// backend/api/delete.php
// Delete a lead (authenticated)

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
$origCount = count($leads);

$leads = array_filter($leads, function ($l) use ($id) {
    return $l['id'] !== $id;
});

if (count($leads) === $origCount) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Lead not found']);
    exit;
}

if (!saveLeads($leads)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to delete lead']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Lead deleted successfully']);
