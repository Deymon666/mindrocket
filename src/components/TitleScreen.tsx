import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  key?: string;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
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
        <Rocket size={100} className="text-white drop-shadow-[0_0_30px_rgba(255,71,126,0.8)] mb-6" />
        <h1 className="text-6xl sm:text-7xl font-black text-white mb-4 tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-center leading-none">
          Mind<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FEE440] to-[#F58700] filter drop-shadow-md">Rocket</span>
        </h1>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 shadow-lg mb-12">
          <p className="text-white/90 text-lg font-sans font-bold tracking-wide">¡Aprende diseño jugando!</p>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05, translateY: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="relative px-12 py-5 bg-gradient-to-b from-[#FF477E] to-[#FF0055] text-white rounded-[2.5rem] font-black text-3xl shadow-[0_8px_0_#C1121F,0_15px_30px_rgba(0,0,0,0.4)] transition-all flex items-center gap-3 border-4 border-white/20 active:shadow-[0_0px_0_#C1121F,0_5px_10px_rgba(0,0,0,0.4)] active:translate-y-[8px]"
      >
        <span className="drop-shadow-md">DESPEGAR</span>
        <Rocket size={28} className="fill-white drop-shadow-md" />
      </motion.button>
    </motion.div>
  );
}
