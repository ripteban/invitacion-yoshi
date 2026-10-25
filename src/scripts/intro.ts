// Apertura: revelar al campeón, con una línea de tiempo de GSAP:
//   0–480 ms   la silueta tiembla cada vez menos y se tensa
//   480–560    pausa de tensión
//   560        estallido: la silueta se ilumina y se desvanece (en modo multiplicar, al aclararse deja ver el
//              estadio) y las W salen volando (chicharrones.ts)
//   700–1100   título e instrucción se desvanecen hacia arriba
//   1200       el Home aparece con un fundido de 300 ms ease-out y se elimina la intro,
//              mientras las últimas W salen de pantalla
// La música empieza con este mismo toque (único momento en que el navegador lo permite).
import { gsap } from 'gsap';
import { estallar, precargarChicharrones } from './chicharrones';
import { iniciarMusica, mostrarBotonMusica } from './musica';
import { iniciarRevelado } from './revelar';
import { activarVideosHome } from './videos';

const intro = document.getElementById('intro');
const home = document.getElementById('home');
const lienzo = intro?.querySelector<HTMLElement>('.intro__lienzo');
const silueta = intro?.querySelector<HTMLButtonElement>('.silueta');
const boton = document.getElementById('boton-abrir') as HTMLButtonElement | null;

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const T_HOME = reducido ? 0 : 1.2; // s, cuando empieza el fundido al Home
const T_DISOLVER = 0.3;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/** El Home empieza a renderizarse (y a bajar sus imágenes) cuando la intro ya cargó */
function cargarHome() {
  home?.classList.add('cargado');
}

function mostrarHome() {
  if (!intro || !home) return;
  window.scrollTo(0, 0);
  cargarHome();
  home.classList.add('visible');
  home.removeAttribute('inert');
  activarVideosHome();
  gsap.to(intro, {
    opacity: 0,
    duration: T_DISOLVER,
    ease: 'power1.out',
    onComplete: () => {
      intro.remove();
      document.body.classList.remove('bloqueado');
      home.focus({ preventScroll: true });
      mostrarBotonMusica();
      iniciarRevelado();
    },
  });
}

function abrir() {
  if (!intro || !lienzo || !silueta || intro.classList.contains('abriendo')) return;
  silueta.disabled = true;
  if (boton) boton.disabled = true;
  intro.classList.add('abriendo');
  iniciarMusica(); // dentro del gesto: si no, Safari/Chrome bloquean el sonido

  if (reducido) {
    mostrarHome();
    return;
  }

  const k = lienzo.getBoundingClientRect().width / 412;
  const textos = intro.querySelectorAll('.titulo-intro, .instruccion');

  const tl = gsap.timeline({ defaults: { ease: 'sine.inOut' } });

  tl.to(['.mano', '#boton-abrir'], { opacity: 0, duration: 0.15, ease: 'power1.out' }, 0);

  // Sacudida: 6 ciclos decrecientes + se tensa
  const giros = [4, -3.6, 3, -2.4, 1.6, -0.8];
  giros.forEach((g, i) => {
    tl.to(silueta, { rotation: g, x: (g / 4) * 6 * k, duration: 0.08 }, i * 0.08);
  });
  tl.to(silueta, { scale: 1.04, duration: 0.48, ease: 'power1.out' }, 0);
  tl.to(silueta, { rotation: 0, x: 0, scale: 1.07, duration: 0.08, ease: 'power2.out' }, 0.48);

  // Estallido: la silueta se ilumina y se desvanece; salen las W
  tl.add(() => estallar(lienzo, k), 0.56);
  tl.to(silueta, { scale: 1.16, filter: 'brightness(4)', duration: 0.18, ease: 'power2.out' }, 0.56);
  tl.to(silueta, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.62);

  // Los textos se van hacia arriba
  tl.to(textos, { y: -20 * k, opacity: 0, duration: 0.4, ease: 'power1.in', stagger: 0.03 }, 0.7);

  tl.add(mostrarHome, T_HOME);
}

silueta?.addEventListener('click', abrir);
boton?.addEventListener('click', abrir);
// Las W y el Home se bajan después, sin competir con la carga de la intro
function despuesDeCargar() {
  if (silueta && !reducido) precargarChicharrones(silueta);
  cargarHome();
}
if (document.readyState === 'complete') despuesDeCargar();
else addEventListener('load', despuesDeCargar, { once: true });
