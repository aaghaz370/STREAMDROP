import { motion } from 'framer-motion';
import { Share2, Zap, Lock, Globe, Server, Smartphone, MonitorPlay, PictureInPicture, Cloud, ChevronRight, CheckCircle2, Shield, Heart } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Landing() {
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.4 } }
  };

  const features = [
    { icon: <MonitorPlay />, title: "Instant In-Browser Streaming", desc: "Watch videos or listen to audio right inside the browser instantly." },
    { icon: <Zap />, title: "Lightning Fast Delivery", desc: "No bandwidth throttling. Enjoy highest quality multi-threaded speeds." },
    { icon: <Lock />, title: "Secure HMAC Auth", desc: "Protected, decentralized one-time links encrypted with your unique user ID." },
    { icon: <Globe />, title: "Global CDN Access", desc: "Watch from anywhere without any App. Stream straight to web." },
    { icon: <Smartphone />, title: "Native App Intents", desc: "1-Click opening in MX Player, VLC, and other Android players." },
    { icon: <PictureInPicture />, title: "Picture-in-Picture Mode", desc: "Float your video players across any tab or application." }
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[color:var(--bg-color)] text-[color:var(--text-color)] overflow-y-auto selection:bg-indigo-500/30">

      {/* ── HEADER ── */}
      <header className="w-full fixed top-0 z-50 bg-[color:var(--surface-color)]/80 backdrop-blur-md border-b border-[color:var(--border-color)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="StreamDrop" className="w-8 h-8 rounded-lg" />
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">StreamDrop</span>
          </div>
          <a href="https://t.me/STREAM_DROP_BOT" target="_blank" rel="noopener noreferrer"
            className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg shadow-indigo-500/30">
            Open Bot
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
        <motion.div variants={containerVars} initial="hidden" animate="show" className="flex-1 space-y-6">
          <motion.div variants={itemVars} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
            <SparklesIcon className="w-3.5 h-3.5" /> Premium Telegram Cloud Streaming
          </motion.div>
          <motion.h1 variants={itemVars} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Stream Any File, <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Zero Waiting Time.</span>
          </motion.h1>
          <motion.p variants={itemVars} className="text-lg lg:text-xl text-[color:var(--text-muted)] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Welcome to StreamDrop, the premier platform built by Univora. Send any video, audio, or document to our Telegram bot and instantly get a direct stream link.
          </motion.p>
          <motion.div variants={itemVars} className="flex items-center justify-center lg:justify-start gap-4 pt-4">
            <a href="https://t.me/SimpleStreamBot" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-[color:var(--text-color)] text-[color:var(--bg-color)] rounded-2xl font-bold text-lg hover:scale-105 transition-transform">
              Send a File <Share2 size={20} />
            </a>
            <a href="#how-to-use" className="flex items-center gap-2 px-8 py-4 bg-[color:var(--surface-color)] text-[color:var(--text-color)] border border-[color:var(--border-color)] rounded-2xl font-bold text-lg hover:bg-[color:var(--border-color)] transition-colors">
              Read Docs <ChevronRight size={20} />
            </a>
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="flex-1 relative w-full max-w-lg aspect-square">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[3rem] opacity-20 blur-3xl" />
          <div className="relative w-full h-full bg-[color:var(--surface-color)] border border-[color:var(--border-color)] rounded-[3rem] p-6 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-[color:var(--border-color)] pb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="mx-auto text-xs font-mono text-[color:var(--text-muted)]">streamdrop.site</div>
            </div>
            <div className="flex-1 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--border-color) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              <div className="z-10 w-24 h-24 rounded-full bg-indigo-500 shadow-xl shadow-indigo-500/40 flex items-center justify-center">
                <MonitorPlay className="text-white w-10 h-10 ml-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── TRUST/STATS BAR ── */}
      <section className="border-y border-[color:var(--border-color)] bg-[color:var(--surface-color)] text-[color:var(--text-muted)] py-6 text-sm font-semibold">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-8 items-center justify-between opacity-80">
          <div className="flex justify-center items-center gap-2"><Server /> 99.9% Cloud Uptime</div>
          <div className="flex justify-center items-center gap-2"><Shield /> End-to-End Secure Links</div>
          <div className="flex justify-center items-center gap-2"><Cloud /> Unlimited Bandwidth Storage</div>
          <div className="flex justify-center items-center gap-2 flex-wrap">Powered by <b>Univora</b></div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Over 40+ Premium Features</h2>
          <p className="text-[color:var(--text-muted)] text-lg">StreamDrop isn't just a basic forwarder. It's a complete operating system for streaming media directly from the cloud.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-[color:var(--surface-color)] border border-[color:var(--border-color)] p-6 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-[color:var(--text-muted)] leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW TO USE ── */}
      <section id="how-to-use" className="py-24 border-t border-[color:var(--border-color)] bg-[color:var(--surface-color)]/30">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-center mb-12">How to Use StreamDrop</h2>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 md:before:ml-[50%] before:-translate-x-px md:before:mx-auto before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-500/20 before:to-transparent">
            {[
              { title: "Start the Bot", text: "Open Telegram and send /start to @SimpleStreamBot to register your unique ID." },
              { title: "Send a File", text: "Forward any video, movie, or song from any channel/group directly into the bot chat." },
              { title: "Get Your Custom Link", text: "Within milliseconds, the bot will generate a highly secure, obfuscated streaming and download dashboard link." },
              { title: "Enjoy Streaming", text: "Paste the link in Safari, Chrome, Edge or just tap it to open the StreamDrop theater mode!" }
            ].map((step, i) => (
              <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                {/* Timeline Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[color:var(--surface-color)] bg-indigo-500 text-white font-bold absolute left-0 md:left-1/2 md:-translate-x-1/2 shadow">
                  {i + 1}
                </div>
                {/* Card */}
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[color:var(--surface-color)] border border-[color:var(--border-color)] p-5 rounded-2xl shadow-sm group-hover:border-indigo-400 transition-colors`}>
                  <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                  <p className="text-sm text-[color:var(--text-muted)]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 border-t border-[color:var(--border-color)] bg-[color:var(--surface-color)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="logo" className="w-6 h-6 rounded-md grayscale" />
            <span className="font-bold text-[color:var(--text-muted)]">StreamDrop System</span>
          </div>
          <div className="text-sm text-[color:var(--text-muted)] flex items-center justify-center flex-wrap gap-2 text-center md:text-left">
            <span>Powered by <a href="https://univora.site" className="text-[color:var(--text-color)] font-bold hover:underline">Univora</a></span>
            <span className="hidden md:inline">•</span>
            <span>Developed with <Heart size={14} className="inline text-red-500 mx-1" /> by Rolex Sir</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
