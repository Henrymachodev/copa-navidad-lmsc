import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  Trophy, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  DollarSign, 
  ExternalLink, 
  UploadCloud, 
  FileText, 
  FileCheck, 
  X, 
  AlertTriangle,
  FileCheck2,
  Info,
  Activity,
  HeartPulse,
  Award,
  Download
} from 'lucide-react';
import { 
  saveRegistration, 
  getRegistrations, 
  getCategoryLimits, 
  DEFAULT_MAX_PAIRS_PER_CATEGORY,
  subscribeToLandingConfig,
  DEFAULT_LANDING_CONFIG
} from '../services/firebase';
import { sendConfirmationEmails } from '../services/emailService';

export const CATEGORIAS = [
  // Masculino: 2da a 7ma
  { id: '2da-masc', label: '2da Masculino', group: 'Masculino' },
  { id: '3ra-masc', label: '3ra Masculino', group: 'Masculino' },
  { id: '4ta-masc', label: '4ta Masculino', group: 'Masculino' },
  { id: '5ta-masc', label: '5ta Masculino', group: 'Masculino' },
  { id: '6ta-masc', label: '6ta Masculino', group: 'Masculino' },
  { id: '7ma-masc', label: '7ma Masculino', group: 'Masculino' },

  // Máster Masculino: +45 y +55
  { id: 'master-45-masc', label: 'Master +45 Masculino', group: 'Máster Masculino' },
  { id: 'master-55-masc', label: 'Master +55 Masculino', group: 'Máster Masculino' },

  // Femenino: 3ra a 7ma
  { id: '3ra-fem', label: '3ra Femenino', group: 'Femenino' },
  { id: '4ta-fem', label: '4ta Femenino', group: 'Femenino' },
  { id: '5ta-fem', label: '5ta Femenino', group: 'Femenino' },
  { id: '6ta-fem', label: '6ta Femenino', group: 'Femenino' },
  { id: '7ma-fem', label: '7ma Femenino', group: 'Femenino' },

  // Máster Femenino
  { id: 'master-fem', label: 'Master Femenino', group: 'Máster Femenino' },
];

export const TALLAS_FRANELA = ['S', 'M', 'L', 'XL', 'XXL'];
export const LADOS_JUEGO = ['Derecha', 'Revés', 'Ambos'];
export const METODOS_PAGO = [
  { id: 'pago-movil', label: 'Pago Móvil' },
  { id: 'zelle', label: 'Zelle' },
  { id: 'banesco-panama', label: 'Banesco Panamá' },
  { id: 'binance-pay', label: 'Binance Pay' },
];

const emptyPlayer = () => ({
  nombre: '',
  cedula: '',
  email: '',
  telefono: '',
  tallaFranela: '',
  ladoJuego: '',
  categoriaHabitual: '',
  torneoActual: '',
  historialTorneos: '',
  alergias: '',
  aceptaReglamento: '' // 'si' | 'no'
});

