// Videos de fondo (VideoFondo.astro): siempre silenciados y en bucle.
// - El fijo (piscina de la intro, Fondo.astro) arranca de inmediato. Al abrir la invitación sigue en
//   tablet y escritorio (se ve a los lados de la tarjeta) y se pausa en móvil, donde la tapa el Home.
// - Los del Home, solo con la invitación abierta y en pantalla.
// - Se pausan fuera de pantalla y con la pestaña oculta, para ahorrar batería.
// - En iPhone con "Ahorro de batería" Safari bloquea el autoplay: se reintenta con el primer toque.
// - Con movimiento reducido no se reproducen: queda la imagen de Figma.
// - Formato: el primero (AV1 → HEVC → H.264) que el equipo decodifica por hardware. Chrome en Android dice que
//   puede reproducir AV1 aunque el teléfono no tenga decodificador (p. ej. Samsung A32) y lo hace con el
//   procesador: el video pierde cuadros y traba las animaciones. Ahí se usa HEVC o H.264.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pantallaAncha = matchMedia('(min-width: 600px)'); // debe coincidir con tokens.css
const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-fondo]')];
const enPantalla = new Set<HTMLVideoElement>();
let homeActivo = false;

// Como en scripts/videos-config.mjs: resolución original a 24 fps
const FORMATO = { width: 1080, height: 1920, framerate: 24, bitrate: 8_000_000 };

/** Quita los <source> anteriores al que conviene, para que el navegador elija ese */
async function elegirFuente(video: HTMLVideoElement) {
  const fuentes = [...video.querySelectorAll('source')];
  if (!('mediaCapabilities' in navigator) || fuentes.length < 2) return;
  const info = await Promise.all(
    fuentes.map((f) =>
      navigator.mediaCapabilities.decodingInfo({ type: 'file', video: { contentType: f.type, ...FORMATO } }).catch(() => null),
    ),
  );
  let elegida = info.findIndex((i) => i?.supported && i.powerEfficient);
  if (elegida < 0) elegida = info.findIndex((i) => i?.supported);
  if (elegida <= 0) return;
  fuentes.slice(0, elegida).forEach((f) => f.remove());
  video.load();
}
const preparados = new Map(videos.map((v) => [v, elegirFuente(v).catch(() => {})]));

function debeSonar(video: HTMLVideoElement) {
  if (reducido || document.hidden || !video.isConnected) return false;
  if (video.dataset.fondo === 'fijo') return !homeActivo || pantallaAncha.matches;
  return homeActivo && enPantalla.has(video);
}

function actualizar(video: HTMLVideoElement) {
  preparados.get(video)?.then(() => {
    if (debeSonar(video)) {
      video.muted = true;
      video.play().catch(() => {});
    } else video.pause();
  });
}

for (const video of videos) {
  video.addEventListener('playing', () => video.classList.add('reproduciendo'), { once: true });
}

const observador = new IntersectionObserver(
  (entradas) => {
    for (const { target, isIntersecting } of entradas) {
      const video = target as HTMLVideoElement;
      if (isIntersecting) enPantalla.add(video);
      else enPantalla.delete(video);
      actualizar(video);
    }
  },
  { rootMargin: '25% 0px' }, // empieza a cargar un poco antes de llegar
);
videos.filter((v) => v.dataset.fondo === 'home').forEach((v) => observador.observe(v));

document.addEventListener('visibilitychange', () => videos.forEach(actualizar));
pantallaAncha.addEventListener('change', () => videos.forEach(actualizar));

for (const evento of ['touchstart', 'pointerdown'] as const) {
  addEventListener(evento, () => videos.forEach(actualizar), { once: true, passive: true });
}

videos.forEach(actualizar);

/** Llamar cuando el Home ya está visible */
export function activarVideosHome() {
  homeActivo = true;
  videos.forEach(actualizar);
}
