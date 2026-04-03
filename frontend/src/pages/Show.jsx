import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import {
  Download, AlertTriangle, MonitorPlay, Film, Smartphone,
  ExternalLink, Tv2, Music, Clock, Search, ChevronRight
} from 'lucide-react';

// ── Codec / extension detection ───────────────────────────────────────────────
const AUDIO_EXT  = /\.(mp3|aac|wav|flac|m4a|ogg|opus)$/i;
const IMAGE_EXT  = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
const PDF_EXT    = /\.pdf$/i;
// Codecs no browser can decode
const UNPLAYABLE = /\b(hevc|h\.265|x265|10bit|10-bit|hdr10)\b/i;

function classify(name = '') {
  if (AUDIO_EXT.test(name)) return 'audio';
  if (IMAGE_EXT.test(name)) return 'image';
  if (PDF_EXT.test(name))   return 'pdf';
  return 'video';
}
function canBrowserPlay(name = '') {
  return !UNPLAYABLE.test(name);
}

// ── Plyr Video ────────────────────────────────────────────────────────────────
function VideoPlayer({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const player = new Plyr(ref.current, {
      controls: [
        'play-large', 'play', 'rewind', 'fast-forward',
        'progress', 'current-time', 'duration',
        'mute', 'volume', 'pip', 'fullscreen',
      ],
      keyboard: { focused: true, global: true },
      autoplay: true,
      tooltips: { controls: true, seek: true },
      invertTime: false,
    });
    return () => { try { player.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full h-full bg-black overflow-hidden">
      <video ref={ref} playsInline crossOrigin="anonymous" style={{ width: '100%', height: '100%' }}>
        <source src={src} />
      </video>
    </div>
  );
}

// ── Plyr Audio ────────────────────────────────────────────────────────────────
function AudioPlayer({ src, title }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const player = new Plyr(ref.current, {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
      autoplay: true,
    });
    return () => { try { player.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full flex flex-col items-center justify-center px-8 py-10 gap-6 bg-[color:var(--bg-color)]">
      <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-700/20 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-500/10">
        <Music size={52} className="text-indigo-400" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-bold text-lg text-[color:var(--text-color)] max-w-sm truncate">{title}</p>
        <p className="text-[color:var(--text-muted)] text-sm">StreamDrop Audio</p>
      </div>
      <div className="w-full max-w-sm">
        <audio ref={ref} playsInline>
          <source src={src} />
        </audio>
      </div>
    </div>
  );
}

// ── Action Buttons ────────────────────────────────────────────────────────────
function ActionButtons({ data }) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const b = 'flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all active:scale-95 hover:scale-[1.02]';

  return (
    <div className="flex flex-wrap gap-2.5">
      <a href={data.direct_dl_link}
        className={`${b} bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25`}
      >
        <Download size={16} /> Download
      </a>
      {isMobile ? (
        <>
          <a href={data.vlc_player_link_mobile}
            className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <Smartphone size={16} className="text-orange-400" /> VLC Mobile
          </a>
          <a href={data.mx_player_link}
            className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <Tv2 size={16} className="text-blue-400" /> MX Player
          </a>
        </>
      ) : (
        <>
          <a href={data.vlc_player_link_pc}
            className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <MonitorPlay size={16} className="text-purple-400" /> VLC Desktop
          </a>
          <a href={data.vlc_player_link_mobile}
            className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <Smartphone size={16} className="text-orange-400" /> VLC Mobile
          </a>
          <a href={data.mx_player_link}
            className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)] hover:border-indigo-400`}
          >
            <Tv2 size={16} className="text-blue-400" /> MX Player
          </a>
        </>
      )}
    </div>
  );
}

// ── Queue ─────────────────────────────────────────────────────────────────────
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
      <div className="px-4 pt-4 pb-3 border-b border-[color:var(--border-color)] space-y-3 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Queue</p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted)] focus:border-indigo-500 outline-none transition"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'video', 'audio'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-indigo-500 text-white' : 'bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)]'}`}
            >{t}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {shown.length === 0
          ? <p className="text-[color:var(--text-muted)] text-sm text-center py-8">No files found.</p>
          : shown.map(f => (
            <a key={f.id} href={f.stream_link}
              className={`group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[color:var(--bg-color)] ${f.id === currentId ? 'border-l-2 border-indigo-500 pl-[14px]' : ''}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${f.id === currentId ? 'bg-indigo-500/10 text-indigo-400' : 'bg-[color:var(--bg-color)] text-[color:var(--text-muted)]'}`}>
                {f.type === 'audio' ? <Music size={15} /> : <Film size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate leading-tight ${f.id === currentId ? 'text-indigo-400' : 'text-[color:var(--text-color)]'}`}>{f.name}</p>
                <p className="text-xs text-[color:var(--text-muted)] mt-0.5">{f.size}</p>
              </div>
              <ChevronRight size={13} className="text-[color:var(--text-muted)] opacity-0 group-hover:opacity-100 flex-shrink-0 transition" />
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

  if (status === 'loading') return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <div className="w-11 h-11 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[color:var(--text-muted)] text-xs tracking-widest uppercase font-bold">Loading…</p>
    </div>
  );

  if (status === 'expired') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
        <Clock size={36} className="text-amber-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">Link Expired</h2>
        <p className="text-[color:var(--text-muted)] text-sm max-w-xs">Send the file to the bot again to get a fresh stream link.</p>
      </div>
    </div>
  );

  if (status === 'error') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle size={36} className="text-red-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">File Not Found</h2>
        <p className="text-[color:var(--text-muted)] text-sm max-w-xs">This file was removed or the link is invalid.</p>
      </div>
    </div>
  );

  const type     = classify(data.file_name);
  const playable = canBrowserPlay(data.file_name);
  const isVideo  = data.is_media && type === 'video';
  const isAudio  = data.is_media && type === 'audio';
  const showVideoPlayer = isVideo && playable;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ── Player zone ─────────────────────────────────────── */}
      {isVideo && (
        <div className="w-full flex-shrink-0 bg-black" style={{ height: 'min(56.25vw, 60vh)' }}>
          {showVideoPlayer
            ? <VideoPlayer src={data.direct_dl_link} />
            : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MonitorPlay size={26} className="text-white/30" />
                </div>
                <div className="text-center px-8">
                  <p className="text-white/50 text-sm font-semibold">Cannot play in browser</p>
                  <p className="text-white/25 text-xs mt-1">Use an external player from the options below</p>
                </div>
              </div>
            )
          }
        </div>
      )}

      {isAudio && (
        <div className="w-full flex-shrink-0">
          <AudioPlayer src={data.direct_dl_link} title={data.file_name} />
        </div>
      )}

      {/* ── Content row ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden border-t border-[color:var(--border-color)]">

        {/* Left */}
        <div className="flex-1 min-w-0 overflow-y-auto p-5 md:p-7 space-y-5">

          <div>
            <h1 className="text-base md:text-lg font-bold leading-snug text-[color:var(--text-color)] break-words">{data.file_name}</h1>
            <p className="text-[color:var(--text-muted)] text-sm mt-1">{data.file_size}</p>
          </div>

          {/* Notice */}
          {isVideo && !playable && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[color:var(--text-muted)] text-sm leading-relaxed">
                HEVC / 10-bit video cannot be decoded by any browser. Use VLC or MX Player for full-quality playback.
              </p>
            </div>
          )}

          {isVideo && playable && data.file_name.toLowerCase().endsWith('.mkv') && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[color:var(--bg-color)] border border-[color:var(--border-color)]">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[color:var(--text-muted)] text-sm leading-relaxed">
                MKV may not support seeking. If playback is slow, use VLC or MX Player for the best experience.
              </p>
            </div>
          )}

          {type === 'image' && (
            <img src={data.direct_dl_link} alt={data.file_name}
              className="max-w-full max-h-[65vh] object-contain rounded-xl border border-[color:var(--border-color)]"
            />
          )}

          {type === 'pdf' && (
            <iframe src={data.direct_dl_link}
              className="w-full rounded-xl border border-[color:var(--border-color)]"
              style={{ height: '72vh' }}
            />
          )}

          <ActionButtons data={data} />

          {/* Mobile queue */}
          {data.user_files?.length > 0 && (
            <div className="md:hidden border-t border-[color:var(--border-color)] pt-5">
              <Queue currentId={uniqueId} files={data.user_files} />
            </div>
          )}
        </div>

        {/* Right sidebar queue (desktop only) */}
        {data.user_files?.length > 0 && (
          <div className="hidden md:flex w-72 flex-shrink-0 border-l border-[color:var(--border-color)] bg-[color:var(--surface-color)] flex-col overflow-hidden">
            <Queue currentId={uniqueId} files={data.user_files} />
          </div>
        )}
      </div>
    </div>
  );
}
