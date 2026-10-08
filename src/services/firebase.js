import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';

// Obtención de variables de entorno de Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verifica si las credenciales mínimas de Firebase están completas
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.projectId && 
    firebaseConfig.apiKey !== 'tu_api_key_aqui' &&
    firebaseConfig.projectId !== 'tu-proyecto-id'
  );
};

let db = null;

if (isFirebaseConfigured()) {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    console.log('✅ Firebase Firestore inicializado con éxito');
  } catch (error) {
    console.error('⚠️ Error al inicializar Firebase:', error);
  }
} else {
  console.warn('ℹ️ Firebase no configurado aún en .env. Se usará almacenamiento local de prueba para desarrollo.');
}

const COLLECTION_NAME = 'inscripciones_copa_navidad';
const CONFIG_COLLECTION = 'configuracion_torneo';
const LANDING_CONFIG_DOC = 'landing_textos';
const SPONSORS_COLLECTION = 'patrocinadores_copa_navidad';

const LOCAL_STORAGE_KEY = 'copa_navidad_local_registrations';
const LOCAL_STORAGE_CONFIG_KEY = 'copa_navidad_local_config';
const LOCAL_STORAGE_LANDING_CONFIG_KEY = 'copa_navidad_landing_config';
const LOCAL_STORAGE_SPONSORS_KEY = 'copa_navidad_local_sponsors';
const USERS_CONFIG_DOC = 'usuarios_admin';
const LOCAL_STORAGE_USERS_KEY = 'copa_navidad_admin_users';

// Estados válidos para los jugadores
export const PLAYER_STATUSES = [
  'preinscrito',
  'esperando pago',
  'confirmado',
  'retirado',
  'suspendido',
  'lista de espera'
];

export const DEFAULT_MAX_PAIRS_PER_CATEGORY = 24;

// Roles de usuario para administración
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

