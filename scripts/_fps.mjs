import { chromium } from 'playwright';
const css = process.argv[2] ?? '';
const b = await chromium.launch();
const res = [];
for (let r = 0; r < 4; r++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 917 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.goto('http://localhost:4322', { waitUntil: 'networkidle' });
  if (css) await p.evaluate((c) => { window.__sinFiltro = c; }, css);
  await p.waitForTimeout(1500);
  if (css === 'sin-filtro') await p.evaluate(() => { const g = window.gsap; });
  await p.evaluate(() => { window.c = []; let a = performance.now(); const t0 = a; const f = (t) => { window.c.push(t - a); a = t; if (performance.now() < t0 + 1500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await p.tap('.silueta', { force: true });
  await p.waitForTimeout(1800);
  const c = (await p.evaluate(() => window.c)).slice(1);
  res.push([(1000 / (c.reduce((x, y) => x + y, 0) / c.length)).toFixed(0), c.filter((d) => d > 33.4).length + '/' + c.length]);
  await ctx.close();
}
await b.close();
console.log(css || 'actual', JSON.stringify(res));
