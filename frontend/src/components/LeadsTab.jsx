/* LeadsTab.jsx
   Shows every lead (website form submissions + manually added). You can search,
   add a new lead, change a lead's status inline, assign a lead to an appointment
   (which makes it appear in the Appointments tab), and delete. */
import { useEffect, useState } from 'react';
import { api } from '../api';
import { LEAD_STATUSES } from '../lib/constants';
import NewLeadModal from './NewLeadModal.jsx';
import AssignModal from './AssignModal.jsx';

export default function LeadsTab({ onAssigned }) {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [assignLead, setAssignLead] = useState(null); // the lead being assigned, or null

  async function load() {
    setLoading(true);
    try {
      const { leads } = await api('/leads' + (search ? '?search=' + encodeURIComponent(search) : ''));
      setLeads(leads);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id, status) {
    await api('/leads/' + id, { method: 'PUT', body: { status } });
    setLeads((ls) => ls.map((l) => (l._id === id ? { ...l, status } : l)));
  }

  async function remove(id) {
    if (!confirm('Delete this lead?')) return;
    await api('/leads/' + id, { method: 'DELETE' });
    setLeads((ls) => ls.filter((l) => l._id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex-1"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </form>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          + New lead
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Message</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l._id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{l.name}</td>
                  <td className="p-3">
                    <div>{l.phone}</div>
                    <div className="text-slate-400">{l.email}</div>
                  </td>
                  <td className="p-3">{l.source}</td>
                  <td className="p-3">
                    <select
                      value={l.status}
                      onChange={(e) => updateStatus(l._id, e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="max-w-xs truncate p-3 text-slate-500">{l.message}</td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <button
                      onClick={() => setAssignLead(l)}
                      className="mr-2 rounded bg-indigo-50 px-2 py-1 font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      Assign
                    </button>
                    <button onClick={() => remove(l._id)} className="text-slate-400 hover:text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No leads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NewLeadModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            load();
          }}
        />
      )}
      {assignLead && (
        <AssignModal
          lead={assignLead}
          onClose={() => setAssignLead(null)}
          onAssigned={() => {
            setAssignLead(null);
            onAssigned && onAssigned();
          }}
        />
      )}
    </div>
  );
}
