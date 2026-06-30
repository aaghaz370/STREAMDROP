import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Download, Shield, Zap, Smartphone, MonitorPlay,
  Settings, Cloud, Sparkles, ChevronRight, Menu, X, Sun, Moon,
  Cpu, Lock, CheckCircle2, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { ThemeContext } from '../App';

export default function Landing() {
  const BOT_LINK = "https://t.me/STREAM_DROP_BOT";
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const FADE_UP = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const STAGGER = {
    show: { transition: { staggerChildren: 0.1 } }
  };

  const FEATURES = [
    {
      icon: <Play className="text-indigo-500" size={28} />,
      title: "Instant Web Playback",
      desc: "Stream your Telegram files instantly in any browser without downloading. Supports HD video and background audio.",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      icon: <Zap className="text-amber-500" size={28} />,
      title: "Zero Bandwidth Throttling",
      desc: "Bypass Telegram rate limits with multi-threaded edge CDN delivery. Buffering is a thing of the past.",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      icon: <Shield className="text-emerald-500" size={28} />,
      title: "Bank-Grade Security",
      desc: "HMAC SHA-256 token authentication and AES-256 link encryption ensure your files remain strictly yours.",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      icon: <Settings className="text-pink-500" size={28} />,
      title: "Advanced Dashboard",
      desc: "Manage, track, and search your uploaded files in a beautiful personalized web dashboard.",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20"
    },
    {
      icon: <Smartphone className="text-violet-500" size={28} />,
      title: "Mobile App Intents",
      desc: "Don't like web players? Open your streams natively in VLC, MX Player, or PlayIt with a single tap.",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20"
    },
    {
      icon: <Cloud className="text-sky-500" size={28} />,
      title: "Cloud File Conversion",
      desc: "Send documents or APKs to the bot and instantly receive a direct, resumable download link.",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20"
    }
  ];

  return (
    <div className={`min-h-screen w-full ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans overflow-x-hidden selection:bg-indigo-500/30 transition-colors duration-300`}>
      
      {/* ── BACKGROUND PATTERNS ── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50'}`}></div>
      </div>

      {/* ── TOP NAVBAR ── */}
      <nav className={`fixed top-0 w-full z-50 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-xl border-b transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="StreamDrop" className="w-10 h-10 rounded-xl shadow-lg object-cover" />
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              StreamDrop
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Features</a>
            <Link to="/docs" className={`text-sm font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Docs</Link>
            <a href="#pricing" className={`text-sm font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Pricing</a>
            
            <div className={`w-px h-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            
            <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:-translate-y-0.5">
              Launch Bot
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-700'}`}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-x-0 top-20 z-40 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b shadow-2xl md:hidden`}
          >
            <div className="flex flex-col p-6 gap-6">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Features</a>
              <Link to="/docs" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Documentation</Link>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Pricing</a>
              <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white text-center text-lg font-bold px-6 py-3 rounded-xl shadow-lg mt-2">
                Open in Telegram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10">
        
        {/* ── HERO SECTION ── */}
        <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-5 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="show" variants={STAGGER} className="flex flex-col items-center max-w-4xl">
            
            <motion.div variants={FADE_UP} className={`mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-indigo-50 border-indigo-100'} border`}>
              <Sparkles className="text-indigo-500" size={16} />
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-indigo-700'}`}>The Ultimate Telegram Streaming Bot</span>
            </motion.div>

            <motion.h1 variants={FADE_UP} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8">
              Turn any file into a <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                streamable link.
              </span>
            </motion.h1>

            <motion.p variants={FADE_UP} className={`text-lg md:text-xl lg:text-2xl font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-12 max-w-3xl leading-relaxed`}>
              StreamDrop bypasses Telegram's limits. Forward any video, audio, or document to the bot and instantly stream it in our beautiful web dashboard. No downloading required.
            </motion.p>

            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105">
                Start Streaming Now
                <ChevronRight size={20} />
              </a>
              <Link to="/docs" className={`w-full sm:w-auto flex items-center justify-center gap-2 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'} border px-8 py-4 rounded-2xl font-bold text-lg shadow-sm transition-all hover:scale-105`}>
                <FileText size={20} />
                Read the Docs
              </Link>
            </motion.div>

          </motion.div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section id="features" className={`py-24 ${isDark ? 'bg-slate-900/50' : 'bg-slate-100/50'} border-y ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Built for speed and scale.</h2>
              <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto`}>
                We engineered StreamDrop from the ground up to provide a flawless, lag-free streaming experience directly from Telegram's secure cloud.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feat, idx) => (
                <div key={idx} className={`p-8 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'} transition-colors duration-300 shadow-sm hover:shadow-xl group`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feat.bg} ${feat.border} border mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-medium`}>
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="py-32 px-5 lg:px-8 max-w-5xl mx-auto text-center">
          <div className={`relative p-12 lg:p-20 rounded-[40px] overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-indigo-900 border-indigo-800'} border shadow-2xl`}>
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/20 blur-[100px] pointer-events-none rounded-full"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to upgrade your workflow?</h2>
              <p className="text-lg md:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
                Join thousands of users who are already streaming, sharing, and managing their files with StreamDrop. It's free to try.
              </p>
              <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                Launch StreamDrop <ChevronRight size={20} />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className={`py-12 border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg">StreamDrop</span>
          </div>
          <div className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            © 2026 <a href="https://univora.site" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">Univora</a>. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
