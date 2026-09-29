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

  // Femenino: 3ra a 7ma
  { id: '3ra-fem', label: '3ra Femenino', group: 'Femenino' },
  { id: '4ta-fem', label: '4ta Femenino', group: 'Femenino' },
  { id: '5ta-fem', label: '5ta Femenino', group: 'Femenino' },
  { id: '6ta-fem', label: '6ta Femenino', group: 'Femenino' },
  { id: '7ma-fem', label: '7ma Femenino', group: 'Femenino' },

  // Master +45
  { id: 'master-45', label: 'Master +45', group: 'Especial' },
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

    // Método de Pago
    if (!formData.metodoPago) {
      newErrors.metodoPago = 'Por favor selecciona el método de pago';
    }

    // Referencia / ID de Pago
    if (!formData.referenciaPago.trim()) {
      newErrors.referenciaPago = 'El ID o referencia de pago es obligatorio';
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

    // Aceptación global del reglamento
    if (formData.aceptaReglamento !== 'si') {
      newErrors.aceptaReglamento = 'Debes confirmar y aceptar el reglamento del club con la opción "Sí" para formalizar la inscripción';
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

  // Renderizador de campos para un jugador
  const renderPlayerForm = (playerKey, playerTitle, numberBadge) => {
    const p = formData[playerKey];

    return (
      <div className="bg-gradient-to-b from-navy-800/80 via-navy-850/80 to-navy-900/90 p-5 sm:p-7 rounded-3xl border border-slate-700/70 shadow-xl relative space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#80e100]/15 text-[#80e100] border border-[#80e100]/30 flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(128,225,0,0.2)]">
              {numberBadge}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              {playerTitle}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#80e100] uppercase tracking-wider">
            * Campos obligatorios
          </span>
        </div>

        {/* Fila: Nombre y Apellido + Cédula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre y Apellido <span className="text-red-400">*</span>
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
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors[`${playerKey}.nombre`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
                }`}
              />
            </div>
            {errors[`${playerKey}.nombre`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.nombre`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Cédula de Identidad <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: V-18.456.789"
              value={p.cedula}
              onChange={(e) => handlePlayerChange(playerKey, 'cedula', e.target.value)}
              className={`w-full px-3.5 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors[`${playerKey}.cedula`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
              }`}
            />
            {errors[`${playerKey}.cedula`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.cedula`]}
              </p>
            )}
          </div>
        </div>

        {/* Fila: Correo + Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico <span className="text-red-400">*</span>
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
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors[`${playerKey}.email`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
                }`}
              />
            </div>
            {errors[`${playerKey}.email`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.email`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Número de Teléfono / WhatsApp <span className="text-red-400">*</span>
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
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors[`${playerKey}.telefono`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
                }`}
              />
            </div>
            {errors[`${playerKey}.telefono`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.telefono`]}
              </p>
            )}
          </div>
        </div>

        {/* Fila: Talla Franela + Lado de Juego con chips táctiles modernos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Talla de Franela Oficial <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {TALLAS_FRANELA.map((talla) => (
                <button
                  type="button"
                  key={talla}
                  onClick={() => handlePlayerChange(playerKey, 'tallaFranela', talla)}
                  className={`min-h-[44px] py-2 px-1 flex items-center justify-center text-xs sm:text-sm font-bold rounded-xl border transition-all duration-200 select-none active:scale-95 leading-none text-center ${
                    p.tallaFranela === talla
                      ? 'bg-[#80e100] text-navy-950 border-[#80e100] shadow-[0_0_16px_rgba(128,225,0,0.35)] font-black'
                      : 'bg-navy-950 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span className="truncate w-full block text-center">{talla}</span>
                </button>
              ))}
            </div>
            {errors[`${playerKey}.tallaFranela`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.tallaFranela`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Lado de Juego <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {LADOS_JUEGO.map((lado) => (
                <button
                  type="button"
                  key={lado}
                  onClick={() => handlePlayerChange(playerKey, 'ladoJuego', lado)}
                  className={`min-h-[44px] py-2 px-1 sm:px-2 flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold rounded-xl border transition-all duration-200 select-none active:scale-95 leading-tight text-center break-words ${
                    p.ladoJuego === lado
                      ? 'bg-[#80e100] text-navy-950 border-[#80e100] shadow-[0_0_16px_rgba(128,225,0,0.35)] font-black'
                      : 'bg-navy-950 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span className="w-full text-center leading-tight truncate">{lado}</span>
                </button>
              ))}
            </div>
            {errors[`${playerKey}.ladoJuego`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.ladoJuego`]}
              </p>
            )}
          </div>
        </div>

        {/* Fila: Categoría habitual + Liga/Torneo actual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Categoría Habitual de Juego <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. 4ta Categoría / 5ta FVP"
              value={p.categoriaHabitual}
              onChange={(e) => handlePlayerChange(playerKey, 'categoriaHabitual', e.target.value)}
              className={`w-full px-3.5 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors[`${playerKey}.categoriaHabitual`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
              }`}
            />
            {errors[`${playerKey}.categoriaHabitual`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.categoriaHabitual`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Liga o Torneo donde participas actualmente <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Circuito FVP Oriente / Liga Local / Ninguno"
              value={p.torneoActual}
              onChange={(e) => handlePlayerChange(playerKey, 'torneoActual', e.target.value)}
              className={`w-full px-3.5 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors[`${playerKey}.torneoActual`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
              }`}
            />
            {errors[`${playerKey}.torneoActual`] && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors[`${playerKey}.torneoActual`]}
              </p>
            )}
          </div>
        </div>

        {/* Historial de últimos torneos */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-gold-400" />
              Historial de últimos torneos jugados (Nivel y resultados) <span className="text-red-400">*</span>
            </span>
          </label>
          <textarea
            rows="2"
            placeholder="Ej. Torneo Aniversario LMSC: Campeón 5ta Cat; 2da Nacional FVP: Cuartos de final..."
            value={p.historialTorneos}
            onChange={(e) => handlePlayerChange(playerKey, 'historialTorneos', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 text-white border text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
              errors[`${playerKey}.historialTorneos`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
            }`}
          ></textarea>
          {errors[`${playerKey}.historialTorneos`] && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors[`${playerKey}.historialTorneos`]}
            </p>
          )}
        </div>

        {/* Alergias o restricciones alimenticias */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-red-400" />
            ¿Padece alguna alergia o restricción alimenticia? <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej. Ninguna / Alérgico a mariscos / Intolerancia a la lactosa"
            value={p.alergias}
            onChange={(e) => handlePlayerChange(playerKey, 'alergias', e.target.value)}
            className={`w-full px-3.5 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
              errors[`${playerKey}.alergias`] ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
            }`}
          />
          {errors[`${playerKey}.alergias`] && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors[`${playerKey}.alergias`]}
            </p>
          )}
        </div>

        {/* Aceptación del reglamento por jugador con chips interactivos */}
        <div className="pt-2 bg-navy-950/80 p-4 rounded-2xl border border-slate-700/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-white">
              ¿Acepta y confirma el reglamento del club? <span className="text-red-400">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2 sm:w-auto w-full">
              <button
                type="button"
                onClick={() => handlePlayerChange(playerKey, 'aceptaReglamento', 'si')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                  p.aceptaReglamento === 'si'
                    ? 'bg-emerald-500 text-navy-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] font-extrabold'
                    : 'bg-navy-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Sí, acepto</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayerChange(playerKey, 'aceptaReglamento', 'no')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                  p.aceptaReglamento === 'no'
                    ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.35)] font-extrabold'
                    : 'bg-navy-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </div>
          {errors[`${playerKey}.aceptaReglamento`] && (
            <p className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors[`${playerKey}.aceptaReglamento`]}
            </p>
          )}
        </div>

      </div>
    );
  };

  return (
    <section id="formulario" className="py-12 sm:py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera del formulario: Título atlético limpio 'INSCRÍBETE AQUÍ' */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#80e100]/10 border border-[#80e100]/40 text-[#80e100] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(128,225,0,0.18)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulario Oficial de Inscripción</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-xl">
            INSCRÍBETE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80e100] via-[#a6f728] to-[#80e100] drop-shadow-[0_0_35px_rgba(128,225,0,0.4)]">AQUÍ</span>
          </h2>

          {/* BOTONES AUXILIARES CENTRADOS */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://app.fvp.com.ve/2danacional/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy-800/90 hover:bg-navy-700 border border-[#80e100]/50 hover:border-[#80e100] text-white font-bold text-xs shadow-lg transition-all group"
            >
              <span className="text-[#80e100]">Ver ranking actualizado FVP</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#80e100] group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* BOTÓN INTERACTIVO: Ver reglamento oficial */}
            <button
              type="button"
              onClick={() => setShowReglamentoModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-300 font-bold text-xs shadow-lg transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              <span>Ver Reglamento Oficial LMSC</span>
            </button>
          </div>

          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Completa la información obligatoria de ambos jugadores para asegurar el cupo oficial de tu dupla en el cuadro de juego.
          </p>
        </div>

        {/* Card Principal del Formulario */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl relative">
          
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">

            {/* SECCIÓN 1: CATEGORÍA DE PAREJA */}
            <div className="bg-navy-800/60 p-5 sm:p-6 rounded-2xl border border-slate-700/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label htmlFor="categoria-select" className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold-400" />
                  Categoría Oficial de la Pareja <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-slate-400">
                  Límite máximo: <strong>{maxAllowedForCat} duplas</strong>
                </span>
              </div>

              <select
                id="categoria-select"
                value={formData.categoria}
                onChange={(e) => handleSimpleChange('categoria', e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl bg-navy-900 text-white border text-sm sm:text-base focus:outline-none focus:ring-2 transition-all ${
                  errors.categoria 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-slate-700 focus:border-gold-500 focus:ring-gold-500/20'
                }`}
              >
                <option value="">-- Selecciona la categoría de competencia --</option>
                
                <optgroup label="Categorías Masculino (2da a 7ma)" className="bg-navy-900 text-gold-400 font-semibold">
                  {CATEGORIAS.filter(c => c.group === 'Masculino').map(cat => {
                    const count = existingRegistrations.filter(r => r.categoria === cat.label && r.status !== 'retirado').length;
                    return (
                      <option key={cat.id} value={cat.label} className="text-white font-normal">
                        {cat.label} ({count}/{maxAllowedForCat} inscritos)
                      </option>
                    );
                  })}
                </optgroup>

                <optgroup label="Categorías Femenino (3ra a 7ma)" className="bg-navy-900 text-gold-400 font-semibold">
                  {CATEGORIAS.filter(c => c.group === 'Femenino').map(cat => {
                    const count = existingRegistrations.filter(r => r.categoria === cat.label && r.status !== 'retirado').length;
                    return (
                      <option key={cat.id} value={cat.label} className="text-white font-normal">
                        {cat.label} ({count}/{maxAllowedForCat} inscritos)
                      </option>
                    );
                  })}
                </optgroup>

                <optgroup label="Categorías Especiales" className="bg-navy-900 text-gold-400 font-semibold">
                  {CATEGORIAS.filter(c => c.group === 'Especial').map(cat => {
                    const count = existingRegistrations.filter(r => r.categoria === cat.label && r.status !== 'retirado').length;
                    return (
                      <option key={cat.id} value={cat.label} className="text-white font-normal">
                        {cat.label} ({count}/{maxAllowedForCat} inscritos)
                      </option>
                    );
                  })}
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
                    Límite oficial completado ({selectedCategoryCount}/{maxAllowedForCat}). Al inscribirte tu pareja quedará registrada en <strong>Lista de Espera</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* SECCIÓN 2 & 3: FORMULARIOS DETALLADOS JUGADOR 1 Y JUGADOR 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderPlayerForm('jugador1', 'Datos del Jugador 1', 1)}
              {renderPlayerForm('jugador2', 'Datos del Jugador 2', 2)}
            </div>

            {/* SECCIÓN 4: PAGO & COMPROBANTE */}
            <div className="bg-gradient-to-b from-navy-800/80 via-navy-850/80 to-navy-900/90 p-6 sm:p-8 rounded-3xl border border-gold-500/30 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 text-gold-300 text-xs font-bold border border-gold-500/30 uppercase tracking-wider mb-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Inversión Oficial</span>
                  </div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gold-400" />
                    Sección de Pago Oficial
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Inversión oficial: <strong>$150 por pareja</strong> ($75 por jugador). Incluye arbitraje, hidratación y welcome pack.
                  </p>
                </div>
                <div className="bg-navy-950 px-4 py-2.5 rounded-2xl border border-gold-500/40 text-center shadow-glow-gold w-fit self-start sm:self-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Dupla</span>
                  <span className="text-xl sm:text-2xl font-black text-gold-400 font-mono">
                    $150 USD
                  </span>
                </div>
              </div>

              {/* Selector de Método de Pago */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
                  Selecciona el Método de Pago <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {METODOS_PAGO.map((metodo) => {
                    const isSelected = formData.metodoPago === metodo.label;
                    return (
                      <button
                        type="button"
                        key={metodo.id}
                        onClick={() => handleSimpleChange('metodoPago', metodo.label)}
                        className={`min-h-[48px] py-2 px-2 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center select-none active:scale-95 leading-tight ${
                          isSelected
                            ? 'bg-[#80e100] text-navy-950 border-[#80e100] shadow-[0_0_20px_rgba(128,225,0,0.35)] font-black'
                            : 'bg-navy-950 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white hover:bg-navy-900'
                        }`}
                      >
                        <span className="w-full text-center leading-snug">{metodo.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.metodoPago && (
                  <p className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.metodoPago}
                  </p>
                )}
              </div>

              {/* Caja de Datos de Transferencia: ALTO CONTRASTE */}
              {formData.metodoPago && getMetodoDetalle() && (
                <div className="p-5 rounded-2xl bg-black/90 border border-[#80e100]/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-[#80e100] font-bold text-xs sm:text-sm uppercase tracking-wide">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Datos bancarios oficiales para pagar con {formData.metodoPago}:</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#80e100]/15 text-[#80e100] border border-[#80e100]/30">
                      Cuenta Oficial
                    </span>
                  </div>
                  <pre className="font-mono text-white text-xs sm:text-sm leading-relaxed p-4 rounded-xl bg-navy-950 border border-slate-800 select-all whitespace-pre-line font-bold">
                    {getMetodoDetalle()}
                  </pre>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#80e100] shrink-0" />
                    <span>Realiza la transferencia antes de ingresar la referencia de pago.</span>
                  </p>
                </div>
              )}

              {/* Referencia y Carga de Archivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Referencia / ID de Pago */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    ID / Referencia alfanumérica de pago <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. REF-98234123 o Hash de transacción"
                    value={formData.referenciaPago}
                    onChange={(e) => handleSimpleChange('referenciaPago', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-navy-950 text-white border text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.referenciaPago ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-[#80e100] focus:ring-[#80e100]/25'
                    }`}
                  />
                  {errors.referenciaPago && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.referenciaPago}
                    </p>
                  )}
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Número único emitido por tu banco o plataforma de pago.
                  </span>
                </div>

                {/* Adjuntar comprobante */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Adjuntar Comprobante de Pago</span>
                    <span className="text-[11px] text-[#80e100] font-semibold">Máx 1 MB</span>
                  </label>

                  {formData.comprobantePagoUrl ? (
                    <div className="p-3.5 rounded-xl bg-navy-950 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div className="truncate text-xs">
                          <p className="font-semibold text-white truncate">{formData.comprobanteNombre}</p>
                          <span className="text-[11px] text-slate-400">
                            {(formData.comprobanteSize / 1024).toFixed(1)} KB • Archivo adjunto
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
                        title="Quitar comprobante"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-700 hover:border-[#80e100]/60 rounded-xl bg-navy-950/70 cursor-pointer transition-colors text-center">
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-300">
                          Haz clic para subir comprobante
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          Formatos: JPG, JPEG, PNG o PDF (menor a 1 MB)
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {errors.comprobante && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.comprobante}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* SECCIÓN 5: ACEPTACIÓN DEL REGLAMENTO OFICIAL DEL CLUB (OBLIGATORIO SÍ) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-navy-800/90 via-navy-850/90 to-navy-900/90 border border-slate-700/80 hover:border-gold-500/40 transition-colors shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 text-gold-400 text-[11px] font-bold border border-gold-500/30 uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Normativa Oficial del Club</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Aceptación del Reglamento Oficial LMSC</span>
                    <span className="text-red-400">*</span>
                  </h4>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Es requisito federativo e institucional que ambos integrantes de la dupla conozcan y acepten la normativa deportiva de La Marina Sport Club.
                  </p>
                </div>

                {/* Botón llamativo para abrir el visor del reglamento oficial */}
                <button
                  type="button"
                  onClick={() => setShowReglamentoModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-gold transition-all transform hover:scale-105 active:scale-95 shrink-0"
                >
                  <FileText className="w-4 h-4 text-navy-950" />
                  <span>Ver Reglamento Oficial LMSC</span>
                </button>
              </div>

              {/* Opciones interactivas Sí / No estilizadas como chips modernos */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => handleSimpleChange('aceptaReglamento', 'si')}
                  className={`p-3.5 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 select-none active:scale-95 ${
                    formData.aceptaReglamento === 'si'
                      ? 'bg-emerald-500 text-navy-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] font-black'
                      : 'bg-navy-950 text-slate-300 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Sí, acepto y confirmo el reglamento</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimpleChange('aceptaReglamento', 'no')}
                  className={`p-3.5 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 select-none active:scale-95 ${
                    formData.aceptaReglamento === 'no'
                      ? 'bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.35)] font-black'
                      : 'bg-navy-950 text-slate-300 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>No acepto</span>
                </button>
              </div>

              {errors.aceptaReglamento && (
                <p className="text-xs text-red-400 font-medium flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.aceptaReglamento}
                </p>
              )}
            </div>

            {/* BOTÓN DE ENVIAR */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 sm:py-5 px-8 rounded-full text-base sm:text-lg font-black bg-[#80e100] hover:bg-[#90f00a] text-navy-950 shadow-[0_0_35px_rgba(128,225,0,0.4)] hover:shadow-[0_0_45px_rgba(128,225,0,0.6)] transition-all transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando datos y registrando comprobante...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-navy-950" />
                    <span>
                      {isWaitlist ? 'Registrar en Lista de Espera' : 'Confirmar Inscripción de Pareja ($150)'}
                    </span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#80e100]" />
                Inscripción oficial y protegida con validación estricta de cupos.
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
