import React, { useState, useEffect } from 'react';
import { DollarSign, Smartphone, CreditCard, Landmark, Coins, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { subscribeToLandingConfig, DEFAULT_LANDING_CONFIG } from '../services/firebase';

export default function PaymentInfoSection() {
  const [config, setConfig] = useState(DEFAULT_LANDING_CONFIG);
  const [expandedMethod, setExpandedMethod] = useState(null);

  useEffect(() => {
    const unsub = subscribeToLandingConfig((cfg) => {
      setConfig(cfg);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const paymentMethods = [
    {
      id: 'pago-movil',
      title: 'Pago Móvil',
      subtitle: 'Tasa oficial BCV del día',
      desc: 'Transferencia instantánea en Bolívares a tasa del Banco Central de Venezuela.',
      detail: config.pagoMovilDetalle,
      icon: <Smartphone className="w-6 h-6 text-emerald-400" />,
      badge: 'Tasa BCV'
    },
    {
      id: 'zelle',
      title: 'Zelle',
      subtitle: 'Dólares USD directos',
      desc: 'Envío directo y sin comisiones desde tu cuenta bancaria de EE.UU.',
      detail: config.zelleDetalle,
      icon: <CreditCard className="w-6 h-6 text-purple-400" />,
      badge: 'USD'
    },
    {
      id: 'banesco-panama',
      title: 'Banesco Panamá',
      subtitle: 'Transferencia Internacional / Banesco a Banesco',
      desc: 'Cuenta en USD para transferencias entre clientes Banesco Panamá o ACH.',
      detail: config.banescoPanamaDetalle,
      icon: <Landmark className="w-6 h-6 text-blue-400" />,
      badge: 'Panamá USD'
    },
    {
      id: 'binance',
      title: 'Binance (USDT)',
      subtitle: 'Pay ID / Criptoactivos',
      desc: 'Pago inmediato en USDT mediante Binance Pay sin comisiones de red.',
      detail: config.binancePayDetalle,
      icon: <Coins className="w-6 h-6 text-amber-400" />,
      badge: 'Binance Pay'
    }
  ];

  return (
    <section id="inversion-pagos" className="py-12 sm:py-16 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Card Principal de Inversión */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-gold-500/30 relative overflow-hidden shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-500/30 mb-2">
                <DollarSign className="w-3.5 h-3.5" />
                VALOR OFICIAL DE PARTICIPACIÓN
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Inversión por Pareja
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Incluye derecho a competir, arbitraje oficial, hidratación y kit de bienvenida.
              </p>
            </div>

            {/* Precio destacado */}
            <div className="bg-navy-800/90 border border-gold-500/50 rounded-2xl p-4 sm:p-5 text-center min-w-[200px] shadow-glow-gold">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                Total Pareja
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {config.montoInscripcion || '$150'}
                </span>
                <span className="text-xs text-gold-400 font-bold">USD</span>
              </div>
              <span className="text-[11px] text-emerald-400 block mt-1 font-medium">
                ($75 por jugador)
              </span>
            </div>
          </div>

          {/* MÉTODOS DE PAGO */}
          <div className="mt-8">
            <h3 className="text-sm sm:text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              Métodos de Pago Disponibles:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentMethods.map((m) => {
                const isExpanded = expandedMethod === m.id;
                return (
                  <div 
                    key={m.id}
                    className="bg-navy-950/80 p-5 rounded-2xl border border-slate-700/80 hover:border-[#80e100]/50 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-navy-900 flex items-center justify-center border border-slate-700/80">
                          {m.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-navy-900 text-slate-300 border border-slate-700">
                          {m.badge}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mt-1">
                        {m.title}
                      </h4>
                      <p className="text-xs text-[#80e100] font-semibold mt-0.5">
                        {m.subtitle}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {m.desc}
                      </p>

                      {isExpanded && m.detail && (
                        <div className="mt-3.5 p-3 rounded-xl bg-black border border-[#80e100]/40 text-xs text-white font-mono font-bold whitespace-pre-line leading-relaxed shadow-inner">
                          {m.detail}
                        </div>
                      )}
                    </div>

                    {m.detail && (
                      <button
                        type="button"
                        onClick={() => setExpandedMethod(isExpanded ? null : m.id)}
                        className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center justify-between w-full transition-colors"
                      >
                        <span>{isExpanded ? 'Ocultar datos bancarios' : 'Ver datos bancarios'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 mt-5 text-center sm:text-left">
              * Podrás ingresar el ID o número de comprobante emitido por tu banco/billetera directamente en el formulario de inscripción para agilizar la confirmación.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
