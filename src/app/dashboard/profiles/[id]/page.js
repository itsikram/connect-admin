'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import AdminSidebar from '../../../../components/AdminSidebar';
import api from '../../../../lib/api';

export default function ProfileViewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { admin } = useAuth();
  const router = useRouter();
  const params = useParams();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/profile/${params.id}`);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  // Delete profile function
  const handleDeleteProfile = async () => {
    try {
      setDeleting(true);
      await api.delete(`/profiles/${params.id}`);
      router.push('/dashboard/profiles');
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', current: false },
    { name: 'Users', href: '/dashboard/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: false },
    { name: 'Profiles', href: '/dashboard/profiles', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: false },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', current: false },
    { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', current: false }
  ];

  const getProfileName = (profile) => {
    if (profile?.user) {
      return `${profile.user.firstName} ${profile.user.surname}`.trim();
    }
    return profile?.displayName || profile?.username || 'Unknown User';
  };

  const getProfileEmail = (profile) => {
    return profile?.user?.email || 'No email';
  };

  const getProfileStatus = (profile) => {
    if (profile?.isActive === false) return 'inactive';
    if (profile?.blockedUsers && profile.blockedUsers.length > 0) return 'suspended';
    return 'active';
  };

  const getLastActive = (profile) => {
    if (profile?.user?.lastLogin) {
      const lastLogin = new Date(profile.user.lastLogin);
      const now = new Date();
      const diffInHours = Math.floor((now - lastLogin) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} days ago`;
      return lastLogin.toLocaleDateString();
    }
    return 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                  <div className="mt-4">
                    <Link 
                      href="/dashboard/profiles"
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-500"
                    >
                      ← Back to Profiles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile not found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">The requested profile could not be found.</p>
            <div className="mt-4">
              <Link 
                href="/dashboard/profiles"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                ← Back to Profiles
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const profileName = getProfileName(profile);
  const profileEmail = getProfileEmail(profile);
  const profileStatus = getProfileStatus(profile);
  const lastActive = getLastActive(profile);

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
              <div className="flex flex-1">
                <Link 
                  href="/dashboard/profiles"
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Profiles
                </Link>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
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
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 py-8">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {profile.profilePic ? (
                        <img 
                          src={profile.profilePic} 
                          alt={profileName}
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-2xl font-medium text-white">
                            {profileName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profileName}</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">{profileEmail}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profileStatus)}`}>
                            {profileStatus}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Last active: {lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/dashboard/profiles/${profile._id}/edit`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Basic Information */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
                    </div>
                    <div className="px-6 py-6 space-y-6">
                      {profile.bio && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                          <p className="text-sm text-gray-900 dark:text-white italic">&ldquo;{profile.bio}&rdquo;</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                          <p className="text-sm text-gray-900 dark:text-white">{profile.user?.firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                          <p className="text-sm text-gray-900 dark:text-white">{profile.user?.surname || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                          <p className="text-sm text-gray-900 dark:text-white">{profile.user?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                          <p className="text-sm text-gray-900 dark:text-white capitalize">{profile.user?.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                          <p className="text-sm text-gray-900 dark:text-white">{profile.user?.DOB || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Created</label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {profile.user?.createdAt ? new Date(profile.user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Address Information */}
                      {(profile.presentAddress || profile.permanentAddress) && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Address Information</h4>
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {profile.presentAddress && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Present Address</label>
                                <p className="text-sm text-gray-900 dark:text-white">{profile.presentAddress}</p>
                              </div>
                            )}
                            {profile.permanentAddress && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permanent Address</label>
                                <p className="text-sm text-gray-900 dark:text-white">{profile.permanentAddress}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Work and Education */}
                      {(profile.workPlaces?.length > 0 || profile.schools?.length > 0) && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Work & Education</h4>
                          {profile.workPlaces?.length > 0 && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Places</label>
                              <div className="space-y-2">
                                {profile.workPlaces.map((work, index) => (
                                  <div key={index} className="text-sm text-gray-900 dark:text-white">
                                    {work.name || work.company || 'Unknown Company'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {profile.schools?.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schools</label>
                              <div className="space-y-2">
                                {profile.schools.map((school, index) => (
                                  <div key={index} className="text-sm text-gray-900 dark:text-white">
                                    {school.name || school.school || 'Unknown School'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats and Activity */}
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Statistics</h3>
                    </div>
                    <div className="px-6 py-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Friends</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile.friends?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile.following?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Blocked Users</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile.blockedUsers?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Friend Requests</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile.friendReqs?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Status</h3>
                    </div>
                    <div className="px-6 py-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(profileStatus)}`}>
                            {profileStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile.isActive ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Last Login</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Delete Profile
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Are you sure you want to delete <strong>{profileName}</strong>&apos;s profile? This action cannot be undone and will permanently remove all profile data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    onClick={handleDeleteProfile}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Profile'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
