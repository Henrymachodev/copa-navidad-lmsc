import { createClient } from '@supabase/supabase-js';

// ==================== CONFIGURACIÓN Y CLIENTE SUPABASE ====================

export const CLOUD_SUPABASE_STORAGE_KEY = 'copa_navidad_cloud_supabase_config';

/**
 * Obtiene la configuración activa de Supabase.
 * Prioridad 1: Configurada interactivamente desde el panel admin y guardada en localStorage.
 * Prioridad 2: Variables de entorno de Vite (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 */
export const getActiveSupabaseConfig = () => {
  try {
    const saved = localStorage.getItem(CLOUD_SUPABASE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo configuración guardada de Supabase:', e);
  }

  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://xcjvbgclnyfslcjlqvur.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjanZiZ2Nsbnlmc2xjamxxdnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDIwOTksImV4cCI6MjEwODAxODA5OX0.qzBcQABPt1KJzN0tx0h7UUBTFA-O_VIp7josc8Er5ps'
  };
};

/**
 * Valida si las credenciales mínimas de Supabase están configuradas
 */
export const isSupabaseConfigured = () => {
  const cfg = getActiveSupabaseConfig();
  return Boolean(
    cfg.supabaseUrl && 
    cfg.supabaseAnonKey &&
    cfg.supabaseUrl.startsWith('http') &&
    cfg.supabaseAnonKey.length > 20 &&
    !cfg.supabaseUrl.includes('tu-proyecto') &&
    !cfg.supabaseAnonKey.includes('tu-anon-key')
  );
};

/**
 * Extrae el subdominio / ID de referencia del proyecto Supabase
 */
export const getSupabaseProjectRef = () => {
  const cfg = getActiveSupabaseConfig();
  if (!isSupabaseConfigured()) return null;
  try {
    const u = new URL(cfg.supabaseUrl);
    return u.hostname.split('.')[0] || u.hostname;
  } catch {
    return 'Supabase';
  }
};

/**
 * Guarda credenciales personalizadas de Supabase desde el Admin
 */
export const saveCustomSupabaseConfig = (newCfg) => {
  if (newCfg && newCfg.supabaseUrl && newCfg.supabaseAnonKey) {
    localStorage.setItem(CLOUD_SUPABASE_STORAGE_KEY, JSON.stringify({
      supabaseUrl: newCfg.supabaseUrl.trim(),
      supabaseAnonKey: newCfg.supabaseAnonKey.trim()
    }));
    supabaseClientInstance = null;
    return true;
  }
  return false;
};

/**
 * Elimina credenciales personalizadas de Supabase
 */
export const clearCustomSupabaseConfig = () => {
  localStorage.removeItem(CLOUD_SUPABASE_STORAGE_KEY);
  supabaseClientInstance = null;
};

let supabaseClientInstance = null;

export const getSupabaseClient = () => {
  if (supabaseClientInstance) return supabaseClientInstance;
  if (!isSupabaseConfigured()) return null;

  try {
    const cfg = getActiveSupabaseConfig();
    supabaseClientInstance = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } }
    });
    console.log('✅ Supabase Client inicializado en la nube:', getSupabaseProjectRef());
    return supabaseClientInstance;
  } catch (error) {
    console.error('⚠️ Error al inicializar cliente Supabase:', error);
    return null;
  }
};

// ==================== CONSTANTES Y ESTADOS OFICIALES ====================

export const PLAYER_STATUSES = [
  'preinscrito',
  'esperando pago',
  'confirmado',
  'retirado',
  'suspendido',
  'lista de espera'
];

export const DEFAULT_MAX_PAIRS_PER_CATEGORY = 24;

