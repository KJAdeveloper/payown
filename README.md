# NoiceInvoice (formerly PayOwn) — branch `pwa-step1`

Static, client-side invoice + pay-link PWA. No backend, no Stripe, never holds funds.

## Build
`npm install && npm run build` → `out/` (Vercel runs the same via `vercel.json`).
The build renders `index.html` / `i.html` templates, writes `manifest.webmanifest` and `sw.js`,
and rasterizes the PWA PNGs from `brand/logo/*.svg` (same files UIUX ships in `logo/png/`).

## Rebrand in one place
- **Name:** `brand.config.json` → `"name"` (HTML, SEO/OG, manifest, JS all read it). One-line flip, rebuild.
- **Colors / logo:** `tokens.css` (UIUX, `--ni-*`) + `brand/` assets. CSS order: `styles.css` → `tokens.css` → `v2-skin/noice-skin.css` → `app.css`.
- Canonical + sitemap stay on `payown.vercel.app` until the domain is bought.

## What's here
- `app.js` core builder + buyer page (readable source of the live c0–c7 bundle, extended: brands, Zelle, PayPal, payment marks).
- `store.js` My invoices (IndexedDB, localStorage fallback), brand profiles, JSON backup.
- `pwa.js` service worker registration, install hint (beforeinstallprompt / one-time iOS tip), offline bar.
- `_src/sw.tpl.js` app-shell service worker (never caches invoice data; `#i=` never reaches the network).
- `/i#demo` keeps the loud FAKE DEMO banner (hard-coded red).
