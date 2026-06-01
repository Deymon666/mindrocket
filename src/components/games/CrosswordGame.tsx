import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, HelpCircle, Keyboard, Sparkles } from 'lucide-react';

interface CrosswordGameProps {
  onComplete: (points: number) => void;
  worldLevel: number;
  score: number;
  onUseHint: () => boolean;
  key?: string;
}

// Detailed, adaptive puzzles designed specifically for each world level
const WORLD_PUZZLES: Record<number, { theme: string, words: { answer: string, clue: string }[] }[]> = {
  1: [
    {
      theme: "Arte Clásico y Pinturas",
      words: [
        { answer: "MUSEO", clue: "Institución que alberga, conserva y exhibe colecciones de arte." },
        { answer: "MURAL", clue: "Gran pintura realizada directamente sobre una pared o muro." },
        { answer: "GRITO", clue: "Famoso cuadro expresionista sobre la angustia, pintado por Edvard Munch." },
        { answer: "CINE", clue: "El arte de proyectar metrajes de vídeo en gran pantalla." }
      ]
    },
    {
      theme: "Moda y Diseño Inicial",
      words: [
        { answer: "TELA", clue: "Material textil indispensable para la confección de ropa." },
        { answer: "DIOR", clue: "Elegante diseñador de moda creador del estilo New Look en 1947." },
        { answer: "ARTE", clue: "Actividad humana que expresa una visión sensible o creativa." },
        { answer: "MODA", clue: "Uso, modo o costumbre que está en boga durante algún tiempo." }
      ]
    },
    {
      theme: "Diseño Gráfico Básico",
      words: [
        { answer: "COLOR", clue: "Percepción visual fundamental que transmite emociones y contrasta elementos." },
        { answer: "PIXEL", clue: "La menor unidad homogénea en color que forma parte de una imagen digital." },
        { answer: "ICONO", clue: "Signo o representación simplificada que remite a un objeto o acción." },
        { answer: "LOGOTIPO", clue: "Identificación gráfica de una marca compuesta solo por letras o texto." }
      ]
    }
  ],
  2: [
    {
      theme: "Obras de Teatro Clásicas",
      words: [
        { answer: "HAMLET", clue: "Tragedia dramática de Shakespeare sobre la traición e indecisión." },
        { answer: "OTELO", clue: "Obra teatral de Shakespeare que retrata los celos obsesivos." },
        { answer: "TEATRO", clue: "Edificio o espacio donde se representan obras escénicas en vivo." },
        { answer: "GRIEGO", clue: "Origen del teatro clásico de tragedias y comedias antiguas de Sófocles." }
      ]
    },
    {
      theme: "Pinturas Célebres",
      words: [
        { answer: "MENINAS", clue: "Famosa pintura barroca de Diego Velázquez retratando la corte real española." },
        { answer: "MONALISA", clue: "Obra cumbre de Da Vinci alabada por su enigmática y famosa sonrisa." },
        { answer: "LIENZO", clue: "Tela preparada de cáñamo o lino sobre la cual se pinta al óleo." },
        { answer: "PINCEL", clue: "Herramienta con finos pelos delgada usada para esparcir pintura." }
      ]
    },
    {
      theme: "Tipografía de Diseño",
      words: [
        { answer: "SERIF", clue: "Pequeño remate o adorno al final de los trazos de una letra." },
        { answer: "FUENTE", clue: "Conjunto completo de caracteres tipográficos de un mismo diseño y estilo." },
        { answer: "MARCA", clue: "Identidad comercial o conjunto de valores que representa a una empresa." },
        { answer: "CURSIVA", clue: "Estilo de letra que se inclina hacia la derecha para dar énfasis." }
      ]
    }
  ],
  3: [
    {
      theme: "Íconos del Diseño",
      words: [
        { answer: "CHANEL", clue: "Diseñadora francesa revolucionaria que creó el icónico perfume Nº 5." },
        { answer: "BAUHAUS", clue: "Influyente escuela alemana que unió el arte, la industria de posguerra y la pura funcionalidad." },
        { answer: "EAMES", clue: "Matrimonio icónico estadounidense clave en el diseño de sillería orgánica y moderna." },
        { answer: "BOCETO", clue: "Esbozo inicial rápido o borrador trazado por un diseñador antes de la obra final." }
      ]
    },
    {
      theme: "Teatro y Drama de Época",
      words: [
        { answer: "FAUSTO", clue: "Gran obra clásica en verso escrita por Goethe sobre vender el alma al diablo." },
        { answer: "DRAMA", clue: "Género teatral profundo caracterizado por conflictos internos serios." },
        { answer: "MOLIERE", clue: "Famoso dramaturgo francés clave del siglo XVII, autor de 'El Tartufo'." },
        { answer: "ESCENA", clue: "Parte de un acto de una obra teatral donde actúan los mismos personajes." }
      ]
    },
    {
      theme: "Composición Gráfica",
      words: [
        { answer: "VECTOR", clue: "Imagen digital formada por objetos geométricos independientes basada en fórmulas matemáticas." },
        { answer: "ESCALA", clue: "Relación de proporción entre las dimensiones reales de un objeto y su dibujo." },
        { answer: "SIMETRIA", clue: "Disposición exacta de las partes o puntos de un cuerpo de forma idéntica a cada lado." },
        { answer: "RETICULA", clue: "Estructura de líneas invisibles que ayuda a alinear elementos en un espacio." }
      ]
    }
  ],
  4: [
    {
      theme: "Pinturas de Vanguardia",
      words: [
        { answer: "GUERNICA", clue: "Inmenso óleo cúbico contra los estragos de la guerra pintado por Picasso." },
        { answer: "GIRASOLES", clue: "Célebre serie de vibrantes bodegones florales de color amarillo de Van Gogh." },
        { answer: "RETRATO", clue: "Representación minuciosa de la fisonomía exterior de una persona real." },
        { answer: "CUBISMO", clue: "Movimiento fundado por Picasso que rompe del todo con la perspectiva tradicional." }
      ]
    },
    {
      theme: "Diseño y Alta Costura",
      words: [
        { answer: "VERSACE", clue: "Llamativo diseñador italiano creador de glamorosas colecciones neobarrocas." },
        { answer: "GUCCI", clue: "Prestigiosa marca de moda artesanal de cuero de lujo fundada en Florencia." },
        { answer: "SILUETA", clue: "Forma y contorno general de un traje textil que define su línea visual." },
        { answer: "SASTRE", clue: "Oficio primoroso de cortar y confeccionar ropa masculina o trajes a la medida." }
      ]
    },
    {
      theme: "Identidad Profesional Visual",
      words: [
        { answer: "ISOTIPO", clue: "La parte icónica o puramente visual de una marca, sin incluir texto." },
        { answer: "MAQUETA", clue: "Simulación digital o física previa de un diseño antes de imprimirse o subirse." },
        { answer: "MOODBOARD", clue: "Muro de inspiración visual con paletas, fotos y texturas para guiar un proyecto." },
        { answer: "LOGOTIPO", clue: "La firma visual de letras tipográficas que representa a un negocio formal." }
      ]
    }
  ],
  5: [
    {
      theme: "Teatro Trágico Superior",
      words: [
        { answer: "MACBETH", clue: "Obra de Shakespeare de gran intensidad sobre la ambición letal del poder." },
        { answer: "SOFOCLES", clue: "Célebre creador trágico griego de la antigüedad clásica, autor de Edipo Rey." },
        { answer: "ANTIGONA", clue: "Tragedia que opone la piedad familiar a la cruel ley rígida dictada por el rey Creonte." },
        { answer: "COMEDIA", clue: "Género escénico divertido o humorístico de final feliz que busca mover a risa." }
      ]
    },
    {
      theme: "Diseño Maestro de Costura",
      words: [
        { answer: "BALENCIAGA", clue: "Diseñador vasco de costura perfecta que asombró a París con sus volúmenes volumétricos." },
        { answer: "PALETA", clue: "Superficie rígida de madera donde el artista coloca y combina sus pinturas." },
        { answer: "SURREAL", clue: "Exponente o característica que asocia elementos irracionales sin lógica consciente." },
        { answer: "VANGUARDIA", clue: "Corriente artística revolucionaria intelectual que combate directamente los ideales clásicos." }
      ]
    },
    {
      theme: "Branding y Diseño Gráfico Élite",
      words: [
        { answer: "KERNING", clue: "Ajuste del espacio de separación entre dos letras individuales consecutivas." },
        { answer: "PACKAGING", clue: "Diseño del empaque, envase o embalaje que contiene y vende un producto." },
        { answer: "CMYK", clue: "Modelos de color primarios sustractivos para impresión física en prensa de tinta." },
        { answer: "JERARQUIA", clue: "Organización visual de la información que dirige el orden en que el ojo lee el contenido." }
      ]
    }
  ]
};

