// Calibra la calidad de los videos de fondo: para cada video y formato busca (búsqueda binaria) el CRF
// más alto, es decir el archivo más liviano, que todavía da VMAF ≥ OBJETIVO contra el original.
// VMAF (Netflix) mide la calidad percibida: ≥ 92 se considera visualmente sin pérdida. También se anota
// el VMAF con el modelo de teléfono, que es como se ve la invitación.
// Guarda el resultado en scripts/videos.json, que usa preparar-recursos.mjs.
// Uso: node scripts/calibrar-videos.mjs   (VMAF=94 node … para otro objetivo). Tarda varios minutos.
import { mkdtempSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { VIDEOS, CODECS, comunes, ffmpeg } from './videos-config.mjs';

const OBJETIVO = Number(process.env.VMAF ?? 92);
const DESDE = 1; // s: muestra de 4 s, lejos del fundido del bucle
const DURA = 4;
const tmp = mkdtempSync(join(tmpdir(), 'yoshi-calibrar-'));

/** VMAF del archivo codificado contra el mismo tramo del original (libvmaf lo imprime en stderr) */
function vmaf(dist, src, telefono = false) {
  const modelo = telefono ? ":model='version=vmaf_v0.6.1\\:enable_transform=true'" : '';
  const filtro =
    `[0:v]setpts=PTS-STARTPTS,format=yuv420p[d];[1:v]setpts=PTS-STARTPTS,format=yuv420p[r];` +
    `[d][r]libvmaf=n_threads=8${modelo}`;
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', dist, '-ss', String(DESDE), '-t', String(DURA), '-i', src, '-filter_complex', filtro, '-f', 'null', '-'], {
    encoding: 'utf8',
  });
  const m = /VMAF score: ([\d.]+)/.exec(r.stderr ?? '');
  if (!m) throw new Error(`VMAF falló:\n${(r.stderr ?? '').slice(-800)}`);
  return Number(m[1]);
}

/** Codifica la muestra; libaom a veces se cae: se reintenta una vez */
function codificar(src, codec, crf, salida) {
  const args = ['-ss', String(DESDE), '-t', String(DURA), '-i', src, ...CODECS[codec].args(crf), ...comunes(src), salida];
  try {
    ffmpeg(args);
  } catch {
    ffmpeg(args);
  }
}

const resultado = {};
for (const [origen, nombre] of VIDEOS) {
  const src = join('entrada', origen);
  if (!existsSync(src)) continue;
  resultado[nombre] = {};
  for (const codec of Object.keys(CODECS)) {
    let [lo, hi] = CODECS[codec].rango;
    let mejor = null;
    while (lo <= hi) {
      const crf = Math.floor((lo + hi) / 2);
      const salida = join(tmp, `${nombre}-${codec}-${crf}.mp4`);
      codificar(src, codec, crf, salida);
      const puntaje = vmaf(salida, src);
      const kbps = Math.round((statSync(salida).size * 8) / DURA / 1000);
      console.log(`${nombre} ${codec} crf ${crf}: VMAF ${puntaje.toFixed(2)} · ${kbps} kbps`);
      if (puntaje >= OBJETIVO) {
        mejor = { crf, vmaf: +puntaje.toFixed(2), kbps, salida };
        lo = crf + 1;
      } else hi = crf - 1;
    }
    if (!mejor) throw new Error(`${nombre} ${codec}: ningún CRF del rango llega a VMAF ${OBJETIVO}`);
    mejor.telefono = +vmaf(mejor.salida, src, true).toFixed(2);
    delete mejor.salida;
    resultado[nombre][codec] = mejor;
    console.log(`→ ${nombre} ${codec}: crf ${mejor.crf} (VMAF ${mejor.vmaf}, teléfono ${mejor.telefono}, ~${mejor.kbps} kbps)`);
  }
}
rmSync(tmp, { recursive: true, force: true });

writeFileSync('scripts/videos.json', JSON.stringify({ objetivoVmaf: OBJETIVO, muestra: `${DESDE}–${DESDE + DURA} s`, videos: resultado }, null, 2) + '\n');
console.log('scripts/videos.json listo');