export const ADMIN_ROLES = [
  { id: 'Super Admin', label: 'Super Admin', desc: 'Acceso total y configuración del sistema' },
  { id: 'Comité Organizador', label: 'Comité Organizador', desc: 'Gestión de parejas, confirmaciones y cupos' },
  { id: 'Mesa Técnica', label: 'Mesa Técnica / Juez Árbitro', desc: 'Confirmación de asistencia y control de partidos' },
  { id: 'Visualizador', label: 'Visualizador', desc: 'Solo lectura de inscripciones' }
];

export const DEFAULT_ADMIN_USERS = [
  {
    id: 'usr_admin_1',
    nombre: 'Administrador Principal',
    username: 'admin',
    email: 'admin@lamarina.com',
    rol: 'Super Admin',
    pin: 'admin123',
    activo: true,
    fechaCreacion: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'usr_admin_2',
    nombre: 'Comité Técnico LMSC',
    username: 'tecnica',
    email: 'tecnica@lamarina.com',
    rol: 'Comité Organizador',
    pin: 'tecnica2026',
    activo: true,
    fechaCreacion: '2026-09-01T00:00:00.000Z'
  }
];

export const DEFAULT_HERO_FOTOS = [
  {
    id: 'foto_1',
    badge: 'Masculino',
    categoria: '2da a 7ma',
    imagen: './assets/Masculino.jpg',
    objectPosition: 'center 20%'
  },
  {
    id: 'foto_2',
    badge: 'Máster Masc',
    categoria: '+45 y +55',
    imagen: './assets/Master_masculino.jpg',
    objectPosition: 'center 46%'
  },
  {
    id: 'foto_3',
    badge: 'Femenino',
    categoria: '3ra a 7ma',
    imagen: './assets/Femenino.jpg',
    objectPosition: 'center 32%'
  },
  {
    id: 'foto_4',
    badge: 'Máster Fem',
    categoria: 'Máster Femenino',
    imagen: './assets/Master_femenino.jpg',
    objectPosition: 'center 20%'
  }
];

export const DEFAULT_HERO_MONTAGE_FOTOS = {
  smash: './assets/hero_player_smash.jpg',
  volley: './assets/hero_player_volley.jpg',
  defense: './assets/hero_player_defense.jpg',
  celebration: './assets/hero_player_celebration.jpg'
};

export const DEFAULT_BENEFICIOS_INVERSION = [
  '2 juegos garantizados en cuadro',
  'Premios en metálico & trofeos',
  'Franela oficial del torneo',
  'Hidratación en pista',
  'Pelotas oficiales nuevas por partido',
  'Arbitraje federado FVP (500 pts)'
];