// Configuración por defecto de la Landing y Textos
export const DEFAULT_LANDING_CONFIG = {
  heroCintillo: 'Cupos Limitados',
  heroTitulo: '¡Inscripciones abiertas!',
  heroSubtitulo: 'Cierra el año compitiendo en el evento de pádel más importante del oriente del país. Válido por 500 puntos para el ranking oficial de la Federación Venezolana de Pádel (FVP). Reúne a tu dupla y asegura tu cupo en la grilla oficial.',
  heroFechas: 'del 7 al 12 de diciembre',
  heroSede: 'La Marina Sport Club, Lechería',
  parejasSubtitulo: 'Listado oficial de duplas con inscripción y pago verificado por el comité organizador',
  cuposLimitados: 'Cupos Limitados',
  montoInscripcion: '$150',
  
  // Detalles bancarios y de pago
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
- Calentamiento en pista: El peloteo de cortesía no podrá exceder de cinco (5) minutos cronometrados una vez que ambos equipos se encuentren en cancha.
- Tolerancia máxima: Se establece un margen de tolerancia estricto de quince (15) minutos contados a partir del horario oficial fijado para el encuentro.
- Decretación de W.O.: Transcurridos los 15 minutos de cortesía sin la comparecencia de la pareja completa, el Juez Árbitro decretará Walkover (W.O.) automático a favor de la dupla presente, registrándose resultado oficial de 6-0 / 6-0.

3. INDUMENTARIA DEPORTIVA Y CALZADO TÉCNICO
- Calzado reglamentario: Es de uso estrictamente obligatorio calzado específico para pádel o tenis con suela de espiga (clay) o suela omni. Queda terminantemente prohibido el ingreso a las pistas con calzado de running, suelas lisas o calzado urbano que comprometa la adherencia o deteriore la superficie sintética.
- Vestimenta oficial: Los competidores deberán presentarse con vestimenta deportiva reglamentaria (franela técnica oficial del torneo o indumentaria deportiva con mangas/sin mangas de corte atlético, y pantalón corto o falda deportiva equipada con bolsillos para portar pelotas de juego).
- Prohibiciones: No se permitirá competir con el torso descubierto ni con prendas informales que atenten contra el decoro del torneo federado.

4. FORMATO DE JUEGO Y SISTEMA DE PUNTUACIÓN
- Partidos de cuadro y fase clasificatoria: Los partidos se disputarán al mejor de dos (2) sets regulares con aplicación estricta de la regla de Punto de Oro (Golden Point) en situaciones de 40-40 (deuce). En el punto de oro, los restadores seleccionan el lado de recepción del servicio.
- Definición en caso de empate a un set (1-1): En caso de paridad a un set por lado, la definición se llevará a cabo mediante un Súper Tie-Break a diez (10) puntos, con ventaja mínima obligatoria de dos (2) puntos.
- Finales de categoría: El Comité Organizador y la Dirección Técnica podrán determinar que los partidos finales de categorías principales se jueguen al mejor de 3 sets completos tradicionales.

5. CÓDIGO DE CONDUCTA DEPORTIVA Y FAIR PLAY
- Comportamiento ético: Se exige el máximo respeto, compañerismo y fair play dentro y fuera de la pista hacia rivales, compañeros de juego, jueces árbitros y espectadores.
- Faltas sancionables: Constituyen infracciones graves el abuso verbal o gestual, arrojar la pala o golpear intencionalmente las pelotas contra cristales o estructuras del club, y la falta de respeto a los árbitros o directivos.
- Tabla progresiva de sanciones: Se aplicará el régimen oficial:
  * 1ra infracción: Advertencia formal (Warning).
  * 2da infracción: Pérdida de un punto.
  * 3ra infracción: Pérdida de un juego.
  * 4ta infracción: Descalificación inmediata (Default) y expulsión del torneo.

6. POLÍTICA DE SUSTITUCIÓN DE JUGADORES
- Plazo y condiciones: Solo se permitirá la sustitución de un jugador por causas de fuerza mayor o lesión médica comprobada, siempre y cuando la solicitud sea elevada a la Comisión Técnica ANTES de que la pareja dispute su primer partido del cuadro oficial.
- Criterio de equivalencia: El jugador sustituto debe militar estrictamente en la misma categoría del torneo o en una inferior, sin sobrepasar el nivel técnico permitido. No se autorizarán sustituciones que alteren indebidamente la jerarquía competitiva de la categoría.
- Prohibición durante la competencia: Una vez que una dupla dispute su primer punto del torneo, no se autorizará ningún tipo de sustitución. La imposibilidad de continuar de un integrante derivará en el abandono reglamentario del partido y la pérdida de los puntos en disputa.

7. POLÍTICA DE PAGOS, CANCELACIONES Y REEMBOLSOS
- Cobertura de la inscripción: La inversión de $150 por pareja cubre el derecho a competir, arbitraje oficial, hidratación en pista, pelotas oficiales de torneo y kit de bienvenida oficial.
- Política de no reembolso: Una vez formalizada la inscripción y confirmada la plaza mediante la recepción del comprobante de pago, la organización NO realizará devoluciones ni reembolsos monetarios en efectivo.
- Cancelaciones anticipadas: En caso de que una pareja deba retirarse por causa mayor comprobada con un mínimo de 72 horas de antelación al sorteo de cuadros, podrá solicitar el traspaso de su cupo a otra dupla elegible o conservar el crédito para el siguiente evento oficial del club.
- Clima y fuerza mayor: La eventual reprogramación de horarios o jornadas a causa de lluvias o factores climáticos imprevistos no dará lugar a reclamaciones económicas ni solicitudes de reintegro.

8. ACEPTACIÓN PLENA Y DECLARACIÓN JURADA
La inscripción en la Copa Navidad LMSC 2026 implica el conocimiento íntegro, expreso y sin reservas de todas las cláusulas contenidas en este reglamento por parte de ambos jugadores que conforman la dupla.`
};

// Patrocinadores por defecto con tamaño personalizable (logoHeight en px)
export const INITIAL_SPONSORS = [
  {
    id: 'sp_1',
    name: 'Colegio Juan XXIII',
    tier: 'Auspiciador Principal',
    logo: '/assets/LOGO-JUAN-XXIII-WHT.png',
    link: 'https://www.instagram.com',
    isHero: true,
    logoHeight: 110
  }
];

// ==================== GESTIÓN DE CONFIGURACIÓN DE LANDING & REGLAMENTO ====================

/**
 * Obtiene la configuración de textos y reglamento de la Landing
 */
export async function getLandingConfig() {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, LANDING_CONFIG_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...DEFAULT_LANDING_CONFIG, ...snap.data() };
      }
    } catch (e) {
      console.error('Error al obtener configuración de Landing de Firestore:', e);
    }
  }

  const local = localStorage.getItem(LOCAL_STORAGE_LANDING_CONFIG_KEY);
  if (local) {
    try {
      return { ...DEFAULT_LANDING_CONFIG, ...JSON.parse(local) };
    } catch (err) {
      console.error('Error parseando configuración local:', err);
    }
  }

  return DEFAULT_LANDING_CONFIG;
}

/**
 * Guarda la configuración de textos y reglamento en Firestore y LocalStorage
 */
export async function saveLandingConfig(config) {
  const merged = { ...DEFAULT_LANDING_CONFIG, ...config };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, LANDING_CONFIG_DOC);
      await setDoc(docRef, merged, { merge: true });
    } catch (e) {
      console.error('Error al guardar configuración de Landing en Firestore:', e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_LANDING_CONFIG_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('landing_config_updated', { detail: merged }));
  return true;
}

/**
 * Suscripción en tiempo real a la configuración de textos y reglamento
 */
export function subscribeToLandingConfig(callback) {
  if (isFirebaseConfigured() && db) {
    const docRef = doc(db, CONFIG_COLLECTION, LANDING_CONFIG_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_LANDING_CONFIG, ...docSnap.data() });
      } else {
        callback(DEFAULT_LANDING_CONFIG);
      }
    }, (error) => {
      console.error('Error en listener de landing config Firestore:', error);
      callback(DEFAULT_LANDING_CONFIG);
    });
  } else {
    const emit = () => {
      const local = localStorage.getItem(LOCAL_STORAGE_LANDING_CONFIG_KEY);
      if (local) {
        try {
          callback({ ...DEFAULT_LANDING_CONFIG, ...JSON.parse(local) });
          return;
        } catch (e) {}
      }
      callback(DEFAULT_LANDING_CONFIG);
    };

    emit();
    const handleCustom = (ev) => {
      if (ev.detail) callback(ev.detail);
      else emit();
    };

    window.addEventListener('landing_config_updated', handleCustom);
    window.addEventListener('storage', emit);
    return () => {
      window.removeEventListener('landing_config_updated', handleCustom);
      window.removeEventListener('storage', emit);
    };
  }
}

// ==================== LÍMITES DE CUPOS POR CATEGORÍA ====================

/**
 * Obtiene límites de cupos por categoría
 */
export async function getCategoryLimits() {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, 'cupos_categorias');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.error('Error al obtener cupos de Firestore:', e);
    }
  }
  const local = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
  return local ? JSON.parse(local) : { defaultMax: DEFAULT_MAX_PAIRS_PER_CATEGORY };
}

/**
 * Guarda límites de cupos por categoría
 */
export async function saveCategoryLimits(limitsData) {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, 'cupos_categorias');
      await setDoc(docRef, limitsData, { merge: true });
      return true;
    } catch (e) {
      console.error('Error al guardar cupos en Firestore:', e);
    }
  }
  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(limitsData));
  return true;
}

// ==================== INSCRIPCIONES ====================

/**
 * Guarda una nueva inscripción en Firestore o en fallback local
 * Soporta todos los campos exhaustivos de Jugador 1 y Jugador 2:
 * nombre, cedula, email, telefono, tallaFranela, ladoJuego, categoriaHabitual,
 * torneoActual, historialTorneos, alergias, aceptaReglamento, metodoPago, referenciaPago, comprobantePagoUrl
 */
export async function saveRegistration(registrationData) {
  const timestamp = new Date().toISOString();
  
  // Determinamos el status inicial: si ya se superó el límite va a 'lista de espera'
  const allCurrent = await getRegistrations();
  const categoryPairsCount = allCurrent.filter(
    r => r.categoria === registrationData.categoria && r.status !== 'retirado'
  ).length;

  const limits = await getCategoryLimits();
  const maxForCat = limits[registrationData.categoria] || limits.defaultMax || DEFAULT_MAX_PAIRS_PER_CATEGORY;
  
  const initialStatus = categoryPairsCount >= maxForCat 
    ? 'lista de espera' 
    : (registrationData.comprobantePagoUrl || registrationData.referenciaPago ? 'esperando pago' : 'preinscrito');

  const finalData = {
    ...registrationData,
    status: initialStatus,
    monto: registrationData.monto || '$150',
    createdAtISO: timestamp
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...finalData,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id, status: initialStatus, isLocal: false };
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      throw error;
    }
  } else {
    // Fallback de desarrollo con localStorage
    const localId = 'loc_' + Date.now();
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const newEntry = {
      ...finalData,
      id: localId,
      isLocal: true
    };
    existing.unshift(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    return { success: true, id: localId, status: initialStatus, isLocal: true };
  }
}

/**
 * Actualiza el status del jugador/pareja (solo desde el admin)
 */
export async function updateRegistrationStatus(id, newStatus) {
  if (isFirebaseConfigured() && db && !id.startsWith('loc_')) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error('Error al actualizar status en Firestore:', e);
      throw e;
    }
  } else {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const updated = existing.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus, updatedAtISO: new Date().toISOString() };
      }
      return item;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return true;
  }
}

/**
 * Actualiza los datos de pago y comprobante de una inscripción
 */
export async function updateRegistrationPayment(id, paymentData) {
  if (isFirebaseConfigured() && db && !id.startsWith('loc_')) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { 
        ...paymentData,
        status: 'esperando pago',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error('Error al actualizar pago en Firestore:', e);
      throw e;
    }
  } else {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const updated = existing.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          ...paymentData, 
          status: 'esperando pago',
          updatedAtISO: new Date().toISOString() 
        };
      }
      return item;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return true;
  }
}

/**
 * Obtiene todas las inscripciones
 */
export async function getRegistrations() {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          ...data,
          status: data.status || data.estado?.toLowerCase() || 'preinscrito',
          createdAtFormatted: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('es-ES') : data.createdAtISO || 'Reciente'
        });
      });
      return list;
    } catch (error) {
      console.error('Error al obtener inscripciones de Firestore:', error);
      throw error;
    }
  } else {
    const list = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return list.map(item => ({
      ...item,
      status: item.status || item.estado?.toLowerCase() || 'preinscrito',
      createdAtFormatted: item.createdAtISO ? new Date(item.createdAtISO).toLocaleString('es-ES') : 'Reciente'
    }));
  }
}

/**
 * Suscripción en tiempo real a las inscripciones
 */
export function subscribeToRegistrations(callback) {
  if (isFirebaseConfigured() && db) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          ...data,
          status: data.status || data.estado?.toLowerCase() || 'preinscrito',
          createdAtFormatted: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('es-ES') : data.createdAtISO || 'Reciente'
        });
      });
      callback(list);
    }, (error) => {
      console.error('Error en listener Firestore:', error);
    });
  } else {
    const emit = () => {
      const list = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      callback(list.map(item => ({
        ...item,
        status: item.status || item.estado?.toLowerCase() || 'preinscrito',
        createdAtFormatted: item.createdAtISO ? new Date(item.createdAtISO).toLocaleString('es-ES') : 'Reciente'
      })));
    };
    emit();
    window.addEventListener('storage', emit);
    return () => window.removeEventListener('storage', emit);
  }
}

/**
 * Elimina una inscripción por ID
 */
export async function deleteRegistration(id) {
  if (isFirebaseConfigured() && db && !id.startsWith('loc_')) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } else {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}

// ==================== PATROCINADORES Y ALIADOS ====================

/**
 * Obtener todos los patrocinadores
 */
export async function getSponsors() {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, SPONSORS_COLLECTION));
      if (!snap.empty) {
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        return list;
      }
    } catch (e) {
      console.error('Error al obtener sponsors de Firestore:', e);
    }
  }
  const local = localStorage.getItem(LOCAL_STORAGE_SPONSORS_KEY);
  if (!local) {
    localStorage.setItem(LOCAL_STORAGE_SPONSORS_KEY, JSON.stringify(INITIAL_SPONSORS));
    return INITIAL_SPONSORS;
  }
  try {
    const parsed = JSON.parse(local);
    // Filtramos sponsors de semillas anteriores (ej. sp_2, sp_3 o logos viejos)
    const cleanList = parsed.filter(s => 
      !s.logo?.includes('sponsor_el_parador') && 
      s.id !== 'sp_2' && 
      s.id !== 'sp_3'
    );
    if (cleanList.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_SPONSORS_KEY, JSON.stringify(INITIAL_SPONSORS));
      return INITIAL_SPONSORS;
    }
    return cleanList;
  } catch (err) {
    return INITIAL_SPONSORS;
  }
}

/**
 * Guardar o actualizar un patrocinador (incluye logoHeight en px)
 */
export async function saveSponsor(sponsor) {
  const id = sponsor.id || 'sp_' + Date.now();
  const sponsorData = { 
    ...sponsor, 
    id,
    logoHeight: Number(sponsor.logoHeight) || 65
  };

  if (isFirebaseConfigured() && db && !id.startsWith('sp_')) {
    try {
      await setDoc(doc(db, SPONSORS_COLLECTION, id), sponsorData, { merge: true });
      return id;
    } catch (e) {
      console.error('Error al guardar sponsor en Firestore:', e);
    }
  }

  const current = await getSponsors();
  const index = current.findIndex(s => s.id === id);
  if (index >= 0) {
    current[index] = sponsorData;
  } else {
    current.push(sponsorData);
  }
  localStorage.setItem(LOCAL_STORAGE_SPONSORS_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('sponsors_updated'));
  return id;
}

/**
 * Eliminar patrocinador
 */
export async function deleteSponsor(id) {
  if (isFirebaseConfigured() && db && !id.startsWith('sp_')) {
    try {
      await deleteDoc(doc(db, SPONSORS_COLLECTION, id));
    } catch (e) {
      console.error('Error eliminando sponsor en Firestore:', e);
    }
  }
  const current = await getSponsors();
  const filtered = current.filter(s => s.id !== id);
  localStorage.setItem(LOCAL_STORAGE_SPONSORS_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('sponsors_updated'));
  return true;
}

// ==================== GESTIÓN DE USUARIOS Y ROLES ADMIN ====================

/**
 * Obtener todos los usuarios con roles de administración
 */
export async function getAdminUsers() {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, USERS_CONFIG_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().users) {
        return snap.data().users;
      }
    } catch (e) {
      console.error('Error al obtener usuarios admin de Firestore:', e);
    }
  }
  const local = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (!local) {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ADMIN_USERS));
    return DEFAULT_ADMIN_USERS;
  }
  return JSON.parse(local);
}

/**
 * Guardar o actualizar usuario administrador
 */
export async function saveAdminUser(userData) {
  const users = await getAdminUsers();
  const id = userData.id || 'usr_' + Date.now();
  const newUser = {
    ...userData,
    id,
    fechaCreacion: userData.fechaCreacion || new Date().toISOString(),
    activo: userData.activo !== undefined ? userData.activo : true
  };

  const index = users.findIndex(u => u.id === id);
  if (index >= 0) {
    users[index] = newUser;
  } else {
    users.push(newUser);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, USERS_CONFIG_DOC);
      await setDoc(docRef, { users }, { merge: true });
    } catch (e) {
      console.error('Error al guardar usuarios en Firestore:', e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('admin_users_updated'));
  return newUser;
}

/**
 * Eliminar usuario administrador
 */
export async function deleteAdminUser(userId) {
  const users = await getAdminUsers();
  // No permitir borrar el último super admin
  const filtered = users.filter(u => u.id !== userId);
  if (filtered.length === 0) {
    throw new Error('No es posible eliminar a todos los administradores. Debe quedar al menos un usuario activo.');
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, USERS_CONFIG_DOC);
      await setDoc(docRef, { users: filtered }, { merge: true });
    } catch (e) {
      console.error('Error al eliminar usuario en Firestore:', e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('admin_users_updated'));
  return true;
}

/**
 * Verificar credenciales de login admin
 * Soporta Master PIN del .env o credenciales de cualquier usuario registrado activo
 */
export async function verifyAdminLogin(identifier, pin) {
  const cleanPin = (pin || '').trim();
  const cleanId = (identifier || '').trim().toLowerCase();
  const masterPin = (import.meta.env.VITE_ADMIN_PIN || 'admin123').trim();

  // Si solo ingresa el Master PIN o coincide
  if (!cleanId && cleanPin === masterPin) {
    return {
      success: true,
      user: {
        nombre: 'Super Administrador (PIN Maestro)',
        username: 'master_admin',
        rol: 'Super Admin'
      }
    };
  }

  if (cleanPin === masterPin && (!cleanId || cleanId === 'admin')) {
    return {
      success: true,
      user: {
        nombre: 'Administrador Principal',
        username: 'admin',
        rol: 'Super Admin'
      }
    };
  }

  // Buscar en usuarios configurados
  const users = await getAdminUsers();
  const foundUser = users.find(u => {
    if (!u.activo) return false;
    const matchId = !cleanId || 
                    u.username?.toLowerCase() === cleanId || 
                    u.email?.toLowerCase() === cleanId;
    const matchPin = (u.pin || '').trim() === cleanPin;
    return matchId && matchPin;
  });

  if (foundUser) {
    return {
      success: true,
      user: foundUser
    };
  }

  return {
    success: false,
    error: 'Credenciales incorrectas o usuario inactivo.'
  };
}

export { db };
