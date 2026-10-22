// QA de peso: bytes que descarga un teléfono (412 px) en la intro y tras abrir y recorrer el Home,
// separando los videos. Presupuesto: intro < 1.5 MB y total < 5 MB sin videos; cada video ≤ 6 MB (van a
// 1080p con calidad visualmente sin pérdida; ver scripts/videos.json). Solo se debe bajar un formato por video.
// Uso: npm run build && npx astro preview  →  node scripts/qa-peso.mjs [url] [dpr]
import { chromium } from 'playwright';

const URL = process.argv[2] ?? 'http://localhost:4321';
const DPR = Number(process.argv[3] ?? 3);
const MB = 1024 * 1024;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 917 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');

const porTipo = {};
const videos = {};
const urls = new Map();
const tipos = new Map();
cdp.on('Network.responseReceived', (e) => {
  tipos.set(e.requestId, e.type);
  urls.set(e.requestId, e.response.url);
});
cdp.on('Network.loadingFinished', (e) => {
  const tipo = tipos.get(e.requestId) ?? 'Other';
  const url = urls.get(e.requestId) ?? '';
  if (/\.mp4/.test(url)) {
    const nombre = url.match(/([\w-]+)\.mp4/)[1];
    videos[nombre] = (videos[nombre] ?? 0) + e.encodedDataLength;
  } else porTipo[tipo] = (porTipo[tipo] ?? 0) + e.encodedDataLength;
});
const sinVideos = () => Object.values(porTipo).reduce((a, n) => a + n, 0);
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const detalle = () => Object.fromEntries(Object.entries(porTipo).map(([k, v]) => [k, kb(v)]));

// Intro: lo que se baja hasta el evento "load" (después llegan el Home y los chicharrones, en segundo plano)
await page.goto(URL, { waitUntil: 'load' });
const intro = sinVideos();
console.log(`Intro (DPR ${DPR}) sin videos: ${kb(intro)}`, detalle());
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);
console.log(`Antes de abrir, con el Home ya precargado: ${kb(sinVideos())}`);

await page.tap('.bolsa', { force: true });
await page.waitForSelector('#intro', { state: 'detached' });
for (let i = 0; i < 12; i++) {
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(250);
}
await page.waitForTimeout(3000);
const total = sinVideos();
console.log(`Total tras recorrer el Home sin videos: ${kb(total)}`, detalle());
console.log('Videos descargados:', Object.fromEntries(Object.entries(videos).map(([k, v]) => [k, kb(v)])));
await b.close();

const fallas = [];
if (intro > 1.5 * MB) fallas.push(`intro ${kb(intro)} > 1.5 MB`);
if (total > 5 * MB) fallas.push(`total ${kb(total)} > 5 MB`);
for (const [k, v] of Object.entries(videos)) if (v > 6 * MB) fallas.push(`${k} ${kb(v)} > 6 MB`);
const formatos = new Set(Object.keys(videos).map((k) => k.replace(/^fondo-[a-z]+-/, '')));
if (formatos.size > 1) fallas.push(`se bajó más de un formato: ${[...formatos].join(', ')}`);
if (fallas.length) {
  console.log('✗', fallas.join(' · '));
  process.exitCode = 1;
} else console.log('✓ dentro del presupuesto');
