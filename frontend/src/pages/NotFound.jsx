import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-9xl font-black text-indigo-500/20 mb-4 tracking-tighter">
        404
      </motion.div>
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-[color:var(--text-muted)] max-w-md mx-auto mb-8">
        The stream or dashboard you are looking for doesn't exist or you don't have access.
      </p>
      <Link to="/" className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30">
        Go Home
      </Link>
    </div>
  );
}
