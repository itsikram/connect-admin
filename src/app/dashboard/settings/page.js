'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import axios from 'axios';
import config from '../../../config/config.json';
import AdminSidebar from '../../../components/AdminSidebar';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { admin } = useAuth();

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      siteTitle: 'Connect',
      siteDescription: 'A modern social platform for connecting people',
      showAds: false,
      registerNewAccount: false,
      defaultTheme: 'dark',
      defaultLanguage: 'en',
      defaultTimezone: 'UTC',
      isMaintenanceMode: false,
      siteUrl: 'https://connect-zfgx.onrender.com/',
      siteLogo: config?.logo,
      apkUrl: '',
      appVersion: '',
      isNewVersionAvailable: false
    },
    user: {
      allowRegistration: true,
      requireEmailVerification: true,
      allowProfilePictures: true,
      allowBio: true,
      allowLocation: true,
      maxFriends: 5000,
      maxPostsPerDay: 50,
      accountDeactivationDays: 365
    },
    security: {
      passwordMinLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      friendRequests: true,
      messages: true,
      posts: true,
      comments: true,
      systemUpdates: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      showOnlineStatus: true,
      allowSearch: true,
      dataRetention: 365,
      gdprCompliance: true,
      cookieConsent: true
    },
    appearance: {
      theme: 'auto',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      logoUrl: '',
      faviconUrl: '',
      customCss: ''
    }
  });

  

  const settingsTabs = [
    { id: 'general', name: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'user', name: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { id: 'security', name: 'Security', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'notifications', name: 'Notifications', icon: 'M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 0115 0v10z' },
    { id: 'privacy', name: 'Privacy', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'appearance', name: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z' }
  ];

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      let res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/connect');
      if (res.status === 200) {
        setSettings(prev => ({
          ...prev,
          general: { ...prev.general, ...res.data }
        }));
      }
    };
    fetchSettings();
  }, []);

  // Handle form submission
  const handleSave = async (section) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    console.log(settings);
    
    try {
      // Simulate API call
      let res =await axios.put(process.env.NEXT_PUBLIC_API_URL + '/api/connect', settings.general);
      if (res.status === 200 || res.status === 201) {
        setSettings(prev => ({
          ...prev,
          general: {
            ...res.data
          }
        }));
        setMessage({ type: 'success', text: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!` });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      }
      
      
      setMessage({ type: 'success', text: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!` });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Render form field
  const renderField = (section, field, label, type = 'text', options = []) => {
    const value = settings[section][field];
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {type === 'select' ? (
          <select
            value={value}
            onChange={(e) => handleInputChange(section, field, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(section, field, e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        ) : type === 'checkbox' ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(section, field, e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-white">
              {label}
            </label>
          </div>
        ) : type === 'number' ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(section, field, parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(section, field, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
      </div>
    );
  };

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your platform configuration and preferences.</p>
              </div>

              {/* Message */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {message.type === 'success' ? (
                        <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        message.type === 'success' 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                  <nav className="space-y-1">
                    {settingsTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                        </svg>
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {settingsTabs.find(tab => tab.id === activeTab)?.name} Settings
                      </h3>
                    </div>
                    <div className="px-6 py-6">
                      {/* General Settings */}
                      {activeTab === 'general' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Site Logo Uploader */}
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Site Logo
                              </label>
                              <div className="flex items-center space-x-4">
                                {settings.general.siteLogo && (
                                  <img
                                    src={settings.general.siteLogo}
                                    alt="Site Logo"
                                    className="h-12 w-12 rounded bg-gray-100 dark:bg-gray-700 object-contain border border-gray-200 dark:border-gray-600"
                                  />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    // Optionally show a loading state here
                                    const formData = new FormData();
                                    formData.append('image', file);

                                    try {
                                      // Replace with your actual upload endpoint
                                      const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/upload/admin', formData, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'multipart/form-data'
                                        }
                                      });
                                      if (res.data.secure_url) {
                                        handleInputChange('general', 'siteLogo', res.data.secure_url);
                                      }
                                    } catch (err) {
                                      // Optionally handle error
                                    }
                                  }}
                                  className="block text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100
                                    dark:file:bg-gray-700 dark:file:text-indigo-200
                                  "
                                />
                              </div>
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Upload a logo for your site. Recommended size: 120x120px.
                              </p>
                            </div>
                            {renderField('general', 'siteTitle', 'Site Title')}
                            {renderField('general', 'siteUrl', 'Site URL', 'url')}
                            {renderField('general', 'apkUrl', 'APK URL', 'url')}
                            {renderField('general', 'ipaUrl', 'IPA URL', 'url')}
                          {renderField('general', 'appVersion', 'App Version')}
                          {renderField('general', 'isNewVersionAvailable', 'Is New Version Available', 'checkbox')}
                            {renderField('general', 'showAds', 'Show Ads', 'checkbox')}
                            {renderField('general', 'registerNewAccount', 'Register New Account', 'checkbox')}
                            {renderField('general', 'defaultTheme', 'Default Theme', 'select', [
                              { value: 'light', label: 'Light' },
                              { value: 'dark', label: 'Dark' }
                            ])}
                            {renderField('general', 'defaultLanguage', 'Default Language', 'select', [
                              { value: 'en', label: 'English' },
                              { value: 'es', label: 'Spanish' },
                            ])}
                            {renderField('general', 'adminEmail', 'Admin Email', 'email')}

                            {renderField('general', 'isMaintenanceMode', 'Maintenance Mode', 'checkbox')}
                          </div>
                          {renderField('general', 'siteDescription', 'Site Description', 'textarea')}
                        </div>
                      )}

                      {/* User Management Settings */}
                      {activeTab === 'user' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Registration & Verification</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('user', 'allowRegistration', 'Allow User Registration', 'checkbox')}
                              {renderField('user', 'requireEmailVerification', 'Require Email Verification', 'checkbox')}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Profile Settings</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('user', 'allowProfilePictures', 'Allow Profile Pictures', 'checkbox')}
                              {renderField('user', 'allowBio', 'Allow Bio', 'checkbox')}
                              {renderField('user', 'allowLocation', 'Allow Location', 'checkbox')}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Limits & Restrictions</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('user', 'maxFriends', 'Max Friends', 'number')}
                              {renderField('user', 'maxPostsPerDay', 'Max Posts Per Day', 'number')}
                              {renderField('user', 'accountDeactivationDays', 'Account Deactivation (Days)', 'number')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Security Settings */}
                      {activeTab === 'security' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Password Requirements</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('security', 'passwordMinLength', 'Minimum Length', 'number')}
                              {renderField('security', 'requireUppercase', 'Require Uppercase', 'checkbox')}
                              {renderField('security', 'requireLowercase', 'Require Lowercase', 'checkbox')}
                              {renderField('security', 'requireNumbers', 'Require Numbers', 'checkbox')}
                              {renderField('security', 'requireSpecialChars', 'Require Special Characters', 'checkbox')}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Session & Login</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('security', 'sessionTimeout', 'Session Timeout (Hours)', 'number')}
                              {renderField('security', 'maxLoginAttempts', 'Max Login Attempts', 'number')}
                              {renderField('security', 'lockoutDuration', 'Lockout Duration (Minutes)', 'number')}
                              {renderField('security', 'twoFactorAuth', 'Enable Two-Factor Authentication', 'checkbox')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notification Settings */}
                      {activeTab === 'notifications' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Notification Channels</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('notifications', 'emailNotifications', 'Email Notifications', 'checkbox')}
                              {renderField('notifications', 'pushNotifications', 'Push Notifications', 'checkbox')}
                              {renderField('notifications', 'smsNotifications', 'SMS Notifications', 'checkbox')}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Notification Types</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('notifications', 'friendRequests', 'Friend Requests', 'checkbox')}
                              {renderField('notifications', 'messages', 'Messages', 'checkbox')}
                              {renderField('notifications', 'posts', 'Posts', 'checkbox')}
                              {renderField('notifications', 'comments', 'Comments', 'checkbox')}
                              {renderField('notifications', 'systemUpdates', 'System Updates', 'checkbox')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Privacy Settings */}
                      {activeTab === 'privacy' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Profile Visibility</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('privacy', 'profileVisibility', 'Default Profile Visibility', 'select', [
                                { value: 'public', label: 'Public' },
                                { value: 'friends', label: 'Friends Only' },
                                { value: 'private', label: 'Private' }
                              ])}
                              {renderField('privacy', 'showEmail', 'Show Email Address', 'checkbox')}
                              {renderField('privacy', 'showLocation', 'Show Location', 'checkbox')}
                              {renderField('privacy', 'showOnlineStatus', 'Show Online Status', 'checkbox')}
                              {renderField('privacy', 'allowSearch', 'Allow Search', 'checkbox')}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Data & Compliance</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('privacy', 'dataRetention', 'Data Retention (Days)', 'number')}
                              {renderField('privacy', 'gdprCompliance', 'GDPR Compliance', 'checkbox')}
                              {renderField('privacy', 'cookieConsent', 'Cookie Consent Required', 'checkbox')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Appearance Settings */}
                      {activeTab === 'appearance' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Theme & Colors</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {renderField('appearance', 'theme', 'Theme', 'select', [
                                { value: 'auto', label: 'Auto' },
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' }
                              ])}
                              {renderField('appearance', 'primaryColor', 'Primary Color', 'color')}
                              {renderField('appearance', 'secondaryColor', 'Secondary Color', 'color')}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Branding</h4>
                            <div className="space-y-4">
                              {renderField('appearance', 'logoUrl', 'Logo URL', 'url')}
                              {renderField('appearance', 'faviconUrl', 'Favicon URL', 'url')}
                              {renderField('appearance', 'customCss', 'Custom CSS', 'textarea')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Save Button */}
                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={() => handleSave(activeTab)}
                          disabled={saving}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
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
