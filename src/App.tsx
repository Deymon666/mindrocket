import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  public state: { hasError: boolean, error: Error | null };
  public props: { children: ReactNode };

  constructor(props: { children: ReactNode }) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: 'red', zIndex: 9999, position: 'absolute', top: 0, left: 0, padding: '20px', backgroundColor: 'black', width: '100%', height: '100%'}}>
          <h2>Something went wrong.</h2>
          <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px'}}>{this.state.error?.toString()}</pre>
          <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '10px'}}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { motion, AnimatePresence } from 'motion/react';
import TitleScreen from './components/TitleScreen';
import AuthScreen from './components/AuthScreen';
import NameEntryScreen from './components/NameEntryScreen';
import MainMenu from './components/MainMenu';
import WorldTransition from './components/WorldTransition';
import WorldLevelsScreen from './components/WorldLevelsScreen';
import CrosswordGame from './components/games/CrosswordGame';
import BasicColorGame from './components/games/BasicColorGame';
import AdvancedColorGame from './components/games/AdvancedColorGame';
import CreativePause from './components/games/CreativePause';
import WelcomePopup from './components/WelcomePopup';
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowLeft, X, Download, Apple, Smartphone, Share2, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { getMyAuth, getUserProfile, createUserProfile, saveProgress, logoutUser } from './services/dbService';

export type GameState = 'title' | 'auth' | 'name_entry' | 'welcome' | 'menu' | 'world_levels' | 'playing' | 'transition' | 'game_over';
export type MinigameType = 'crossword' | 'basic_color' | 'advanced_color' | 'creative_pause';

interface Minigame {
  type: MinigameType;
  id: string;
}

// Simple success sound using Web Audio API
const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not supported or blocked');
  }
};

