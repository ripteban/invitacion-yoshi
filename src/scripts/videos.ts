// Videos de fondo (VideoFondo.astro): siempre silenciados y en bucle.
// - El de la intro arranca de inmediato. Los del Home, solo con la invitación abierta y en pantalla.
// - Se pausan fuera de pantalla y con la pestaña oculta, para ahorrar batería.
// - En iPhone con "Ahorro de batería" Safari bloquea el autoplay: se reintenta con el primer toque.
// - Con movimiento reducido no se reproducen: queda la imagen de Figma.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-fondo]')];
const enPantalla = new Set<HTMLVideoElement>();
let homeActivo = false;

function reproducir(video: HTMLVideoElement) {
  if (reducido || document.hidden || !video.isConnected) return;
  if (video.dataset.fondo === 'home' && (!homeActivo || !enPantalla.has(video))) return;
  video.muted = true;
  video.play().catch(() => {});
}

for (const video of videos) {
  video.addEventListener('playing', () => video.classList.add('reproduciendo'), { once: true });
}

const observador = new IntersectionObserver(
  (entradas) => {
    for (const { target, isIntersecting } of entradas) {
      const video = target as HTMLVideoElement;
      if (isIntersecting) {
        enPantalla.add(video);
        reproducir(video);
      } else {
        enPantalla.delete(video);
        video.pause();
      }
    }
  },
  { rootMargin: '25% 0px' }, // empieza a cargar un poco antes de llegar
);
videos.filter((v) => v.dataset.fondo === 'home').forEach((v) => observador.observe(v));

document.addEventListener('visibilitychange', () => {
  for (const video of videos) document.hidden ? video.pause() : reproducir(video);
});

for (const evento of ['touchstart', 'pointerdown'] as const) {
  addEventListener(evento, () => videos.forEach(reproducir), { once: true, passive: true });
}

videos.forEach(reproducir);

/** Llamar cuando el Home ya está visible */
export function activarVideosHome() {
  homeActivo = true;
  videos.forEach(reproducir);
}
