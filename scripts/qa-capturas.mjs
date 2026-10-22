// QA de fidelidad: captura la intro y el Home a 412 px @2× y los compara con los renders de Figma
// (qa/referencia/*@2x.png): imagen lado a lado, mapa de diferencias y error medio por franja.
// Uso: node scripts/qa-capturas.mjs [url]   (por defecto http://localhost:4321)
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const URL = process.argv[2] ?? 'http://localhost:4321';
const OUT = 'qa/capturas';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 917 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: 'networkidle' });
// Diseño estático: sin animaciones ni transiciones, y todo lo que se revela al hacer scroll, visible
await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
await page.evaluate(() => document.querySelectorAll('[data-revelar]').forEach((el) => el.classList.add('revelado')));

async function esperarImagenes() {
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
    // decoding="async": "complete" no garantiza que ya esté pintada
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    await document.fonts.ready;
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
}

await esperarImagenes();
await page.screenshot({ path: `${OUT}/intro.png` });

// Diseño estático: se quita la intro y se muestra el Home sin animación
await page.evaluate(() => {
  document.getElementById('intro')?.remove();
  document.body.classList.remove('bloqueado');
  const home = document.getElementById('home');
  home.style.transition = 'none';
  home.classList.add('visible');
  home.removeAttribute('inert');
});
await esperarImagenes();
await page.screenshot({ path: `${OUT}/home.png`, fullPage: true });
await browser.close();

async function ladoALado(a, b, salida) {
  const [ma, mb] = await Promise.all([sharp(a).metadata(), sharp(b).metadata()]);
  await sharp({ create: { width: ma.width + mb.width + 20, height: Math.max(ma.height, mb.height), channels: 4, background: '#888' } })
    .composite([{ input: a, left: 0, top: 0 }, { input: b, left: ma.width + 20, top: 0 }])
    .png()
    .toFile(salida);
}

/** Mapa de diferencias (×4 para que se note) y error medio (0–255) por franjas de 100 px de diseño */
async function comparar(ref, cap, nombre) {
  const { data: A, info } = await sharp(ref).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data: B } = await sharp(cap).resize(info.width, info.height, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const dif = Buffer.alloc(A.length);
  const franja = 200; // 100 px de diseño @2×
  const sumas = new Array(Math.ceil(info.height / franja)).fill(0);
  let total = 0;
  for (let i = 0; i < A.length; i++) {
    const d = Math.abs(A[i] - B[i]);
    dif[i] = Math.min(255, d * 4);
    total += d;
    sumas[Math.floor(i / 3 / info.width / franja)] += d;
  }
  await sharp(dif, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toFile(`${OUT}/dif-${nombre}.png`);
  await ladoALado(ref, cap, `${OUT}/cmp-${nombre}.png`);
  console.log(`${nombre}: error medio ${(total / A.length).toFixed(2)}`);
  sumas.forEach((s, i) => {
    const filas = Math.min(franja, info.height - i * franja);
    console.log(`  y ${String(i * 100).padStart(4)}–${String(i * 100 + filas / 2).padEnd(4)} ${(s / (filas * info.width * 3)).toFixed(2)}`);
  });
}

await comparar('qa/referencia/intro@2x.png', `${OUT}/intro.png`, 'intro');
await comparar('qa/referencia/home@2x.png', `${OUT}/home.png`, 'home');
console.log('listo:', OUT);
