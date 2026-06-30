import React, { useContext, useState } from 'react';
import { ThemeContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sun, Moon, Home, Menu, X, Terminal, 
  Zap, Shield, CreditCard, Code, HelpCircle, BookOpen 
} from 'lucide-react';

const SECTIONS = [
  { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
  { id: 'features', title: 'Features', icon: Zap },
  { id: 'api-integration', title: 'API / Integration', icon: Terminal },
  { id: 'plans', title: 'Plans & Pricing', icon: CreditCard },
  { id: 'faq', title: 'FAQ', icon: HelpCircle },
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
                <li>Open Telegram and start a chat with <strong className="text-indigo-950 dark:text-indigo-100">@StreamDropBot</strong>.</li>
                <li>Send any file (video, audio, or document).</li>
                <li>The bot will instantly reply with a unique streaming link.</li>
                <li>Click the link to view the file in our web player, or use the URL to embed the file elsewhere.</li>
              </ol>
              
              <div className="bg-[#0f111a] rounded-xl p-5 shadow-inner overflow-x-auto border border-gray-800">
                <code className="text-sm text-green-400 font-mono leading-relaxed block">
                  <span className="text-gray-500"># Example Bot Interaction</span><br/>
                  <span className="text-blue-400 font-bold">User:</span> <span className="text-gray-300">[Uploads "movie.mp4"]</span><br/>
                  <span className="text-purple-400 font-bold">Bot:</span> <span className="text-gray-300">File received! Here is your stream link:</span><br/>
                  <span className="text-green-400 border-b border-green-400/30 pb-0.5">https://streamdrop.app/show/abc123xyz</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                  <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Instant Playback</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  No need to wait for the entire file to download. Our service supports byte-range requests, meaning videos buffer and play instantly just like YouTube.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                  <Shield className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Privacy First</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Files are streamed directly from Telegram's secure infrastructure. We don't keep copies of your personal data on our servers.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-5">
                  <Code className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Embed Anywhere</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Take your streaming link and embed it in an iframe on your own website, blog, or app with zero configuration required.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-5">
                  <BookOpen className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">High Availability</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Built on edge-optimized networks to guarantee reliable uptime. Your streams stay alive as long as the file exists on Telegram.
                </p>
              </div>
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
{'  '}<span className="text-green-300">src</span>=<span className="text-yellow-300">"https://streamdrop.app/show/abc123xyz?embed=true"</span><br/>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Free Tier */}
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f13] p-8 shadow-sm relative flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hobby</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 h-10">Perfect for personal use and small files.</p>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">Free</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Zap size={14} /></div>
                    Up to 2GB per file
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Zap size={14} /></div>
                    Standard streaming speed
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Zap size={14} /></div>
                    Watermarked player
                  </li>
                </ul>
                <button className="w-full py-3.5 px-4 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors">
                  Current Plan
                </button>
              </div>

              {/* Premium Tier */}
              <div className="rounded-3xl border-2 border-indigo-500 bg-white dark:bg-[#0f0f13] p-8 shadow-xl shadow-indigo-500/10 relative flex flex-col">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                  Popular
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 h-10">For power users, creators, and developers.</p>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$5</span>
                  <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Zap size={14} /></div>
                    Up to 4GB per file
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Zap size={14} /></div>
                    High-speed priority streaming
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Zap size={14} /></div>
                    Whitelabel player (No ads)
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Zap size={14} /></div>
                    Direct raw file extraction
                  </li>
                </ul>
                <button className="w-full py-3.5 px-4 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md shadow-indigo-500/20">
                  Upgrade to Pro
                </button>
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <Zap size={18} fill="currentColor" />
            </div>
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
