import { motion } from 'motion/react';
import { Rocket, Download } from 'lucide-react';

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
        className="flex flex-col items-center"
      >
        <img 
          src="/icon-512.png" 
          alt="MindRocket Mascot" 
          className="w-32 h-32 rounded-3xl object-cover shadow-[0_0_40px_rgba(0,229,255,0.6)] border-4 border-white/20 mb-6"
          referrerPolicy="no-referrer"
        />
        <h1 className="text-6xl sm:text-7xl font-black text-white mb-4 tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-center leading-none">
          Mind<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FEE440] to-[#F58700] filter drop-shadow-md">Rocket</span>
        </h1>
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

        {showInstallBtn && onInstall && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onInstall}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full text-white text-sm font-black shadow-lg transition-colors backdrop-blur-md cursor-pointer"
          >
            <Download size={16} className="text-[#00E5FF] animate-bounce" />
            <span>Instalar Aplicación</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

