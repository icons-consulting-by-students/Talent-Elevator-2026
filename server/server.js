const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

app.use(
  cors({
    origin: true,
  })
);
app.use(express.json({ limit: '1mb' }));

const isPlaceholderValue = (value = '') => /your-|example|changeme/i.test(String(value));

const createTransportConfig = () => {
  const smtpService = String(process.env.SMTP_SERVICE || '').trim();
  const smtpHost = String(process.env.SMTP_HOST || '').trim();
  const smtpPort = String(process.env.SMTP_PORT || '').trim();
  const smtpSecure = String(process.env.SMTP_SECURE || '').trim().toLowerCase();

  if (smtpService) {
    return {
      service: smtpService,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }

  return {
    host: smtpHost,
    port: Number(smtpPort || 587),
    secure: smtpSecure ? smtpSecure === 'true' : Number(smtpPort || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
};

const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS', 'MAIL_TO'];

if (!process.env.SMTP_SERVICE && !process.env.SMTP_HOST) {
  requiredEnvVars.push('SMTP_HOST');
}

const missingEnvVars = requiredEnvVars.filter((key) => {
  const value = process.env[key];
  return !value || isPlaceholderValue(value);
});

const transporter =
  missingEnvVars.length === 0
    ? nodemailer.createTransport(createTransportConfig())
    : null;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const validatePayload = (body = {}) => {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !company || !email || !message) {
    return { error: 'Bitte fuellen Sie alle Pflichtfelder aus.' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { error: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein.' };
  }

  return {
    value: { name, company, email, message },
  };
};

app.post('/api/contact', async (req, res) => {
  const validation = validatePayload(req.body);
  if (validation.error) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  if (!transporter) {
    return res.status(500).json({
      success: false,
      error: `Server-Konfiguration unvollstaendig. Fehlende ENV Variablen: ${missingEnvVars.join(', ')}`,
    });
  }

  const { name, company, email, message } = validation.value;
  const fromLabel = `${name} via Talent Elevator`.replace(/"/g, '');

  const html = `
    <h2>Neue Anfrage ueber Talent Elevator Website</h2>
    <p><strong>Name:</strong><br />${escapeHtml(name)}</p>
    <p><strong>Unternehmen:</strong><br />${escapeHtml(company)}</p>
    <p><strong>E-Mail:</strong><br />${escapeHtml(email)}</p>
    <p><strong>Nachricht:</strong><br />${escapeHtml(message).replace(/\n/g, '<br />')}</p>
  `;

  const confirmationText = [
    `Liebe/r ${name},`,
    '',
    'vielen Dank für Ihre Anfrage! Wir haben Ihre Nachricht erhalten und melden uns zeitnah bei Ihnen.',
    '',
    'Hier eine Zusammenfassung Ihrer Anfrage:',
    '',
    `Unternehmen: ${company}`,
    `E-Mail: ${email}`,
    '',
    'Nachricht:',
    message,
    '',
    'Beste Grüße',
    'Talent Elevator Team',
  ].join('\n');

  const confirmationHtml = `
    <p>Liebe/r ${escapeHtml(name)},</p>
    <p>vielen Dank für Ihre Anfrage! Wir haben Ihre Nachricht erhalten und melden uns zeitnah bei Ihnen.</p>
    <p><strong>Hier eine Zusammenfassung Ihrer Anfrage:</strong></p>
    <p><strong>Unternehmen:</strong><br />${escapeHtml(company)}</p>
    <p><strong>E-Mail:</strong><br />${escapeHtml(email)}</p>
    <p><strong>Nachricht:</strong><br />${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    <p>Beste Grüße<br />Talent Elevator Team</p>
  `;

  try {
    const internalMailInfo = await transporter.sendMail({
      from: process.env.MAIL_FROM || `"${fromLabel}" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: 'Neue Anfrage ueber Talent Elevator Website',
      html,
      text: [
        'Neue Anfrage ueber Talent Elevator Website',
        '',
        `Name: ${name}`,
        `Unternehmen: ${company}`,
        `E-Mail: ${email}`,
        '',
        'Nachricht:',
        message,
      ].join('\n'),
    });
    console.log('Interne Kontakt-Mail gesendet:', {
      messageId: internalMailInfo.messageId,
      accepted: internalMailInfo.accepted,
      rejected: internalMailInfo.rejected,
    });

    const confirmationMailInfo = await transporter.sendMail({
      from: `"Talent Elevator" <${process.env.SMTP_USER}>`,
      to: email,
      replyTo: process.env.MAIL_TO,
      subject: 'Ihre Anfrage bei Talent Elevator',
      text: confirmationText,
      html: confirmationHtml,
    });
    console.log('Confirmation-Mail gesendet:', {
      messageId: confirmationMailInfo.messageId,
      accepted: confirmationMailInfo.accepted,
      rejected: confirmationMailInfo.rejected,
      recipient: email,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: 'Die Anfrage konnte aktuell nicht gesendet werden. Bitte versuchen Sie es erneut.',
    });
  }
});

if (PUBLIC_DIR !== ROOT_DIR) {
  app.use(express.static(PUBLIC_DIR));
}
app.use(express.static(ROOT_DIR));

app.listen(PORT, () => {
  console.log(`Talent Elevator server laeuft auf http://localhost:${PORT}`);

  if (!transporter) {
    console.warn(
      `Kontaktformular-Mailversand noch nicht aktiv. Fehlende oder Platzhalter-ENV Variablen: ${missingEnvVars.join(', ')}`
    );
    return;
  }

  transporter
    .verify()
    .then(() => {
      console.log('SMTP-Verbindung erfolgreich verifiziert.');
    })
    .catch((error) => {
      console.error('SMTP-Verifizierung fehlgeschlagen:', error.message);
      if (String(process.env.SMTP_HOST || '').includes('gmail') || String(process.env.SMTP_SERVICE || '').toLowerCase() === 'gmail') {
        console.error('Hinweis fuer Gmail: Verwenden Sie ein App-Passwort, nicht Ihr normales Google-Passwort.');
      }
    });
});
