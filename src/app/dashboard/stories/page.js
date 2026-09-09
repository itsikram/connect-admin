'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminSidebar from '../../../components/AdminSidebar';
import api from '../../../lib/api';

const getAuthorName = (story) =>
  story.author?.fullName || story.author?.displayName || 'Unknown User';

const getStoryDate = (createdAt) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  const diffInHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

export default function StoriesPage() {
  const { admin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stories');
        setStories(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const filteredStories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return stories.filter((story) => {
      if (!query) return true;
      return getAuthorName(story).toLowerCase().includes(query)
        || String(story.image || '').toLowerCase().includes(query)
        || String(story.bgColor || '').toLowerCase().includes(query);
    });
  }, [searchTerm, stories]);

  const handleDelete = async () => {
    if (!storyToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/stories/${storyToDelete._id}`);
      setStories((currentStories) =>
        currentStories.filter((story) => story._id !== storyToDelete._id)
      );
      setStoryToDelete(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting story:', err);
      setError('Failed to delete story. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-16 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:px-6 lg:px-8">
            <button
              type="button"
              className="mr-4 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-1 items-center justify-end gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {admin?.fullName?.split(' ').map((name) => name[0]).join('').toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{admin?.role || 'Administrator'}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 py-8">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stories Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">View and manage all stories across the platform.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
                <label htmlFor="story-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Stories
                </label>
                <input
                  id="story-search"
                  type="search"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search by author, image URL, or background color..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>}
              {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-sm text-red-700 dark:text-red-300">{error}</div>}

              {!loading && !error && filteredStories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStories.map((story) => (
                    <article key={story._id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                      <div
                        className="h-64 flex items-center justify-center bg-cover bg-center"
                        style={{ backgroundColor: story.bgColor || '#4f46e5' }}
                      >
                        {story.image ? (
                          <img src={story.image} alt={`Story by ${getAuthorName(story)}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-2xl font-semibold">Story</span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{getAuthorName(story)}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{getStoryDate(story.createdAt)}</p>
                          </div>
                          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            Story
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                          <span className="text-xs text-gray-400">ID: {story._id.slice(-8)}</span>
                          <button
                            type="button"
                            onClick={() => setStoryToDelete(story)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Story"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!loading && !error && filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">No stories found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {stories.length === 0 ? 'No stories available in the system.' : 'Try adjusting your search.'}
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        {storyToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <button type="button" className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setStoryToDelete(null)} aria-label="Close confirmation" />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Delete Story</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Are you sure you want to delete this story? This action cannot be undone.</p>
              <div className="mt-6 flex gap-3">
                <button type="button" className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg" onClick={() => setStoryToDelete(null)}>Cancel</button>
                <button type="button" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Story'}</button>
              </div>
            </div>
          </div>
        )}

        {sidebarOpen && <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}><div className="fixed inset-0 bg-gray-600 bg-opacity-75" /></div>}
      </div>
    </ProtectedRoute>
  );
}