export const DEFAULT_LANDING_CONFIG = {
  heroVisualMode: 'banner',
  heroCintillo: 'Cupos Limitados',
  heroTitulo: '¡Inscripciones abiertas!',
  heroSubtitulo: 'Cierra el año con el mejor nivel competitivo en una experiencia diseñada para que el atleta sea el absoluto protagonista. Prepárate para vivir la máxima emoción del pádel en un torneo oficial de 500 puntos para el ranking FVP. ¡Reúne a tu dupla, asegura tu cupo en el cuadro de juego y sé parte de la gran fiesta de cierre de temporada en casa!',
  heroFechas: 'del 14 al 19 de diciembre',
  heroSede: 'La Marina SC, Lechería',
  heroInversion: '$140 por dupla',
  heroInversionDesglose: '$70 por jugador',
  heroJuegosGarantizados: '2 juegos garantizados',
  heroPremios: 'Premios en Metálico & Trofeos Oficiales',
  beneficiosInversion: DEFAULT_BENEFICIOS_INVERSION,
  heroFotos: DEFAULT_HERO_FOTOS,
  heroMontageFotos: DEFAULT_HERO_MONTAGE_FOTOS,
  heroPosterImage: './assets/hero_poster_championship.jpg',
  heroBannerImage: './assets/hero_banner_oficial.png',
  parejasSubtitulo: 'Listado oficial de duplas con inscripción y pago verificado por el comité organizador',
  cuposLimitados: 'Cupos Limitados',
  montoInscripcion: '$140',
  
  // Métodos de pago oficiales
  pagoMovilDetalle: 'Banco: Banesco (0134)\nTeléfono: 0414-8889900\nRIF: J-50000000-0\nTitular: La Marina Sport Club C.A.\nTasa oficial BCV del día',
  zelleDetalle: 'Correo Zelle: pagos@copanavidadlmsc.com\nTitular: LMSC Padel Operations LLC',
  efectivoDetalle: 'Recepción y Administración de La Marina Sport Club (Lechería, Anzoátegui).\nPago directo en efectivo (Divisas USD o Bolívares) en taquilla oficial con el comité organizador.\nHorario: Lunes a Domingo de 8:00 AM a 9:00 PM.',
  cuentaInternacionalDetalle: 'Banco: Banesco Panamá\nCuenta Corriente USD: 1029384756\nBeneficiario: LMSC Corp Panamá\nSWIFT / BIC: BAPAPAXX\nAcepta transferencias ACH y Wire internacionales.',
  banescoPanamaDetalle: 'Banco: Banesco Panamá\nCuenta Corriente USD: 1029384756\nBeneficiario: LMSC Corp Panamá\nSWIFT: BAPAPAXX',
  binancePayDetalle: 'Binance Pay ID: 849201948\nAlias: @CopaNavidadLMSC\nMoneda: USDT (Red BEP20 o Pay)',

  // Reglamento Oficial
  reglamentoUrl: '',
  reglamentoPdfData: '',
  reglamentoNombre: 'Reglamento_Oficial_Copa_Navidad_2026.pdf',
  reglamentoTexto: `REGLAMENTO OFICIAL DE COMPETENCIA - COPA NAVIDAD LMSC 2026
LA MARINA SPORT CLUB • TORNEO ESTADAL 500 PTS (RANKING FVP)

1. MARCO TÉCNICO Y AVAL FEDERATIVO
El torneo Copa Navidad LMSC 2026 se regirá bajo las reglas oficiales de juego de la Federación Internacional de Pádel (FIP), las disposiciones del circuito oficial de la Federación Venezolana de Pádel (FVP) y la reglamentación disciplinaria de La Marina Sport Club.

2. NORMATIVA DE PUNTUALIDAD Y WALKOVER (W.O.)
- Registro y llamado: Toda pareja inscrita deberá apersonarse en la mesa técnica del torneo al menos quince (15) minutos antes de la hora fijada en la programación oficial.
- Tolerancia máxima: Se establece un margen de tolerancia estricto de quince (15) minutos.
- Decretación de W.O.: Transcurridos los 15 minutos sin comparecencia, el Juez Árbitro decretará Walkover (W.O.) automático con resultado 6-0 / 6-0.

3. INDUMENTARIA DEPORTIVA Y CALZADO TÉCNICO
- Calzado reglamentario: Uso obligatorio de calzado específico de pádel o tenis con suela de espiga o suela omni.
- Vestimenta oficial: Los competidores deberán presentarse con indumentaria técnica deportiva reglamentaria.

4. FORMATO DE JUEGO Y SISTEMA DE PUNTUACIÓN
- Partidos de cuadro: 2 sets regulares con Punto de Oro (Golden Point) a 40-40.
- Empate a 1 set: Súper Tie-Break a diez (10) puntos con ventaja mínima de 2.

5. POLÍTICA DE PAGOS Y REEMBOLSOS
- La inversión de $140 por dupla cubre derecho a competir, arbitraje oficial, hidratación y kit de bienvenida. No se realizan reembolsos en efectivo una vez confirmada la plaza.`
};

export const INITIAL_SPONSORS = [
  {
    id: 'sp_1',
    name: 'Colegio Juan XXIII',
    tier: 'Auspiciador Principal',
    logo: './assets/LOGO-JUAN-XXIII-WHT.png',
    link: 'https://www.instagram.com',
    isHero: true,
    logoHeight: 110
  }
];

