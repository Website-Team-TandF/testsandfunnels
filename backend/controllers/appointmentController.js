/* appointmentController.js
   Appointments are follow-ups tied to a Lead. The dashboard creates them from
   the Leads tab ("Assign to appointment") or directly in the Appointments tab.
   Every response populates `lead` so the UI can show the client's details. */
const Appointment = require('../models/Appointment');

/* POST /api/appointments  { leadId, datetime?, status?, notes? }  (admin) */
exports.createAppointment = async (req, res) => {
  try {
    const { leadId, datetime, status, notes } = req.body || {};
    if (!leadId) return res.status(422).json({ error: 'leadId is required' });
    const appt = await Appointment.create({
      lead: leadId,
      datetime: datetime || null,
      status: status || 'Scheduled',
      notes: notes || '',
    });
    res.status(201).json({ appointment: await appt.populate('lead') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET /api/appointments?status=  (admin) */
exports.getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status && status !== 'All') q.status = status;
    const appointments = await Appointment.find(q)
      .populate('lead')
      .sort({ datetime: 1, createdAt: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* PUT /api/appointments/:id  { status?, datetime?, notes? }  (admin) */
exports.updateAppointment = async (req, res) => {
  try {
    const allowed = ['status', 'datetime', 'notes'];
    const set = {};
    for (const k of allowed) if (req.body[k] !== undefined) set[k] = req.body[k];
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { $set: set }, { new: true }).populate('lead');
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ appointment: appt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* DELETE /api/appointments/:id  (admin) */
exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
