'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

export default function ProfilesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { admin } = useAuth();

  // Fetch profiles from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profiles');
        setProfiles(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Delete profile function
  const handleDeleteProfile = async () => {
    if (!deletingProfile) return;
    
    try {
      setDeleting(true);
      await api.delete(`/profile/${deletingProfile._id}`, {
        data: { userData: { user_id: deletingProfile.user?._id } }
      });
      
      // Remove profile from local state
      setProfiles(prev => prev.filter(profile => profile._id !== deletingProfile._id));
      setShowDeleteModal(false);
      setDeletingProfile(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (profile) => {
    setDeletingProfile(profile);
    setShowDeleteModal(true);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', current: false },
    { name: 'Users', href: '/dashboard/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: false },
    { name: 'Profiles', href: '/dashboard/profiles', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: true },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', current: false },
    { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', current: false }
  ];


  // Helper function to get profile name
  const getProfileName = (profile) => {
    if (profile.user) {
      return `${profile.user.firstName} ${profile.user.surname}`.trim();
    }
    return profile.displayName || profile.username || 'Unknown User';
  };

  // Helper function to get profile email
  const getProfileEmail = (profile) => {
    return profile.user?.email || 'No email';
  };

  // Helper function to get profile status
  const getProfileStatus = (profile) => {
    if (profile.isActive === false) return 'inactive';
    if (profile.blockedUsers && profile.blockedUsers.length > 0) return 'suspended';
    return 'active';
  };

  // Helper function to get last active time
  const getLastActive = (profile) => {
    if (profile.user?.lastLogin) {
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

  // Filter and sort profiles
  const filteredProfiles = profiles
    .filter(profile => {
      const name = getProfileName(profile).toLowerCase();
      const email = getProfileEmail(profile).toLowerCase();
      const status = getProfileStatus(profile);
      
      const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                           email.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = getProfileName(a);
          bValue = getProfileName(b);
          break;
        case 'joinDate':
          aValue = new Date(a.user?.createdAt || a.createdAt);
          bValue = new Date(b.user?.createdAt || b.createdAt);
          break;
        case 'posts':
          aValue = 0; // Posts count not available in current data structure
          bValue = 0;
          break;
        default:
          aValue = getProfileName(a);
          bValue = getProfileName(b);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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

  const getRoleColor = (role) => {
    switch (role) {
      case 'Moderator':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Premium User':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };



  useEffect(() => {
    const fetchProfiles = async () => {
      const response = await api.get('/profiles');
      setProfiles(response.data);
    };
    fetchProfiles();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="flex-1 px-6 py-8 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">N</span>
              </div>
            </div>
          </div>
        </div>

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profiles</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and view user profiles across the platform.</p>
              </div>

              {/* Search and Filter Bar */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Profiles
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="search"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      id="sort"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="joinDate-desc">Newest First</option>
                      <option value="joinDate-asc">Oldest First</option>
                      <option value="posts-desc">Most Posts</option>
                      <option value="posts-asc">Least Posts</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profiles Grid */}
              {!loading && !error && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProfiles.map((profile) => {
                    const profileName = getProfileName(profile);
                    const profileEmail = getProfileEmail(profile);
                    const profileStatus = getProfileStatus(profile);
                    const lastActive = getLastActive(profile);
                    const joinDate = profile.user?.createdAt ? new Date(profile.user.createdAt).toLocaleDateString() : 'Unknown';
                    
                    return (
                      <div key={profile._id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <div className="p-6">
                          {/* Profile Header */}
                          <div className="flex items-center space-x-4 mb-4">
                            {profile.profilePic ? (
                              <img 
                                src={profile.profilePic} 
                                alt={profileName}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                                <span className="text-lg font-medium text-white">
                                  {profileName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                {profileName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {profileEmail}
                              </p>
                            </div>
                          </div>

                          {/* Bio */}
                          {profile.bio && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                &ldquo;{profile.bio}&rdquo;
                              </p>
                            </div>
                          )}

                          {/* Status and Role */}
                          <div className="flex items-center space-x-2 mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(profileStatus)}`}>
                              {profileStatus}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor('User')}`}>
                              User
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {profile.friends?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Friends</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {profile.following?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {profile.blockedUsers?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Blocked</div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex justify-between">
                              <span>Joined:</span>
                              <span>{joinDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Active:</span>
                              <span>{lastActive}</span>
                            </div>
                            {profile.user?.gender && (
                              <div className="flex justify-between">
                                <span>Gender:</span>
                                <span className="capitalize">{profile.user.gender}</span>
                              </div>
                            )}
                            {profile.presentAddress && (
                              <div className="flex justify-between">
                                <span>Location:</span>
                                <span className="truncate ml-2">{profile.presentAddress}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex space-x-2">
                            <Link
                              href={`/dashboard/profiles/${profile._id}`}
                              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 text-center"
                            >
                              View 
                            </Link>
                            <Link
                              href={`/dashboard/profiles/${profile._id}/edit`}
                              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 text-center"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => openDeleteModal(profile)} 
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 text-center"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredProfiles.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No profiles found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {profiles.length === 0 
                      ? 'No profiles available in the system.' 
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingProfile && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50" 
              onClick={() => setShowDeleteModal(false)}
            ></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Delete Profile
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Are you sure you want to delete <strong>{getProfileName(deletingProfile)}</strong>&apos;s profile? This action cannot be undone.
                  </p>
                  
                  <div className="text-left text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <p className="font-medium mb-2">This will permanently remove:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>User account and login credentials</li>
                      <li>Profile information and photos</li>
                      <li>All posts and comments</li>
                      <li>Friends and connections</li>
                      <li>All associated data</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteProfile}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Profile'}
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
