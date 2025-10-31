'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import AdminSidebar from '../../../../components/AdminSidebar';
import api from '../../../../lib/api';

export default function WatchDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { admin } = useAuth();
  const params = useParams();
  const router = useRouter();

  // Fetch watch details
  useEffect(() => {
    const fetchWatch = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/watches/${params.id}`);
        setWatch(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching watch:', err);
        setError('Failed to load watch details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchWatch();
    }
  }, [params.id]);

  // Delete watch function
  const handleDeleteWatch = async () => {
    if (!watch) return;
    
    try {
      setDeleting(true);
      await api.delete(`/watches/${watch._id}`);
      
      // Redirect to watch list
      router.push('/dashboard/watch');
    } catch (err) {
      console.error('Error deleting watch:', err);
      setError('Failed to delete watch. Please try again.');
    } finally {
      setDeleting(false);
    }
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <div className="flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error</h3>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <Link
                href="/dashboard/watch"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Watch List
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!watch) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Watch not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">The watch you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/dashboard/watch"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Watch List
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
              {/* Breadcrumb */}
              <nav className="flex mb-8" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link href="/dashboard/watch" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                      </svg>
                      Watch
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                        {watch._id.slice(-8)}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>

              {/* Watch Details */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">
                          {getWatchAuthor(watch).split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {getWatchAuthor(watch)}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getWatchDate(watch)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getWatchTypeColor(getWatchType(watch))}`}>
                        {getWatchType(watch)}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/watch/${watch._id}/edit`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  {/* Caption */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Caption</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {watch.caption || 'No caption provided'}
                    </p>
                  </div>

                  {/* Video Thumbnail */}
                  {watch.thumbnail && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Thumbnail</h3>
                      <img 
                        src={watch.thumbnail} 
                        alt="Video thumbnail"
                        className="w-full max-w-md h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Video URL */}
                  {watch.videoUrl && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Video URL</h3>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <a 
                          href={watch.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                        >
                          {watch.videoUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Likes</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {watch.reacts?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Comments</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {watch.comments?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shares</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {watch.shares?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Audience</p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {watch.audience || 'Public'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Video Information</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Video ID</dt>
                          <dd className="text-sm text-gray-900 dark:text-white font-mono">{watch._id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{getWatchDate(watch)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{getWatchType(watch)}</dd>
                        </div>
                        {watch.feeling && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Feeling</dt>
                            <dd className="text-sm text-gray-900 dark:text-white">{watch.feeling}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Author Information</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{getWatchAuthor(watch)}</dd>
                        </div>
                        {watch.author?.bio && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</dt>
                            <dd className="text-sm text-gray-900 dark:text-white">{watch.author.bio}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
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