// Claves de respaldo en localStorage (cuando no hay internet o no se han configurado credenciales)
const LOCAL_STORAGE_REGISTRATIONS_KEY = 'copa_navidad_local_registrations';
const LOCAL_STORAGE_CONFIG_KEY = 'copa_navidad_local_config';
const LOCAL_STORAGE_LANDING_CONFIG_KEY = 'copa_navidad_landing_config';
const LOCAL_STORAGE_SPONSORS_KEY = 'copa_navidad_local_sponsors';
const LOCAL_STORAGE_USERS_KEY = 'copa_navidad_admin_users';

export function sanitizeLandingConfig(cfg) {
  const merged = { ...DEFAULT_LANDING_CONFIG, ...cfg };
  if (merged.montoInscripcion === '$150' || merged.montoInscripcion === '$170') {
    merged.montoInscripcion = '$140';
  }
  if (merged.heroInversion === '$150 por pareja' || merged.heroInversion === '$150 / pareja' || merged.heroInversion === '$170 por pareja') {
    merged.heroInversion = '$140 por dupla';
  }
  if (merged.heroInversionDesglose === '$75 por jugador' || merged.heroInversionDesglose === '$85 por jugador') {
    merged.heroInversionDesglose = '$70 por jugador';
  }
  return merged;
}

// Helpers de transformación entre Supabase (snake_case/PostgreSQL) y la App (camelCase)
function mapRegistrationFromSupabase(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    categoria: row.categoria || '',
    status: row.status || 'preinscrito',
    monto: row.monto || '$140',
    metodoPago: row.metodo_pago || row.metodoPago || 'Pago Móvil',
    referenciaPago: row.referencia_pago || row.referenciaPago || '',
    comprobantePagoUrl: row.comprobante_url || row.comprobantePagoUrl || '',
    comprobanteNombre: row.comprobante_nombre || row.comprobanteNombre || '',
    aceptaReglamento: row.acepta_reglamento || row.aceptaReglamento || 'si',
    observaciones: row.observaciones || row.metadata?.observaciones || '',
    metadata: row.metadata || {},
    jugador1: row.jugador1 || {},
    jugador2: row.jugador2 || {},
    createdAtISO: row.created_at || new Date().toISOString(),
    createdAtFormatted: row.created_at ? new Date(row.created_at).toLocaleString('es-VE') : '',
    updatedAt: row.updated_at
  };
}

