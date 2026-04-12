import { motion } from 'motion/react';
import { ArrowLeft, Lock, CheckCircle2, Sparkles, Rocket, Star, Zap, Palette, Brain } from 'lucide-react';

interface WorldLevelsScreenProps {
  worldId: number;
  completedLevels: number;
  onSelectLevel: (levelIndex: number) => void;
  onBack: () => void;
  key?: string;
}

export default function WorldLevelsScreen({
  worldId,
  completedLevels,
  onSelectLevel,
  onBack
}: WorldLevelsScreenProps) {
  
  const worldThemes = [
    { id: 1, name: 'Nebulosa del Caos Creativo', color: 'from-[#FF477E] to-[#FF0055]', bg: 'bg-[#2A0818]', icon: Palette },
    { id: 2, name: 'Órbita de la Exploración', color: 'from-[#00F5D4] to-[#00B4D8]', bg: 'bg-[#001A22]', icon: Zap },
    { id: 3, name: 'Constelación de la Inspiración', color: 'from-[#FEE440] to-[#F58700]', bg: 'bg-[#2A1800]', icon: Star },
    { id: 4, name: 'Laboratorio Galáctico de Experimentación', color: 'from-[#9D4EDD] to-[#5A189A]', bg: 'bg-[#1A052A]', icon: Brain },
    { id: 5, name: 'Galaxia del Flujo Creativo', color: 'from-[#FF3366] to-[#C1121F]', bg: 'bg-[#2A050A]', icon: Rocket },
    { id: 6, name: 'Planeta de la Claridad Final', color: 'from-[#00B4D8] to-[#03045E]', bg: 'bg-[#000A1A]', icon: Sparkles },
  ];

  const theme = worldThemes[worldId - 1] || worldThemes[0];
  const ThemeIcon = theme.icon;

  const levels = [
    { title: 'Desafío Creativo 1', type: 'Conceptos Básicos', icon: Sparkles },
    { title: 'Misión de Color', type: 'Práctica Visual', icon: Palette },
    { title: 'Armonía Avanzada', type: 'Reto de Diseño', icon: Star },
    { title: 'Pausa Estelar', type: 'Reflexión', icon: Brain },
    { title: 'Reto Final', type: 'Evaluación', icon: Rocket },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className={`absolute inset-0 z-20 flex flex-col w-full h-full ${theme.bg} overflow-hidden`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-96 bg-gradient-to-b ${theme.color} blur-[100px] opacity-40 -translate-y-1/2`}></div>
        <div className={`absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t ${theme.color} blur-[100px] opacity-30 translate-y-1/4 translate-x-1/4 rounded-full`}></div>
      </div>

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between p-6 pb-2">
        <button 
          onClick={onBack}
          className="text-white/80 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div className={`bg-gradient-to-br ${theme.color} p-3.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] border-2 border-white/30`}>
          <ThemeIcon size={28} className="text-white drop-shadow-md" />
        </div>
        <div className="w-12"></div> {/* Spacer */}
      </div>

      <div className="relative z-30 px-6 pt-4 pb-6 flex flex-col flex-1 overflow-y-auto hide-scrollbar">
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg mb-4 leading-tight"
          >
            {theme.name}
          </motion.h2>
          
          {/* Progress Indicator */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-inner"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`h-2.5 rounded-full transition-all duration-700 ${
                    i < completedLevels 
                      ? `w-6 bg-gradient-to-r ${theme.color} shadow-[0_0_10px_rgba(255,255,255,0.5)]` 
                      : 'w-2.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-white/90 font-black text-sm tracking-wide">
              {completedLevels} / 5
            </span>
          </motion.div>
        </div>

        {/* Levels List */}
        <div className="flex flex-col gap-4 pb-10 max-w-md mx-auto w-full">
          {levels.map((level, index) => {
            const isCompleted = index < completedLevels;
            const isUnlocked = index <= completedLevels;
            const LevelIcon = level.icon;

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectLevel(index)}
                whileHover={isUnlocked ? { scale: 1.02, x: 5 } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                className={`relative w-full text-left rounded-[2rem] p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 border-2 overflow-hidden group
                  ${isUnlocked 
                    ? 'bg-white/10 backdrop-blur-xl border-white/30 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] hover:bg-white/15 hover:border-white/50' 
                    : 'bg-black/20 backdrop-blur-sm border-white/5 opacity-70 grayscale-[0.5]'}
                `}
              >
                {/* Shine effect on hover */}
                {isUnlocked && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                )}

                {/* Status Icon / Number */}
                <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-inner border-2 relative z-10 transition-colors duration-300
                  ${isCompleted 
                    ? `bg-gradient-to-br ${theme.color} border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]` 
                    : isUnlocked
                      ? 'bg-white/20 border-white/40 group-hover:bg-white/30'
                      : 'bg-black/40 border-white/10'
                  }
                `}>
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      <CheckCircle2 size={28} className="text-white drop-shadow-md" />
                    </motion.div>
                  ) : isUnlocked ? (
                    <span className="text-2xl font-black text-white drop-shadow-md">{index + 1}</span>
                  ) : (
                    <Lock size={24} className="text-white/40" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 relative z-10">
                  <h3 className={`text-lg sm:text-xl font-black tracking-wide mb-0.5 transition-colors
                    ${isUnlocked ? 'text-white group-hover:text-[#FEE440]' : 'text-white/50'}
                  `}>
                    {level.title}
                  </h3>
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider
                    ${isUnlocked ? 'text-white/70' : 'text-white/30'}
                  `}>
                    {level.type}
                  </p>
                </div>

                {/* Action Button */}
                {isUnlocked && !isCompleted && (
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] border-2 border-white/40 shrink-0 relative z-10`}
                  >
                    <LevelIcon size={20} className="text-white drop-shadow-md" />
                  </motion.div>
                )}
                
                {isCompleted && (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 relative z-10">
                    <LevelIcon size={20} className="text-white/60" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
