import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
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
    <section className="relative overflow-hidden pt-4 pb-8 md:pt-6 md:pb-12 bg-gradient-to-b from-[#0a389c] via-[#082b7c] to-[#071f5c]">
      {/* Luces y resplandores atmosféricos para máxima luminosidad */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Halo resplandeciente azul eléctrico */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#2a39d1]/30 rounded-full blur-[120px]"></div>
        {/* Destello verde lima dinámico */}
        <div className="absolute top-1/3 -right-24 w-[450px] h-[450px] bg-[#A3E229]/20 rounded-full blur-[140px]"></div>
        {/* Resplandor lateral izquierdo */}
        <div className="absolute bottom-10 -left-20 w-[400px] h-[400px] bg-[#00d2ff]/15 rounded-full blur-[130px]"></div>
        {/* Patrón de líneas sutiles de cancha de pádel */}
        <div className="absolute inset-0 bg-padel-grid opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grid de 2 Columnas: Textos a la izquierda y Visual de Jugadores a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* COLUMNA IZQUIERDA: Copa Navidad 2026 y Botón Inscríbete Aquí */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Cinta superior: Cupos Limitados (24 parejas por categoría) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A3E229]/15 border border-[#A3E229]/60 text-[#A3E229] text-xs font-extrabold tracking-wider uppercase mb-3 shadow-[0_0_20px_rgba(163,226,41,0.25)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#A3E229] animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5 text-[#A3E229] shrink-0" />
              <span>{config.heroCintillo || 'Cupos Limitados (24 parejas por categoría)'}</span>
            </div>

            {/* Título Principal: COPA NAVIDAD 2026 (con la O normal y tipografía oficial del Brandbook Orbitron) */}
            <div className="font-orbitron font-black tracking-tight uppercase leading-[0.95] mb-4 select-none">
              <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                COPA NAVIDAD
              </div>
              <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#A3E229] drop-shadow-[0_0_35px_rgba(163,226,41,0.6)] mt-1 font-black">
                2026
              </div>
            </div>

            {/* Subtítulo oficial con mención a 500 puntos para el ranking FVP */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg text-blue-100/90 leading-relaxed font-normal mb-5 drop-shadow-sm">
              {config.heroSubtitulo || (
                <>
                  Cierra el año en el torneo de pádel más importante del oriente del país. 
                  Válido por <strong className="text-white font-black underline decoration-[#A3E229] decoration-2 underline-offset-4">500 puntos</strong> para el ranking oficial de la Federación Venezolana de Pádel (FVP).
                </>
              )}
            </p>

            {/* Datos clave del torneo (Barra Compacta Elegante: Fecha / Sede / Inversión) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-3.5 rounded-2xl bg-[#0a389c]/70 border border-blue-400/25 backdrop-blur-md mb-6 max-w-xl mx-auto lg:mx-0 shadow-lg">
              
              <div className="text-center lg:text-left border-r border-blue-400/20 pr-2">
                <span className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider block">Fecha</span>
                <span className="text-xs sm:text-sm font-black text-white font-orbitron block mt-0.5 truncate">
                  {config.heroFechas || '12 al 15 Dic'}
                </span>
              </div>

              <div className="text-center lg:text-left border-r border-blue-400/20 pr-2">
                <span className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider block">Sede</span>
                <span className="text-xs sm:text-sm font-black text-[#A3E229] font-orbitron block mt-0.5 truncate">
                  La Marina SC
                </span>
              </div>

              <div className="text-center lg:text-left pl-1">
                <span className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider block">Inversión</span>
                <span className="text-xs sm:text-sm font-black text-white font-orbitron block mt-0.5">
                  $150 / dupla
                </span>
              </div>

            </div>

            {/* BOTONES DE ACCIÓN: "INSCRÍBETE AQUÍ" (VERDE CON LETRAS AZULES) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mb-2">
              <a
                href="#formulario"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-orbitron text-base sm:text-lg font-black bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] shadow-[0_0_35px_rgba(163,226,41,0.6)] hover:shadow-[0_0_50px_rgba(163,226,41,0.85)] transition-all transform hover:-translate-y-1 active:translate-y-0 text-center tracking-wider uppercase inline-flex items-center justify-center gap-3 group"
              >
                <span>INSCRÍBETE AQUÍ</span>
                <ArrowRight className="w-5 h-5 text-[#150D8B] transform group-hover:translate-x-1.5 transition-transform" />
              </a>

              <a
                href="https://app.fvp.com.ve/2danacional/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm bg-[#0a389c]/80 hover:bg-[#0b3b95] text-white border border-[#A3E229]/50 hover:border-[#A3E229] transition-all text-center backdrop-blur-md inline-flex items-center justify-center gap-2 group shadow-md"
              >
                <span className="text-[#A3E229] group-hover:text-white transition-colors">Ver ranking FVP</span>
                <ExternalLink className="w-4 h-4 text-[#A3E229] group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

          </div>

          {/* COLUMNA DERECHA: Presentación Atractiva y Moderna de las Fotos de Pádel */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-4 lg:mt-0">
            
            {/* Halo de luz trasera en degradado */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2a39d1]/45 via-[#A3E229]/25 to-transparent rounded-[3rem] blur-2xl transform scale-105 pointer-events-none"></div>

            {/* Showcase Visual Dual: Dos Cápsulas Atléticas Elegantes */}
            <div className="relative w-full max-w-lg grid grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-[2.5rem] bg-[#0a389c]/50 border border-blue-400/30 backdrop-blur-xl shadow-2xl">
              
              {/* Cápsula 1: Jugador Masculino (2da a 7ma y Master +45) */}
              <div className="relative group rounded-[2rem] overflow-hidden border-2 border-blue-400/40 shadow-lg bg-[#071f5c] h-[320px] sm:h-[370px]">
                <img 
                  src="./assets/jugador_masculino.jpg" 
                  alt="Jugador de pádel La Marina Sport Club" 
                  className="w-full h-full object-cover object-center filter contrast-110 brightness-105 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071f5c] via-[#071f5c]/30 to-transparent"></div>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0a389c]/90 border border-blue-400/40 backdrop-blur-md">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">Masculino</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#A3E229] block leading-tight">
                    2da a 7ma y Master +45
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white font-orbitron block leading-tight mt-0.5">
                    Categorías Oficiales
                  </span>
                </div>
              </div>

              {/* Cápsula 2: Jugadora Femenina (3ra a 7ma) */}
              <div className="relative group rounded-[2rem] overflow-hidden border-2 border-[#A3E229]/60 shadow-lg bg-[#071f5c] h-[320px] sm:h-[370px]">
                <img 
                  src="./assets/jugadora_femenina.jpg" 
                  alt="Jugadora de pádel La Marina Sport Club" 
                  className="w-full h-full object-cover object-center filter contrast-110 brightness-105 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071f5c] via-[#071f5c]/30 to-transparent"></div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#A3E229] text-[#150D8B] font-bold">
                  <span className="text-[10px] font-black uppercase tracking-wider">Femenino</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#A3E229] block leading-tight">
                    3ra a 7ma
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white font-orbitron block leading-tight mt-0.5">
                    Cuadro Femenino
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
