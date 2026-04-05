import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, PlaySquare, Moon, Sun, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from './assets/logo.jpg';

import Dashboard from './pages/Dashboard';
import Show from './pages/Show';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';

// Smart redirect: /show → last stream or 404
function ShowRedirect() {
  const last = localStorage.getItem('streamdrop_last_stream');
  if (last) return <Navigate to={`/show/${last}`} replace />;
  return <NotFound />;
}

function Layout({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('streamdrop_theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('streamdrop_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const [dashUrl, setDashUrl] = useState(
    () => localStorage.getItem('streamdrop_dash_url') || '/dashboard/unauthorized'
  );

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem('streamdrop_dash_url');
      if (stored) setDashUrl(stored);
    };
    window.addEventListener('storage', sync);
    const t = setInterval(sync, 2000);
    return () => { window.removeEventListener('storage', sync); clearInterval(t); };
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: dashUrl, icon: <Home size={22} />, match: '/dashboard' },
    { name: 'My Stream', path: '/show', icon: <PlaySquare size={22} />, match: '/show' },
    { name: 'Profile', path: '/profile', icon: <User size={22} />, match: '/profile' },
  ];

  return (
    <div className="min-h-screen flex w-full flex-col md:flex-row font-sans selection:bg-indigo-500/30">

      {/* LAPTOP SIDEBAR */}
      {!isLanding && (
        <aside className="hidden md:flex flex-col w-64 border-r border-[color:var(--border-color)] bg-[color:var(--surface-color)] fixed h-full z-50">
          <div className="p-6 flex items-center gap-3">
            <img src={logoImg} alt="StreamDrop" className="w-8 h-8 rounded-xl object-cover shadow-lg" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">StreamDrop</h1>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.match);
              return (
                <Link key={link.name} to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-indigo-500/10 text-[color:var(--primary-color)] font-semibold border border-indigo-500/20'
                      : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-color)] hover:text-[color:var(--text-color)]'
                    }`}>
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-[color:var(--border-color)]">
            <button onClick={() => setIsDark(!isDark)}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-[color:var(--bg-color)] transition-colors text-[color:var(--text-muted)]">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* MOBILE HEADER */}
      {!isLanding && (
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[color:var(--border-color)] bg-[color:var(--surface-color)] sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="StreamDrop" className="w-7 h-7 rounded-lg object-cover shadow-md" />
            <h1 className="text-lg font-bold">StreamDrop</h1>
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-[color:var(--bg-color)] text-[color:var(--text-color)]">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
      )}

      {/* MAIN */}
      <main className={`flex-1 ${!isLanding ? 'md:ml-64 pb-24 md:pb-0' : 'pb-0'} w-full h-[100dvh] md:h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAV */}
      {!isLanding && (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
          <div className="bg-[color:var(--surface-color)]/80 backdrop-blur-xl border-t border-[color:var(--border-color)] px-6 py-3 pb-6 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.match);
              return (
                <Link key={link.name} to={link.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-full transition-all duration-300 ${isActive ? 'text-[color:var(--primary-color)] scale-110' : 'text-[color:var(--text-muted)]'
                    }`}>
                  <div className={`p-1.5 rounded-full ${isActive ? 'bg-indigo-500/10' : 'bg-transparent'}`}>
                    {link.icon}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/show/:uniqueId" element={<Show />} />
          <Route path="/show" element={<ShowRedirect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
