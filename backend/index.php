<?php
// backend/index.php
// Tests&Funnels Admin Leads Dashboard

require_once __DIR__ . '/config.php';

$loginError = '';

// Handle Logout
if (isset($_GET['logout'])) {
    unset($_SESSION['tf_admin_logged_in']);
    session_destroy();
    header('Location: /backend/index.php');
    exit;
}

// Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    $validUser = ($username === ADMIN_USER);
    $validPass = ($password === ADMIN_PASS_DEFAULT || password_verify($password, ADMIN_PASS_HASH));

    if ($validUser && $validPass) {
        $_SESSION['tf_admin_logged_in'] = true;
        $_SESSION['tf_admin_user'] = $username;
        header('Location: /backend/index.php');
        exit;
    } else {
        $loginError = 'Invalid username or password. Please try again.';
    }
}

// -------------------------------------------------------------
// 1. RENDER LOGIN SCREEN IF NOT AUTHENTICATED
// -------------------------------------------------------------
if (!isAuthenticated()) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login &bull; tests&amp;funnels Leads Dashboard</title>
  <style>
    :root {
      --bg: #090d16;
      --card: #121829;
      --border: #232d4b;
      --text: #f0f4fc;
      --muted: #8b99b5;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --accent: #06b6d4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      background: radial-gradient(circle at 50% 20%, #17213d 0%, var(--bg) 70%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .login-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .brand {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-align: center;
      margin-bottom: 0.5rem;
    }
    .brand span { color: var(--accent); }
    .subtitle {
      color: var(--muted);
      font-size: 0.9rem;
      text-align: center;
      margin-bottom: 2rem;
    }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 0.4rem; }
    input {
      width: 100%;
      padding: 0.85rem 1rem;
      background: #0b101d;
      border: 1px solid var(--border);
      border-radius: 10px;
      color: #fff;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
    }
    button {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.92; }
    .error-msg {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      text-align: center;
    }
    .hint {
      text-align: center;
      font-size: 0.78rem;
      color: var(--muted);
      margin-top: 1.5rem;
    }
    .hint code { background: #0b101d; padding: 0.2rem 0.4rem; border-radius: 4px; color: var(--accent); }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="brand"><span>tests</span>&amp;funnels</div>
    <div class="subtitle">Leads &amp; Inquiries Dashboard</div>

    <?php if ($loginError): ?>
      <div class="error-msg"><?= htmlspecialchars($loginError) ?></div>
    <?php endif; ?>

    <form method="POST" action="/backend/index.php">
      <input type="hidden" name="action" value="login">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required autocomplete="username" placeholder="admin" autofocus>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="••••••••••••">
      </div>
      <button type="submit">Sign In to Dashboard</button>
    </form>
    <div class="hint">Default: <code>admin</code> / <code>admin@tandf2026</code></div>
  </div>
</body>
</html>
<?php
exit;
}

// -------------------------------------------------------------
// 2. RENDER MAIN LEADS DASHBOARD (AUTHENTICATED)
// -------------------------------------------------------------
$leads = getLeads();

// Compute stats
$totalLeads = count($leads);
$newLeads = 0;
$todayLeads = 0;
$convertedLeads = 0;
$todayStr = date('Y-m-d');

