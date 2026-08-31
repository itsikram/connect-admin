'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import AdminSidebar from '../../../../components/AdminSidebar';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../lib/api';

export default function ReportedProfilesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const { admin } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/profiles');
        setReports(res.data || []);
      } catch (e) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await api.put(`/reports/${id}/status`, { status });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (e) {
      setError('Failed to update status');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1" />
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="flex items-center gap-x-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{admin?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.fullName || 'Admin'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{admin?.role || 'Administrator'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 py-8">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reported Profiles</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Review and manage reported profiles.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="min-w-full overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reported By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                        </tr>
                      ) : reports.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">No reports found</td>
                        </tr>
                      ) : (
                        reports.map((r) => {
                          const profileName = r.targetProfile?.user ? `${r.targetProfile.user.firstName || ''} ${r.targetProfile.user.surname || ''}`.trim() : (r.targetProfile?.displayName || r.targetProfile?.username || 'Unknown');
                          const reporterName = r.reportedBy?.fullName || r.reportedBy?.displayName || [r.reportedBy?.user?.firstName, r.reportedBy?.user?.surname].filter(Boolean).join(' ') || 'Unknown';
                          return (
                            <tr key={r._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r._id.slice(-8)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-700 dark:text-gray-300">{profileName}</span>
                                  {r.targetProfile?._id && (
                                    <Link href={`/dashboard/profiles/${r.targetProfile._id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">View</Link>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{reporterName}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                                <div className="font-medium">{r.reason || '-'}</div>
                                {r.details ? (
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{r.details}</p>
                                ) : null}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : r.status === 'reviewed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>{r.status}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="inline-flex items-center space-x-2">
                                  <button disabled={updatingId === r._id} onClick={() => updateStatus(r._id, 'reviewed')} className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50">Mark Reviewed</button>
                                  <button disabled={updatingId === r._id} onClick={() => updateStatus(r._id, 'dismissed')} className="px-3 py-1 rounded bg-gray-600 text-white text-xs hover:bg-gray-700 disabled:opacity-50">Dismiss</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
