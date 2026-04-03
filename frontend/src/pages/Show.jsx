import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Maximize, Volume2, VolumeX, SkipForward, SkipBack,
  Share2, Download, AlertTriangle, MonitorPlay, Film, Smartphone,
  ExternalLink, Tv2, Loader2
} from 'lucide-react';

// Files that cannot be played in any browser
const BROWSER_UNSUPPORTED = ['.mkv', '.avi', '.wmv', '.flv', '.rm', '.rmvb', '.ts', '.m2ts'];

function isBrowserPlayable(filename) {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return !BROWSER_UNSUPPORTED.some(ext => lower.endsWith(ext));
}

// ─── EXTERNAL PLAYER BLOCK ───────────────────────────────────────────────────
function ExternalPlayers({ data }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(data.direct_dl_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-5 space-y-4">
      {/* Warning banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex gap-3"
      >
        <AlertTriangle size={22} className="text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-orange-400 text-sm">MKV Cannot Play in Browser</p>
          <p className="text-xs text-orange-200/70 mt-1">
            Use VLC or MX Player for instant, lag-free playback at full quality.
          </p>
        </div>
      </motion.div>

      {/* File info */}
      <div className="p-4 rounded-2xl bg-[color:var(--surface-color)] border border-[color:var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Film size={22} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate text-sm">{data.file_name}</p>
            <p className="text-xs text-[color:var(--text-muted)] mt-0.5">{data.file_size}</p>
          </div>
        </div>
      </div>

      {/* Play buttons */}
      <div className="grid grid-cols-1 gap-3">
        <a
          href={data.vlc_player_link_mobile}
          className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <Smartphone size={22} />
            <div>
              <p className="font-bold text-sm">VLC Mobile</p>
              <p className="text-xs opacity-70">Best for all formats</p>
            </div>
          </div>
          <Play size={18} fill="currentColor" />
        </a>

        <a
          href={data.mx_player_link}
          className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <Tv2 size={22} />
            <div>
              <p className="font-bold text-sm">MX Player</p>
              <p className="text-xs opacity-70">Hardware accelerated</p>
            </div>
          </div>
          <Play size={18} fill="currentColor" />
        </a>

        <a
          href={data.vlc_player_link_pc}
          className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <MonitorPlay size={22} />
            <div>
              <p className="font-bold text-sm">VLC Desktop</p>
              <p className="text-xs opacity-70">Windows / Mac</p>
            </div>
          </div>
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Download + Copy */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={data.direct_dl_link}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/30"
        >
          <Download size={18} /> Download
        </a>
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[color:var(--surface-color)] border border-[color:var(--border-color)] hover:border-indigo-500 active:scale-95 font-semibold text-sm transition-all"
        >
          {copied ? '✓ Copied!' : '🔗 Copy Link'}
        </button>
      </div>
    </div>
  );
}

