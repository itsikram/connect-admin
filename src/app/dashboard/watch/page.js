'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminSidebar from '../../../components/AdminSidebar';
import api from '../../../lib/api';

export default function WatchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingWatch, setDeletingWatch] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { admin } = useAuth();

  // Fetch watches from API
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        setLoading(true);
        const response = await api.get('/watches');
        setWatches(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching watches:', err);
        setError('Failed to load watches. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  // Delete watch function
  const handleDeleteWatch = async () => {
    if (!deletingWatch) return;
    
    try {
      setDeleting(true);
      await api.delete(`/watches/${deletingWatch._id}`);
      
      // Remove watch from local state
      setWatches(prev => prev.filter(watch => watch._id !== deletingWatch._id));
      setShowDeleteModal(false);
      setDeletingWatch(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting watch:', err);
      setError('Failed to delete watch. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (watch) => {
    setDeletingWatch(watch);
    setShowDeleteModal(true);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', current: false },
    { name: 'Users', href: '/dashboard/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: false },
    { name: 'Profiles', href: '/dashboard/profiles', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: false },
    { name: 'Posts', href: '/dashboard/posts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', current: false },
    { name: 'Watch', href: '/dashboard/watch', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', current: true },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', current: false },
    { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', current: false }
  ];

  // Helper functions
  const getWatchAuthor = (watch) => {
    if (watch.author) {
      return watch.author.fullName || watch.author.displayName || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getWatchDate = (watch) => {
    const date = new Date(watch.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getWatchType = (watch) => {
    return watch.type || 'watch';
  };

  const getWatchTypeColor = (type) => {
    switch (type) {
      case 'watch':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filter and sort watches
  const filteredWatches = watches
    .filter(watch => {
      const content = watch.caption?.toLowerCase() || '';
      const author = getWatchAuthor(watch).toLowerCase();
      const type = getWatchType(watch);
      
      const matchesSearch = content.includes(searchTerm.toLowerCase()) ||
                           author.includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'author':
          aValue = getWatchAuthor(a);
          bValue = getWatchAuthor(b);
          break;
        case 'likes':
          aValue = a.reacts?.length || 0;
          bValue = b.reacts?.length || 0;
          break;
        case 'comments':
          aValue = a.comments?.length || 0;
          bValue = b.comments?.length || 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Watch Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">View and manage all video content across the platform.</p>
              </div>

              {/* Search and Filter Bar */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Videos
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
                        placeholder="Search by caption or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Video Type
                    </label>
                    <select
                      id="type"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="watch">Watch Videos</option>
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
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="author-asc">Author (A-Z)</option>
                      <option value="author-desc">Author (Z-A)</option>
                      <option value="likes-desc">Most Liked</option>
                      <option value="comments-desc">Most Comments</option>
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

              {/* Videos Grid */}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWatches.map((watch) => {
                    const author = getWatchAuthor(watch);
                    const watchDate = getWatchDate(watch);
                    const watchType = getWatchType(watch);
                    
                    return (
                      <div key={watch._id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <div className="p-6">
                          {/* Video Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {author.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{author}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{watchDate}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWatchTypeColor(watchType)}`}>
                                {watchType}
                              </span>
                            </div>
                          </div>

                          {/* Video Content */}
                          <div className="mb-4">
                            <p className="text-gray-900 dark:text-white text-sm line-clamp-3">
                              {watch.caption || 'No caption available'}
                            </p>
                          </div>

                          {/* Video Thumbnail */}
                          {watch.thumbnail && (
                            <div className="mb-4">
                              <img 
                                src={watch.thumbnail} 
                                alt="Video thumbnail"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* Video URL */}
                          {watch.videoUrl && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <a 
                                href={watch.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                              >
                                {watch.videoUrl}
                              </a>
                            </div>
                          )}

                          {/* Video Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {watch.reacts?.length || 0}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {watch.comments?.length || 0}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                                {watch.shares?.length || 0}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {watch.audience || 'Public'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-400">
                              ID: {watch._id.slice(-8)}
                            </span>
                            <div className="flex space-x-2">
                              <Link
                                href={`/dashboard/watch/${watch._id}`}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                title="View Video"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </Link>
                              <Link
                                href={`/dashboard/watch/${watch._id}/edit`}
                                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                title="Edit Video"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button 
                                onClick={() => openDeleteModal(watch)}
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                                title="Delete Video"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredWatches.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No videos found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {watches.length === 0 
                      ? 'No videos available in the system.' 
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingWatch && (
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
                    Delete Video
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Are you sure you want to delete this video? This action cannot be undone.
                  </p>
                  
                  <div className="text-left text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <p className="font-medium mb-2">This will permanently remove:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>The video content and thumbnail</li>
                      <li>All likes and reactions</li>
                      <li>All comments and replies</li>
                      <li>All shares and interactions</li>
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
                    onClick={handleDeleteWatch}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Video'}
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