function getPuzzleForWorld(worldLevel: number) {
  // Normalize level between 1 and 5
  const level = Math.max(1, Math.min(5, worldLevel));
  const options = WORLD_PUZZLES[level];
  return options[Math.floor(Math.random() * options.length)];
}

export default function CrosswordGame({ onComplete, worldLevel, score, onUseHint }: CrosswordGameProps) {
  const [puzzle, setPuzzle] = useState(() => getPuzzleForWorld(worldLevel));
  const [grid, setGrid] = useState<string[][]>([]);
  const [activeRow, setActiveRow] = useState(0);
  const [activeCol, setActiveCol] = useState(0);
  const [completedRows, setCompletedRows] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [flashingCells, setFlashingCells] = useState<{r: number, c: number}[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Select puzzle based on current world level
    const selectedPuzzle = getPuzzleForWorld(worldLevel);
    setPuzzle(selectedPuzzle);
    
    // Initialize empty grid
    const initialGrid = selectedPuzzle.words.map(w => Array(w.answer.length).fill(''));
    setGrid(initialGrid);
    setCompletedRows(Array(selectedPuzzle.words.length).fill(false));
    setActiveRow(0);
    setActiveCol(0);
    setIsComplete(false);
    setFlashingCells([]);
  }, [worldLevel]);

  // Focus hidden input to capture mobile keyboard
  useEffect(() => {
    if (!isComplete) {
      const hiddenInput = document.getElementById('hidden-keyboard-input');
      hiddenInput?.focus();
    }
  }, [activeRow, activeCol, isComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComplete || completedRows[activeRow]) return;

    const key = e.key.toUpperCase();
    const isLetter = /^[A-ZÑ]$/.test(key);

    if (isLetter) {
      const newGrid = grid.map(row => [...row]);
      newGrid[activeRow][activeCol] = key;
      setGrid(newGrid);

      const word = newGrid[activeRow].join('');
      if (word === puzzle.words[activeRow].answer) {
        checkRowCompletion(newGrid, activeRow);
      } else {
        // Move to next cell
        if (activeCol < puzzle.words[activeRow].answer.length - 1) {
          setActiveCol(prev => prev + 1);
        }
      }
    } else if (e.key === 'Backspace') {
      const newGrid = grid.map(row => [...row]);
      if (newGrid[activeRow][activeCol] !== '') {
        newGrid[activeRow][activeCol] = '';
      } else if (activeCol > 0) {
        newGrid[activeRow][activeCol - 1] = '';
        setActiveCol(prev => prev - 1);
      }
      setGrid(newGrid);
    } else if (e.key === 'ArrowLeft' && activeCol > 0) {
      setActiveCol(prev => prev - 1);
    } else if (e.key === 'ArrowRight' && activeCol < puzzle.words[activeRow].answer.length - 1) {
      setActiveCol(prev => prev + 1);
    } else if (e.key === 'ArrowUp' && activeRow > 0) {
      setActiveRow(prev => prev - 1);
      setActiveCol(Math.min(activeCol, puzzle.words[activeRow - 1].answer.length - 1));
    } else if (e.key === 'ArrowDown' && activeRow < puzzle.words.length - 1) {
      setActiveRow(prev => prev + 1);
      setActiveCol(Math.min(activeCol, puzzle.words[activeRow + 1].answer.length - 1));
    }
  };

  const checkRowCompletion = (currentGrid: string[][], rowIdx: number) => {
    const newCompleted = [...completedRows];
    newCompleted[rowIdx] = true;
    setCompletedRows(newCompleted);

    let newGrid = currentGrid.map(row => [...row]);
    let newFlashing: {r: number, c: number}[] = [];

    // Reveal 1 or 2 letters total across all other uncompleted rows
    const availableCells: {r: number, c: number}[] = [];
    puzzle.words.forEach((w, r) => {
      if (!newCompleted[r]) {
        const emptyInRow = [];
        for (let c = 0; c < w.answer.length; c++) {
          if (newGrid[r][c] === '') {
            emptyInRow.push(c);
          }
        }
        // Only consider rows with more than 1 empty cell to prevent auto-completing a word
        if (emptyInRow.length > 1) {
          emptyInRow.forEach(c => availableCells.push({r, c}));
        }
      }
    });

    if (availableCells.length > 0) {
      const numToReveal = Math.min(availableCells.length, Math.floor(Math.random() * 2) + 1);
      const shuffled = availableCells.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numToReveal; i++) {
        const {r, c} = shuffled[i];
        newGrid[r][c] = puzzle.words[r].answer[c];
        newFlashing.push({r, c});
      }
    }

    if (newFlashing.length > 0) {
      setGrid(newGrid);
      setFlashingCells(newFlashing);
      setTimeout(() => setFlashingCells([]), 1500);
    }

    // Check if all rows are completed
    if (newCompleted.every(Boolean)) {
      setIsComplete(true);
      setTimeout(() => onComplete(200), 2000);
    } else {
      // Move to next incomplete row
      const nextIncomplete = newCompleted.findIndex(c => !c);
      if (nextIncomplete !== -1) {
        setActiveRow(nextIncomplete);
        const firstEmptyCol = newGrid[nextIncomplete].findIndex(val => val === '');
        setActiveCol(firstEmptyCol !== -1 ? firstEmptyCol : 0);
      }
    }
  };

  const handleCellClick = (rIdx: number, cIdx: number) => {
    if (!completedRows[rIdx]) {
      setActiveRow(rIdx);
      setActiveCol(cIdx);
      document.getElementById('hidden-keyboard-input')?.focus();
    }
  };

  const handleHintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComplete) return;
    
    // Find first empty or incorrect cell in active row
    let targetCol = -1;
    for (let c = 0; c < puzzle.words[activeRow].answer.length; c++) {
      if (grid[activeRow][c] !== puzzle.words[activeRow].answer[c]) {
        targetCol = c;
        break;
      }
    }
    
    if (targetCol !== -1) {
      if (onUseHint()) {
        const newGrid = grid.map(row => [...row]);
        newGrid[activeRow][targetCol] = puzzle.words[activeRow].answer[targetCol];
        setGrid(newGrid);
        
        setFlashingCells([{r: activeRow, c: targetCol}]);
        setTimeout(() => setFlashingCells([]), 1500);
        
        const word = newGrid[activeRow].join('');
        if (word === puzzle.words[activeRow].answer) {
          checkRowCompletion(newGrid, activeRow);
        } else {
          setActiveCol(Math.min(targetCol + 1, puzzle.words[activeRow].answer.length - 1));
        }
      } else {
        // Not enough points, maybe shake the hint button?
        const hintBtn = document.getElementById('hint-button');
        if (hintBtn) {
          hintBtn.classList.add('animate-shake');
          setTimeout(() => hintBtn.classList.remove('animate-shake'), 500);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-between h-full pt-4 pb-4 relative"
      onClick={() => document.getElementById('hidden-keyboard-input')?.focus()}
    >
      <div className="flex flex-col items-center w-full">
        {/* Hidden input to force keyboard on mobile */}
        <input 
          id="hidden-keyboard-input"
          type="text" 
          className="absolute opacity-0 w-0 h-0" 
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full font-bold mb-4 flex items-center gap-2 shadow-lg transform -rotate-2">
          <HelpCircle size={20} className="drop-shadow-sm text-[#00F5D4]" />
          <span className="drop-shadow-sm text-sm">Tema: {puzzle.theme}</span>
        </div>

        {/* Active Clue Display */}
        <motion.div 
        key={activeRow}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[90%] max-w-[320px] bg-white/10 backdrop-blur-md rounded-[1.5rem] p-4 shadow-lg border border-white/20 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FF477E] to-[#FF0055]"></div>
        <p className="text-base sm:text-lg font-bold text-white text-center leading-relaxed">
          {puzzle.words[activeRow]?.clue}
        </p>
      </motion.div>

      {/* Crossword Grid */}
      <div className="flex flex-col gap-2 items-center w-full px-2" ref={gridRef}>
        {puzzle.words.map((wordObj, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 sm:gap-2 relative">
            {/* Row indicator if active */}
            {activeRow === rIdx && !completedRows[rIdx] && (
              <motion.div layoutId="activeRowIndicator" className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 text-[#FF477E]">
                <Keyboard size={18} className="drop-shadow-sm sm:w-6 sm:h-6" />
              </motion.div>
            )}
            
            {Array.from({ length: wordObj.answer.length }).map((_, cIdx) => {
              const isActive = activeRow === rIdx && activeCol === cIdx;
              const isRowActive = activeRow === rIdx;
              const isCompleted = completedRows[rIdx];
              const isFlashing = flashingCells.some(fc => fc.r === rIdx && fc.c === cIdx);
              const letter = grid[rIdx]?.[cIdx] || '';

              return (
                <motion.div
                  key={`${rIdx}-${cIdx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(rIdx, cIdx);
                  }}
                  animate={
                    isCompleted 
                      ? { scale: [1, 1.1, 1], transition: { delay: cIdx * 0.05 } } 
                      : {}
                  }
                  className={`
                    w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-black rounded-lg sm:rounded-[1rem] cursor-pointer transition-all duration-200 select-none relative
                    ${isCompleted 
                      ? 'bg-gradient-to-b from-[#00F5D4] to-[#00B4D8] text-white shadow-[0_4px_0_#0077B6] border-2 border-[#00F5D4]/50' 
                      : isActive 
                        ? 'bg-gradient-to-b from-[#FF477E] to-[#FF0055] text-white shadow-[0_4px_0_#C1121F] scale-110 z-10 border-2 border-[#FF477E]/50' 
                        : isRowActive
                          ? 'bg-white/20 backdrop-blur-sm border-2 sm:border-4 border-[#FF477E]/50 text-white shadow-[0_4px_0_rgba(255,71,126,0.3)]'
                          : 'bg-white/5 backdrop-blur-sm border-2 sm:border-4 border-white/10 text-white/50 shadow-[0_4px_0_rgba(255,255,255,0.05)] hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_6px_0_rgba(255,255,255,0.1)]'
                    }
                  `}
                >
                  <span className="drop-shadow-sm">{letter}</span>
                  
                  {/* Flash Animation Overlay */}
                  <AnimatePresence>
                    {isFlashing && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-[#FEE440] to-[#F58700] rounded-lg sm:rounded-[1rem] z-20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(254,228,64,0.8)] border-2 border-white"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.15, 1.15, 1] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, times: [0, 0.1, 0.8, 1] }}
                      >
                        <span className="drop-shadow-md">{letter}</span>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0, rotate: -45 }}
                          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], rotate: 45 }}
                          transition={{ duration: 1 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <Sparkles className="text-white w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hint Character at the bottom */}
      {!isComplete && (
        <div className="mt-auto pt-8 flex items-end justify-center w-full">
          <button
            id="hint-button"
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
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-6 flex items-center gap-2 text-white font-black text-lg sm:text-xl bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] px-6 py-4 rounded-[1.5rem] shadow-[0_8px_0_#0077B6,0_10px_20px_rgba(0,0,0,0.3)] border-4 border-white/30"
          >
            <CheckCircle2 size={24} className="drop-shadow-md" />
            <span className="drop-shadow-md">¡Completado! +200 pts</span>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}
