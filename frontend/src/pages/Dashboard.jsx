import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Search, Folder, Clock, FileText, Film, Music, Image as ImageIcon,
  Download, PlayCircle, ChevronDown, Filter, ArrowUpDown,
  AlertCircle, LayoutGrid, LayoutList
} from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'az', label: 'A → Z' },
  { key: 'za', label: 'Z → A' },
  { key: 'size_desc', label: 'Largest First' },
  { key: 'size_asc', label: 'Smallest First' },
];

const TYPE_FILTERS = [
  { key: 'all', label: 'All Types' },
  { key: 'video', label: 'Video' },
  { key: 'audio', label: 'Audio' },
  { key: 'image', label: 'Image' },
  { key: 'document', label: 'Document' },
  { key: 'file', label: 'Other' },
];

const EXPIRE_FILTERS = [
  { key: 'all', label: 'All Files' },
  { key: 'active', label: 'Active Only' },
  { key: 'expired', label: 'Expired Only' },
];

function typeIcon(mt) {
  if (mt === 'audio') return <Music size={18} />;
  if (mt === 'image') return <ImageIcon size={18} />;
  if (mt === 'document') return <FileText size={18} />;
  if (mt === 'video') return <Film size={18} />;
  return <FileText size={18} />;
}

export default function Dashboard() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expireFilter, setExpireFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Persist token: if URL has token, save it; otherwise try localStorage
    let token = tokenFromUrl;
    const storedKey = `streamdrop_dash_token_${userId}`;
    if (token) {
      localStorage.setItem(storedKey, token);
      // Also save the full dashboard URL
      localStorage.setItem('streamdrop_dash_url', `/dashboard/${userId}?token=${token}`);
    } else {
      token = localStorage.getItem(storedKey);
    }

    if (!token) {
      setError('No auth token. Please open the dashboard link from the bot.');
      setLoading(false);
      return;
    }

    fetch(`/api/dashboard/${userId}?token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Invalid Token' : `Server Error ${res.status}`);
        return res.json();
      })
      .then(d => {
        const ls = d.links || [];
        setLinks(ls);
        setLoading(false);
        // Save stats for Profile page
        localStorage.setItem('streamdrop_stats', JSON.stringify({
          total: d.total,
          active: ls.filter(l => !l.is_expired).length,
          expired: ls.filter(l => l.is_expired).length,
          userId,
        }));
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, tokenFromUrl]);

  const displayed = useMemo(() => {
    let arr = [...links];

    // Text search
    if (q.trim()) arr = arr.filter(l => l.name.toLowerCase().includes(q.toLowerCase()));

    // Type filter
    if (typeFilter !== 'all') arr = arr.filter(l => l.media_type === typeFilter);

    // Expire filter
    if (expireFilter === 'active') arr = arr.filter(l => !l.is_expired);
    if (expireFilter === 'expired') arr = arr.filter(l => l.is_expired);

    // Sort
    switch (sort) {
      case 'newest': arr.sort((a, b) => b.timestamp - a.timestamp); break;
      case 'oldest': arr.sort((a, b) => a.timestamp - b.timestamp); break;
      case 'az': arr.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'za': arr.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'size_desc': arr.sort((a, b) => (b.size_bytes || 0) - (a.size_bytes || 0)); break;
      case 'size_asc': arr.sort((a, b) => (a.size_bytes || 0) - (b.size_bytes || 0)); break;
    }
    return arr;
  }, [links, q, sort, typeFilter, expireFilter]);

  const activeCount = links.filter(l => !l.is_expired).length;
  const expiredCount = links.filter(l => l.is_expired).length;

  if (loading) return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[color:var(--bg-color)]">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[color:var(--text-muted)] font-semibold">Loading your cloud library...</p>
    </div>
  );

  if (error) return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[color:var(--bg-color)]">
      <AlertCircle size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-[color:var(--text-color)] mb-2">{error}</h2>
      <p className="text-[color:var(--text-muted)] max-w-sm">Please open the dashboard using the secure button in the Telegram bot.</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-[color:var(--bg-color)] text-[color:var(--text-color)] min-h-full">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1">My Cloud Library</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-500 border border-green-500/20">{activeCount} Active</span>
          {expiredCount > 0 && <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">{expiredCount} Expired</span>}
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-[color:var(--surface-color)] text-[color:var(--text-muted)] border border-[color:var(--border-color)]">{links.length} Total</span>
        </div>
      </div>

      {/* Search + Sort + Filter Bar */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search files..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--surface-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted)] focus:border-indigo-500 focus:outline-none transition text-sm font-medium" />
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-[color:var(--surface-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] focus:border-indigo-500 focus:outline-none transition text-sm font-semibold cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none" />
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none" />
          </div>

          {/* Filter toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition ${showFilters ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-[color:var(--surface-color)] border-[color:var(--border-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)]'}`}>
            <Filter size={15} /> Filters
          </button>
        </div>

        {/* Expandable Filter Chips */}
        {showFilters && (
          <div className="p-4 bg-[color:var(--surface-color)] rounded-xl border border-[color:var(--border-color)] flex flex-col gap-4">
            {/* Type */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] mb-2">Media Type</p>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setTypeFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${typeFilter === f.key ? 'bg-indigo-500 text-white' : 'bg-[color:var(--bg-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)] border border-[color:var(--border-color)]'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Expiry */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] mb-2">Expiry Status</p>
              <div className="flex flex-wrap gap-2">
                {EXPIRE_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setExpireFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${expireFilter === f.key ? 'bg-indigo-500 text-white' : 'bg-[color:var(--bg-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)] border border-[color:var(--border-color)]'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-[color:var(--text-muted)] font-semibold mb-3">Showing {displayed.length} of {links.length} files</p>

      {/* File Table */}
      <div className="bg-[color:var(--surface-color)] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-sm">

        {/* Table Header (desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[color:var(--border-color)] text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)] bg-[color:var(--bg-color)]/50">
          <div className="col-span-5">File Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-1">Expires</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-[color:var(--border-color)]">
          {displayed.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Folder size={48} className="text-[color:var(--text-muted)] opacity-20" />
              <p className="text-[color:var(--text-muted)] font-semibold">No files match your filters.</p>
            </div>
          ) : (
            displayed.map((link) => (
              <div key={link.id || link.stream_link}
                className={`flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 md:px-5 md:py-3.5 items-start md:items-center hover:bg-[color:var(--bg-color)] transition-colors ${link.is_expired ? 'opacity-50' : ''}`}>

                {/* Name + icon */}
                <div className="col-span-5 flex items-center gap-3 min-w-0 w-full">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${link.is_expired ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    {link.is_expired ? <Clock size={16} /> : typeIcon(link.media_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[color:var(--text-color)] truncate">{link.name}</p>
                    <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5 md:hidden">{link.size} · {link.expiry}</p>
                  </div>
                </div>

                {/* Type */}
                <div className="hidden md:block col-span-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-muted)]">{link.media_type || 'file'}</span>
                </div>

                {/* Size */}
                <div className="hidden md:block col-span-2 text-sm font-medium text-[color:var(--text-muted)]">{link.size}</div>

                {/* Expiry */}
                <div className="hidden md:block col-span-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${link.is_expired ? 'bg-red-500/10 text-red-500' : link.expiry === 'Never' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                    {link.is_expired ? 'Expired' : link.expiry}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                  {!link.is_expired && (
                    <>
                      <a href={link.stream_link} className="p-2 rounded-lg border border-[color:var(--border-color)] hover:border-indigo-500 hover:text-indigo-500 transition-colors" title="Stream">
                        <PlayCircle size={16} />
                      </a>
                      <button onClick={(e) => {
                        e.preventDefault();
                        const a = document.createElement("a");
                        a.href = `${link.dl_link}?download=true`;
                        a.download = link.name || 'download';
                        a.target = "_blank";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }} className="p-2 rounded-lg border border-[color:var(--border-color)] hover:border-emerald-500 hover:text-emerald-500 transition-colors" title="Download">
                        <Download size={16} />
                      </button>
                    </>
                  )}
                  {link.is_expired && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20">Expired</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
