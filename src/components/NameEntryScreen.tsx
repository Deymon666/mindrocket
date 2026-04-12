import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Dna } from 'lucide-react';

const MONSTERS = ['👾', '👽', '🤖', '👻', '🐙', '🦖', '🦉', '🐸', '🦄', '🐲'];

interface NameEntryScreenProps {
  onComplete: (name: string, avatar: string) => void;
  onBack: () => void;
  key?: string;
}

export default function NameEntryScreen({ onComplete, onBack }: NameEntryScreenProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    setAvatar(MONSTERS[Math.floor(Math.random() * MONSTERS.length)]);
  }, []);

  const handleShuffle = () => {
    let newAvatar;
    do {
      newAvatar = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    } while (newAvatar === avatar);
    setAvatar(newAvatar);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col items-center justify-start w-full h-full relative p-6 z-20 pt-12"
    >
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-white/80 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex flex-col items-center mt-10 w-full max-w-sm">
        <h2 className="text-3xl font-black text-white mb-8 text-center drop-shadow-md">
          Crea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#00B4D8]">Identidad</span>
        </h2>

        <div className="relative mb-8">
          <motion.div 
            key={avatar}
            initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full border-4 border-white/30 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(0,245,212,0.3)]"
          >
            {avatar}
          </motion.div>
          <button 
            onClick={handleShuffle}
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#FEE440] to-[#F58700] p-3 rounded-full text-white shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-transform"
          >
            <Dna size={20} />
          </button>
        </div>

        <p className="text-white/80 font-medium mb-2 text-sm uppercase tracking-widest">Tu Monstruo Asignado</p>

        <div className="w-full mt-6 relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingresa tu nombre..."
            maxLength={12}
            className="w-full bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl px-6 py-4 text-white text-xl font-bold text-center placeholder:text-white/40 focus:outline-none focus:border-[#00F5D4] focus:bg-white/20 transition-all shadow-inner"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(name, avatar)}
          disabled={!name.trim()}
          className={`mt-10 w-full py-4 rounded-2xl font-black text-xl shadow-[0_8px_0_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 border-2 border-white/20
            ${name.trim() 
              ? 'bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] text-white active:translate-y-[8px] active:shadow-none' 
              : 'bg-gray-500/50 text-white/50 cursor-not-allowed'}`}
        >
          <Sparkles size={24} />
          Continuar
        </motion.button>
      </div>
    </motion.div>
  );
}
