/* constants.js — status lists shared by the tabs. Keep in sync with the enums
   in backend/models/Lead.js and backend/models/Appointment.js. */
export const LEAD_STATUSES = ['New', 'Contacted', 'In Discussion', 'Converted', 'Closed'];

export const APPOINTMENT_STATUSES = [
  'Interested',
  'Not interested',
  'Call later',
  'Scheduled',
  'Converted',
  'Closed',
];

/* Badge colours for appointment statuses (Tailwind classes). */
export const APPT_STATUS_COLOR = {
  Interested: 'bg-green-100 text-green-700',
  'Not interested': 'bg-red-100 text-red-700',
  'Call later': 'bg-amber-100 text-amber-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  Converted: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-200 text-slate-600',
};
