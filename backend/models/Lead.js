/* Lead.js
   A potential client. Created either by a website form submission or by hand in
   the dashboard. A lead can later be linked to one or more Appointments. */
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    source: { type: String, default: 'Website', trim: true }, // form type, or "Dashboard"
    industry: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Discussion', 'Converted', 'Closed'],
      default: 'New',
    },
    notes: { type: String, default: '' },
    sourcePage: { type: String, default: '' },
    raw: { type: mongoose.Schema.Types.Mixed, default: {} }, // full original payload
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', LeadSchema);
