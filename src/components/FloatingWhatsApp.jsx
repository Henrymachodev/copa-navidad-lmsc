import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [tooltipVisible, setTooltipVisible] = useState(true);
  const whatsappNumber = '584248302078';
  const message = 'Hola, necesito ayuda con mi inscripción para la Copa Navidad LMSC 2026';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-fade-in group">
      {/* Tooltip / Píldora de Mensaje */}
      {tooltipVisible && (
        <div className="relative hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-navy-900/95 text-white border border-[#25D366]/40 shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300">
          <span className="text-xs font-semibold text-slate-100">
            ¿Necesitas ayuda con tu inscripción? <strong className="text-[#25D366]">¡Contáctanos!</strong>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTooltipVisible(false);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            title="Cerrar mensaje"
            aria-label="Cerrar mensaje"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          {/* Flechita apuntando al botón */}
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-navy-900/95"></div>
        </div>
      )}

      {/* Botón Flotante con Icono Oficial */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp para ayuda con inscripción"
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[0_0_25px_rgba(37,211,102,0.45)] hover:shadow-[0_0_35px_rgba(37,211,102,0.7)] transition-all duration-300 transform hover:scale-110 active:scale-95 group"
      >
        {/* Anillo de pulso sutil */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none"></span>

        {/* Icono SVG oficial de WhatsApp */}
        <svg 
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-md relative z-10" 
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.286 0-7.77 3.484-7.77 7.77 0 1.365.356 2.68 1.032 3.842l-1.095 4.004 4.106-1.077c1.117.614 2.384.945 3.727.945 4.286 0 7.77-3.484 7.77-7.77 0-4.286-3.484-7.714-7.77-7.714zm0 14.072c-1.189 0-2.352-.319-3.367-.924l-.241-.144-2.439.64.651-2.378-.158-.251c-.663-1.056-1.015-2.279-1.015-3.535 0-3.528 2.871-6.399 6.4-6.399 3.528 0 6.399 2.871 6.399 6.399 0 3.529-2.871 6.4-6.4 6.4z"/>
        </svg>

        {/* Indicador de Ayuda para móviles */}
        <span className="sm:hidden absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-navy-950 text-white text-[9px] font-black border border-[#25D366]">
          SOS
        </span>
      </a>
    </div>
  );
}
