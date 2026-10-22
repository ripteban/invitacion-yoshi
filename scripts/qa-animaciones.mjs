// QA de animaciones a 412 × 917 con la CPU 4× más lenta (gama media):
// abre la bolsa, mide los cuadros de la apertura, baja hasta el final y revisa que todo se revele,
// que no haya saltos de layout ni errores en consola. Repite con movimiento reducido y con el botón.
// Graba un video demo en qa/capturas/video/.
// Uso: node scripts/qa-animaciones.mjs [url]   (por defecto http://localhost:4321)
import { chromium } from 'playwright';
import { mkdir, rename, readdir } from 'node:fs/promises';

const URL = process.argv[2] ?? 'http://localhost:4321';
const VIDEO = 'qa/capturas/video';
await mkdir(VIDEO, { recursive: true });
const fallas = [];
const browser = await chromium.launch();

async function probar(nombre, { reducido = false, selector = '.bolsa', video = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 412, height: 917 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: reducido ? 'reduce' : 'no-preference',
    ...(video ? { recordVideo: { dir: VIDEO, size: { width: 412, height: 917 } } } : {}),
  });
  const page = await context.newPage();
  const errores = [];
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push(e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: 'layout-shift', buffered: true });
  });
  await page.waitForTimeout(1800); // animaciones en espera

  // Cuadros durante la apertura
  await page.evaluate(() => {
    window.__cuadros = [];
    let previo = performance.now();
    const medir = (t) => {
      window.__cuadros.push(t - previo);
      previo = t;
      if (window.__cuadros.length < 400 && document.getElementById('intro')) requestAnimationFrame(medir);
    };
    requestAnimationFrame(medir);
  });
  const t0 = Date.now();
  await page.tap(selector, { force: true }); // flotan sin parar: nunca están "estables"
  await page.waitForSelector('#intro', { state: 'detached', timeout: 5000 }).catch(() => fallas.push(`${nombre}: la intro no se eliminó`));
  const tAbrir = Date.now() - t0;
  const estado = await page.evaluate(() => ({
    visible: document.getElementById('home').classList.contains('visible'),
    inert: document.getElementById('home').inert,
    bloqueado: document.body.classList.contains('bloqueado'),
    cuadros: window.__cuadros,
  }));
  if (!estado.visible || estado.inert || estado.bloqueado) fallas.push(`${nombre}: el Home no quedó activo ${JSON.stringify({ ...estado, cuadros: undefined })}`);
  const c = estado.cuadros.slice(1);
  const lentos = c.filter((d) => d > 1000 / 30).length;
  const fps = c.length ? 1000 / (c.reduce((a, b) => a + b, 0) / c.length) : 0;

  // Scroll hasta el final, como un usuario
  await page.waitForTimeout(800);
  for (let i = 0; i < 24; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500);
  const sinRevelar = await page.evaluate(() => [...document.querySelectorAll('[data-revelar]:not(.revelado)')].map((e) => e.className));
  if (sinRevelar.length) fallas.push(`${nombre}: sin revelar ${sinRevelar.join(', ')}`);
  const cls = await page.evaluate(() => window.__cls);
  if (cls > 0.01) fallas.push(`${nombre}: saltos de layout (CLS ${cls.toFixed(3)})`);
  if (errores.length) fallas.push(`${nombre}: errores en consola ${errores.join(' | ')}`);

  console.log(
    `${nombre.padEnd(20)} abre en ${tAbrir} ms · ${fps.toFixed(0)} fps promedio · ${lentos}/${c.length} cuadros > 33 ms · CLS ${cls.toFixed(3)}`,
  );
  await context.close();
}

await probar('bolsa', { video: true });
await probar('botón', { selector: '#boton-abrir' });
await probar('movimiento reducido', { reducido: true });
await browser.close();

const [archivo] = await readdir(VIDEO).then((l) => l.filter((f) => f.endsWith('.webm') && f !== 'demo.webm'));
if (archivo) await rename(`${VIDEO}/${archivo}`, `${VIDEO}/demo.webm`);

if (fallas.length) {
  console.log(`✗ ${fallas.length} problemas:`);
  fallas.forEach((f) => console.log('  ' + f));
  process.exitCode = 1;
} else {
  console.log(`✓ sin problemas · video en ${VIDEO}/demo.webm`);
}
