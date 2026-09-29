import React, { useState, useEffect } from 'react';
import { Handshake } from 'lucide-react';
import { getSponsors, INITIAL_SPONSORS } from '../services/firebase';

export default function SponsorsSection() {
  const [sponsorsList, setSponsorsList] = useState(INITIAL_SPONSORS);

  const loadSponsors = async () => {
    try {
      const data = await getSponsors();
      if (data && data.length > 0) {
        setSponsorsList(data);
      }
    } catch (e) {
      console.error('Error cargando patrocinadores:', e);
    }
  };

  useEffect(() => {
    loadSponsors();
    window.addEventListener('sponsors_updated', loadSponsors);
    return () => window.removeEventListener('sponsors_updated', loadSponsors);
  }, []);

  return (
    <section id="patrocinadores" className="py-16 sm:py-24 bg-navy-950/90 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de la sección estilo Premier Padel / Vellora */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#80e100]/10 text-[#80e100] text-xs font-bold mb-3 border border-[#80e100]/30 uppercase tracking-widest">
            <Handshake className="w-3.5 h-3.5" />
            <span>Alianzas Oficiales & Comerciales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Patrocinadores & <span className="text-[#80e100]">Aliados</span>
          </h2>
          <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Marcas oficiales que hacen posible la Copa Navidad 2026 y respaldan el desarrollo competitivo del pádel nacional.
          </p>
        </div>

        {/* CONTENEDOR FLEX: LOGOS 100% LIMPIOS Y FLOTANTES
            - Sin recuadros, fondos ni bordes artificiales
            - Escala de grises sutil con transición fluida a color vivo y zoom al hover
            - Distribución centrada y fluida perfectamente adaptada a mobile y desktop */}
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 md:gap-20 py-4 max-w-5xl mx-auto">
          {sponsorsList.map((sponsor) => {
            const logoElement = (
              <div className="flex items-center justify-center p-2 group transition-all duration-300">
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    style={{ height: `${sponsor.logoHeight || 65}px`, maxHeight: `${(sponsor.logoHeight || 65) * 1.25}px` }}
                    className="w-auto max-w-[160px] sm:max-w-[240px] md:max-w-[300px] object-contain filter grayscale contrast-125 brightness-95 opacity-70 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-300"
                  />
                ) : (
                  <span className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-400 group-hover:text-[#80e100] transition-colors">
                    {sponsor.name}
                  </span>
                )}
              </div>
            );

            if (sponsor.link) {
              return (
                <a
                  key={sponsor.id}
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="outline-none focus:ring-2 focus:ring-gold-500/50 rounded-xl"
                  title={`Visitar sitio de ${sponsor.name}`}
                >
                  {logoElement}
                </a>
              );
            }

            return <div key={sponsor.id}>{logoElement}</div>;
          })}
        </div>

      </div>
    </section>
  );
}
