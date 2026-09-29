import React from 'react';
import { Trophy, MessageCircle } from 'lucide-react';

export default function Footer() {
  const whatsappUrl = "https://wa.me/584248302078?text=Hola%20Henry,%20me%20comunico%20desde%20la%20web%20Copa%20Navidad%20LMSC";

  return (
    <footer className="bg-navy-900 border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Identidad */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">
            La Marina Sport Club
          </span>
        </div>

        {/* Copyright y Sede */}
        <div className="flex flex-col items-center md:items-center text-center text-xs text-slate-400">
          <span>© 2026 Copa Navidad LMSC • Torneo avalado por la FVP • Puerto La Cruz, estado Anzoátegui.</span>
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
