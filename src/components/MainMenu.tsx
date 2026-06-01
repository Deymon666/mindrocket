import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Rocket, Lock, CheckCircle2, LogOut, Sparkles } from 'lucide-react';

interface MainMenuProps {
  onSelectWorld: (worldId: number) => void;
  currentWorld: number;
  playerName: string;
  playerAvatar: string;
  score: number;
  onBack: () => void;
  key?: string;
}

const basePlanets = [
  { name: 'Nebulosa del Caos Creativo', color: 'from-[#FF477E] to-[#FF0055]' },
  { name: 'Órbita de la Exploración', color: 'from-[#00F5D4] to-[#00B4D8]' },
  { name: 'Constelación de la Inspiración', color: 'from-[#FEE440] to-[#F58700]' },
  { name: 'Laboratorio Galáctico de Experimentación', color: 'from-[#9D4EDD] to-[#5A189A]' },
  { name: 'Galaxia del Flujo Creativo', color: 'from-[#FF3366] to-[#C1121F]' },
  { name: 'Planeta de la Claridad Final', color: 'from-[#00B4D8] to-[#03045E]' },
];

const PLANET_SPACING = 140;
const BOTTOM_PADDING = 250;
const TOP_PADDING = 300;
const SVG_WIDTH = 400;

function getPlanetData(id: number, currentWorld: number) {
  const base = basePlanets[(id - 1) % basePlanets.length];
  // Zig-zag pattern X coordinates
  const pattern = [200, 280, 140, 260, 120, 200, 160, 240];
  const x = pattern[(id - 1) % pattern.length];
  
  return {
    id,
    name: id > 6 ? `${base.name} ${Math.floor((id-1)/6) + 1}` : base.name,
    color: base.color,
    x,
    unlocked: id <= currentWorld,
    current: id === currentWorld,
    completed: id < currentWorld
  };
}

