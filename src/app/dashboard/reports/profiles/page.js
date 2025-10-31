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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', current: false },
    { name: 'Users', href: '/dashboard/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: false },
    { name: 'Profiles', href: '/dashboard/profiles', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: false },
    { name: 'Posts', href: '/dashboard/posts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', current: false },
    { name: 'Reported Posts', href: '/dashboard/reports/posts', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', current: false },
    { name: 'Reported Profiles', href: '/dashboard/reports/profiles', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', current: true },
    { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', current: false }
  ];

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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                        </tr>
                      ) : reports.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">No reports found</td>
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r.reason || '-'}</td>
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
