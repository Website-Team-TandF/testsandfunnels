// backend/controllers/leadController.js
// Leads Controller with MongoDB + storage fallback

const fs = require('fs');
const path = require('path');
const Lead = require('../models/Lead');
const { getDBStatus } = require('../config/db');

const FALLBACK_FILE = path.join(__dirname, '..', 'data', 'leads.json');

// Helper for local file fallback
function getFallbackLeads() {
  try {
    if (!fs.existsSync(FALLBACK_FILE)) return [];
    return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveFallbackLeads(leads) {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(leads, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write fallback leads:', e);
  }
}

// 1. Submit Lead (Public API)
exports.submitLead = async (req, res) => {
  try {
    const data = req.body || {};

    const name = (data.name || data.full_name || '').trim();
    const phone = (data.phone || data.mobile || data.whatsapp || '').trim();
    const email = (data.email || '').trim();

    if (!name && !phone && !email) {
      return res.status(422).json({
        success: false,
        error: 'Please provide at least a name, email, or phone number.'
      });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const cleanIp = ip.split(',')[0].trim();

    const leadPayload = {
      name: name || 'Anonymous',
      phone,
      email,
      form_type: data.form_type || 'General Inquiry',
      industry: data.industry || '',
      monthly_ad_spend: data.monthly_ad_spend || '',
      website: data.website || data.company || '',
      message: data.message || data.notes || '',
      source_page: data.page_url || req.headers.referer || '',
      ip_address: cleanIp,
      status: 'New',
      admin_notes: '',
      raw_data: data
    };

    let savedId = null;

    if (getDBStatus()) {
      try {
        const newLead = await Lead.create(leadPayload);
        savedId = newLead._id;
      } catch (dbErr) {
        console.warn('DB write failed, writing to fallback storage:', dbErr.message);
      }
    }

    // Always keep fallback storage synced
    const fallbackLeads = getFallbackLeads();
    const fallbackRecord = {
      id: savedId ? savedId.toString() : 'lead_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...leadPayload
    };
    fallbackLeads.unshift(fallbackRecord);
    saveFallbackLeads(fallbackLeads);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your request has been received.',
      id: savedId || fallbackRecord.id
    });
  } catch (err) {
    console.error('Error submitting lead:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process lead submission.'
    });
  }
};

// 2. Get All Leads with search & filters (Protected)
exports.getLeads = async (req, res) => {
  try {
    const { status, type, search } = req.query;

    if (getDBStatus()) {
      try {
        const query = {};

        if (status && status !== 'All') {
          query.status = status;
        }
        if (type && type !== 'All') {
          query.form_type = type;
        }
        if (search) {
          const sRegex = new RegExp(search, 'i');
          query.$or = [
            { name: sRegex },
            { phone: sRegex },
            { email: sRegex },
            { industry: sRegex },
            { message: sRegex },
            { admin_notes: sRegex }
          ];
        }

        const leads = await Lead.find(query).sort({ createdAt: -1 });
        return res.json({
          success: true,
          count: leads.length,
          leads
        });
      } catch (e) {
        console.warn('DB find failed, falling back to local file storage');
      }
    }

    // Fallback file handling
    let leads = getFallbackLeads();

    if (status && status !== 'All') {
      leads = leads.filter(l => (l.status || '').toLowerCase() === status.toLowerCase());
    }
    if (type && type !== 'All') {
      leads = leads.filter(l => (l.form_type || '').toLowerCase() === type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(l => {
        const blob = `${l.name} ${l.phone} ${l.email} ${l.industry} ${l.message} ${l.admin_notes}`.toLowerCase();
        return blob.includes(q);
      });
    }

    return res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Get Leads Statistics (Protected)
exports.getLeadStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (getDBStatus()) {
      try {
        const total = await Lead.countDocuments();
        const newLeads = await Lead.countDocuments({ status: 'New' });
        const converted = await Lead.countDocuments({ status: 'Converted' });
        const todayCount = await Lead.countDocuments({ createdAt: { $gte: today } });

        return res.json({
          success: true,
          stats: { total, newLeads, converted, todayCount }
        });
      } catch (e) {
        // Fall through to fallback
      }
    }

    const leads = getFallbackLeads();
    const todayStr = new Date().toISOString().substring(0, 10);

    let total = leads.length;
    let newLeads = 0;
    let converted = 0;
    let todayCount = 0;

    leads.forEach(l => {
      const s = (l.status || 'New').toLowerCase();
      if (s === 'new') newLeads++;
      if (s === 'converted') converted++;
      if (l.created_at && l.created_at.startsWith(todayStr)) todayCount++;
    });

    return res.json({
      success: true,
      stats: { total, newLeads, converted, todayCount }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 4. Update Lead Status / Notes (Protected)
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (getDBStatus()) {
      try {
        const updated = await Lead.findByIdAndUpdate(
          id,
          { ...(status && { status }), ...(admin_notes !== undefined && { admin_notes }) },
          { new: true }
        );
        if (updated) {
          return res.json({ success: true, lead: updated });
        }
      } catch (e) {}
    }

    // Fallback file handling
    const leads = getFallbackLeads();
    const lead = leads.find(l => (l.id === id || l._id === id));
    if (lead) {
      if (status) lead.status = status;
      if (admin_notes !== undefined) lead.admin_notes = admin_notes;
      lead.updated_at = new Date().toISOString();
      saveFallbackLeads(leads);
      return res.json({ success: true, lead });
    }

    return res.status(404).json({ success: false, error: 'Lead not found' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 5. Delete Lead (Protected)
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      try {
        await Lead.findByIdAndDelete(id);
      } catch (e) {}
    }

    let leads = getFallbackLeads();
    leads = leads.filter(l => (l.id !== id && l._id !== id));
    saveFallbackLeads(leads);

    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 6. Export CSV (Protected)
exports.exportCSV = async (req, res) => {
  try {
    let leads = [];
    if (getDBStatus()) {
      try {
        leads = await Lead.find().sort({ createdAt: -1 });
      } catch (e) {
        leads = getFallbackLeads();
      }
    } else {
      leads = getFallbackLeads();
    }

    const headers = [
      'Lead ID', 'Date & Time', 'Name', 'Phone', 'Email', 'Form Type',
      'Industry', 'Monthly Ad Spend', 'Website', 'Message', 'Source Page',
      'Status', 'Admin Notes', 'IP Address'
    ];

    const rows = leads.map(l => [
      l._id ? l._id.toString() : (l.id || ''),
      l.createdAt ? l.createdAt.toISOString().replace('T', ' ').substring(0, 19) : (l.created_at || ''),
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.form_type || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.monthly_ad_spend || '').replace(/"/g, '""')}"`,
      `"${(l.website || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${(l.source_page || '').replace(/"/g, '""')}"`,
      `"${(l.status || 'New').replace(/"/g, '""')}"`,
      `"${(l.admin_notes || '').replace(/"/g, '""')}"`,
      `"${(l.ip_address || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename="testsandfunnels_leads_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
