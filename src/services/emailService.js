/**
 * Servicio de envío de notificaciones y correos de confirmación oficial
 * Integra EmailJS para envío directo a ambos jugadores y copia al correo oficial de La Marina Sport Club
 */

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_v4ttckc';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_w4tr0o3';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'xFL3htVHrF7sRuca0';
const OFFICIAL_CLUB_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'lamarinasportclub@gmail.com';

export async function sendConfirmationEmails(registrationData) {
  const jugador1 = registrationData.jugador1 || {};
  const jugador2 = registrationData.jugador2 || {};

  // Lista de correos destinatarios (Jugador 1, Jugador 2 y copia a La Marina)
  const recipientEmails = [
    jugador1.email?.trim(),
    jugador2.email?.trim(),
    OFFICIAL_CLUB_EMAIL
  ].filter(Boolean);

  const templateParams = {
    // Destinatarios múltiples
    to_email: recipientEmails.join(', '),
    email: recipientEmails.join(', '),
    to_name: `${jugador1.nombre || ''} y ${jugador2.nombre || ''}`.trim(),
    admin_email: OFFICIAL_CLUB_EMAIL,
    reply_to: OFFICIAL_CLUB_EMAIL,

    // Datos del Torneo
    torneo: 'Copa Navidad LMSC 2026',
    sede: 'La Marina Sport Club, Lechería',
    categoria: registrationData.categoria || 'Sin categoría',
    monto: registrationData.monto || '$150',
    metodo_pago: registrationData.metodoPago || 'No especificado',
    referencia_pago: registrationData.referenciaPago || 'Sin referencia',
    fecha_registro: new Date().toLocaleDateString('es-VE'),
    hora_registro: new Date().toLocaleTimeString('es-VE'),

    // Datos Jugador 1
    jugador1_nombre: `${jugador1.nombre || ''} ${jugador1.apellido || ''}`.trim(),
    jugador1_cedula: jugador1.cedula || 'N/A',
    jugador1_email: jugador1.email || 'N/A',
    jugador1_telefono: jugador1.telefono || 'N/A',
    jugador1_talla: jugador1.tallaFranela || 'N/A',
    jugador1_lado: jugador1.ladoJuego || 'N/A',
    jugador1_categoria: jugador1.categoriaHabitual || 'N/A',
    jugador1_torneo: jugador1.torneoActual || 'N/A',
    jugador1_historial: jugador1.historialTorneos || 'N/A',
    jugador1_alergias: jugador1.alergias || 'Ninguna',

    // Datos Jugador 2
    jugador2_nombre: `${jugador2.nombre || ''} ${jugador2.apellido || ''}`.trim(),
    jugador2_cedula: jugador2.cedula || 'N/A',
    jugador2_email: jugador2.email || 'N/A',
    jugador2_telefono: jugador2.telefono || 'N/A',
    jugador2_talla: jugador2.tallaFranela || 'N/A',
    jugador2_lado: jugador2.ladoJuego || 'N/A',
    jugador2_categoria: jugador2.categoriaHabitual || 'N/A',
    jugador2_torneo: jugador2.torneoActual || 'N/A',
    jugador2_historial: jugador2.historialTorneos || 'N/A',
    jugador2_alergias: jugador2.alergias || 'Ninguna',

    // Asunto sugerido por si la plantilla lo usa como variable
    subject: `Confirmación de Inscripción - Copa Navidad LMSC 2026 (${registrationData.categoria})`
  };

  try {
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams
    };

    console.log('📧 Enviando correos de confirmación vía EmailJS...', {
      destinatarios: templateParams.to_email,
      categoria: templateParams.categoria
    });

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Correo de confirmación enviado exitosamente con EmailJS');
      return { success: true, method: 'emailjs' };
    } else {
      const errorText = await response.text();
      console.warn('⚠️ Respuesta no exitosa de EmailJS:', response.status, errorText);
      return { success: false, error: errorText, method: 'emailjs' };
    }
  } catch (error) {
    console.error('❌ Error de conexión al enviar correo con EmailJS:', error);
    return { success: false, error: error.message, method: 'emailjs' };
  }
}
