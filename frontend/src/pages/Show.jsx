import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download, AlertTriangle, MonitorPlay, Film, Smartphone,
  Tv2, Music, Clock, Search, ChevronRight, Play, Maximize,
  Camera, Timer, PictureInPicture, QrCode, Monitor, Share2,
  FileText, Image as ImageIcon, Check, FastForward, Info
} from 'lucide-react';

const AUDIO_EXT  = /\.(mp3|aac|wav|flac|m4a|ogg|opus)$/i;
const IMAGE_EXT  = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
const PDF_EXT    = /\.(pdf|doc|docx|txt|rtf)$/i;
const UNPLAYABLE = /\b(hevc|h\.265|x265|10bit|10-bit|hdr10)\b/i;

function classify(name = '') {
  if (AUDIO_EXT.test(name)) return 'audio';
  if (IMAGE_EXT.test(name)) return 'image';
  if (PDF_EXT.test(name))   return 'document';
  return 'video';
}

const THEMES = {
  video: { bg: 'from-indigo-600/20 to-blue-900/10', glow: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  audio: { bg: 'from-violet-600/20 to-fuchsia-900/10', glow: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/30' },
  image: { bg: 'from-amber-600/20 to-orange-900/10', glow: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  document: { bg: 'from-emerald-600/20 to-teal-900/10', glow: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

export default function Show() {
  const { uniqueId } = useParams();
  const [status, setStatus] = useState('loading');
  const [data, setData]     = useState(null);
  
  // Features States
  const [theaterMode, setTheaterMode] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0); // minutes
  const [ambientMode, setAmbientMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  
  // Refs
  const playerContainerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const playerInstance = useRef(null);
  const ambientInterval = useRef(null);
  const sleepInterval = useRef(null);

  // Load Data
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
        
        // Load saved bookmarks for this file
        try {
          const bks = JSON.parse(localStorage.getItem(`bookmarks_${uniqueId}`) || '[]');
          setBookmarks(bks);
        } catch(e){}
        
        setStatus('ok');
        
        // Auto scroll to player on mobile smoothly
        if(window.innerWidth < 768) {
            setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 500);
        }
      })
      .catch(() => setStatus('error'));
  }, [uniqueId]);

  const type = data ? classify(data.file_name) : 'video';
  const theme = THEMES[type] || THEMES.video;

  // Initialize Player
  useEffect(() => {
    if (status !== 'ok' || (type !== 'video' && type !== 'audio') || !videoRef.current) return;
    
    playerInstance.current = new Plyr(videoRef.current, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume',
        'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      settings: ['quality', 'speed'],
      keyboard: { focused: true, global: true },
      autoplay: false, // Wait for user or ambient to setup
      quality: { default: 1080, options: [1080, 720, 480] }
    });

    // Auto-play workaround for browsers that block it until interacted
    const p = playerInstance.current;
    p.on('ready', () => { setTimeout(() => p.play().catch(e => console.log('Autoplay blocked:', e)), 500) });
    p.on('ratechange', () => setSpeed(p.speed));
    
    return () => { try { p.destroy(); } catch {} };
  }, [status, type]);

  // Ambient Glow Effect (Cinematic Canvas)
  useEffect(() => {
    if (!ambientMode || type !== 'video' || !videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    
    ambientInterval.current = setInterval(() => {
      if(v.paused || v.ended) return;
      ctx.drawImage(v, 0, 0, c.width, c.height);
    }, 300); // 3fps glow update prevents severe composite lag
    
    return () => clearInterval(ambientInterval.current);
  }, [ambientMode, status, type]);

  // Sleep Timer logic
  useEffect(() => {
    if(sleepTimer <= 0) return;
    let timeLeft = sleepTimer * 60;
    sleepInterval.current = setInterval(() => {
      timeLeft--;
      if(timeLeft <= 0) {
        playerInstance.current?.pause();
        setSleepTimer(0);
        clearInterval(sleepInterval.current);
      }
    }, 1000);
    return () => clearInterval(sleepInterval.current);
  }, [sleepTimer]);

  // Handle Features
  const captureScreenshot = () => {
    if(!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Snapshot_${Math.floor(videoRef.current.currentTime)}s_${data.file_name}.png`;
    a.click();
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      alert("PiP not supported on this device/browser.");
    }
  };

  const changeSpeed = (s) => {
    if(!playerInstance.current) return;
    playerInstance.current.speed = s;
    setSpeed(s);
  };
  
  const addBookmark = () => {
    if(!playerInstance.current) return;
    const time = playerInstance.current.currentTime;
    const newBks = [...bookmarks, { time, label: `Mark at ${Math.floor(time/60)}:${Math.floor(time%60).toString().padStart(2,'0')}` }];
    setBookmarks(newBks);
    localStorage.setItem(`bookmarks_${uniqueId}`, JSON.stringify(newBks));
  };
  
  const jumpTo = (time) => {
    if(!playerInstance.current) return;
    playerInstance.current.currentTime = time;
    playerInstance.current.play();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(data.direct_dl_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // Render Loading & Errors
  // -------------------------------------------------------------
  if (status === 'loading') return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-[#0B0D17]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase glow-text">Initializing</h2>
        <p className="text-white/50 text-sm font-medium">Securing ultra-fast stream protocols...</p>
      </div>
    </div>
  );

  if (status === 'expired') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#0B0D17]">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl">
        <Clock size={80} className="text-amber-400 mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        <h2 className="text-3xl font-black text-white mb-3">Link Expired</h2>
        <p className="text-white/60 text-base leading-relaxed mb-8">For security reasons, this stream link has expired. Forward the file to the bot again to instantly generate a fresh cryptographic link.</p>
        <a href="https://t.me/STREAM_DROP_BOT" target="_blank" rel="noreferrer" className="w-full justify-center flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl px-6 py-4 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          <MonitorPlay size={20} /> Open Telegram Bot
        </a>
      </motion.div>
    </div>
  );

  if (status === 'error') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#0B0D17]">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl">
        <AlertTriangle size={80} className="text-rose-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
        <h2 className="text-3xl font-black text-white mb-3">Content Unavailable</h2>
        <p className="text-white/60 text-base leading-relaxed mb-8">The file you are looking for has either been permanently removed from the server or the unique identifier is incorrect.</p>
        <a href="https://t.me/STREAM_DROP_BOT" target="_blank" rel="noreferrer" className="w-full justify-center flex items-center gap-2 bg-white/10 text-white font-bold rounded-xl px-6 py-4 hover:bg-white/20 active:scale-95 transition-all">
           Return to Bot
        </a>
      </motion.div>
    </div>
  );

  // -------------------------------------------------------------
  // Render Actual Premium Interface
  // -------------------------------------------------------------
  return (
    <div className={`w-full min-h-full overflow-y-auto overflow-x-hidden relative transition-colors duration-1000 bg-[#0B0D17]`}>
      
      {/* ── Dynamic Background Blobs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
                      className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] bg-gradient-to-br ${theme.bg}`} />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
                      style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
                      className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] bg-gradient-to-tl ${theme.bg}`} />
      </div>

      {/* ── Header Navbar ── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.bg} border-2 ${theme.border} flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                  <Play className={theme.text} size={20} fill="currentColor" />
              </div>
              <div>
                  <h1 className="font-extrabold text-xl tracking-tight text-white leading-none">StreamDrop</h1>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.text}`}>Premium Delivery</span>
              </div>
          </div>
          
          <button onClick={() => setShowQr(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold transition backdrop-blur-md">
              <QrCode size={16} /> Share to TV / Mobile
          </button>
      </header>

      {/* ── Main Content Grid ── */}
      <div className={`relative z-10 mx-auto p-4 md:p-6 transition-all duration-500 ease-in-out ${theaterMode ? 'max-w-[1800px]' : 'max-w-[1400px]'} grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 md:gap-8`}>
          
          <div className="flex flex-col min-w-0" ref={playerContainerRef}>
              
              {/* Media Player Container */}
              <div className="w-full relative group">
                  
                  {/* Ambient Glow Canvas - Sits behind the player and blurs */}
                  {type === 'video' && ambientMode && (
                      <canvas ref={canvasRef} width="16" height="9" 
                              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-60 scale-105 pointer-events-none transition-opacity duration-1000 z-0" />
                  )}

                  {/* Player Frame */}
                  <div className={`relative z-10 w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all ${type==='video' ? 'aspect-video min-h-[300px]' : (type==='document' ? 'h-[75vh]' : 'p-10')} `}>
                      
                      {/* ==== VIDEO ==== */}
                      {type === 'video' && (
                          <video ref={videoRef} playsInline crossOrigin="anonymous" preload="auto" className="w-full h-full absolute inset-0 object-contain">
                              <source src={data.direct_dl_link} />
                          </video>
                      )}

                      {/* ==== AUDIO ==== */}
                      {type === 'audio' && (
                          <div className="w-full h-full flex flex-col items-center justify-center py-20 px-8">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                          style={{ willChange: "transform", transform: "translateZ(0)" }}
                                          className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#1a1a1a] to-black border-4 ${theme.border} flex items-center justify-center shadow-2xl mb-12`}>
                                  <div className="absolute inset-2 rounded-full border border-white/5" />
                                  <div className="absolute inset-4 rounded-full border border-white/5" />
                                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${theme.bg} shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center z-10`}>
                                      <div className="w-3 h-3 rounded-full bg-[#0B0D17]" />
                                  </div>
                                  <Music size={120} className="absolute text-white/5" />
                              </motion.div>
                              <div className="w-full max-w-2xl px-6 relative z-20">
                                  <audio ref={videoRef} playsInline crossOrigin="anonymous" className="w-full hide-default-audio">
                                      <source src={data.direct_dl_link} />
                                  </audio>
                              </div>
                          </div>
                      )}

                      {/* ==== DOCUMENT ==== */}
                      {type === 'document' && (
                          <iframe src={data.direct_dl_link} className="w-full h-full bg-white absolute inset-0" title={data.file_name} />
                      )}

                      {/* ==== IMAGE ==== */}
                      {type === 'image' && (
                          <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
                                      src={data.direct_dl_link} alt={data.file_name} className="max-w-full max-h-[75vh] object-contain rounded-xl drop-shadow-2xl" />
                      )}

                  </div>

                  {/* Player Floating Toolbar Overlay (Appears on Hover for Video) */}
                  {type === 'video' && (
                      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                          <button onClick={captureScreenshot} className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white tooltip-trigger" title="Take Snapshot">
                              <Camera size={18} />
                          </button>
                          <button onClick={togglePiP} className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white" title="Picture in Picture">
                              <PictureInPicture size={18} />
                          </button>
                      </div>
                  )}
              </div>

              {/* ── Metadata & Premium Controls Toolbar ── */}
              <div className="mt-6 flex flex-col gap-6">
                  
                  {/* Title & Badges */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/10 ${theme.text}`}>STREAMDROP PREMIUM</span>
                              {(data.file_name.toLowerCase().includes('hevc') || data.file_name.toLowerCase().includes('10bit')) && (
                                  <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/20">HEVC/10-BIT</span>
                              )}
                              <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/70">{data.file_size}</span>
                          </div>
                          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md break-words">
                              {data.file_name.replace(/\.[^/.]+$/, "")}
                          </h1>
                          <p className="text-white/40 mt-2 font-medium text-sm flex items-center gap-2">
                              <FileText size={14}/> Full Filename: {data.file_name}
                          </p>
                      </div>
                  </div>

                  {/* Ultimate Control Panel (Glassmorphism) */}
                  <div className="grid grid-cols-1 md:grid-cols-(--layout-features) auto-cols-auto grid-flow-row md:grid-flow-col gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
                      
                      {/* Left: Download & Play Tools */}
                      <div className="flex flex-wrap items-center gap-3">
                          <a href={`${data.direct_dl_link}?download=true`} download className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white ${theme.glow} shadow-[0_4px_15px_var(--tw-shadow-color)] transition-all hover:scale-105 active:scale-95`} style={{'--tw-shadow-color': 'rgba(0,0,0,0.5)'}}>
                              <Download size={18} /> Secure Download
                          </a>
                          <button onClick={copyLink} className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm text-white transition-all active:scale-95">
                              {copied ? <Check size={18} className="text-emerald-400"/> : <Share2 size={18} />} {copied ? 'Copied URL!' : 'Copy Stream/VLC'}
                          </button>
                      </div>

                      {/* Right: Unique Visual Features Toggles */}
                      <div className="flex flex-wrap items-center md:justify-end gap-2">
                          {type === 'video' && (
                              <>
                                  {/* Speed Presets */}
                                  <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5 mr-2">
                                      {[1, 1.25, 1.5, 2].map(s => (
                                          <button key={s} onClick={() => changeSpeed(s)} className={`px-3 py-2 rounded-lg text-xs font-black transition-all ${speed === s ? 'bg-white/20 text-white shadow' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                              {s}x
                                          </button>
                                      ))}
                                  </div>
                                  
                                  <button onClick={() => setTheaterMode(!theaterMode)} className={`p-3 rounded-xl border transition-all ${theaterMode ? `${theme.text} bg-white/10 border-white/20` : 'text-white/60 bg-black/40 border-black/0 hover:bg-white/10 hover:text-white'}`} title="Theater Mode">
                                      <Maximize size={18} />
                                  </button>
                                  <button onClick={() => setAmbientMode(!ambientMode)} className={`p-3 rounded-xl border transition-all hidden sm:block ${ambientMode ? `${theme.text} bg-white/10 border-white/20` : 'text-white/60 bg-black/40 border-black/0 hover:bg-white/10 hover:text-white'}`} title="Ambient Glow">
                                      <Monitor size={18} />
                                  </button>
                                  <div className="relative group">
                                      <button className="p-3 rounded-xl border text-white/60 bg-black/40 border-black/0 hover:bg-white/10 hover:text-white transition-all" title="Sleep Timer">
                                          <Timer size={18} />
                                      </button>
                                      {/* Dropdown timer */}
                                      <div className="absolute bottom-full right-0 mb-2 py-2 w-32 bg-[#1A1C29] border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all">
                                          {[15, 30, 45, 60, 0].map(mins => (
                                              <button key={mins} onClick={() => setSleepTimer(mins)} className="w-full text-left px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5">
                                                  {mins === 0 ? 'Off' : `${mins} Minutes`} {sleepTimer === mins && '✓'}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </>
                          )}
                          
                          {/* Add Bookmark Tool */}
                          {(type === 'video' || type === 'audio') && (
                              <button onClick={addBookmark} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/40 hover:bg-white/10 border border-transparent hover:border-white/10 text-white/80 font-bold text-sm transition-all">
                                  <Check size={16} /> Mark Spot
                              </button>
                          )}
                      </div>
                  </div>

                  {/* External Players Alert for Media */}
                  {(type === 'video' || type === 'audio') && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-[#1A1C29] to-[#12141F] p-5 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                  <Info size={20} className="text-indigo-400" />
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm">Hardware Acceleration</h4>
                                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed pr-4">If the web player stutters or shows a black screen due to unsupported codecs (like MKV/HEVC), open instantly in an external player.</p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                              <a href={data.vlc_player_link_pc} className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 transition-colors">
                                  <MonitorPlay size={18} className="mb-1" />
                                  <span className="text-[10px] font-bold uppercase">VLC PC</span>
                              </a>
                              <a href={data.mx_player_link} className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-colors">
                                  <Tv2 size={18} className="mb-1" />
                                  <span className="text-[10px] font-bold uppercase">MX Player</span>
                              </a>
                          </div>
                      </motion.div>
                  )}

              </div>
          </div>

          {/* ── Right Dashboard Sidebar ── */}
          <div className="flex flex-col gap-6 w-full max-w-sm mx-auto lg:max-w-none">
              
              {/* Custom Bookmarks Section */}
              <AnimatePresence>
                  {bookmarks.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} 
                                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden">
                          <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                              <span>Saved Moments</span>
                              <button onClick={() => {setBookmarks([]); localStorage.removeItem(`bookmarks_${uniqueId}`)}} className="text-xs text-rose-400 hover:text-rose-300">Clear All</button>
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                              {bookmarks.map((bk, i) => (
                                  <button key={i} onClick={() => jumpTo(bk.time)} className="flex flex-col items-start p-3 bg-black/40 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-left group">
                                      <span className={`text-[11px] font-black uppercase ${theme.text}`}>{bk.label}</span>
                                      <span className="text-white/60 text-xs mt-1 group-hover:text-white flex items-center gap-1"><FastForward size={12}/> Jump to</span>
                                  </button>
                              ))}
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>

              {/* Advanced Queue / Playlist */}
              {data.user_files?.length > 0 && (
                  <div className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex-1 max-h-[800px]">
                      <div className="p-5 border-b border-white/5 space-y-4">
                          <h3 className="text-white font-black text-lg flex items-center gap-2">
                              <Film size={20} className={theme.text}/> Your Cloud Library
                          </h3>
                          <div className="relative">
                              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                              <input placeholder="Search files in cloud..." className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-white/30" />
                          </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                          {data.user_files.map(f => {
                              const isActive = f.id === uniqueId;
                              const fType = classify(f.name);
                              const fIcon = fType === 'audio' ? <Music size={16}/> : (fType === 'document' ? <FileText size={16}/> : (fType === 'image' ? <ImageIcon size={16}/> : <Film size={16}/>));
                              return (
                                  <a key={f.id} href={f.stream_link} className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive ? `bg-white/10 border border-white/10 shadow-lg relative overflow-hidden` : `hover:bg-white/5 border border-transparent`}`}>
                                      {isActive && <div className={`absolute top-0 left-0 w-1 h-full ${theme.glow}`} />}
                                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${isActive ? `${theme.bg} ${theme.text} shadow-inner` : 'bg-black/50 text-white/30 group-hover:bg-black/80 group-hover:text-white/60'}`}>
                                          {fIcon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className={`text-sm font-bold truncate leading-tight ${isActive ? 'text-white drop-shadow-sm' : 'text-white/70 group-hover:text-white'}`}>{f.name}</p>
                                          <p className={`text-[11px] font-semibold mt-1 tracking-wider ${isActive ? theme.text : 'text-white/30'}`}>{f.size}</p>
                                      </div>
                                  </a>
                              )
                          })}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* ── QR Code Share Modal ── */}
      <AnimatePresence>
          {showQr && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQr(false)}
                          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer">
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}
                              className="bg-[#1A1C29] p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 pointer-events-none`} />
                      <div className="relative z-10 flex flex-col items-center text-center">
                          <h3 className="text-2xl font-black text-white mb-2">Scan to Open</h3>
                          <p className="text-white/60 text-sm mb-8 font-medium">Continue watching or downloading instantly on your mobile device or smart TV.</p>
                          <div className="p-4 bg-white rounded-2xl shadow-xl mb-6">
                              <QRCodeSVG value={window.location.href} size={200} level="H" includeMargin={false} />
                          </div>
                          <button onClick={() => setShowQr(false)} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">
                              Close
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        :root { --plyr-color-main: #6366f1; font-family: 'Inter', system-ui, sans-serif; }
        .glow-text { text-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .hide-default-audio::-webkit-media-controls-panel { background-color: rgba(255,255,255,0.05); }
      `}} />
    </div>
  );
}
