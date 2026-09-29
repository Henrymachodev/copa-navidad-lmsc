const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

/**
 * CONFIGURACIÓN DE TRANSPORTE DE CORREO (SMTP / Gmail / Resend)
 * Define estas variables en el entorno o en un archivo .env en /functions:
 * SMTP_USER = tu_correo@gmail.com
 * SMTP_PASS = tu_contraseña_de_aplicacion_google (o token SMTP)
 * ADMIN_EMAIL = tu_correo_de_administrador@gmail.com
 */
const transporter = nodemailer.createTransport({
  service: "gmail", // Puedes cambiar a 'smtp.resend.com' o servicio corporativo
  auth: {
    user: process.env.SMTP_USER || "organizador@copanavidadlmsc.com",
    pass: process.env.SMTP_PASS || "tu_app_password_aqui",
  },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "administracion@copanavidadlmsc.com";

/**
 * Plantilla HTML para los Jugadores
 */
function getPlayerEmailTemplate(data) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0c1b33; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f5c518;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #f5c518; margin: 0; font-size: 26px;">🎾 ¡Inscripción Confirmada!</h1>
        <p style="color: #cbd5e1; font-size: 15px; margin-top: 6px;">Copa Navidad 2026 • La Marina Sporting Club</p>
      </div>

      <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
        Hola <strong>${data.jugador1.nombre}</strong> y <strong>${data.jugador2.nombre}</strong>:
      </p>
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        ¡Su pareja ha quedado formalmente registrada en la <strong>Copa Navidad LMSC</strong>! A continuación los detalles de su inscripción:
      </p>

      <div style="background-color: #14294d; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.1);">
        <p style="margin: 6px 0; font-size: 14px;"><strong>🏆 Categoría:</strong> <span style="color: #f5c518; font-weight: bold;">${data.categoria}</span></p>
        <hr style="border: 0; border-top: 1px solid #1e3a6c; margin: 12px 0;" />
        <p style="margin: 6px 0; font-size: 14px;"><strong>👤 Jugador 1:</strong> ${data.jugador1.nombre} ${data.jugador1.apellido} (${data.jugador1.telefono})</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>👤 Jugador 2:</strong> ${data.jugador2.nombre} ${data.jugador2.apellido} (${data.jugador2.telefono})</p>
      </div>

      <div style="background-color: #1a365d; padding: 15px; border-radius: 8px; border-left: 4px solid #f5c518; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 13px; color: #e2e8f0;">
          📌 <strong>Próximos Pasos:</strong> La comisión técnica publicará el calendario de partidos y cuadro oficial en los canales del club antes del inicio de la primera ronda.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #1e3a6c; padding-top: 20px; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">La Marina Sporting Club (LMSC) • Torneo de Fin de Año</p>
        <p style="margin: 4px 0 0 0;">Si tienes alguna consulta, responde directamente a este correo.</p>
      </div>
    </div>
  `;
}

/**
 * Plantilla HTML para el Administrador
 */
function getAdminEmailTemplate(data, docId) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #ffffff; color: #1e293b; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0c1b33; margin-top: 0;">🔔 Nueva Pareja Inscrita en Copa Navidad LMSC</h2>
      <p style="font-size: 14px; color: #64748b;">Se ha registrado una nueva dupla en Firestore:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Categoría:</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0284c7; font-weight: bold;">${data.categoria}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Jugador 1:</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.jugador1.nombre} ${data.jugador1.apellido} <br/>📧 ${data.jugador1.email} | 📞 ${data.jugador1.telefono}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Jugador 2:</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.jugador2.nombre} ${data.jugador2.apellido} <br/>📧 ${data.jugador2.email} | 📞 ${data.jugador2.telefono}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">ID Firestore:</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-family: monospace;">${docId}</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
        Puedes ver la lista completa y descargar el archivo Excel en el <strong>Panel de Administración</strong> de la web.
      </p>
    </div>
  `;
}

/**
 * Trigger Cloud Function al crearse un documento en inscripciones_copa_navidad
 */
exports.onInscripcionCreated = onDocumentCreated(
  "inscripciones_copa_navidad/{docId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("No hay datos en el snapshot");
      return;
    }

    const data = snapshot.data();
    const docId = event.params.docId;
    logger.info(`Procesando envío de correos para inscripción: ${docId}`, data);

    try {
      // 1. Enviar correo a los 2 jugadores
      const playerEmails = [data.jugador1.email, data.jugador2.email].filter(Boolean);

      await transporter.sendMail({
        from: `"Copa Navidad LMSC" <${process.env.SMTP_USER || "no-reply@copanavidadlmsc.com"}>`,
        to: playerEmails.join(", "),
        subject: `🎾 Confirmación de Inscripción - Copa Navidad LMSC (${data.categoria})`,
        html: getPlayerEmailTemplate(data),
      });

      logger.info(`Correo enviado exitosamente a los jugadores: ${playerEmails.join(", ")}`);

      // 2. Enviar correo al Administrador
      await transporter.sendMail({
        from: `"Sistema LMSC" <${process.env.SMTP_USER || "no-reply@copanavidadlmsc.com"}>`,
        to: ADMIN_EMAIL,
        subject: `🔔 Nueva Inscripción Copa Navidad: ${data.categoria} - ${data.jugador1.nombre} & ${data.jugador2.nombre}`,
        html: getAdminEmailTemplate(data, docId),
      });

      logger.info(`Notificación enviada exitosamente al Administrador: ${ADMIN_EMAIL}`);
    } catch (error) {
      logger.error("Error al despachar correos:", error);
    }
  }
);
