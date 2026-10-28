import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Banknote, 
  Landmark, 
  Coins,
  Copy, 
  Check, 
  Download, 
  X, 
  Sparkles, 
  UploadCloud, 
  FileCheck, 
  ExternalLink, 
  ShieldCheck, 
  MessageCircle,
  Trophy
} from 'lucide-react';
import { 
  updateRegistrationPayment, 
  subscribeToLandingConfig, 
  getLandingConfig, 
  DEFAULT_LANDING_CONFIG 
} from '../services/supabase';

export default function ConfirmationModal({ data, onClose }) {
  const [config, setConfig] = useState(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    let unsub;
    getLandingConfig().then(cfg => {
      if (cfg) setConfig(cfg);
    });
    unsub = subscribeToLandingConfig(cfg => {
      if (cfg) setConfig(cfg);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const [activeTab, setActiveTab] = useState('pago-movil'); // 'pago-movil' | 'zelle' | 'cuenta-internacional' | 'binance' | 'efectivo'
  const [copiedField, setCopiedField] = useState(null);
  
  // Estado para reporte opcional de comprobante directo
  const [metodoPagoReporte, setMetodoPagoReporte] = useState('Pago Móvil');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobanteUrl, setComprobanteUrl] = useState('');
  const [comprobanteNombre, setComprobanteNombre] = useState('');
  const [fileError, setFileError] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentSavedSuccess, setPaymentSavedSuccess] = useState(false);

  if (!data) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const methods = [
    {
      id: 'pago-movil',
      name: config.pagoMovilNombre || 'Pago Móvil',
      subtitulo: config.pagoMovilSubtitulo || 'Tasa Oficial BCV',
      detail: config.pagoMovilDetalle || DEFAULT_LANDING_CONFIG.pagoMovilDetalle,
      icon: Smartphone,
      badge: 'Tasa BCV',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconColor: 'text-emerald-600',
      nota: '* El monto en Bolívares se calcula multiplicando $140 USD por la tasa oficial BCV del día de la transferencia.'
    },
    {
      id: 'zelle',
      name: config.zelleNombre || 'Zelle',
      subtitulo: config.zelleSubtitulo || 'Dólares USD directos',
      detail: config.zelleDetalle || DEFAULT_LANDING_CONFIG.zelleDetalle,
      icon: CreditCard,
      badge: 'Sin comisiones',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      iconColor: 'text-purple-600',
      nota: '* En el memo o concepto de Zelle coloca únicamente el apellido de la pareja o tu número de teléfono.'
    },
    {
      id: 'cuenta-internacional',
      name: config.cuentaInternacionalNombre || 'Cuenta Internacional',
      subtitulo: config.cuentaInternacionalSubtitulo || 'Banco General Panamá (Ahorros)',
      detail: config.cuentaInternacionalDetalle || config.banescoPanamaDetalle || DEFAULT_LANDING_CONFIG.cuentaInternacionalDetalle,
      icon: Landmark,
      badge: 'Panamá / Ahorros',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      iconColor: 'text-blue-600',
      nota: '* Al realizar la transferencia envía el comprobante por WhatsApp o adjúntalo en esta ventana.'
    },
    {
      id: 'binance',
      name: config.binancePayNombre || 'Binance',
      subtitulo: config.binancePaySubtitulo || 'Binance Pay / USDT',
      detail: config.binancePayDetalle || DEFAULT_LANDING_CONFIG.binancePayDetalle,
      icon: Coins,
      badge: 'Binance Pay',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      iconColor: 'text-amber-600',
      nota: '* Pago inmediato en USDT mediante Binance Pay sin comisiones de red.'
    }
  ];

  if (config.mostrarEfectivo) {
    methods.push({
      id: 'efectivo',
      name: config.efectivoNombre || 'Efectivo',
      subtitulo: 'Pago en Taquilla / Club',
      detail: config.efectivoDetalle || DEFAULT_LANDING_CONFIG.efectivoDetalle,
      icon: Banknote,
      badge: 'USD o Bs.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconColor: 'text-emerald-600',
      nota: '* Dirígete a la recepción o administración de La Marina Sport Club en Lechería.'
    });
  }

  const currentMethod = methods.find(m => m.id === activeTab) || methods[0];
  const CurrentIcon = currentMethod.icon;

  const parseDetailLines = (text) => {
    if (!text) return [];
    return text.split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        return {
          id: `line_${idx}`,
          label: line.substring(0, colonIdx).trim(),
          value: line.substring(colonIdx + 1).trim(),
          isKv: true
        };
      }
      return {
        id: `line_${idx}`,
        label: '',
        value: line,
        isKv: false
      };
    });
  };

  const parsedLines = parseDetailLines(currentMethod.detail);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setFileError('El archivo excede el límite máximo de 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setComprobanteUrl(reader.result);
      setComprobanteNombre(file.name);
      setComprobanteFile(file);
    };
    reader.onerror = () => {
      setFileError('Error al leer el archivo. Intenta de nuevo.');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaymentReport = async (e) => {
    e.preventDefault();
    if (!referenciaPago.trim() && !comprobanteUrl) {
      setFileError('Por favor ingresa la referencia o adjunta el comprobante.');
      return;
    }

    setSavingPayment(true);
    setFileError('');

    try {
      await updateRegistrationPayment(data.id, {
        metodoPago: metodoPagoReporte,
        referenciaPago: referenciaPago.trim(),
        comprobantePagoUrl: comprobanteUrl,
        comprobanteNombre: comprobanteNombre,
        comprobanteTipo: comprobanteFile ? comprobanteFile.type : '',
        comprobanteSize: comprobanteFile ? comprobanteFile.size : 0
      });
      setPaymentSavedSuccess(true);
    } catch (err) {
      console.error(err);
      setFileError('Hubo un error al registrar el comprobante.');
    } finally {
      setSavingPayment(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hola, acabamos de preinscribirnos en la Copa Navidad LMSC 2026.\n\n*Dupla:* ${data.jugador1?.nombre} y ${data.jugador2?.nombre}\n*Categoría:* ${data.categoria}\n*Folio:* #${data.id?.substring(0, 8).toUpperCase()}\n\nAdjunto el comprobante de pago para la confirmación de nuestro cupo.`
  );
  const whatsappUrl = `https://wa.me/584248302078?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#071f5c]/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* TARJETA MODAL CON LOOK DEFINITIVO DEL FRONT (BLANCO, AZUL BRANDBOOK LMSC Y VERDE LIMA NEÓN) */}
      <div className="relative w-full max-w-2xl bg-white border border-blue-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-6 max-h-[92vh] overflow-y-auto text-slate-800">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Principal */}
        <div className="text-center mb-6">
          {/* Badge Icono Atlético LMSC */}
          <div className="w-16 h-16 rounded-2xl bg-[#150D8B] text-[#A3E229] border border-[#150D8B] mx-auto flex items-center justify-center shadow-lg shadow-[#150D8B]/20 mb-3">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#A3E229]/25 text-[#150D8B] text-xs font-black border border-[#A3E229] mb-2 font-orbitron tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#150D8B]" />
            <span>¡PREINSCRIPCIÓN REGISTRADA!</span>
          </div>

          <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-[#150D8B] uppercase tracking-tight">
            COPA NAVIDAD LMSC 2026
          </h2>
          
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Dupla: <strong className="text-[#150D8B] font-black">{data.jugador1?.nombre} {data.jugador1?.apellido || ''}</strong> & <strong className="text-[#150D8B] font-black">{data.jugador2?.nombre} {data.jugador2?.apellido || ''}</strong> • Categoría: <strong className="text-emerald-600 font-black font-orbitron">{data.categoria}</strong>
          </p>

          <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-mono">
            <span>Folio: <strong className="text-[#150D8B] font-black font-orbitron">#{data.id?.substring(0, 8).toUpperCase()}</strong></span>
            <span>•</span>
            <span>Estatus: <strong className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-bold uppercase text-[10px] font-orbitron">{data.status || 'Esperando Pago'}</strong></span>
          </div>
        </div>

        {/* Banner de Inversión Oficial */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 p-4 rounded-2xl border border-blue-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-[10px] uppercase font-black text-[#150D8B] tracking-wider block font-orbitron">
                INVERSIÓN POR DUPLA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#150D8B] text-[#A3E229] text-[9px] font-black font-orbitron uppercase">
                2 Juegos Garantizados
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black font-orbitron uppercase">
                🏆 Premios en Metálico
              </span>
            </div>
            <span className="text-xs text-slate-600 leading-tight block mt-0.5">
              Incluye 2 partidos garantizados, arbitraje oficial FVP, hidratación en pista, franela oficial del torneo y premios en metálico.
            </span>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-[#150D8B] border border-[#150D8B] text-center shadow-md shrink-0">
            <span className="font-orbitron text-2xl font-black text-[#A3E229] block leading-none">
              $140 USD
            </span>
            <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wide mt-1">
              ($70 por jugador)
            </span>
          </div>
        </div>

        {/* PESTAÑAS DE MÉTODOS DE PAGO AUTORIZADOS */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-orbitron text-xs sm:text-sm font-black text-[#150D8B] flex items-center gap-2 uppercase tracking-wide">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Métodos de Pago Autorizados:</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">Selecciona para ver datos</span>
          </div>

          <div className={`grid ${methods.length > 4 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} gap-2 mb-4`}>
            {methods.map(m => {
              const isActive = activeTab === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveTab(m.id)}
                  className={`py-2.5 px-2 rounded-xl font-orbitron text-xs font-black flex flex-col items-center justify-center gap-1.5 border transition-all ${
                    isActive
                      ? 'bg-[#A3E229] text-[#150D8B] border-[#A3E229] shadow-md shadow-[#A3E229]/40 ring-1 ring-[#A3E229]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate max-w-full">{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* DETALLES DINÁMICOS DEL MÉTODO SELECCIONADO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <CurrentIcon className={`w-5 h-5 ${currentMethod.iconColor} shrink-0`} />
                <span className="font-orbitron font-bold text-[#150D8B] text-xs sm:text-sm truncate">
                  {currentMethod.name}
                </span>
                {currentMethod.subtitulo && (
                  <span className="hidden sm:inline text-xs text-slate-500 font-medium truncate">
                    • {currentMethod.subtitulo}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-orbitron border shrink-0 ${currentMethod.badgeColor}`}>
                {currentMethod.badge}
              </span>
            </div>

            {/* GRILLA DE DATOS CON BOTÓN COPIAR EN CADA CAMPO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {parsedLines.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 ${
                    !item.isKv ? 'sm:col-span-2 bg-blue-50/50 border-blue-200/60' : ''
                  }`}
                >
                  <div className="overflow-hidden">
                    {item.isKv && item.label && (
                      <span className="text-slate-500 block text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
                        {item.label}
                      </span>
                    )}
                    <strong className="text-[#150D8B] font-mono text-xs sm:text-sm font-bold block break-all">
                      {item.value}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.value, item.id)}
                    className="p-1.5 sm:p-2 rounded-lg bg-blue-50 hover:bg-[#A3E229] hover:text-[#150D8B] text-[#150D8B] transition-colors shrink-0"
                    title={`Copiar ${item.label || 'dato'}`}
                  >
                    {copiedField === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* BOTÓN COPIAR TODOS LOS DATOS Y NOTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
              <span className="text-slate-500 italic">
                {currentMethod.nota}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentMethod.detail, `all_${currentMethod.id}`)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-[#A3E229] text-[#150D8B] font-bold text-xs flex items-center gap-1.5 transition-colors self-end shrink-0"
                title="Copiar todos los datos de este método"
              >
                {copiedField === `all_${currentMethod.id}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Datos copiados!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar todos los datos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL: NOTIFICAR O ENVIAR COMPROBANTE POR WHATSAPP */}
        <div className="mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-orbitron font-black text-xs sm:text-sm shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-95 text-center tracking-wider uppercase"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Enviar Comprobante por WhatsApp (+58 424-8302078)</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
          <span className="block text-center text-[11px] text-slate-500 mt-1.5 font-medium">
            Se abrirá WhatsApp con el mensaje pre-cargado de tu dupla para agilizar la confirmación.
          </span>
        </div>

        {/* SECCIÓN OPCIONAL: REPORTAR COMPROBANTE DIRECTO EN ESTA VENTANA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[#150D8B] uppercase tracking-wider flex items-center gap-1.5 font-orbitron">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>¿Ya tienes el comprobante a mano? Adjúntalo aquí:</span>
            </span>
          </div>

          {paymentSavedSuccess ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">¡Comprobante y referencia guardados con éxito en tu ficha de inscripción! El comité revisará tu pago a la brevedad.</span>
            </div>
          ) : (
            <form onSubmit={handleSavePaymentReport} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Método Utilizado
                  </label>
                  <select
                    value={metodoPagoReporte}
                    onChange={(e) => setMetodoPagoReporte(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#150D8B] font-medium"
                  >
                    {methods.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    ID / Referencia Bancaria
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: REF-928123"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#150D8B] font-medium"
                  />
                </div>
              </div>

              {/* Input de archivo */}
              <div>
                {comprobanteUrl ? (
                  <div className="p-2.5 rounded-xl bg-white border border-blue-300 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="truncate text-slate-800 font-bold">{comprobanteNombre}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setComprobanteUrl(''); setComprobanteNombre(''); setComprobanteFile(null); }}
                      className="p-1 rounded text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-blue-300 hover:border-[#150D8B] rounded-xl bg-white cursor-pointer text-xs text-slate-600 hover:text-[#150D8B] transition-colors">
                    <UploadCloud className="w-4 h-4 text-[#150D8B]" />
                    <span className="font-semibold">Cargar comprobante (JPG, PNG o PDF &lt; 1MB)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
                {fileError && <p className="text-[11px] text-rose-600 font-semibold mt-1">{fileError}</p>}
              </div>

              <button
                type="submit"
                disabled={savingPayment}
                className="w-full py-2.5 rounded-xl bg-[#150D8B] hover:bg-[#0a389c] text-[#A3E229] font-orbitron font-black text-xs border border-[#150D8B] transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
              >
                <span>{savingPayment ? 'Guardando comprobante...' : 'Guardar Comprobante en el Sistema'}</span>
              </button>
            </form>
          )}
        </div>

        {/* BOTONES FINALES DE CIERRE E IMPRESIÓN */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-6 rounded-2xl font-orbitron text-xs sm:text-sm font-black bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] shadow-lg shadow-[#A3E229]/40 transition-all text-center uppercase tracking-wider"
          >
            Entendido / Cerrar Ventana
          </button>
          
          <button
            onClick={handlePrint}
            className="py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-[#150D8B] border border-slate-300 transition-colors flex items-center justify-center gap-2 font-orbitron"
          >
            <Download className="w-4 h-4 text-[#150D8B]" />
            <span>Imprimir Ficha</span>
          </button>
        </div>

      </div>
    </div>
  );
}