function AppContent() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState('👾');
  const [world, setWorld] = useState(1); // Max unlocked world
  const [activeWorld, setActiveWorld] = useState(1); // World currently being played
  const [selectedWorldForLevels, setSelectedWorldForLevels] = useState(1);
  const [score, setScore] = useState(0);
  const [currentMinigames, setCurrentMinigames] = useState<Minigame[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Soporte de instalación PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    return !isStandalone;
  });
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [showInstallCustomDialog, setShowInstallCustomDialog] = useState(false);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Listen for Authentication state transitions
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const authInstance = getMyAuth();
      unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        setAuthUser(user);
        
        if (user) {
          // Fetch existing user progress/profile
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setPlayerName(profile.name);
            setPlayerAvatar(profile.avatar);
            setScore(profile.score ?? 0);
            setWorld(profile.world ?? 1);
            setActiveWorld(profile.activeWorld ?? profile.world ?? 1);
            
            if (typeof profile.currentGameIndex === 'number' && profile.currentGameIndex > 0) {
              setCurrentGameIndex(profile.currentGameIndex);
              setCurrentMinigames(generateWorld(profile.activeWorld ?? profile.world ?? 1));
            }
            setGameState('menu');
          } else {
            // New user authenticated but profile needs customization (choose avatar and name)
            setGameState('name_entry');
          }
        } else {
          // Logged out
          setPlayerName('');
          setPlayerAvatar('👾');
          setScore(0);
          setWorld(1);
          setActiveWorld(1);
          setCurrentGameIndex(0);
          setGameState('title');
        }
        setIsAuthLoading(false);
      });
    } catch (e) {
      console.error("Auth init error in App:", e);
      setIsAuthLoading(false);
    }

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
      console.log('beforeinstallprompt event detected');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
      console.log('App ya ha sido instalada');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuario eligió instalar PWA: ${outcome}`);
      } catch (err) {
        console.error('Error durante la instalación', err);
      }
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    } else if (isIOS) {
      // Show gorgeous interactive helper overlay for iOS
      setShowIOSHint(true);
    }
  };

  // Generate 5 random minigames for a world
  const generateWorld = (worldLevel: number) => {
    const games: Minigame[] = [];
    const types: MinigameType[] = ['crossword', 'basic_color', 'advanced_color'];
    
    // Add exactly 1 creative pause
    games.push({ type: 'creative_pause', id: `pause-${Date.now()}` });

    // Fill the rest with random games
    while (games.length < 5) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      games.push({ type: randomType, id: `${randomType}-${Date.now()}-${games.length}` });
    }

    // Shuffle
    games.sort(() => Math.random() - 0.5);
    
    // Ensure creative_pause is not the first game
    if (games[0].type === 'creative_pause') {
      const nonPauseIndex = games.findIndex(g => g.type !== 'creative_pause');
      if (nonPauseIndex !== -1) {
        const temp = games[0];
        games[0] = games[nonPauseIndex];
        games[nonPauseIndex] = temp;
      }
    }

    return games;
  };

  const startGame = (selectedWorldId: number) => {
    setActiveWorld(selectedWorldId);
    setCurrentMinigames(generateWorld(selectedWorldId));
    setCurrentGameIndex(0);
    setGameState('playing');
    if (authUser) {
      saveProgress(authUser.uid, { activeWorld: selectedWorldId, currentGameIndex: 0 });
    }
  };

  const handleGameComplete = (pointsEarned: number) => {
    const newScore = score + pointsEarned;
    setScore(newScore);
    
    if (pointsEarned > 0) {
      playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF3366', '#00E5FF', '#FFD500']
      });
    }

    if (currentGameIndex < 4) {
      const nextIndex = currentGameIndex + 1;
      setCurrentGameIndex(nextIndex);
      if (authUser) {
        saveProgress(authUser.uid, { score: newScore, currentGameIndex: nextIndex });
      }
    } else {
      // World complete
      if (activeWorld === world) {
        const nextWorld = world + 1;
        setGameState('transition');
        if (authUser) {
          saveProgress(authUser.uid, { score: newScore, world: nextWorld, activeWorld: nextWorld, currentGameIndex: 0 });
        }
        setTimeout(() => {
          setWorld(nextWorld);
          setGameState('menu'); // Go back to map after transition
        }, 3000); // 3 seconds transition
      } else {
        // Replayed an old world, just go back to menu
        if (authUser) {
          saveProgress(authUser.uid, { score: newScore, currentGameIndex: 0 });
        }
        setGameState('menu');
      }
    }
  };

  const handleUseHint = () => {
    if (score >= 20) {
      const newScore = score - 20;
      setScore(newScore);
      if (authUser) {
        saveProgress(authUser.uid, { score: newScore });
      }
      return true;
    }
    return false;
  };

  const renderCurrentGame = () => {
    const game = currentMinigames[currentGameIndex];
    if (!game) return null;

    const props = {
      onComplete: handleGameComplete,
      worldLevel: activeWorld,
      score: score,
      onUseHint: handleUseHint
    };

    switch (game.type) {
      case 'crossword':
        return <CrosswordGame key={game.id} {...props} />;
      case 'basic_color':
        return <BasicColorGame key={game.id} {...props} />;
      case 'advanced_color':
        return <AdvancedColorGame key={game.id} {...props} />;
      case 'creative_pause':
        return <CreativePause key={game.id} {...props} />;
      default:
        return null;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        {/* Loader Screen */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-sm font-black tracking-widest uppercase">Cargando Órbita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center sm:p-4 md:p-8">
      {/* Mobile App Container */}
      <div className="w-full h-[100dvh] sm:h-[850px] sm:max-w-[400px] bg-[#0B0914] relative overflow-hidden sm:rounded-[3rem] sm:border-[8px] sm:border-gray-800 shadow-2xl flex flex-col">
        {/* Deep Space Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Nebulas */}
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-[var(--color-primary)] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-20%] w-[40rem] h-[40rem] bg-[var(--color-secondary)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60rem] h-[60rem] bg-[#7209B7] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-blob animation-delay-4000"></div>

        {/* Twinkling Stars */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          />
        ))}

        <AnimatePresence mode="wait">
          {gameState === 'title' && (
            <TitleScreen 
              key="title" 
              onStart={() => setGameState('auth')} 
              showInstallBtn={showInstallBtn}
              onInstall={() => setShowInstallCustomDialog(true)}
            />
          )}

          {gameState === 'auth' && (
            <AuthScreen
              key="auth"
              onAuthSuccess={async (user) => {
                setAuthUser(user);
                const profile = await getUserProfile(user.uid);
                if (profile) {
                  setPlayerName(profile.name);
                  setPlayerAvatar(profile.avatar);
                  setScore(profile.score ?? 0);
                  setWorld(profile.world ?? 1);
                  setActiveWorld(profile.activeWorld ?? profile.world ?? 1);
                  if (typeof profile.currentGameIndex === 'number' && profile.currentGameIndex > 0) {
                    setCurrentGameIndex(profile.currentGameIndex);
                    setCurrentMinigames(generateWorld(profile.activeWorld ?? profile.world ?? 1));
                  }
                  setShowWelcomePopup(true);
                  setGameState('welcome');
                } else {
                  setGameState('name_entry');
                }
              }}
              onBack={() => setGameState('title')}
            />
          )}

          {gameState === 'name_entry' && (
            <NameEntryScreen 
              key="name_entry" 
              onComplete={async (name, avatar) => {
                if (!authUser) return;
                const profileData = await createUserProfile(authUser.uid, { name, avatar });
                if (profileData) {
                  setPlayerName(name);
                  setPlayerAvatar(avatar);
                  setShowWelcomePopup(true);
                  setGameState('welcome');
                }
              }}
              onBack={async () => {
                await logoutUser();
                setGameState('auth');
              }}
            />
          )}

          {gameState === 'welcome' && (
            <motion.div key="welcome" className="flex-1" />
          )}

          {gameState === 'menu' && (
            <div className="relative z-10 w-full h-full flex justify-center items-center">
              <MainMenu 
                key="menu" 
                onSelectWorld={(worldId) => {
                  setSelectedWorldForLevels(worldId);
                  setGameState('world_levels');
                }} 
                currentWorld={world} 
                playerName={playerName}
                playerAvatar={playerAvatar}
                score={score}
                onBack={async () => {
                  await logoutUser();
                }}
              />
            </div>
          )}

          {gameState === 'world_levels' && (
            <WorldLevelsScreen
              key="world_levels"
              worldId={selectedWorldForLevels}
              completedLevels={selectedWorldForLevels < world ? 5 : (selectedWorldForLevels === world ? currentGameIndex : 0)}
              onSelectLevel={(levelIndex) => {
                setActiveWorld(selectedWorldForLevels);
                setCurrentMinigames(generateWorld(selectedWorldForLevels));
                setCurrentGameIndex(levelIndex);
                setGameState('playing');
              }}
              onBack={() => setGameState('menu')}
            />
          )}

          {gameState === 'transition' && (
            <WorldTransition key="transition" fromWorld={world} toWorld={world + 1} />
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="w-full flex flex-col h-full bg-transparent overflow-hidden relative z-10"
            >
              {/* Header */}
              <div className="flex flex-col border-b border-white/10 bg-[#453C59] relative z-20">
                <div className="flex items-center justify-between p-3 sm:px-4 sm:py-3 relative">
                  <button 
                    onClick={() => {
                      setSelectedWorldForLevels(activeWorld);
                      setGameState('world_levels');
                    }} 
                    className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors border border-white/20 active:scale-95"
                  >
                    <ArrowLeft size={20} className="text-white" />
                  </button>
                  
                  {/* Center: User Info */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white/20">
                    <span className="text-lg">{playerAvatar}</span>
                    <span className="font-bold text-white text-sm max-w-[100px] truncate">{playerName}</span>
                  </div>

                  {/* Right: Score */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#FFF3B0] to-[#FEE440] px-3 py-1.5 rounded-xl border-b-4 border-[#E5C100] shadow-sm transform rotate-[2deg]">
                    <Sparkles size={16} className="text-[#F58700] fill-[#FEE440] drop-shadow-sm" />
                    <span className="font-black text-base text-[#806000] tracking-tight drop-shadow-sm">{score}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-black/20 px-4 py-2 border-t border-white/5 flex items-center justify-center gap-3">
                  <h2 className="text-[10px] font-black text-white/60 uppercase tracking-widest font-sans">Mundo {activeWorld}</h2>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i < currentGameIndex ? 'w-4 bg-[var(--color-secondary)] shadow-[0_0_8px_rgba(0,245,212,0.6)]' :
                          i === currentGameIndex ? 'w-6 bg-[var(--color-primary)] animate-pulse shadow-[0_0_8px_rgba(255,71,126,0.6)]' :
                          'w-3 bg-white/20 inset-shadow-sm'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Content */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto relative bg-transparent">
                <AnimatePresence mode="wait">
                  {renderCurrentGame()}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <WelcomePopup 
          isOpen={showWelcomePopup} 
          playerName={playerName} 
          onClose={() => {
            setShowWelcomePopup(false);
            if (score === 0) {
              setScore(50);
              if (authUser) {
                saveProgress(authUser.uid, { score: 50 });
              }
            }
            
            if (currentGameIndex > 0) {
              setGameState('playing');
            } else {
              setGameState('menu');
            }
          }} 
        />



        {/* Seamless iOS Safari Custom Installer Overlay */}
        <AnimatePresence>
          {showIOSHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#17122B] border border-white/20 p-6 rounded-3xl w-full max-w-[340px] text-center shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative"
              >
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setShowIOSHint(false)}
                    className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-[#00E5FF]/10 rounded-full border border-[#00E5FF]/20 text-[#00E5FF] mt-2">
                    <Apple size={32} className="animate-pulse" />
                  </div>
                  
                  <h3 className="text-white font-black text-xl tracking-tight uppercase">Instalar MindRocket</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-sans px-2">
                    Instala MindRocket en tu pantalla de inicio siguiendo estos dos toques directos:
                  </p>

                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5 text-left mt-1">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-[#FF477E]/15 border border-[#FF477E]/30 rounded-xl text-[#FF477E]">
                        <Share2 size={16} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase">1. Toca "Compartir"</p>
                        <p className="text-[10px] text-white/50">Pulsa el botón de compartir del Safari de abajo</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00F5D4]/15 border border-[#00F5D4]/30 rounded-xl text-[#00F5D4] font-black text-[12px] w-[28px] h-[28px] flex items-center justify-center">
                        ＋
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase">2. Elige "Agregar a inicio"</p>
                        <p className="text-[10px] text-white/50">¡Y listo! Ya aparecerá como app</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowIOSHint(false)}
                    className="w-full mt-2 py-3 bg-[#00F5D4] text-black font-black uppercase text-xs rounded-full transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,245,212,0.4)] hover:bg-[#00E5FF]"
                  >
                    ¡Entendido, Listo!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom dialog modal based exactly on user screenshot */}
        <AnimatePresence>
          {showInstallCustomDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-[1.5px] flex items-center justify-center p-4 z-50 pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 12 }}
                transition={{ duration: 0.23, ease: "easeOut" }}
                className="bg-[#1b1921] border border-white/[0.08] p-[24px] sm:p-[28px] rounded-[1.75rem] w-full max-w-[440px] shadow-[0_15px_40px_rgba(0,0,0,0.7)] flex flex-col gap-6 text-left"
              >
                <div>
                  <h3 className="text-white font-sans font-semibold text-lg sm:text-xl tracking-tight leading-none">
                    Instalar la app
                  </h3>
                </div>

                <div className="flex items-center gap-[18px]">
                  {/* Square-rounded app icon as seen in screenshot */}
                  <div className="w-[52px] h-[52px] bg-[#221e35] rounded-xl flex items-center justify-center border border-white/[0.08] shadow-md shrink-0 overflow-hidden">
                    <img
                      src="/mindrocket_mascot.png"
                      alt="MindRocket Logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <h4 className="text-white font-sans font-semibold text-sm leading-tight tracking-tight truncate">
                      MindRocket - ¡Aprende diseño jugando!
                    </h4>
                    <p className="text-[#8e8ca2] font-mono text-[11px] leading-none tracking-normal">
                      mindrocket.vercel.app
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3.5 mt-2">
                  <button
                    onClick={async () => {
                      setShowInstallCustomDialog(false);
                      await installApp();
                    }}
                    className="px-[24px] py-[10px] border border-[#48456c] hover:bg-[#48456c]/20 text-[#a5b4fc] rounded-full font-sans font-semibold text-xs sm:text-sm tracking-wide transition-all active:scale-95 cursor-pointer shadow-md select-none"
                  >
                    Instalar
                  </button>
                  <button
                    onClick={() => setShowInstallCustomDialog(false)}
                    className="px-[24px] py-[10px] border border-[#4c4a75]/40 hover:bg-white/5 text-[#8e8ca2] rounded-full font-sans font-semibold text-xs sm:text-sm tracking-wide transition-all active:scale-95 cursor-pointer select-none"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
