import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Award, Users, Sparkles, ExternalLink, ArrowRight, Trophy } from 'lucide-react';
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
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-[#0a389c] via-[#082b7c] to-[#051c54]">
      {/* Luces y resplandores atmosféricos para máxima luminosidad (estilo referencia oficial) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Halo resplandeciente azul eléctrico */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#2a39d1]/35 rounded-full blur-[120px]"></div>
        {/* Destello verde lima dinámico */}
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] bg-[#A3E229]/20 rounded-full blur-[140px]"></div>
        {/* Resplandor lateral izquierdo */}
        <div className="absolute bottom-10 -left-20 w-[450px] h-[450px] bg-[#00d2ff]/15 rounded-full blur-[130px]"></div>
        {/* Patrón de líneas sutiles de cancha de pádel */}
        <div className="absolute inset-0 bg-padel-grid opacity-25"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grid de 2 Columnas estilo Referencia de Diseño */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* COLUMNA IZQUIERDA: Textos y Títulos de Gran Impacto */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Cinta superior: Cupos Limitados (24 parejas por categoría) */}
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-[#A3E229]/15 border border-[#A3E229]/60 text-[#A3E229] text-xs sm:text-sm font-extrabold tracking-wider uppercase mb-5 shadow-[0_0_25px_rgba(163,226,41,0.25)] backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A3E229] animate-pulse"></span>
              <Sparkles className="w-4 h-4 text-[#A3E229] shrink-0" />
              <span>{config.heroCintillo || 'Cupos Limitados (24 parejas por categoría)'}</span>
            </div>

            {/* Título Principal con Tipografía del Brandbook y la 'O' estilizada como Pelota de Pádel */}
            <div className="font-orbitron font-black tracking-tight uppercase leading-[0.95] mb-5 select-none">
              
              {/* Línea 1: COPA con pelota de pádel en la 'O' */}
              <div className="text-5xl sm:text-7xl md:text-8xl text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex items-center justify-center lg:justify-start gap-1">
                <span>C</span>
                <span className="relative inline-flex items-center justify-center mx-1 my-auto">
                  {/* Pelota de pádel luminosa verde/amarilla */}
                  <span className="w-[0.78em] h-[0.78em] rounded-full bg-gradient-to-tr from-[#86ca15] via-[#A3E229] to-[#d8ff66] shadow-[0_0_30px_rgba(163,226,41,0.85)] border-2 sm:border-[3px] border-white/90 inline-flex items-center justify-center relative overflow-hidden">
                    {/* Costura curva característica de pelota de tenis/pádel */}
                    <span className="absolute inset-0 rounded-full border-t-[2px] border-b-[2px] border-[#071f5c]/50 transform -rotate-45 scale-110"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 absolute top-1 left-1.5 blur-[0.5px]"></span>
                  </span>
                </span>
                <span>PA</span>
              </div>

              {/* Línea 2: NAVIDAD */}
              <div className="text-5xl sm:text-7xl md:text-8xl text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] mt-1">
                NAVIDAD
              </div>

              {/* Línea 3: III EDICIÓN • 2026 */}
              <div className="text-2xl sm:text-4xl md:text-5xl text-[#A3E229] drop-shadow-[0_0_30px_rgba(163,226,41,0.6)] mt-2 font-black tracking-widest">
                III EDICIÓN • 2026
              </div>
            </div>

            {/* Subtítulo oficial con mención a 500 puntos para el ranking FVP */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-blue-100/90 leading-relaxed font-normal mb-7 drop-shadow-sm">
              {config.heroSubtitulo || (
                <>
                  Cierra el año en el torneo de pádel más importante del oriente del país. 
                  Válido por <strong className="text-white font-black underline decoration-[#A3E229] decoration-2 underline-offset-4">500 puntos</strong> para el ranking oficial de la Federación Venezolana de Pádel (FVP).
                </>
              )}
            </p>

            {/* Datos clave del torneo (Barra Compacta Elegante: Fecha / Sede / Inversión) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#082363]/80 border border-blue-400/25 backdrop-blur-md mb-8 max-w-xl mx-auto lg:mx-0 shadow-lg">
              
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

            {/* BOTONES DE LLAMADA A LA ACCIÓN: VERDE CON LETRAS AZULES SEGÚN BRANDBOOK */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
              <a
                href="#formulario"
                className="w-full sm:w-auto px-9 py-4 rounded-full font-orbitron text-base sm:text-lg font-black bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] shadow-[0_0_35px_rgba(163,226,41,0.6)] hover:shadow-[0_0_50px_rgba(163,226,41,0.85)] transition-all transform hover:-translate-y-1 active:translate-y-0 text-center tracking-wider uppercase inline-flex items-center justify-center gap-3 group"
              >
                <span>INSCRIBIR PAREJA</span>
                <ArrowRight className="w-5 h-5 text-[#150D8B] transform group-hover:translate-x-1.5 transition-transform" />
              </a>

              <a
                href="https://app.fvp.com.ve/2danacional/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-full font-bold text-xs sm:text-sm bg-[#082363]/85 hover:bg-[#0b3b95] text-white border border-[#A3E229]/50 hover:border-[#A3E229] transition-all text-center backdrop-blur-md inline-flex items-center justify-center gap-2 group shadow-md"
              >
                <span className="text-[#A3E229] group-hover:text-white transition-colors">Ver ranking FVP</span>
                <ExternalLink className="w-4 h-4 text-[#A3E229] group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

          </div>

          {/* COLUMNA DERECHA: Visual de Alta Gama con Jugadores de Pádel (Inspirado en la Referencia) */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-4 lg:mt-0">
            
            {/* Halo de luz trasera azul zafiro */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2a39d1]/40 via-[#A3E229]/25 to-transparent rounded-3xl blur-2xl transform scale-105"></div>

            {/* Composición de Tarjetas Inclinadas de Jugadores */}
            <div className="relative w-full max-w-md h-[380px] sm:h-[460px] flex items-center justify-center">
              
              {/* Tarjeta 1: Jugador Masculino (Inclinada hacia la izquierda) */}
              <div className="absolute left-2 sm:left-4 top-2 w-[55%] h-[82%] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-2 border-white/20 transform -rotate-6 hover:-rotate-3 transition-transform duration-500 z-10 group">
                <img 
                  src="./assets/jugador_masculino.jpg" 
                  alt="Jugador de pádel La Marina Sport Club" 
                  className="w-full h-full object-cover object-center filter contrast-110 brightness-105 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071f5c]/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3E229]">Categorías Masculino</span>
                  <span className="block text-xs font-black text-white font-orbitron">2da a 7ma Categoría</span>
                </div>
              </div>

              {/* Tarjeta 2: Jugadora Femenina (Inclinada hacia la derecha) */}
              <div className="absolute right-2 sm:right-4 bottom-2 w-[56%] h-[84%] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-[#A3E229]/60 transform rotate-6 hover:rotate-3 transition-transform duration-500 z-20 group">
                <img 
                  src="./assets/jugadora_femenina.jpg" 
                  alt="Jugadora de pádel La Marina Sport Club" 
                  className="w-full h-full object-cover object-center filter contrast-110 brightness-105 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071f5c]/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3E229]">Categorías Femenino</span>
                  <span className="block text-xs font-black text-white font-orbitron">3ra a 7ma & Master</span>
                </div>
              </div>

              {/* BADGE FLOTANTE CENTRAL: 24 PAREJAS POR CATEGORÍA */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-5 py-2.5 rounded-full bg-[#A3E229] text-[#150D8B] font-orbitron font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(163,226,41,0.8)] border-2 border-white/80 flex items-center gap-2 whitespace-nowrap animate-bounce duration-1000">
                <Trophy className="w-4 h-4 text-[#150D8B]" />
                <span>24 PAREJAS POR CATEGORÍA</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
