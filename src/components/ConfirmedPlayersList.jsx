import React, { useState, useEffect } from 'react';
import { Trophy, Users, ShieldCheck, CheckCircle2, Filter } from 'lucide-react';
import { 
  subscribeToRegistrations, 
  getCategoryLimits, 
  DEFAULT_MAX_PAIRS_PER_CATEGORY,
  subscribeToLandingConfig,
  DEFAULT_LANDING_CONFIG
} from '../services/firebase';
import { CATEGORIAS } from './RegistrationForm';

export default function ConfirmedPlayersList() {
  const [confirmedList, setConfirmedList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categoryLimits, setCategoryLimits] = useState({});
  const [landingConfig, setLandingConfig] = useState(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    getCategoryLimits().then(setCategoryLimits).catch(() => {});

    // Suscripción a la configuración de textos
    const unsubConfig = subscribeToLandingConfig((cfg) => {
      setLandingConfig(cfg);
    });

    // Suscripción en tiempo real: al cambiar a 'confirmado' en el admin, se refleja aquí instantáneamente
    const unsubscribe = subscribeToRegistrations((allRegistrations) => {
      const onlyConfirmed = allRegistrations.filter(r => {
        const s = (r.status || r.estado || '').toLowerCase();
        return s === 'confirmado';
      });
      setConfirmedList(onlyConfirmed);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof unsubConfig === 'function') unsubConfig();
    };
  }, []);

  const filtered = confirmedList.filter(item => {
    if (selectedCategory === 'ALL') return true;
    return item.categoria === selectedCategory;
  });

  return (
    <section id="jugadores-confirmados" className="py-16 sm:py-24 bg-navy-900/95 border-t border-slate-800/80 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cuadro Oficial de Competencia</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Parejas Confirmadas
          </h2>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm">
            {landingConfig.parejasSubtitulo || 'Listado oficial de duplas con inscripción y pago verificado por el comité organizador'}
          </p>
        </div>

        {/* Pestañas / Filtro de Categoría */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-gold-500 text-navy-900 shadow-glow-gold'
                : 'bg-navy-800/80 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            Todas ({confirmedList.length})
          </button>
          {CATEGORIAS.map(cat => {
            const count = confirmedList.filter(c => c.categoria === cat.label).length;
            const max = categoryLimits[cat.label] || categoryLimits.defaultMax || DEFAULT_MAX_PAIRS_PER_CATEGORY;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.label
                    ? 'bg-gold-500 text-navy-900 shadow-glow-gold'
                    : 'bg-navy-800/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat.label} ({count}/{max})
              </button>
            );
          })}
        </div>

        {/* Listado de Parejas Confirmadas */}
        {filtered.length === 0 ? (
          <div className="glass-card p-10 rounded-3xl text-center max-w-xl mx-auto border border-slate-800">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Sin parejas confirmadas aún</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {selectedCategory === 'ALL' 
                ? 'Las inscripciones están en proceso de verificación por la organización. En cuanto se validen los comprobantes aparecerán aquí publicadas.'
                : `Aún no hay parejas con pago verificado en la categoría ${selectedCategory}. ¡Inscribe tu dupla y sé el primero en la grilla!`}
            </p>
            <div className="mt-5">
              <a
                href="#formulario"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-xs transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span>Inscribirme en esta categoría</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, index) => (
              <div 
                key={item.id || index}
                className="glass-card p-5 rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    Dupla #{index + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                    {item.categoria}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <span className="text-sm font-bold text-white truncate">
                      {item.jugador1?.nombre} {item.jugador1?.apellido || ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <span className="text-sm font-bold text-white truncate">
                      {item.jugador2?.nombre} {item.jugador2?.apellido || ''}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Inscripción verificada</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CONFIRMADO
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
