import React, { useContext, useState } from 'react';
import { ThemeContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sun, Moon, Home, Menu, X, Terminal, 
  Zap, Shield, CreditCard, Code, HelpCircle, BookOpen, MonitorPlay, Smartphone, Cloud, Settings, Sparkles, HardDrive, Activity, Globe, Info,
  Film, Music, Image as ImageIcon, FileText, Package, Clock, Download, Share2, QrCode, Bookmark, Keyboard, PictureInPicture, Theater, Moon as MoonIcon, BarChart3, Star, CheckCircle2, ExternalLink, Heart, User, Crown, Calendar
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

const SECTIONS = [
  { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
  { id: 'features', title: 'Features', icon: Zap },
  { id: 'api-integration', title: 'API / Integration', icon: Terminal },
  { id: 'plans', title: 'Plans & Pricing', icon: CreditCard },
  { id: 'faq', title: 'FAQ', icon: HelpCircle },
  { id: 'about-univora', title: 'About Univora', icon: Info },
];

const FEATURES = [
  { icon: <MonitorPlay size={20} />, title: 'Browser Streaming', desc: 'Play videos/audio directly in any browser — no app needed', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { icon: <Smartphone size={20} />, title: 'Mobile App Intents', desc: 'Open in VLC, MX Player, PlayIt or any Android player', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: <Download size={20} />, title: '1-Click Download', desc: 'Download any file instantly with one tap', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: <QrCode size={20} />, title: 'QR Code Sharing', desc: 'Generate & save QR codes for any file link', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: <PictureInPicture size={20} />, title: 'Picture-in-Picture', desc: 'Float the player while using other apps', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { icon: <Theater size={20} />, title: 'Theatre Mode', desc: 'Distraction-free full-width player mode', color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { icon: <Bookmark size={20} />, title: 'Mark Spots', desc: 'Bookmark timestamps to jump back to key moments', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { icon: <Clock size={20} />, title: 'Sleep Timer', desc: 'Auto-pause after 15, 30, 60 or 90 minutes', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { icon: <Keyboard size={20} />, title: 'Keyboard Shortcuts', desc: 'Space/Arrow keys, F for fullscreen, M for mute', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { icon: <Shield size={20} />, title: 'Secure HMAC Auth', desc: 'Cryptographically signed dashboard access tokens', color: 'text-green-500', bg: 'bg-green-500/10' },
  { icon: <Film size={20} />, title: 'Video Streaming', desc: 'Smooth HLS-like range-request streaming from Telegram', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: <Music size={20} />, title: 'Audio Player', desc: 'Dedicated audio UI with waveform visualization', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { icon: <ImageIcon size={20} />, title: 'Image Viewer', desc: 'Full-screen image preview for photos', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: <FileText size={20} />, title: 'Document Preview', desc: 'View PDFs and docs directly in the browser', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { icon: <Package size={20} />, title: 'APK / File Downloads', desc: 'Any binary/archive shown with direct download UI', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { icon: <BarChart3 size={20} />, title: 'Smart Dashboard', desc: 'Filter, sort, search all your files with advanced controls', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { icon: <Share2 size={20} />, title: 'Link Sharing', desc: 'Native share sheet integration on mobile browsers', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { icon: <MoonIcon size={20} />, title: 'Day / Night Mode', desc: 'System-aware theme with manual toggle', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { icon: <HardDrive size={20} />, title: 'Cloud Library', desc: 'All your files in a filterable sidebar playlist', color: 'text-teal-400', bg: 'bg-teal-400/10' },
  { icon: <Activity size={20} />, title: 'Stream Persistence', desc: 'Last-played link auto-restored on revisit', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: <Globe size={20} />, title: 'Embed Support', desc: 'Embed any stream as an <iframe> on any website', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: <Zap size={20} />, title: 'Instant Links', desc: 'Get your stream URL in seconds — just send a file', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
];

export default function Docs() {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                Getting Started
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Welcome to the StreamDrop documentation. StreamDrop is a high-performance Telegram Bot that bridges the gap between Telegram's robust file storage and web streaming.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                What is StreamDrop?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                By default, Telegram is a great place to store files, but streaming large video or audio files outside the app can be challenging. StreamDrop generates an instant, secure streaming URL for any file uploaded to our bot. This allows you to embed videos, share large assets, or build your own media library without worrying about bandwidth limits.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 rounded-2xl p-6 md:p-8 border border-indigo-100 dark:border-indigo-900/50">
              <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                <Terminal size={24} />
                Quick Start Guide
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-indigo-800 dark:text-indigo-200 mb-6 font-medium">
                <li>Open Telegram and start a chat with <a href="https://t.me/STREAM_DROP_BOT" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">@STREAM_DROP_BOT</a>.</li>
                <li>Send any file (video, audio, or document).</li>
                <li>The bot will instantly reply with a unique streaming link.</li>
                <li>Click the link to view the file in our web player, or use the URL to embed the file elsewhere.</li>
              </ol>
              
              <div className="bg-[#0f111a] rounded-xl p-5 shadow-inner overflow-x-auto border border-gray-800">
                <code className="text-sm text-green-400 font-mono leading-relaxed block">
                  <span className="text-gray-500"># Example Bot Interaction</span><br/>
                  <span className="text-blue-400 font-bold">User:</span> <span className="text-gray-300">[Uploads "movie.mp4"]</span><br/>
                  <span className="text-purple-400 font-bold">Bot:</span> <span className="text-gray-300">File received! Here is your stream link:</span><br/>
                  <span className="text-green-400 border-b border-green-400/30 pb-0.5">https://streamdrop.site/show/abc123xyz</span>
                </code>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                Features
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Everything you need to stream files seamlessly across the web.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.bg} group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(f.icon, { className: f.color })}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'api-integration':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                API & Integration
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Integrate StreamDrop directly into your application using standard web technologies.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 rounded-2xl mb-8">
                <h3 className="text-red-800 dark:text-red-400 font-bold mb-2 flex items-center gap-2"><Shield size={20} /> STRICT WARNING</h3>
                <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                  These API features are <strong>NOT</strong> for everyone and public usage is strictly monitored. StreamDrop is <strong>NOT a free unlimited CDN</strong>. If we detect abuse or unauthorized heavy integration, you will be permanently banned from all Univora platforms. Please contact the Admin before building heavy integrations.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                Iframe Embedding
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                The easiest way to integrate a video stream into your own site is via an iframe. Just append <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm text-pink-500 border border-gray-200 dark:border-gray-700">?embed=true</code> to your StreamDrop URL.
              </p>
              
              <div className="bg-[#1e1e2e] rounded-xl overflow-hidden shadow-lg border border-gray-800 mt-4">
                <div className="flex items-center px-4 py-3 bg-[#181825] border-b border-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="ml-4 text-xs font-mono text-gray-400">index.html</span>
                </div>
                <div className="p-5 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                    <code>
<span className="text-blue-400">&lt;iframe</span><br/>
{'  '}<span className="text-green-300">src</span>=<span className="text-yellow-300">"https://streamdrop.site/show/abc123xyz?embed=true"</span><br/>
{'  '}<span className="text-green-300">width</span>=<span className="text-yellow-300">"100%"</span><br/>
{'  '}<span className="text-green-300">height</span>=<span className="text-yellow-300">"500px"</span><br/>
{'  '}<span className="text-green-300">frameborder</span>=<span className="text-yellow-300">"0"</span><br/>
{'  '}<span className="text-green-300">allowfullscreen</span><br/>
<span className="text-blue-400">&gt;&lt;/iframe&gt;</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                Direct Streaming Links
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you are a Premium user, you can extract the direct raw media URL to use in your custom video players (like Video.js, Plyr, or native HTML5 video tags) without our branded wrapper.
              </p>
            </div>
          </div>
        );

      case 'plans':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                Plans & Pricing
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Simple, transparent limits designed to scale with your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] p-6 shadow-sm relative flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">7-Day Free Trial</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 h-10 text-sm">Experience premium features completely free.</p>
                <ul className="space-y-3 mb-6 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> Unlimited Uploads</li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> Web Dashboard</li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> Fast Streaming</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] p-6 shadow-sm relative flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1 Week</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 h-10 text-sm">Short-term access for quick needs.</p>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹30</span>
                </div>
                <ul className="space-y-3 mb-6 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> 7 Days Validity</li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> Priority Support</li>
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-indigo-500 bg-white dark:bg-[#0f0f13] p-6 shadow-xl shadow-indigo-500/10 relative flex flex-col">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-[22px] uppercase tracking-wider">Popular</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1 Month</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 h-10 text-sm">For active users and creators.</p>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹99</span>
                </div>
                <ul className="space-y-3 mb-6 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> 30 Days Validity</li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> Ad-Free UI</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] p-6 shadow-sm relative flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2 Months</h3>
                <div className="mb-4 flex items-baseline gap-1 mt-6">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹160</span>
                </div>
                <ul className="space-y-3 mb-6 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Zap size={14} className="text-indigo-500"/> 60 Days Validity</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-900 to-purple-900 p-6 shadow-sm relative flex flex-col text-white">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Lifetime <Sparkles size={16} className="text-yellow-400"/></h3>
                <div className="mb-4 flex items-baseline gap-1 mt-6">
                  <span className="text-3xl font-extrabold text-white">₹999</span>
                </div>
                <ul className="space-y-3 mb-6 flex-1 text-sm text-indigo-100">
                  <li className="flex items-center gap-2"><Zap size={14} className="text-yellow-400"/> Never Expires</li>
                  <li className="flex items-center gap-2"><Zap size={14} className="text-yellow-400"/> All Future Updates</li>
                </ul>
              </div>

            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Common questions about using StreamDrop.
              </p>
            </div>

            <div className="space-y-4 mt-8">
              {[
                {
                  q: "Are my files public?",
                  a: "Only people with the exact, unique StreamDrop URL can access your file. However, anyone with the link can view it, so do not share links to sensitive personal data publicly."
                },
                {
                  q: "How long do links last?",
                  a: "StreamDrop links are permanent as long as the original file remains in the Telegram chat where it was uploaded. If you delete the message in Telegram, the stream will break."
                },
                {
                  q: "What file formats are supported?",
                  a: "We support most major video and audio formats natively in the web player (MP4, WebM, MP3, OGG). MKV and AVI files can be downloaded directly, but web playback depends on the user's browser support."
                },
                {
                  q: "Can I use this for piracy?",
                  a: "No. StreamDrop strictly complies with DMCA regulations. Links reported for copyright infringement will be permanently disabled and repeat offenders banned from our platform."
                }
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'about-univora':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <Info className="text-indigo-500" size={32} /> About Univora
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover the ecosystem behind StreamDrop.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is Univora?</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 relative z-10">
                Univora is an expansive digital ecosystem consisting of innovative apps, versatile bots, dynamic websites, and powerful platforms designed to enhance your online world. StreamDrop is just one of the many robust tools created under the Univora umbrella.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8 relative z-10">
                <a href="https://univora.site" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md shadow-indigo-500/20">
                  <Globe size={18} /> Visit Univora.site
                </a>
                <a href="https://t.me/Univora88" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#2AABEE] hover:bg-[#2298D6] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md shadow-[#2AABEE]/20">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.35-.01-1.03-.2-1.53-.37-.61-.2-1.1-.3-1.05-.63.02-.17.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                  Join Telegram Channel
                </a>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-hidden transition-colors duration-300">
      
      {/* NAVBAR */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" 
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            <img src={logoImg} alt="StreamDrop" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
            StreamDrop <span className="text-gray-400 dark:text-gray-500 font-normal">Docs</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            to="/" 
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1"></div>
          
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#09090b] overflow-y-auto z-10 shrink-0">
          <nav className="p-4 space-y-1.5">
            <div className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-4">
              Documentation
            </div>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === section.id 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <section.icon size={18} className={activeSection === section.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              />
              <motion.aside 
                initial={{ x: '-100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#09090b] border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-2xl"
              >
                <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Menu</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="p-4 space-y-1.5 overflow-y-auto">
                  <div className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-2">
                    Documentation
                  </div>
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => { setActiveSection(section.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                        activeSection === section.id 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <section.icon size={18} className={activeSection === section.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-gray-50/50 dark:bg-[#09090b] relative w-full h-full">
          <div className="max-w-4xl mx-auto px-6 py-10 lg:px-12 lg:py-16 min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  );
}
