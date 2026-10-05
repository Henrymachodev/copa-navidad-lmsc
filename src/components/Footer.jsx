import React from 'react';
import { Trophy, MessageCircle } from 'lucide-react';

export default function Footer() {
  const whatsappUrl = "https://wa.me/584248302078?text=Hola%20Henry,%20me%20comunico%20desde%20la%20web%20Copa%20Navidad%20LMSC";

  return (
    <footer className="bg-[#071f5c] border-t border-blue-900/60 py-10 px-4 sm:px-6 lg:px-8 text-center text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Identidad con Logo Oficial */}
        <div className="flex items-center gap-3">
          <img 
            src="./assets/IMG_2966.PNG" 
            alt="La Marina Sport Club" 
            className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_0_15px_rgba(163,226,41,0.25)]"
          />
        </div>

        {/* Copyright, Sede y Aval FVP */}
        <div className="flex flex-col items-center md:items-center text-center text-xs text-slate-300">
          <span>© 2026 Copa Navidad LMSC • Torneo Estadal 500 pts para el ranking FVP • Puerto La Cruz, estado Anzoátegui.</span>
        </div>

        {/* Crédito: Desarrollado por Henry Macho (WhatsApp) */}
        <div className="flex items-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/90 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-navy-800 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Contactar al desarrollador vía WhatsApp"
          >
            <span className="text-[11px]">
              Desarrollado por <strong className="text-white group-hover:text-emerald-400 transition-colors">Henry Macho</strong>
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-navy-900 transition-colors">
              <MessageCircle className="w-3 h-3" />
            </div>
          </a>
        </div>

      </div>
    </footer>
  );
}
