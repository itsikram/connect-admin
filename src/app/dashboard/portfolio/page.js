'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminSidebar from '../../../components/AdminSidebar';
import { useAuth } from '../../../contexts/AuthContext';
import { API_CONFIG } from '../../../lib/config';
import portfolioDefaults from '../../../lib/portfolioDefaults';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'social', label: 'Social' },
  { id: 'hero', label: 'Hero / Home' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'about', label: 'About Page' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'contact', label: 'Contact' },
  { id: 'seo', label: 'SEO & Footer' },
];

/** Deep-merge API/saved data onto current portfolio defaults so inputs never start blank. */
function mergePortfolio(saved) {
  const base = structuredClone(portfolioDefaults);
  if (!saved || typeof saved !== 'object') return base;

  const mergeObject = (target, source) => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) return source ?? target;
    const out = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] === undefined || source[key] === null) continue;
      if (Array.isArray(source[key])) {
        out[key] = source[key];
      } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        out[key] = mergeObject(target?.[key] || {}, source[key]);
      } else {
        out[key] = source[key];
      }
    }
    return out;
  };

  const merged = mergeObject(base, saved);
  // Keep Mongo metadata if present
  if (saved._id) merged._id = saved._id;
  if (saved.createdAt) merged.createdAt = saved.createdAt;
  if (saved.updatedAt) merged.updatedAt = saved.updatedAt;
  return merged;
}

