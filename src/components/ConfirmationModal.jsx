import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Banknote, 
  Landmark, 
  Copy, 
  Check, 
  Download, 
  X, 
  Sparkles, 
  UploadCloud, 
  FileCheck, 
  ExternalLink,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { updateRegistrationPayment } from '../services/firebase';

export default function ConfirmationModal({ data, onClose }) {
  if (!data) return null;

  const [activeTab, setActiveTab] = useState('pago-movil'); // 'pago-movil' | 'zelle' | 'efectivo' | 'cuenta-internacional'
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

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#051336]/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0a389c] via-[#082b7c] to-[#071f5c] border border-blue-400/40 rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(10,56,156,0.8),0_0_35px_rgba(163,226,41,0.25)] my-6 max-h-[92vh] overflow-y-auto text-white">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Principal */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#A3E229] text-[#150D8B] mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(163,226,41,0.6)] mb-3">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#A3E229]/20 text-[#A3E229] text-xs font-black border border-[#A3E229]/60 mb-2 font-orbitron tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>¡PREINSCRIPCIÓN REGISTRADA!</span>
          </div>

          <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">
            Copa Navidad LMSC 2026
          </h2>
          
          <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Dupla: <strong className="text-white font-black">{data.jugador1?.nombre} {data.jugador1?.apellido || ''}</strong> & <strong className="text-white font-black">{data.jugador2?.nombre} {data.jugador2?.apellido || ''}</strong> • Categoría: <strong className="text-[#A3E229] font-black font-orbitron">{data.categoria}</strong>
          </p>

          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#082363]/80 border border-blue-400/25 text-[11px] text-blue-200 font-mono">
            <span>Folio: <strong className="text-[#A3E229]">#{data.id?.substring(0, 8).toUpperCase()}</strong></span>
            <span>•</span>
            <span>Estatus: <strong className="text-amber-300 uppercase">{data.status || 'Esperando Pago'}</strong></span>
          </div>
        </div>

        {/* Banner de Inversión Oficial */}
        <div className="bg-[#082363]/85 p-4 rounded-2xl border border-blue-400/30 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">Inversión Oficial por Pareja</span>
            <span className="text-xs text-blue-100/90 leading-tight block mt-0.5">
              Derecho a competir, arbitraje oficial, hidratación continua y welcome pack de torneo.
            </span>
          </div>
          <div className="px-5 py-2.5 rounded-xl bg-[#0a389c] border border-[#A3E229]/60 shadow-[0_0_20px_rgba(163,226,41,0.25)] shrink-0">
            <span className="font-orbitron text-xl sm:text-2xl font-black text-[#A3E229] block">
              $150 USD
            </span>
            <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wide">($75 por jugador)</span>
          </div>
        </div>

        {/* PESTAÑAS DE LOS 4 MÉTODOS DE PAGO */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-orbitron text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#A3E229]" />
              <span>Métodos de Pago Autorizados:</span>
            </h3>
            <span className="text-[11px] text-blue-200/80">Selecciona para ver datos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('pago-movil')}
              className={`py-2.5 px-2 rounded-xl font-orbitron font-bold text-xs flex flex-col items-center justify-center gap-1.5 border transition-all ${
                activeTab === 'pago-movil'
                  ? 'bg-[#A3E229] text-[#150D8B] border-[#A3E229] shadow-[0_0_20px_rgba(163,226,41,0.45)]'
                  : 'bg-[#082363]/80 text-blue-200 border-blue-400/30 hover:border-[#A3E229]/50 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Pago Móvil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('zelle')}
              className={`py-2.5 px-2 rounded-xl font-orbitron font-bold text-xs flex flex-col items-center justify-center gap-1.5 border transition-all ${
                activeTab === 'zelle'
                  ? 'bg-[#A3E229] text-[#150D8B] border-[#A3E229] shadow-[0_0_20px_rgba(163,226,41,0.45)]'
                  : 'bg-[#082363]/80 text-blue-200 border-blue-400/30 hover:border-[#A3E229]/50 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Zelle</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('efectivo')}
              className={`py-2.5 px-2 rounded-xl font-orbitron font-bold text-xs flex flex-col items-center justify-center gap-1.5 border transition-all ${
                activeTab === 'efectivo'
                  ? 'bg-[#A3E229] text-[#150D8B] border-[#A3E229] shadow-[0_0_20px_rgba(163,226,41,0.45)]'
                  : 'bg-[#082363]/80 text-blue-200 border-blue-400/30 hover:border-[#A3E229]/50 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Efectivo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cuenta-internacional')}
              className={`py-2.5 px-2 rounded-xl font-orbitron font-bold text-xs flex flex-col items-center justify-center gap-1.5 border transition-all ${
                activeTab === 'cuenta-internacional'
                  ? 'bg-[#A3E229] text-[#150D8B] border-[#A3E229] shadow-[0_0_20px_rgba(163,226,41,0.45)]'
                  : 'bg-[#082363]/80 text-blue-200 border-blue-400/30 hover:border-[#A3E229]/50 hover:text-white'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span className="truncate">Cuenta Internac.</span>
            </button>
          </div>

          {/* DETALLES DEL MÉTODO SELECCIONADO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#071f5c]/90 border border-blue-400/30 shadow-inner">
            
            {/* PAGO MÓVIL */}
            {activeTab === 'pago-movil' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-400/25">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#A3E229]" />
                    <span className="font-orbitron font-bold text-white text-xs sm:text-sm">Pago Móvil Interbancario</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#A3E229]/20 text-[#A3E229] border border-[#A3E229]/40 font-orbitron">
                    Tasa Oficial BCV
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Banco</span>
                      <strong className="text-white text-sm">Banesco (0134)</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Teléfono</span>
                      <strong className="text-white font-mono text-sm">0414-8889900</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('04148889900', 'pm_tel')}
                      className="p-1.5 rounded-lg bg-[#0a389c] hover:bg-[#A3E229] hover:text-[#150D8B] text-blue-100 transition-colors"
                      title="Copiar teléfono"
                    >
                      {copiedField === 'pm_tel' ? <Check className="w-3.5 h-3.5 text-[#A3E229]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Cédula / RIF</span>
                      <strong className="text-white font-mono text-sm">J-50000000-0</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('J500000000', 'pm_rif')}
                      className="p-1.5 rounded-lg bg-[#0a389c] hover:bg-[#A3E229] hover:text-[#150D8B] text-blue-100 transition-colors"
                      title="Copiar RIF"
                    >
                      {copiedField === 'pm_rif' ? <Check className="w-3.5 h-3.5 text-[#A3E229]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Titular</span>
                      <strong className="text-white text-xs sm:text-sm">La Marina Sport Club C.A.</strong>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-blue-200/80 pt-1">
                  * El monto en Bolívares se calcula multiplicando $150 USD por la tasa oficial BCV del día de la transferencia.
                </p>
              </div>
            )}

            {/* ZELLE */}
            {activeTab === 'zelle' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-400/25">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <span className="font-orbitron font-bold text-white text-xs sm:text-sm">Zelle (USD Directo)</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 font-orbitron">
                    Sin comisiones
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Correo Oficial Zelle</span>
                      <strong className="text-white font-mono text-sm sm:text-base">pagos@copanavidadlmsc.com</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('pagos@copanavidadlmsc.com', 'zelle_email')}
                      className="p-2 rounded-lg bg-[#0a389c] hover:bg-[#A3E229] hover:text-[#150D8B] text-blue-100 transition-colors"
                      title="Copiar correo Zelle"
                    >
                      {copiedField === 'zelle_email' ? <Check className="w-4 h-4 text-[#A3E229]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25">
                    <span className="text-blue-200 block text-[10px] font-bold uppercase">Titular Registrado</span>
                    <strong className="text-white">LMSC Padel Operations LLC</strong>
                  </div>
                </div>

                <p className="text-[11px] text-blue-200/80 pt-1">
                  * En el memo o concepto de Zelle coloca únicamente el apellido de la pareja o tu número de teléfono.
                </p>
              </div>
            )}

            {/* EFECTIVO */}
            {activeTab === 'efectivo' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-400/25">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-400" />
                    <span className="font-orbitron font-bold text-white text-xs sm:text-sm">Pago en Efectivo (Taquilla / Club)</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-orbitron">
                    USD o Bs.
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#082363] border border-blue-400/25">
                    <span className="text-blue-200 block text-[10px] font-bold uppercase">Lugar de Pago Autorizado</span>
                    <strong className="text-white text-sm">Recepción de La Marina Sport Club</strong>
                    <p className="text-blue-100/90 text-[11px] mt-0.5">
                      Lechería, estado Anzoátegui. Solicita tu recibo con el comité organizador de la Copa Navidad.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Horario de Atención</span>
                      <strong className="text-white">Lunes a Domingo: 8:00 AM a 9:00 PM</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CUENTA BANCARIA INTERNACIONAL */}
            {activeTab === 'cuenta-internacional' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-400/25">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-blue-400" />
                    <span className="font-orbitron font-bold text-white text-xs sm:text-sm">Cuenta Bancaria Internacional</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 font-orbitron">
                    Wire / ACH / Banesco Panamá
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25">
                    <span className="text-blue-200 block text-[10px] font-bold uppercase">Banco Destino</span>
                    <strong className="text-white">Banesco Panamá</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Número de Cuenta USD</span>
                      <strong className="text-white font-mono">1029384756</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('1029384756', 'panama_cta')}
                      className="p-1.5 rounded-lg bg-[#0a389c] hover:bg-[#A3E229] hover:text-[#150D8B] text-blue-100 transition-colors"
                      title="Copiar cuenta"
                    >
                      {copiedField === 'panama_cta' ? <Check className="w-3.5 h-3.5 text-[#A3E229]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25">
                    <span className="text-blue-200 block text-[10px] font-bold uppercase">Beneficiario</span>
                    <strong className="text-white">LMSC Corp Panamá</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#082363] border border-blue-400/25 flex justify-between items-center">
                    <div>
                      <span className="text-blue-200 block text-[10px] font-bold uppercase">Código SWIFT / BIC</span>
                      <strong className="text-white font-mono">BAPAPAXX</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('BAPAPAXX', 'panama_swift')}
                      className="p-1.5 rounded-lg bg-[#0a389c] hover:bg-[#A3E229] hover:text-[#150D8B] text-blue-100 transition-colors"
                      title="Copiar SWIFT"
                    >
                      {copiedField === 'panama_swift' ? <Check className="w-3.5 h-3.5 text-[#A3E229]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ACCIÓN PRINCIPAL: NOTIFICAR O ENVIAR COMPROBANTE POR WHATSAPP */}
        <div className="mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-orbitron font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(37,211,102,0.45)] flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95 text-center tracking-wider uppercase"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Enviar Comprobante por WhatsApp</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
          <span className="block text-center text-[11px] text-blue-200/80 mt-1.5">
            Se abrirá WhatsApp con el mensaje pre-cargado de tu dupla para agilizar la confirmación.
          </span>
        </div>

        {/* SECCIÓN OPCIONAL: REPORTAR COMPROBANTE DIRECTO EN ESTA VENTANA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#082363]/75 border border-blue-400/25 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-orbitron">
              <ShieldCheck className="w-4 h-4 text-[#A3E229]" />
              <span>¿Ya tienes el comprobante a mano? Adjúntalo aquí:</span>
            </span>
          </div>

          {paymentSavedSuccess ? (
            <div className="p-3 rounded-xl bg-[#A3E229]/20 border border-[#A3E229]/50 text-white text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#A3E229] shrink-0" />
              <span>¡Comprobante y referencia guardados con éxito en tu ficha de inscripción! El comité revisará tu pago a la brevedad.</span>
            </div>
          ) : (
            <form onSubmit={handleSavePaymentReport} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
                    Método Utilizado
                  </label>
                  <select
                    value={metodoPagoReporte}
                    onChange={(e) => setMetodoPagoReporte(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#071f5c] border border-blue-400/30 text-xs text-white focus:outline-none focus:border-[#A3E229]"
                  >
                    <option value="Pago Móvil">Pago Móvil</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Efectivo en Club">Efectivo en Club</option>
                    <option value="Cuenta Internacional">Cuenta Bancaria Internacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
                    ID / Referencia Bancaria
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: REF-928123"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#071f5c] border border-blue-400/30 text-xs text-white focus:outline-none focus:border-[#A3E229]"
                  />
                </div>
              </div>

              {/* Input de archivo */}
              <div>
                {comprobanteUrl ? (
                  <div className="p-2.5 rounded-xl bg-[#071f5c] border border-[#A3E229]/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <FileCheck className="w-5 h-5 text-[#A3E229] shrink-0" />
                      <span className="truncate text-white font-medium">{comprobanteNombre}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setComprobanteUrl(''); setComprobanteNombre(''); setComprobanteFile(null); }}
                      className="p-1 rounded text-blue-200 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-blue-400/40 hover:border-[#A3E229] rounded-xl bg-[#071f5c]/60 cursor-pointer text-xs text-blue-200 hover:text-white transition-colors">
                    <UploadCloud className="w-4 h-4 text-[#A3E229]" />
                    <span>Cargar comprobante (JPG, PNG o PDF &lt; 1MB)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
                {fileError && <p className="text-[11px] text-rose-300 mt-1">{fileError}</p>}
              </div>

              <button
                type="submit"
                disabled={savingPayment}
                className="w-full py-2.5 rounded-xl bg-[#0a389c] hover:bg-[#A3E229] hover:text-[#150D8B] text-[#A3E229] font-orbitron font-bold text-xs border border-[#A3E229]/50 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>{savingPayment ? 'Guardando comprobante...' : 'Guardar Comprobante en el Sistema'}</span>
              </button>
            </form>
          )}
        </div>

        {/* BOTONES FINALES DE CIERRE E IMPRESIÓN */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-blue-400/25">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-6 rounded-2xl font-orbitron text-xs sm:text-sm font-black bg-[#A3E229] hover:bg-[#b6f23d] text-[#150D8B] shadow-[0_0_25px_rgba(163,226,41,0.5)] transition-all text-center uppercase tracking-wider"
          >
            Entendido / Cerrar Ventana
          </button>
          
          <button
            onClick={handlePrint}
            className="py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold bg-[#082363] hover:bg-[#0a389c] text-white border border-blue-400/30 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#A3E229]" />
            <span>Imprimir Ficha</span>
          </button>
        </div>

      </div>
    </div>
  );
}
