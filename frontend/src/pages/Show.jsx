import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download, AlertTriangle, MonitorPlay, Film, Smartphone,
  Tv2, Music, Clock, Search, ChevronRight, Play, Pause,
  Volume2, VolumeX, Maximize, SkipBack, SkipForward
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const AUDIO_EXT  = /\.(mp3|aac|wav|flac|m4a|ogg|opus)$/i;
const IMAGE_EXT  = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
const PDF_EXT    = /\.pdf$/i;
const UNPLAYABLE = /\b(hevc|h\.265|x265|10bit|10-bit|hdr10)\b/i;

function classify(name = '') {
  if (AUDIO_EXT.test(name)) return 'audio';
  if (IMAGE_EXT.test(name)) return 'image';
  if (PDF_EXT.test(name))   return 'pdf';
  return 'video';
}
function canPlay(name = '') { return !UNPLAYABLE.test(name); }
function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

// ── Custom Video Player (pure HTML5, zero library deps) ───────────────────────
function VideoPlayer({ src }) {
  const vRef = useRef(null);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [curTime, setCurTime]   = useState('0:00');
  const [dur, setDur]           = useState('0:00');
  const [muted, setMuted]       = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [showCtrl, setShowCtrl]   = useState(true);
  const hideRef = useRef(null);

  const resetHide = () => {
    setShowCtrl(true);
    clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => setShowCtrl(false), 3000);
  };

  const togglePlay = async () => {
    const v = vRef.current;
    if (!v) return;
    try {
      if (v.paused) { await v.play(); setPlaying(true); resetHide(); }
      else          { v.pause();     setPlaying(false); setShowCtrl(true); }
    } catch (e) { console.warn('play error', e); }
  };

  const seek = e => {
    const v = vRef.current;
    if (!v || !v.duration) return;
    v.currentTime = (parseFloat(e.target.value) / 1000) * v.duration;
  };

  const skip = sec => {
    const v = vRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + sec));
  };

  const toggleMute = () => {
    const v = vRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const fullscreen = () => {
    const v = vRef.current;
    if (!v) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else (v.parentElement?.requestFullscreen ?? v.webkitEnterFullscreen?.bind(v))?.();
  };

  return (
    <div
      className="w-full h-full bg-black relative flex items-center justify-center select-none"
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* ── Actual video ── */}
      <video
        ref={vRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        onLoadedMetadata={e => { setDur(fmtTime(e.target.duration)); setBuffering(false); }}
        onTimeUpdate={e => {
          const v = e.target;
          if (v.duration) {
            setProgress((v.currentTime / v.duration) * 1000);
            setCurTime(fmtTime(v.currentTime));
          }
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => { setBuffering(false); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setShowCtrl(true); }}
        onClick={togglePlay}
      />

      {/* ── Buffering spinner ── */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Big play button (paused, not buffering) ── */}
      {!playing && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center cursor-pointer hover:bg-black/80 active:scale-95 transition-all">
            <Play fill="white" size={36} className="ml-2 text-white" />
          </div>
        </div>
      )}

      {/* ── Controls overlay ── */}
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${showCtrl ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top: title */}
        <div className="bg-gradient-to-b from-black/70 to-transparent px-4 pt-3 pb-6">
          {/* title slot */}
        </div>

        {/* Bottom: controls */}
        <div className="bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-8 pointer-events-auto">
          {/* Seek bar */}
          <input
            type="range" min={0} max={1000} step={1} value={progress}
            onChange={seek}
            className="w-full h-1 mb-3 rounded-full appearance-none cursor-pointer accent-indigo-500"
            style={{ accentColor: '#6366f1' }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-indigo-300 transition active:scale-90">
                {playing ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} />}
              </button>
              <button onClick={() => skip(-10)} className="text-white hover:text-indigo-300 transition active:scale-90 hidden sm:block">
                <SkipBack size={20} />
              </button>
              <button onClick={() => skip(10)} className="text-white hover:text-indigo-300 transition active:scale-90 hidden sm:block">
                <SkipForward size={20} />
              </button>
              <button onClick={toggleMute} className="text-white hover:text-indigo-300 transition active:scale-90">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="text-white/70 text-xs tabular-nums font-medium">{curTime} / {dur}</span>
            </div>
            <button onClick={fullscreen} className="text-white hover:text-indigo-300 transition active:scale-90">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Audio player (native) ─────────────────────────────────────────────────────
function AudioPlayer({ src, title }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-10 gap-5 bg-[color:var(--bg-color)]">
      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-700/20 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-500/10">
        <Music size={48} className="text-indigo-400" />
      </div>
      <div className="text-center">
        <p className="font-bold text-[color:var(--text-color)] max-w-sm truncate">{title}</p>
        <p className="text-[color:var(--text-muted)] text-sm mt-0.5">StreamDrop Audio</p>
      </div>
      <audio controls src={src} className="w-full max-w-sm" style={{ colorScheme: 'dark' }} />
    </div>
  );
}

// ── Action Buttons ────────────────────────────────────────────────────────────
function ActionButtons({ data }) {
  const mob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const b = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all active:scale-95 hover:opacity-90';

  return (
    <div className="flex flex-wrap gap-2.5">
      <a href={data.direct_dl_link} className={`${b} bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20`}>
        <Download size={16} /> Download
      </a>
      {mob ? (
        <>
          <a href={data.vlc_player_link_mobile} className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)]`}>
            <Smartphone size={16} className="text-orange-400" /> VLC Mobile
          </a>
          <a href={data.mx_player_link} className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)]`}>
            <Tv2 size={16} className="text-blue-400" /> MX Player
          </a>
        </>
      ) : (
        <>
          <a href={data.vlc_player_link_pc} className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)]`}>
            <MonitorPlay size={16} className="text-purple-400" /> VLC Desktop
          </a>
          <a href={data.vlc_player_link_mobile} className={`${b} bg-[color:var(--bg-color)] border-[color:var(--border-color)] text-[color:var(--text-color)]`}>
            <Smartphone size={16} className="text-orange-400" /> VLC Mobile
          </a>
        </>
      )}
    </div>
  );
}

// ── Queue Sidebar ─────────────────────────────────────────────────────────────
function Queue({ currentId, files }) {
  const [q, setQ]   = useState('');
  const [tab, setTab] = useState('all');
  const shown = useMemo(() => (files || []).filter(f =>
    (tab === 'all' || f.type === tab) && (!q || f.name.toLowerCase().includes(q.toLowerCase()))
  ), [files, tab, q]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-[color:var(--border-color)] space-y-3 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Up Next</p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted)] focus:border-indigo-500 outline-none transition"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'video', 'audio'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-indigo-500 text-white' : 'bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-muted)]'}`}
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
                <p className={`text-sm font-medium truncate ${f.id === currentId ? 'text-indigo-400' : 'text-[color:var(--text-color)]'}`}>{f.name}</p>
                <p className="text-xs text-[color:var(--text-muted)] mt-0.5">{f.size}</p>
              </div>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 text-[color:var(--text-muted)] transition flex-shrink-0" />
            </a>
          ))
        }
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Show() {
  const { uniqueId } = useParams();
  const [status, setStatus] = useState('loading');
  const [data, setData]     = useState(null);

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
      <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[color:var(--text-muted)] text-xs font-bold uppercase tracking-widest">Loading…</p>
    </div>
  );

  if (status === 'expired') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
        <Clock size={36} className="text-amber-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">Link Expired</h2>
        <p className="text-[color:var(--text-muted)] text-sm">Send the file to the bot again to get a fresh link.</p>
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
        <p className="text-[color:var(--text-muted)] text-sm">This file was removed or the link is invalid.</p>
      </div>
    </div>
  );

  const type    = classify(data.file_name);
  const isVideo = data.is_media && type === 'video';
  const isAudio = data.is_media && type === 'audio';
  const playable = canPlay(data.file_name);
  const isMkv   = data.file_name.toLowerCase().endsWith('.mkv');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col overflow-hidden">

      {/* ── Player ── */}
      {isVideo && (
        <div className="w-full flex-shrink-0 bg-black" style={{ aspectRatio: '16/9', maxHeight: '62vh' }}>
          {playable
            ? <VideoPlayer src={data.direct_dl_link} />
            : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MonitorPlay size={26} className="text-white/30" />
                </div>
                <div className="text-center px-8">
                  <p className="text-white/50 text-sm font-semibold">Cannot play in browser</p>
                  <p className="text-white/25 text-xs mt-1">HEVC / 10-bit — use VLC or MX Player below</p>
                </div>
              </div>
            )
          }
        </div>
      )}

      {isAudio && <AudioPlayer src={data.direct_dl_link} title={data.file_name} />}

      {/* ── Info + Sidebar ── */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden border-t border-[color:var(--border-color)]">

        {/* Left column */}
        <div className="flex-1 min-w-0 overflow-y-auto p-5 md:px-8 md:py-6 space-y-5">
          <div>
            <h1 className="text-base font-bold leading-snug text-[color:var(--text-color)] break-words">{data.file_name}</h1>
            <p className="text-[color:var(--text-muted)] text-sm mt-1">{data.file_size}</p>
          </div>

          {isVideo && !playable && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[color:var(--text-muted)] text-sm">HEVC / 10-bit cannot be decoded by any browser. Use VLC or MX Player for full-quality playback.</p>
            </div>
          )}

          {isVideo && playable && isMkv && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[color:var(--bg-color)] border border-[color:var(--border-color)]">
              <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[color:var(--text-muted)] text-sm">MKV may have limited seeking in browser. For best experience click VLC or MX Player.</p>
            </div>
          )}

          {type === 'image' && (
            <img src={data.direct_dl_link} alt={data.file_name}
              className="max-w-full max-h-[65vh] object-contain rounded-xl border border-[color:var(--border-color)]" />
          )}
          {type === 'pdf' && (
            <iframe src={data.direct_dl_link} className="w-full rounded-xl border border-[color:var(--border-color)]" style={{ height: '72vh' }} />
          )}

          <ActionButtons data={data} />

          {data.user_files?.length > 0 && (
            <div className="md:hidden border-t border-[color:var(--border-color)] pt-5">
              <Queue currentId={uniqueId} files={data.user_files} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {data.user_files?.length > 0 && (
          <div className="hidden md:flex w-72 flex-shrink-0 border-l border-[color:var(--border-color)] bg-[color:var(--surface-color)] flex-col overflow-hidden">
            <Queue currentId={uniqueId} files={data.user_files} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
