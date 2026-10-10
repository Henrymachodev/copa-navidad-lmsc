import React from 'react';
import { Trophy, Zap, Shield, Sparkles } from 'lucide-react';

export default function HeroMontage({ montageFotos }) {
  // Fotos predeterminadas oficiales de La Marina Sport Club
  const fotos = {
    smash: montageFotos?.smash || './assets/hero_player_smash.jpg',
    volley: montageFotos?.volley || './assets/hero_player_volley.jpg',
    defense: montageFotos?.defense || './assets/hero_player_defense.jpg',
    celebration: montageFotos?.celebration || './assets/hero_player_celebration.jpg'
  };

  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      
      {/* Resplandor atmosférico trasero multicapa */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#2a39d1]/40 via-[#A3E229]/25 to-[#00d2ff]/20 rounded-[3rem] blur-2xl opacity-80 pointer-events-none transform -rotate-1"></div>

      {/* CONTENEDOR PRINCIPAL TIPO POSTER DE CAMPEONATO */}
      <div className="relative w-full h-[520px] sm:h-[580px] md:h-[620px] rounded-[2.5rem] bg-gradient-to-b from-[#0a2775] via-[#071b52] to-[#040e2d] border-2 border-blue-400/30 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(163,226,41,0.25)]">
        
        {/* TEXTURA DE FONDO: Cuadrícula y Líneas de Cancha Deportiva */}
        <div className="absolute inset-0 bg-padel-grid opacity-25 pointer-events-none"></div>

        {/* FOCOS DE ESTADIO (Stadium Floodlights) */}
        <div className="absolute top-0 left-8 w-44 h-44 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-6 w-52 h-52 bg-[#A3E229]/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 h-44 bg-[#2a39d1]/35 rounded-full blur-2xl pointer-events-none"></div>

        {/* RAYOS DIAGONALES DE VELOCIDAD (Speed Beams) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-10 -left-10 w-96 h-2 bg-gradient-to-r from-transparent via-[#A3E229] to-transparent transform -rotate-45 blur-[1px]"></div>
          <div className="absolute top-1/4 -right-10 w-96 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -rotate-45 blur-[1px]"></div>
          <div className="absolute top-1/2 -left-20 w-[500px] h-3 bg-gradient-to-r from-transparent via-[#2a39d1] to-transparent transform -rotate-45 blur-[2px]"></div>
        </div>

        {/* BADGE SUPERIOR DE CAMPEONATO */}
        <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
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

        {/* ========================================================================= */}
        {/* CAPA 1 (ARRIBA - CENTRO/DERECHA): SMASH BULLPADEL (Máximo Dinamismo Aéreo) */}
        {/* ========================================================================= */}
        <div 
          className="absolute top-7 right-[-4%] sm:right-0 w-[72%] sm:w-[68%] h-[56%] z-10 transition-transform duration-700 hover:scale-[1.02]"
          style={{
            clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 0% 100%)',
          }}
        >
          {/* Contenedor de la foto con borde e iluminación */}
          <div className="relative w-full h-full border border-blue-400/40 bg-[#071f5c]">
            <img 
              src={fotos.smash} 
              alt="Smash de pádel La Marina Sport Club" 
              className="w-full h-full object-cover object-[center_15%] filter contrast-110 brightness-105"
            />
            {/* Degradados de fusión para integrar los bordes en el azul del póster */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071b52] via-transparent to-transparent opacity-85"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#071b52] via-transparent to-[#071b52]/40 opacity-75"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a2775]/50 via-transparent to-transparent"></div>

            {/* Borde de energía en verde lima */}
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#A3E229] to-[#A3E229]/80"></div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CAPA 2 (IZQUIERDA - MEDIA): DEFENSA EN PISTA AZUL (Postura y Tensión)     */}
        {/* ========================================================================= */}
        <div 
          className="absolute top-[24%] left-[-4%] sm:left-0 w-[60%] sm:w-[58%] h-[50%] z-20 transition-transform duration-700 hover:scale-[1.02]"
          style={{
            clipPath: 'polygon(0% 0%, 94% 8%, 100% 100%, 0% 92%)',
          }}
        >
          <div className="relative w-full h-full border-r-2 border-b border-[#A3E229]/60 bg-[#071f5c] shadow-2xl">
            <img 
              src={fotos.defense} 
              alt="Defensa atlética en pista La Marina Sport Club" 
              className="w-full h-full object-cover object-[center_30%] filter contrast-110 brightness-100"
            />
            {/* Gradientes de fusión */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#071b52]/90"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#071b52] via-transparent to-transparent opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#071b52]/80 via-transparent to-transparent opacity-60"></div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CAPA 3 (DERECHA - MEDIA): VOLEA ZUSSET (Enfoque, Mirada y Preparación)   */}
        {/* ========================================================================= */}
        <div 
          className="absolute top-[34%] right-[-2%] sm:right-1 w-[56%] sm:w-[54%] h-[48%] z-25 transition-transform duration-700 hover:scale-[1.02]"
          style={{
            clipPath: 'polygon(8% 0%, 100% 6%, 92% 100%, 0% 90%)',
          }}
        >
          <div className="relative w-full h-full border-l-2 border-[#00d2ff]/70 border-t border-[#A3E229]/50 bg-[#071f5c] shadow-2xl">
            <img 
              src={fotos.volley} 
              alt="Volea de revés de pádel Zusset La Marina Sport Club" 
              className="w-full h-full object-cover object-[center_25%] filter contrast-110 brightness-105"
            />
            {/* Gradientes de fusión */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#071b52]/90"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#071b52] via-transparent to-transparent opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#071b52]/70 via-transparent to-transparent opacity-60"></div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CAPA 4 (FRONTAL INFERIOR): CELEBRACIÓN DE DUPLA (El Abrazo Triunfal)      */}
        {/* ========================================================================= */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[86%] sm:w-[82%] h-[46%] z-30 transition-transform duration-700 hover:scale-[1.02]"
          style={{
            clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)',
          }}
        >
          <div className="relative w-full h-full border-t-2 border-[#A3E229] bg-[#071f5c] shadow-[0_-15px_35px_rgba(0,0,0,0.85)]">
            <img 
              src={fotos.celebration} 
              alt="Celebración y victoria en la pista La Marina Sport Club" 
              className="w-full h-full object-cover object-[center_22%] filter contrast-110 brightness-105"
            />
            {/* Degradados de fusión para difuminar la parte inferior e integrar el fondo */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#040e2d] via-[#071b52]/80 to-transparent"></div>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#040e2d] via-[#071b52]/60 to-transparent"></div>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#040e2d] via-[#071b52]/60 to-transparent"></div>
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#071b52]/50 to-transparent"></div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EFECTOS FLOTANTES DE CAMPEONATO: Destellos, Partículas y Chispas          */}
        {/* ========================================================================= */}
        {/* Chispas y confeti deportivo neón */}
        <div className="absolute top-1/3 left-6 w-2 h-2 rounded-full bg-[#A3E229] shadow-[0_0_8px_#A3E229] animate-pulse z-35"></div>
        <div className="absolute top-1/2 right-10 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00d2ff] animate-ping z-35"></div>
        <div className="absolute bottom-1/3 left-12 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff] z-35"></div>
        <div className="absolute top-20 right-1/3 w-2 h-2 rounded-full bg-[#A3E229] shadow-[0_0_8px_#A3E229] z-35"></div>

        {/* ========================================================================= */}
        {/* PLACA INFERIOR ESTILO FLYER DEPORTIVO (CHAMPIONS PODIUM)                  */}
        {/* ========================================================================= */}
        <div className="absolute bottom-3 left-3 right-3 z-40">
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