// ─── NATIVE VIDEO PLAYER ──────────────────────────────────────────────────────
function NativePlayer({ data }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const resetHide = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      try { await v.play(); setIsPlaying(true); resetHide(); } catch { }
    } else {
      v.pause(); setIsPlaying(false); setShowControls(true);
    }
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = (e.target.value / 1000) * v.duration;
  };

  const skip = (sec) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + sec));
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 1000);
    setCurrentTime(fmt(v.currentTime));
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-black relative flex items-center justify-center" onMouseMove={resetHide} onTouchStart={resetHide}>
      {/* Native video — zero custom tricks, maximum compatibility */}
      <video
        ref={videoRef}
        src={data.direct_dl_link}
        className="w-full h-full object-contain"
        onLoadedMetadata={(e) => { setDuration(fmt(e.target.duration)); setIsBuffering(false); }}
        onTimeUpdate={onTimeUpdate}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setShowControls(true); }}
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />

      {/* Buffering spinner */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="w-14 h-14 border-4 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center play button (only when truly paused and not buffering) */}
      <AnimatePresence>
        {!isPlaying && !isBuffering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-20"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 bg-black/50 backdrop-blur rounded-full flex items-center justify-center border border-white/20 cursor-pointer hover:bg-black/70 active:scale-95 transition-all">
              <Play fill="white" size={36} className="ml-2 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between z-30 pointer-events-none"
          >
            {/* Top gradient + title */}
            <div className="bg-gradient-to-b from-black/80 to-transparent p-4">
              <p className="text-white text-sm font-medium truncate max-w-[80%] drop-shadow">{data.file_name}</p>
            </div>

            {/* Bottom controls */}
            <div className="bg-gradient-to-t from-black/90 to-transparent p-4 space-y-3 pointer-events-auto">
              {/* Seek bar */}
              <input
                type="range" min={0} max={1000} value={progress}
                onChange={seek}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-500 bg-white/20"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition active:scale-90">
                    {isPlaying ? <Pause fill="white" size={26} /> : <Play fill="white" size={26} />}
                  </button>
                  <button onClick={() => skip(-10)} className="text-white hover:text-indigo-400 transition active:scale-90">
                    <SkipBack size={22} />
                  </button>
                  <button onClick={() => skip(10)} className="text-white hover:text-indigo-400 transition active:scale-90">
                    <SkipForward size={22} />
                  </button>
                  <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition active:scale-90">
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                  <span className="text-white/80 text-sm tabular-nums">{currentTime} / {duration}</span>
                </div>
                <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400 transition active:scale-90">
                  <Maximize size={22} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN SHOW PAGE ───────────────────────────────────────────────────────────
export default function Show() {
  const { uniqueId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/file/${uniqueId}`)
      .then(res => {
        if (res.status === 410) throw new Error('expired');
        if (!res.ok) throw new Error('notfound');
        return res.json();
      })
      .then(d => {
        setData(d);
        if (d.dashboard_link) localStorage.setItem('streamdrop_dash_url', d.dashboard_link);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [uniqueId]);

  if (loading) return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[color:var(--text-muted)] text-sm animate-pulse">Loading stream...</p>
    </div>
  );

  if (error) return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
        className="w-20 h-20 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-5"
      >
        <AlertTriangle size={40} />
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">{error === 'expired' ? 'Link Expired' : 'File Not Found'}</h2>
      <p className="text-[color:var(--text-muted)] max-w-sm text-sm">
        {error === 'expired'
          ? 'This link has expired. Please share the file to the bot again to get a new link.'
          : 'This file does not exist or was deleted.'}
      </p>
    </div>
  );

  const canPlayInBrowser = isBrowserPlayable(data.file_name) && data.is_media;

  return (
    <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
      
      {/* ── LEFT: Video or External Player ── */}
      <div className={`w-full md:flex-1 bg-black flex flex-col items-center justify-center overflow-hidden ${canPlayInBrowser ? 'h-[55vw] max-h-[60vh] md:h-full md:max-h-none' : 'h-auto md:h-full'}`}>
        {canPlayInBrowser ? (
          <NativePlayer data={data} />
        ) : data.is_media ? (
          <div className="w-full h-full overflow-y-auto flex items-start justify-center p-4 md:py-8">
            <ExternalPlayers data={data} />
          </div>
        ) : (
          // Generic non-media file
          <div className="flex flex-col items-center text-center p-8">
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-5">
              <Film size={40} />
            </div>
            <h2 className="text-xl font-bold mb-1 truncate max-w-xs">{data.file_name}</h2>
            <p className="text-[color:var(--text-muted)] text-sm mb-6">{data.file_size}</p>
            <a href={data.direct_dl_link}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition active:scale-95 shadow-lg shadow-indigo-500/30"
            >
              <Download size={20} /> Download File
            </a>
          </div>
        )}
      </div>

      {/* ── RIGHT: Sidebar ── */}
      <div className="w-full md:w-72 flex-shrink-0 bg-[color:var(--surface-color)] border-t md:border-t-0 md:border-l border-[color:var(--border-color)] flex flex-col overflow-y-auto">
        
        {/* External players (for browser-playable files too) */}
        <div className="p-5 border-b border-[color:var(--border-color)]">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[color:var(--text-muted)] mb-3">Open Externally</h3>
          <div className="space-y-2">
            <a href={data.vlc_player_link_mobile}
              className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 active:scale-95 transition text-sm font-semibold"
            >
              <span className="flex items-center gap-2"><Smartphone size={18} /> VLC Mobile</span>
              <Play size={16} fill="currentColor" />
            </a>
            <a href={data.mx_player_link}
              className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 active:scale-95 transition text-sm font-semibold"
            >
              <span className="flex items-center gap-2"><Tv2 size={18} /> MX Player</span>
              <Play size={16} fill="currentColor" />
            </a>
            <a href={data.vlc_player_link_pc}
              className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 active:scale-95 transition text-sm font-semibold"
            >
              <span className="flex items-center gap-2"><MonitorPlay size={18} /> VLC Desktop</span>
              <ExternalLink size={16} />
            </a>
          </div>

          <a href={data.direct_dl_link}
            className="mt-3 flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-[color:var(--bg-color)] border border-[color:var(--border-color)] hover:border-indigo-500 text-sm font-bold transition"
          >
            <Download size={18} className="text-indigo-500" /> Fast Download
          </a>
        </div>

        {/* Up Next */}
        {data.user_files && data.user_files.length > 0 && (
          <div className="p-5 flex-1">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[color:var(--text-muted)] mb-3">Up Next</h3>
            <div className="space-y-2">
              {data.user_files.map(item => (
                <a key={item.id} href={item.stream_link}
                  className="group block p-3 rounded-xl border border-[color:var(--border-color)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition"
                >
                  <p className="text-sm font-medium truncate group-hover:text-indigo-400 transition-colors">{item.name}</p>
                  <p className="text-xs text-[color:var(--text-muted)] mt-0.5">{item.size}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
