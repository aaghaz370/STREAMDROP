import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, AlertTriangle, MonitorPlay, Film,
  Smartphone, ExternalLink, Tv2, Music, FileText
} from 'lucide-react';

// Load Plyr dynamically (it injects its own CSS from CDN in index.html)
let plyrLoaded = false;

const AUDIO_EXTS = /\.(mp3|aac|wav|flac|m4a|ogg|opus)$/i;
const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i;
const PDF_EXTS = /\.pdf$/i;

function getFileType(name) {
  if (!name) return 'other';
  if (AUDIO_EXTS.test(name)) return 'audio';
  if (IMAGE_EXTS.test(name)) return 'image';
  if (PDF_EXTS.test(name)) return 'pdf';
  return 'video'; // treat all else (including mkv) as video and let browser/plyr try
}

// ── Plyr-powered Video Player ─────────────────────────────────────────────────
function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !window.Plyr) return;
    playerRef.current = new window.Plyr(videoRef.current, {
      controls: [
        'play-large', 'play', 'rewind', 'fast-forward',
        'progress', 'current-time', 'duration',
        'mute', 'volume', 'pip', 'fullscreen'
      ],
      keyboard: { focused: true, global: true },
      autoplay: true,
      resetOnEnd: false,
      invertTime: false,
    });
    return () => { try { playerRef.current?.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <video ref={videoRef} playsInline className="w-full h-full" preload="metadata">
        <source src={src} />
      </video>
    </div>
  );
}

// ── Plyr-powered Audio Player ─────────────────────────────────────────────────
function AudioPlayer({ src, fileName }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current || !window.Plyr) return;
    const p = new window.Plyr(audioRef.current, {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
      autoplay: true,
    });
    return () => { try { p.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#121212]">
      <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center mb-6 shadow-2xl">
        <Music size={56} className="text-indigo-300" />
      </div>
      <h2 className="text-white font-bold text-xl text-center mb-1 max-w-sm truncate px-4">{fileName}</h2>
      <p className="text-white/40 text-sm mb-8">StreamDrop Audio</p>
      <div className="w-full max-w-md px-4">
        <audio ref={audioRef} playsInline>
          <source src={src} />
        </audio>
      </div>
    </div>
  );
}

