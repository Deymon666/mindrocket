import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, XCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface BasicColorGameProps {
  onComplete: (points: number) => void;
  worldLevel: number;
  score: number;
  onUseHint: () => boolean;
  key?: string;
}

const COLORS = [
  { name: 'Rojo Carmesí', hex: '#DC143C' },
  { name: 'Azul Cerúleo', hex: '#007BA7' },
  { name: 'Verde Esmeralda', hex: '#50C878' },
  { name: 'Amarillo Mostaza', hex: '#FFDB58' },
  { name: 'Naranja Quemado', hex: '#CC5500' },
  { name: 'Púrpura Real', hex: '#7851A9' },
  { name: 'Rosa Chicle', hex: '#FFC1CC' },
  { name: 'Cian', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Turquesa', hex: '#40E0D0' },
  { name: 'Azul Marino', hex: '#000080' },
  { name: 'Verde Lima', hex: '#32CD32' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Lavanda', hex: '#E6E6FA' },
  { name: 'Marrón Chocolate', hex: '#D2691E' },
];

export default function BasicColorGame({ onComplete, worldLevel, score, onUseHint }: BasicColorGameProps) {
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [options, setOptions] = useState<typeof COLORS>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Select a random target color
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(target);

    // Generate 4 other random colors
    let otherColors = COLORS.filter(c => c.hex !== target.hex);
    otherColors = otherColors.sort(() => 0.5 - Math.random()).slice(0, 4);

    // Combine and shuffle
    const allOptions = [target, ...otherColors].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
    setSelected(null);
    setIsCorrect(null);
    setAttempts(0);
    setEliminatedOptions([]);
    setFeedback(null);
  }, [worldLevel]);

  const handleSelect = (color: typeof COLORS[0]) => {
    if (selected !== null) return; // Prevent multiple clicks
    
    setSelected(color.hex);
    
    if (color.hex === targetColor.hex) {
      setIsCorrect(true);
      setFeedback({ message: "¡Correcto! Este es el color exacto.", type: 'success' });
      // Calculate points based on attempts (max 50, min 10)
      const points = Math.max(10, 50 - (attempts * 10));
      setTimeout(() => onComplete(points), 1800);
    } else {
      setIsCorrect(false);
      setAttempts(prev => prev + 1);
      
      // Generate specific feedback
      let errorMsg = `Ese es ${color.name}. Este color no coincide con el tono exacto solicitado.`;
      setFeedback({ message: errorMsg, type: 'error' });

      // Give them another chance after a brief delay
      setTimeout(() => {
        setSelected(null);
        setIsCorrect(null);
        setFeedback(null);
      }, 1500);
    }
  };

  const handleHintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected !== null || isCorrect === true) return;
    
    const wrongOptions = options.filter(c => c.hex !== targetColor.hex && !eliminatedOptions.includes(c.hex));
    
    if (wrongOptions.length > 0) {
      if (onUseHint()) {
        const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        setEliminatedOptions(prev => [...prev, toEliminate.hex]);
      } else {
        const hintBtn = document.getElementById('hint-button-basic');
        if (hintBtn) {
          hintBtn.classList.add('animate-shake');
          setTimeout(() => hintBtn.classList.remove('animate-shake'), 500);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-between h-full w-full max-w-2xl mx-auto pt-4 pb-4 relative"
    >
      <div className="flex flex-col items-center w-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full font-bold mb-6 flex items-center gap-2 shadow-lg transform rotate-2">
        <Palette size={20} className="drop-shadow-sm text-[#FF477E]" />
        <span className="tracking-wide uppercase text-xs drop-shadow-sm">Ojo de Águila</span>
      </div>

      <div className="text-center mb-8 bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/20 shadow-lg w-[90%]">
        <h3 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
          Encuentra el <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] drop-shadow-sm">
            "{targetColor.name}"
          </span>
        </h3>
        <p className={`text-lg font-medium h-[24px] sm:h-[28px] ${feedback ? (feedback.type === 'success' ? 'text-[#00F5D4] text-sm sm:text-base font-bold' : 'text-[#FF477E] text-sm sm:text-base font-bold') : 'text-white/70'}`}>
          {feedback ? feedback.message : 'Toca la muestra correcta'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 w-full px-4 max-w-[300px]">
        {options.map((color, i) => {
          const isEliminated = eliminatedOptions.includes(color.hex);
          return (
          <motion.button
            key={i}
            whileHover={selected === null && !isEliminated ? { scale: 1.05, y: -5 } : {}}
            whileTap={selected === null && !isEliminated ? { scale: 0.95 } : {}}
            onClick={() => !isEliminated && handleSelect(color)}
            disabled={selected !== null || isEliminated}
            className={`aspect-square rounded-[2rem] transition-all relative overflow-hidden group
              ${selected === color.hex && isCorrect === false ? 'ring-4 ring-red-500 opacity-50 scale-95 animate-shake' : ''}
              ${selected === color.hex && isCorrect === true ? 'ring-8 ring-[#00F5D4] scale-110 z-10 shadow-[0_0_40px_rgba(0,245,212,0.6)]' : ''}
              ${selected !== null && selected !== color.hex && color.hex === targetColor.hex && isCorrect === false ? 'ring-4 ring-[#00F5D4] animate-pulse' : 'border-4 border-white/20 shadow-lg hover:shadow-xl'}
              ${isEliminated ? 'opacity-20 grayscale cursor-not-allowed scale-90' : ''}
            `}
            style={{ backgroundColor: color.hex }}
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <AnimatePresence>
              {selected === color.hex && isCorrect === false && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-red-500/30 backdrop-blur-sm"
                >
                  <XCircle className="text-white w-16 h-16 drop-shadow-md" />
                </motion.div>
              )}
              {selected === color.hex && isCorrect === true && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-[#00F5D4]/30 backdrop-blur-sm"
                >
                  <CheckCircle2 className="text-white w-20 h-20 drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )})}
      </div>
      </div>

      {/* Hint Character at the bottom */}
      {isCorrect !== true && (
        <div className="mt-auto pt-8 flex items-end justify-center w-full">
          <button
            id="hint-button-basic"
            onClick={handleHintClick}
            className="group relative flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            {/* Speech bubble */}
            <div className="absolute -top-12 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ¡Pista! (-20 pts)
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/20 border-r border-b border-white/30 rotate-45"></div>
            </div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-[#00F5D4] to-[#00B4D8] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,245,212,0.4)] border-2 border-white/50 relative overflow-hidden">
              <span className="text-3xl drop-shadow-md relative z-10">🤖</span>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            
            <div className="mt-2 bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#FEE440]" />
              <span className="text-white text-xs font-bold">{score >= 20 ? '20 pts' : 'Faltan pts'}</span>
            </div>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="text-white font-black text-2xl bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] border-4 border-white/30 px-10 py-5 rounded-[2rem] shadow-[0_10px_0_#0077B6,0_15px_30px_rgba(0,0,0,0.3)] flex items-center gap-3"
          >
            <Sparkles className="text-white drop-shadow-md" size={32} />
            <span className="drop-shadow-md">¡Ojo Perfecto! +{Math.max(10, 50 - (attempts * 10))} pts</span>
            <Sparkles className="text-white drop-shadow-md" size={32} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
