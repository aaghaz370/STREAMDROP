import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Folder, Clock, FileText, PlayCircle, Download, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Save to local storage for the Sidebar!
    if (userId && token) {
      localStorage.setItem('streamdrop_dash_url', `/dashboard/${userId}?token=${token}`);
    }

    fetch(`/api/dashboard/${userId}?token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error('Access Denied or Invalid Token');
        return res.json();
      })
      .then(d => {
        setLinks(d.links);
        setFilteredLinks(d.links);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, token]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLinks(links);
    } else {
      setFilteredLinks(links.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())));
    }
  }, [searchQuery, links]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-[color:var(--text-muted)] animate-pulse font-medium">Loading your cloud storage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-3xl font-bold mb-3">{error}</h2>
        <p className="text-[color:var(--text-muted)] max-w-md">
          Please access the dashboard using the secure button inside the Telegram bot.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">My Files</h1>
          <p className="text-[color:var(--text-muted)] font-medium">
            Manage your StreamDrop cloud storage.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-[color:var(--text-muted)]" size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-[color:var(--border-color)] rounded-xl leading-5 bg-[color:var(--surface-color)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[color:var(--surface-color)] rounded-2xl shadow-sm border border-[color:var(--border-color)] overflow-hidden">
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-[color:var(--border-color)] bg-[color:var(--bg-color)]/50 text-[color:var(--text-muted)] font-semibold text-sm uppercase tracking-wider">
          <div className="col-span-6">File Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Expiry</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-[color:var(--border-color)]">
          {filteredLinks.length === 0 ? (
            <div className="p-12 text-center text-[color:var(--text-muted)] flex flex-col items-center">
              <Folder size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-lg">No files found.</p>
            </div>
          ) : (
            filteredLinks.map((link) => (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                key={link.stream_link}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-[color:var(--bg-color)] transition-colors ${link.is_expired ? 'opacity-60' : ''}`}
              >
                <div className="col-span-1 md:col-span-6 flex items-center gap-4 overflow-hidden">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${link.is_expired ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    {link.is_expired ? <Clock size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[color:var(--text-color)] truncate">{link.name}</p>
                    <p className="text-xs text-[color:var(--text-muted)] md:hidden mt-1">{link.size} • {link.is_expired ? 'Expired' : link.expiry}</p>
                  </div>
                </div>
                
                <div className="hidden md:block col-span-2 text-sm font-medium text-[color:var(--text-muted)]">
                  {link.size}
                </div>
                
                <div className="hidden md:block col-span-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${link.is_expired ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {link.is_expired ? 'Expired' : link.expiry}
                  </span>
                </div>
                
                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                  {!link.is_expired && (
                     <>
                        <a href={link.stream_link} className="p-2 bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors" title="Stream">
                          <PlayCircle size={18} />
                        </a>
                        <a href={link.dl_link} className="p-2 bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors" title="Download">
                          <Download size={18} />
                        </a>
                     </>
                  )}
                  {link.is_expired && (
                    <span className="text-xs font-bold text-red-500 border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-lg">File Removed</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
