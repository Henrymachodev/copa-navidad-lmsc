import React, { useState } from 'react';
import { Trophy, Menu, X, Award } from 'lucide-react';

export default function Header({ currentView, setCurrentView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-40 bg-[#0a389c] border-b border-blue-400/20 shadow-[0_4px_25px_rgba(10,56,156,0.35)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ÁREA CENTRAL PRINCIPAL: LOGO DEL CLUB & PATROCINADOR FLOTANTE */}
        <div className="py-4 sm:py-6 md:py-7 flex flex-col items-center justify-center relative">
          
          {/* Logo del Club */}
          <div 
            onClick={() => {
              if (currentView !== 'landing') setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer group flex flex-col items-center justify-center transition-transform hover:scale-[1.02] duration-300"
          >
            <div className="relative">
              <img 
                src="./assets/IMG_2966.PNG" 
                alt="Logo La Marina Sport Club" 
                className="h-24 sm:h-32 md:h-38 lg:h-44 w-auto object-contain filter drop-shadow-[0_0_35px_rgba(163,226,41,0.35)] transition-all duration-300 group-hover:drop-shadow-[0_0_50px_rgba(163,226,41,0.55)]"
              />
            </div>
            
            {/* Título de Alta Gama: Copa Navidad 2026 */}
            <div className="mt-2 flex flex-col items-center text-center">
              <h1 className="font-orbitron text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)]">
                COPA NAVIDAD <span className="text-[#A3E229] drop-shadow-[0_0_20px_rgba(163,226,41,0.55)]">2026</span>
              </h1>
            </div>
          </div>

          {/* ESPACIO PARA AUSPICIADOR PRINCIPAL: "PRESENTADO POR" + LOGO 100% FLOTANTE SIN CONTENEDORES */}
          <div className="mt-3 flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-blue-200/80 mb-1.5">
              Presentado por
            </span>
            {/* Logo completamente libre, limpio y flotante directamente sobre el fondo */}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform duration-300 hover:scale-105"
              title="El Parador del Puerto"
            >
              <img 
                src="./assets/sponsor_el_parador.png" 
                alt="El Parador del Puerto - Patrocinador Principal" 
                className="h-10 sm:h-12 md:h-14 w-auto object-contain filter drop-shadow-[0_6px_20px_rgba(0,0,0,0.45)]"
              />
            </a>
          </div>

          {/* INTERTÍTULO CENTRADO DESTACADO: TORNEO ESTADAL - 500 PTOS */}
          <div className="mt-3.5 w-full flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#082363]/85 border border-[#A3E229]/50 shadow-[0_0_25px_rgba(163,226,41,0.25)] backdrop-blur-md">
              <Award className="w-5 h-5 text-[#A3E229] shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-black text-white tracking-wider uppercase text-center font-orbitron">
                Torneo Estadal - 500 pts para el ranking FVP
              </span>
              <Trophy className="w-5 h-5 text-[#A3E229] shrink-0 hidden sm:inline" />
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="absolute right-0 top-6 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white border border-slate-700 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN DESKTOP CENTRADA */}
        <nav className="hidden md:flex items-center justify-center gap-10 pb-4 border-t border-slate-800/60 pt-3">
          <button 
            onClick={() => {
              if (currentView !== 'landing') setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-sm font-semibold text-[#A3E229] hover:text-[#b6f23d] transition-colors"
          >
            Inicio
          </button>
          <a 
            href="#formulario" 
            onClick={() => { if (currentView !== 'landing') setCurrentView('landing'); }}
            className="text-sm font-semibold text-slate-300 hover:text-[#A3E229] transition-colors"
          >
            Inscríbete Aquí
          </a>
          <a 
            href="#jugadores-confirmados" 
            onClick={() => { if (currentView !== 'landing') setCurrentView('landing'); }}
            className="text-sm font-semibold text-slate-300 hover:text-[#A3E229] transition-colors"
          >
            Parejas Confirmadas
          </a>
          <a 
            href="#detalles" 
            onClick={() => { if (currentView !== 'landing') setCurrentView('landing'); }}
            className="text-sm font-semibold text-slate-300 hover:text-[#A3E229] transition-colors"
          >
            Categorías & Premios
          </a>
          <a 
            href="#patrocinadores" 
            onClick={() => { if (currentView !== 'landing') setCurrentView('landing'); }}
            className="text-sm font-semibold text-slate-300 hover:text-[#A3E229] transition-colors"
          >
            Patrocinadores
          </a>
        </nav>

        {/* Menú Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                if (currentView !== 'landing') setCurrentView('landing');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block w-full text-center py-2.5 text-sm font-semibold text-slate-200 hover:bg-navy-800 rounded-xl"
            >
              Inicio
            </button>
            <a
              href="#formulario"
              onClick={() => {
                if (currentView !== 'landing') setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="block text-center py-2.5 text-sm font-semibold text-[#A3E229] hover:bg-navy-800 rounded-xl"
            >
              Inscríbete Aquí
            </a>
            <a
              href="#jugadores-confirmados"
              onClick={() => {
                if (currentView !== 'landing') setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="block text-center py-2.5 text-sm font-semibold text-slate-200 hover:bg-navy-800 rounded-xl"
            >
              Parejas Confirmadas
            </a>
            <a
              href="#detalles"
              onClick={() => {
                if (currentView !== 'landing') setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="block text-center py-2.5 text-sm font-semibold text-slate-200 hover:bg-navy-800 rounded-xl"
            >
              Categorías & Premios
            </a>
            <a
              href="#patrocinadores"
              onClick={() => {
                if (currentView !== 'landing') setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="block text-center py-2.5 text-sm font-semibold text-slate-200 hover:bg-navy-800 rounded-xl"
            >
              Patrocinadores
            </a>
          </div>
        )}

      </div>
    </header>
  );
}
