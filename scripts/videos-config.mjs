// Configuración compartida de los videos de fondo (preparar-recursos.mjs y calibrar-videos.mjs).
// Cada video se publica a su resolución original (1080 × 1920) en tres formatos; el navegador usa el
// primero que puede reproducir (orden de <source> en VideoFondo.astro):
//   AV1  → Chrome, Edge, Firefox, Android y iPhone 15 Pro o posterior (el más liviano)
//   HEVC → Safari en iPhone, iPad y Mac
//   H.264 → cualquier otro navegador
// La calidad de cada formato (CRF) sale de scripts/videos.json, que genera calibrar-videos.mjs.
import { execFileSync } from 'node:child_process';

// [archivo entregado en entrada/, nombre publicado en public/medios/]
export const VIDEOS = [
  ['Video de Entrada.mp4', 'fondo-intro'],
  ['Video Inicial.mp4', 'fondo-portada'],
  ['Video final.mp4', 'fondo-cierre'],
];

// Bucle sin corte: los últimos FUNDIDO segundos se funden con los primeros
export const FUNDIDO = 0.75;

// Tipos para <source type>: perfil y nivel 4.0 (1080p a 24 fps)
export const CODECS = {
  av1: {
    tipo: 'video/mp4; codecs="av01.0.08M.08"',
    args: (crf) => ['-c:v', 'libaom-av1', '-cpu-used', '4', '-row-mt', '1', '-b:v', '0', '-crf', String(crf)],
    rango: [20, 46],
  },
  hevc: {
    tipo: 'video/mp4; codecs="hvc1.1.6.L120.90"',
    args: (crf) => ['-c:v', 'libx265', '-preset', 'slow', '-tag:v', 'hvc1', '-x265-params', 'log-level=error:keyint=48:min-keyint=48', '-crf', String(crf)],
    rango: [16, 34],
  },
  h264: {
    tipo: 'video/mp4; codecs="avc1.640028"',
    args: (crf) => ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level', '4.0', '-crf', String(crf)],
    rango: [14, 32],
  },
};

/** Opciones comunes: sin audio, 4:2:0, un cuadro clave cada 2 s y las mismas etiquetas de color del original */
export function comunes(src) {
  // Por nombre: ffprobe no respeta el orden pedido en -show_entries
  const etiquetas = JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=color_space,color_primaries,color_transfer', '-of', 'json', src]).toString(),
  ).streams[0];
  const { color_space: espacio, color_primaries: primarios, color_transfer: transferencia } = etiquetas;
  const color = [];
  if (espacio && espacio !== 'unknown') color.push('-colorspace', espacio);
  if (primarios && primarios !== 'unknown') color.push('-color_primaries', primarios);
  if (transferencia && transferencia !== 'unknown') color.push('-color_trc', transferencia);
  return ['-an', '-pix_fmt', 'yuv420p', '-g', '48', ...color, '-movflags', '+faststart'];
}

export const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-v', 'error', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });

export const duracion = (src) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).toString());