foreach ($leads as $l) {
    $st = strtolower($l['status'] ?? 'new');
    if ($st === 'new') $newLeads++;
    if ($st === 'converted') $convertedLeads++;
    if (isset($l['created_at']) && strpos($l['created_at'], $todayStr) === 0) {
        $todayLeads++;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leads Dashboard &bull; tests&amp;funnels</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card: #131929;
      --card-hover: #172138;
      --border: #232e4d;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --primary: #6366f1;
      --accent: #06b6d4;
      --green: #10b981;
      --amber: #f59e0b;
      --red: #ef4444;
      --purple: #8b5cf6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: rgba(19, 25, 41, 0.95);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(10px);
      padding: 0.9rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .header-logo {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: #fff;
    }
    .header-logo span { color: var(--accent); }
    .header-badge {
      font-size: 0.72rem;
      font-weight: 700;
      background: rgba(99, 102, 241, 0.2);
      color: var(--primary);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary {
      background: #1e293b;
      color: var(--text);
      border-color: var(--border);
    }
    .btn-secondary:hover { background: #334155; }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.3); }
    .btn-wa {
      background: #25d366;
      color: #0b2212;
      font-weight: 700;
    }
    .btn-wa:hover { background: #1ebc59; }

    main {
      flex: 1;
      padding: 1.75rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    /* STATS GRID */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .stat-card::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    .stat-card.total::after { background: var(--primary); }
    .stat-card.new::after { background: var(--accent); }
    .stat-card.today::after { background: var(--amber); }
    .stat-card.conv::after { background: var(--green); }
    .stat-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      margin-bottom: 0.35rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    /* TOOLBAR */
    .toolbar {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      min-width: 250px;
    }
    .search-box input {
      width: 100%;
      padding: 0.55rem 0.85rem;
      background: #0b101d;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: #fff;
      font-size: 0.85rem;
    }
    .search-box input:focus { outline: none; border-color: var(--accent); }
    .filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    select {
      background: #0b101d;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.55rem 0.85rem;
      font-size: 0.85rem;
    }
    select:focus { outline: none; border-color: var(--accent); }

    /* TABLE */
    .table-container {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }
    th {
      background: #0e1424;
      padding: 0.85rem 1rem;
      color: var(--muted);
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid rgba(35, 46, 77, 0.6);
      vertical-align: middle;
    }
    tr:hover td { background: var(--card-hover); }
    .lead-name { font-weight: 700; color: #fff; font-size: 0.95rem; }
    .lead-meta { font-size: 0.78rem; color: var(--muted); margin-top: 0.2rem; }
    .contact-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }
    .contact-link:hover { text-decoration: underline; }
    .contact-links { display: flex; flex-direction: column; gap: 0.25rem; }

    /* BADGES */
    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .badge-new { background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); }
    .badge-contacted { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-discussion { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .badge-converted { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-closed { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }

    .tag {
      display: inline-block;
      background: #1e293b;
      color: var(--muted);
      border-radius: 4px;
      padding: 0.15rem 0.4rem;
      font-size: 0.72rem;
      font-weight: 600;
      margin-top: 0.2rem;
    }

    .empty-state {
      padding: 3.5rem 1rem;
      text-align: center;
      color: var(--muted);
    }
    .empty-state h3 { color: #fff; margin-bottom: 0.4rem; }

    /* MODAL DRAWER */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 50;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .modal-backdrop.open { display: flex; }
    .modal-box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 1.75rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }
    .modal-title { font-size: 1.2rem; font-weight: 800; color: #fff; }
    .modal-close {
      background: transparent;
      border: none;
      color: var(--muted);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      line-height: 1;
    }
    .modal-close:hover { color: #fff; }
    .detail-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.88rem;
    }
    .detail-label { color: var(--muted); font-weight: 600; }
    .detail-value { color: #fff; word-break: break-word; }
    .notes-textarea {
      width: 100%;
      padding: 0.75rem;
      background: #0b101d;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: #fff;
      font-size: 0.88rem;
      min-height: 90px;
      resize: vertical;
      margin-top: 0.4rem;
    }
    .notes-textarea:focus { outline: none; border-color: var(--accent); }
    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header>
    <a href="/backend/index.php" class="header-logo">
      <span>tests</span>&amp;funnels
      <span class="header-badge">Leads CRM</span>
    </a>
    <div class="header-actions">
      <a href="/backend/api/export.php" class="btn btn-secondary">
        ⬇ Export CSV
      </a>
      <a href="/backend/index.php?logout=1" class="btn btn-danger">
        Log Out
      </a>
    </div>
  </header>

  <main>
    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card total">
        <span class="stat-label">Total Leads</span>
        <span class="stat-value"><?= $totalLeads ?></span>
      </div>
      <div class="stat-card new">
        <span class="stat-label">New / Uncontacted</span>
        <span class="stat-value" style="color:#22d3ee;"><?= $newLeads ?></span>
      </div>
      <div class="stat-card today">
        <span class="stat-label">Received Today</span>
        <span class="stat-value" style="color:#fbbf24;"><?= $todayLeads ?></span>
      </div>
      <div class="stat-card conv">
        <span class="stat-label">Converted</span>
        <span class="stat-value" style="color:#34d399;"><?= $convertedLeads ?></span>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search by name, phone, email, industry, or notes..." onkeyup="filterLeads()">
      </div>
      <div class="filters">
        <select id="statusFilter" onchange="filterLeads()">
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="In Discussion">In Discussion</option>
          <option value="Converted">Converted</option>
          <option value="Closed">Closed</option>
        </select>
        <button class="btn btn-secondary" onclick="window.location.reload()">↻ Refresh</button>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-container">
      <table id="leadsTable">
        <thead>
          <tr>
            <th>Status</th>
            <th>Date &amp; Time</th>
            <th>Lead Info</th>
            <th>Contact Details</th>
            <th>Form Type &amp; Industry</th>
            <th>Message</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($leads)): ?>
            <tr id="emptyRow">
              <td colspan="7">
                <div class="empty-state">
                  <h3>No leads received yet</h3>
                  <p>When visitors fill out any form on tests&amp;funnels, they will automatically appear here.</p>
                </div>
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($leads as $l): 
              $st = $l['status'] ?? 'New';
              $badgeClass = 'badge-new';
              if (strtolower($st) === 'contacted') $badgeClass = 'badge-contacted';
              if (strtolower($st) === 'in discussion') $badgeClass = 'badge-discussion';
              if (strtolower($st) === 'converted') $badgeClass = 'badge-converted';
              if (strtolower($st) === 'closed') $badgeClass = 'badge-closed';

              $cleanPhone = preg_replace('/[^0-9]/', '', $l['phone'] ?? '');
              $waMsg = urlencode("Hi " . ($l['name'] ?? '') . ", thanks for contacting tests&funnels. How can we help you today?");
            ?>
              <tr class="lead-row" 
                  data-id="<?= htmlspecialchars($l['id'] ?? '') ?>"
                  data-status="<?= htmlspecialchars($st) ?>"
                  data-name="<?= htmlspecialchars($l['name'] ?? '') ?>"
                  data-phone="<?= htmlspecialchars($l['phone'] ?? '') ?>"
                  data-email="<?= htmlspecialchars($l['email'] ?? '') ?>"
                  data-industry="<?= htmlspecialchars($l['industry'] ?? '') ?>"
                  data-spend="<?= htmlspecialchars($l['monthly_ad_spend'] ?? '') ?>"
                  data-form="<?= htmlspecialchars($l['form_type'] ?? '') ?>"
                  data-notes="<?= htmlspecialchars($l['admin_notes'] ?? '') ?>"
                  data-message="<?= htmlspecialchars($l['message'] ?? '') ?>"
                  data-source="<?= htmlspecialchars($l['source_page'] ?? '') ?>"
                  data-ip="<?= htmlspecialchars($l['ip_address'] ?? '') ?>"
                  data-date="<?= htmlspecialchars($l['created_at'] ?? '') ?>">
                <td>
                  <span class="badge <?= $badgeClass ?>"><?= htmlspecialchars($st) ?></span>
                </td>
                <td style="white-space:nowrap; color:var(--muted); font-size:0.8rem;">
                  <?= htmlspecialchars($l['created_at'] ?? '') ?>
                </td>
                <td>
                  <div class="lead-name"><?= htmlspecialchars($l['name'] ?: 'Anonymous') ?></div>
                  <?php if (!empty($l['website'])): ?>
                    <div class="lead-meta"><?= htmlspecialchars($l['website']) ?></div>
                  <?php endif; ?>
                </td>
                <td>
                  <div class="contact-links">
                    <?php if (!empty($l['phone'])): ?>
                      <a href="tel:<?= htmlspecialchars($cleanPhone) ?>" class="contact-link">📞 <?= htmlspecialchars($l['phone']) ?></a>
                      <a href="https://wa.me/<?= $cleanPhone ?>?text=<?= $waMsg ?>" target="_blank" rel="noopener" class="contact-link" style="color:#25d366;">💬 WhatsApp</a>
                    <?php endif; ?>
                    <?php if (!empty($l['email'])): ?>
                      <a href="mailto:<?= htmlspecialchars($l['email']) ?>" class="contact-link" style="color:var(--muted);">✉ <?= htmlspecialchars($l['email']) ?></a>
                    <?php endif; ?>
                  </div>
                </td>
                <td>
                  <div style="font-weight:600;"><?= htmlspecialchars($l['form_type'] ?? 'Inquiry') ?></div>
                  <?php if (!empty($l['industry'])): ?>
                    <span class="tag"><?= htmlspecialchars($l['industry']) ?></span>
                  <?php endif; ?>
                  <?php if (!empty($l['monthly_ad_spend'])): ?>
                    <span class="tag">Spend: <?= htmlspecialchars($l['monthly_ad_spend']) ?></span>
                  <?php endif; ?>
                </td>
                <td style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--muted);">
                  <?= htmlspecialchars($l['message'] ?: '—') ?>
                </td>
                <td style="text-align:right; white-space:nowrap;">
                  <button class="btn btn-secondary" onclick="openLeadModal(this.closest('.lead-row'))">View Details</button>
                  <button class="btn btn-danger" onclick="deleteLead('<?= htmlspecialchars($l['id'] ?? '') ?>')">✕</button>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </main>

  <!-- LEAD DETAILS MODAL -->
  <div class="modal-backdrop" id="leadModal">
    <div class="modal-box">
      <div class="modal-header">
        <div class="modal-title" id="modalLeadName">Lead Details</div>
        <button class="modal-close" onclick="closeLeadModal()">&times;</button>
      </div>
      <div id="modalContent">
        <div class="detail-row"><div class="detail-label">Lead ID:</div><div class="detail-value" id="mId"></div></div>
        <div class="detail-row"><div class="detail-label">Created At:</div><div class="detail-value" id="mDate"></div></div>
        <div class="detail-row"><div class="detail-label">Phone:</div><div class="detail-value" id="mPhone"></div></div>
        <div class="detail-row"><div class="detail-label">Email:</div><div class="detail-value" id="mEmail"></div></div>
        <div class="detail-row"><div class="detail-label">Form Type:</div><div class="detail-value" id="mForm"></div></div>
        <div class="detail-row"><div class="detail-label">Industry:</div><div class="detail-value" id="mIndustry"></div></div>
        <div class="detail-row"><div class="detail-label">Ad Spend:</div><div class="detail-value" id="mSpend"></div></div>
        <div class="detail-row"><div class="detail-label">Message:</div><div class="detail-value" id="mMessage" style="white-space:pre-wrap;"></div></div>
        <div class="detail-row"><div class="detail-label">Source Page:</div><div class="detail-value" id="mSource"></div></div>
        <div class="detail-row"><div class="detail-label">Client IP:</div><div class="detail-value" id="mIp"></div></div>

        <div style="margin-top:1.25rem; border-top:1px solid var(--border); padding-top:1rem;">
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--muted); margin-bottom:0.4rem;">UPDATE STATUS</label>
          <select id="mStatusSelect" style="width:100%; margin-bottom:1rem;">
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Discussion">In Discussion</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
          </select>

          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--muted); margin-bottom:0.4rem;">ADMIN NOTES</label>
          <textarea id="mNotesInput" class="notes-textarea" placeholder="Add internal notes about calls, client preferences, proposal sent, etc..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeLeadModal()">Close</button>
        <button class="btn btn-primary" onclick="saveLeadChanges()">Save Changes</button>
      </div>
    </div>
  </div>

  <script>
    var currentLeadId = null;

    function filterLeads() {
      var q = (document.getElementById('searchInput').value || '').toLowerCase();
      var st = document.getElementById('statusFilter').value;
      var rows = document.querySelectorAll('.lead-row');

      rows.forEach(function (r) {
        var name = (r.getAttribute('data-name') || '').toLowerCase();
        var phone = (r.getAttribute('data-phone') || '').toLowerCase();
        var email = (r.getAttribute('data-email') || '').toLowerCase();
        var ind = (r.getAttribute('data-industry') || '').toLowerCase();
        var notes = (r.getAttribute('data-notes') || '').toLowerCase();
        var status = r.getAttribute('data-status') || '';

        var matchQ = !q || (name + ' ' + phone + ' ' + email + ' ' + ind + ' ' + notes).indexOf(q) !== -1;
        var matchSt = !st || status.toLowerCase() === st.toLowerCase();

        r.style.display = (matchQ && matchSt) ? '' : 'none';
      });
    }

    function openLeadModal(row) {
      currentLeadId = row.getAttribute('data-id');
      document.getElementById('modalLeadName').textContent = row.getAttribute('data-name') || 'Lead Details';
      document.getElementById('mId').textContent = currentLeadId;
      document.getElementById('mDate').textContent = row.getAttribute('data-date');
      document.getElementById('mPhone').innerHTML = row.getAttribute('data-phone') ? '<a href="tel:' + row.getAttribute('data-phone') + '" style="color:var(--accent);">' + row.getAttribute('data-phone') + '</a>' : '—';
      document.getElementById('mEmail').innerHTML = row.getAttribute('data-email') ? '<a href="mailto:' + row.getAttribute('data-email') + '" style="color:var(--accent);">' + row.getAttribute('data-email') + '</a>' : '—';
      document.getElementById('mForm').textContent = row.getAttribute('data-form') || '—';
      document.getElementById('mIndustry').textContent = row.getAttribute('data-industry') || '—';
      document.getElementById('mSpend').textContent = row.getAttribute('data-spend') || '—';
      document.getElementById('mMessage').textContent = row.getAttribute('data-message') || '—';
      document.getElementById('mSource').textContent = row.getAttribute('data-source') || '—';
      document.getElementById('mIp').textContent = row.getAttribute('data-ip') || '—';

      document.getElementById('mStatusSelect').value = row.getAttribute('data-status') || 'New';
      document.getElementById('mNotesInput').value = row.getAttribute('data-notes') || '';

      document.getElementById('leadModal').classList.add('open');
    }

    function closeLeadModal() {
      document.getElementById('leadModal').classList.remove('open');
    }

    function saveLeadChanges() {
      if (!currentLeadId) return;
      var newStatus = document.getElementById('mStatusSelect').value;
      var newNotes = document.getElementById('mNotesInput').value;

      fetch('/backend/api/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentLeadId, status: newStatus, admin_notes: newNotes })
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          alert('Lead updated successfully!');
          window.location.reload();
        } else {
          alert('Error: ' + (res.error || 'Failed to update'));
        }
      })
      .catch(function(err) {
        alert('Request failed');
      });
    }

    function deleteLead(id) {
      if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
      fetch('/backend/api/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          window.location.reload();
        } else {
          alert('Error: ' + (res.error || 'Failed to delete'));
        }
      })
      .catch(function(err) {
        alert('Request failed');
      });
    }
  </script>
</body>
</html>
