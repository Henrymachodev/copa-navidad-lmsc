/**
 * Servicio de envío de notificaciones y correos de confirmación
 * Soporta integración con Webhooks de Make.com / Zapier o Cloud Functions
 */

export async function sendConfirmationEmails(registrationData) {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_MAKE_URL;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'administracion@copanavidadlmsc.com';

  const payload = {
    evento: 'Copa Navidad LMSC 2026',
    fechaInscripcion: new Date().toLocaleString('es-ES'),
    adminEmail,
    categoria: registrationData.categoria,
    jugador1: registrationData.jugador1,
    jugador2: registrationData.jugador2,
    asuntoJugador: `🎾 Confirmación de Inscripción - Copa Navidad LMSC (${registrationData.categoria})`,
    asuntoAdmin: `🔔 Nueva Pareja Inscrita en Copa Navidad LMSC - ${registrationData.categoria}`
  };

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      return { success: response.ok, method: 'webhook' };
    } catch (error) {
      console.error('Error al enviar webhook de email:', error);
      return { success: false, error: error.message, method: 'webhook' };
    }
  }

  // Si no hay webhook configurado, se registra la simulación en consola
  console.log('📧 [Simulación de Correo] Se enviaría confirmación a:', {
    jugador1: registrationData.jugador1.email,
    jugador2: registrationData.jugador2.email,
    admin: adminEmail,
    payload
  });

  return { success: true, method: 'simulated' };
}
