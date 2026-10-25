// Fluidez del héroe en un Android de gama media (Samsung A32: 1080 × 2400, DPR 2.625) con la CPU 6× más lenta.
// Sin GPU real, Chromium dibuja las capas en la CPU, así que cuántas capas se pintan por cuadro también cuenta.
// Abre la invitación, espera a que el video del héroe suene y mide los cuadros durante 6 s.
// Uso: node scripts/qa-heroe-fps.mjs [url]   (por defecto http://localhost:4321)
import { chromium } from 'playwright';

const URL = process.argv[2] ?? 'http://localhost:4321';
const b = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.tap('.silueta', { force: true });
await p.waitForSelector('#intro', { state: 'detached', timeout: 8000 });
await p.waitForFunction(() => document.querySelector('.heroe video')?.classList.contains('reproduciendo'), null, { timeout: 15000 }).catch(() => console.log('(el video del héroe no arrancó)'));
await p.waitForTimeout(1500);
const r = await p.evaluate(
  () =>
    new Promise((listo) => {
      const cuadros = [];
      let previo = performance.now();
      const fin = previo + 6000;
      const medir = (t) => {
        cuadros.push(t - previo);
        previo = t;
        if (t < fin) requestAnimationFrame(medir);
        else {
          const v = document.querySelector('.heroe video');
          const q = v?.getVideoPlaybackQuality?.();
          listo({ cuadros, video: v?.currentSrc.match(/-(\w+)\.mp4/)?.[1], perdidos: q ? `${q.droppedVideoFrames}/${q.totalVideoFrames}` : '?' });
        }
      };
      requestAnimationFrame(medir);
    }),
);
const c = r.cuadros.slice(1).sort((a, z) => a - z);
const prom = c.reduce((a, z) => a + z, 0) / c.length;
console.log(`${b.browserType().name()} ${b.version()} · video ${r.video} (cuadros de video perdidos ${r.perdidos})`);
console.log(`fps ${(1000 / prom).toFixed(1)} · p95 ${c[Math.floor(c.length * 0.95)].toFixed(1)} ms · cuadros > 33 ms: ${c.filter((d) => d > 33.4).length}/${c.length}`);
await b.close();
