// Prepara los recursos maestros en src/assets a partir de:
//   figma-export/originales  (descarga vía MCP de Figma, un archivo por nodo; ver RECURSOS.md)
//   entrada/                 (archivos que entrega el usuario: retrato, chicharrones, videos, música)
// Los maestros son PNG sin pérdida, sin ampliar y sin pasar de 4× el tamaño de diseño (lo máximo que
// pide Img.astro). Astro (astro:assets) genera después los WebP finales en varios anchos.
// Uso: node scripts/preparar-recursos.mjs
import sharp from 'sharp';
import { optimize } from 'svgo';
import { existsSync, statSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const FIGMA = 'figma-export/originales';
const IN = 'entrada';
const OUT = 'src/assets';
const MAX = 4; // densidad máxima del maestro respecto al diseño

async function salida(ruta) {
  await mkdir(dirname(join(OUT, ruta)), { recursive: true });
  return join(OUT, ruta);
}

/** Usa el archivo entregado en entrada/ si existe; si no, el de Figma */
function fuente(entregado, figma) {
  return entregado && existsSync(join(IN, entregado)) ? join(IN, entregado) : join(FIGMA, figma);
}

/**
 * PNG sin pérdida. `ancho` es el ancho de diseño en Figma (px); el maestro no pasa de MAX× ese
 * ancho ni amplía el original. `recorte` (fracciones del original) replica el recorte de Figma.
 */
async function png(src, ruta, ancho, recorte) {
  let img = sharp(src);
  const { width: sw, height: sh } = await img.metadata();
  let w = sw;
  if (recorte) {
    const left = Math.round(recorte.l * sw), top = Math.round(recorte.t * sh);
    w = Math.min(Math.round(recorte.w * sw), sw - left);
    const h = Math.min(Math.round(recorte.h * sh), sh - top);
    img = sharp(await img.extract({ left, top, width: w, height: h }).toBuffer());
  }
  const destino = Math.min(w, Math.round(ancho * MAX));
  if (destino < w) img = img.resize({ width: destino, kernel: 'lanczos3' });
  const info = await img.png({ compressionLevel: 9 }).toFile(await salida(ruta));
  console.log('png', ruta.padEnd(24), `${info.width}×${info.height}`, `(${(info.width / ancho).toFixed(2)}× diseño)`, '←', src);
}

/** Recorta al cuadro donde alfa > 0, sin pérdida y conservando la transparencia */
async function recortarAlfa(src, ruta) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 0) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  await sharp(src).extract({ left: x0, top: y0, width: w, height: h }).png({ compressionLevel: 9 }).toFile(await salida(ruta));
  console.log('alfa', ruta.padEnd(24), `${w}×${h}`, '←', src);
}

async function svg(src, ruta) {
  const { data } = optimize(await readFile(src, 'utf8'), { multipass: true, plugins: ['preset-default'] });
  // Figma agrega preserveAspectRatio="none" y estilos en línea; se quitan. width/height se conservan.
  await writeFile(await salida(ruta), data.replace(/ preserveAspectRatio="none"/, '').replace(/ style="display:block"/, ''));
  console.log('svg', ruta);
}

// ---------- Intro (frame 1) ----------
// Fondo: relleno "cover" centrado en 412 × 917 (se recorta con object-fit en CSS)
await png(fuente('fondo-intro.png', '15-86_fondo-intro.png'), 'intro/fondo.png', 412);
await png(join(FIGMA, '74-274_titulo-intro.png'), 'intro/titulo.png', 283.771);
await png(join(FIGMA, '22-115_bolsa.png'), 'intro/bolsa.png', 330.572);

// ---------- Home (frame 2) ----------
// Portada: relleno "cover" centrado en 415.649 × 926, en (−1.82, −4.06)
await png(fuente('portada.png', '71-149_portada.png'), 'home/portada.png', 415.649);
await png(join(FIGMA, '71-147_titulo-home.png'), 'home/titulo.png', 378.536);
// Retrato: Figma lo muestra al 148.38 % × 148.69 % de su caja (426.874 × 639), desplazado −20.17 % en x.
// Se recorta exactamente la parte visible; funciona igual con el original entregado si tiene el mismo encuadre.
await png(fuente('retrato.png', '66-115_retrato.png'), 'home/retrato.png', 426.874, {
  l: 20.17 / 148.38,
  t: 0,
  w: 100 / 148.38,
  h: 100 / 148.69,
});
await png(join(FIGMA, '74-280_yoshi.png'), 'home/yoshi.png', 82.514);
await png(join(FIGMA, '77-304_banner.png'), 'home/banner.png', 381.685);
// Cierre: relleno "cover" centrado en 412 × 759
await png(fuente('fondo-cierre.png', '72-86_fondo-cierre.png'), 'home/cierre.png', 412);

