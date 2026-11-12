<?php
// backend/api/export.php
// Export leads as a clean CSV file (authenticated)

require_once __DIR__ . '/../config.php';
requireAuth();

$leads = getLeads();

$filename = 'testsandfunnels_leads_' . date('Y-m-d_His') . '.csv';

header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

$output = fopen('php://output', 'w');

// UTF-8 BOM for Excel compatibility
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Header row
fputcsv($output, [
    'Lead ID',
    'Date & Time',
    'Name',
    'Phone',
    'Email',
    'Form Type',
    'Industry',
    'Monthly Ad Spend',
    'Website / Company',
    'Message',
    'Source Page',
    'Status',
    'Admin Notes',
    'IP Address'
]);

foreach ($leads as $l) {
    fputcsv($output, [
        $l['id'] ?? '',
        $l['created_at'] ?? '',
        $l['name'] ?? '',
        $l['phone'] ?? '',
        $l['email'] ?? '',
        $l['form_type'] ?? '',
        $l['industry'] ?? '',
        $l['monthly_ad_spend'] ?? '',
        $l['website'] ?? '',
        $l['message'] ?? '',
        $l['source_page'] ?? '',
        $l['status'] ?? 'New',
        $l['admin_notes'] ?? '',
        $l['ip_address'] ?? ''
    ]);
}

fclose($output);
exit;

