import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  const whatsappUrl = "https://wa.me/584248302078?text=Hola%20Henry,%20me%20comunico%20desde%20la%20web%20Copa%20Navidad%20LMSC";

  return (
    <footer className="bg-[#082b7c] border-t border-blue-400/25 py-4 sm:py-5 px-4 sm:px-6 lg:px-8 text-center text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Identidad con Logo Oficial de La Marina Agrandado */}
        <div className="flex items-center gap-3">
          <img 
            src="./assets/IMG_2966.PNG" 
            alt="La Marina Sport Club" 
            className="h-20 sm:h-24 md:h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(163,226,41,0.5)] transition-transform hover:scale-105"
          />
        </div>

        {/* Copyright, Sede y Aval FVP */}
        <div className="flex flex-col items-center md:items-center text-center text-[11px] sm:text-xs text-blue-100/90 leading-tight">
          <span className="font-semibold text-white">© 2026 Copa Navidad LMSC • Torneo Estadal 500 pts para el ranking FVP</span>
          <span className="text-blue-200/80 text-[11px] mt-0.5 font-medium">La Marina Sport Club, Lechería</span>
        </div>

        {/* Crédito: Desarrollado por Henry Macho (WhatsApp) */}
        <div className="flex items-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a389c]/80 border border-blue-400/30 hover:border-[#A3E229] hover:bg-[#0b3b95] text-slate-200 hover:text-white transition-all shadow-sm"
            title="Contactar al desarrollador vía WhatsApp"
          >
            <span className="text-[11px]">
              Desarrollado por <strong className="text-white group-hover:text-[#A3E229] transition-colors">Henry Macho</strong>
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#A3E229] flex items-center justify-center group-hover:bg-[#A3E229] group-hover:text-[#150D8B] transition-colors">
              <MessageCircle className="w-3 h-3" />
            </div>
          </a>
        </div>

      </div>
    </footer>
  );
}
