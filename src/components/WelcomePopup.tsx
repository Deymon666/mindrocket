import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift, Star } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  playerName: string;
  onClose: () => void;
}

export default function WelcomePopup({ isOpen, playerName, onClose }: WelcomePopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          {/* Backdrop is not needed or can be fully transparent since we don't want to interrupt flow, just pointer-events-none */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            className="pointer-events-auto bg-gradient-to-b from-[#2B215E] to-[#1E1643] border-[6px] border-[#443878] rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center text-center max-w-[320px] w-full relative overflow-hidden"
          >
            {/* Flashes / Particles Container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 0], opacity: [0, 0.8, 0], rotate: 180 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FF477E]/30 blur-2xl rounded-full"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2.5, 0], opacity: [0, 0.6, 0], rotate: -90 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[#00F5D4]/30 blur-2xl rounded-full"
              />
              
              {/* Little sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 1.5 + Math.random(), 
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute top-1/2 left-1/2"
                >
                  <Sparkles size={16} className={i % 2 === 0 ? "text-[#FF477E]" : "text-[#00F5D4]"} />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2
              }}
              className="bg-gradient-to-br from-[#FF477E] to-[#9D4EDD] p-4 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,71,126,0.6)] mb-4 relative z-10"
            >
              <Gift size={40} className="text-white drop-shadow-md" />
            </motion.div>

            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#E0E0E0] drop-shadow-sm mb-2 relative z-10">
              ¡Bienvenido/a!
            </h2>
            
            <p className="text-xl font-bold text-[#00F5D4] drop-shadow-sm relative z-10">
              {playerName}
            </p>

            <div className="relative mt-3 z-10">
              {/* Impact Flash */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.5, 2] }}
                transition={{ delay: 0.95, duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 bg-white/40 blur-md rounded-full pointer-events-none -mr-4 ml-4"
                style={{ zIndex: -1 }}
              />

              {/* Impact Sparkles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`impact-spark-${i}`}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1.2, 0],
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 60
                  }}
                  transition={{ 
                    delay: 0.95,
                    duration: 0.6 + Math.random() * 0.2,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                >
                  <Star size={10} className="text-[#FEE440] fill-[#FEE440]" />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -40 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: 0,
                  textShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 20px rgba(255,255,255,1)", "0px 0px 8px rgba(255,255,255,0.6)"]
                }}
                transition={{ 
                  delay: 0.8, 
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                  textShadow: {
                    delay: 0.8,
                    duration: 0.6,
                    ease: "easeOut"
                  }
                }}
                className="flex items-center justify-center gap-1.5"
              >
                <Sparkles size={16} className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                <span className="text-white font-bold text-sm tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                  +50 puntos de bienvenida
                </span>
              </motion.div>
            </div>

            <p className="text-sm font-medium text-white/80 mt-3 relative z-10">
              ¡Prepárate para la aventura!
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
