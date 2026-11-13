/* AssignModal.jsx
   Turns a lead into an appointment. Posts to /api/appointments with the lead's
   id, a date/time, an initial status and notes. After this the appointment
   shows in the Appointments tab with the lead's details attached. */
import { useState } from 'react';
import { api } from '../api';
import Modal from './Modal.jsx';
import { APPOINTMENT_STATUSES } from '../lib/constants';

export default function AssignModal({ lead, onClose, onAssigned }) {
  const [datetime, setDatetime] = useState('');
  const [status, setStatus] = useState('Interested');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api('/appointments', {
        method: 'POST',
        body: { leadId: lead._id, datetime: datetime || null, status, notes },
      });
      onAssigned();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={'Assign appointment — ' + lead.name} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          {lead.phone || 'no phone'} · {lead.email || 'no email'}
        </div>
        <div>
          <label className="block text-sm font-medium">Date &amp; time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          >
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="2"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? '…' : 'Create appointment'}
        </button>
      </form>
    </Modal>
  );
}
