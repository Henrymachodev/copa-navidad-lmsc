import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, ArrowRight, Trophy } from 'lucide-react';
import { subscribeToLandingConfig, DEFAULT_LANDING_CONFIG, DEFAULT_HERO_FOTOS } from '../services/firebase';
import HeroMontage from './HeroMontage';

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
            
            {/* Cinta superior: Cupos Limitados */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A3E229]/15 border border-[#A3E229]/60 text-[#A3E229] text-xs font-extrabold tracking-wider uppercase mb-3 shadow-[0_0_20px_rgba(163,226,41,0.25)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#A3E229] animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5 text-[#A3E229] shrink-0" />
              <span>{config.heroCintillo || 'Cupos Limitados'}</span>
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

            {/* Subtítulo oficial del torneo */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg text-blue-100/90 leading-relaxed font-normal mb-5 drop-shadow-sm">
              {config.heroSubtitulo || (
                'Cierra el año con el mejor nivel competitivo en una experiencia diseñada para que el atleta sea el absoluto protagonista. Prepárate para vivir la máxima emoción del pádel en un torneo oficial de 500 puntos para el ranking FVP. ¡Reúne a tu dupla, asegura tu cupo en el cuadro de juego y sé parte de la gran fiesta de cierre de temporada en casa!'
              )}
            </p>

            {/* Datos clave del torneo: Fecha / Sede (Lechería claro) / Inversión (2 juegos garantizados) / Premios en Metálico */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a389c]/80 border border-blue-400/30 backdrop-blur-md mb-6 max-w-xl mx-auto lg:mx-0 shadow-xl">
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-start text-center lg:text-left">
                
                {/* FECHA */}
                <div className="border-r border-blue-400/25 pr-1.5 sm:pr-3">
                  <span className="text-[10px] font-extrabold text-blue-200/90 uppercase tracking-wider block font-orbitron">
                    Fecha
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white font-orbitron block mt-1 leading-tight">
                    7 al 12 Dic
                  </span>
                  <span className="text-[10px] text-blue-200/80 font-medium block mt-0.5">
                    Diciembre 2026
                  </span>
                </div>

                {/* SEDE (Lechería claro y visible en móvil y desktop sin truncamiento) */}
                <div className="border-r border-blue-400/25 pr-1.5 sm:pr-3">
                  <span className="text-[10px] font-extrabold text-blue-200/90 uppercase tracking-wider block font-orbitron">
                    Sede
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#A3E229] font-orbitron block mt-1 leading-tight">
                    La Marina SC
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-white font-orbitron block mt-0.5 leading-tight">
                    Lechería
                  </span>
                </div>

                {/* INVERSIÓN (2 juegos garantizados) */}
                <div className="pl-1 sm:pl-2">
                  <span className="text-[10px] font-extrabold text-blue-200/90 uppercase tracking-wider block font-orbitron">
                    Inversión
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white font-orbitron block mt-1 leading-tight">
                    {config.heroInversion || '$170 / pareja'}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#A3E229] block mt-0.5 leading-tight">
                    ({config.heroJuegosGarantizados || '2 juegos garantizados'})
                  </span>
                </div>

              </div>

              {/* CINTILLO / BADGE: PREMIOS EN METÁLICO & TROFEOS OFICIALES */}
              <div className="mt-3 pt-2.5 border-t border-blue-400/20 flex flex-wrap items-center justify-center lg:justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3E229]/20 border border-[#A3E229]/60 text-white text-[11px] sm:text-xs font-black font-orbitron tracking-wide shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-[#A3E229] shrink-0" />
                  <span>PREMIOS EN METÁLICO & TROFEOS</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-blue-200/90 font-bold hidden sm:inline font-orbitron">
                  Torneo Estadal 500 pts FVP
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

          {/* COLUMNA DERECHA: Presentación Ganadora de Jugadores (Montaje Flyer vs Cuadrícula 4 Fotos) */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-4 lg:mt-0">
            {config.heroVisualMode === 'grid' ? (
              /* MODO CUADRÍCULA CLÁSICA (4 Tarjetas de Fotos por Categoría) */
              <>
                {/* Halo de luz trasera en degradado */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2a39d1]/45 via-[#A3E229]/25 to-transparent rounded-[3rem] blur-2xl transform scale-105 pointer-events-none"></div>

                {/* Showcase Visual Cuádruple: 4 Cápsulas Atléticas Optimizadas */}
                <div className="relative w-full max-w-lg grid grid-cols-2 gap-3 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-[2.5rem] bg-[#0a389c]/50 border border-blue-400/30 backdrop-blur-xl shadow-2xl">
                  {(config.heroFotos && config.heroFotos.length === 4 ? config.heroFotos : DEFAULT_HERO_FOTOS).map((foto, idx) => {
                    const isEven = idx % 2 === 0;
                    const badgePos = isEven ? 'left-2.5' : 'right-2.5';
                    const badgeStyle = idx >= 2 
                      ? 'bg-[#A3E229] text-[#150D8B] font-bold shadow-sm' 
                      : idx === 1 
                        ? 'bg-[#082363]/90 border border-[#A3E229]/50 text-[#A3E229] backdrop-blur-md shadow-sm'
                        : 'bg-[#0a389c]/90 border border-blue-400/40 text-blue-200 backdrop-blur-md shadow-sm';
                    const borderStyle = idx >= 2 ? 'border-[#A3E229]/60' : 'border-blue-400/40';

                    return (
                      <div 
                        key={foto.id || idx} 
                        className={`relative group rounded-2xl overflow-hidden border ${borderStyle} shadow-md bg-[#071f5c] h-[205px] sm:h-[245px] md:h-[265px]`}
                      >
                        <img 
                          src={foto.imagen} 
                          alt={`Categoría ${foto.badge || ''} ${foto.categoria || ''} La Marina Sport Club`} 
                          style={{ objectPosition: foto.objectPosition || 'center 20%' }}
                          className="w-full h-full object-cover filter contrast-105 brightness-105 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071f5c] via-[#071f5c]/75 to-transparent"></div>
                        <div className={`absolute top-2.5 ${badgePos} px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{foto.badge}</span>
                        </div>
                        <div className="absolute bottom-2.5 left-3 right-2.5 text-left">
                          <span className="text-xs sm:text-sm font-black font-orbitron uppercase tracking-wider text-[#A3E229] block leading-tight drop-shadow-md">
                            {foto.categoria}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* MODO MONTAJE DEPORTIVO SUPERPUESTO (Estilo Flyer de Campeonato) */
              <HeroMontage montageFotos={config.heroMontageFotos} />
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
