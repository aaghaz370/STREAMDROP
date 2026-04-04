import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download, AlertTriangle, MonitorPlay, Film, Smartphone,
  Music, Clock, Search, ChevronRight, Play, Maximize,
  Timer, PictureInPicture, QrCode, Share2,
  FileText, Image as ImageIcon, Check, FastForward, ExternalLink
} from 'lucide-react';

// Player Logo imports
import vlcLogo from '../assets/player-logo/vlc-player.png';
import mxLogo from '../assets/player-logo/mx-player.png';
import playitLogo from '../assets/player-logo/playit.png';
import xplayerLogo from '../assets/player-logo/x-player.png';
import novaLogo from '../assets/player-logo/nova-player.png';
import nextLogo from '../assets/player-logo/next-player.png';
import kmLogo from '../assets/player-logo/km-player.png';
import logoImg from '../assets/logo.jpg';

const AUDIO_EXT  = /\.(mp3|aac|wav|flac|m4a|ogg|opus|wma|aiff|alac)$/i;
const IMAGE_EXT  = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico|heic|avif)$/i;
const PDF_EXT    = /\.(pdf|doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx|csv|md)$/i;
const BINARY_EXT = /\.(apk|ipa|exe|msi|dmg|zip|rar|7z|tar|gz|jar|deb|rpm|iso|img|bin|torrent|sh|bat|cmd|dll|so|dylib)$/i;

function classify(name = '') {
  if (AUDIO_EXT.test(name)) return 'audio';
  if (IMAGE_EXT.test(name)) return 'image';
  if (PDF_EXT.test(name))   return 'document';
  if (BINARY_EXT.test(name)) return 'binary';
  return 'video';
}

