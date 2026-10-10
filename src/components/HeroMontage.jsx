import React from 'react';
import { Trophy, Zap, Shield, Sparkles } from 'lucide-react';

export default function HeroMontage({ posterImage }) {
  const imageSrc = posterImage || './assets/hero_poster_championship.jpg';

  return (
    <div className="relative w-full max-w-[500px] mx-auto select-none group">
      
      {/* Resplandor atmosférico multicapa trasero */}
      <div className="absolute -inset-3 bg-gradient-to-tr from-[#2a39d1]/45 via-[#A3E229]/30 to-[#00d2ff]/25 rounded-[3rem] blur-2xl opacity-90 pointer-events-none transform -rotate-1 group-hover:scale-105 transition-transform duration-700"></div>

      {/* CONTENEDOR PRINCIPAL DEL PÓSTER DE CAMPEONATO */}
      <div className="relative w-full h-[540px] sm:h-[600px] md:h-[640px] rounded-[2.5rem] bg-gradient-to-b from-[#0a2775] via-[#071b52] to-[#040e2d] border-2 border-blue-400/40 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(163,226,41,0.25)]">
        
        {/* IMAGEN OFICIAL DEL PÓSTER DEPORTIVO CON ESTILO GANADOR */}
        <img 
          src={imageSrc} 
          alt="Copa Navidad La Marina Sport Club - Torneo Oficial 500 Puntos FVP" 
          className="w-full h-full object-cover object-center filter contrast-105 brightness-105 transform group-hover:scale-[1.02] transition-transform duration-700"
        />

        {/* Viñeta sutil en bordes para integración perfecta con el Hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040e2d] via-transparent to-transparent opacity-70 pointer-events-none"></div>
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#071f5c]/70 via-transparent to-transparent pointer-events-none"></div>

        {/* BADGE SUPERIOR FLOTANTE DE CAMPEONATO */}
        <div className="absolute top-3.5 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071f5c]/90 border border-[#A3E229]/60 shadow-[0_0_15px_rgba(163,226,41,0.35)] backdrop-blur-md">
            <Trophy className="w-3.5 h-3.5 text-[#A3E229]" />
            <span className="text-[10px] sm:text-[11px] font-black font-orbitron text-white tracking-wider uppercase">
              COPA NAVIDAD LMSC
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A3E229] text-[#150D8B] font-black font-orbitron text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md">
            <Zap className="w-3 h-3 text-[#150D8B]" />
            <span>500 PTS FVP</span>
          </div>
        </div>

        {/* DESTELLOS DE LUZ FLOTANTES NEÓN */}
        <div className="absolute top-1/4 left-5 w-2 h-2 rounded-full bg-[#A3E229] shadow-[0_0_8px_#A3E229] animate-pulse pointer-events-none"></div>
        <div className="absolute top-1/2 right-6 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00d2ff] animate-ping pointer-events-none"></div>

        {/* PLACA INFERIOR ESTILO FLYER DEPORTIVO (CHAMPIONS PODIUM) */}
        <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#071f5c]/95 border border-[#A3E229]/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(163,226,41,0.25)] flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#A3E229] text-[#150D8B] flex items-center justify-center font-black shadow-md shrink-0">
                <Shield className="w-4 h-4 text-[#150D8B]" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-black font-orbitron text-white block leading-tight tracking-wide">
                  EXPERIENCIA DE CAMPEONATO
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#A3E229] font-bold block leading-tight">
                  La Marina Sport Club • Lechería
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] sm:text-[11px] font-black font-orbitron text-[#A3E229] bg-[#A3E229]/15 border border-[#A3E229]/50 px-2 py-0.5 rounded-md inline-block shadow-sm">
                2 JUEGOS GARANTIZADOS
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
