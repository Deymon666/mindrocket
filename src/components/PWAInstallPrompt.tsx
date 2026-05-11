import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[350px]"
      >
        <div className="bg-gradient-to-r from-[#1A1625] to-[#2D243F] border border-white/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF477E] to-[#FF0055] rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <Download className="text-white" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm">Instalar MindRocket</h3>
            <p className="text-white/60 text-xs truncate">Juega sin conexión y más rápido</p>
          </div>
          <div className="flex flex-col gap-2">
             <button 
              onClick={handleInstallClick}
              className="bg-white text-[#FF0055] px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-white/90 transition-colors"
            >
              Instalar
            </button>
             <button 
              onClick={() => setIsVisible(false)}
              className="text-white/40 hover:text-white transition-colors self-end"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
