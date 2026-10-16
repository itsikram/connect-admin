'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminSidebar from '../../../components/AdminSidebar';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800';
const primaryButton = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50';
const smallButton = 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700';
const NAME_PATTERN = /^[a-z0-9_-]{1,32}$/i;

function Icon({ d, className = 'h-5 w-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} /></svg>;
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function UsageBar({ account }) {
  if (account.error) return <p className="text-xs font-medium text-red-600 dark:text-red-400">{account.error}</p>;
  if (!account.limit) return <p className="text-xs text-slate-500">Unlimited storage</p>;
  const percent = Math.min(100, Math.round((account.usage / account.limit) * 100));
  return <div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} /></div>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatBytes(account.free)} free of {formatBytes(account.limit)}</p>
  </div>;
}

export default function GoogleDrivePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ uploadsEnabled: null, clientId: '', clientSecret: '', publicBaseUrl: '' });
  const [saving, setSaving] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [busyAccount, setBusyAccount] = useState('');
  const [copied, setCopied] = useState(false);
  const { admin, logout } = useAuth();

  const apply = (data) => {
    setSettings(data);
    setForm({ uploadsEnabled: data.uploadsEnabled, clientId: data.clientId || '', clientSecret: '', publicBaseUrl: data.publicBaseUrl || '' });
    const used = new Set((data.accounts || []).map((a) => a.name));
    let n = 1;
    while (used.has(`drive${n}`)) n += 1;
    setAccountName(`drive${n}`);
  };

  const flash = (type, text) => {
    setNotice({ type, text });
    if (type === 'success') window.setTimeout(() => setNotice({ type: '', text: '' }), 6000);
  };

  const load = async () => {
    try {
      const { data } = await api.get('/gdrive');
      apply(data);
    } catch (error) {
      flash('error', error.response?.data?.message || 'Failed to load Google Drive settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Back from Google sign-in
    const params = new URLSearchParams(window.location.search);
    const result = params.get('gdrive');
    if (result === 'connected') flash('success', `Connected ${params.get('email') || params.get('account')}. All servers will use it within 30 seconds.`);
    if (result === 'error') flash('error', `Connecting failed: ${params.get('message') || 'unknown error'}`);
    if (result) window.history.replaceState(null, '', window.location.pathname);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/gdrive', form);
      apply(data);
      flash('success', 'Saved. All servers will use the new settings within 30 seconds.');
    } catch (error) {
      flash('error', error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const connect = async (event) => {
    event.preventDefault();
    const name = accountName.trim();
    if (!NAME_PATTERN.test(name)) return flash('error', 'Name must be 1-32 letters, numbers, - or _');
    if (settings.accounts.some((a) => a.name === name) && !window.confirm(`"${name}" exists. Reconnect it with a Google account? Use the same Google account, or its existing files will stop loading.`)) return;
    setConnecting(true);
    try {
      const { data } = await api.post('/gdrive/connect', { name, returnTo: `${window.location.origin}${window.location.pathname}` });
      window.location.href = data.url;
    } catch (error) {
      flash('error', error.response?.data?.message || 'Failed to start Google sign-in');
      setConnecting(false);
    }
  };

  const toggleAccount = async (account) => {
    setBusyAccount(account.name);
    try {
      const { data } = await api.patch(`/gdrive/accounts/${encodeURIComponent(account.name)}`, { enabled: !account.enabled });
      apply(data);
      flash('success', account.enabled ? `${account.name} no longer receives new uploads. Its files still load.` : `${account.name} receives new uploads again.`);
    } catch (error) {
      flash('error', error.response?.data?.message || 'Failed to update account');
    } finally {
      setBusyAccount('');
    }
  };

  const removeAccount = async (account) => {
    if (!window.confirm(`Remove ${account.name} (${account.email || 'Google account'})?\n\nEvery photo, video and voice note stored on it will stop loading in the app. To only stop new uploads, use Disable instead.`)) return;
    setBusyAccount(account.name);
    try {
      const { data } = await api.delete(`/gdrive/accounts/${encodeURIComponent(account.name)}`);
      apply(data);
      flash('success', `${account.name} removed.`);
    } catch (error) {
      flash('error', error.response?.data?.message || 'Failed to remove account');
    } finally {
      setBusyAccount('');
    }
  };

  const copyRedirect = async () => {
    try {
      await navigator.clipboard.writeText(settings.redirectUri);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      flash('error', 'Copy failed; select the address and copy it manually.');
    }
  };

  const initials = admin?.fullName?.split(' ').map((part) => part[0]).join('').toUpperCase() || 'A';
  const totalFree = (settings?.accounts || []).filter((a) => a.enabled && !a.error).reduce((sum, a) => sum + (a.free || 0), 0);
  const modeValue = form.uploadsEnabled === null || form.uploadsEnabled === undefined ? 'env' : form.uploadsEnabled ? 'gdrive' : 'cloudinary';

  return <ProtectedRoute><div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
        <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><Icon d="M4 6h16M4 12h16M4 18h16" /><span className="sr-only">Open navigation</span></button>
        <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">Workspace <span className="text-slate-300">/</span> <b className="text-slate-800 dark:text-slate-200">Google Drive</b></div>
        <div className="flex items-center gap-3"><div className="h-6 w-px bg-slate-200 dark:bg-slate-700" /><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{initials}</div><span className="hidden text-sm font-medium text-slate-700 sm:block dark:text-slate-200">{admin?.fullName || 'Admin'}</span><button type="button" onClick={logout} className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white">Log out</button></div></div>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Google Drive storage</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Store user uploads in Google Drive accounts. Changes reach every live server within 30 seconds; no .env edit or redeploy needed.</p>
        </div>

        {notice.text && <div className={`rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'}`}>{notice.text}</div>}

        {loading ? <p className="text-sm text-slate-500">Loading…</p> : settings && <>
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5 ${settings.active ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950' : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'}`}>
            <div>
              <p className={`text-sm font-semibold ${settings.active ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>{settings.active ? 'New uploads go to Google Drive' : 'New uploads go to Cloudinary'}</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{settings.active ? `${settings.accounts.filter((a) => a.enabled).length} active account(s), ${formatBytes(totalFree)} free in total` : !settings.clientConfigured ? 'Add an OAuth client below to get started.' : !settings.accounts.some((a) => a.enabled) ? 'Connect a Google account below.' : 'Google Drive is switched off below.'}</p>
            </div>
            <button type="button" onClick={load} className={smallButton}>Refresh</button>
          </div>

          <section className={cardClass}>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Google accounts</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">New files go to the enabled account with the most free space. Files are saved in a <code>connect-uploads</code> folder in each account.</p>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
              {settings.accounts.length === 0 && <p className="py-4 text-sm text-slate-500">No accounts connected yet.</p>}
              {settings.accounts.map((account) => <div key={account.name} className="flex flex-wrap items-center gap-4 py-4">
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{account.name} {!account.enabled && <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-700">Disabled</span>}{account.source === 'env' && <span className="ml-1 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-700 dark:bg-sky-900 dark:text-sky-300">from .env</span>}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{account.email || (account.source === 'env' ? 'Set in the server .env file' : '')}</p>
                </div>
                <div className="w-full sm:w-64"><UsageBar account={account} /></div>
                {account.source === 'admin' ? <div className="flex gap-2">
                  <button type="button" disabled={busyAccount === account.name} onClick={() => toggleAccount(account)} className={smallButton}>{account.enabled ? 'Disable' : 'Enable'}</button>
                  <button type="button" disabled={busyAccount === account.name} onClick={() => removeAccount(account)} className={`${smallButton} text-red-600 dark:text-red-400`}>Remove</button>
                </div> : <span className="text-xs text-slate-400">Edit in .env</span>}
              </div>)}
            </div>
            <form onSubmit={connect} className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
              <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Account name</span><input value={accountName} onChange={(e) => setAccountName(e.target.value)} maxLength={32} className={`${inputClass} w-48`} /></label>
              <button type="submit" disabled={connecting || !settings.clientConfigured} className={primaryButton}>{connecting ? 'Opening Google…' : 'Connect Google account'}</button>
              {!settings.clientConfigured && <p className="text-xs text-amber-600">Save the OAuth client below first.</p>}
              <p className="w-full text-xs text-slate-500 dark:text-slate-400">The name is saved in every file link, so it can never be renamed. If Google says the app is unverified, choose Advanced → Go to app.</p>
            </form>
          </section>

          <form onSubmit={save} className={`${cardClass} space-y-5`}>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Settings</h2>
            </div>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Where new uploads go</span>
              <select value={modeValue} onChange={(e) => setForm((f) => ({ ...f, uploadsEnabled: e.target.value === 'env' ? null : e.target.value === 'gdrive' }))} className={`${inputClass} sm:w-96`}>
                <option value="gdrive">Google Drive</option>
                <option value="cloudinary">Cloudinary</option>
                <option value="env">Follow server .env (MEDIA_STORAGE{settings.envMediaStorage ? `=${settings.envMediaStorage}` : ' not set'})</option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">OAuth client ID</span><input value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} placeholder={settings.envClient ? `Using .env: ${settings.envClient}` : '1234-abc.apps.googleusercontent.com'} autoComplete="off" className={inputClass} /></label>
              <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">OAuth client secret</span><input type="password" value={form.clientSecret} onChange={(e) => setForm((f) => ({ ...f, clientSecret: e.target.value }))} placeholder={settings.hasClientSecret ? 'Saved; leave blank to keep' : settings.envClient ? 'Using .env' : 'GOCSPX-…'} autoComplete="new-password" className={inputClass} /></label>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Authorized redirect URI</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">In Google Cloud Console → Google Auth Platform → Clients, use a <b>Web application</b> client and add this exact address under Authorized redirect URIs. Add one per server you open the admin panel through.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2"><code className="break-all rounded bg-white px-2 py-1 text-xs text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">{settings.redirectUri}</code><button type="button" onClick={copyRedirect} className={smallButton}>{copied ? 'Copied' : 'Copy'}</button></div>
            </div>

            <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Public base URL for file links (optional)</span>
              <input value={form.publicBaseUrl} onChange={(e) => setForm((f) => ({ ...f, publicBaseUrl: e.target.value }))} placeholder={settings.envPublicBaseUrl ? `Using .env: ${settings.envPublicBaseUrl}` : 'Empty: each server uses its own address'} className={`${inputClass} sm:w-96`} />
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">e.g. https://api.connect-bd.online. Saved in every new file link, so use an address that will not change.</span>
            </label>

            <div className="flex justify-end"><button type="submit" disabled={saving} className={primaryButton}>{saving ? 'Saving…' : 'Save settings'}</button></div>
          </form>
        </>}
      </div></main>
    </div>
  </div></ProtectedRoute>;
}
