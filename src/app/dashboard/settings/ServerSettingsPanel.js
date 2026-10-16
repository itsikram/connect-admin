'use client';

import { useEffect, useState } from 'react';
import adminApi from '../../../lib/api';

const inputClass =
  'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
const smallButton =
  'px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300 disabled:opacity-40';

const URL_PATTERN = /^https:\/\/[A-Za-z0-9.-]+(?::\d{1,5})?(?:\/[A-Za-z0-9._~/-]*)?$/;
const cleanUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const emptySettings = {
  mode: 'multi',
  servers: [],
  singleServerUrl: '',
  strategy: 'random',
  downCooldownSeconds: 60,
  updatedAt: null,
};

/** Settings → Servers: which live servers the web and Expo apps use. */
export default function ServerSettingsPanel({ setMessage }) {
  const [settings, setSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState({});
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const flash = (type, text) => {
    setMessage({ type, text });
    if (type === 'success') setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const apply = (data = {}) =>
    setSettings({
      ...emptySettings,
      ...data,
      servers: Array.isArray(data.servers) ? data.servers : [],
      singleServerUrl: data.singleServerUrl || '',
    });

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/server-settings');
        apply(res.data);
      } catch (error) {
        flash('error', error.response?.data?.message || 'Failed to load server settings');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));

  const updateServer = (index, field, value) =>
    setSettings((prev) => ({
      ...prev,
      servers: prev.servers.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));

  const moveServer = (index, delta) =>
    setSettings((prev) => {
      const servers = [...prev.servers];
      const target = index + delta;
      if (target < 0 || target >= servers.length) return prev;
      [servers[index], servers[target]] = [servers[target], servers[index]];
      return { ...prev, servers };
    });

  const removeServer = (index) =>
    setSettings((prev) => {
      const removed = prev.servers[index];
      return {
        ...prev,
        servers: prev.servers.filter((_, i) => i !== index),
        singleServerUrl: prev.singleServerUrl === removed?.url ? '' : prev.singleServerUrl,
      };
    });

  const addServer = () => {
    const url = cleanUrl(newUrl);
    if (!URL_PATTERN.test(url)) {
      flash('error', 'Enter a full https:// server address, e.g. https://connect-server-abcd.onrender.com');
      return;
    }
    if (settings.servers.some((s) => s.url === url)) {
      flash('error', 'That server is already in the list.');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      servers: [...prev.servers, { url, label: newLabel.trim(), enabled: true }],
    }));
    setNewUrl('');
    setNewLabel('');
  };

  const checkServers = async () => {
    setChecking(true);
    try {
      const urls = [
        ...settings.servers.map((s) => s.url),
        settings.singleServerUrl,
      ].filter(Boolean);
      const res = await adminApi.post('/server-settings/check', { urls }, { timeout: 30000 });
      const next = {};
      (res.data?.results || []).forEach((r) => {
        next[r.url] = r;
      });
      setHealth(next);
    } catch (error) {
      flash('error', error.response?.data?.message || 'Health check failed');
    } finally {
      setChecking(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await adminApi.put('/server-settings', {
        mode: settings.mode,
        servers: settings.servers,
        singleServerUrl: settings.singleServerUrl,
        strategy: settings.strategy,
        downCooldownSeconds: Number(settings.downCooldownSeconds),
      });
      apply(res.data);
      flash(
        'success',
        settings.mode === 'single'
          ? `Saved. Apps now use only ${res.data?.singleServerUrl}.`
          : `Saved. Apps now use ${res.data?.clientConfig?.serverUrls?.length || 0} server(s) with automatic failover.`,
      );
    } catch (error) {
      flash('error', error.response?.data?.message || 'Failed to save server settings');
    } finally {
      setSaving(false);
    }
  };

  const healthBadge = (url) => {
    const r = health[url];
    if (!r) return null;
    if (!r.ok) {
      return (
        <span className="text-xs font-medium text-red-600 dark:text-red-400">
          Down{r.error ? ` (${r.error})` : r.status ? ` (HTTP ${r.status})` : ''}
        </span>
      );
    }
    return (
      <span className="text-xs font-medium text-green-600 dark:text-green-400">
        Up · {r.ms} ms
        {!r.hasServerConfig && (
          <span className="ml-1 text-amber-600 dark:text-amber-400">(old build — deploy to read these settings)</span>
        )}
      </span>
    );
  };

  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading server settings…</p>;
  }

  const enabledCount = settings.servers.filter((s) => s.enabled).length;
  const singleIsCustom =
    settings.singleServerUrl && !settings.servers.some((s) => s.url === settings.singleServerUrl);

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Choose which live servers the web and Expo apps connect to. Apps pick up a change within a few
        minutes (connected apps right away) and remember it, so they keep working if the server they
        loaded it from goes down.
      </p>

      {/* Mode */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">Server mode</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              id: 'multi',
              title: 'Multiple servers',
              text: 'Apps spread across every enabled server and switch to the next one at once when theirs is down.',
            },
            {
              id: 'single',
              title: 'Single server',
              text: 'Every app uses one server only. No failover: if it is down, the apps are down.',
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => update('mode', item.id)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                settings.mode === item.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
              }`}
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.text}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Server list */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Server addresses{' '}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({enabledCount} of {settings.servers.length} enabled)
            </span>
          </h4>
          <button
            type="button"
            onClick={checkServers}
            disabled={checking || (!settings.servers.length && !settings.singleServerUrl)}
            className="px-3 py-2 rounded-lg border border-indigo-300 text-indigo-700 dark:text-indigo-200 dark:border-indigo-700 text-sm font-medium disabled:opacity-50"
          >
            {checking ? 'Checking…' : 'Check servers'}
          </button>
        </div>

        <div className="space-y-2">
          {settings.servers.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No servers yet. Add one below.</p>
          )}
          {settings.servers.map((server, index) => (
            <div
              key={server.url}
              className={`rounded-lg border p-3 ${
                server.enabled
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-dashed border-gray-300 dark:border-gray-600 opacity-70'
              }`}
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <span className="w-6 text-xs text-gray-400">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-sm text-gray-900 dark:text-white">{server.url}</div>
                  <div className="mt-1">{healthBadge(server.url)}</div>
                </div>
                <input
                  value={server.label || ''}
                  onChange={(e) => updateServer(index, 'label', e.target.value)}
                  placeholder="Label (optional)"
                  className={`${inputClass} sm:w-40`}
                />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={server.enabled}
                    onChange={(e) => updateServer(index, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  Enabled
                </label>
                <div className="flex gap-1">
                  <button type="button" className={smallButton} onClick={() => moveServer(index, -1)} disabled={index === 0} title="Move up">↑</button>
                  <button type="button" className={smallButton} onClick={() => moveServer(index, 1)} disabled={index === settings.servers.length - 1} title="Move down">↓</button>
                  <button type="button" className={`${smallButton} text-red-600 dark:text-red-400`} onClick={() => removeServer(index)} title="Remove">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addServer()}
            placeholder="https://connect-server-xxxx.onrender.com"
            className={`${inputClass} flex-1 font-mono`}
          />
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addServer()}
            placeholder="Label (optional)"
            className={`${inputClass} sm:w-40`}
          />
          <button
            type="button"
            onClick={addServer}
            className="px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-600 text-white text-sm font-medium"
          >
            Add server
          </button>
        </div>
      </div>

      {/* Single server choice */}
      {settings.mode === 'single' && (
        <div className="space-y-2">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">Server to use</h4>
          <select
            value={singleIsCustom ? '__custom__' : settings.singleServerUrl}
            onChange={(e) => update('singleServerUrl', e.target.value === '__custom__' ? 'https://' : e.target.value)}
            className={inputClass}
          >
            <option value="">Pick a server…</option>
            {settings.servers.map((s) => (
              <option key={s.url} value={s.url}>
                {s.label ? `${s.label} — ${s.url}` : s.url}
              </option>
            ))}
            <option value="__custom__">Other address…</option>
          </select>
          {singleIsCustom && (
            <input
              value={settings.singleServerUrl}
              onChange={(e) => update('singleServerUrl', e.target.value)}
              placeholder="https://..."
              className={`${inputClass} font-mono`}
            />
          )}
          {settings.singleServerUrl && <div>{healthBadge(cleanUrl(settings.singleServerUrl))}</div>}
        </div>
      )}

      {/* Multi-server behaviour */}
      {settings.mode === 'multi' && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">Multi-server behaviour</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">How apps pick a server</label>
              <select
                value={settings.strategy}
                onChange={(e) => update('strategy', e.target.value)}
                className={inputClass}
              >
                <option value="random">Spread load — each app sticks to a random server</option>
                <option value="priority">Priority — use the first healthy server in list order</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Skip a failed server for (seconds)
              </label>
              <input
                type="number"
                min={5}
                max={3600}
                value={settings.downCooldownSeconds}
                onChange={(e) => update('downCooldownSeconds', e.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                After a server fails, apps avoid it for this long before trying it again.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {settings.updatedAt ? `Last saved ${new Date(settings.updatedAt).toLocaleString()}` : 'Using the built-in defaults (never saved).'}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save server settings'}
        </button>
      </div>
    </div>
  );
}