function mapRegistrationToSupabase(data) {
  return {
    id: String(data.id || `dupla_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    categoria: data.categoria || '',
    status: data.status || data.estado || 'preinscrito',
    monto: data.monto || '$140',
    metodo_pago: data.metodoPago || '',
    referencia_pago: data.referenciaPago || '',
    comprobante_url: data.comprobantePagoUrl || '',
    comprobante_nombre: data.comprobanteNombre || '',
    acepta_reglamento: data.aceptaReglamento || 'si',
    metadata: {
      ...(data.metadata || {}),
      observaciones: data.observaciones || ''
    },
    jugador1: data.jugador1 || {},
    jugador2: data.jugador2 || {},
    updated_at: new Date().toISOString()
  };
}

// ==================== INSCRIPCIONES (REGISTRATIONS) ====================

export async function getRegistrations() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(mapRegistrationFromSupabase);
      localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.warn('Error obteniendo registros de Supabase, usando respaldo local:', err);
    }
  }

  // Fallback local
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REGISTRATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveRegistration(registrationData) {
  const finalStatus = registrationData.status || (registrationData.comprobantePagoUrl ? 'esperando pago' : 'preinscrito');
  const payload = {
    ...registrationData,
    status: finalStatus,
    monto: registrationData.monto || '$140'
  };

  const client = getSupabaseClient();
  const supabaseRow = mapRegistrationToSupabase(payload);

  if (client) {
    try {
      const { data, error } = await client
        .from('registrations')
        .insert([supabaseRow])
        .select();

      if (error) throw error;
      const created = mapRegistrationFromSupabase(data?.[0]) || { ...payload, id: supabaseRow.id };

      // Actualizar localStorage también
      const local = await getRegistrations();
      localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify([created, ...local.filter(r => r.id !== created.id)]));
      window.dispatchEvent(new Event('storage'));

      return created;
    } catch (err) {
      console.error('Error guardando en Supabase, guardando en respaldo local:', err);
    }
  }

  // Fallback Local
  const id = supabaseRow.id;
  const newRegistration = {
    ...payload,
    id,
    createdAtISO: new Date().toISOString(),
    createdAtFormatted: new Date().toLocaleString('es-VE')
  };

  try {
    const existing = await getRegistrations();
    const updated = [newRegistration, ...existing];
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error guardando en local:', e);
  }

  return newRegistration;
}

export async function updateRegistration(id, updatedData) {
  const client = getSupabaseClient();
  const supabaseRow = mapRegistrationToSupabase({ ...updatedData, id });

  if (client) {
    try {
      const { error } = await client
        .from('registrations')
        .update(supabaseRow)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error actualizando en Supabase:', err);
    }
  }

  // Actualizar también en local
  try {
    const local = await getRegistrations();
    const updated = local.map(r => r.id === id ? { ...r, ...updatedData, id } : r);
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error actualizando en localStorage:', e);
  }

  return true;
}



export async function updateRegistrationStatus(id, newStatus) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('registrations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error actualizando status en Supabase:', err);
    }
  }

  try {
    const local = await getRegistrations();
    const updated = local.map(r => r.id === id ? { ...r, status: newStatus } : r);
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error local:', e);
  }

  return true;
}



export async function updateRegistrationObservation(id, observaciones) {
  const client = getSupabaseClient();
  const list = await getRegistrations();
  const current = list.find(r => r.id === id);
  const updatedMetadata = {
    ...(current?.metadata || {}),
    observaciones: observaciones || ''
  };

  if (client) {
    try {
      const { error } = await client
        .from('registrations')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error actualizando observación en Supabase:', err);
    }
  }

  try {
    const updated = list.map(r => r.id === id ? { 
      ...r, 
      observaciones: observaciones || '', 
      metadata: updatedMetadata 
    } : r);
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error actualizando observación local:', e);
  }

  return true;
}

export async function updateRegistrationPayment(id, paymentData) {
  const client = getSupabaseClient();
  const fields = {
    metodo_pago: paymentData.metodoPago,
    referencia_pago: paymentData.referenciaPago,
    comprobante_url: paymentData.comprobantePagoUrl,
    comprobante_nombre: paymentData.comprobanteNombre,
    status: paymentData.status || 'esperando pago',
    updated_at: new Date().toISOString()
  };

  if (client) {
    try {
      const { error } = await client
        .from('registrations')
        .update(fields)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error guardando pago en Supabase:', err);
    }
  }

  try {
    const local = await getRegistrations();
    const updated = local.map(r => r.id === id ? { ...r, ...paymentData, status: fields.status } : r);
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error local:', e);
  }

  return true;
}



export async function deleteRegistration(id) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error eliminando en Supabase:', err);
    }
  }

  try {
    const local = await getRegistrations();
    const updated = local.filter(r => r.id !== id);
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error local al eliminar:', e);
  }

  return true;
}



export function subscribeToRegistrations(callback) {
  // Ejecutar primera carga
  getRegistrations().then(data => callback(data)).catch(() => {});

  const client = getSupabaseClient();
  let channel = null;

  if (client) {
    try {
      const channelId = `realtime_reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      channel = client
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          async () => {
            try {
              const fresh = await getRegistrations();
              callback(fresh);
            } catch (err) {
              console.warn('Error refrescando registros en tiempo real:', err);
            }
          }
        )
        .subscribe((status, err) => {
          if (err) console.warn('Supabase realtime error (registrations):', err);
        });
    } catch (e) {
      console.warn('No se pudo inicializar canal realtime para registros:', e);
    }
  }

  // Suscripción local vía eventos storage
  const handleStorage = () => {
    getRegistrations().then(data => callback(data)).catch(() => {});
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (client && channel) {
      try {
        client.removeChannel(channel);
      } catch (e) {
        // ignore cleanup error
      }
    }
  };
}