const THEMES = {
  video: { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500/30' },
  audio: { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500/30' },
  image: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30' },
  document: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  binary: { bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500/30' },
};

const TYPE_FILTERS = [
  { key: 'all',      label: 'All',   icon: <Film size={13}/> },
  { key: 'video',    label: 'Video', icon: <Film size={13}/> },
  { key: 'audio',    label: 'Audio', icon: <Music size={13}/> },
  { key: 'image',    label: 'Image', icon: <ImageIcon size={13}/> },
  { key: 'document', label: 'Doc',   icon: <FileText size={13}/> },
];

function QueuePanel({ files, currentId, theme }) {
  const [q, setQ]       = useState('');
  const [tab, setTab]   = useState('all');

  const shown = useMemo(() => {
    return (files || []).filter(f => {
      const ftype = classify(f.name);
      const matchTab = tab === 'all' || ftype === tab;
      const matchQ   = !q || f.name.toLowerCase().includes(q.toLowerCase());
      return matchTab && matchQ;
    });
  }, [files, tab, q]);

  return (
    <div className="flex flex-col bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-2xl shadow-sm overflow-hidden flex-1 max-h-[800px]">
      <div className="p-4 border-b border-[color:var(--border-color)] space-y-3">
        <h3 className="font-bold flex items-center gap-2 text-[color:var(--text-color)]">
          <Film size={18} className={theme.text} /> Cloud Library
          <span className="ml-auto text-xs font-semibold text-[color:var(--text-muted)] bg-[color:var(--bg-color)] px-2 py-0.5 rounded-full">{files.length}</span>
        </h3>
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted)] focus:border-indigo-500 focus:outline-none transition" />
        </div>
        {/* Type Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTab(f.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${tab === f.key ? `${theme.bg} text-white shadow-sm` : 'bg-[color:var(--bg-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)]'}`}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {shown.length === 0 ? (
          <div className="text-center py-10 text-[color:var(--text-muted)] text-sm">No files match.</div>
        ) : shown.map(f => {
          const isActive = f.id === currentId;
          const fType = classify(f.name);
          const fIcon = fType === 'audio' ? <Music size={15}/> : (fType === 'document' ? <FileText size={15}/> : (fType === 'image' ? <ImageIcon size={15}/> : <Film size={15}/>));
          return (
            <a key={f.id} href={f.stream_link}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors group ${isActive ? 'bg-[color:var(--bg-color)] border border-[color:var(--border-color)]' : 'hover:bg-[color:var(--bg-color)] border border-transparent'}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm ${isActive ? `${theme.bg} text-white` : 'bg-[color:var(--surface-color)] border border-[color:var(--border-color)] text-[color:var(--text-muted)]'}`}>
                {fIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate leading-tight ${isActive ? 'text-[color:var(--text-color)]' : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text-color)]'}`}>{f.name}</p>
                <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">{f.size}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}



export default function Show() {
  const { uniqueId } = useParams();
  const [status, setStatus] = useState('loading');
  const [data, setData]     = useState(null);
  
  // Features States
  const [theaterMode, setTheaterMode] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const playerInstance = useRef(null);
  const sleepInterval = useRef(null);
  const qrRef = useRef(null);

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

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
        // Persist last stream so navigating away and back restores it
        localStorage.setItem('streamdrop_last_stream', uniqueId);
        localStorage.setItem('streamdrop_last_file_name', d.file_name || '');

        try {
          const bks = JSON.parse(localStorage.getItem(`bookmarks_${uniqueId}`) || '[]');
          setBookmarks(bks);
        } catch(e){}
        
        setStatus('ok');
        
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
    
    // Completely recreate player instance safely
    const p = new Plyr(videoRef.current, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume',
        'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      settings: ['quality', 'speed'],
      keyboard: { focused: true, global: true },
      doubleClick: { toggles: false }, // Prevent native fullscreen toggle on double click
      autoplay: false,
    });
    
    playerInstance.current = p;
    
    const handleKeyDown = (e) => {
        // Only trigger if not typing in an input
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (!playerInstance.current) return;
        
        switch (e.code) {
            case 'Space':
            case 'KeyK':
                e.preventDefault();
                p.togglePlay();
                break;
            case 'ArrowRight':
            case 'KeyL':
                e.preventDefault();
                p.forward(10);
                showHint('forward');
                break;
            case 'ArrowLeft':
            case 'KeyJ':
                e.preventDefault();
                p.rewind(10);
                showHint('rewind');
                break;
            case 'KeyF':
                e.preventDefault();
                p.fullscreen.toggle();
                break;
            case 'KeyM':
                e.preventDefault();
                p.muted = !p.muted;
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => { 
        window.removeEventListener('keydown', handleKeyDown);
        try { p.destroy(); } catch {} 
    };
  }, [status, type]);

  // Visual hint state
  const [hint, setHint] = useState(null);
  const hintTimeout = useRef(null);
  const showHint = (dir) => {
      setHint(dir);
      clearTimeout(hintTimeout.current);
      hintTimeout.current = setTimeout(() => setHint(null), 500);
  };

  // Sleep Timer logic
  useEffect(() => {
    if(sleepTimer <= 0) {
        setTimerActive(false);
        clearInterval(sleepInterval.current);
        return;
    }
    setTimerActive(true);
    let timeLeft = sleepTimer * 60;
    
    clearInterval(sleepInterval.current);
    sleepInterval.current = setInterval(() => {
      timeLeft--;
      if(timeLeft <= 0) {
        if (playerInstance.current) {
            playerInstance.current.pause();
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
        setSleepTimer(0);
        setTimerActive(false);
        clearInterval(sleepInterval.current);
      }
    }, 1000);
    return () => clearInterval(sleepInterval.current);
  }, [sleepTimer]);

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      alert("Picture in Picture is not supported on this device/browser.");
    }
  };
  
  const addBookmark = () => {
    if(!playerInstance.current) return;
    const time = playerInstance.current.currentTime;
    if(time === 0) return;
    const newBks = [...bookmarks, { time, label: `Mark at ${Math.floor(time/60)}:${Math.floor(time%60).toString().padStart(2,'0')}` }];
    setBookmarks(newBks);
    localStorage.setItem(`bookmarks_${uniqueId}`, JSON.stringify(newBks));
  };
  
  const jumpTo = (time) => {
    if(!playerInstance.current) return;
    playerInstance.current.currentTime = time;
    playerInstance.current.play();
  };

  const copyVlcLink = () => {
    navigator.clipboard.writeText(data.direct_dl_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadQR = () => {
      if(!qrRef.current) return;
      const svg = qrRef.current.querySelector('svg');
      if(!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.beginPath();
          ctx.rect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "white";
          ctx.fill();
          ctx.drawImage(img, 0, 0);
          const a = document.createElement("a");
          a.download = `QRCode_${data.file_name}.png`;
          a.href = canvas.toDataURL("image/png");
          a.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareLink = async () => {
      const shareData = { title: data.file_name, url: window.location.href };
      if (navigator.share) {
          try { await navigator.share(shareData); } catch(e){}
      } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
      }
  };

  // Build Mobile Intents
  const basePath = data?.direct_dl_link?.replace(/^https?:\/\//, '') || '';
  const makeIntent = (pkg) => `intent://${basePath}#Intent;scheme=https;action=android.intent.action.VIEW;type=video/*;package=${pkg};end`;
  const genericIntent = `intent://${basePath}#Intent;scheme=https;action=android.intent.action.VIEW;type=video/*;end`;
  
  const mobilePlayers = [
      { name: "VLC", icon: vlcLogo, link: makeIntent("org.videolan.vlc") },
      { name: "MX Player", icon: mxLogo, link: makeIntent("com.mxtech.videoplayer.ad") },
      { name: "PlayIt", icon: playitLogo, link: `playit://playerv2/video?url=${data?.direct_dl_link}` },
      { name: "XPlayer", icon: xplayerLogo, link: makeIntent("video.player.videoplayer") },
      { name: "Nova", icon: novaLogo, link: makeIntent("org.courville.nova") },
      { name: "Next", icon: nextLogo, link: makeIntent("dev.anilmisra.nextplayer") },
      { name: "KM Player", icon: kmLogo, link: makeIntent("com.kmplayer") },
  ];

  // -------------------------------------------------------------
  // Render Loading & Errors
  // -------------------------------------------------------------
  if (status === 'loading') return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[color:var(--bg-color)]">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <h2 className="text-xl font-bold tracking-widest uppercase text-[color:var(--text-color)]">Loading Player</h2>
    </div>
  );

  if (status === 'expired') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[color:var(--bg-color)]">
      <Clock size={72} className="text-amber-500 mb-4" />
      <h2 className="text-3xl font-black text-[color:var(--text-color)] mb-2">Link Expired</h2>
      <p className="text-[color:var(--text-muted)] max-w-md mb-8">This stream link has expired. Forward the file to the bot again to get a fresh link instantly.</p>
      <a href="https://t.me/STREAM_DROP_BOT" target="_blank" rel="noreferrer" className="bg-indigo-600 text-white font-bold rounded-xl px-8 py-3">Open Telegram Bot</a>
    </div>
  );

  if (status === 'error') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[color:var(--bg-color)]">
      <AlertTriangle size={72} className="text-red-500 mb-4" />
      <h2 className="text-3xl font-black text-[color:var(--text-color)] mb-2">Content Not Found</h2>
      <p className="text-[color:var(--text-muted)] max-w-md mb-8">The file was removed or the link is invalid.</p>
    </div>
  );

  return (
    <div className={`w-full min-h-full overflow-y-auto overflow-x-hidden transition-colors duration-300 bg-[color:var(--bg-color)] text-[color:var(--text-color)] pb-10`}>
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 md:px-8 border-b border-[color:var(--border-color)] bg-[color:var(--surface-color)] sticky top-0 z-30">
          <div className="flex items-center gap-3">
              <img src={logoImg} alt="StreamDrop" className="w-9 h-9 rounded-lg object-cover shadow-md" />
              <div>
                  <h1 className="font-bold text-lg leading-tight">StreamDrop</h1>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text}`}>Premium Delivery</span>
              </div>
          </div>
          
          <button onClick={() => setShowQr(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] hover:border-indigo-500 transition font-semibold text-sm">
              <QrCode size={16} /> <span className="hidden sm:inline">Share QR</span>
          </button>
      </header>

      {/* Main Grid */}
      <div className={`mx-auto p-4 md:p-6 transition-all duration-300 ease-in-out ${theaterMode ? 'max-w-[1800px]' : 'max-w-[1300px]'} flex flex-col ${theaterMode ? '' : 'lg:flex-row'} gap-6`}>
          
          <div className="flex flex-col flex-1 min-w-0">
              
              {/* ==== Media Viewers ==== */}
              <div className={`w-full rounded-2xl overflow-hidden shadow-lg bg-black border border-[color:var(--border-color)] relative ${
                type === 'video' ? 'aspect-video min-h-[250px] md:min-h-[400px]' : 
                (type === 'audio' ? 'py-20 bg-[color:var(--surface-color)]' : 
                (type === 'document' ? 'h-[75vh] bg-white' : 
                (type === 'image' || type === 'binary' ? 'p-6 bg-[color:var(--surface-color)]' : 'p-6')))
              }`}>    
                  {type === 'video' && (
                      <video ref={videoRef} playsInline preload="auto" className="w-full h-full absolute inset-0 object-contain">
                          <source src={data.direct_dl_link} />
                      </video>
                  )}

                  {type === 'audio' && (
                      <div className="w-full h-full flex flex-col items-center justify-center px-4">
                          <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 ${theme.border} flex items-center justify-center shadow-xl mb-10 relative overflow-hidden`}>
                              <div className={`w-12 h-12 rounded-full ${theme.bg} shadow-inner flex items-center justify-center z-10`}>
                                  <div className="w-3 h-3 rounded-full bg-black" />
                              </div>
                          </div>
                          <div className="w-full max-w-xl">
                              <audio ref={videoRef} playsInline controls className="w-full">
                                  <source src={data.direct_dl_link} />
                              </audio>
                          </div>
                      </div>
                  )}

                  {type === 'document' && (
                      <iframe src={data.direct_dl_link} className="w-full h-full absolute inset-0" title={data.file_name} />
                  )}

                  {type === 'image' && (
                      <img src={data.direct_dl_link} alt={data.file_name} className="max-w-full max-h-[70vh] object-contain mx-auto rounded" />
                  )}

                  {/* ==== BINARY / APK / ARCHIVE ==== */}
                  {type === 'binary' && (
                      <div className="w-full h-full flex flex-col items-center justify-center py-16 px-8 text-center">
                          <div className="w-24 h-24 rounded-3xl bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center mb-6">
                              <Download size={40} className="text-sky-500" />
                          </div>
                          <h3 className="text-xl font-bold text-[color:var(--text-color)] mb-2">{data.file_name}</h3>
                          <p className="text-[color:var(--text-muted)] text-sm mb-2">This is a binary/application file.</p>
                          <p className="text-[color:var(--text-muted)] text-xs mb-8">{data.file_size} · Cannot be previewed in the browser</p>
                          <a href={`${data.direct_dl_link}?download=true`} download
                             className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-sky-500 hover:brightness-110 shadow-lg transition">
                              <Download size={20} /> Download File
                          </a>
                      </div>
                  )}

                  {/* Video overlays */}
                  {type === 'video' && (
                      <>
                          {/* Invisible Touch Hitboxes to brutally prevent native fullscreen double-click */}
                          <div className="absolute top-12 bottom-20 left-0 w-[45%] z-[25]"
                               onDoubleClick={(e) => {
                                   e.preventDefault(); e.stopPropagation();
                                   if(playerInstance.current) { playerInstance.current.rewind(10); showHint('rewind'); }
                               }}
                               onClick={(e) => {
                                   if(playerInstance.current) { playerInstance.current.togglePlay(); }
                               }}
                          />
                          <div className="absolute top-12 bottom-20 right-0 w-[45%] z-[25]"
                               onDoubleClick={(e) => {
                                   e.preventDefault(); e.stopPropagation();
                                   if(playerInstance.current) { playerInstance.current.forward(10); showHint('forward'); }
                               }}
                               onClick={(e) => {
                                   if(playerInstance.current) { playerInstance.current.togglePlay(); }
                               }}
                          />
                          
                          {/* Double Tap Visual Hints */}
                          {hint === 'rewind' && (
                              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center bg-black/40 rounded-full w-20 h-20 text-white animate-pulse pointer-events-none">
                                  <FastForward size={24} className="rotate-180 mb-1" />
                                  <span className="font-bold text-sm">-10s</span>
                              </div>
                          )}
                          {hint === 'forward' && (
                              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 z-30 flex flex-col items-center justify-center bg-black/40 rounded-full w-20 h-20 text-white animate-pulse pointer-events-none">
                                  <FastForward size={24} className="mb-1" />
                                  <span className="font-bold text-sm">+10s</span>
                              </div>
                          )}
                          
                          <div className="absolute top-4 right-4 z-20 flex gap-2">
                              <button onClick={togglePiP} className="p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur" title="Picture in Picture">
                                  <PictureInPicture size={18} />
                              </button>
                          </div>
                      </>
                  )}
              </div>

              {/* ==== Advanced Control Panel ==== */}
              <div className="mt-5 p-5 md:p-6 bg-[color:var(--surface-color)] rounded-2xl border border-[color:var(--border-color)] shadow-sm">
                  
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                      <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[color:var(--bg-color)] border border-[color:var(--border-color)] ${theme.text}`}>{type}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--text-muted)] bg-[color:var(--bg-color)] border border-[color:var(--border-color)]">{data.file_size}</span>
                          </div>
                          <h1 className="text-xl md:text-2xl font-bold leading-tight break-words">{data.file_name}</h1>
                      </div>
                      
                      <div className="flex items-start gap-3 shrink-0">
                          <a href={`${data.direct_dl_link}?download=true`} download className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white ${theme.bg} hover:brightness-110 transition shadow-md`}>
                              <Download size={18} /> Download
                          </a>
                      </div>
                  </div>

                  {/* Tools Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[color:var(--border-color)]">
                      {(type === 'video' || type === 'audio') && (
                          <>
                              <button onClick={addBookmark} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--bg-color)] hover:bg-[color:var(--border-color)] font-semibold text-sm transition">
                                  <Check size={16} className={theme.text}/> Mark Spot
                              </button>
                              
                              <div className="relative group">
                                  <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${timerActive ? theme.bg + ' text-white' : 'bg-[color:var(--bg-color)] hover:bg-[color:var(--border-color)]'} font-semibold text-sm transition`}>
                                      <Timer size={16} className={timerActive ? 'text-white' : theme.text} /> {timerActive ? `${sleepTimer}m left` : 'Timer'}
                                  </button>
                                  <div className="absolute top-full left-0 mt-1 py-1 w-32 bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-lg shadow-xl opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-20">
                                      {[15, 30, 45, 60, 0].map(m => (
                                          <button key={m} onClick={() => setSleepTimer(m)} className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-[color:var(--bg-color)]">
                                              {m === 0 ? 'Off' : `${m} Mins`}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              
                              {type === 'video' && (
                                  <button onClick={() => setTheaterMode(!theaterMode)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[color:var(--bg-color)] hover:bg-[color:var(--border-color)] font-semibold text-sm transition hidden lg:flex">
                                      <Maximize size={16} className={theme.text}/> Theater
                                  </button>
                              )}
                          </>
                      )}
                  </div>
              </div>

              {/* ==== External Players Area ==== */}
              {(type === 'video' || type === 'audio') && (
                  <div className="mt-5 p-5 bg-[color:var(--surface-color)] rounded-2xl border border-[color:var(--border-color)] shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text-muted)] mb-4">Open in External Player</h3>
                      
                      {isMobile ? (
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                              <a href={genericIntent} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-[color:var(--bg-color)] transition text-center group">
                                  <div className="w-12 h-12 rounded-2xl bg-[color:var(--bg-color)] border border-[color:var(--border-color)] flex items-center justify-center group-hover:border-indigo-500 transition shadow-sm">
                                      <Smartphone size={24} className="text-[color:var(--text-muted)]" />
                                  </div>
                                  <span className="text-[10px] font-bold text-[color:var(--text-color)] leading-tight">Choose<br/>System</span>
                              </a>
                              {mobilePlayers.map((player) => (
                                  <a key={player.name} href={player.link} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-[color:var(--bg-color)] transition text-center group">
                                      <div className="w-12 h-12 rounded-2xl bg-[color:var(--bg-color)] border border-[color:var(--border-color)] flex items-center justify-center p-2 group-hover:border-indigo-500 transition shadow-sm">
                                          <img src={player.icon} alt={player.name} className="w-full h-full object-contain drop-shadow" />
                                      </div>
                                      <span className="text-[10px] font-bold text-[color:var(--text-color)]">{player.name}</span>
                                  </a>
                              ))}
                          </div>
                      ) : (
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[color:var(--bg-color)] border border-[color:var(--border-color)]">
                                <div className="flex-1">
                                    <h4 className="font-bold mb-1">Use a desktop media player</h4>
                                    <p className="text-sm text-[color:var(--text-muted)]">Formats like MKV or HEVC work flawlessly without lag in VLC Media Player.</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3 w-full sm:w-auto">
                                    <a href={data.vlc_player_link_pc} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-sm transition">
                                        <MonitorPlay size={18} /> Open VLC
                                    </a>
                                    <button onClick={copyVlcLink} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[color:var(--surface-color)] border border-[color:var(--border-color)] font-bold text-sm transition">
                                        {copied ? <Check size={18} className="text-green-500"/> : <ExternalLink size={18} />} URL
                                    </button>
                                </div>
                          </div>
                      )}
                  </div>
              )}
          </div>

          {/* ── Sidebar (Queue & Bookmarks) ── */}
          {(!theaterMode) && (
              <div className="flex flex-col gap-5 w-full lg:w-[340px] shrink-0">
                  
                  {/* Bookmarks */}
                  {bookmarks.length > 0 && (
                      <div className="bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-sm">Saved Moments</h3>
                              <button onClick={() => {setBookmarks([]); localStorage.removeItem(`bookmarks_${uniqueId}`)}} className="text-xs text-red-500 font-semibold hover:underline">Clear</button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                              {bookmarks.map((bk, i) => (
                                  <button key={i} onClick={() => jumpTo(bk.time)} className="flex flex-col items-start p-2 rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] hover:border-indigo-500 transition text-left group">
                                      <span className={`text-xs font-bold ${theme.text}`}>{bk.label}</span>
                                      <span className="text-[10px] text-[color:var(--text-muted)] mt-0.5 group-hover:text-[color:var(--text-color)]">Click to jump</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Playlist Queue with Filters */}
                  {data.user_files?.length > 0 && (
                      <QueuePanel files={data.user_files} currentId={uniqueId} theme={theme} />
                  )}
              </div>
          )}
      </div>

      {/* QR Modal */}
      {showQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowQr(false)}>
              <div className="bg-[color:var(--surface-color)] p-6 rounded-3xl border border-[color:var(--border-color)] shadow-2xl flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold mb-2">Scan & Watch</h3>
                  <p className="text-[color:var(--text-muted)] text-sm mb-6 text-center">Scan to instantly open this page on your phone or smart TV.</p>
                  
                  <div className="p-4 bg-white rounded-xl shadow-inner mb-6 border border-gray-200" ref={qrRef}>
                      <QRCodeSVG value={window.location.href} size={200} level="H" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 w-full">
                      <button onClick={downloadQR} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] hover:border-indigo-500 font-bold text-sm transition">
                          <Download size={16} /> Save QR
                      </button>
                      <button onClick={shareLink} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[color:var(--bg-color)] border border-[color:var(--border-color)] hover:border-indigo-500 font-bold text-sm transition">
                          <Share2 size={16} /> Share Link
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
