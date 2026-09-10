'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

const STATUS_TABS = ['pending', 'approved', 'rejected'];

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

const displayUser = (transaction) => {
  const user = transaction.userId;
  if (!user || typeof user === 'string') return 'Unknown user';
  return user.email || [user.firstName, user.surname].filter(Boolean).join(' ') || 'Unknown user';
};

export default function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState('pending');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/payments', { params: { status, search: search || undefined } });
      setTransactions(response.data?.transactions || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load payment submissions.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const approve = async (transaction) => {
    if (!window.confirm(`Approve ${transaction.transactionId}? This applies the stored payment effect.`)) return;
    setActionId(transaction._id);
    setError('');
    setNotice('');
    try {
      await api.post(`/payments/${transaction._id}/approve`);
      setNotice('Payment approved and the server-side entitlement was applied.');
      await loadPayments();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to approve this payment.');
    } finally {
      setActionId(null);
    }
  };

  const reject = async () => {
    const reason = rejectionReason.trim();
    if (!reason || !rejecting) return;
    setActionId(rejecting._id);
    setError('');
    setNotice('');
    try {
      await api.post(`/payments/${rejecting._id}/reject`, { rejectionReason: reason });
      setRejecting(null);
      setRejectionReason('');
      setNotice('Payment rejected and the reason was recorded.');
      await loadPayments();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to reject this payment.');
    } finally {
      setActionId(null);
    }
  };

  const emptyMessage = useMemo(
    () => (search ? 'No payments match that phone number or transaction ID.' : `No ${status} payments.`),
    [search, status],
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-6 lg:px-8">
            <button type="button" className="rounded-lg p-2 text-gray-600 lg:hidden dark:text-gray-300" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment review</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verify bKash and Nagad submissions before applying entitlements.</p>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Search phone number or transaction ID</span>
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setSearch(searchInput.trim()); }} placeholder="Search sender number or TrxID" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </label>
              <button type="button" onClick={() => setSearch(searchInput.trim())} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Search</button>
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Clear</button>
            </div>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {STATUS_TABS.map((tab) => (
                <button key={tab} type="button" onClick={() => setStatus(tab)} className={`border-b-2 px-3 py-2 text-sm font-semibold capitalize ${status === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {error ? <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div> : null}
            {notice ? <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">{notice}</div> : null}

            <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
              {loading ? <div className="p-8 text-center text-sm text-gray-500">Loading payment submissions…</div> : transactions.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">{emptyMessage}</div> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>{['User', 'Type', 'Amount', 'Method / TrxID', 'Submitted', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="align-top">
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900 dark:text-white">{displayUser(transaction)}<div className="text-xs text-gray-500">{transaction.senderMsisdn}</div></td>
                          <td className="px-4 py-4 text-sm capitalize text-gray-700 dark:text-gray-300">{transaction.type.replaceAll('_', ' ')}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">৳{Number(transaction.amountBDT || 0).toFixed(2)}{transaction.coinsAmount ? <div className="text-xs font-normal text-amber-600">{transaction.coinsAmount} coins</div> : null}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300"><span className="uppercase">{transaction.paymentMethod}</span><div className="font-mono text-xs">{transaction.transactionId}</div>{transaction.screenshotUrl ? <a href={transaction.screenshotUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">View screenshot</a> : null}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{formatDate(transaction.submittedAt)}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">{status === 'pending' ? <div className="flex gap-2"><button type="button" disabled={actionId === transaction._id} onClick={() => void approve(transaction)} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={actionId === transaction._id} onClick={() => { setRejecting(transaction); setRejectionReason(''); }} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Reject</button></div> : <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {rejecting ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reject-title"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"><h2 id="reject-title" className="text-lg font-bold text-gray-900 dark:text-white">Reject payment</h2><p className="mt-2 text-sm text-gray-500">The reason is stored and should explain what the user needs to correct.</p><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={4} maxLength={500} placeholder="e.g. TrxID not found or amount mismatch" className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setRejecting(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Cancel</button><button type="button" disabled={!rejectionReason.trim() || actionId === rejecting._id} onClick={() => void reject()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirm rejection</button></div></div></div> : null}
      </div>
    </ProtectedRoute>
  );
}
