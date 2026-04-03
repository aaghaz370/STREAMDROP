import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize, Volume2, VolumeX, SkipForward, SkipBack, Share2, Download, AlertTriangle, MonitorPlay, Film } from 'lucide-react';

export default function Show() {
  const { uniqueId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Video State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  let hideControlsTimeout = useRef(null);

  useEffect(() => {
    fetch(`/api/file/${uniqueId}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 410 ? 'File Expired' : 'File Not Found');
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [uniqueId]);

  // Video Player Logic
  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const vc = videoRef.current;
    if (!vc) return;
    const current = (vc.currentTime / vc.duration) * 100;
    setProgress(current);
    setCurrentTime(formatTime(vc.currentTime));
  };

  const handleLoadedMetadata = () => {
    setDuration(formatTime(videoRef.current.duration));
  };

  const handleSeek = (e) => {
    const vc = videoRef.current;
    const seekTime = (e.target.value / 100) * vc.duration;
    vc.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const toggleMute = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.parentNode.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const handleDoubleTap = (e) => {
     const rect = e.target.getBoundingClientRect();
     const x = e.clientX - rect.left;
     if (x > rect.width / 2) {
       videoRef.current.currentTime += 10;
     } else {
       videoRef.current.currentTime -= 10;
     }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-[color:var(--text-muted)] animate-pulse">Loading Stream...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">{error}</h2>
        <p className="text-[color:var(--text-muted)] max-w-md">
          {error === 'File Expired' 
            ? 'This link has expired due to plan limits. Please share the file again to the bot to generate a new link.' 
            : 'The file you requested was not found. It may have been deleted.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-full overflow-hidden relative">
      
      {/* Video Player Section */}
      <div className="flex-1 h-full max-h-[40vh] md:max-h-none md:h-full bg-black relative shadow-2xl flex flex-col justify-center overflow-hidden group">
        
        {data.is_media ? (
          <div 
            className="w-full h-full relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onDoubleClick={handleDoubleTap}
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={data.direct_dl_link}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              playsInline
              autoPlay
            />
            
            {/* Custom Netflix-style Skin */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 flex flex-col justify-between p-4 md:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-center w-full z-10">
                    <h2 className="text-white md:text-xl font-medium tracking-wide truncate max-w-[70%] drop-shadow-md">
                      {data.file_name}
                    </h2>
                    <div className="flex space-x-3">
                       <MonitorPlay className="text-white hover:text-indigo-400 cursor-pointer transition" size={20} />
                       <Share2 className="text-white hover:text-indigo-400 cursor-pointer transition" size={20} />
                    </div>
                  </div>
                  
                  {/* Bottom Controls */}
                  <div className="w-full space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full flex items-center group/scrub">
                      <input 
                        type="range" min="0" max="100" value={progress} onChange={handleSeek}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hover:h-2 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center w-full">
                       <div className="flex items-center space-x-6">
                         <button onClick={togglePlay} className="text-white hover:scale-110 transition">
                           {isPlaying ? <Pause fill="white" size={28} /> : <Play fill="white" size={28} />}
                         </button>
                         <button onClick={() => { videoRef.current.currentTime -= 10 }} className="text-white hidden md:block hover:scale-110 transition">
                           <SkipBack size={24} />
                         </button>
                         <button onClick={() => { videoRef.current.currentTime += 10 }} className="text-white hidden md:block hover:scale-110 transition">
                           <SkipForward size={24} />
                         </button>
                         <div className="flex items-center space-x-2 text-white/90">
                           <button onClick={toggleMute} className="hover:text-indigo-400 transition">
                             {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                           </button>
                         </div>
                         <div className="text-white font-medium text-sm tabular-nums">
                           {currentTime} / {duration}
                         </div>
                       </div>
                       
                       <div className="flex items-center space-x-4">
                         <button onClick={toggleFullscreen} className="text-white hover:scale-110 transition">
                           <Maximize size={24} />
                         </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[color:var(--surface-color)] border-b border-[color:var(--border-color)]">
             <div className="w-24 h-24 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                <Film size={48} />
             </div>
             <h2 className="text-2xl font-bold text-center mb-2">{data.file_name}</h2>
             <p className="text-[color:var(--text-muted)] mb-8">Size: {data.file_size}</p>
             <a href={data.direct_dl_link} download className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30">
               <Download size={20} /> Download File
             </a>
          </div>
        )}
      </div>
      
      {/* Sidebar Playlist / Players */}
      <div className="w-full md:w-80 h-full overflow-y-auto bg-[color:var(--surface-color)] border-l border-[color:var(--border-color)] flex flex-col z-10">
         <div className="p-6 pb-2 border-b border-[color:var(--border-color)]">
           <h3 className="text-lg font-bold">External Players</h3>
           <p className="text-sm text-[color:var(--text-muted)] mb-4">Watch externally with high speed</p>
           
           <div className="space-y-3">
             <a href={data.vlc_player_link_mobile} className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500/20 transition">
               <span className="font-semibold">VLC Mobile</span>
               <Play size={18} />
             </a>
             <a href={data.mx_player_link} className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition">
               <span className="font-semibold">MX Player</span>
               <Play size={18} />
             </a>
             <a href={data.vlc_player_link_pc} className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20 transition">
               <span className="font-semibold">Desktop VLC</span>
               <MonitorPlay size={18} />
             </a>
           </div>
           
           <div className="mt-8 mb-4 border-t border-[color:var(--border-color)] pt-6">
             <a href={data.direct_dl_link} className="w-full py-3 bg-[color:var(--bg-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] font-bold rounded-xl flex justify-center items-center gap-2 hover:border-indigo-500 transition-colors">
               <Download size={20} className="text-indigo-500" /> Fast Download
             </a>
           </div>
         </div>
         
         <div className="flex-1 p-6 pt-4">
           {data.playlist && data.playlist.length > 0 && (
             <>
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 Up Next
               </h3>
               <div className="space-y-2">
                 {data.playlist.map(item => (
                   <Link key={item.id} to={`/show/${item.id}`} className="group block p-3 rounded-xl border border-[color:var(--border-color)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition">
                     <p className="text-sm font-medium truncate group-hover:text-indigo-500 transition-colors">{item.name}</p>
                     <p className="text-xs text-[color:var(--text-muted)] mt-1">{item.size}</p>
                   </Link>
                 ))}
               </div>
             </>
           )}
         </div>
      </div>

    </div>
  );
}