export default function RegistrationForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    categoria: '',
    metodoPago: '',
    monto: '$150',
    referenciaPago: '',
    comprobantePagoUrl: '',
    comprobanteNombre: '',
    comprobanteTipo: '',
    comprobanteSize: 0,
    jugador1: emptyPlayer(),
    jugador2: emptyPlayer(),
    aceptaReglamento: '' // 'si' | 'no'
  });

  const [landingConfig, setLandingConfig] = useState(DEFAULT_LANDING_CONFIG);
  const [showReglamentoModal, setShowReglamentoModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [existingRegistrations, setExistingRegistrations] = useState([]);
  const [categoryLimits, setCategoryLimits] = useState({});

  // Cargar cupos actuales y configuración
  useEffect(() => {
    async function loadData() {
      try {
        const regs = await getRegistrations();
        setExistingRegistrations(regs);
        const limits = await getCategoryLimits();
        setCategoryLimits(limits);
      } catch (err) {
        console.error('Error cargando conteo de parejas:', err);
      }
    }
    loadData();

    const unsubConfig = subscribeToLandingConfig((cfg) => {
      setLandingConfig(cfg);
    });

    return () => {
      if (typeof unsubConfig === 'function') unsubConfig();
    };
  }, []);

  // Calcular conteo y cupos disponibles para la categoría seleccionada
  const selectedCategoryCount = formData.categoria 
    ? existingRegistrations.filter(r => r.categoria === formData.categoria && r.status !== 'retirado').length 
    : 0;

  const maxAllowedForCat = (formData.categoria && categoryLimits[formData.categoria]) 
    || categoryLimits.defaultMax 
    || DEFAULT_MAX_PAIRS_PER_CATEGORY;

  const isWaitlist = formData.categoria && selectedCategoryCount >= maxAllowedForCat;

  // Manejar cambios en campos simples
  const handleSimpleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Manejar cambios de jugadores
  const handlePlayerChange = (playerKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [playerKey]: {
        ...prev[playerKey],
        [field]: value
      }
    }));

    const errorKey = `${playerKey}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: null }));
    }
  };

  // Manejar carga de archivo de comprobante de pago (< 1MB)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 1048576; // 1 MB en bytes
    if (file.size > MAX_SIZE) {
      setErrors(prev => ({
        ...prev,
        comprobante: `El archivo supera el límite de 1 MB (pesa ${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor comprímelo o sube un comprobante menor a 1 MB.`
      }));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setFormData(prev => ({
        ...prev,
        comprobantePagoUrl: base64Data,
        comprobanteNombre: file.name,
        comprobanteTipo: file.type,
        comprobanteSize: file.size
      }));
      setErrors(prev => ({ ...prev, comprobante: null }));
    };
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, comprobante: 'Error al leer el archivo. Intenta con otra imagen o PDF.' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      comprobantePagoUrl: '',
      comprobanteNombre: '',
      comprobanteTipo: '',
      comprobanteSize: 0
    }));
  };

  // Validaciones completas
  const validate = () => {
    const newErrors = {};

    // Categoría
    if (!formData.categoria) {
      newErrors.categoria = 'Por favor selecciona la categoría de la pareja';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+() -]{7,20}$/;

    // Función auxiliar para validar a un jugador
    const validatePlayer = (playerKey, label) => {
      const p = formData[playerKey];

      if (!p.nombre.trim()) {
        newErrors[`${playerKey}.nombre`] = `Nombre y Apellido de ${label} es obligatorio`;
      }
      if (!p.cedula.trim()) {
        newErrors[`${playerKey}.cedula`] = `Cédula de Identidad de ${label} es obligatoria`;
      }
      if (!p.email.trim()) {
        newErrors[`${playerKey}.email`] = `Correo Electrónico de ${label} es obligatorio`;
      } else if (!emailRegex.test(p.email.trim())) {
        newErrors[`${playerKey}.email`] = `Ingresa un correo electrónico válido para ${label}`;
      }
      if (!p.telefono.trim()) {
        newErrors[`${playerKey}.telefono`] = `Número de Teléfono de ${label} es obligatorio`;
      } else if (!phoneRegex.test(p.telefono.trim())) {
        newErrors[`${playerKey}.telefono`] = `Ingresa un número de teléfono válido para ${label}`;
      }
      if (!p.tallaFranela) {
        newErrors[`${playerKey}.tallaFranela`] = `Selecciona la Talla de Franela de ${label}`;
      }
      if (!p.ladoJuego) {
        newErrors[`${playerKey}.ladoJuego`] = `Selecciona el Lado de Juego de ${label}`;
      }
      if (!p.categoriaHabitual.trim()) {
        newErrors[`${playerKey}.categoriaHabitual`] = `Indica la Categoría Habitual de Juego de ${label}`;
      }
      if (!p.torneoActual.trim()) {
        newErrors[`${playerKey}.torneoActual`] = `Indica la Liga o Torneo donde participas actualmente (${label}) (o escribe 'Ninguno')`;
      }
      if (!p.historialTorneos.trim()) {
        newErrors[`${playerKey}.historialTorneos`] = `Indica el Historial de los últimos torneos jugados de ${label}`;
      }
      if (!p.alergias.trim()) {
        newErrors[`${playerKey}.alergias`] = `Especifica alergias o restricciones alimenticias de ${label} (o escribe 'Ninguna')`;
      }
      if (p.aceptaReglamento !== 'si') {
        newErrors[`${playerKey}.aceptaReglamento`] = `${label} debe aceptar y confirmar el reglamento del club (selecciona 'Sí')`;
      }
    };

    validatePlayer('jugador1', 'Jugador 1');
    validatePlayer('jugador2', 'Jugador 2');

    // Comprobación de que no se repita el correo
    if (
      formData.jugador1.email.trim() && 
      formData.jugador2.email.trim() &&
      formData.jugador1.email.trim().toLowerCase() === formData.jugador2.email.trim().toLowerCase()
    ) {
      newErrors['jugador2.email'] = 'El correo del Jugador 2 debe ser distinto al del Jugador 1';
    }

    // Comprobación de que no se repita la cédula
    if (
      formData.jugador1.cedula.trim() && 
      formData.jugador2.cedula.trim() &&
      formData.jugador1.cedula.trim().toLowerCase() === formData.jugador2.cedula.trim().toLowerCase()
    ) {
      newErrors['jugador2.cedula'] = 'La cédula del Jugador 2 debe ser distinta a la del Jugador 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      const firstErrorElement = document.querySelector('.border-red-500, .text-red-400');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      // 1. Guardar en Firestore / LocalStorage
      const result = await saveRegistration(formData);

      // 2. Enviar correos de confirmación
      await sendConfirmationEmails(formData);

      // 3. Notificar a componente padre para modal de confirmación
      onSuccess({
        id: result.id,
        status: result.status,
        ...formData
      });

      // Limpiar formulario
      setFormData({
        categoria: '',
        metodoPago: '',
        monto: '$150',
        referenciaPago: '',
        comprobantePagoUrl: '',
        comprobanteNombre: '',
        comprobanteTipo: '',
        comprobanteSize: 0,
        jugador1: emptyPlayer(),
        jugador2: emptyPlayer(),
        aceptaReglamento: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Error al enviar inscripción:', err);
      setSubmitError('Hubo un inconveniente al registrar la inscripción. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener detalle bancario dinámico según método de pago
  const getMetodoDetalle = () => {
    switch (formData.metodoPago) {
      case 'Pago Móvil':
        return landingConfig.pagoMovilDetalle;
      case 'Zelle':
        return landingConfig.zelleDetalle;
      case 'Banesco Panamá':
        return landingConfig.banescoPanamaDetalle;
      case 'Binance Pay':
        return landingConfig.binancePayDetalle;
      default:
        return null;
    }
  };

  // Renderizador de campos para un jugador con tarjeta blanca de máxima legibilidad y sin truncamiento
  const renderPlayerForm = (playerKey, playerTitle, numberBadge) => {
    const p = formData[playerKey];

    return (
      <div className="form-card bg-white p-5 sm:p-7 rounded-3xl border border-blue-200/60 shadow-2xl relative space-y-4 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#150D8B] text-[#A3E229] border border-[#150D8B] flex items-center justify-center font-orbitron font-black text-sm shadow-md">
              {numberBadge}
            </div>
            <h3 className="text-lg sm:text-xl font-orbitron font-black text-[#150D8B] tracking-wide">
              {playerTitle}
            </h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-rose-600 uppercase tracking-wider">
            * Campos obligatorios
          </span>
        </div>

        {/* Fila: Nombre y Apellido + Cédula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Nombre y Apellido <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ej: Carlos Mendoza"
                value={p.nombre}
                onChange={(e) => handlePlayerChange(playerKey, 'nombre', e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                  errors[`${playerKey}.nombre`] 
                    ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                    : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
                }`}
              />
            </div>
            {errors[`${playerKey}.nombre`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.nombre`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Cédula de Identidad <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: V-18.456.789"
              value={p.cedula}
              onChange={(e) => handlePlayerChange(playerKey, 'cedula', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                errors[`${playerKey}.cedula`] 
                  ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                  : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
              }`}
            />
            {errors[`${playerKey}.cedula`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.cedula`]}
              </p>
            )}
          </div>
        </div>

        {/* Fila: Correo + Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={p.email}
                onChange={(e) => handlePlayerChange(playerKey, 'email', e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                  errors[`${playerKey}.email`] 
                    ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                    : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
                }`}
              />
            </div>
            {errors[`${playerKey}.email`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.email`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Número de Teléfono / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                placeholder="+58 414 1234567"
                value={p.telefono}
                onChange={(e) => handlePlayerChange(playerKey, 'telefono', e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                  errors[`${playerKey}.telefono`] 
                    ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                    : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
                }`}
              />
            </div>
            {errors[`${playerKey}.telefono`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.telefono`]}
              </p>
            )}
          </div>
        </div>

        {/* Fila: Talla Franela + Lado de Juego con chips táctiles sin truncamiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Talla de Franela Oficial <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {TALLAS_FRANELA.map((talla) => (
                <button
                  type="button"
                  key={talla}
                  onClick={() => handlePlayerChange(playerKey, 'tallaFranela', talla)}
                  className={`min-h-[42px] py-2 px-1 flex items-center justify-center text-xs font-black rounded-xl border transition-all duration-200 select-none active:scale-95 leading-none text-center ${
                    p.tallaFranela === talla
                      ? 'bg-[#150D8B] text-[#A3E229] border-[#150D8B] shadow-md font-black'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span className="w-full block text-center whitespace-nowrap">{talla}</span>
                </button>
              ))}
            </div>
            {errors[`${playerKey}.tallaFranela`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.tallaFranela`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Lado de Juego <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {LADOS_JUEGO.map((lado) => (
                <button
                  type="button"
                  key={lado}
                  onClick={() => handlePlayerChange(playerKey, 'ladoJuego', lado)}
                  className={`min-h-[42px] py-2 px-1 sm:px-2 flex items-center justify-center text-xs font-black rounded-xl border transition-all duration-200 select-none active:scale-95 leading-none text-center ${
                    p.ladoJuego === lado
                      ? 'bg-[#150D8B] text-[#A3E229] border-[#150D8B] shadow-md font-black'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span className="w-full text-center whitespace-nowrap">{lado}</span>
                </button>
              ))}
            </div>
            {errors[`${playerKey}.ladoJuego`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.ladoJuego`]}
              </p>
            )}
          </div>
        </div>

        {/* Fila: Categoría habitual + Liga/Torneo actual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Categoría Habitual de Juego <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. 4ta Categoría / 5ta FVP"
              value={p.categoriaHabitual}
              onChange={(e) => handlePlayerChange(playerKey, 'categoriaHabitual', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                errors[`${playerKey}.categoriaHabitual`] 
                  ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                  : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
              }`}
            />
            {errors[`${playerKey}.categoriaHabitual`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.categoriaHabitual`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Liga o Torneo donde participas actualmente <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Circuito FVP Oriente / Liga Local / Ninguno"
              value={p.torneoActual}
              onChange={(e) => handlePlayerChange(playerKey, 'torneoActual', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                errors[`${playerKey}.torneoActual`] 
                  ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                  : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
              }`}
            />
            {errors[`${playerKey}.torneoActual`] && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.torneoActual`]}
              </p>
            )}
          </div>
        </div>

        {/* Historial de últimos torneos */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Historial de últimos torneos jugados (Nivel y resultados) <span className="text-rose-500">*</span>
            </span>
          </label>
          <textarea
            rows="2"
            placeholder="Ej. Torneo Aniversario LMSC: Campeón 5ta Cat; 2da Nacional FVP: Cuartos de final..."
            value={p.historialTorneos}
            onChange={(e) => handlePlayerChange(playerKey, 'historialTorneos', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 transition-all resize-none ${
              errors[`${playerKey}.historialTorneos`] 
                ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
            }`}
          ></textarea>
          {errors[`${playerKey}.historialTorneos`] && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors[`${playerKey}.historialTorneos`]}
            </p>
          )}
        </div>

        {/* Alergias o restricciones alimenticias */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            ¿Padece alguna alergia o restricción alimenticia? <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej. Ninguna / Alérgico a mariscos / Intolerancia a la lactosa"
            value={p.alergias}
            onChange={(e) => handlePlayerChange(playerKey, 'alergias', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
              errors[`${playerKey}.alergias`] 
                ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
            }`}
          />
          {errors[`${playerKey}.alergias`] && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors[`${playerKey}.alergias`]}
            </p>
          )}
        </div>

        {/* Aceptación del reglamento por jugador con chips interactivos */}
        <div className="pt-2 bg-slate-100/90 p-4 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-black text-slate-900">
              ¿Acepta y confirma el reglamento del club? <span className="text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2 sm:w-auto w-full">
              <button
                type="button"
                onClick={() => handlePlayerChange(playerKey, 'aceptaReglamento', 'si')}
                className={`px-4 py-2 text-xs font-black rounded-xl border transition-all flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                  p.aceptaReglamento === 'si'
                    ? 'bg-[#A3E229] text-[#150D8B] border-[#A3E229] shadow-md font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Sí, acepto</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayerChange(playerKey, 'aceptaReglamento', 'no')}
                className={`px-4 py-2 text-xs font-black rounded-xl border transition-all flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                  p.aceptaReglamento === 'no'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </div>
          {errors[`${playerKey}.aceptaReglamento`] && (
            <p className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors[`${playerKey}.aceptaReglamento`]}
            </p>
          )}
        </div>

      </div>
    );
  };

  return (
    <section id="formulario" className="py-6 sm:py-10 relative bg-gradient-to-b from-[#071f5c] via-[#082b7c] to-[#071f5c] border-t border-blue-400/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera del formulario: Título atlético limpio 'INSCRÍBETE AQUÍ' */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A3E229]/15 border border-[#A3E229]/50 text-[#A3E229] text-xs font-bold tracking-widest uppercase mb-3 shadow-[0_0_20px_rgba(163,226,41,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulario Oficial de Inscripción</span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-xl">
            INSCRÍBETE <span className="text-[#A3E229] drop-shadow-[0_0_30px_rgba(163,226,41,0.5)]">AQUÍ</span>
          </h2>

          {/* BOTONES AUXILIARES CENTRADOS */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://app.fvp.com.ve/2danacional/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a389c]/80 hover:bg-[#0b3b95] border border-[#A3E229]/50 hover:border-[#A3E229] text-white font-bold text-xs shadow-md transition-all group"
            >
              <span className="text-[#A3E229]">Ver ranking actualizado FVP</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#A3E229] group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* BOTÓN INTERACTIVO: Ver reglamento oficial */}
            <button
              type="button"
              onClick={() => setShowReglamentoModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a389c]/80 hover:bg-[#0b3b95] border border-blue-400/40 text-blue-200 font-bold text-xs shadow-md transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#A3E229]" />
              <span>Ver Reglamento Oficial LMSC</span>
            </button>
          </div>

          <p className="mt-3 text-blue-100/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Completa la información obligatoria de ambos jugadores para asegurar el cupo oficial de tu dupla en el cuadro de juego.
          </p>
        </div>

        {/* Card Principal del Formulario */}
        <div className="glass-panel p-4 sm:p-7 rounded-3xl shadow-2xl relative">
          
          {submitError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* SECCIÓN 1: CATEGORÍA DE PAREJA CON TARJETA BLANCA DE ALTO CONTRASTE */}
            <div className="form-card bg-white p-5 sm:p-6 rounded-3xl border border-blue-200/60 shadow-xl text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label htmlFor="categoria-select" className="text-base font-orbitron font-black text-[#150D8B] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#150D8B]" />
                  Categoría Oficial de la Pareja <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-bold text-[#150D8B] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Cupos Limitados
                </span>
              </div>

              <select
                id="categoria-select"
                value={formData.categoria}
                onChange={(e) => handleSimpleChange('categoria', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 transition-all ${
                  errors.categoria 
                    ? 'border-rose-500 focus:ring-rose-500/25 bg-rose-50/50' 
                    : 'border-slate-300 focus:border-[#150D8B] focus:ring-[#150D8B]/20'
                }`}
              >
                <option value="">-- Selecciona la categoría de competencia --</option>
                
                <optgroup label="Masculino (2da a 7ma)" className="bg-[#0a389c] text-white font-semibold">
                  {CATEGORIAS.filter(c => c.group === 'Masculino').map(cat => (
                    <option key={cat.id} value={cat.label} className="text-white font-normal bg-[#071f5c]">
                      {cat.label}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Máster Masculino (+45 y +55)" className="bg-[#0a389c] text-[#A3E229] font-semibold">
                  {CATEGORIAS.filter(c => c.group === 'Máster Masculino').map(cat => (
                    <option key={cat.id} value={cat.label} className="text-white font-normal bg-[#071f5c]">
                      {cat.label}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Femenino (3ra a 7ma)" className="bg-[#0a389c] text-white font-semibold">
                  {CATEGORIAS.filter(c => c.group === 'Femenino').map(cat => (
                    <option key={cat.id} value={cat.label} className="text-white font-normal bg-[#071f5c]">
                      {cat.label}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Máster Femenino" className="bg-[#0a389c] text-[#A3E229] font-semibold">
                  {CATEGORIAS.filter(c => c.group === 'Máster Femenino').map(cat => (
                    <option key={cat.id} value={cat.label} className="text-white font-normal bg-[#071f5c]">
                      {cat.label}
                    </option>
                  ))}
                </optgroup>
              </select>

              {errors.categoria && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.categoria}
                </p>
              )}

              {/* Banner de Lista de Espera */}
              {isWaitlist && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Cupos regulares completados para esta categoría. Al inscribirte tu pareja quedará registrada en <strong>Lista de Espera</strong> oficial.
                  </span>
                </div>
              )}
            </div>

            {/* SECCIÓN 2 & 3: FORMULARIOS DETALLADOS JUGADOR 1 Y JUGADOR 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {renderPlayerForm('jugador1', 'Datos del Jugador 1', 1)}
              {renderPlayerForm('jugador2', 'Datos del Jugador 2', 2)}
            </div>

            {/* NORMATIVA OFICIAL DEL CLUB (CONSULTA DE REGLAMENTO) */}
            <div className="form-card bg-white p-5 sm:p-6 rounded-3xl border border-blue-200/60 shadow-xl text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#150D8B]/10 text-[#150D8B] text-[11px] font-extrabold border border-[#150D8B]/20 uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#150D8B]" />
                    <span>Normativa Oficial del Club</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-orbitron font-black text-[#150D8B] flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-[#150D8B] shrink-0" />
                    <span>Reglamento y Condiciones LMSC</span>
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    Consulta la normativa deportiva, horarios, indumentaria y reglamento oficial de La Marina Sport Club aplicable a la Copa Navidad 2026.
                  </p>
                </div>

                {/* Botón llamativo para abrir el visor del reglamento oficial */}
                <button
                  type="button"
                  onClick={() => setShowReglamentoModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] font-orbitron font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all transform hover:scale-105 active:scale-95 shrink-0"
                >
                  <FileText className="w-4 h-4 text-[#150D8B]" />
                  <span>Ver Reglamento Oficial LMSC</span>
                </button>
              </div>
            </div>

            {/* BOTÓN DE ENVIAR: VERDE CON LETRAS AZULES SEGÚN BRANDBOOK (#A3E229 fondo, #150D8B texto) */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 px-8 rounded-full font-orbitron text-base sm:text-xl font-black bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] shadow-[0_0_35px_rgba(163,226,41,0.55)] hover:shadow-[0_0_50px_rgba(163,226,41,0.75)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-[#150D8B]" />
                    <span>Registrando pareja...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#150D8B]" />
                    <span>
                      {isWaitlist ? 'REGISTRAR EN LISTA DE ESPERA' : 'INSCRIBIR PAREJA'}
                    </span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#A3E229]" />
                <span>Al inscribir tu pareja, se mostrará la ventana oficial con los métodos de pago.</span>
              </p>
            </div>

          </form>

        </div>

      </div>

      {/* MODAL DE REGLAMENTO OFICIAL */}
      {showReglamentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-navy-800 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-gold-400" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Reglamento Oficial del Torneo</h3>
                  <p className="text-xs text-slate-400">La Marina Sport Club • Copa Navidad 2026</p>
                </div>
              </div>
              <button
                onClick={() => setShowReglamentoModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opciones de descarga o enlace externo si está configurado */}
            <div className="py-3 flex flex-wrap items-center gap-3 border-b border-slate-800">
              {landingConfig.reglamentoPdfData && (
                <a
                  href={landingConfig.reglamentoPdfData}
                  download={landingConfig.reglamentoNombre || 'Reglamento_Oficial.pdf'}
                  className="px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-xs flex items-center gap-1.5 shadow-glow-gold"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF Oficial</span>
                </a>
              )}

              {landingConfig.reglamentoUrl && (
                <a
                  href={landingConfig.reglamentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-600"
                >
                  <ExternalLink className="w-4 h-4 text-[#80e100]" />
                  <span>Abrir Reglamento Externo</span>
                </a>
              )}
            </div>

            {/* Contenido del reglamento en texto */}
            <div className="flex-1 overflow-y-auto my-4 pr-2 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 bg-navy-900/60 p-4 rounded-2xl border border-slate-700/60">
              <pre className="whitespace-pre-wrap font-sans">
                {landingConfig.reglamentoTexto || 'No hay reglamento en texto configurado.'}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowReglamentoModal(false);
                  setFormData(prev => ({
                    ...prev,
                    aceptaReglamento: 'si',
                    jugador1: { ...prev.jugador1, aceptaReglamento: 'si' },
                    jugador2: { ...prev.jugador2, aceptaReglamento: 'si' }
                  }));
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Entendido y Aceptar Reglamento</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