export default function MainMenu({ onSelectWorld, currentWorld, playerName, playerAvatar, score, onBack }: MainMenuProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Start with 10 planets ahead of current world, minimum 10
  const [renderedCount, setRenderedCount] = useState(() => Math.max(10, currentWorld + 6));
  const totalHeight = renderedCount * PLANET_SPACING + BOTTOM_PADDING + TOP_PADDING;
  const prevHeightRef = useRef(totalHeight);

  // Scroll handler to load more
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop } = scrollContainerRef.current;
    
    // If within 1000px of top, generate more worlds above
    if (scrollTop < 1000) {
      setRenderedCount(prev => prev + 10);
    }
  };

  // Adjust scroll when totalHeight changes (to prevent jumping)
  useLayoutEffect(() => {
    if (totalHeight > prevHeightRef.current && scrollContainerRef.current) {
      const diff = totalHeight - prevHeightRef.current;
      scrollContainerRef.current.scrollTop += diff;
    }
    prevHeightRef.current = totalHeight;
  }, [totalHeight]);

  // Initial scroll to recent planet
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      const activeId = currentWorld;
      const planetYFromBottom = (activeId - 1) * PLANET_SPACING + BOTTOM_PADDING;
      const activeY = totalHeight - planetYFromBottom;
      const containerHeight = scrollContainerRef.current.clientHeight || window.innerHeight;
      
      // Center current planet in view
      scrollContainerRef.current.scrollTop = activeY - containerHeight / 2;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Parallax background logic
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const particlesY = useTransform(scrollYProgress, [0, 1], ['0%', '150%']);

  // Generate rendered planets array
  const planets = Array.from({ length: renderedCount }, (_, i) => getPlanetData(i + 1, currentWorld));

  // Build the SVG path string
  let pathD = "";
  planets.forEach((planet, index) => {
    const i = index + 1;
    const x = planet.x;
    const y = totalHeight - ((i - 1) * PLANET_SPACING + BOTTOM_PADDING);
    
    if (i === 1) {
      pathD += `M ${x} ${y} `;
    } else {
      const prevX = getPlanetData(i - 1, currentWorld).x;
      const prevY = totalHeight - ((i - 2) * PLANET_SPACING + BOTTOM_PADDING);
      const midY = (y + prevY) / 2;
      pathD += `C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y} `;
    }
  });

  // Build the Active SVG path string up to currentWorld
  let activePathD = "";
  if (currentWorld > 1) {
    for (let i = 1; i <= currentWorld; i++) {
      const planet = getPlanetData(i, currentWorld);
      const x = planet.x;
      const y = totalHeight - ((i - 1) * PLANET_SPACING + BOTTOM_PADDING);
      
      if (i === 1) {
        activePathD += `M ${x} ${y} `;
      } else {
        const prevX = getPlanetData(i - 1, currentWorld).x;
        const prevY = totalHeight - ((i - 2) * PLANET_SPACING + BOTTOM_PADDING);
        const midY = (y + prevY) / 2;
        activePathD += `C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y} `;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-start w-full h-full relative overflow-hidden"
    >
      {/* Fixed fluid parallax background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E1643] via-[#0D0A20] to-black opacity-80" 
        />
        {/* Parallax Stars/Particles */}
        <motion.div 
          style={{ y: particlesY }}
          className="absolute inset-[-100%] w-[300%] h-[300%] opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMjUwIiBjeT0iMTUwIiByPSIyIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMTAuNTEiLz4KICA8Y2lyY2xlIGN4PSIxNTAiIGN5PSIzNTAiIHI9IjEuNSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNiIvPgogIDxjaXJjbGUgY3g9IjM1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+Cjwvc3ZnPg==')] bg-repeat" 
        />
      </div>

      {/* Top Bar (Fixed) */}
      <div className="absolute top-0 left-0 w-full px-6 py-6 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex gap-4">
          <button 
            onClick={onBack}
            title="Cerrar Sesión"
            className="text-white/80 hover:text-white bg-white/10 p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-lg"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg absolute left-1/2 -translate-x-1/2"
        >
          <span className="text-xl drop-shadow-md">{playerAvatar}</span>
          <span className="text-white font-bold tracking-wide drop-shadow-md max-w-[120px] truncate">{playerName}</span>
        </motion.div>
        
        <div className="pointer-events-auto flex items-center gap-1.5 bg-gradient-to-b from-[#FFF3B0] to-[#FEE440] px-3 py-1.5 rounded-xl border-b-4 border-[#E5C100] shadow-sm transform rotate-[2deg]">
          <Sparkles size={16} className="text-[#F58700] fill-[#FEE440] drop-shadow-sm" />
          <span className="font-black text-base text-[#806000] tracking-tight drop-shadow-sm">{score}</span>
        </div>
      </div>

      {/* Title overlay (Fixed) */}
      <div className="absolute top-20 left-0 w-full flex justify-center z-30 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 shadow-2xl"
        >
          <p className="text-white/90 text-sm font-black tracking-widest uppercase drop-shadow-md">Navegación Galáctica</p>
        </motion.div>
      </div>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto overflow-x-hidden relative z-20 flex justify-center hide-scrollbar"
      >
        <div 
          className="relative w-full max-w-[400px]"
          style={{ height: totalHeight }}
        >
          {/* Path Line */}
          <svg 
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" 
            style={{ width: SVG_WIDTH, height: totalHeight, zIndex: 0 }} 
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d={pathD}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="8"
              strokeDasharray="12 12"
              strokeLinecap="round"
            />
            
            {/* Active Path Line (Glowing) up to current world */}
            {currentWorld > 1 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                d={activePathD}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
            )}
            
            <defs>
              <linearGradient id="pathGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FF477E" />
                <stop offset="50%" stopColor="#00F5D4" />
                <stop offset="100%" stopColor="#FEE440" />
              </linearGradient>
            </defs>
          </svg>

          {/* Planets */}
          {planets.map((planet, index) => {
            const yPos = totalHeight - (index * PLANET_SPACING + BOTTOM_PADDING);
            
            return (
              <motion.div
                key={planet.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: Math.min(index * 0.1, 1), // Max delay cap
                  type: "spring", 
                  bounce: 0.5 
                }}
                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `calc(50% - ${(SVG_WIDTH/2 - planet.x)}px)`,
                  top: `${yPos}px`,
                  zIndex: planet.current ? 10 : 5
                }}
              >
                {/* Planet Body */}
                <motion.button
                  whileHover={planet.unlocked ? { scale: 1.15 } : {}}
                  whileTap={planet.unlocked ? { scale: 0.95 } : {}}
                  onClick={planet.unlocked ? () => onSelectWorld(planet.id) : undefined}
                  animate={planet.current ? { y: [0, -10, 0] } : {}}
                  transition={planet.current ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
                  className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 ${planet.unlocked ? 'border-white cursor-pointer' : 'border-white/30 cursor-not-allowed'} transition-all`}
                >
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${planet.color} ${!planet.unlocked && 'opacity-20 grayscale'} overflow-hidden`}>
                    {/* Planet texture/shine */}
                    <div className="absolute top-2 left-2 w-6 h-6 sm:w-8 sm:h-8 bg-white/40 rounded-full blur-sm"></div>
                    <div className="absolute bottom-[-10px] right-[-10px] w-12 h-12 sm:w-16 sm:h-16 bg-black/40 rounded-full blur-md"></div>
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 text-white drop-shadow-md">
                    {planet.current ? (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/50"
                      >
                        <Rocket size={28} className="text-white drop-shadow-lg" />
                      </motion.div>
                    ) : planet.completed ? (
                      <CheckCircle2 size={28} className="drop-shadow-lg" />
                    ) : (
                      <Lock size={24} className="text-white/50" />
                    )}
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <style>{`
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
