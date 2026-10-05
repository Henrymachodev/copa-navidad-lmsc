import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Award, Users, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
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
    <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-24">
      {/* Background Graphic con la imagen ganadora compuesta de pádel en opacidad (ambos jugadores superpuestos sin fondo) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="./assets/padel_hero_composite.jpg" 
          alt="Jugadores de pádel Copa Navidad LMSC" 
          className="w-full h-full object-cover object-top sm:object-center opacity-30 md:opacity-35 scale-105 transform filter contrast-125 transition-opacity duration-700"
        />
        {/* Degradados atmosféricos para fusionar con el fondo azul profundo corporativo (#070422 / #0b0736) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070422]/90 via-[#070422]/60 to-[#070422]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070422]/60 to-[#070422]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Eyebrow badge superior / Cinta Verde: 'Cupos Limitados (24 parejas por categoría)' */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#A3E229]/15 border border-[#A3E229]/60 text-[#A3E229] text-xs sm:text-sm font-extrabold tracking-wider uppercase mb-5 shadow-[0_0_25px_rgba(163,226,41,0.25)] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#A3E229] animate-pulse"></span>
          <Sparkles className="w-4 h-4 text-[#A3E229] shrink-0" />
          <span>{config.heroCintillo || 'Cupos Limitados (24 parejas por categoría)'}</span>
        </div>

        {/* Gran Título Persuasivo y Atlético con Máximo Impacto Tipográfico (Orbitron) */}
        <h1 className="font-orbitron text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[1.05] mb-5">
          {(!config.heroTitulo || config.heroTitulo === '¡Inscripciones abiertas!') ? (
            <>
              <span className="text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">¡Inscripciones</span>{' '}
              <span className="text-[#A3E229] drop-shadow-[0_0_40px_rgba(163,226,41,0.55)]">
                abiertas!
              </span>
            </>
          ) : (
            <span className="text-white">
              {config.heroTitulo}
            </span>
          )}
        </h1>

        {/* Cintillo de fechas oficiales */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-[#0b0736]/90 border border-slate-700/80 hover:border-[#A3E229]/40 text-[#f3f4f2] text-xs sm:text-sm font-bold mb-6 shadow-lg backdrop-blur-md transition-all">
          <Calendar className="w-4 h-4 text-[#A3E229] shrink-0" />
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
        <div className="flex justify-center mb-9">
          <a
            href="https://app.fvp.com.ve/2danacional/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#0f0a42]/90 hover:bg-[#150D8B] text-white font-bold text-xs sm:text-sm border border-[#A3E229]/50 hover:border-[#A3E229] shadow-[0_0_20px_rgba(163,226,41,0.2)] hover:scale-105 transition-all duration-300 group"
          >
            <span className="text-[#A3E229] group-hover:text-white transition-colors">Ver ranking actualizado FVP</span>
            <ExternalLink className="w-4 h-4 text-[#A3E229] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* HUD CHIPS / STATS COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10">
          <div className="bg-[#0f0a42]/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-[#A3E229] font-mono">1000</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Ptos Ranking FVP</span>
          </div>

          <div className="bg-[#0f0a42]/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-white font-mono">24</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Máx Parejas / Cat</span>
          </div>

          <div className="bg-[#0f0a42]/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-[#A3E229] font-mono">
              {config.montoInscripcion || '$150'}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Inversión Dupla</span>
          </div>

          <div className="bg-[#0f0a42]/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-white font-mono">FVP1</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Torneo Nacional</span>
          </div>
        </div>

        {/* BOTÓN PRINCIPAL SEGÚN BRANDBOOK: VERDE CON LETRAS AZULES (#A3E229 fondo, #150D8B texto) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <a
            href="#formulario"
            className="w-full sm:w-auto px-10 py-4 sm:py-5 rounded-full font-orbitron text-base sm:text-lg font-black bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] shadow-[0_0_35px_rgba(163,226,41,0.55)] hover:shadow-[0_0_50px_rgba(163,226,41,0.75)] transition-all transform hover:-translate-y-1 active:translate-y-0 text-center tracking-wider uppercase inline-flex items-center justify-center gap-3 group"
          >
            <span>INSCRÍBETE AQUÍ</span>
            <ArrowRight className="w-5 h-5 text-[#150D8B] transform group-hover:translate-x-1.5 transition-transform" />
          </a>
          <a
            href="#jugadores-confirmados"
            className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-full text-sm sm:text-base font-bold bg-[#0f0a42]/90 hover:bg-[#150D8B] text-white border border-slate-700 hover:border-[#A3E229]/60 transition-all text-center backdrop-blur-sm"
          >
            Ver Parejas Confirmadas
          </a>
        </div>

        {/* Tarjetas de Información Rápida (Features) */}
        <div id="detalles" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
          
          <div className="bg-[#0f0a42]/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-[#A3E229]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#A3E229]/15 flex items-center justify-center mb-3 text-[#A3E229]">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Fechas Oficiales</h2>
            <p className="text-slate-400 text-xs mt-1">
              {config.heroFechas || 'Del xx al xx de diciembre'}. Cuadros programados y fase eliminatoria.
            </p>
          </div>

          <div className="bg-[#0f0a42]/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-[#A3E229]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#A3E229]/15 flex items-center justify-center mb-3 text-[#A3E229]">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Sede Oficial</h2>
            <p className="text-slate-400 text-xs mt-1">
              {config.heroSede || 'Canchas de pádel profesionales en La Marina Sport Club (LMSC).'}
            </p>
          </div>

          <div className="bg-[#0f0a42]/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-[#2a39d1]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#2a39d1]/20 flex items-center justify-center mb-3 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Categorías del Torneo</h2>
            <p className="text-slate-400 text-xs mt-1">Masculino (2da a 7ma), Femenino (3ra a 7ma) y Master +45.</p>
          </div>

          <div className="bg-[#0f0a42]/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-[#A3E229]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#A3E229]/15 flex items-center justify-center mb-3 text-[#A3E229]">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-sm">Premios & Ranking</h2>
            <p className="text-slate-400 text-xs mt-1">1000 ptos FVP, trofeos de campeones y subcampeones, welcome pack oficial.</p>
          </div>

        </div>

      </div>
    </section>
  );
}
