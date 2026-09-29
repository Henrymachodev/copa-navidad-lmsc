import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Award, Users, ChevronDown, Sparkles, ExternalLink } from 'lucide-react';
import { subscribeToLandingConfig, DEFAULT_LANDING_CONFIG } from '../services/firebase';

export default function Hero() {
  const [config, setConfig] = useState(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    const unsubscribe = subscribeToLandingConfig((newConfig) => {
      setConfig(newConfig);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-28">
      {/* Background Graphic con overlay y blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/Gemini_Generated_Image_o0g9kvo0g9kvo0g9.jpg" 
          alt="Torneo Copa Navidad LMSC" 
          className="w-full h-full object-cover object-center opacity-20 scale-105 transform filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-900/95 to-navy-900"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Eyebrow badge superior / Cinta Verde: 'Cupos Limitados (24 parejas por categoría)' */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#80e100]/10 border border-[#80e100]/50 text-[#80e100] text-xs sm:text-sm font-extrabold tracking-wider uppercase mb-6 shadow-[0_0_25px_rgba(128,225,0,0.22)] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#80e100] animate-pulse"></span>
          <Sparkles className="w-4 h-4 text-[#80e100] shrink-0" />
          <span>{config.heroCintillo || 'Cupos Limitados (24 parejas por categoría)'}</span>
        </div>

        {/* Gran Título Persuasivo y Atlético con Máximo Impacto Tipográfico estilo Vellora Padel */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[1.05] mb-5">
          {(!config.heroTitulo || config.heroTitulo === '¡Inscripciones abiertas!') ? (
            <>
              <span className="text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">¡Inscripciones</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80e100] via-[#a6f728] to-[#80e100] drop-shadow-[0_0_40px_rgba(128,225,0,0.45)]">
                abiertas!
              </span>
            </>
          ) : (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#80e100]">
              {config.heroTitulo}
            </span>
          )}
        </h1>

        {/* Cintillo de fechas oficiales limpio, equilibrado y destacado */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-navy-950/80 border border-slate-700/80 hover:border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold mb-7 shadow-lg backdrop-blur-md transition-all">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="tracking-widest uppercase">
            {config.heroFechas || 'del xx al xx de diciembre'}
          </span>
        </div>

        {/* Subtítulo persuasivo conectado con la configuración dinámica */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-normal mb-8">
          {config.heroSubtitulo || (
            <>
              Cierra el año compitiendo en el evento de pádel más importante del oriente del país. 
              Válido por <strong className="text-white font-bold">1000 puntos para el ranking oficial de la Federación Venezolana de Pádel (FVP)</strong>. 
              Reúne a tu dupla y asegura tu cupo en la grilla oficial.
            </>
          )}
        </p>

        {/* BOTÓN CENTRADO: VER RANKING ACTUALIZADO FVP */}
        <div className="flex justify-center mb-10">
          <a
            href="https://app.fvp.com.ve/2danacional/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-navy-800/90 hover:bg-navy-700 text-white font-bold text-xs sm:text-sm border border-[#80e100]/50 hover:border-[#80e100] shadow-[0_0_20px_rgba(128,225,0,0.18)] hover:scale-105 transition-all duration-300 group"
          >
            <span className="text-[#80e100] group-hover:text-white transition-colors">Ver ranking actualizado FVP</span>
            <ExternalLink className="w-4 h-4 text-[#80e100] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* HUD CHIPS / STATS COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10">
          <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-[#80e100] font-mono">1000</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Ptos Ranking FVP</span>
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-white font-mono">24</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Máx Parejas / Cat</span>
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-gold-400 font-mono">
              {config.montoInscripcion || '$150'}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Inversión Dupla</span>
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-white font-mono">FVP1</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Torneo Nacional</span>
          </div>
        </div>

        {/* Acciones principales inspiradas en Vellora Padel */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#formulario"
            className="w-full sm:w-auto px-9 py-4 rounded-full text-sm sm:text-base font-black bg-[#80e100] hover:bg-[#90f00a] text-navy-950 shadow-[0_0_30px_rgba(128,225,0,0.4)] hover:shadow-[0_0_40px_rgba(128,225,0,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center tracking-wider uppercase inline-flex items-center justify-center gap-2 group"
          >
            <span>Inscribir Mi Pareja Ahora</span>
            <span className="transform group-hover:translate-x-1 transition-transform font-bold text-lg leading-none">→</span>
          </a>
          <a
            href="#jugadores-confirmados"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-sm sm:text-base font-bold bg-navy-800/90 hover:bg-navy-700/90 text-white border border-slate-700 hover:border-slate-500 transition-all text-center backdrop-blur-sm"
          >
            Ver Parejas Confirmadas
          </a>
        </div>

        {/* Tarjetas de Información Rápida (Features) */}
        <div id="detalles" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
          
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-gold-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-3 text-gold-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Fechas Oficiales</h2>
            <p className="text-slate-400 text-xs mt-1">
              {config.heroFechas || 'Del xx al xx de diciembre'}. Cuadros programados y fase eliminatoria.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-[#80e100]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#80e100]/10 flex items-center justify-center mb-3 text-[#80e100]">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Sede Oficial</h2>
            <p className="text-slate-400 text-xs mt-1">
              {config.heroSede || 'Canchas de pádel profesionales en La Marina Sport Club (LMSC).'}
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Categorías del Torneo</h2>
            <p className="text-slate-400 text-xs mt-1">Masculino (2da a 7ma), Femenino (3ra a 7ma) y Master +45.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Premios & Ranking</h2>
            <p className="text-slate-400 text-xs mt-1">1000 ptos FVP, trofeos de campeones y subcampeones, welcome pack oficial.</p>
          </div>

        </div>

      </div>

      <div className="flex justify-center mt-12">
        <a 
          href="#inversion-pagos" 
          aria-label="Ir a información de pagos"
          className="text-slate-500 hover:text-[#80e100] transition-colors animate-bounce p-2"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
}
