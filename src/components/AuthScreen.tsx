import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { loginWithEmail, signUpWithEmail, loginWithGoogle } from '../services/dbService';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => Promise<void> | void;
  onBack: () => void;
  key?: string;
}

export default function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cleanErrorMessage = (error: any) => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada.';
      case 'auth/user-not-found':
        return 'No se encontró ninguna cuenta con este correo.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de inicio de sesión de Google antes de completarse.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente de Google. Activa los permisos de popups o abre este juego en una pestaña nueva desde la esquina superior derecha.';
      case 'auth/cancelled-popup-request':
        return 'La solicitud de inicio de sesión con Google fue cancelada o reintentada.';
      case 'auth/network-request-failed':
        return 'Error de red. Revisa tu conexión a internet e inténtalo de nuevo.';
      default:
        return error?.message || 'Ocurrió un error inesperado al intentar iniciar sesión.';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await loginWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password);
      }
      if (user) {
        await onAuthSuccess(user);
      }
    } catch (err: any) {
      setErrorMsg(cleanErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        await onAuthSuccess(user);
      }
    } catch (err: any) {
      setErrorMsg(cleanErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-start w-full h-full relative p-6 z-20 pt-10"
    >
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-white/80 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex flex-col items-center mt-12 w-full max-w-sm">
        {/* Title / Logo */}
        <div className="flex flex-col items-center mb-4">
          <img 
            src="/mindrocket_mascot.png" 
            alt="MindRocket Mascot" 
            className="w-36 h-36 object-contain mb-2 drop-shadow-[0_0_20px_rgba(0,245,212,0.4)]"
            referrerPolicy="no-referrer"
          />
          <p className="text-xs text-white/60 uppercase tracking-widest font-black mt-1">Órbita de Autenticación</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex w-full bg-black/35 rounded-2xl p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              isLogin 
                ? 'bg-gradient-to-r from-[#00F5D4]/20 to-[#00B4D8]/20 text-[#00F5D4] border border-[#00F5D4]/30' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              !isLogin 
                ? 'bg-gradient-to-r from-[#00F5D4]/20 to-[#00B4D8]/20 text-[#00F5D4] border border-[#00F5D4]/30' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-xs font-black uppercase tracking-widest pl-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-[#00F5D4] transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-xs font-black uppercase tracking-widest pl-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-[#00F5D4] transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {errorMsg && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-red-400 text-xs font-semibold text-center mt-1 px-2"
            >
              ⚠️ {errorMsg}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className={`w-full py-3.5 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 border border-white/10 mt-2
              ${isLoading 
                ? 'bg-gray-700/50 text-white/40 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] text-white active:translate-y-[2px] cursor-pointer'
              }`}
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLoading ? 'Conectando...' : (isLogin ? 'Ingresar a la Nave' : 'Crear mi Pasaporte')}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-6">
          <div className="flex-1 h-[1px] bg-white/10"></div>
          <span className="text-xs text-white/40 px-3 font-bold uppercase tracking-wider">O</span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>

        {/* Google Sign In Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full bg-white text-gray-900 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 border border-gray-200 cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-6.16-4.53z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.82 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Iniciar sesión con Google
        </motion.button>
      </div>
    </motion.div>
  );
}
