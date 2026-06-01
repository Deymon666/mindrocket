import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Download, Share, X } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  key?: string;
  showInstallBtn?: boolean;
  onInstall?: () => void;
}

export default function TitleScreen({ onStart, showInstallBtn, onInstall }: TitleScreenProps) {
  const [showGuide, setShowGuide] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  const handleInstallClick = () => {
    if (showInstallBtn && onInstall) {
      onInstall();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-center w-full h-full relative p-6 z-20"
    >
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <img 
          src="/mindrocket_mascot.png" 
          alt="MindRocket Mascot" 
          className="w-40 h-40 object-contain mb-6 drop-shadow-[0_0_30px_rgba(0,229,255,0.6)]"
          referrerPolicy="no-referrer"
        />
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 shadow-lg mb-12">
          <p className="text-white/90 text-lg font-sans font-bold tracking-wide">¡Aprende diseño jugando!</p>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05, translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative px-12 py-5 bg-gradient-to-b from-[#FF477E] to-[#FF0055] text-white rounded-[2.5rem] font-black text-3xl shadow-[0_8px_0_#C1121F,0_15px_30px_rgba(0,0,0,0.4)] transition-all flex items-center gap-3 border-4 border-white/20 active:shadow-[0_0px_0_#C1121F,0_5px_10px_rgba(0,0,0,0.4)] active:translate-y-[8px]"
        >
          <span className="drop-shadow-md">DESPEGAR</span>
          <Rocket size={28} className="fill-white drop-shadow-md" />
        </motion.button>

        {/* Botón instalar — siempre visible si no está instalada */}
        {!isStandalone && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full text-white text-sm font-black shadow-lg transition-colors backdrop-blur-md cursor-pointer"
          >
            <Download size={16} className="text-[#00E5FF] animate-bounce" />
            <span>Instalar Aplicación</span>
          </motion.button>
        )}
      </div>

      {/* Guía de instalación para iOS */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-0 left-0 right-0 bg-[#1a1035]/95 backdrop-blur-xl border-t border-white/20 rounded-t-3xl p-6 z-50"
          >
            <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X size={20} />
            </button>
            <p className="text-white font-black text-lg mb-4 text-center">📲 Instalar MindRocket</p>
            {isIOS ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <p className="text-white font-bold text-sm">Toca el botón Compartir</p>
                    <p className="text-white/60 text-xs">El ícono <Share size={12} className="inline"/> en la barra de Safari</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <p className="text-white font-bold text-sm">Selecciona "Añadir a pantalla de inicio"</p>
                    <p className="text-white/60 text-xs">Desplázate hacia abajo en el menú</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <p className="text-white font-bold text-sm">Toca "Añadir"</p>
                    <p className="text-white/60 text-xs">¡Listo! Ya tienes MindRocket en tu inicio</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                  <span className="text-2xl">1️⃣</span>
                  <p className="text-white font-bold text-sm">Toca los 3 puntos <strong>⋮</strong> en Chrome</p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                  <span className="text-2xl">2️⃣</span>
                  <p className="text-white font-bold text-sm">Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio"</p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                  <span className="text-2xl">3️⃣</span>
                  <p className="text-white font-bold text-sm">Toca "Instalar" ¡y listo!</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