// ---------- Íconos de Día / Hora / Lugar (105 × 105) ----------
await png(join(FIGMA, '84-375_icono-fecha.png'), 'iconos/fecha.png', 105);
await png(join(FIGMA, '84-382_icono-hora.png'), 'iconos/hora.png', 105);
await png(join(FIGMA, '84-379_icono-lugar.png'), 'iconos/lugar.png', 105);

// ---------- SVG ----------
await svg(join(FIGMA, '22-161_mano.svg'), 'svg/mano.svg');
await svg(join(FIGMA, '22-175_flecha.svg'), 'svg/flecha.svg');
await svg(join(FIGMA, '68-139_resplandor.svg'), 'svg/resplandor.svg');
await svg(join(FIGMA, '74-218_ola.svg'), 'svg/ola.svg');

// ---------- Chicharrones voladores (entrada/chicharrones/chicharron-N.png) ----------
// Se quita el borde transparente sobrante; Astro genera los WebP con alfa (ver Bolsa.astro).
const DIR_CHICHARRONES = join(IN, 'chicharrones');
if (existsSync(DIR_CHICHARRONES)) {
  const piezas = (await readdir(DIR_CHICHARRONES)).filter((f) => /^chicharron-\d+\.png$/.test(f)).sort();
  for (const f of piezas) await recortarAlfa(join(DIR_CHICHARRONES, f), `chicharrones/${f}`);
}

// ---------- Videos de fondo (public/medios, servidos por functions/medios con rangos para iPhone) ----------
// Cada video reemplaza el relleno de Figma de su frame y su primer cuadro es esa misma imagen.
// Bucle sin corte: los últimos 0.75 s se funden con los primeros 0.75 s (el video dura eso menos).
// 720 × 1280, H.264 sin audio, a 2 pasadas para quedar en ~2.8 MB (el agua comprime mal a calidad fija).
const VIDEOS = [
  ['Video de Entrada.mp4', 'fondo-intro.mp4'],
  ['Video Inicial.mp4', 'fondo-portada.mp4'],
  ['Video final.mp4', 'fondo-cierre.mp4'],
];
const FUNDIDO = 0.75;
const PESO = 2.8 * 1024 * 1024 * 8; // bits
const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args]);
await mkdir('public/medios', { recursive: true });
for (const [origen, destino] of VIDEOS) {
  const src = join(IN, origen);
  if (!existsSync(src)) continue;
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).toString());
  const largo = dur - FUNDIDO;
  const kbps = Math.floor(PESO / largo / 1000);
  const filtro =
    `[0:v]split[a][b];` +
    `[a]trim=${FUNDIDO}:${dur},setpts=PTS-STARTPTS,fps=24[cuerpo];` +
    `[b]trim=0:${FUNDIDO},setpts=PTS-STARTPTS,fps=24[cabeza];` +
    `[cuerpo][cabeza]xfade=transition=fade:duration=${FUNDIDO}:offset=${largo - FUNDIDO},` +
    `scale=720:1280:flags=lanczos,format=yuv420p[v]`;
  const log = join(tmpdir(), `yoshi-${destino}`);
  const comun = ['-i', src, '-filter_complex', filtro, '-map', '[v]', '-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-g', '48', '-b:v', `${kbps}k`, '-passlogfile', log];
  ffmpeg([...comun, '-pass', '1', '-f', 'mp4', process.platform === 'win32' ? 'NUL' : '/dev/null']);
  ffmpeg([...comun, '-pass', '2', '-movflags', '+faststart', join('public/medios', destino)]);
  for (const f of await readdir(tmpdir())) if (f.startsWith(`yoshi-${destino}`)) await rm(join(tmpdir(), f));
  console.log('video', `public/medios/${destino}`.padEnd(30), `${(statSync(join('public/medios', destino)).size / 1048576).toFixed(2)} MB`, `${largo.toFixed(2)} s`, '←', src);
}

// La música se agrega aquí cuando llegue a entrada/.