// ── External players block (for when browser can't play) ──────────────────────
function ExternalPlayerLinks({ data }) {
  const [copied, setCopied] = useState(false);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const copy = () => {
    navigator.clipboard.writeText(data.direct_dl_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 px-4 space-y-4">
      {/* File card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="w-14 h-14 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
          <Film size={28} />
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{data.file_name}</p>
          <p className="text-white/40 text-xs mt-0.5">{data.file_size}</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-200/80 text-sm">
          This format can't be played in a browser. Use <strong className="text-amber-200">VLC</strong> or <strong className="text-amber-200">MX Player</strong> for the best experience.
        </p>
      </div>

      {/* Player buttons — mobile or desktop */}
      {isMobile ? (
        <div className="space-y-3">
          <a href={data.vlc_player_link_mobile}
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 active:scale-95 transition-all"
          >
            <span className="flex items-center gap-3 font-bold"><Smartphone size={22} /> VLC Mobile</span>
            <span className="text-xs opacity-60">Recommended</span>
          </a>
          <a href={data.mx_player_link}
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 active:scale-95 transition-all"
          >
            <span className="flex items-center gap-3 font-bold"><Tv2 size={22} /> MX Player</span>
            <span className="text-xs opacity-60">Hardware decode</span>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <a href={data.vlc_player_link_pc}
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all"
          >
            <span className="flex items-center gap-3 font-bold"><MonitorPlay size={22} /> Open in VLC Desktop</span>
            <ExternalLink size={18} />
          </a>
          <button onClick={copy}
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 active:scale-95 transition-all"
          >
            <span className="font-medium text-sm">{copied ? '✓ Link Copied!' : '🔗 Copy stream URL for VLC'}</span>
          </button>
        </div>
      )}

      {/* Download */}
      <a href={data.direct_dl_link}
        className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
      >
        <Download size={20} /> Download File
      </a>
    </div>
  );
}

// ── Sidebar queue ─────────────────────────────────────────────────────────────
function SidebarQueue({ currentId, files }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const shown = useMemo(() => {
    if (!files?.length) return [];
    return files.filter(f => {
      if (filter !== 'all' && f.type !== filter) return false;
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [files, filter, search]);

  if (!files?.length) return null;

  const iconFor = (type) => type === 'video' ? '▶' : type === 'audio' ? '♪' : '📄';

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[color:var(--border-color)] space-y-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-[color:var(--text-muted)]">Up Next</h3>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full px-3 py-2 text-sm rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] focus:border-indigo-500 outline-none"
        />
        <div className="flex gap-2">
          {['all', 'video', 'audio'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${filter === t ? 'bg-indigo-500 text-white' : 'bg-[color:var(--bg-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)]'}`}
            >{t}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {shown.length === 0
          ? <p className="text-[color:var(--text-muted)] text-sm text-center py-8">No files match.</p>
          : shown.map(f => (
            <a key={f.id} href={f.stream_link}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-[color:var(--bg-color)] ${f.id === currentId ? 'text-indigo-400 bg-indigo-500/5' : 'text-[color:var(--text-muted)]'}`}
            >
              <div className="w-9 h-9 rounded-lg bg-[color:var(--bg-color)] flex items-center justify-center text-sm flex-shrink-0">
                {iconFor(f.type)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-[color:var(--text-color)]">{f.name}</p>
                <p className="text-xs opacity-60 mt-0.5">{f.size}</p>
              </div>
            </a>
          ))
        }
      </div>
    </div>
  );
}

// ── Main Show Page ────────────────────────────────────────────────────────────
export default function Show() {
  const { uniqueId } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | expired | error
  const [data, setData] = useState(null);
  const [plyrReady, setPlyrReady] = useState(false);

  // Load Plyr.js from CDN once
  useEffect(() => {
    if (window.Plyr) { setPlyrReady(true); return; }
    
    // Load CSS
    if (!document.querySelector('link[data-plyr]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
      link.setAttribute('data-plyr', '1');
      document.head.appendChild(link);
    }
    
    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js';
    script.onload = () => setPlyrReady(true);
    script.onerror = () => setPlyrReady(false);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    fetch(`/api/file/${uniqueId}`)
      .then(async res => {
        if (res.status === 410) { setStatus('expired'); return null; }
        if (!res.ok) { setStatus('error'); return null; }
        return res.json();
      })
      .then(d => {
        if (!d) return;
        setData(d);
        document.title = `${d.file_name} — StreamDrop`;
        if (d.dashboard_link) localStorage.setItem('streamdrop_dash_url', d.dashboard_link);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [uniqueId]);

  // ── Loading ──
  if (status === 'loading') return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[color:var(--text-muted)] text-sm tracking-widest uppercase font-bold animate-pulse">Connecting...</p>
    </div>
  );

  // ── Expired ──
  if (status === 'expired') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">⏰</div>
      <h2 className="text-2xl font-bold mb-2">Link Expired</h2>
      <p className="text-[color:var(--text-muted)] max-w-sm text-sm mb-6">
        This link has expired. Send the file to the bot again to get a fresh stream link.
      </p>
      <a href="https://t.me/STREAM_DROP_BOT" target="_blank"
        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition active:scale-95"
      >Open Bot</a>
    </div>
  );

  // ── Error ──
  if (status === 'error') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle size={52} className="text-red-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">File Not Found</h2>
      <p className="text-[color:var(--text-muted)] max-w-sm text-sm">
        This file was removed or the link is invalid.
      </p>
    </div>
  );

  const fileType = getFileType(data.file_name);
  const isMedia = data.is_media;
  const canPlayInBrowser = isMedia && (fileType === 'audio' || fileType === 'video');

  // For video — try plyr anyway, show external panel on right for MKV hint
  const isMkv = data.file_name.toLowerCase().endsWith('.mkv');

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      
      {/* ── Player Area ── */}
      <div className={`w-full flex-shrink-0 ${
        fileType === 'video' ? 'h-[56vw] max-h-[60vh] md:h-[55vh] bg-black' :
        fileType === 'audio' ? 'h-auto md:h-72' :
        'h-0'
      }`}>
        {plyrReady && fileType === 'video' && (
          <VideoPlayer src={data.direct_dl_link} />
        )}
        {plyrReady && fileType === 'audio' && (
          <AudioPlayer src={data.direct_dl_link} fileName={data.file_name} />
        )}
        {fileType === 'video' && !plyrReady && (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── Content Row (below player on mobile, flex on desktop) ── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

        {/* Left: Meta + Actions */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* File info */}
          <div>
            <h1 className="text-lg font-bold break-all leading-snug">{data.file_name}</h1>
            <p className="text-[color:var(--text-muted)] text-sm mt-1">{data.file_size}</p>
          </div>

          {/* MKV notice */}
          {isMkv && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200/80 text-sm">
                MKV may not play in all browsers. If the player above is black, use external players below.
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <a href={data.direct_dl_link}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Download size={18} /> Download
            </a>
            {fileType === 'video' && (
              <>
                <a href={data.vlc_player_link_mobile}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition active:scale-95 font-semibold text-sm"
                >
                  <Smartphone size={18} /> VLC Mobile
                </a>
                <a href={data.mx_player_link}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition active:scale-95 font-semibold text-sm"
                >
                  <Tv2 size={18} /> MX Player
                </a>
                <a href={data.vlc_player_link_pc}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition active:scale-95 font-semibold text-sm"
                >
                  <MonitorPlay size={18} /> VLC PC
                </a>
              </>
            )}
          </div>

          {/* Image / PDF viewer */}
          {fileType === 'image' && (
            <img src={data.direct_dl_link} alt={data.file_name}
              className="max-w-full max-h-[60vh] object-contain rounded-xl border border-[color:var(--border-color)]"
            />
          )}
          {fileType === 'pdf' && (
            <iframe src={data.direct_dl_link} className="w-full h-[70vh] rounded-xl border border-[color:var(--border-color)]" />
          )}
        </div>

        {/* Right: Sidebar */}
        {data.user_files?.length > 0 && (
          <div className="w-full md:w-72 flex-shrink-0 border-t md:border-t-0 md:border-l border-[color:var(--border-color)] bg-[color:var(--surface-color)] overflow-hidden flex flex-col">
            <SidebarQueue currentId={uniqueId} files={data.user_files} />
          </div>
        )}
      </div>
    </div>
  );
}
