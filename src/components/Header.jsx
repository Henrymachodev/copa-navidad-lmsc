import React, { useState } from 'react';
import { Trophy, Menu, X, Award } from 'lucide-react';

export default function Header({ currentView, setCurrentView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-40 bg-navy-900/95 backdrop-blur-md border-b border-slate-800/90 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ÁREA CENTRAL PRINCIPAL: LOGO DEL CLUB & PATROCINADOR FLOTANTE */}
        <div className="py-6 sm:py-8 md:py-10 flex flex-col items-center justify-center relative">
          
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
                src="/assets/IMG_2966.PNG" 
                alt="Logo La Marina Sport Club" 
                className="h-28 sm:h-36 md:h-44 lg:h-52 w-auto object-contain filter drop-shadow-[0_0_35px_rgba(128,225,0,0.3)] transition-all duration-300 group-hover:drop-shadow-[0_0_45px_rgba(128,225,0,0.5)]"
              />
            </div>
            
            {/* Título de Alta Gama: Copa Navidad 2026 */}
            <div className="mt-3 flex flex-col items-center text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.25em] text-white uppercase drop-shadow-md">
                COPA NAVIDAD <span className="text-[#80e100] drop-shadow-[0_0_16px_rgba(128,225,0,0.45)]">2026</span>
              </h1>
            </div>
          </div>

          {/* ESPACIO PARA AUSPICIADOR PRINCIPAL: "PRESENTADO POR" + LOGO 100% FLOTANTE SIN CONTENEDORES */}
          <div className="mt-5 flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.35em] text-slate-400 mb-2">
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
                src="/assets/sponsor_el_parador.png" 
                alt="El Parador del Puerto - Patrocinador Principal" 
                className="h-11 sm:h-14 md:h-16 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
              />
            </a>
          </div>

          {/* INTERTÍTULO CENTRADO DESTACADO: TORNEO FVP1 - 1000 PTOS */}
          <div className="mt-6 w-full flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-navy-800/90 via-navy-700/80 to-navy-800/90 border border-gold-500/40 shadow-glow-gold backdrop-blur-md">
              <Award className="w-5 h-5 text-gold-400 shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-wider uppercase text-center">
                TORNEO FVP1 - 1000 ptos para el ranking FVP
              </span>
              <Trophy className="w-5 h-5 text-gold-400 shrink-0 hidden sm:inline" />
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
