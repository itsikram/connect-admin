'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminSidebar from '../../../components/AdminSidebar';
import api from '../../../lib/api';

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuth, setFilterAuth] = useState('all');
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { admin } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profiles');
        setUsers(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getName = (profile) => {
    if (profile.user) {
      return `${profile.user.firstName || ''} ${profile.user.surname || ''}`.trim();
    }
    return profile.displayName || profile.username || 'Unknown User';
  };

  const getEmail = (profile) => profile.user?.email || 'No email';

  const getAuthType = (profile) => {
    if (profile.user?.googleId) return 'google';
    if (profile.user?.password) return 'password';
    return 'unknown';
  };

  const getLastActive = (profile) => {
    if (profile.user?.lastLogin) {
      const lastLogin = new Date(profile.user.lastLogin);
      if (Number.isNaN(lastLogin.getTime())) return 'Unknown';
      const diffInHours = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60));
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return lastLogin.toLocaleDateString();
    }
    return 'Unknown';
  };

  const getJoinDate = (profile) => {
    const raw = profile.user?.createdAt || profile.createdAt;
    if (!raw) return 'Unknown';
    return new Date(raw).toLocaleDateString();
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setDeleting(true);
      await api.delete(`/profile/${deletingUser._id}`, {
        data: { userData: { user_id: deletingUser.user?._id } },
      });
      setUsers((prev) => prev.filter((u) => u._id !== deletingUser._id));
      setShowDeleteModal(false);
      setDeletingUser(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users
    .filter((profile) => {
      const name = getName(profile).toLowerCase();
      const email = getEmail(profile).toLowerCase();
      const authType = getAuthType(profile);
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());
      const matchesAuth = filterAuth === 'all' || authType === filterAuth;
      return matchesSearch && matchesAuth;
    })
    .sort((a, b) => {
      let aValue;
      let bValue;

      switch (sortBy) {
        case 'name':
          aValue = getName(a).toLowerCase();
          bValue = getName(b).toLowerCase();
          break;
        case 'email':
          aValue = getEmail(a).toLowerCase();
          bValue = getEmail(b).toLowerCase();
          break;
        case 'joinDate':
        default:
          aValue = new Date(a.user?.createdAt || a.createdAt || 0).getTime();
          bValue = new Date(b.user?.createdAt || b.createdAt || 0).getTime();
          break;
      }

      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

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

            <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage platform user accounts and login details.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Users
                    </label>
                    <input
                      type="text"
                      id="search"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="auth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Auth Type
                    </label>
                    <select
                      id="auth"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={filterAuth}
                      onChange={(e) => setFilterAuth(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="password">Email / Password</option>
                      <option value="google">Google</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      id="sort"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                    >
                      <option value="joinDate-desc">Newest First</option>
                      <option value="joinDate-asc">Oldest First</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="email-asc">Email (A-Z)</option>
                      <option value="email-desc">Email (Z-A)</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {!loading && !error && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/40">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auth</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((profile) => {
                          const name = getName(profile);
                          const email = getEmail(profile);
                          const authType = getAuthType(profile);

                          return (
                            <tr key={profile._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {profile.profilePic ? (
                                    <img
                                      src={profile.profilePic}
                                      alt={name}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        {name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                      </span>
                                    </div>
                                  )}
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {profile.username ? `@${profile.username}` : profile._id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    authType === 'google'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                      : authType === 'password'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}
                                >
                                  {authType === 'google' ? 'Google' : authType === 'password' ? 'Password' : 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {getJoinDate(profile)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {getLastActive(profile)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Link
                                  href={`/dashboard/profiles/${profile._id}`}
                                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  View
                                </Link>
                                <Link
                                  href={`/dashboard/profiles/${profile._id}/edit`}
                                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingUser(profile);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {users.length === 0
                          ? 'No user accounts available in the system.'
                          : 'Try adjusting your search or filter criteria.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

        {showDeleteModal && deletingUser && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete User</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Delete <strong>{getName(deletingUser)}</strong> and their account data? This cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
