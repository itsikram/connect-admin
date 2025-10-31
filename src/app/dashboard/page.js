'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../lib/api';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({ users: 0, profiles: 0, activeProfiles: 0, posts: 0, watches: 0, comments: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stats');
        if (!mounted) return;
        setTotals(res.data?.totals || {});
        setRecentActivities(res.data?.recentActivities || []);
        setError(null);
      } catch (e) {
        setError('Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const stats = [
    { name: 'Total Users', value: totals.users || 0, change: null, changeType: 'positive' },
    { name: 'Total Profiles', value: totals.profiles || 0, change: null, changeType: 'positive' },
    { name: 'Active Profiles', value: totals.activeProfiles || 0, change: null, changeType: 'positive' },
    { name: 'Posts / Watches', value: `${totals.posts || 0} / ${totals.watches || 0}`, change: null, changeType: 'positive' }
  ];

  const formatTime = (t) => {
    try {
      const d = new Date(t);
      return d.toLocaleString();
    } catch {
      return '';
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', current: true },
    { name: 'Users', href: '/dashboard/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: false },
    { name: 'Profiles', href: '/dashboard/profiles', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: false },
    { name: 'Posts', href: '/dashboard/posts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', current: false },
    { name: 'Watch', href: '/dashboard/watch', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', current: false },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', current: false },
    { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', current: false }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 0115 0v10z" />
                </svg>
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="relative">
                  <button type="button" className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">View notifications</span>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 0115 0v10z" />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <div className="relative">
                    <div className="flex items-center gap-x-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {admin?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {admin?.fullName || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {admin?.role || 'Administrator'}
                        </p>
                      </div>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                        title="Logout"
                      >
                        <svg 
                          className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                          />
                        </svg>
                        <span className="hidden sm:inline">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {(loading ? [1,2,3,4] : stats).map((stat, idx) => (
                <div key={stat?.name || idx} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{loading ? 'Loading...' : stat.name}</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{loading ? '—' : stat.value}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-4">
                    {(loading ? [] : recentActivities).map((activity) => (
                      <li key={activity.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                            activity.type === 'post' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                            activity.type === 'watch' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.user}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.action}</p>
                        </div>
                        <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">{formatTime(activity.time)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Add User</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Create new account</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">View Reports</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Analytics & insights</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Settings</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Configure system</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Support</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Get help</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
