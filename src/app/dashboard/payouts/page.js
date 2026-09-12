'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

const displayUser = (payout) => {
  const user = payout.userId;
  return user?.email || [user?.firstName, user?.surname].filter(Boolean).join(' ') || 'Unknown user';
};

export default function PayoutsPage() {
  const [status, setStatus] = useState('pending');
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/payouts', { params: { status } });
      setPayouts(response.data?.payouts || []);
      setError('');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load payouts.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const review = async (payout, action) => {
    const reason = action === 'reject' ? window.prompt('Reason for rejection') : '';
    if (action === 'reject' && !reason?.trim()) return;
    setActionId(payout._id);
    setError('');
    try {
      await api.post(`/payouts/${payout._id}/${action}`, action === 'reject' ? { rejectionReason: reason.trim() } : {});
      setNotice(action === 'approve' ? 'Payout approved.' : 'Payout rejected and coins restored.');
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to review payout.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          <header className="border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payout requests</h1>
            <p className="text-sm text-gray-500">Approve after sending the recharge or mobile money payout.</p>
          </header>
          <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {['pending', 'approved', 'rejected'].map((tab) => <button key={tab} type="button" onClick={() => setStatus(tab)} className={`border-b-2 px-3 py-2 text-sm font-semibold capitalize ${status === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>{tab}</button>)}
            </div>
            {error ? <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            {notice ? <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</div> : null}
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-gray-800">
              {loading ? <div className="p-8 text-center text-gray-500">Loading payouts…</div> : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead><tr>{['User', 'Method', 'Destination', 'Coins', 'BDT', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{heading}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => <tr key={payout._id}>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{displayUser(payout)}<div className="text-xs text-gray-500">{payout.recipientName}</div></td>
                      <td className="px-4 py-4 text-sm capitalize text-gray-700 dark:text-gray-300">{payout.method.replace('_', ' ')}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{payout.payoutAddress}<div className="text-xs text-gray-500">{payout.phoneNumber}</div></td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">{payout.amountCoins}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">৳{Number(payout.amountBDT).toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm">{status === 'pending' ? <div className="flex gap-2"><button type="button" disabled={actionId === payout._id} onClick={() => void review(payout, 'approve')} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white">Approve</button><button type="button" disabled={actionId === payout._id} onClick={() => void review(payout, 'reject')} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Reject</button></div> : <span className="capitalize text-gray-500">{status}</span>}</td>
                    </tr>)}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
