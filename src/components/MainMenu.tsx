import { motion } from 'motion/react';
import { Rocket, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

interface MainMenuProps {
  onSelectWorld: (worldId: number) => void;
  currentWorld: number;
  playerName: string;
  playerAvatar: string;
  onBack: () => void;
  key?: string;
}

export default function MainMenu({ onSelectWorld, currentWorld, playerName, playerAvatar, onBack }: MainMenuProps) {
  const planets = [
    { id: 1, name: 'Nebulosa del Caos Creativo', color: 'from-[#FF477E] to-[#FF0055]', x: 200, y: 520 },
    { id: 2, name: 'Órbita de la Exploración', color: 'from-[#00F5D4] to-[#00B4D8]', x: 280, y: 420 },
    { id: 3, name: 'Constelación de la Inspiración', color: 'from-[#FEE440] to-[#F58700]', x: 120, y: 320 },
    { id: 4, name: 'Laboratorio Galáctico de Experimentación', color: 'from-[#9D4EDD] to-[#5A189A]', x: 260, y: 220 },
    { id: 5, name: 'Galaxia del Flujo Creativo', color: 'from-[#FF3366] to-[#C1121F]', x: 140, y: 120 },
    { id: 6, name: 'Planeta de la Claridad Final', color: 'from-[#00B4D8] to-[#03045E]', x: 200, y: 20 },
  ].map(planet => ({
    ...planet,
    unlocked: planet.id <= currentWorld,
    current: planet.id === currentWorld,
    completed: planet.id < currentWorld
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-start w-full h-full relative py-6"
    >
      {/* Top Bar */}
      <div className="w-full px-6 flex items-center justify-between z-30 mb-2">
        <button 
          onClick={onBack}
          className="text-white/80 hover:text-white bg-white/10 p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
          <span className="text-xl drop-shadow-md">{playerAvatar}</span>
          <span className="text-white font-bold tracking-wide drop-shadow-md max-w-[120px] truncate">{playerName}</span>
        </div>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Title */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="relative z-20 text-center mt-2"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 inline-block shadow-lg">
          <p className="text-white text-lg font-black tracking-wide drop-shadow-md">Selecciona un Mundo</p>
        </div>
      </motion.div>

      {/* Map Container */}
      <div className="relative w-full max-w-[400px] h-[550px] flex-1 my-4 flex items-center justify-center">
        
        {/* Path Line */}
        <svg viewBox="0 0 400 600" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} preserveAspectRatio="xMidYMid meet">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M 200 520 C 200 470, 280 470, 280 420 C 280 370, 120 370, 120 320 C 120 270, 260 270, 260 220 C 260 170, 140 170, 140 120 C 140 70, 200 70, 200 20"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            strokeDasharray="16 16"
            strokeLinecap="round"
          />
        </svg>

        {/* Planets */}
        <div className="absolute inset-0 w-full h-full">
          {planets.map((planet, index) => (
            <motion.div
              key={planet.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, type: "spring", bounce: 0.5 }}
              className="absolute flex flex-col items-center justify-center"
              style={{ 
                left: `${(planet.x / 400) * 100}%`,
                top: `${(planet.y / 600) * 100}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: planet.current ? 10 : 5
              }}
            >
              {/* Planet Body */}
              <motion.button
                whileHover={planet.unlocked ? { scale: 1.1 } : {}}
                whileTap={planet.unlocked ? { scale: 0.95 } : {}}
                onClick={planet.unlocked ? () => onSelectWorld(planet.id) : undefined}
                animate={planet.current ? { y: [0, -8, 0] } : {}}
                transition={planet.current ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
                className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.4)] border-4 ${planet.unlocked ? 'border-white cursor-pointer' : 'border-white/50 cursor-not-allowed'} transition-colors`}
              >
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${planet.color} ${!planet.unlocked && 'opacity-40 grayscale'} overflow-hidden`}>
                  {/* Planet texture/shine */}
                  <div className="absolute top-2 left-2 w-6 h-6 sm:w-8 sm:h-8 bg-white/30 rounded-full blur-sm"></div>
                  <div className="absolute bottom-[-10px] right-[-10px] w-12 h-12 sm:w-16 sm:h-16 bg-black/20 rounded-full blur-md"></div>
                </div>

                {/* Icon */}
                <div className="relative z-10 text-white drop-shadow-md">
                  {planet.current ? (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Rocket size={32} className="text-white sm:w-10 sm:h-10" />
                    </motion.div>
                  ) : planet.completed ? (
                    <CheckCircle2 size={28} className="sm:w-8 sm:h-8" />
                  ) : (
                    <Lock size={28} className="text-white/70 sm:w-8 sm:h-8" />
                  )}
                </div>

                {/* Current Planet Indicator Ring */}
                {planet.current && (
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-[-10px] sm:inset-[-12px] border-4 border-white rounded-full"
                  />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
