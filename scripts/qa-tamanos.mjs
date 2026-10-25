// QA de tamaños: en cada ancho y alto revisa que la intro quepa completa, que no haya scroll horizontal,
// que el Home tenga el ancho de los breakpoints de tokens.css (pantalla completa en móvil, tarjeta
// centrada en tablet y escritorio), que escale exacto (2281 × ancho / 412) y que ningún texto se salga.
// Guarda una captura de la intro por tamaño y una hoja de contacto en qa/capturas/tamanos.png; de
// tablet y escritorio también el Home abierto (qa/capturas/escritorio.png).
// Uso: node scripts/qa-tamanos.mjs [url]   (por defecto http://localhost:4321)
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const URL = process.argv[2] ?? 'http://localhost:4321';
const OUT = 'qa/capturas/tamanos';
await mkdir(OUT, { recursive: true });

const anchos = [320, 360, 375, 390, 393, 412, 414, 430].map((w) => [w, 917]);
const altos = [568, 667, 740, 844, 932].map((h) => [h === 568 ? 320 : 375, h]);
const anchas = [[768, 1024], [834, 1194], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];

/** Ancho esperado de la invitación según tokens.css */
function anchoEsperado(w, h) {
  if (w < 600) return w;
  if (h > w) return Math.min(w - 128, 640);
  return Math.min(Math.max(440, 0.34 * w), 540);
}

const browser = await chromium.launch();
const fallas = [];
const capturas = [];

const escritorio = [];
for (const [w, h] of [...anchos, ...altos, ...anchas]) {
  const movil = w < 600;
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const nombre = `${w}x${h}`;
  const falla = (m) => fallas.push(`${nombre}: ${m}`);

  // Intro: lienzo, bolsa y botón dentro de la pantalla
  const intro = await page.evaluate(() => {
    const caja = (s) => {
      const r = document.querySelector(s).getBoundingClientRect();
      return { l: r.left, t: r.top, r: r.right, b: r.bottom };
    };
    return {
      lienzo: caja('.intro__lienzo'),
      silueta: caja('.silueta'),
      boton: caja('#boton-abrir'),
      scroll: document.documentElement.scrollWidth,
    };
  });
  for (const [k, c] of Object.entries(intro).filter(([k]) => k !== 'scroll')) {
    if (c.l < -0.5 || c.t < -0.5 || c.r > w + 0.5 || c.b > h + 0.5) falla(`intro: ${k} se sale de la pantalla ${JSON.stringify(c)}`);
  }
  if (intro.scroll > w) falla(`intro: scroll horizontal (${intro.scroll} px)`);
  const archivo = `${OUT}/intro-${nombre}.png`;
  await page.screenshot({ path: archivo });
  if (movil) capturas.push({ archivo, w, h });

  // Home sin intro
  const home = await page.evaluate(() => {
    document.getElementById('intro')?.remove();
    document.body.classList.remove('bloqueado');
    const el = document.getElementById('home');
    el.classList.add('visible');
    const textos = [...el.querySelectorAll('h2, p, dt, dd')].filter((t) => !t.classList.contains('solo-lectores')).map((t) => {
      const r = t.getBoundingClientRect();
      return { texto: t.textContent.trim(), l: r.left, r: r.right };
    });
    const r = el.getBoundingClientRect();
    return { alto: r.height, ancho: r.width, x: r.left, scroll: document.documentElement.scrollWidth, textos };
  });
  const ancho = anchoEsperado(w, h);
  if (Math.abs(home.ancho - ancho) > 1) falla(`home: ancho ${home.ancho.toFixed(1)} (esperado ${ancho.toFixed(1)})`);
  if (Math.abs(home.x - (w - home.ancho) / 2) > 1) falla(`home: no está centrado (x ${home.x.toFixed(1)})`);
  const esperado = (2281 * home.ancho) / 412;
  if (Math.abs(home.alto - esperado) > 1) falla(`home: alto ${home.alto} (esperado ${esperado.toFixed(1)})`);
  if (home.scroll > w) falla(`home: scroll horizontal (${home.scroll} px)`);
  const [x0, x1] = [home.x, home.x + home.ancho];
  for (const t of home.textos) if (t.l < x0 - 0.5 || t.r > x1 + 0.5) falla(`home: "${t.texto}" se sale de la invitación (${t.l.toFixed(1)}–${t.r.toFixed(1)})`);
  if (!movil) {
    await page.evaluate(() => document.querySelectorAll('[data-revelar]').forEach((e) => e.classList.add('revelado')));
    await page.waitForTimeout(1200);
    const archivoHome = `${OUT}/home-${nombre}.png`;
    await page.screenshot({ path: archivoHome });
    escritorio.push({ intro: archivo, home: archivoHome, w, h });
  }
  await page.close();
}
await browser.close();

// Hoja de contacto de la intro a 1/2
const alto = 932 / 2;
const piezas = await Promise.all(
  capturas.map(async ({ archivo, w, h }) => ({ input: await sharp(archivo).resize(Math.round(w / 2), Math.round(h / 2)).toBuffer(), w: Math.round(w / 2) })),
);
let x = 0;
const composicion = piezas.map((p) => {
  const c = { input: p.input, left: x, top: 0 };
  x += p.w + 8;
  return c;
});
await sharp({ create: { width: x, height: Math.round(alto), channels: 4, background: '#666' } }).composite(composicion).png().toFile('qa/capturas/tamanos.png');

// Hoja de tablet y escritorio: intro y Home abierto, a 400 px de alto
const piezasAnchas = [];
for (const { intro, home } of escritorio)
  for (const f of [intro, home]) piezasAnchas.push(await sharp(f).resize({ height: 400 }).toBuffer());
let xa = 0;
const compAnchas = [];
for (const input of piezasAnchas) {
  const { width } = await sharp(input).metadata();
  compAnchas.push({ input, left: xa, top: 0 });
  xa += width + 8;
}
await sharp({ create: { width: xa, height: 400, channels: 4, background: '#666' } }).composite(compAnchas).png().toFile('qa/capturas/escritorio.png');

if (fallas.length) {
  console.log(`✗ ${fallas.length} problemas:`);
  fallas.forEach((f) => console.log('  ' + f));
  process.exitCode = 1;
} else {
  console.log(`✓ ${capturas.length} tamaños sin problemas · hoja de contacto en qa/capturas/tamanos.png`);
}
