import { motion } from 'motion/react';
import { Rocket, Sparkles, Star } from 'lucide-react';

interface WorldTransitionProps {
  fromWorld: number;
  toWorld: number;
  key?: string;
}

export default function WorldTransition({ fromWorld, toWorld }: WorldTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0914] text-white overflow-hidden"
    >
      {/* Deep space background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A1A24] via-[#0B0914] to-[#0B0914]"></div>

      {/* Speed lines effect (Hyperspace) */}
      <div className="absolute inset-0 opacity-40">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute w-1.5 bg-gradient-to-b from-transparent via-[#00F5D4] to-transparent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${Math.random() * 60 + 20}%`,
              top: '-50%',
            }}
            animate={{
              y: ['0vh', '200vh'],
            }}
            transition={{
              duration: Math.random() * 0.4 + 0.1,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Stars background */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
          }}
          animate={{
            y: [0, Math.random() * 150 + 50],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: Math.random() * 1.5 + 0.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      <motion.div
        initial={{ y: 400, scale: 0.5 }}
        animate={{ y: -400, scale: 2 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative">
          <Rocket size={160} className="text-white drop-shadow-[0_0_50px_rgba(255,71,126,0.8)]" fill="currentColor" />
          
          {/* Main engine flame */}
          <motion.div
            animate={{ height: [50, 120, 50], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-14 bg-gradient-to-t from-transparent via-[#FEE440] to-[#FF477E] rounded-full blur-md"
          />
          
          {/* Side thrusters */}
          <motion.div
            animate={{ height: [25, 50, 25], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 0.15, repeat: Infinity, delay: 0.1 }}
            className="absolute -bottom-10 left-1/4 -translate-x-1/2 w-5 bg-gradient-to-t from-transparent via-[#00F5D4] to-[#00B4D8] rounded-full blur-sm"
          />
          <motion.div
            animate={{ height: [25, 50, 25], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 0.15, repeat: Infinity, delay: 0.2 }}
            className="absolute -bottom-10 right-1/4 translate-x-1/2 w-5 bg-gradient-to-t from-transparent via-[#00F5D4] to-[#00B4D8] rounded-full blur-sm"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="absolute bottom-1/4 text-center z-20 bg-white/10 backdrop-blur-xl p-6 w-[90%] rounded-[2.5rem] border-4 border-white/20 shadow-[0_0_60px_rgba(0,245,212,0.3)]"
      >
        <h2 className="text-3xl sm:text-4xl font-black mb-3 flex flex-col items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-b from-[#FEE440] to-[#F58700] drop-shadow-md">
          <div className="flex gap-2">
            <Star className="text-[#FEE440] drop-shadow-md" fill="currentColor" size={32} />
            <Star className="text-[#FEE440] drop-shadow-md" fill="currentColor" size={32} />
          </div>
          ¡Mundo {fromWorld} Completado!
        </h2>
        <div className="flex items-center justify-center gap-2 text-lg sm:text-xl text-[#00F5D4] font-bold tracking-wide drop-shadow-sm">
          <Sparkles size={24} />
          <span>Viajando al Mundo {toWorld}...</span>
          <Sparkles size={24} />
        </div>
      </motion.div>
    </motion.div>
  );
}
