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

const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_TO'];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

const transporter =
  missingEnvVars.length === 0
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
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

  const html = `
    <h2>Neue Anfrage ueber Talent Elevator Website</h2>
    <p><strong>Name:</strong><br />${escapeHtml(name)}</p>
    <p><strong>Unternehmen:</strong><br />${escapeHtml(company)}</p>
    <p><strong>E-Mail:</strong><br />${escapeHtml(email)}</p>
    <p><strong>Nachricht:</strong><br />${escapeHtml(message).replace(/\n/g, '<br />')}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Talent Elevator Website" <${process.env.SMTP_USER}>`,
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
});
