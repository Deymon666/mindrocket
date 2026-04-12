import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Coffee, CheckCircle2, Sparkles, Brain } from 'lucide-react';

interface CreativePauseProps {
  onComplete: (points: number) => void;
  worldLevel: number;
  score?: number;
  onUseHint?: () => boolean;
  key?: string;
}

export default function CreativePause({ onComplete, worldLevel }: CreativePauseProps) {
  const [stage, setStage] = useState<'intro' | 'reading' | 'summary'>('intro');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [summary, setSummary] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'reading' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (stage === 'reading' && timeLeft === 0) {
      setStage('summary');
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSkipReading = () => {
    // For testing/demo purposes, allow skipping the 30 min timer
    setStage('summary');
  };

  const handleSubmit = () => {
    if (summary.trim().length > 10) {
      setIsComplete(true);
      setTimeout(() => onComplete(200), 2000);
    } else {
      // If they don't write enough, they get 0 points but still advance
      setIsComplete(true);
      setTimeout(() => onComplete(0), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full"
    >
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2 rounded-full font-bold mb-6 flex items-center gap-2 shadow-[0_5px_15px_rgba(168,85,247,0.3)]">
        <Coffee size={18} />
        <span className="tracking-wide uppercase text-xs">Pausa Creativa</span>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center w-full px-4"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative inline-block mb-6"
            >
              <div className="absolute inset-0 bg-purple-400 blur-2xl opacity-30 rounded-full"></div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/20 relative z-10">
                <BookOpen size={60} className="text-white" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-3 -right-3 text-[#FEE440]"
              >
                <Sparkles size={24} />
              </motion.div>
            </motion.div>

            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              Desconecta para <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#00B4D8]">
                Conectar
              </span>
            </h3>
            <p className="text-lg text-white/80 mb-8 max-w-md mx-auto leading-relaxed font-medium">
              Toma tu libro favorito, aléjate de la pantalla y lee durante 30 minutos. 
              El descanso es el combustible de la creatividad.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage('reading')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full font-bold text-xl shadow-[0_10px_30px_-10px_rgba(147,51,234,0.8)] transition-all flex items-center justify-center gap-3 mx-auto"
            >
              <Brain size={24} />
              Comenzar a Leer
            </motion.button>
          </motion.div>
        )}

        {stage === 'reading' && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center w-full flex flex-col items-center px-4"
          >
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8 flex items-center justify-center">
              {/* Pulsing background rings */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-4 border-purple-300 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 border-4 border-indigo-200 rounded-full"
              />

              <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="116"
                  fill="white"
                  stroke="#F3F4F6"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="116"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeDasharray="728"
                  strokeDashoffset={728 - (728 * (1 - timeLeft / (30 * 60)))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F5D4" />
                    <stop offset="100%" stopColor="#00B4D8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00F5D4] to-[#00B4D8] font-mono tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white/60 uppercase tracking-widest mt-1">Restante</span>
              </div>
            </div>
            
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Sumergido en la lectura...</h4>
            <p className="text-base sm:text-lg text-white/70 mb-8 max-w-sm">
              Concéntrate en tu libro. El temporizador te avisará cuando termines.
            </p>

            <button
              onClick={handleSkipReading}
              className="text-xs sm:text-sm font-bold text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
            >
              (Demo) Saltar temporizador
            </button>
          </motion.div>
        )}

        {stage === 'summary' && !isComplete && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-xl mx-auto px-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                ¿Qué <span className="text-[#00F5D4]">aprendiste?</span>
              </h3>
              <p className="text-lg sm:text-xl text-white/80 font-medium">
                Escribe un breve resumen de tu lectura para ganar <span className="font-bold text-[#FEE440]">200 puntos</span>.
              </p>
            </div>
            
            <div className="relative mb-6 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Escribe tu resumen aquí... (mínimo 10 caracteres)"
                className="relative w-full h-40 sm:h-48 p-5 rounded-[1.5rem] border border-white/20 bg-white/10 backdrop-blur-md focus:border-[#00F5D4] focus:ring-0 outline-none resize-none transition-all text-base sm:text-lg text-white placeholder:text-white/40 shadow-inner"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-[0_10px_30px_-10px_rgba(147,51,234,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Enviar Resumen y Continuar
            </motion.button>
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex flex-col items-center text-center px-4"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)] border-4 border-white"
            >
              <CheckCircle2 size={48} className="text-white sm:w-16 sm:h-16" />
            </motion.div>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              ¡Mente <span className="text-[#00F5D4]">Refrescada!</span>
            </h3>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/20 max-w-sm w-full">
              <p className="text-white/80 text-lg sm:text-xl font-medium mb-2">
                {summary.trim().length > 10 
                  ? 'Excelente resumen.' 
                  : 'Actividad completada sin resumen.'}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#FEE440] flex items-center justify-center gap-2">
                {summary.trim().length > 10 ? '+200' : '+0'} pts
                <Sparkles size={24} />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
