import { useState, useEffect } from 'react';
import {
  Sparkles, Zap, Shield, Globe, Terminal, BookOpen,
  Film, Music, Image as ImageIcon, FileText, Package,
  Clock, Download, Share2, QrCode, Bookmark, MonitorPlay,
  Smartphone, Keyboard, PictureInPicture, Moon, Theater,
  ChevronRight, Star, CheckCircle2, ExternalLink, Heart,
  BarChart3, HardDrive, Activity, User, Crown, Info
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

// ─── COMMANDS DATA ────────────────────────────────────────────
const COMMANDS = [
  { cmd: '/start',    desc: 'Start the bot & see welcome message', icon: <Zap size={16}/> },
  { cmd: '/my_links', desc: 'View your 5 most recent file links', icon: <Film size={16}/> },
  { cmd: '/plan',     desc: 'Check your current subscription plan & limits', icon: <Crown size={16}/> },
  { cmd: '/help',     desc: 'Show all commands and quick guide', icon: <BookOpen size={16}/> },
  { cmd: 'Send File', desc: 'Send any file/video/photo to get a stream link instantly', icon: <Share2 size={16}/> },
];

// ─── PLANS DATA ───────────────────────────────────────────────
const PLANS = [
  { name: 'Free',      color: 'from-gray-500 to-gray-600',    limit: '5/day',        expiry: '24 Hours',   price: 'Free' },
  { name: 'Weekly',    color: 'from-blue-500 to-blue-600',    limit: 'Unlimited',    expiry: '6 Months',   price: '₹49' },
  { name: 'Monthly',   color: 'from-indigo-500 to-violet-600',limit: 'Unlimited',    expiry: '8 Months',   price: '₹99' },
  { name: 'BiMonthly', color: 'from-purple-500 to-pink-600',  limit: 'Unlimited',    expiry: '1 Year',     price: '₹149' },
  { name: 'Lifetime',  color: 'from-amber-400 to-orange-500', limit: 'Unlimited',    expiry: 'Never',      price: '₹499' },
];

// ─── FEATURES DATA ────────────────────────────────────────────
const FEATURES = [
  { icon: <MonitorPlay size={20}/>,     title: 'Browser Streaming',        desc: 'Play videos/audio directly in any browser — no app needed', color: 'text-indigo-500' },
  { icon: <Smartphone size={20}/>,      title: 'Mobile App Intents',       desc: 'Open in VLC, MX Player, PlayIt or any Android player', color: 'text-violet-500' },
  { icon: <Download size={20}/>,        title: '1-Click Download',         desc: 'Download any file instantly with one tap', color: 'text-emerald-500' },
  { icon: <QrCode size={20}/>,          title: 'QR Code Sharing',          desc: 'Generate & save QR codes for any file link', color: 'text-amber-500' },
  { icon: <PictureInPicture size={20}/>,title: 'Picture-in-Picture',       desc: 'Float the player while using other apps', color: 'text-pink-500' },
  { icon: <Theater size={20}/>,         title: 'Theatre Mode',             desc: 'Distraction-free full-width player mode', color: 'text-sky-500' },
  { icon: <Bookmark size={20}/>,        title: 'Mark Spots',               desc: 'Bookmark timestamps to jump back to key moments', color: 'text-rose-500' },
  { icon: <Clock size={20}/>,           title: 'Sleep Timer',              desc: 'Auto-pause after 15, 30, 60 or 90 minutes', color: 'text-teal-500' },
  { icon: <Keyboard size={20}/>,        title: 'Keyboard Shortcuts',       desc: 'Space/Arrow keys, F for fullscreen, M for mute', color: 'text-cyan-500' },
  { icon: <Shield size={20}/>,          title: 'Secure HMAC Auth',         desc: 'Cryptographically signed dashboard access tokens', color: 'text-green-500' },
  { icon: <Film size={20}/>,            title: 'Video Streaming',          desc: 'Smooth HLS-like range-request streaming from Telegram', color: 'text-blue-500' },
  { icon: <Music size={20}/>,           title: 'Audio Player',             desc: 'Dedicated audio UI with waveform visualization', color: 'text-purple-500' },
  { icon: <ImageIcon size={20}/>,       title: 'Image Viewer',             desc: 'Full-screen image preview for photos', color: 'text-amber-400' },
  { icon: <FileText size={20}/>,        title: 'Document Preview',         desc: 'View PDFs and docs directly in the browser', color: 'text-emerald-400' },
  { icon: <Package size={20}/>,         title: 'APK / File Downloads',     desc: 'Any binary/archive shown with direct download UI', color: 'text-sky-400' },
  { icon: <BarChart3 size={20}/>,       title: 'Smart Dashboard',          desc: 'Filter, sort, search all your files with advanced controls', color: 'text-indigo-400' },
  { icon: <Share2 size={20}/>,          title: 'Link Sharing',             desc: 'Native share sheet integration on mobile browsers', color: 'text-rose-400' },
  { icon: <Moon size={20}/>,            title: 'Day / Night Mode',         desc: 'System-aware theme with manual toggle', color: 'text-violet-400' },
  { icon: <HardDrive size={20}/>,       title: 'Cloud Library',            desc: 'All your files in a filterable sidebar playlist', color: 'text-teal-400' },
  { icon: <Activity size={20}/>,        title: 'Stream Persistence',       desc: 'Last-played link auto-restored on revisit', color: 'text-green-400' },
  { icon: <Globe size={20}/>,           title: 'Embed Support',            desc: 'Embed any stream as an <iframe> on any website', color: 'text-blue-400' },
  { icon: <Zap size={20}/>,            title: 'Instant Links',            desc: 'Get your stream URL in seconds — just send a file', color: 'text-yellow-500' },
];

// ─── STAT CARD ────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[color:var(--text-color)]">{value}</p>
        <p className="text-xs text-[color:var(--text-muted)] font-semibold uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function Profile() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('streamdrop_stats') || 'null');
      setStats(s);
    } catch {}
  }, []);

  const tabs = [
    { key: 'features', label: 'Features',  icon: <Sparkles size={15}/> },
    { key: 'commands', label: 'Commands',  icon: <Terminal size={15}/> },
    { key: 'plans',    label: 'Plans',     icon: <Crown size={15}/> },
    { key: 'about',    label: 'About',     icon: <Info size={15}/> },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-[color:var(--bg-color)] text-[color:var(--text-color)] min-h-full pb-24">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative flex items-start gap-5 flex-wrap">
          <img src={logoImg} alt="StreamDrop" className="w-16 h-16 rounded-2xl object-cover shadow-xl border-2 border-white/20" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">StreamDrop</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white uppercase tracking-widest">Premium</span>
            </div>
            <p className="text-white/70 text-sm font-medium mb-3">by <span className="text-white font-bold">Univora</span> · Dev: <span className="text-white font-bold">Rolex Sir</span></p>
            <p className="text-white/80 text-sm leading-relaxed max-w-xl">
              The most advanced Telegram file streaming platform. Watch movies, listen to music, view images & download any file — instantly, from anywhere.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href="https://univora.site" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition border border-white/20">
                <Globe size={14}/> univora.site <ExternalLink size={12}/>
              </a>
              <a href="https://t.me/RolexSir_8" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition border border-white/20">
                <User size={14}/> @RolexSir_8
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Files" value={stats.total || 0} icon={<HardDrive size={20}/>} color="text-indigo-500 bg-indigo-500" />
          <StatCard label="Active"      value={stats.active || 0} icon={<Activity size={20}/>}  color="text-green-500 bg-green-500" />
          <StatCard label="Expired"     value={stats.expired || 0} icon={<Clock size={20}/>}   color="text-red-500 bg-red-500" />
          <StatCard label="Features"    value="22+"  icon={<Star size={20}/>}    color="text-amber-500 bg-amber-500" />
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === t.key
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-[color:var(--surface-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-color)] border border-[color:var(--border-color)]'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── FEATURES TAB ── */}
      {activeTab === 'features' && (
        <div>
          <p className="text-[color:var(--text-muted)] text-sm mb-5 font-medium">22+ exclusive features — only on StreamDrop.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="group bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-2xl p-4 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-[color:var(--bg-color)] flex items-center justify-center mb-3 ${f.color} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <p className="font-bold text-sm text-[color:var(--text-color)] mb-1">{f.title}</p>
                <p className="text-xs text-[color:var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMMANDS TAB ── */}
      {activeTab === 'commands' && (
        <div className="space-y-3">
          <p className="text-[color:var(--text-muted)] text-sm mb-5 font-medium">All bot commands — English guide.</p>
          {COMMANDS.map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-2xl hover:border-indigo-500/30 transition">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <code className="text-sm font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{c.cmd}</code>
                <p className="text-sm text-[color:var(--text-muted)] mt-1 leading-relaxed">{c.desc}</p>
              </div>
              <ChevronRight size={16} className="text-[color:var(--text-muted)] shrink-0 mt-1" />
            </div>
          ))}

          {/* How to use */}
          <div className="mt-6 p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-2xl">
            <h3 className="font-bold text-[color:var(--text-color)] mb-3 flex items-center gap-2"><BookOpen size={16} className="text-indigo-500"/> How to Use</h3>
            <ol className="space-y-2">
              {[
                '1. Start the bot with /start',
                '2. Send any video, audio, image, PDF, APK or document',
                '3. Bot instantly generates a stream + download link',
                '4. Share the link with anyone — works in any browser',
                '5. Use the Dashboard to manage all your files',
                '6. Upgrade your plan for unlimited uploads & longer expiry',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-[color:var(--text-muted)]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ── PLANS TAB ── */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <p className="text-[color:var(--text-muted)] text-sm mb-5 font-medium">Upgrade for unlimited streaming, longer links & more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLANS.map((p, i) => (
              <div key={i} className={`relative rounded-2xl border overflow-hidden ${i === 4 ? 'border-amber-500/30' : 'border-[color:var(--border-color)]'} bg-[color:var(--surface-color)]`}>
                <div className={`h-1.5 bg-gradient-to-r ${p.color}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-black text-base bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>{p.name}</span>
                    <span className="text-2xl font-extrabold text-[color:var(--text-color)]">{p.price}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-muted)]">Daily Uploads</span>
                      <span className="font-bold text-[color:var(--text-color)]">{p.limit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-muted)]">Link Expiry</span>
                      <span className="font-bold text-[color:var(--text-color)]">{p.expiry}</span>
                    </div>
                  </div>
                  {i === 4 && (
                    <div className="mt-3 flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Crown size={12}/> Best Value
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[color:var(--text-muted)] mt-4 text-center">
            Contact <a href="https://t.me/RolexSir_8" className="text-indigo-400 hover:underline font-semibold">@RolexSir_8</a> on Telegram to upgrade your plan.
          </p>
        </div>
      )}

      {/* ── ABOUT TAB ── */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          <div className="p-6 bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-2xl">
            <div className="flex items-center gap-4 mb-5">
              <img src={logoImg} alt="StreamDrop" className="w-14 h-14 rounded-xl object-cover shadow-lg" />
              <div>
                <h2 className="text-xl font-extrabold text-[color:var(--text-color)]">StreamDrop</h2>
                <p className="text-sm text-[color:var(--text-muted)]">by Univora · Premium File Streaming</p>
              </div>
            </div>
            <p className="text-sm text-[color:var(--text-muted)] leading-relaxed mb-4">
              StreamDrop is the premium file streaming platform by <strong className="text-[color:var(--text-color)]">Univora</strong>. 
              Built on top of Telegram's secure cloud infrastructure, it turns any file into an instantly streamable, 
              shareable link — accessible on any device, anywhere in the world.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Platform', value: 'Univora' },
                { label: 'Developer', value: 'Rolex Sir' },
                { label: 'Backend', value: 'FastAPI + MongoDB' },
                { label: 'Storage', value: 'Telegram Cloud' },
                { label: 'Frontend', value: 'React + Tailwind' },
                { label: 'Hosting', value: 'Render.com' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-[color:var(--bg-color)] rounded-xl border border-[color:var(--border-color)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">{item.label}</p>
                  <p className="text-sm font-bold text-[color:var(--text-color)] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-indigo-500/20 rounded-2xl flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-bold text-[color:var(--text-color)]">Made with <Heart size={14} className="inline text-red-500"/> by Rolex Sir</p>
              <p className="text-xs text-[color:var(--text-muted)] mt-0.5">Powered by Univora · All rights reserved</p>
            </div>
            <a href="https://univora.site" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:brightness-110 transition">
              <Globe size={14}/> Visit Univora
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
