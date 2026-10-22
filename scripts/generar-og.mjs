// Genera public/og-image.jpg (1200 × 630, vista previa de WhatsApp) con los recursos de la portada:
// piscina de fondo, la sombra difusa, el título "Party Familiar con Yoshi" y Yoshi, como en Figma.
// Uso: node scripts/generar-og.mjs   (lee src/assets; no necesita servidor)
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const W = 1200, H = 630;
// Escala de diseño → px de la imagen: el título de Figma (378.536 u) ocupa 700 px de ancho
const S = 700 / 378.536;

// Fondo: la piscina a lo ancho, encuadrada en la franja del título (en Figma, y ≈ 100–420 de 926)
const piscina = sharp('src/assets/home/portada.png');
const { width: pw, height: ph } = await piscina.metadata();
const altoEscalado = Math.round((ph * W) / pw);
const desde = Math.round(altoEscalado * 0.06);
const fondo = await piscina.resize(W, altoEscalado).extract({ left: 0, top: desde, width: W, height: H }).toBuffer();

// Título centrado y su sombra difusa detrás (68:139, −8°), con la misma relación que en Figma
const tituloAncho = Math.round(378.536 * S);
const titulo = await sharp('src/assets/home/titulo.png').resize(tituloAncho).toBuffer();
const tituloAlto = (await sharp(titulo).metadata()).height;
const tituloX = Math.round((W - tituloAncho) / 2);
const tituloY = Math.round((H - tituloAlto) / 2) - 30;

const svg = (await readFile('src/assets/svg/resplandor.svg', 'utf8')).replace(/width="[\d.]+" height="[\d.]+"/, `width="${Math.round(455.65 * S)}" height="${Math.round(216.602 * S)}"`);
const resplandor = await sharp(Buffer.from(svg)).rotate(-8, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const rm = await sharp(resplandor).metadata();
// En Figma el centro de la sombra está 11.52 u a la derecha y 84.85 u debajo del borde superior del título
const rx = Math.round(W / 2 + 11.52 * S - rm.width / 2);
const ry = Math.round(tituloY + 84.854 * S - rm.height / 2);

// Yoshi a la izquierda del título, con su sombra (−1, 4, desenfoque 7.9 al 62 %)
const yoshiAlto = Math.round(120.103 * S * 1.15);
const yoshi = await sharp('src/assets/home/yoshi.png').resize({ height: yoshiAlto }).toBuffer();
const ym = await sharp(yoshi).metadata();
const sombraYoshi = await sharp(yoshi)
  .ensureAlpha()
  .linear([0, 0, 0, 0.62], [0, 0, 0, 0])
  .blur(7.9 * S * 0.5)
  .toBuffer();
const yx = 70, yy = H - ym.height - 40;

await sharp(fondo)
  .composite([
    { input: resplandor, left: rx, top: ry },
    { input: titulo, left: tituloX, top: tituloY },
    { input: sombraYoshi, left: Math.round(yx - 1 * S), top: Math.round(yy + 4 * S) },
    { input: yoshi, left: yx, top: yy },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('public/og-image.jpg listo');
