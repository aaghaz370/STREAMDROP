import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import {
  Download, AlertTriangle, MonitorPlay, Film, Smartphone,
  Tv2, Music, Clock, Search, ChevronRight
} from 'lucide-react';

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

function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const player = new Plyr(videoRef.current, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'mute', 'volume',
        'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      settings: ['quality', 'speed'],
      keyboard: { focused: true, global: true },
      autoplay: true,
    });
    return () => { try { player.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full h-full bg-black overflow-hidden flex items-center justify-center rounded-xl" style={{ borderRadius: 8, background: '#000' }}>
      <video ref={videoRef} playsInline crossOrigin="anonymous" className="w-full h-full object-contain">
        <source src={src} />
      </video>
    </div>
  );
}

function AudioPlayer({ src, title }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const p = new Plyr(ref.current, {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
      autoplay: true,
    });
    return () => { try { p.destroy(); } catch {} };
  }, [src]);

  return (
    <div className="w-full flex flex-col items-center justify-center px-8 py-10 gap-6 bg-[color:var(--bg-color)]">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#121212] border border-[color:var(--border-color)] flex items-center justify-center shadow-2xl">
        <Music size={48} className="text-white/20" />
      </div>
      <div className="text-center w-full max-w-2xl px-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight text-[color:var(--text-color)]">{title}</h2>
        <p className="text-[color:var(--text-muted)] text-sm mb-6">StreamDrop Audio Stream</p>
      </div>
      <div className="px-2 w-full max-w-sm">
        <audio ref={ref} crossOrigin="anonymous">
          <source src={src} />
        </audio>
      </div>
    </div>
  );
}

function ActionButtons({ data }) {
  const mob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const b = 'inline-flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition-all active:scale-95 hover:opacity-90';

  return (
    <div className="flex flex-col gap-3 min-w-[200px]">
      <a href={`${data.direct_dl_link}?download=true`} download className={`${b} bg-indigo-500 text-white border-indigo-500 shadow-lg`}>
        <Download size={18} /> Download Link
      </a>
      {mob ? (
        <div className="flex items-center gap-2 mt-1">
          <a href={data.vlc_player_link_mobile} className={`${b} !text-orange-400 bg-orange-400/10 border-transparent hover:bg-orange-400/20`}>
            <Smartphone size={18} /> VLC
          </a>
          <a href={data.mx_player_link} className={`${b} !text-blue-400 bg-blue-400/10 border-transparent hover:bg-blue-400/20`}>
            <Tv2 size={18} /> MX
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-1">
          <a href={data.vlc_player_link_pc} className={`${b} text-[color:var(--text-color)] bg-white/5 border-transparent hover:bg-white/10`}>
            <MonitorPlay size={18} className="text-purple-400" /> VLC Desktop
          </a>
          <button onClick={() => {
            navigator.clipboard.writeText(data.direct_dl_link);
            alert('Stream URL copied! Open VLC on PC > Media > Open Network Stream and paste the URL.');
          }} className={`${b} text-[color:var(--text-color)] bg-white/5 border-transparent hover:bg-white/10`}>
            🔗 Copy VLC URL
          </button>
        </div>
      )}
    </div>
  );
}

