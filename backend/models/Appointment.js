/* Appointment.js
   A scheduled follow-up with a Lead, plus where it sits in the pipeline.
   `lead` references the Lead document, so the Appointments tab can show the
   client's details by populating it. */
const mongoose = require('mongoose');

const APPOINTMENT_STATUSES = [
  'Interested',
  'Not interested',
  'Call later',
  'Scheduled',
  'Converted',
  'Closed',
];

const AppointmentSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    datetime: { type: Date, default: null },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: 'Scheduled' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', AppointmentSchema);
Appointment.STATUSES = APPOINTMENT_STATUSES; // reused by the status route/UI
module.exports = Appointment;
