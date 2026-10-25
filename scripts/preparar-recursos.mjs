// Prepara los recursos maestros en src/assets a partir de:
//   figma-export/originales  (descarga vía MCP de Figma, un archivo por nodo; ver RECURSOS.md)
//   entrada/                 (archivos que entrega el usuario: retrato, chicharrones, videos, música)
// Los maestros son PNG sin pérdida, sin ampliar y sin pasar de 4× el tamaño de diseño (lo máximo que
// pide Img.astro). Astro (astro:assets) genera después los WebP finales en varios anchos.
// Uso: node scripts/preparar-recursos.mjs
import sharp from 'sharp';
import { optimize } from 'svgo';
import { existsSync, statSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
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

// ---------- Diseño "CumpleMania" (página "Invitación WWE 2" de Figma; descargas en figma-export/wwe) ----------
const WWE = 'figma-export/wwe';

// Intro (frame "Inicio" 257:282)
// Fondo del estadio (257:283): render de Figma a 3×, que ya trae los ajustes del relleno (la imagen queda al
// ~34 % sobre negro; el original es figma-export/wwe/i-fondo-raw1.png)
await png(join(WWE, 'raw/i-fondo@3x.png'), 'intro/estadio.png', 412);
// Silueta del campeón (257:490): relleno oscuro de 424 × 612 (1.16× su caja de 366 × 529; es una silueta difusa)
await png(join(WWE, 'i-silueta.png'), 'intro/silueta.png', 366.243);

// Héroe de la invitación (frame "Invitacion" 235:9 → "Hero" 235:22)
// Estadio ("Video" 235:24): render de Figma a 3× de la parte visible (412 × 922), con los ajustes del relleno
// (exposición, contraste…) que el código de Figma no trae
await png(join(WWE, 'raw/h-estadio@3x.png'), 'heroe/estadio.png', 412);
// Avatar: color de la exportación a 4× y transparencia de la de 2× (que trae la caja exacta del nodo),
// alineadas en figma-export/wwe/raw/*-final@4x.png
await png(join(WWE, 'raw/avatar-cuerpo-final@4x.png'), 'heroe/avatar-cuerpo.png', 402.846);
await png(join(WWE, 'raw/avatar-cabeza-final@4x.png'), 'heroe/avatar-cabeza.png', 408.271);
// Título "CumpleMania" (235:41): Figma muestra la imagen al 190.71 % de alto, desplazada −56.1 %
await png(join(WWE, 'h-titulo-cumplemania.png'), 'heroe/titulo.png', 399.553, { l: 0, t: 56.1 / 190.71, w: 1, h: 100 / 190.71 });
// Placa "Eduardo" (235:130): "contain" con la misma proporción que su caja (402 × 134)
await png(join(WWE, 'h-titulo-eduardo.png'), 'heroe/eduardo.png', 402);
// Gradas al pie del héroe (235:128): la imagen al 174.07 % de alto desde arriba
await png(join(WWE, 'h-image4.png'), 'heroe/gradas.png', 412, { l: 0, t: 0, w: 1, h: 100 / 174.07 });

// Fondo inferior (252:36): la misma imagen repetida y espejada; se recorta en CSS como Figma
await png(join(WWE, 'h-image3.png'), 'fondo/gradas.png', 412);
// Cinturón del cierre (257:278): la imagen al 380.15 % de alto, desplazada −138.81 % (original de 736 px)
await png(join(WWE, 'raw/cinturon-r2.png'), 'cierre/cinturon.png', 412, { l: 0, t: 138.81 / 380.15, w: 1, h: 100 / 380.15 });

// SVG
const SVGS = {
  'i-mano.svg': 'mano.svg',
  'i-flecha.svg': 'flecha-arriba.svg',
  'h-flecha.svg': 'flecha-placa.svg',
  'i-placa-bisel.svg': 'placa-bisel.svg',
  'i-placa-canal.svg': 'placa-canal.svg',
  'i-placa-filete.svg': 'placa-filete.svg',
  'i-placa-cara.svg': 'placa-cara.svg',
  'h-dato-canal.svg': 'dato-canal.svg',
  'h-dato-filo.svg': 'dato-filo.svg',
  'h-dato-cara.svg': 'dato-cara.svg',
  'h-icono-fecha.svg': 'icono-fecha.svg',
  'h-icono-lugar.svg': 'icono-lugar.svg',
  'h-icono-hora.svg': 'icono-hora.svg',
  'h-separador.svg': 'separador.svg',
  'h-resplandor.svg': 'resplandor.svg',
  'h-haz-izq.svg': 'haz-izq.svg',
  'h-haz-der.svg': 'haz-der.svg',
  'h-sombra-avatar.svg': 'sombra-avatar.svg',
  'h-sombra-titulo.svg': 'sombra-titulo.svg',
  'h-sombra-eduardo.svg': 'sombra-eduardo.svg',
  'h-decorativo.svg': 'particulas.svg',
  'h-decorativo-logo.svg': 'logo-wwe.svg',
};
for (const [origen, destino] of Object.entries(SVGS)) await svg(join(WWE, origen), `svg/${destino}`);

// ---------- Chicharrones voladores (entrada/chicharrones/chicharron-N.png) ----------
// Se quita el borde transparente sobrante; Astro genera los WebP con alfa (ver Bolsa.astro).
const DIR_CHICHARRONES = join(IN, 'chicharrones');
if (existsSync(DIR_CHICHARRONES)) {
  const piezas = (await readdir(DIR_CHICHARRONES)).filter((f) => /^chicharron-\d+\.png$/.test(f)).sort();
  for (const f of piezas) await recortarAlfa(join(DIR_CHICHARRONES, f), `chicharrones/${f}`);
}

// ---------- Videos de fondo (public/medios, servidos por functions/medios con rangos para iPhone) ----------
// Cada video reemplaza el relleno de Figma de su frame. Se publica a su resolución original (1080 × 1920)
// en AV1, HEVC y H.264 (ver scripts/videos-config.mjs), cada uno con el CRF calibrado en scripts/videos.json
// (el más liviano con VMAF ≥ 92 contra el original: visualmente sin pérdida; ver calibrar-videos.mjs).
// Bucle sin corte: los últimos FUNDIDO segundos se funden con los primeros (el video dura eso menos).
// Si un archivo ya está más nuevo que su original y que videos.json, no se vuelve a codificar (AV1 tarda).
import { CODECS, FUNDIDO, comunes, ffmpeg, duracion } from './videos-config.mjs';
// El diseño CumpleMania no usa videos de fondo; para volver a usarlos, importar VIDEOS de videos-config.mjs
const VIDEOS = [];
const calibracion = JSON.parse(await readFile('scripts/videos.json', 'utf8'));
await mkdir('public/medios', { recursive: true });
for (const [origen, nombre] of VIDEOS) {
  const src = join(IN, origen);
  if (!existsSync(src)) continue;
  const dur = duracion(src);
  const largo = dur - FUNDIDO;
  const filtro =
    `[0:v]split[a][b];` +
    `[a]trim=${FUNDIDO}:${dur},setpts=PTS-STARTPTS,fps=24[cuerpo];` +
    `[b]trim=0:${FUNDIDO},setpts=PTS-STARTPTS,fps=24[cabeza];` +
    `[cuerpo][cabeza]xfade=transition=fade:duration=${FUNDIDO}:offset=${largo - FUNDIDO},format=yuv420p[v]`;
  for (const codec of Object.keys(CODECS)) {
    const { crf } = calibracion.videos[nombre][codec];
    const destino = join('public/medios', `${nombre}-${codec}.mp4`);
    const vigente =
      existsSync(destino) && statSync(destino).mtimeMs > Math.max(statSync(src).mtimeMs, statSync('scripts/videos.json').mtimeMs);
    if (!vigente) ffmpeg(['-i', src, '-filter_complex', filtro, '-map', '[v]', ...CODECS[codec].args(crf), ...comunes(src), destino]);
    console.log('video', destino.padEnd(36), `crf ${crf}`.padEnd(7), `${(statSync(destino).size / 1048576).toFixed(2)} MB`, `${largo.toFixed(2)} s`, vigente ? '(sin cambios)' : '←', vigente ? '' : src);
  }
}

// La música se agrega aquí cuando llegue a entrada/.
