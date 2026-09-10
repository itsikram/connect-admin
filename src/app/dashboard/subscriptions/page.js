'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

const formatDate = (value) => {
  if (!value) return 'No expiry';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No expiry' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const planName = (tier) => tier === 'plus_pro' ? 'Plus Pro' : tier === 'plus_basic' ? 'Plus Basic' : 'No plan';

export default function SubscriptionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('all');
  const [tier, setTier] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [granting, setGranting] = useState(null);
  const [grantForm, setGrantForm] = useState({ tier: 'plus_basic', durationDays: 30 });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscriptions', { params: { status, tier, search: search.trim() || undefined } });
      setUsers(response.data?.users || []);
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to load subscription members.' });
    } finally {
      setLoading(false);
    }
  }, [search, status, tier]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const activeCount = useMemo(() => users.filter((user) => user.subscriptionStatus === 'active').length, [users]);
  const expiringCount = useMemo(() => users.filter((user) => {
    if (user.subscriptionStatus !== 'active' || !user.subscriptionExpiresAt) return false;
    const days = (new Date(user.subscriptionExpiresAt) - Date.now()) / 86400000;
    return days >= 0 && days <= 7;
  }).length, [users]);

  const openGrant = (user) => {
    setGranting(user);
    setGrantForm({ tier: user.subscriptionTier === 'plus_pro' ? 'plus_pro' : 'plus_basic', durationDays: 30 });
    setMessage({ type: '', text: '' });
  };

  const grant = async () => {
    if (!granting) return;
    setBusyId(granting._id);
    try {
      await api.post(`/subscriptions/${granting._id}/grant`, grantForm);
      setGranting(null);
      setMessage({ type: 'success', text: `Complimentary ${planName(grantForm.tier)} access applied to ${granting.email}.` });
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to grant subscription.' });
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (user) => {
    if (!window.confirm(`Remove subscription access for ${user.email}?`)) return;
    setBusyId(user._id);
    try {
      await api.post(`/subscriptions/${user._id}/revoke`);
      setMessage({ type: 'success', text: 'Subscription access removed.' });
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to remove subscription.' });
    } finally {
      setBusyId(null);
    }
  };

  const statusClass = (value) => value === 'active'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    : value === 'expired' ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
      : 'bg-slate-100 text-slate-600 ring-slate-500/20';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex">
        <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <button type="button" className="rounded-lg p-2 text-slate-600 lg:hidden dark:text-slate-300" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">☰</button>
              <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Revenue operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Subscription members</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage paid access and grant complimentary plans without a payment.</p></div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[['Members shown', users.length, 'All matching accounts'], ['Active access', activeCount, 'Currently entitled'], ['Expiring soon', expiringCount, 'Next 7 days']].map(([label, value, detail]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{loading ? '—' : value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>)}
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 lg:flex-row">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or username" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" aria-label="Search members" />
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" aria-label="Filter by status"><option value="all">All members</option><option value="active">Active</option><option value="expired">Expired</option><option value="none">Never subscribed</option><option value="cancelled">Cancelled</option></select>
                <select value={tier} onChange={(event) => setTier(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" aria-label="Filter by plan"><option value="all">All plans</option><option value="plus_basic">Plus Basic</option><option value="plus_pro">Plus Pro</option></select>
              </div>
            </section>

            {message.text ? <div role={message.type === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{message.text}</div> : null}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">Access directory</h2><p className="mt-1 text-xs text-slate-500">Granting access extends an existing active subscription instead of replacing it.</p></div>
              {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading members…</div> : users.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No members match these filters.</div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800"><thead className="bg-slate-50 dark:bg-slate-800/60"><tr>{['Member', 'Plan', 'Status', 'Expires', 'Action'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{users.map((user) => <tr key={user._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"><td className="whitespace-nowrap px-5 py-4"><p className="text-sm font-semibold text-slate-900 dark:text-white">{[user.firstName, user.surname].filter(Boolean).join(' ') || 'Unnamed member'}</p><p className="text-xs text-slate-500">{user.email}</p></td><td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{planName(user.subscriptionTier)}</td><td className="whitespace-nowrap px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(user.subscriptionStatus)}`}>{user.subscriptionStatus || 'none'}</span></td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(user.subscriptionExpiresAt)}</td><td className="whitespace-nowrap px-5 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => openGrant(user)} disabled={busyId === user._id} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{user.subscriptionStatus === 'active' ? 'Extend access' : 'Grant access'}</button>{user.subscriptionStatus === 'active' ? <button type="button" onClick={() => revoke(user)} disabled={busyId === user._id} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-slate-800">Revoke</button> : null}</div></td></tr>)}</tbody></table></div>}
            </section>
          </div>
        </main>

        {granting ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Complimentary access</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Grant a subscription</h2><p className="mt-1 text-sm text-slate-500">{granting.email}</p></div><button type="button" onClick={() => setGranting(null)} className="text-2xl leading-none text-slate-400" aria-label="Close">×</button></div><div className="mt-6 space-y-4"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plan<select value={grantForm.tier} onChange={(event) => setGrantForm((current) => ({ ...current, tier: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option value="plus_basic">Plus Basic</option><option value="plus_pro">Plus Pro</option></select></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duration (days)<input type="number" min="1" max="3650" value={grantForm.durationDays} onChange={(event) => setGrantForm((current) => ({ ...current, durationDays: Number(event.target.value) }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setGranting(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300">Cancel</button><button type="button" onClick={grant} disabled={busyId === granting._id} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{busyId === granting._id ? 'Applying…' : 'Apply access'}</button></div></div></div> : null}
      </div>
    </ProtectedRoute>
  );
}
