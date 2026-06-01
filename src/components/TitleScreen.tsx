import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Download, X, Smartphone, Globe, Info, Apple, CheckCircle2 } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  key?: string;
  showInstallBtn?: boolean;
  onInstall?: () => void;
}

export default function TitleScreen({ onStart, showInstallBtn, onInstall }: TitleScreenProps) {
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
        className="flex flex-col items-center animate-fade-in"
      >
        <img 
          src="/mindrocket_mascot.png" 
          alt="MindRocket Mascot" 
          className="w-40 h-40 object-contain mb-6 drop-shadow-[0_0_30px_rgba(0,229,255,0.6)]"
          referrerPolicy="no-referrer"
        />
       
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 shadow-lg mb-12">
          <p className="text-white/90 text-sm sm:text-base font-sans font-bold tracking-wide">¡Aprende diseño jugando!</p>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
        <motion.button
          whileHover={{ scale: 1.05, translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full relative py-4 bg-gradient-to-b from-[#FF477E] to-[#FF0055] text-white rounded-[2.5rem] font-black text-2xl shadow-[0_6px_0_#C1121F,0_12px_24px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center gap-3 border-4 border-white/20 active:shadow-[0_0px_0_#C1121F,0_3px_6px_rgba(0,0,0,0.4)] active:translate-y-[6px]"
        >
          <span className="drop-shadow-md">DESPEGAR</span>
          <Rocket size={24} className="fill-white drop-shadow-md" />
        </motion.button>

        {showInstallBtn && onInstall ? (
          <button
            onClick={onInstall}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] hover:from-[#00F5D4]/90 hover:to-[#00B4D8]/90 text-black text-xs font-black rounded-full shadow-[0_4px_12px_rgba(0,245,212,0.3)] transition-all cursor-pointer animate-pulse active:scale-95 border border-white/10"
          >
            <Download size={14} className="text-black" />
            <span>Instalar Aplicación</span>
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}