function Queue({ currentId, files }) {
  const [q, setQ]   = useState('');
  const [tab, setTab] = useState('all');
  const shown = useMemo(() => (files || []).filter(f =>
    (tab === 'all' || f.type === tab) && (!q || f.name.toLowerCase().includes(q.toLowerCase()))
  ), [files, tab, q]);

  if (!files?.length) return null;

  return (
    <div className="flex flex-col h-full bg-[color:var(--surface-color)] border border-[color:var(--border-color)] overflow-hidden rounded-xl">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <h3 className="text-lg font-bold text-[color:var(--text-color)]">Up Next</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search files..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted)] focus:border-indigo-500 outline-none transition"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'video', 'audio'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${tab === t ? 'bg-indigo-500 text-white' : 'bg-white/10 text-[color:var(--text-muted)] hover:text-[color:var(--text-color)]'}`}
            >{t}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {shown.length === 0
          ? <p className="text-[color:var(--text-muted)] text-sm text-center py-8">No files match your search.</p>
          : shown.map(f => (
            <a key={f.id} href={f.stream_link}
              className={`group flex items-start gap-3 p-2.5 rounded-md transition-colors hover:bg-[color:var(--bg-color)] ${f.id === currentId ? 'bg-white/5 text-indigo-400' : 'text-[color:var(--text-color)]'}`}
            >
              <div className={`w-10 h-10 rounded-md bg-[color:var(--bg-color)] flex items-center justify-center flex-shrink-0 ${f.id === currentId ? 'text-indigo-400' : 'text-[color:var(--text-muted)]'}`}>
                {f.type === 'audio' ? <Music size={18} /> : (f.type === 'video' ? <Film size={18} /> : <Film size={18} />)}
              </div>
              <div className="min-w-0 flex-1 mt-0.5">
                <p className="font-semibold text-sm truncate leading-tight" title={f.name}>{f.name}</p>
                <p className="text-xs text-[color:var(--text-muted)] opacity-80 mt-1">{f.size}</p>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-[color:var(--text-muted)] transition flex-shrink-0 mt-1.5" />
            </a>
          ))
        }
      </div>
    </div>
  );
}

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
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[color:var(--text-muted)] text-sm font-bold uppercase tracking-widest">Connecting</p>
    </div>
  );

  if (status === 'expired') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-4">
      <Clock size={72} className="text-amber-400 mb-2" />
      <h2 className="text-3xl font-bold mb-2">Link Expired</h2>
      <p className="text-[color:var(--text-muted)] text-sm max-w-md mb-2">This link has expired.</p>
      <p className="text-xs text-[color:var(--text-muted)] max-w-sm mb-6">To get a new stream link, simply send the file again to the bot and a fresh link will be generated instantly.</p>
      <a href="https://t.me/STREAM_DROP_BOT" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-indigo-500 text-white font-semibold rounded px-6 py-3 hover:brightness-110 active:scale-95 transition">
        Open Bot
      </a>
    </div>
  );

  if (status === 'error') return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-4">
      <AlertTriangle size={64} className="text-indigo-500 mb-2" />
      <h2 className="text-3xl font-bold mb-2">Content Unavailable</h2>
      <p className="text-[color:var(--text-muted)] text-sm max-w-md mb-6">The file you are looking for has been removed or is inaccessible.</p>
      <a href="https://t.me/STREAM_DROP_BOT" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-indigo-500 text-white font-semibold rounded px-6 py-3 hover:brightness-110 active:scale-95 transition">
        Open Bot
      </a>
    </div>
  );

  const type    = classify(data.file_name);
  const isVideo = data.is_media && type === 'video';
  const isAudio = data.is_media && type === 'audio';
  const playable = canPlay(data.file_name);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[color:var(--bg-color)]">
      
      {/* ── Header ── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 w-full pointer-events-none">
          <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white drop-shadow">StreamDrop</span>
          </div>
          <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white/70 drop-shadow">
                  Powered by <span className="text-white">UNIVORA</span>
              </span>
          </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 mt-14">
          
          <div className="flex flex-col min-w-0">
              
              <div className="w-full mb-6">
                  {isVideo && playable && <VideoPlayer src={data.direct_dl_link} />}
                  {isVideo && !playable && (
                      <div className="w-full py-24 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-color)] flex flex-col items-center justify-center">
                          <Film size={64} className="text-[color:var(--text-muted)] mb-4" />
                          <h3 className="text-xl font-bold mb-2">Format Not Supported</h3>
                          <p className="text-[color:var(--text-muted)]">HEVC/10-bit files cannot play in the browser. Use an external player.</p>
                      </div>
                  )}
                  {isAudio && <AudioPlayer src={data.direct_dl_link} title={data.file_name} />}
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-[color:var(--surface-color)] p-6 rounded-xl border border-[color:var(--border-color)]">
                  <div className="flex-1 min-w-0">
                      <h1 className="text-xl md:text-2xl font-bold mb-2 break-all">{data.file_name}</h1>
                      <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[color:var(--text-muted)] bg-white/5 px-2 py-1 rounded">{data.file_size}</span>
                          <span className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">Ready</span>
                      </div>
                  </div>
                  <ActionButtons data={data} />
              </div>

          </div>

          <div className="w-full lg:w-auto h-[600px] lg:h-auto">
              <Queue currentId={uniqueId} files={data.user_files} />
          </div>

      </div>
    </div>
  );
}
