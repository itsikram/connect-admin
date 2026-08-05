'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminSidebar from '../../../components/AdminSidebar';
import api from '../../../lib/api';

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    users: 0,
    profiles: 0,
    activeProfiles: 0,
    posts: 0,
    watches: 0,
    comments: 0,
  });
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
        console.error('Error loading analytics:', e);
        if (mounted) setError('Failed to load analytics data. Please try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const metricCards = useMemo(
    () => [
      { name: 'Total Users', value: totals.users || 0, href: '/dashboard/users', color: 'bg-indigo-500' },
      { name: 'Total Profiles', value: totals.profiles || 0, href: '/dashboard/profiles', color: 'bg-blue-500' },
      { name: 'Active Profiles', value: totals.activeProfiles || 0, href: '/dashboard/profiles', color: 'bg-green-500' },
      { name: 'Posts', value: totals.posts || 0, href: '/dashboard/posts', color: 'bg-purple-500' },
      { name: 'Watches', value: totals.watches || 0, href: '/dashboard/watch', color: 'bg-amber-500' },
      { name: 'Comments', value: totals.comments || 0, href: '/dashboard/posts', color: 'bg-rose-500' },
    ],
    [totals]
  );

  const activeRate =
    totals.profiles > 0
      ? Math.round(((totals.activeProfiles || 0) / totals.profiles) * 100)
      : 0;

  const contentPerUser =
    totals.users > 0
      ? (((totals.posts || 0) + (totals.watches || 0)) / totals.users).toFixed(2)
      : '0.00';

  const commentsPerPost =
    totals.posts > 0
      ? ((totals.comments || 0) / totals.posts).toFixed(2)
      : '0.00';

  const activityBreakdown = useMemo(() => {
    const counts = { user: 0, post: 0, watch: 0, other: 0 };
    recentActivities.forEach((a) => {
      if (a.type === 'user' || a.type === 'post' || a.type === 'watch') counts[a.type] += 1;
      else counts.other += 1;
    });
    return counts;
  }, [recentActivities]);

  const formatTime = (t) => {
    try {
      return new Date(t).toLocaleString();
    } catch {
      return '';
    }
  };

  const typeStyles = {
    user: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    post: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    watch: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
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

            <div className="flex flex-1 items-center justify-end gap-x-4">
              <div className="flex items-center gap-x-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {admin?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'A'}
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
              </div>
            </div>
          </div>

          <main className="flex-1 py-8">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Platform totals, engagement ratios, and recent activity.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {(loading ? Array.from({ length: 6 }) : metricCards).map((metric, idx) => (
                  <Link
                    key={metric?.name || idx}
                    href={metric?.href || '#'}
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 flex items-center">
                      <div className={`w-10 h-10 ${metric?.color || 'bg-gray-400'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="ml-4 min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {loading ? 'Loading...' : metric.name}
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {loading ? '—' : metric.value}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Profile Rate</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '—' : `${activeRate}%`}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Active profiles vs total profiles
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Content Per User</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '—' : contentPerUser}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Posts + watches divided by users
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Comments Per Post</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '—' : commentsPerPost}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Average comments across all posts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity Mix</h3>
                  </div>
                  <div className="px-6 py-6 space-y-4">
                    {[
                      { key: 'user', label: 'Profile creations' },
                      { key: 'post', label: 'New posts' },
                      { key: 'watch', label: 'New watches' },
                    ].map((item) => {
                      const count = activityBreakdown[item.key] || 0;
                      const total = recentActivities.length || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={item.key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {loading ? '—' : `${count} (${pct}%)`}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.key === 'user'
                                  ? 'bg-blue-500'
                                  : item.key === 'post'
                                    ? 'bg-green-500'
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: loading ? '0%' : `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {!loading && recentActivities.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Latest Events</h3>
                  </div>
                  <div className="px-6 py-6">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {recentActivities.map((activity) => (
                          <li key={`${activity.type}-${activity.id}`} className="flex items-start gap-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                typeStyles[activity.type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                              }`}
                            >
                              {activity.type || 'event'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {activity.user}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {activity.action}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatTime(activity.time)}
                            </div>
                          </li>
                        ))}
                        {recentActivities.length === 0 && (
                          <li className="text-sm text-gray-500 dark:text-gray-400">No events to show.</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
