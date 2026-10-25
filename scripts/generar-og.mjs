// Genera public/og-image.jpg (1200 × 630, vista previa de WhatsApp) a partir del héroe real de la invitación:
// captura el logo y el título "CumpleMania" con el avatar (y de 0 a 400 de la invitación) a 3× y lo centra sobre una
// versión desenfocada y oscurecida de la misma captura, que llena los costados.
// Requiere el sitio servido. Uso: node scripts/generar-og.mjs [url]   (por defecto http://localhost:4321)
import { chromium } from 'playwright';
import sharp from 'sharp';

const URL = process.argv[2] ?? 'http://localhost:4321';
const W = 1200, H = 630;
const DESDE = 0, HASTA = 400; // franja de la invitación, en px de diseño (el héroe empieza 188 más arriba)

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 917 }, deviceScaleFactor: 3 });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; } .guia { display: none !important; }' });
await p.evaluate(async () => {
  document.getElementById('intro')?.remove();
  document.body.classList.remove('bloqueado');
  const home = document.getElementById('home');
  home.classList.add('cargado', 'visible');
  home.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
  await Promise.all([...document.images].map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => (i.onload = i.onerror = r)))));
  await document.fonts.ready;
});
await p.waitForTimeout(500);
const franja = await p.screenshot({ clip: { x: 0, y: DESDE, width: 412, height: HASTA - DESDE } });
await b.close();

const alto = H;
const centro = await sharp(franja).resize({ height: alto }).toBuffer();
const { width: anchoCentro } = await sharp(centro).metadata();
const fondo = await sharp(franja).resize(W, H, { fit: 'cover' }).blur(28).modulate({ brightness: 0.45 }).toBuffer();
await sharp(fondo)
  .composite([{ input: centro, left: Math.round((W - anchoCentro) / 2), top: 0 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('public/og-image.jpg listo');
