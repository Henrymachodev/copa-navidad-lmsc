import React, { useState } from 'react';
import { Lock, X, AlertCircle, KeyRound, User, ShieldCheck } from 'lucide-react';
import { verifyAdminLogin } from '../services/firebase';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Por favor ingresa la contraseña o PIN de acceso.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const auth = await verifyAdminLogin(identifier, pin);
      if (auth.success) {
        setPin('');
        setIdentifier('');
        onLoginSuccess(auth.user);
      } else {
        setError(auth.error || 'PIN o credenciales incorrectas.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al verificar credenciales.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-navy-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-navy-700/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Acceso a Panel de Administración</h3>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de inscripciones, confirmación de parejas, cupos y roles de acceso.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Usuario o Correo (Opcional si usas PIN Maestro)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ingresa tu usuario o correo"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              PIN o Contraseña <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Ingresa tu contraseña o PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-900 text-white border border-slate-700 text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-900 transition-colors shadow-glow-gold flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{verifying ? 'Verificando...' : 'Ingresar al Panel'}</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          Acceso exclusivo y restringido para el comité organizador y administradores autorizados.
        </p>

      </div>
    </div>
  );
}
