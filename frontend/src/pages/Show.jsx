import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, AlertTriangle, MonitorPlay, Film, Smartphone,
  ExternalLink, Tv2, Music, Clock, Search, ChevronRight
} from 'lucide-react';

// ── File type detection ───────────────────────────────────────────────────────
const AUDIO_EXT = /\.(mp3|aac|wav|flac|m4a|ogg|opus)$/i;
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
const PDF_EXT   = /\.pdf$/i;
// Formats that NO browser can decode — skip player, go straight to external
const NO_BROWSER = /\b(hevc|h\.265|x265|10bit|10-bit|hdr|av1|xvid|divx)\b/i;

function classify(name = '') {
  if (AUDIO_EXT.test(name)) return 'audio';
  if (IMAGE_EXT.test(name)) return 'image';
  if (PDF_EXT.test(name))   return 'pdf';
  return 'video';
}

function browserCanPlay(name = '') {
  if (NO_BROWSER.test(name)) return false;
  return true;
}

// ── Load Plyr from CDN ────────────────────────────────────────────────────────
function usePlyr() {
  const [ready, setReady] = useState(!!window.Plyr);
  useEffect(() => {
    if (window.Plyr) return;
    if (!document.querySelector('link[data-plyr-css]')) {
      const l = Object.assign(document.createElement('link'), {
        rel: 'stylesheet', href: 'https://cdn.plyr.io/3.7.8/plyr.css'
      });
      l.setAttribute('data-plyr-css', '1');
      document.head.appendChild(l);
    }
    if (!document.querySelector('script[data-plyr-js]')) {
      const s = Object.assign(document.createElement('script'), {
        src: 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js',
        onload: () => setReady(true),
        onerror: () => setReady(false),
      });
      s.setAttribute('data-plyr-js', '1');
      document.head.appendChild(s);
    }
  }, []);
  return ready;
}

