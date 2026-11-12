<?php
// backend/api/leads.php
// Returns leads list (authenticated)

header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../config.php';
requireAuth();

$leads = getLeads();

$q = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
$status = isset($_GET['status']) ? trim($_GET['status']) : '';
$formType = isset($_GET['type']) ? trim($_GET['type']) : '';

if ($q !== '' || $status !== '' || $formType !== '') {
    $leads = array_filter($leads, function ($l) use ($q, $status, $formType) {
        if ($status !== '' && strtolower($l['status'] ?? '') !== strtolower($status)) {
            return false;
        }
        if ($formType !== '' && strtolower($l['form_type'] ?? '') !== strtolower($formType)) {
            return false;
        }
        if ($q !== '') {
            $searchBlob = strtolower(($l['name'] ?? '') . ' ' . ($l['email'] ?? '') . ' ' . ($l['phone'] ?? '') . ' ' . ($l['industry'] ?? '') . ' ' . ($l['message'] ?? ''));
            if (strpos($searchBlob, $q) === false) {
                return false;
            }
        }
        return true;
    });
}

echo json_encode([
    'success' => true,
    'total'   => count($leads),
    'leads'   => array_values($leads)
]);
