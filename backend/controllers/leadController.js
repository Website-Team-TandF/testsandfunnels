/* leadController.js
   Leads arrive two ways and both use createLead: the public website forms
   (no token) and the dashboard's "New lead" button (with a token). Listing,
   editing and deleting are admin-only. */
const Lead = require('../models/Lead');

/* POST /api/leads  (public) */
exports.createLead = async (req, res) => {
  try {
    const d = req.body || {};
    const name = (d.name || d.full_name || '').trim();
    const phone = (d.phone || d.mobile || d.whatsapp || '').trim();
    const email = (d.email || '').trim();
    if (!name && !phone && !email)
      return res.status(422).json({ error: 'Provide at least a name, phone or email.' });

    const lead = await Lead.create({
      name: name || 'Unknown',
      phone,
      email,
      source: d.source || d.form_type || 'Website',
      industry: d.industry || '',
      message: d.message || d.notes || '',
      sourcePage: d.source_page || d.page_url || req.headers.referer || '',
      raw: d,
    });
    res.status(201).json({ lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET /api/leads?search=&status=  (admin) */
exports.getLeads = async (req, res) => {
  try {
    const { search, status } = req.query;
    const q = {};
    if (status && status !== 'All') q.status = status;
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex metachars
      const r = new RegExp(safe, 'i');
      q.$or = [{ name: r }, { phone: r }, { email: r }, { industry: r }, { message: r }];
    }
    const leads = await Lead.find(q).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* PUT /api/leads/:id  (admin) */
exports.updateLead = async (req, res) => {
  try {
    const allowed = ['status', 'notes', 'name', 'phone', 'email', 'industry'];
    const set = {};
    for (const k of allowed) if (req.body[k] !== undefined) set[k] = req.body[k];
    const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: set }, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* DELETE /api/leads/:id  (admin) */
exports.deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
