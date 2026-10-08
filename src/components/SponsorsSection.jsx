import React, { useState, useEffect } from 'react';
import { Handshake } from 'lucide-react';
import { getSponsors, INITIAL_SPONSORS } from '../services/firebase';

export default function SponsorsSection() {
  const [sponsorsList, setSponsorsList] = useState(INITIAL_SPONSORS);

  const loadSponsors = async () => {
    try {
      const data = await getSponsors();
      if (data && Array.isArray(data)) {
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

  // Si no hay ningún patrocinador cargado, no se muestra la sección
  if (!sponsorsList || sponsorsList.length === 0) {
    return null;
  }

  const isSingle = sponsorsList.length === 1;

  return (
    <section id="patrocinadores" className="py-10 sm:py-14 bg-gradient-to-b from-[#071f5c] to-[#082b7c] border-t border-blue-400/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de la sección con espaciado optimizado */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A3E229]/15 text-[#A3E229] text-xs font-extrabold mb-2.5 border border-[#A3E229]/40 uppercase tracking-widest shadow-sm">
            <Handshake className="w-3.5 h-3.5" />
            <span>Alianzas Oficiales & Comerciales</span>
          </div>
          <h2 className="font-orbitron text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Patrocinadores & <span className="text-[#A3E229]">Aliados</span>
          </h2>
          <p className="mt-2 text-blue-100/80 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Marcas oficiales que hacen posible la Copa Navidad 2026 y respaldan el desarrollo competitivo del pádel nacional.
          </p>
        </div>

        {/* CONTENEDOR FLEX CENTRADO:
            - Si hay solo uno: centrado único con tamaño protagónico
            - Si hay más de 4-5 logos: se distribuyen en filas centradas naturalmente */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-14 py-2 max-w-5xl mx-auto">
          {sponsorsList.map((sponsor) => {
            const logoElement = (
              <div 
                className={`flex items-center justify-center p-3 group transition-all duration-300 ${
                  isSingle 
                    ? 'h-28 sm:h-36 md:h-44 w-72 sm:w-96 md:w-[420px]' 
                    : 'h-20 sm:h-24 md:h-28 w-48 sm:w-56 md:w-60 max-w-[240px]'
                }`}
              >
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-h-full max-w-full w-auto h-auto object-contain filter grayscale contrast-125 brightness-105 opacity-85 group-hover:grayscale-0 group-hover:brightness-110 group-hover:opacity-100 group-hover:scale-105 drop-shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all duration-300"
                  />
                ) : (
                  <span className="font-orbitron text-base sm:text-lg font-black tracking-wider uppercase text-blue-200 group-hover:text-[#A3E229] transition-colors text-center">
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
                  className="outline-none focus:ring-2 focus:ring-[#A3E229]/50 rounded-2xl transition-transform hover:scale-105"
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
