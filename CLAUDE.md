# Talent Elevator 2026

Event site for the icons Talent Elevator — the recruiting event connecting
students with partner companies. Hosted on Hostinger.

## Stack
Plain static HTML/CSS/JS (no build step) · Express + nodemailer server for the
contact/application form (`server/server.js`) · `contact.php` as the PHP-hosting
fallback for the same form.

## Run it
```bash
npm install
npm run dev          # starts server/server.js — only needed for the form
```
Static pages can simply be opened in the browser. SMTP credentials go in
`server/.env` (gitignored).

## Branches & deploy
Single `main` branch — pushing publishes. There is no staging, so check pages
locally before you push.

## Layout
- `index.html`, `unternehmen.html`, `anmeldung.html`, `kontakt.html`,
  `ueber-uns.html` — current edition
- `talent-elevator-2023/2024/2025.html` — **frozen archive**
- `css/`, `js/`, `assets/` — shared
- `search-index.json` — site search data
- `impressum.html`, `datenschutzerklaerung.html` — legal, change only with
  approval

## Rules that actually bite
- **Never restyle or "clean up" the archive pages.** They document past editions
  and partner companies as they were.
- Changing a page title or section heading means **regenerating
  `search-index.json`** — otherwise site search points at things that no longer
  exist.
- Company logos and names on `unternehmen.html` are contractual: only add or
  remove a partner when explicitly told to.
- `contact-mail.log` is a runtime artifact; never commit real submissions —
  it contains applicant data.
- Copy is German: *Sie* toward companies, *du* toward students.
