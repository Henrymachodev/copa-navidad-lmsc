import React from 'react';
import { CheckCircle2, Trophy, Mail, Phone, Calendar, Download, X, Sparkles } from 'lucide-react';

export default function ConfirmationModal({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-navy-800 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-gold-500/10 my-8">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-navy-700/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado festivo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 mx-auto flex items-center justify-center text-white shadow-lg mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            ¡INSCRIPCIÓN REGISTRADA!
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            ¡Nos vemos en la pista!
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            Tu pareja ha quedado formalmente registrada en la <strong>Copa Navidad LMSC 2026</strong>.
          </p>
        </div>

        {/* Ficha Resumen */}
        <div className="bg-navy-900/80 rounded-2xl p-5 border border-slate-700/80 space-y-4 mb-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Categoría</span>
              <span className="text-sm font-bold text-gold-300">
                {data.categoria}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Inversión & Pago</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {data.monto || '$150'} • {data.metodoPago || 'Por confirmar'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Jugador 1 */}
            <div className="bg-navy-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-gold-400 font-bold block mb-1">Jugador 1</span>
              <p className="text-white font-semibold text-sm">
                {data.jugador1?.nombre} {data.jugador1?.apellido || ''}
              </p>
              {data.jugador1?.cedula && (
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                  CI: {data.jugador1.cedula} {data.jugador1.tallaFranela && `• Talla: ${data.jugador1.tallaFranela}`}
                </p>
              )}
              <p className="text-slate-300 truncate mt-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                {data.jugador1?.email}
              </p>
              <p className="text-slate-300 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                {data.jugador1?.telefono}
              </p>
            </div>

            {/* Jugador 2 */}
            <div className="bg-navy-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-gold-400 font-bold block mb-1">Jugador 2</span>
              <p className="text-white font-semibold text-sm">
                {data.jugador2?.nombre} {data.jugador2?.apellido || ''}
              </p>
              {data.jugador2?.cedula && (
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                  CI: {data.jugador2.cedula} {data.jugador2.tallaFranela && `• Talla: ${data.jugador2.tallaFranela}`}
                </p>
              )}
              <p className="text-slate-300 truncate mt-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                {data.jugador2?.email}
              </p>
              <p className="text-slate-300 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                {data.jugador2?.telefono}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
            <span>Folio / ID: <code className="text-slate-300 font-mono">{data.id?.substring(0, 10)}...</code></span>
            <span>Estado: <span className="text-emerald-400 font-semibold">Guardado en el sistema</span></span>
          </div>

        </div>

        {/* Aviso de correo */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-center gap-2 mb-6">
          <Mail className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Hemos despachado la confirmación a los correos electrónicos registrados y al equipo organizador.</span>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-900 transition-colors shadow-glow-gold"
          >
            Aceptar y Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl text-sm font-semibold bg-navy-700 hover:bg-navy-600 text-white border border-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Imprimir Comprobante
          </button>
        </div>

      </div>
    </div>
  );
}
