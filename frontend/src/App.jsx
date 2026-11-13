/* App.jsx
   Top-level shell: checks for a valid token, shows the Login screen if missing,
   otherwise the dashboard with the two tabs (Leads, Appointments). */
import { useEffect, useState } from 'react';
import { api, getToken, clearToken } from './api';
import Login from './components/Login.jsx';
import LeadsTab from './components/LeadsTab.jsx';
import AppointmentsTab from './components/AppointmentsTab.jsx';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState('leads');

  /* On load, confirm any stored token is still valid. */
  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    api('/auth/verify')
      .then(() => setAuthed(true))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="p-10 text-slate-500">Loading…</div>;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="text-lg font-extrabold">
          tests<span className="text-indigo-600">&</span>funnels
          <span className="ml-2 font-medium text-slate-400">CRM</span>
        </div>
        <button
          onClick={() => {
            clearToken();
            setAuthed(false);
          }}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Log out
        </button>
      </header>

      <nav className="flex gap-1 border-b border-slate-200 bg-white px-4">
        {[
          ['leads', 'Leads'],
          ['appointments', 'Appointments'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              'border-b-2 px-4 py-3 text-sm font-semibold ' +
              (tab === key
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800')
            }
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-6xl p-6">
        {tab === 'leads' ? (
          /* After assigning a lead, jump to the Appointments tab so the user
             sees it land there. */
          <LeadsTab onAssigned={() => setTab('appointments')} />
        ) : (
          <AppointmentsTab />
        )}
      </main>
    </div>
  );
}
