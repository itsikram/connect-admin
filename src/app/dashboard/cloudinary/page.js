'use client';

import { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminSidebar from '../../../components/AdminSidebar';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

const filters = [['all', 'All assets'], ['image', 'Images'], ['video', 'Videos'], ['raw', 'Documents']];

function Icon({ d, className = 'h-5 w-5' }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} /></svg>;
}

function Stat({ label, value, hint, color, d }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"><div className="flex justify-between"><div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p></div><div className={`rounded-xl p-2.5 ${color}`}><Icon d={d} className="h-5 w-5 text-white" /></div></div></div>;
}

export default function CloudinaryPage() {
  const PAGE_SIZE = 50;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const { admin, logout } = useAuth();
  useEffect(() => {
    let mounted = true;
    api.get('/cloudinary/resources')
      .then(({ data }) => {
        if (!mounted) return;
        const resources = Array.isArray(data?.resources) ? data.resources : [];
        setAssets(resources.map((resource, index) => ({
          id: resource.asset_id || resource.public_id || `${resource.resource_type}-${index}`,
          name: resource.original_filename || resource.public_id?.split('/').pop() || 'Untitled asset',
          folder: resource.folder || resource.public_id?.split('/').slice(0, -1).join('/') || 'root',
          format: (resource.format || resource.resource_type || 'file').toUpperCase(),
          size: resource.bytes ? `${(resource.bytes / (1024 * 1024)).toFixed(resource.bytes < 1024 * 1024 ? 2 : 1)} MB` : '—',
          color: resource.resource_type === 'video' ? 'from-cyan-500 to-blue-600' : 'from-indigo-500 to-violet-500',
          initials: (resource.format || resource.resource_type || 'file').slice(0, 2).toUpperCase(),
          type: resource.resource_type || 'raw',
          status: resource.type === 'upload' ? 'Delivered' : 'Private',
          updated: resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'Unknown',
          url: resource.secure_url || '',
          width: resource.width,
          height: resource.height,
          bytes: resource.bytes || 0,
        })));
        setLoadError('');
      })
      .catch(() => {
        if (mounted) setLoadError('Unable to load Cloudinary resources. Check the Cloudinary credentials and try again.');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);
  const visible = useMemo(() => assets.filter((a) => (filter === 'all' || a.type === filter) && `${a.name} ${a.folder}`.toLowerCase().includes(query.toLowerCase())), [assets, filter, query]);
  const displayedAssets = visible.slice(0, visibleCount);
  const hasMoreAssets = displayedAssets.length < visible.length;
  const notify = (text) => { setNotice(text); setTimeout(() => setNotice(''), 2800); };
  const remove = (ids) => { setAssets((current) => current.filter((a) => !ids.includes(a.id))); setSelected([]); setDetail(null); notify('Asset removed from your library'); };
  const initials = admin?.fullName?.split(' ').map((part) => part[0]).join('').toUpperCase() || 'A';

  return <ProtectedRoute><div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
        <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><Icon d="M4 6h16M4 12h16M4 18h16" /><span className="sr-only">Open navigation</span></button>
        <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">Workspace <span className="text-slate-300">/</span> <b className="text-slate-800 dark:text-slate-200">Cloudinary</b></div>
        <div className="flex items-center gap-3"><div className="h-6 w-px bg-slate-200 dark:bg-slate-700" /><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{initials}</div><span className="hidden text-sm font-medium text-slate-700 sm:block dark:text-slate-200">{admin?.fullName || 'Admin'}</span><button type="button" onClick={logout} className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white">Log out</button></div></div>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />Connected to Cloudinary</div><h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Media library</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Organize, inspect, and publish the visual assets powering your platform.</p></div><button type="button" onClick={() => setUploadOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"><Icon d="M12 4v16m8-8H4" className="h-4 w-4" />Upload assets</button></div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Total assets" value={assets.length} hint="+12% from last month" color="bg-indigo-600" d="M4 6a2 2 0 012-2h2l2-2h4l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm8 10a4 4 0 100-8 4 4 0 000 8z" /><Stat label="Storage used" value="31.8 GB" hint="of 50 GB included" color="bg-violet-600" d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm0 3h16m-4 4h.01" /><Stat label="Delivered" value={assets.filter((a) => a.status === 'Delivered').length} hint="Ready for production" color="bg-emerald-600" d="M5 13l4 4L19 7" /><Stat label="Bandwidth" value="2.8 GB" hint="This billing period" color="bg-amber-500" d="M13 10V3L4 14h7v7l9-11h-7z" /></div>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"><div className="border-b border-slate-200 p-4 dark:border-slate-700 sm:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-1 overflow-x-auto">{filters.map(([id, label]) => <button type="button" key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${filter === id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{label}<span className="ml-2 text-xs opacity-60">{id === 'all' ? assets.length : assets.filter((a) => a.type === id).length}</span></button>)}</div><label className="relative block sm:w-64"><Icon d="M21 21l-4.35-4.35m2.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white" /></label></div></div>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 sm:px-5"><label className="flex items-center gap-2"><input type="checkbox" checked={visible.length > 0 && selected.length === visible.length} onChange={() => setSelected(selected.length === visible.length ? [] : visible.map((a) => a.id))} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />Select all</label>{selected.length > 0 ? <button type="button" onClick={() => remove(selected)} className="font-semibold text-rose-600">Delete {selected.length} selected</button> : <span>{visible.length} assets</span>}</div>
          {loading ? <div className="col-span-full px-6 py-20 text-center text-sm text-slate-500">Loading Cloudinary resources...</div> : loadError ? <div className="col-span-full px-6 py-20 text-center"><p className="font-semibold text-rose-600">{loadError}</p></div> : visible.length === 0 ? <div className="col-span-full px-6 py-20 text-center text-sm text-slate-500">No Cloudinary assets match this filter.</div> : <><div className="col-span-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{displayedAssets.map((asset) => <article key={asset.id} className={`group relative overflow-hidden rounded-xl border transition hover:-translate-y-0.5 hover:shadow-lg ${selected.includes(asset.id) ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-700'}`}><button type="button" onClick={() => setSelected(selected.includes(asset.id) ? selected.filter((id) => id !== asset.id) : [...selected, asset.id])} className={`absolute left-3 top-3 z-10 h-5 w-5 rounded border-2 bg-white/90 ${selected.includes(asset.id) ? 'border-indigo-600 bg-indigo-600' : 'border-white opacity-0 group-hover:opacity-100'}`}>{selected.includes(asset.id) && <Icon d="M5 13l4 4L19 7" className="h-4 w-4 text-white" />}<span className="sr-only">Select {asset.name}</span></button><button type="button" onClick={() => setDetail(asset)} className="block w-full text-left"><div className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${asset.color}`}>{asset.url && asset.type === 'video' ? <video src={asset.url} className="h-full w-full object-cover" muted preload="metadata" /> : asset.url ? <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" loading="lazy" /> : <span className="text-3xl font-black text-white/90">{asset.initials}</span>}<span className="absolute right-3 top-3 rounded bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">{asset.format}</span></div><div className="bg-white p-4 dark:bg-slate-800"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-800 dark:text-white">{asset.name}</h3><p className="mt-1 truncate text-xs text-slate-400">/{asset.folder}</p></div><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${asset.status === 'Delivered' ? 'bg-emerald-500' : 'bg-amber-500'}`} /></div><div className="mt-4 flex justify-between text-xs text-slate-400"><span>{asset.size}</span><span>{asset.updated}</span></div></div></button></article>)}</div>{hasMoreAssets && <div className="col-span-full flex flex-col items-center gap-2 border-t border-slate-100 pt-6 dark:border-slate-700"><button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40">Load more assets</button><span className="text-xs text-slate-400">Showing {displayedAssets.length} of {visible.length} matching assets</span></div>}</>}
        </section><p className="mt-4 text-center text-xs text-slate-400">Last synced just now · Cloudinary production environment</p>
      </div></main>
    </div>
    {detail && <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={() => setDetail(null)}><aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Asset details</p><h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{detail.name}</h2></div><button type="button" onClick={() => setDetail(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Icon d="M6 18L18 6M6 6l12 12" /><span className="sr-only">Close details</span></button></div><div className={`mt-6 flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br ${detail.color}`}><span className="text-5xl font-black text-white/90">{detail.initials}</span></div><dl className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">{[['Public ID', `${detail.folder}/${detail.id}`], ['Format', detail.format], ['File size', detail.size], ['Status', detail.status], ['Last updated', detail.updated]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="text-right font-medium text-slate-800 dark:text-slate-200">{value}</dd></div>)}</dl><div className="mt-8 flex gap-3"><button type="button" onClick={() => notify('Delivery URL copied to clipboard')} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Copy URL</button><button type="button" onClick={() => remove([detail.id])} className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600">Delete</button></div></aside></div>}
    {uploadOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setUploadOpen(false)}><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}><div className="flex justify-between"><div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload assets</h2><p className="mt-1 text-sm text-slate-500">Add files to your Cloudinary library.</p></div><button type="button" onClick={() => setUploadOpen(false)} className="text-slate-400"><Icon d="M6 18L18 6M6 6l12 12" /></button></div><label className="mt-6 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-12 text-center hover:bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/20"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"><Icon d="M12 4v16m8-8H4" /></div><p className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">Drop files here or browse</p><p className="mt-1 text-xs text-slate-500">PNG, JPG, SVG, MP4 up to 100 MB</p><input type="file" multiple className="sr-only" onChange={(e) => { if (e.target.files?.length) { setUploadOpen(false); notify(`${e.target.files.length} file(s) queued for upload`); } }} /></label><div className="mt-5 flex justify-end"><button type="button" onClick={() => setUploadOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button></div></div></div>}
    {notice && <div role="status" className="fixed bottom-6 right-6 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{notice}</div>}
  </div></ProtectedRoute>;
}
