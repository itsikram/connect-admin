'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

const FLAG_LABELS = {
  subscriptionEnabled: 'Connect+ subscriptions',
  walletEnabled: 'Wallet and coins',
  fitnessCoachingUpsellEnabled: 'Fitness coaching upsell',
  tippingEnabled: 'Creator tipping',
  affiliateLinksEnabled: 'Affiliate links',
  manualPaymentEnabled: 'Manual bKash/Nagad payments',
};

const DEFAULTS = {
  featureFlags: Object.fromEntries(Object.keys(FLAG_LABELS).map((key) => [key, false])),
  paymentNumbers: { bkash: '', nagad: '' },
  subscriptionTiers: {
    plus_basic: { priceBDT: 49, durationDays: 30, enabled: true },
    plus_pro: { priceBDT: 149, durationDays: 30, enabled: true },
  },
  coinPacks: [
    { coins: 100, priceBDT: 99, enabled: true },
    { coins: 500, priceBDT: 449, enabled: true },
    { coins: 1000, priceBDT: 799, enabled: true },
  ],
  tipping: { platformFeePercent: 20 },
};

export default function MonetizationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let mounted = true;
    api.get('/monetization/settings')
      .then((response) => { if (mounted) setSettings((current) => ({ ...current, ...response.data.settings })); })
      .catch((error) => { if (mounted) setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to load monetization settings.' }); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const updateFlag = (name, value) => setSettings((current) => ({ ...current, featureFlags: { ...current.featureFlags, [name]: value } }));
  const updateTier = (tier, field, value) => setSettings((current) => ({ ...current, subscriptionTiers: { ...current.subscriptionTiers, [tier]: { ...current.subscriptionTiers[tier], [field]: value } } }));
  const updatePack = (index, field, value) => setSettings((current) => ({ ...current, coinPacks: current.coinPacks.map((pack, packIndex) => packIndex === index ? { ...pack, [field]: value } : pack) }));

  const save = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.put('/monetization/settings', settings);
      setSettings(response.data.settings);
      setMessage({ type: 'success', text: 'Monetization settings saved. New public config is live immediately.' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to save monetization settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">
          <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-5 dark:border-gray-700 dark:bg-gray-800 sm:px-6 lg:px-8">
            <button type="button" className="rounded-lg p-2 text-gray-600 lg:hidden dark:text-gray-300" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">☰</button>
            <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monetization controls</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage rollout flags, pricing, payment numbers, coin packs, and tipping rules.</p></div>
          </header>
          <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            {message.text ? <div role={message.type === 'error' ? 'alert' : 'status'} className={`rounded-lg p-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div> : null}
            {loading ? <div className="rounded-xl bg-white p-8 text-center text-gray-500 dark:bg-gray-800">Loading settings…</div> : (
              <>
                <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"><h2 className="text-lg font-bold text-gray-900 dark:text-white">Feature flags</h2><p className="mt-1 text-sm text-gray-500">Turn each monetization feature on or off without an app redeploy.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(FLAG_LABELS).map(([name, label]) => <label key={name} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"><span className="text-sm text-gray-800 dark:text-gray-200">{label}</span><input type="checkbox" checked={Boolean(settings.featureFlags[name])} onChange={(event) => updateFlag(name, event.target.checked)} className="h-5 w-5 accent-indigo-600" /></label>)}</div></section>
                <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"><h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment instructions</h2><p className="mt-1 text-sm text-gray-500">These numbers are shown to users on the payment instructions screen.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{['bkash', 'nagad'].map((method) => <label key={method} className="text-sm font-semibold capitalize text-gray-700 dark:text-gray-200">{method} number<input value={settings.paymentNumbers[method] || ''} onChange={(event) => setSettings((current) => ({ ...current, paymentNumbers: { ...current.paymentNumbers, [method]: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="01XXXXXXXXX" /></label>)}</div></section>
                <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"><h2 className="text-lg font-bold text-gray-900 dark:text-white">Subscription pricing</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{Object.entries(settings.subscriptionTiers).map(([tier, value]) => <div key={tier} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><h3 className="font-semibold capitalize text-gray-900 dark:text-white">{tier.replace('_', ' ')}</h3><div className="mt-3 grid grid-cols-2 gap-3"><label className="text-xs text-gray-500">Price BDT<input type="number" min="0" value={value.priceBDT} onChange={(event) => updateTier(tier, 'priceBDT', Number(event.target.value))} className="mt-1 w-full rounded border px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" /></label><label className="text-xs text-gray-500">Duration days<input type="number" min="1" value={value.durationDays} onChange={(event) => updateTier(tier, 'durationDays', Number(event.target.value))} className="mt-1 w-full rounded border px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" /></label></div><label className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" checked={value.enabled} onChange={(event) => updateTier(tier, 'enabled', event.target.checked)} /> Available for purchase</label></div>)}</div></section>
                <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-gray-900 dark:text-white">Coin packs</h2><p className="text-sm text-gray-500">The approval flow uses the selected pack’s stored coin amount.</p></div><button type="button" onClick={() => setSettings((current) => ({ ...current, coinPacks: [...current.coinPacks, { coins: 100, priceBDT: 99, enabled: true }] }))} className="rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-700">Add pack</button></div><div className="mt-4 space-y-3">{settings.coinPacks.map((pack, index) => <div key={`${pack.coins}-${index}`} className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-3"><label className="text-xs text-gray-500">Coins<input type="number" min="1" value={pack.coins} onChange={(event) => updatePack(index, 'coins', Number(event.target.value))} className="mt-1 w-full rounded border px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" /></label><label className="text-xs text-gray-500">Price BDT<input type="number" min="0" value={pack.priceBDT} onChange={(event) => updatePack(index, 'priceBDT', Number(event.target.value))} className="mt-1 w-full rounded border px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" /></label><label className="flex items-center gap-1 pb-2 text-xs text-gray-500"><input type="checkbox" checked={pack.enabled} onChange={(event) => updatePack(index, 'enabled', event.target.checked)} /> On</label><button type="button" onClick={() => setSettings((current) => ({ ...current, coinPacks: current.coinPacks.filter((_, packIndex) => packIndex !== index) }))} className="pb-2 text-sm text-red-600">Remove</button></div>)}</div></section>
                <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"><h2 className="text-lg font-bold text-gray-900 dark:text-white">Tipping</h2><label className="mt-4 block max-w-xs text-sm text-gray-600 dark:text-gray-300">Platform fee percentage<input type="number" min="0" max="100" value={settings.tipping.platformFeePercent} onChange={(event) => setSettings((current) => ({ ...current, tipping: { platformFeePercent: Number(event.target.value) } }))} className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" /></label></section>
                <div className="flex justify-end"><button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save monetization settings'}</button></div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
