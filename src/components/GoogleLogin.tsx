import { motion } from 'motion/react';
import mascotImg from '../assets/images/mindrocket_mascot.png';

interface GoogleLoginProps {
  onLogin: () => void;
  isLoading: boolean;
  showInstallBtn?: boolean;
  onInstall?: () => void;
}

export default function GoogleLogin({ onLogin, isLoading, showInstallBtn, onInstall }: GoogleLoginProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-6 relative z-10"
    >
      {/* Mascot */}
      <motion.img
        src={mascotImg}
        alt="MindRocket"
        className="w-44 h-44 object-contain mb-4 drop-shadow-[0_0_30px_rgba(0,245,212,0.4)]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <p className="text-white/60 text-center mb-10 text-sm font-medium">
        Aprende diseño jugando 🚀
      </p>

      {/* Botón Google estilo juego */}
      <motion.button
        whileHover={{ scale: 1.03, translateY: -3 }}
        whileTap={{ scale: 0.97, translateY: 2 }}
        onClick={onLogin}
        disabled={isLoading}
        className="w-full relative flex items-center justify-center gap-3 font-black text-lg py-4 px-6 rounded-2xl disabled:opacity-60 mb-4"
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #e8e8e8)',
          color: '#1a1a2e',
          boxShadow: '0 6px 0 #a0a0a0, 0 8px 20px rgba(0,0,0,0.4)',
          border: '2px solid rgba(255,255,255,0.8)',
        }}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.4 5.6l6.2 5.2C36.9 37.3 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
        )}
        {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </motion.button>

      {/* Botón Instalar estilo juego */}
      {showInstallBtn && onInstall && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03, translateY: -3 }}
          whileTap={{ scale: 0.97, translateY: 2 }}
          onClick={onInstall}
          className="w-full relative flex items-center justify-center gap-2 font-black text-lg py-4 px-6 rounded-2xl text-white"
          style={{
            background: 'linear-gradient(to bottom, #7C3AED, #5B21B6)',
            boxShadow: '0 6px 0 #3B0764, 0 8px 20px rgba(124,58,237,0.4)',
            border: '2px solid rgba(167,139,250,0.4)',
          }}
        >
          📲 Instalar App
        </motion.button>
      )}

      <p className="text-white/30 text-xs mt-8 text-center">
        Tu progreso se guarda automáticamente en tu cuenta
      </p>
    </motion.div>
  );
}
