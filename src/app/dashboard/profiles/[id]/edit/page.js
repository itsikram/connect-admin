'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../contexts/AuthContext';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import AdminSidebar from '../../../../../components/AdminSidebar';
import api from '../../../../../lib/api';

export default function ProfileEditPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const { admin } = useAuth();
  const router = useRouter();
  const params = useParams();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    bio: '',
    gender: '',
    DOB: '',
    presentAddress: '',
    permanentAddress: '',
    isActive: true
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/profile/${params.id}`);
        const profileData = response.data;
        setProfile(profileData);
        
        // Populate form with existing data
        setFormData({
          firstName: profileData.user?.firstName || '',
          surname: profileData.user?.surname || '',
          email: profileData.user?.email || '',
          bio: profileData.bio || '',
          gender: profileData.user?.gender || '',
          DOB: profileData.user?.DOB || '',
          presentAddress: profileData.presentAddress || '',
          permanentAddress: profileData.permanentAddress || '',
          isActive: profileData.isActive !== false
        });
        
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      await api.put(`/profile/${params.id}`, formData);
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/profiles/${params.id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle password set (admin)
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const onPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSetPassword = async (e) => {
    e.preventDefault();
    alert(`/profile/${params.id}/set-password`)
    try {
      setPwdSaving(true);
      setPwdError(null);
      setPwdSuccess(false);
      let res =await api.post(`/profile/${params.id}/set-password`, {
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      console.log('res',res)
      setPwdSuccess(true);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error setting password:', err);
      const msg = err?.response?.data?.message || 'Failed to set password. Please try again.';
      setPwdError(msg);
    } finally {
      setPwdSaving(false);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', current: false },
    { name: 'Users', href: '/dashboard/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', current: false },
    { name: 'Profiles', href: '/dashboard/profiles', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', current: false },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', current: false },
    { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', current: false }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !profile) {
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
                  href={`/dashboard/profiles/${params.id}`}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Profile
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
            <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Update user profile information.</p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                        Profile updated successfully! Redirecting...
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
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

              {/* Edit Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
                  </div>
                  <div className="px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="surname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="surname"
                          id="surname"
                          value={formData.surname}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter bio"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          id="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="DOB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="text"
                          name="DOB"
                          id="DOB"
                          value={formData.DOB}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="DD/MM/YYYY"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Address Information</h3>
                  </div>

              {/* Set New Password (Admin) */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Set New Password</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This replaces the user&apos;s password without requiring the current password.</p>
                </div>
                <div className="px-6 py-6 space-y-6">
                  {pwdSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">Password updated successfully.</div>
                  )}
                  {pwdError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">{pwdError}</div>
                  )}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={onPasswordChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={onPasswordChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSetPassword}
                      disabled={pwdSaving || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pwdSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
                  <div className="px-6 py-6 space-y-6">
                    <div>
                      <label htmlFor="presentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Present Address
                      </label>
                      <input
                        type="text"
                        name="presentAddress"
                        id="presentAddress"
                        value={formData.presentAddress}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter present address"
                      />
                    </div>
                    <div>
                      <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Permanent Address
                      </label>
                      <input
                        type="text"
                        name="permanentAddress"
                        id="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter permanent address"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Status</h3>
                  </div>
                  <div className="px-6 py-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                        Account is active
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                  <Link
                    href={`/dashboard/profiles/${params.id}`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
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