// ==================== CONFIGURACIÓN DE LANDING & REGLAMENTO ====================

export async function getLandingConfig() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('tournament_config')
        .select('value')
        .eq('key', 'landing_textos')
        .single();

      if (!error && data?.value) {
        const sanitized = sanitizeLandingConfig(data.value);
        localStorage.setItem(LOCAL_STORAGE_LANDING_CONFIG_KEY, JSON.stringify(sanitized));
        return sanitized;
      }
    } catch (e) {
      console.warn('Error leyendo landingConfig de Supabase, usando local:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LANDING_CONFIG_KEY);
    return raw ? sanitizeLandingConfig(JSON.parse(raw)) : DEFAULT_LANDING_CONFIG;
  } catch {
    return DEFAULT_LANDING_CONFIG;
  }
}

export async function saveLandingConfig(config) {
  const sanitized = sanitizeLandingConfig(config);
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from('tournament_config')
        .upsert({
          key: 'landing_textos',
          value: sanitized,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error guardando landingConfig en Supabase:', e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_LANDING_CONFIG_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new Event('storage'));
  return true;
}



export function subscribeToLandingConfig(callback) {
  getLandingConfig().then(cfg => callback(cfg)).catch(() => {});

  const client = getSupabaseClient();
  let channel = null;

  if (client) {
    try {
      const channelId = `realtime_landing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      channel = client
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournament_config', filter: 'key=eq.landing_textos' },
          async () => {
            try {
              const fresh = await getLandingConfig();
              callback(fresh);
            } catch (err) {
              console.warn('Error refrescando landing en tiempo real:', err);
            }
          }
        )
        .subscribe((status, err) => {
          if (err) console.warn('Supabase realtime error (landing):', err);
        });
    } catch (e) {
      console.warn('No se pudo inicializar canal realtime para landingConfig:', e);
    }
  }

  const handleStorage = () => {
    getLandingConfig().then(cfg => callback(cfg)).catch(() => {});
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (client && channel) {
      try {
        client.removeChannel(channel);
      } catch (e) {
        // ignore cleanup error
      }
    }
  };
}

// ==================== LÍMITES DE CUPOS POR CATEGORÍA ====================

export async function getCategoryLimits() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('tournament_config')
        .select('value')
        .eq('key', 'category_limits')
        .single();

      if (!error && data?.value) {
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(data.value));
        return data.value;
      }
    } catch (e) {
      console.warn('Error leyendo cupos de Supabase:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveCategoryLimits(limitsData) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('tournament_config')
        .upsert({
          key: 'category_limits',
          value: limitsData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (e) {
      console.error('Error guardando cupos en Supabase:', e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(limitsData));
  window.dispatchEvent(new Event('storage'));
  return true;
}



// ==================== PATROCINADORES Y ALIADOS ====================

export async function getSponsors() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map(s => ({
          id: s.id,
          name: s.name,
          tier: s.tier,
          logo: s.logo,
          link: s.link,
          isHero: s.is_hero,
          logoHeight: s.logo_height || 65
        }));
        localStorage.setItem(LOCAL_STORAGE_SPONSORS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('Error leyendo patrocinadores de Supabase:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SPONSORS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SPONSORS;
  } catch {
    return INITIAL_SPONSORS;
  }
}

export async function saveSponsor(sponsor) {
  const id = sponsor.id || `sp_${Date.now()}`;
  const client = getSupabaseClient();

  const supabaseRow = {
    id,
    name: sponsor.name,
    tier: sponsor.tier || 'Patrocinador',
    logo: sponsor.logo || '',
    link: sponsor.link || '',
    is_hero: Boolean(sponsor.isHero),
    logo_height: sponsor.logoHeight || 65
  };

  if (client) {
    try {
      const { error } = await client
        .from('sponsors')
        .upsert(supabaseRow);

      if (error) throw error;
    } catch (e) {
      console.error('Error guardando patrocinador en Supabase:', e);
    }
  }

  const existing = await getSponsors();
  const index = existing.findIndex(s => s.id === id);
  let updated;
  if (index >= 0) {
    updated = [...existing];
    updated[index] = { ...sponsor, id };
  } else {
    updated = [...existing, { ...sponsor, id }];
  }
  localStorage.setItem(LOCAL_STORAGE_SPONSORS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  return { ...sponsor, id };
}

export async function deleteSponsor(id) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error eliminando patrocinador en Supabase:', e);
    }
  }

  const existing = await getSponsors();
  const updated = existing.filter(s => s.id !== id);
  localStorage.setItem(LOCAL_STORAGE_SPONSORS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  return true;
}



// ==================== USUARIOS ADMINISTRADORES ====================

export async function getAdminUsers() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('admin_users')
        .select('*');

      if (!error && data && data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Error leyendo usuarios de Supabase:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ADMIN_USERS;
  } catch {
    return DEFAULT_ADMIN_USERS;
  }
}

export async function saveAdminUser(userData) {
  const id = userData.id || `usr_${Date.now()}`;
  const client = getSupabaseClient();

  const row = {
    id,
    nombre: userData.nombre,
    username: userData.username,
    email: userData.email || '',
    rol: userData.rol || 'Comité Organizador',
    pin: userData.pin,
    activo: userData.activo !== false
  };

  if (client) {
    try {
      const { error } = await client
        .from('admin_users')
        .upsert(row);

      if (error) throw error;
    } catch (e) {
      console.error('Error guardando usuario en Supabase:', e);
    }
  }

  const existing = await getAdminUsers();
  const idx = existing.findIndex(u => u.id === id);
  let updated;
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = { ...userData, id };
  } else {
    updated = [...existing, { ...userData, id }];
  }
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  return { ...userData, id };
}

export async function deleteAdminUser(userId) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (e) {
      console.error('Error eliminando usuario en Supabase:', e);
    }
  }

  const existing = await getAdminUsers();
  const updated = existing.filter(u => u.id !== userId);
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  return true;
}



export async function verifyAdminLogin(identifier, pin) {
  const users = await getAdminUsers();
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanPin = String(pin || '').trim();

  // Verificación contra lista de usuarios administradores
  const user = users.find(u => 
    u.activo !== false && 
    (u.username.toLowerCase() === cleanId || (u.email && u.email.toLowerCase() === cleanId)) &&
    u.pin === cleanPin
  );

  if (user) {
    return { success: true, user };
  }

  // Respaldo PIN maestro por variable de entorno
  const masterPin = import.meta.env.VITE_ADMIN_PIN || 'admin123';
  if ((cleanId === 'admin' || cleanId === 'administrador') && cleanPin === masterPin) {
    return {
      success: true,
      user: {
        id: 'usr_master_admin',
        nombre: 'Super Administrador (Clave Maestra)',
        username: 'admin',
        rol: 'Super Admin',
        email: 'administracion@copanavidadlmsc.com'
      }
    };
  }

  return { success: false, error: 'Credenciales inválidas o usuario inactivo.' };
}

// Aliases de compatibilidad con Firebase
export const isFirebaseConfigured = isSupabaseConfigured;
export const getActiveFirebaseConfig = getActiveSupabaseConfig;
export const saveCustomFirebaseConfig = saveCustomSupabaseConfig;
export const clearCustomFirebaseConfig = clearCustomSupabaseConfig;
export const getFirebaseProjectId = getSupabaseProjectRef;
