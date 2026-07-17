const nodemailer = require('nodemailer');

function getAllowedDomains() {
  const raw =
    process.env.ALLOWED_EMAIL_DOMAINS ||
    'gmail.com,hotmail.com,outlook.com,yahoo.com,live.com,icloud.com,utez.edu.mx';
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function getEmailDomain(correo) {
  const parts = String(correo).toLowerCase().trim().split('@');
  return parts.length === 2 ? parts[1] : '';
}

function isAllowedEmailDomain(correo) {
  const domain = getEmailDomain(correo);
  return Boolean(domain && getAllowedDomains().includes(domain));
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

/**
 * Envía el correo de verificación. Si no hay SMTP configurado,
 * solo registra el enlace en consola (útil en desarrollo académico).
 */
async function sendVerificationEmail({ correo, nombre, token }) {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const verifyUrl = `${frontendUrl}/verificar-cuenta?token=${encodeURIComponent(token)}`;
  const from = process.env.MAIL_FROM || 'Ynventory <noreply@ynventory.local>';

  const subject = 'Verifica tu cuenta de Ynventory';
  const text = `Hola ${nombre},

Gracias por registrarte en Ynventory.
Para activar tu cuenta abre este enlace (válido por 24 horas):

${verifyUrl}

Si no creaste esta cuenta, ignora este mensaje.`;

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8f6ff;color:#36084d">
      <h2 style="margin:0 0 12px;color:#5411ae">Verifica tu cuenta</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Gracias por registrarte en <strong>Ynventory</strong>. Para activar tu cuenta haz clic en el botón:</p>
      <p style="margin:28px 0">
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(90deg,#3B5897,#5411AE);color:#fff;text-decoration:none;font-weight:600">
          Verificar cuenta
        </a>
      </p>
      <p style="font-size:13px;color:#5411ae">O copia este enlace:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="font-size:12px;color:#777">El enlace expira en 24 horas.</p>
    </div>`;

  const transport = createTransport();

  if (!transport) {
    console.log('\n========== VERIFICACIÓN DE CUENTA (SMTP no configurado) ==========');
    console.log(`Para: ${correo}`);
    console.log(`Enlace: ${verifyUrl}`);
    console.log('==================================================================\n');
    return { sent: false, verifyUrl };
  }

  await transport.sendMail({ from, to: correo, subject, text, html });
  return { sent: true, verifyUrl };
}

module.exports = {
  getAllowedDomains,
  isAllowedEmailDomain,
  sendVerificationEmail,
};