function Field({ label, children, hint }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white';

function TextInput(props) {
  return <input className={inputClass} {...props} />;
}

function TextArea(props) {
  return <textarea className={`${inputClass} min-h-[96px]`} {...props} />;
}

function SectionCard({ title, children, actions }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {actions}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ArrayToolbar({ onAdd, addLabel = 'Add item' }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200"
    >
      + {addLabel}
    </button>
  );
}

export default function PortfolioAdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [data, setData] = useState(() => mergePortfolio(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { admin, getToken, logout } = useAuth();

  const apiBase = useMemo(
    () => `${API_CONFIG.BASE_URL.replace(/\/+$/, '')}/api/portfolio`,
    []
  );

  const resolveMediaUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('blob:')) return url;
    return `https://connect-zfgx.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const authHeaders = useCallback(() => {
    const token = getToken?.() || (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiBase);
      if (res.status === 200 && res.data?.profile) {
        setData(mergePortfolio(res.data));
      } else {
        setData(mergePortfolio(null));
        showMessage('success', 'Showing current portfolio defaults. Save to sync them to the server.');
      }
    } catch (err) {
      console.error(err);
      setData(mergePortfolio(null));
      showMessage(
        'success',
        'Showing current portfolio page content. Deploy/restart the API, then Save to persist edits.'
      );
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  const setPath = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] == null) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const {
        _id,
        __v,
        createdAt,
        updatedAt,
        ...payload
      } = data;
      const res = await axios.put(apiBase, payload, { headers: authHeaders() });
      if (res.status === 200) {
        setData(mergePortfolio(res.data));
        showMessage('success', 'Portfolio content saved. Live site will show updates on refresh.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        showMessage('error', 'Session expired. Please log in again.');
        logout?.();
      } else {
        showMessage('error', err.response?.data?.message || 'Failed to save portfolio');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all portfolio content to defaults? This cannot be undone.')) return;
    setSaving(true);
    try {
      const res = await axios.post(`${apiBase}/reset`, {}, { headers: authHeaders() });
      if (res.status === 200) {
        setData(mergePortfolio(res.data));
        showMessage('success', 'Portfolio reset to defaults.');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to reset portfolio');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please choose an image file (JPG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showMessage('error', 'Image must be under 8MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post(`${API_CONFIG.BASE_URL.replace(/\/+$/, '')}/api/upload/admin`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.secure_url || res.data?.url;
      if (!url) throw new Error('No image URL returned');
      setPath('profile.avatarUrl', url);
      showMessage('success', 'Photo uploaded. Click Save changes to publish it on the portfolio.');
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.error?.message || err.response?.data?.error || 'Image upload failed. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const csvToList = (value) =>
    String(value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const listToCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Content</h1>
                <p className="text-xs text-gray-500">Edit everything shown on /portfolio</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`${(typeof window !== 'undefined' && window.location.hostname.includes('localhost')
                  ? 'http://localhost:3000'
                  : 'https://connect-zfgx.onrender.com')}/portfolio`}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:inline-flex dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Preview
              </a>
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || loading}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </header>

          {message.text ? (
            <div
              className={`px-4 py-2 text-sm lg:px-6 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div className="border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 lg:px-6">
            <div className="flex gap-1 overflow-x-auto py-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-gray-500">Loading portfolio…</div>
            ) : (
              <div className="mx-auto max-w-5xl space-y-5">
                {activeTab === 'profile' && (
                  <SectionCard title="Profile & identity">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Display name">
                        <TextInput value={data.profile?.name || ''} onChange={(e) => setPath('profile.name', e.target.value)} />
                      </Field>
                      <Field label="Job title">
                        <TextInput value={data.profile?.jobTitle || ''} onChange={(e) => setPath('profile.jobTitle', e.target.value)} />
                      </Field>
                      <Field label="Alternate names" hint="Comma-separated">
                        <TextInput
                          value={listToCsv(data.profile?.alternateNames)}
                          onChange={(e) => setPath('profile.alternateNames', csvToList(e.target.value))}
                        />
                      </Field>
                      <Field label="Tagline">
                        <TextInput value={data.profile?.tagline || ''} onChange={(e) => setPath('profile.tagline', e.target.value)} />
                      </Field>
                      <Field label="CV / Resume URL">
                        <TextInput value={data.profile?.cvUrl || ''} onChange={(e) => setPath('profile.cvUrl', e.target.value)} />
                      </Field>
                    </div>

                    <div className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-600">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                          {data.profile?.avatarUrl ? (
                            <img
                              src={resolveMediaUrl(data.profile.avatarUrl)}
                              alt="Portfolio avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No photo</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Profile photo</p>
                          <p className="text-xs text-gray-500">
                            Upload a new image for the portfolio sidebar and SEO preview. JPG/PNG/WebP, max 8MB.
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              className={`inline-flex cursor-pointer items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 ${
                                uploadingAvatar ? 'pointer-events-none opacity-60' : ''
                              }`}
                            >
                              {uploadingAvatar ? 'Uploading…' : 'Upload image'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingAvatar}
                                onChange={handleAvatarUpload}
                              />
                            </label>
                            {data.profile?.avatarUrl ? (
                              <button
                                type="button"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                onClick={() => setPath('profile.avatarUrl', '')}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <Field label="Or paste image URL">
                            <TextInput
                              value={data.profile?.avatarUrl || ''}
                              onChange={(e) => setPath('profile.avatarUrl', e.target.value)}
                              placeholder="https://…"
                            />
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Email">
                        <TextInput type="email" value={data.profile?.email || ''} onChange={(e) => setPath('profile.email', e.target.value)} />
                      </Field>
                      <Field label="Phone">
                        <TextInput value={data.profile?.phone || ''} onChange={(e) => setPath('profile.phone', e.target.value)} />
                      </Field>
                      <Field label="Website">
                        <TextInput value={data.profile?.website || ''} onChange={(e) => setPath('profile.website', e.target.value)} />
                      </Field>
                      <Field label="Date of birth">
                        <TextInput value={data.profile?.dateOfBirth || ''} onChange={(e) => setPath('profile.dateOfBirth', e.target.value)} />
                      </Field>
                      <Field label="Religion">
                        <TextInput value={data.profile?.religion || ''} onChange={(e) => setPath('profile.religion', e.target.value)} />
                      </Field>
                      <Field label="Nationality">
                        <TextInput value={data.profile?.nationality || ''} onChange={(e) => setPath('profile.nationality', e.target.value)} />
                      </Field>
                      <Field label="Address line 1">
                        <TextInput value={data.profile?.addressLine1 || ''} onChange={(e) => setPath('profile.addressLine1', e.target.value)} />
                      </Field>
                      <Field label="Address line 2">
                        <TextInput value={data.profile?.addressLine2 || ''} onChange={(e) => setPath('profile.addressLine2', e.target.value)} />
                      </Field>
                      <Field label="City / Locality">
                        <TextInput value={data.profile?.locality || ''} onChange={(e) => setPath('profile.locality', e.target.value)} />
                      </Field>
                      <Field label="Country">
                        <TextInput value={data.profile?.country || ''} onChange={(e) => setPath('profile.country', e.target.value)} />
                      </Field>
                      <Field label="Hobbies">
                        <TextInput value={data.profile?.hobbies || ''} onChange={(e) => setPath('profile.hobbies', e.target.value)} />
                      </Field>
                      <Field label="Languages">
                        <TextInput value={data.profile?.languages || ''} onChange={(e) => setPath('profile.languages', e.target.value)} />
                      </Field>
                    </div>
                    <p className="text-xs text-gray-500">Signed in as {admin?.fullName || admin?.email || 'admin'}</p>
                  </SectionCard>
                )}

                {activeTab === 'social' && (
                  <SectionCard title="Social links">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {['facebook', 'linkedin', 'github', 'twitter'].map((key) => (
                        <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                          <TextInput
                            value={data.social?.[key] || ''}
                            onChange={(e) => setPath(`social.${key}`, e.target.value)}
                            placeholder="https://"
                          />
                        </Field>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {activeTab === 'hero' && (
                  <>
                    <SectionCard title="Hero section">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Eyebrow badge">
                          <TextInput value={data.hero?.eyebrow || ''} onChange={(e) => setPath('hero.eyebrow', e.target.value)} />
                        </Field>
                        <Field label="Title prefix">
                          <TextInput value={data.hero?.titlePrefix || ''} onChange={(e) => setPath('hero.titlePrefix', e.target.value)} />
                        </Field>
                        <Field label="Highlighted name">
                          <TextInput value={data.hero?.highlightedName || ''} onChange={(e) => setPath('hero.highlightedName', e.target.value)} />
                        </Field>
                      </div>
                      <Field label="Hero description">
                        <TextArea rows={5} value={data.hero?.description || ''} onChange={(e) => setPath('hero.description', e.target.value)} />
                      </Field>
                    </SectionCard>

                    <SectionCard title="Home — About block">
                      <Field label="Section title">
                        <TextInput value={data.homeAbout?.title || ''} onChange={(e) => setPath('homeAbout.title', e.target.value)} />
                      </Field>
                      <Field label="Subtitle">
                        <TextInput value={data.homeAbout?.subtitle || ''} onChange={(e) => setPath('homeAbout.subtitle', e.target.value)} />
                      </Field>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Cards</h4>
                          <ArrayToolbar
                            addLabel="Add card"
                            onAdd={() =>
                              setPath('homeAbout.cards', [...(data.homeAbout?.cards || []), { title: '', body: '' }])
                            }
                          />
                        </div>
                        {(data.homeAbout?.cards || []).map((card, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                            <div className="mb-2 flex justify-end">
                              <button
                                type="button"
                                className="text-xs text-red-600"
                                onClick={() =>
                                  setPath(
                                    'homeAbout.cards',
                                    (data.homeAbout?.cards || []).filter((_, i) => i !== idx)
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                            <div className="space-y-2">
                              <TextInput
                                placeholder="Card title"
                                value={card.title || ''}
                                onChange={(e) => {
                                  const cards = [...(data.homeAbout?.cards || [])];
                                  cards[idx] = { ...cards[idx], title: e.target.value };
                                  setPath('homeAbout.cards', cards);
                                }}
                              />
                              <TextArea
                                placeholder="Card body"
                                value={card.body || ''}
                                onChange={(e) => {
                                  const cards = [...(data.homeAbout?.cards || [])];
                                  cards[idx] = { ...cards[idx], body: e.target.value };
                                  setPath('homeAbout.cards', cards);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>

                    <SectionCard title="Home — Experience & Contact headings">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Experience title">
                          <TextInput value={data.homeExperience?.title || ''} onChange={(e) => setPath('homeExperience.title', e.target.value)} />
                        </Field>
                        <Field label="Experience subtitle">
                          <TextInput value={data.homeExperience?.subtitle || ''} onChange={(e) => setPath('homeExperience.subtitle', e.target.value)} />
                        </Field>
                        <Field label="Contact title">
                          <TextInput value={data.homeContact?.title || ''} onChange={(e) => setPath('homeContact.title', e.target.value)} />
                        </Field>
                        <Field label="Contact subtitle">
                          <TextInput value={data.homeContact?.subtitle || ''} onChange={(e) => setPath('homeContact.subtitle', e.target.value)} />
                        </Field>
                      </div>
                    </SectionCard>
                  </>
                )}

                {activeTab === 'skills' && (
                  <SectionCard
                    title="Skills"
                    actions={
                      <ArrayToolbar
                        addLabel="Add group"
                        onAdd={() =>
                          setPath('skills.groups', [...(data.skills?.groups || []), { title: 'New group', items: [] }])
                        }
                      />
                    }
                  >
                    <Field label="Section title">
                      <TextInput value={data.skills?.title || ''} onChange={(e) => setPath('skills.title', e.target.value)} />
                    </Field>
                    <Field label="Subtitle">
                      <TextInput value={data.skills?.subtitle || ''} onChange={(e) => setPath('skills.subtitle', e.target.value)} />
                    </Field>
                    {(data.skills?.groups || []).map((group, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Group {idx + 1}</span>
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() =>
                              setPath(
                                'skills.groups',
                                (data.skills?.groups || []).filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-2">
                          <TextInput
                            placeholder="Group title"
                            value={group.title || ''}
                            onChange={(e) => {
                              const groups = [...(data.skills?.groups || [])];
                              groups[idx] = { ...groups[idx], title: e.target.value };
                              setPath('skills.groups', groups);
                            }}
                          />
                          <Field label="Skills" hint="Comma-separated">
                            <TextInput
                              value={listToCsv(group.items)}
                              onChange={(e) => {
                                const groups = [...(data.skills?.groups || [])];
                                groups[idx] = { ...groups[idx], items: csvToList(e.target.value) };
                                setPath('skills.groups', groups);
                              }}
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </SectionCard>
                )}

                {activeTab === 'projects' && (
                  <SectionCard
                    title="Projects"
                    actions={
                      <ArrayToolbar
                        addLabel="Add project"
                        onAdd={() =>
                          setPath('projects.items', [
                            ...(data.projects?.items || []),
                            { title: '', description: '', tags: [] },
                          ])
                        }
                      />
                    }
                  >
                    <Field label="Section title">
                      <TextInput value={data.projects?.title || ''} onChange={(e) => setPath('projects.title', e.target.value)} />
                    </Field>
                    <Field label="Subtitle">
                      <TextInput value={data.projects?.subtitle || ''} onChange={(e) => setPath('projects.subtitle', e.target.value)} />
                    </Field>
                    {(data.projects?.items || []).map((item, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600 space-y-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() =>
                              setPath(
                                'projects.items',
                                (data.projects?.items || []).filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <TextInput
                          placeholder="Project title"
                          value={item.title || ''}
                          onChange={(e) => {
                            const items = [...(data.projects?.items || [])];
                            items[idx] = { ...items[idx], title: e.target.value };
                            setPath('projects.items', items);
                          }}
                        />
                        <TextArea
                          placeholder="Description"
                          value={item.description || ''}
                          onChange={(e) => {
                            const items = [...(data.projects?.items || [])];
                            items[idx] = { ...items[idx], description: e.target.value };
                            setPath('projects.items', items);
                          }}
                        />
                        <Field label="Tags" hint="Comma-separated">
                          <TextInput
                            value={listToCsv(item.tags)}
                            onChange={(e) => {
                              const items = [...(data.projects?.items || [])];
                              items[idx] = { ...items[idx], tags: csvToList(e.target.value) };
                              setPath('projects.items', items);
                            }}
                          />
                        </Field>
                      </div>
                    ))}
                  </SectionCard>
                )}

                {activeTab === 'experience' && (
                  <SectionCard
                    title="Work experience"
                    actions={
                      <ArrayToolbar
                        addLabel="Add role"
                        onAdd={() =>
                          setPath('experiences', [
                            ...(data.experiences || []),
                            { role: '', company: '', location: '', period: '', bullets: [] },
                          ])
                        }
                      />
                    }
                  >
                    <Field label="Resume page title">
                      <TextInput value={data.resumePage?.title || ''} onChange={(e) => setPath('resumePage.title', e.target.value)} />
                    </Field>
                    <Field label="Resume page subtitle">
                      <TextInput value={data.resumePage?.subtitle || ''} onChange={(e) => setPath('resumePage.subtitle', e.target.value)} />
                    </Field>
                    {(data.experiences || []).map((exp, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Role {idx + 1}</span>
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() =>
                              setPath(
                                'experiences',
                                (data.experiences || []).filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <TextInput
                            placeholder="Role"
                            value={exp.role || ''}
                            onChange={(e) => {
                              const list = [...(data.experiences || [])];
                              list[idx] = { ...list[idx], role: e.target.value };
                              setPath('experiences', list);
                            }}
                          />
                          <TextInput
                            placeholder="Company"
                            value={exp.company || ''}
                            onChange={(e) => {
                              const list = [...(data.experiences || [])];
                              list[idx] = { ...list[idx], company: e.target.value };
                              setPath('experiences', list);
                            }}
                          />
                          <TextInput
                            placeholder="Location"
                            value={exp.location || ''}
                            onChange={(e) => {
                              const list = [...(data.experiences || [])];
                              list[idx] = { ...list[idx], location: e.target.value };
                              setPath('experiences', list);
                            }}
                          />
                          <TextInput
                            placeholder="Period"
                            value={exp.period || ''}
                            onChange={(e) => {
                              const list = [...(data.experiences || [])];
                              list[idx] = { ...list[idx], period: e.target.value };
                              setPath('experiences', list);
                            }}
                          />
                        </div>
                        <Field label="Bullets" hint="One bullet per line">
                          <TextArea
                            rows={4}
                            value={(exp.bullets || []).join('\n')}
                            onChange={(e) => {
                              const list = [...(data.experiences || [])];
                              list[idx] = {
                                ...list[idx],
                                bullets: e.target.value
                                  .split('\n')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              };
                              setPath('experiences', list);
                            }}
                          />
                        </Field>
                      </div>
                    ))}
                  </SectionCard>
                )}

                {activeTab === 'education' && (
                  <SectionCard
                    title="Education"
                    actions={
                      <ArrayToolbar
                        addLabel="Add education"
                        onAdd={() =>
                          setPath('education', [
                            ...(data.education || []),
                            { title: '', field: '', org: '', result: '', period: '', board: '' },
                          ])
                        }
                      />
                    }
                  >
                    {(data.education || []).map((edu, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600 space-y-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() =>
                              setPath(
                                'education',
                                (data.education || []).filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {['title', 'field', 'org', 'result', 'period', 'board'].map((key) => (
                            <TextInput
                              key={key}
                              placeholder={key}
                              value={edu[key] || ''}
                              onChange={(e) => {
                                const list = [...(data.education || [])];
                                list[idx] = { ...list[idx], [key]: e.target.value };
                                setPath('education', list);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </SectionCard>
                )}

                {activeTab === 'about' && (
                  <SectionCard title="About page">
                    <Field label="Page title">
                      <TextInput value={data.aboutPage?.title || ''} onChange={(e) => setPath('aboutPage.title', e.target.value)} />
                    </Field>
                    <Field label="Subtitle">
                      <TextArea value={data.aboutPage?.subtitle || ''} onChange={(e) => setPath('aboutPage.subtitle', e.target.value)} />
                    </Field>
                    <Field label="Career objectives">
                      <TextArea
                        rows={5}
                        value={data.aboutPage?.careerObjectives || ''}
                        onChange={(e) => setPath('aboutPage.careerObjectives', e.target.value)}
                      />
                    </Field>
                    <Field label="Key strengths" hint="One per line">
                      <TextArea
                        rows={4}
                        value={(data.aboutPage?.strengths || []).join('\n')}
                        onChange={(e) =>
                          setPath(
                            'aboutPage.strengths',
                            e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                    </Field>
                  </SectionCard>
                )}

                {activeTab === 'blogs' && (
                  <SectionCard
                    title="Blog posts"
                    actions={
                      <ArrayToolbar
                        addLabel="Add post"
                        onAdd={() =>
                          setPath('blogs.posts', [
                            ...(data.blogs?.posts || []),
                            { title: '', excerpt: '', date: '', tags: [], readTime: '', link: '' },
                          ])
                        }
                      />
                    }
                  >
                    <Field label="Section title">
                      <TextInput value={data.blogs?.title || ''} onChange={(e) => setPath('blogs.title', e.target.value)} />
                    </Field>
                    <Field label="Subtitle">
                      <TextInput value={data.blogs?.subtitle || ''} onChange={(e) => setPath('blogs.subtitle', e.target.value)} />
                    </Field>
                    {(data.blogs?.posts || []).map((post, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-600 space-y-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() =>
                              setPath(
                                'blogs.posts',
                                (data.blogs?.posts || []).filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <TextInput
                          placeholder="Title"
                          value={post.title || ''}
                          onChange={(e) => {
                            const posts = [...(data.blogs?.posts || [])];
                            posts[idx] = { ...posts[idx], title: e.target.value };
                            setPath('blogs.posts', posts);
                          }}
                        />
                        <TextArea
                          placeholder="Excerpt"
                          value={post.excerpt || ''}
                          onChange={(e) => {
                            const posts = [...(data.blogs?.posts || [])];
                            posts[idx] = { ...posts[idx], excerpt: e.target.value };
                            setPath('blogs.posts', posts);
                          }}
                        />
                        <div className="grid gap-2 sm:grid-cols-3">
                          <TextInput
                            placeholder="Date"
                            value={post.date || ''}
                            onChange={(e) => {
                              const posts = [...(data.blogs?.posts || [])];
                              posts[idx] = { ...posts[idx], date: e.target.value };
                              setPath('blogs.posts', posts);
                            }}
                          />
                          <TextInput
                            placeholder="Read time"
                            value={post.readTime || ''}
                            onChange={(e) => {
                              const posts = [...(data.blogs?.posts || [])];
                              posts[idx] = { ...posts[idx], readTime: e.target.value };
                              setPath('blogs.posts', posts);
                            }}
                          />
                          <TextInput
                            placeholder="Link"
                            value={post.link || ''}
                            onChange={(e) => {
                              const posts = [...(data.blogs?.posts || [])];
                              posts[idx] = { ...posts[idx], link: e.target.value };
                              setPath('blogs.posts', posts);
                            }}
                          />
                        </div>
                        <Field label="Tags" hint="Comma-separated">
                          <TextInput
                            value={listToCsv(post.tags)}
                            onChange={(e) => {
                              const posts = [...(data.blogs?.posts || [])];
                              posts[idx] = { ...posts[idx], tags: csvToList(e.target.value) };
                              setPath('blogs.posts', posts);
                            }}
                          />
                        </Field>
                      </div>
                    ))}
                  </SectionCard>
                )}

                {activeTab === 'contact' && (
                  <SectionCard title="Contact page">
                    <Field label="Page title">
                      <TextInput value={data.contactPage?.title || ''} onChange={(e) => setPath('contactPage.title', e.target.value)} />
                    </Field>
                    <Field label="Subtitle">
                      <TextArea value={data.contactPage?.subtitle || ''} onChange={(e) => setPath('contactPage.subtitle', e.target.value)} />
                    </Field>
                    <Field label="Mail subject prefix">
                      <TextInput
                        value={data.contactPage?.mailSubjectPrefix || ''}
                        onChange={(e) => setPath('contactPage.mailSubjectPrefix', e.target.value)}
                      />
                    </Field>
                    <p className="text-xs text-gray-500">
                      Email, phone, address, and social buttons come from the Profile and Social tabs.
                    </p>
                  </SectionCard>
                )}

                {activeTab === 'seo' && (
                  <SectionCard title="SEO & footer">
                    <Field label="Home page title (browser tab)">
                      <TextInput value={data.seo?.homeTitle || ''} onChange={(e) => setPath('seo.homeTitle', e.target.value)} />
                    </Field>
                    <Field label="Home meta description">
                      <TextArea value={data.seo?.homeDescription || ''} onChange={(e) => setPath('seo.homeDescription', e.target.value)} />
                    </Field>
                    <Field label="Keywords" hint="Comma-separated">
                      <TextArea value={data.seo?.keywords || ''} onChange={(e) => setPath('seo.keywords', e.target.value)} />
                    </Field>
                    <Field label="Footer text">
                      <TextArea value={data.footerText || ''} onChange={(e) => setPath('footerText', e.target.value)} />
                    </Field>
                  </SectionCard>
                )}

                <div className="flex justify-end gap-2 pb-8">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save all changes'}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
