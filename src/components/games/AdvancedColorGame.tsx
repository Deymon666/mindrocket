import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, CheckCircle2, Sparkles } from 'lucide-react';

interface AdvancedColorGameProps {
  onComplete: (points: number) => void;
  worldLevel: number;
  score: number;
  onUseHint: () => boolean;
  key?: string;
}

type HarmonyType = 'Complementario' | 'Análogo' | 'Tríada' | 'Monocromático' | 'Complementario Dividido' | 'Regla 60-30-10';

interface Challenge {
  type: HarmonyType;
  description: string;
  baseColor: string;
  targetColors: string[];
  options: string[];
}

// Helper to generate HSL string
const hsl = (h: number, s: number, l: number) => `hsl(${h % 360}, ${s}%, ${l}%)`;

export default function AdvancedColorGame({ onComplete, worldLevel, score, onUseHint }: AdvancedColorGameProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    generateChallenge();
  }, [worldLevel]);

  // Helper to extract hue from hsl string (hsl(H, S%, L%))
  const getHue = (hslString: string) => {
    const match = hslString.match(/hsl\((\d+),\s*\d+%,\s*\d+%\)/);
    return match ? parseInt(match[1]) : 0;
  };

  const generateChallenge = () => {
    const types: HarmonyType[] = [
      'Complementario', 'Análogo', 'Tríada', 
      'Monocromático', 'Complementario Dividido', 'Regla 60-30-10'
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const h = Math.floor(Math.random() * 360);
    const s = 70 + Math.floor(Math.random() * 20); // 70-90%
    const l = 50;
    
    const baseColor = hsl(h, s, l);
    let targetColors: string[] = [];
    let description = '';

    switch (type) {
      case 'Complementario':
        targetColors = [hsl((h + 180) % 360, s, l)];
        description = 'Encuentra el color opuesto en el círculo cromático.';
        break;
      case 'Análogo':
        targetColors = [hsl((h - 30 + 360) % 360, s, l), hsl((h + 30) % 360, s, l)];
        description = 'Selecciona los dos colores adyacentes al color base.';
        break;
      case 'Tríada':
        targetColors = [hsl((h + 120) % 360, s, l), hsl((h + 240) % 360, s, l)];
        description = 'Encuentra los colores que forman un triángulo equilátero.';
        break;
      case 'Monocromático':
        targetColors = [hsl(h, s, l - 25), hsl(h, s, l + 25)];
        description = 'Selecciona diferentes tonos y matices del mismo color.';
        break;
      case 'Complementario Dividido':
        targetColors = [hsl((h + 150) % 360, s, l), hsl((h + 210) % 360, s, l)];
        description = 'Selecciona los dos colores adyacentes al complementario.';
        break;
      case 'Regla 60-30-10':
        // 60% base (neutralish), 30% secondary (analogous), 10% accent (complementary)
        targetColors = [hsl((h + 30) % 360, s, l), hsl((h + 180) % 360, s, l)];
        description = 'Construye una paleta 60-30-10: Elige el color secundario (30%) y el acento (10%).';
        break;
    }

    // Generate options: targets + random noise
    let options = [...targetColors];
    
    const isDistinct = (newColor: string, newH: number) => {
      // Must be visually distinct from baseColor and all current options
      const colorsToCheck = [baseColor, ...options];
      for (const color of colorsToCheck) {
        const h2 = getHue(color);
        const hueDiff = Math.min(Math.abs(newH - h2), 360 - Math.abs(newH - h2));
        if (hueDiff < 20 && color.includes(`%`)) { // If hue diff is too small, they are visually similar
           return false;
        }
      }
      return true;
    };

    let attempts = 0;
    while (options.length < 8 && attempts < 100) {
      attempts++;
      const randomH = Math.floor(Math.random() * 360);
      const randomL = 40 + Math.floor(Math.random() * 20);
      const noiseColor = hsl(randomH, s, randomL);
      
      if (isDistinct(noiseColor, randomH)) {
        options.push(noiseColor);
      }
    }
    
    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    setChallenge({ type, description, baseColor, targetColors, options });
    setSelectedColors([]);
    setIsCorrect(null);
    setEliminatedOptions([]);
    setFeedback(null);
  };

  const handleSelect = (color: string) => {
    if (!challenge || isCorrect) return;

    let newSelected = [...selectedColors];
    
    if (newSelected.includes(color)) {
      newSelected = newSelected.filter(c => c !== color);
      setSelectedColors(newSelected);
      setFeedback(null); // Clear feedback when unselecting
      return;
    }

    // Checking feedback for the newly selected color
    const isColorTarget = challenge.targetColors.includes(color);
    if (!isColorTarget) {
        let errorMsg = "Este color no coincide con la relación cromática indicada.";
        const colorH = getHue(color);
        const baseH = getHue(challenge.baseColor);
        const diff = Math.min(Math.abs(colorH - baseH), 360 - Math.abs(colorH - baseH));
        
        if (challenge.type === 'Complementario' && diff < 150) {
            errorMsg = "Recuerda que el complementario debe estar en el lado opuesto del círculo.";
        } else if (challenge.type === 'Análogo' && diff > 60) {
            errorMsg = "Un color análogo debe estar muy cerca del color base en el círculo.";
        } else if (challenge.type === 'Monocromático') {
            errorMsg = "Este color tiene un tono distinto. ¡Busca una variación de luminosidad del mismo color!";
        }

        setFeedback({ message: errorMsg, type: 'error' });
    } else {
        setFeedback({ message: "¡Buen ojo! Ese color pertenece a la relación cromática.", type: 'success' });
    }

    if (newSelected.length < challenge.targetColors.length) {
      newSelected.push(color);
    } else {
      newSelected[newSelected.length - 1] = color;
    }

    setSelectedColors(newSelected);

    // Check if fully correct (all targets selected)
    if (newSelected.length === challenge.targetColors.length) {
      const isMatch = challenge.targetColors.every(t => newSelected.includes(t));
      if (isMatch) {
        setIsCorrect(true);
        setFeedback({ message: "¡Correcto! Has completado la relación cromática solicitada.", type: 'success' });
        setTimeout(() => onComplete(150), 3000);
      } else {
        setIsCorrect(false);
        setTimeout(() => {
          setSelectedColors([]);
          setIsCorrect(null);
          setFeedback(null);
        }, 3000);
      }
    }
  };

  const handleHintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!challenge || isCorrect === true) return;
    
    const wrongOptions = challenge.options.filter(c => 
      !challenge.targetColors.includes(c) && 
      !eliminatedOptions.includes(c) &&
      !selectedColors.includes(c)
    );
    
    if (wrongOptions.length > 0) {
      if (onUseHint()) {
        const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        setEliminatedOptions(prev => [...prev, toEliminate]);
      } else {
        const hintBtn = document.getElementById('hint-button-adv');
        if (hintBtn) {
          hintBtn.classList.add('animate-shake');
          setTimeout(() => hintBtn.classList.remove('animate-shake'), 500);
        }
      }
    }
  };

  if (!challenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-between h-full pt-4 pb-4 relative"
    >
      <div className="flex flex-col items-center w-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full font-bold mb-4 flex items-center gap-2 shadow-lg transform rotate-1">
        <Layers size={20} className="drop-shadow-sm text-[#FEE440]" />
        <span className="drop-shadow-sm text-sm">Armonía: {challenge.type}</span>
      </div>

      <div className="text-center mb-6 w-full max-w-[320px]">
        <p className="relative text-white mb-4 font-bold text-sm bg-white/10 backdrop-blur-md p-4 rounded-[1.5rem] shadow-lg border border-white/20 leading-relaxed overflow-hidden">
          <span className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FEE440] to-[#F58700]"></span>
          <span className={feedback ? (feedback.type === 'success' ? 'text-[#00F5D4]' : 'text-[#FF477E]') : ''}>
            {feedback ? feedback.message : challenge.description}
          </span>
        </p>
        
        <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-[2rem] shadow-lg border border-white/20">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-white/60 uppercase mb-2 tracking-wider">Color Base</span>
            <div 
              className="w-14 h-14 rounded-xl shadow-lg border-2 border-white/50 transform -rotate-3"
              style={{ backgroundColor: challenge.baseColor }}
            />
          </div>
          
          <div className="flex gap-3">
            {Array.from({ length: challenge.targetColors.length }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[10px] font-black text-white/60 uppercase mb-2 tracking-wider">
                  {challenge.type === 'Regla 60-30-10' ? (i === 0 ? 'Secundario' : 'Acento') : `Objetivo ${i + 1}`}
                </span>
                <div 
                  className={`w-14 h-14 rounded-xl transition-all duration-300 transform ${i % 2 === 0 ? 'rotate-3' : '-rotate-2'}
                    ${selectedColors[i] ? 'border-2 border-white/50 shadow-lg' : 'border-2 border-dashed border-white/30 bg-white/5'}
                  `}
                  style={{ backgroundColor: selectedColors[i] || 'transparent' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Palette Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {challenge.options.map((color, i) => {
          const isEliminated = eliminatedOptions.includes(color);
          return (
          <motion.button
            key={i}
            whileHover={!isEliminated ? { scale: 1.1, y: -4 } : {}}
            whileTap={!isEliminated ? { scale: 0.95 } : {}}
            onClick={() => !isEliminated && handleSelect(color)}
            disabled={isCorrect === true || isEliminated}
            className={`w-12 h-12 rounded-xl transition-all relative overflow-hidden group
              ${selectedColors.includes(color) ? 'ring-4 ring-[#00F5D4] scale-110 z-10 shadow-[0_0_20px_rgba(0,245,212,0.5)]' : 'border-2 border-white/20 shadow-lg hover:shadow-xl'}
              ${isCorrect === false && selectedColors.includes(color) ? 'ring-4 ring-red-500 animate-shake' : ''}
              ${isCorrect === true && selectedColors.includes(color) ? 'ring-4 ring-[#00F5D4]' : ''}
              ${isEliminated ? 'opacity-20 grayscale cursor-not-allowed scale-90' : ''}
            `}
            style={{ backgroundColor: color }}
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.button>
        )})}
      </div>
      </div>

      {/* Hint Character at the bottom */}
      {isCorrect !== true && (
        <div className="mt-auto pt-8 flex items-end justify-center w-full">
          <button
            id="hint-button-adv"
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
            className="absolute bottom-10 flex items-center gap-3 text-white font-black text-2xl bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] px-10 py-5 rounded-[2rem] shadow-[0_10px_0_#0077B6,0_15px_30px_rgba(0,0,0,0.3)] border-4 border-white/30"
          >
            <Sparkles size={32} className="drop-shadow-md" />
            <span className="drop-shadow-md">¡Armonía Perfecta! +150 pts</span>
            <Sparkles size={32} className="drop-shadow-md" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
