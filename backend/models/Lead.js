// backend/models/Lead.js
// Mongoose Schema for Tests&Funnels Leads

const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    form_type: {
      type: String,
      default: 'General Inquiry',
      trim: true
    },
    industry: {
      type: String,
      default: '',
      trim: true
    },
    monthly_ad_spend: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    message: {
      type: String,
      default: '',
      trim: true
    },
    source_page: {
      type: String,
      default: '',
      trim: true
    },
    ip_address: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Discussion', 'Converted', 'Closed'],
      default: 'New'
    },
    admin_notes: {
      type: String,
      default: '',
      trim: true
    },
    raw_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Virtual for clean formatted date
LeadSchema.virtual('formatted_date').get(function () {
  return this.createdAt ? this.createdAt.toISOString().replace('T', ' ').substring(0, 19) : '';
});

LeadSchema.set('toJSON', { virtuals: true });
LeadSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Lead', LeadSchema);

