/* AppointmentsTab.jsx
   Lists appointments (each linked to a lead), filterable by status. You can
   change an appointment's status inline, edit its note, and delete it. The
   linked lead's name and contact are shown via the populated `lead`. */
import { useEffect, useState } from 'react';
import { api } from '../api';
import { APPOINTMENT_STATUSES, APPT_STATUS_COLOR } from '../lib/constants';

export default function AppointmentsTab() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  async function load() {
    setLoading(true);
    try {
      const { appointments } = await api(
        '/appointments' + (filter !== 'All' ? '?status=' + encodeURIComponent(filter) : '')
      );
      setAppts(appointments);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function update(id, patch) {
    const { appointment } = await api('/appointments/' + id, { method: 'PUT', body: patch });
    setAppts((a) => a.map((x) => (x._id === id ? appointment : x)));
  }

  async function remove(id) {
    if (!confirm('Delete this appointment?')) return;
    await api('/appointments/' + id, { method: 'DELETE' });
    setAppts((a) => a.filter((x) => x._id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-slate-500">Filter:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option>All</option>
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-3">Lead</th>
                <th className="p-3">Contact</th>
                <th className="p-3">When</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a._id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">
                    {a.lead ? a.lead.name : <span className="text-slate-400">(deleted lead)</span>}
                  </td>
                  <td className="p-3">
                    {a.lead && (
                      <>
                        <div>{a.lead.phone}</div>
                        <div className="text-slate-400">{a.lead.email}</div>
                      </>
                    )}
                  </td>
                  <td className="p-3">
                    {a.datetime ? (
                      new Date(a.datetime).toLocaleString()
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <select
                      value={a.status}
                      onChange={(e) => update(a._id, { status: e.target.value })}
                      className={'rounded px-2 py-1 font-medium ' + (APPT_STATUS_COLOR[a.status] || '')}
                    >
                      {APPOINTMENT_STATUSES.map((s) => (
                        <option key={s} className="bg-white text-slate-800">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="max-w-xs p-3 text-slate-500">
                    <input
                      defaultValue={a.notes}
                      onBlur={(e) => e.target.value !== a.notes && update(a._id, { notes: e.target.value })}
                      placeholder="Add a note…"
                      className="w-full rounded border border-slate-200 px-2 py-1"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove(a._id)} className="text-slate-400 hover:text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {appts.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No appointments. Assign one from the Leads tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
