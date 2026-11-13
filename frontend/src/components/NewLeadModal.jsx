/* NewLeadModal.jsx — add a lead by hand. Posts to /api/leads with
   source "Dashboard" so it is distinguishable from website submissions. */
import { useState } from 'react';
import { api } from '../api';
import Modal from './Modal.jsx';

export default function NewLeadModal({ onClose, onCreated }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', industry: '', message: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api('/leads', { method: 'POST', body: { ...f, source: 'Dashboard' } });
      onCreated();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="New lead" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {['name', 'phone', 'email', 'industry'].map((k) => (
          <div key={k}>
            <label className="block text-sm font-medium capitalize">{k}</label>
            <input
              value={f[k]}
              onChange={set(k)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            value={f.message}
            onChange={set('message')}
            rows="2"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? '…' : 'Create lead'}
        </button>
      </form>
    </Modal>
  );
}
