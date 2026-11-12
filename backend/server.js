// backend/server.js
// Standalone zero-dependency Node.js server for local testing of Tests&Funnels website & Leads Dashboard
// Run locally with: node backend/server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(__dirname, 'data', 'leads.json');

// Ensure data dir exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function getLeads() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveLeads(leads) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // 1. LEAD SUBMIT API (accepts both /backend/api/submit and /backend/api/submit.php)
  if (req.method === 'POST' && (pathname === '/backend/api/submit' || pathname === '/backend/api/submit.php')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data = {};
      try {
        data = JSON.parse(body);
      } catch (e) {
        // Fallback to urlencoded
        const qs = new URLSearchParams(body);
        for (const [k, v] of qs.entries()) data[k] = v;
      }

      const name = data.name || data.full_name || 'Anonymous';
      const phone = data.phone || data.mobile || data.whatsapp || '';
      const email = data.email || '';

      const newLead = {
        id: 'lead_' + Math.random().toString(36).substring(2, 10),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        name: name,
        phone: phone,
        email: email,
        form_type: data.form_type || 'General Inquiry',
        industry: data.industry || '',
        monthly_ad_spend: data.monthly_ad_spend || '',
        website: data.website || data.company || '',
        message: data.message || data.notes || '',
        source_page: data.page_url || req.headers['referer'] || '',
        ip_address: req.socket.remoteAddress || '127.0.0.1',
        status: 'New',
        admin_notes: '',
        raw_data: data
      };

      const leads = getLeads();
      leads.unshift(newLead);
      saveLeads(leads);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Thank you! Your request has been received.',
        id: newLead.id
      }));
    });
    return;
  }

  // 2. GET LEADS API
  if (pathname === '/backend/api/leads' || pathname === '/backend/api/leads.php') {
    const leads = getLeads();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, total: leads.length, leads }));
  }

  // 3. UPDATE LEAD API
  if (req.method === 'POST' && (pathname === '/backend/api/update' || pathname === '/backend/api/update.php')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch (e) {}
      const leads = getLeads();
      const lead = leads.find(l => l.id === data.id);
      if (lead) {
        if (data.status) lead.status = data.status;
        if (data.admin_notes !== undefined) lead.admin_notes = data.admin_notes;
        saveLeads(leads);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true }));
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Not found' }));
    });
    return;
  }

  // 4. DELETE LEAD API
  if (req.method === 'POST' && (pathname === '/backend/api/delete' || pathname === '/backend/api/delete.php')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch (e) {}
      let leads = getLeads();
      leads = leads.filter(l => l.id !== data.id);
      saveLeads(leads);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // 5. EXPORT CSV
  if (pathname === '/backend/api/export' || pathname === '/backend/api/export.php') {
    const leads = getLeads();
    const rows = [
      ['Lead ID', 'Date & Time', 'Name', 'Phone', 'Email', 'Form Type', 'Industry', 'Monthly Ad Spend', 'Website', 'Message', 'Source Page', 'Status', 'Admin Notes', 'IP Address']
    ];
    leads.forEach(l => {
      rows.push([
        l.id || '', l.created_at || '', l.name || '', l.phone || '', l.email || '',
        l.form_type || '', l.industry || '', l.monthly_ad_spend || '', l.website || '',
        (l.message || '').replace(/"/g, '""'), l.source_page || '', l.status || 'New',
        (l.admin_notes || '').replace(/"/g, '""'), l.ip_address || ''
      ]);
    });
    const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=UTF-8',
      'Content-Disposition': `attachment; filename="leads_export_${Date.now()}.csv"`
    });
    return res.end(csvContent);
  }

  // 6. DASHBOARD (serve backend/index.html or simulated backend/index.php)
  if (pathname === '/backend' || pathname === '/backend/' || pathname === '/backend/index.php') {
    const dashboardHtmlPath = path.join(__dirname, 'dashboard.html');
    if (fs.existsSync(dashboardHtmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      return res.end(fs.readFileSync(dashboardHtmlPath));
    }
  }

  // 7. STATIC FILES SERVING (Website pages)
  let filePath = path.join(ROOT_DIR, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Tests&Funnels Local Server & Leads Backend Started!`);
  console.log(`------------------------------------------------------`);
  console.log(`🌐 Website:   http://localhost:${PORT}/`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/backend/`);
  console.log(`📬 Submit API: http://localhost:${PORT}/backend/api/submit.php`);
  console.log(`======================================================\n`);
});
