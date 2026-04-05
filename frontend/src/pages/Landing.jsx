import React from 'react';
import { motion } from 'framer-motion';
import {
  Play, Download, Shield, Zap, Globe, Smartphone, MonitorPlay,
  Settings, Clock, Lock, Cloud, Cpu, Server, Sparkles, ChevronRight,
  CheckCircle2, Heart, Code, Boxes
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Landing() {
  const BOT_LINK = "https://t.me/STREAM_DROP_BOT";
  const MANAGER_LINK = "https://t.me/Univora_Managerbot";

  const FADE_UP = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const STAGGER = {
    show: { transition: { staggerChildren: 0.1 } }
  };

  const FEATURE_GROUPS = [
    {
      category: "Streaming & Playback",
      icon: <MonitorPlay className="text-blue-400" />,
      items: [
        "1-Click Instant Web Playback", "No External App Required", "Background Playback Support",
        "Picture-in-Picture Mode", "HLS Adaptive Bitrate Streaming", "Auto-Resume Last Played",
        "Resume from Specific Timestamp", "Hardware Accelerated UI", "MX Player Native Intent",
        "VLC Media Player Support"
      ]
    },
    {
      category: "Speed & Performance",
      icon: <Zap className="text-amber-400" />,
      items: [
        "Zero Bandwidth Throttling", "Multi-Threaded Video Delivery", "Bypass Telegram Rate Limits",
        "Edge CDN Server Routing", "Optimized Mobile Buffering", "Minimal Latency Video Start",
        "Lightweight 5MB App Size", "Lag-Free Javascript Engine", "99.9% Uptime Reliability",
        "Global Server Availability"
      ]
    },
    {
      category: "Security & Privacy",
      icon: <Shield className="text-emerald-400" />,
      items: [
        "AES-256 Link Encryption", "HMAC SHA-256 Token Auth", "Dynamic Expiry Timers",
        "Anti-Hotlinking Protection", "100% Anonymous Downloads", "No User Data Tracking",
        "IP Address Masking", "Self-Destructing Links", "Bot Abuse Protection",
        "Secure TLS/SSL Certificates"
      ]
    },
    {
      category: "Bot & Automation",
      icon: <Cpu className="text-purple-400" />,
      items: [
        "Instant Bot Response Time", "Batch File Forwarding", "Auto-Generate Thumbnails",
        "Detect File Type & Sizes", "Custom Upload Naming", "In-Bot Premium Tiers",
        "Auto-Renewing Lifetime Links", "Self-Serve Trial Buttons", "Native Telegram API",
        "Live Upload Progress"
      ]
    },
    {
      category: "Dashboard & Management",
      icon: <Settings className="text-pink-400" />,
      items: [
        "Personalized Web Dashboard", "Track Total Files Downloaded", "View Active Subscriptions",
        "Monitor Daily Usage Limits", "1-Click File Deletion", "Sort by Name & Date",
        "Quick Search Files", "Dark & Light Theme Toggles", "Real-time Syncing",
        "Cross-Device Session Persistence"
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[color:var(--bg-color)] text-[color:var(--text-color)] font-sans overflow-x-hidden selection:bg-indigo-500/30">

      {/* ── TOP NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 bg-[color:var(--surface-color)]/80 backdrop-blur-xl border-b border-[color:var(--border-color)] transition-all">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="StreamDrop" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-lg border border-[color:var(--border-color)] object-cover" />
            <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              StreamDrop
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#features" className="hidden md:block text-sm font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-color)] transition-colors">Features</a>
            <a href="#how-it-works" className="hidden md:block text-sm font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-color)] transition-colors">Docs</a>
            <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] transition-all transform hover:-translate-y-0.5">
              Launch Bot
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-5 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-[100px] -z-10 pointer-events-none" />

        <motion.div initial="hidden" animate="show" variants={STAGGER} className="max-w-4xl w-full flex flex-col items-center">

          <motion.div variants={FADE_UP} className="mb-6 lg:mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[color:var(--surface-color)] border border-[color:var(--border-color)] shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-[color:var(--text-color)]">Introducing the Ultimate Telegram Streaming Bot</span>
          </motion.div>

          <motion.h1 variants={FADE_UP} className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6">
            Bypass Limits. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
              Stream Instantly.
            </span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="text-base sm:text-xl text-[color:var(--text-muted)] max-w-2xl font-medium leading-relaxed mb-10">
            Forward any movie, video, or audio file from Telegram to <b className="text-[color:var(--text-color)]">StreamDrop</b>.
            Within milliseconds, receive an ultra-fast, securely encrypted streaming dashboard link with zero waiting time.
          </motion.p>

          <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[color:var(--text-color)] text-[color:var(--bg-color)] px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-transform">
              <Play className="fill-current w-5 h-5" /> Start Streaming Free
            </a>
            <a href={MANAGER_LINK} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[color:var(--surface-color)] border border-[color:var(--border-color)] text-[color:var(--text-color)] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[color:var(--border-color)] transition-colors">
              Premium Plans <Shield size={20} className="text-indigo-500" />
            </a>
          </motion.div>

        </motion.div>
      </section>

      {/* ── METRICS / TRUST BAR ── */}
      <section className="px-5 max-w-6xl mx-auto mb-24">
        <div className="bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-500/5 backdrop-blur-sm relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-indigo-500 mb-1">0ms</h3>
              <p className="text-xs sm:text-sm font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Wait Time</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-purple-500 mb-1">∞</h3>
              <p className="text-xs sm:text-sm font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Bandwidth</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-pink-500 mb-1">100%</h3>
              <p className="text-xs sm:text-sm font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Encrypted</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-amber-500 mb-1">Web</h3>
              <p className="text-xs sm:text-sm font-bold text-[color:var(--text-muted)] uppercase tracking-wider">App Required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MEGA FEATURES GRID (50+ Infos) ── */}
      <section id="features" className="py-20 px-5 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">50+ Premium Features.</h2>
          <p className="text-lg text-[color:var(--text-muted)] font-medium">We re-engineered the way Telegram files are processed. Look at everything packed inside StreamDrop.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_GROUPS.map((group, idx) => (
            <div key={idx} className="bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-3xl p-6 lg:p-8 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col group">
              <div className="w-14 h-14 rounded-2xl bg-[color:var(--bg-color)] border border-[color:var(--border-color)] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-indigo-500/10 transition-transform">
                {group.icon}
              </div>
              <h3 className="text-2xl font-black text-[color:var(--text-color)] mb-6">{group.category}</h3>
              <ul className="space-y-3 flex-1">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm sm:text-base font-medium text-[color:var(--text-muted)] leading-snug">
                    <CheckCircle2 size={18} className="text-indigo-500 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 6th Card: Developer Info */}
          <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-[color:var(--bg-color)] border border-indigo-500/30 rounded-3xl p-6 lg:p-8 flex flex-col relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center mb-6 z-10">
              <Code className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-6 z-10">System Status</h3>
            <ul className="space-y-3 flex-1 z-10">
              <li className="flex items-start gap-3 text-sm sm:text-base font-medium text-indigo-200">
                <Boxes size={18} className="shrink-0 mt-0.5" /> <span>Framework: React + Vite + Tailwind V4</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base font-medium text-indigo-200">
                <Server size={18} className="shrink-0 mt-0.5" /> <span>Backend: FastAPI Python + Motor Async</span>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base font-medium text-indigo-200">
                <Shield size={18} className="shrink-0 mt-0.5" /> <span>Database: Dual MongoDB Synchronized</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-indigo-500/20 z-10">
              <p className="text-sm font-bold text-indigo-300">Powered by <span className="text-white">Univora</span></p>
              <p className="text-xs text-indigo-400/70 mt-1">Dev: Rolex Sir</p>
            </div>
            {/* Background Blob */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (Timeline) ── */}
      <section id="how-it-works" className="py-20 px-5 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">How does it work?</h2>
          <p className="text-[color:var(--text-muted)] font-medium">It takes less than 5 seconds from start to finish.</p>
        </div>

        <div className="space-y-6">
          {[
            { step: '01', title: 'Open the Bot', desc: `Click the "Launch Bot" button to open @STREAM_DROP_BOT on Telegram and hit /start.` },
            { step: '02', title: 'Forward the Media', desc: 'Forward any Video, Movie, Document, or Audio from ANY public or private Telegram channel to the bot.' },
            { step: '03', title: 'Get Secure Link', desc: 'The bot instantly replies with a unique, encrypted web URL specifically tied to your Telegram ID.' },
            { step: '04', title: 'Play & Download', desc: 'Click the link to open the aesthetic StreamDrop Player. Watch it natively or click download.' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-[color:var(--surface-color)] border border-[color:var(--border-color)] p-6 rounded-3xl group hover:border-indigo-500/30 transition-all">
              <div className="text-5xl font-black text-[color:var(--border-color)] group-hover:text-indigo-500/20 transition-colors">
                {item.step}
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-[color:var(--text-color)]">{item.title}</h4>
                <p className="text-[color:var(--text-muted)] text-sm sm:text-base font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA & CREDITS ── */}
      <footer className="border-t border-[color:var(--border-color)] bg-[color:var(--surface-color)]/50 mt-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 text-center flex flex-col items-center">
          <img src={logoImg} className="w-12 h-12 rounded-xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all mb-6" alt="Univora" />
          <h2 className="text-2xl sm:text-3xl font-black mb-4">Ready to upgrade your streaming?</h2>
          <p className="text-[color:var(--text-muted)] font-medium mb-8">Join thousands of users utilizing StreamDrop's unlimited cloud capabilities.</p>
          <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="bg-[color:var(--text-color)] text-[color:var(--bg-color)] px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 transition-transform mb-16">
            Start using StreamDrop
          </a>

          <div className="w-full flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[color:var(--border-color)] text-sm font-semibold text-[color:var(--text-muted)] gap-4">
            <p>© 2026 StreamDrop. Powered by <a href="https://univora.site" className="text-indigo-400 hover:text-indigo-300">Univora</a>.</p>
            <p className="flex items-center gap-1">Made with <Heart size={14} className="text-red-500 fill-red-500" /> by Rolex Sir</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