// ── Video Player (Plyr) ───────────────────────────────────────────────────────
function VideoPlayer({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.Plyr) return;
    const p = new window.Plyr(ref.current, {
      controls: ['play-large', 'play', 'rewind', 'fast-forward', 'progress',
                 'current-time', 'duration', 'mute', 'volume', 'pip', 'fullscreen'],
      keyboard: { global: true },
      autoplay: true,
      tooltips: { controls: true, seek: true },
    });
    return () => { try { p.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full h-full bg-black">
      <video ref={ref} playsInline className="w-full h-full">
        <source src={src} />
      </video>
    </div>
  );
}

// ── Audio Player (Plyr) ───────────────────────────────────────────────────────
function AudioPlayer({ src, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.Plyr) return;
    const p = new window.Plyr(ref.current, {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
      autoplay: true,
    });
    return () => { try { p.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-10 gap-6 bg-[color:var(--bg-color)]">
      <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/20 border border-[color:var(--border-color)] flex items-center justify-center shadow-xl">
        <Music size={52} className="text-indigo-400" />
      </div>
      <div className="text-center">
        <p className="font-bold text-[color:var(--text-color)] text-lg line-clamp-2 max-w-sm">{title}</p>
        <p className="text-[color:var(--text-muted)] text-sm mt-1">StreamDrop Audio</p>
      </div>
      <div className="w-full max-w-sm">
        <audio ref={ref} playsInline>
          <source src={src} />
        </audio>
      </div>
    </div>
  );
}

// ── External Player Buttons ───────────────────────────────────────────────────
function PlayerButtons({ data, vertical = false }) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const base = `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm border transition-all active:scale-95`;

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-wrap'} gap-2`}>
      <a href={data.direct_dl_link}
        className={`${base} bg-indigo-500 hover:bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20`}
      >
        <Download size={17} /> Download
      </a>
      {isMobile ? (
        <>
          <a href={data.vlc_player_link_mobile}
            className={`${base} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <Smartphone size={17} className="text-orange-400" /> VLC Mobile
          </a>
          <a href={data.mx_player_link}
            className={`${base} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <Tv2 size={17} className="text-blue-400" /> MX Player
          </a>
        </>
      ) : (
        <>
          <a href={data.vlc_player_link_pc}
            className={`${base} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <MonitorPlay size={17} className="text-purple-400" /> VLC Desktop
          </a>
          <a href={data.vlc_player_link_mobile}
            className={`${base} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <Smartphone size={17} className="text-orange-400" /> VLC Mobile
          </a>
        </>
      )}
    </div>
  );
}

// ── Queue Sidebar ─────────────────────────────────────────────────────────────
function Queue({ currentId, files }) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');

  const shown = useMemo(() => {
    if (!files?.length) return [];
    return files.filter(f =>
      (tab === 'all' || f.type === tab) &&
      (!q || f.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [files, tab, q]);

  if (!files?.length) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[color:var(--border-color)] space-y-3 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Queue</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search files…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted)] focus:border-indigo-500 outline-none transition"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'video', 'audio'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-indigo-500 text-white shadow-sm' : 'bg-[color:var(--bg-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)] border border-[color:var(--border-color)]'}`}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {shown.length === 0
          ? <p className="text-[color:var(--text-muted)] text-sm text-center py-8">No files found.</p>
          : shown.map(f => (
            <a key={f.id} href={f.stream_link}
              className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[color:var(--bg-color)] ${f.id === currentId ? 'border-l-2 border-indigo-500 pl-3.5 text-indigo-400' : 'text-[color:var(--text-color)]'}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${f.id === currentId ? 'bg-indigo-500/10 text-indigo-400' : 'bg-[color:var(--bg-color)] text-[color:var(--text-muted)]'}`}>
                {f.type === 'audio' ? <Music size={16} /> : <Film size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate leading-tight">{f.name}</p>
                <p className="text-xs text-[color:var(--text-muted)] mt-0.5">{f.size}</p>
              </div>
              <ChevronRight size={14} className="text-[color:var(--text-muted)] group-hover:text-indigo-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" />
            </a>
          ))
        }
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Show() {
  const { uniqueId } = useParams();
  const plyrReady = usePlyr();
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/file/${uniqueId}`)
      .then(async r => {
        if (r.status === 410) { setStatus('expired'); return null; }
        if (!r.ok)            { setStatus('error');   return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setData(d);
        document.title = `${d.file_name} — StreamDrop`;
        if (d.dashboard_link) localStorage.setItem('streamdrop_dash_url', d.dashboard_link);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [uniqueId]);

  /* ── States ── */
  if (status === 'loading') return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <div className="w-11 h-11 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[color:var(--text-muted)] text-sm tracking-widest uppercase font-semibold">Loading…</p>
    </div>
  );

  if (status === 'expired') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6">
        <Clock size={36} className="text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Link Expired</h2>
      <p className="text-[color:var(--text-muted)] text-sm max-w-xs">This link has expired. Send the file to the bot again to get a fresh stream link instantly.</p>
    </div>
  );

  if (status === 'error') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle size={36} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">File Not Found</h2>
      <p className="text-[color:var(--text-muted)] text-sm max-w-xs">This file was removed or the link is invalid.</p>
    </div>
  );

  const type = classify(data.file_name);
  const showPlayer = data.is_media && type === 'video' && browserCanPlay(data.file_name) && plyrReady;
  const showAudio  = data.is_media && type === 'audio' && plyrReady;
  const isHevc     = NO_BROWSER.test(data.file_name);
  const isMkv      = data.file_name.toLowerCase().endsWith('.mkv');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col overflow-hidden"
    >
      {/* ── Video Player zone ── */}
      {(type === 'video') && (
        <div className="w-full bg-black flex-shrink-0" style={{ height: 'min(56vw, 58vh)' }}>
          {showPlayer
            ? <VideoPlayer src={data.direct_dl_link} />
            : (
              // Plyr loading spinner or format-not-supported placeholder
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                {!plyrReady
                  ? <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <MonitorPlay size={30} className="text-white/30" />
                      </div>
                      <div className="text-center px-6">
                        <p className="text-white/50 text-sm font-medium">
                          {isHevc ? 'HEVC / 10-bit — cannot play in browser' : 'This format cannot play in browser'}
                        </p>
                        <p className="text-white/30 text-xs mt-1">Use an external player below</p>
                      </div>
                    </>
                  )
                }
              </div>
            )
          }
        </div>
      )}

      {/* ── Audio zone ── */}
      {type === 'audio' && (
        <div className="w-full flex-shrink-0">
          {showAudio
            ? <AudioPlayer src={data.direct_dl_link} title={data.file_name} />
            : <div className="h-24 flex items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
          }
        </div>
      )}

      {/* ── Main content row ── */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden border-t border-[color:var(--border-color)]">

        {/* Left column */}
        <div className="flex-1 min-w-0 overflow-y-auto p-5 md:p-7 space-y-5">

          {/* File name + size */}
          <div>
            <h1 className="text-lg font-bold leading-snug text-[color:var(--text-color)] break-words">{data.file_name}</h1>
            <p className="text-[color:var(--text-muted)] text-sm mt-1">{data.file_size}</p>
          </div>

          {/* Notice for formats that won't play */}
          {type === 'video' && (isMkv || isHevc) && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-400/5 border border-amber-400/20">
              <AlertTriangle size={17} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[color:var(--text-muted)] text-sm leading-relaxed">
                {isHevc
                  ? 'HEVC / 10-bit video cannot be decoded by any browser. Use VLC or MX Player for full-quality playback.'
                  : 'MKV may not play in all browsers. If the player shows black, open in VLC or MX Player.'}
              </p>
            </div>
          )}

          {/* Image viewer */}
          {type === 'image' && (
            <img src={data.direct_dl_link} alt={data.file_name}
              className="max-w-full max-h-[65vh] object-contain rounded-xl border border-[color:var(--border-color)]"
            />
          )}

          {/* PDF viewer */}
          {type === 'pdf' && (
            <iframe src={data.direct_dl_link}
              className="w-full rounded-xl border border-[color:var(--border-color)]"
              style={{ height: '72vh' }}
            />
          )}

          {/* Action buttons */}
          <PlayerButtons data={data} />

          {/* Mobile queue (shows only when no right sidebar space) */}
          {data.user_files?.length > 0 && (
            <div className="md:hidden border-t border-[color:var(--border-color)] pt-5">
              <Queue currentId={uniqueId} files={data.user_files} />
            </div>
          )}
        </div>

        {/* Right column — queue */}
        {data.user_files?.length > 0 && (
          <div className="hidden md:flex w-72 flex-shrink-0 border-l border-[color:var(--border-color)] bg-[color:var(--surface-color)] flex-col overflow-hidden">
            <Queue currentId={uniqueId} files={data.user_files} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
