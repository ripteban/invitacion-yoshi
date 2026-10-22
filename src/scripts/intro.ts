// Apertura de la bolsa (plan 3C) con una línea de tiempo de GSAP:
//   0–480 ms   sacudida decreciente + inflado
//   480–560    pausa de tensión
//              (dos chicharrones se asoman por la boca de la bolsa)
//   560        estallido: la tira de arriba sale volando girando, la bolsa rebota y los
//              chicharrones salen volando (chicharrones.ts)
//   700–1100   título, instrucción y rayitas se desvanecen hacia arriba
//   1200       el Home aparece con un fundido de 300 ms ease-out y se elimina la intro,
//              mientras los últimos chicharrones salen de pantalla
// La música empieza con este mismo toque (único momento en que el navegador lo permite).
import { gsap } from 'gsap';
import { asomar, estallar, precargarChicharrones } from './chicharrones';
import { iniciarMusica, mostrarBotonMusica } from './musica';
import { iniciarRevelado } from './revelar';
import { activarVideosHome } from './videos';

const intro = document.getElementById('intro');
const home = document.getElementById('home');
const lienzo = intro?.querySelector<HTMLElement>('.intro__lienzo');
const bolsa = intro?.querySelector<HTMLButtonElement>('.bolsa');
const boton = document.getElementById('boton-abrir') as HTMLButtonElement | null;

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const T_HOME = reducido ? 0 : 1.2; // s, cuando empieza el fundido al Home
const T_DISOLVER = 0.3;
// Línea de la costura de arriba (fracción del alto de la bolsa), con dientes de rasgado
const COSTURA = 7.5;
const DIENTES = [0, 0.9, -0.5, 0.7, -0.8, 0.4, -0.6, 0.8, -0.4, 0.6, 0];

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/** Polígono de la costura rasgada: `arriba` = la tira, si no el cuerpo */
function rasgado(arriba: boolean) {
  const borde = DIENTES.map((d, i) => `${(i * 100) / (DIENTES.length - 1)}% ${COSTURA + d}%`);
  return arriba ? `polygon(0% 0%, 100% 0%, ${borde.reverse().join(', ')})` : `polygon(${borde.join(', ')}, 100% 100%, 0% 100%)`;
}

function mostrarHome() {
  if (!intro || !home) return;
  window.scrollTo(0, 0);
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
  if (!intro || !lienzo || !bolsa || intro.classList.contains('abriendo')) return;
  bolsa.disabled = true;
  if (boton) boton.disabled = true;
  intro.classList.add('abriendo');
  iniciarMusica(); // dentro del gesto: si no, Safari/Chrome bloquean el sonido

  if (reducido) {
    mostrarHome();
    return;
  }

  const k = lienzo.getBoundingClientRect().width / 412;
  const textos = intro.querySelectorAll('.titulo-intro, .instruccion, .rayita');

  // Tira de arriba: copia de la imagen recortada por la costura, encima de la bolsa
  const tira = document.createElement('div');
  tira.className = 'bolsa__tira';
  tira.setAttribute('aria-hidden', 'true');
  tira.style.cssText = bolsa.getAttribute('style') ?? '';
  tira.classList.add('abs');
  // Misma pose que la bolsa en el instante del toque (su flotación quedó congelada)
  const pose = getComputedStyle(bolsa);
  tira.style.translate = pose.translate;
  tira.style.rotate = pose.rotate;
  tira.style.pointerEvents = 'none';
  tira.append(bolsa.querySelector('picture')!.cloneNode(true));
  tira.style.clipPath = rasgado(true);
  tira.style.visibility = 'hidden';
  bolsa.after(tira);

  const tl = gsap.timeline({ defaults: { ease: 'sine.inOut' } });

  tl.to(['.mano', '#boton-abrir'], { opacity: 0, duration: 0.15, ease: 'power1.out' }, 0);

  // Dos chicharrones empujan desde adentro y se asoman por arriba
  const asomados = asomar(bolsa, k);
  tl.to(asomados, { y: `-=${20 * k}`, duration: 0.4, ease: 'power2.out', stagger: 0.06 }, 0.05);

  // Sacudida: 6 ciclos decrecientes + inflado
  const giros = [5, -4.5, 3.8, -3, 2, -1];
  giros.forEach((g, i) => {
    tl.to(bolsa, { rotation: g, x: (g / 5) * 6 * k, duration: 0.08 }, i * 0.08);
  });
  tl.to(bolsa, { scaleY: 1.06, scaleX: 0.97, duration: 0.48, ease: 'power1.out' }, 0);

  // Tensión
  tl.to(bolsa, { rotation: 0, x: 0, scaleX: 1.02, scaleY: 1.08, duration: 0.08, ease: 'power2.out' }, 0.48);

  // Estallido
  tl.add(() => {
    gsap.set(tira, { visibility: 'visible', scaleX: 1.02, scaleY: 1.08, transformOrigin: '50% 50%' });
    bolsa.style.clipPath = rasgado(false);
    asomados.forEach((el) => el.remove());
    estallar(lienzo, k);
  }, 0.56);
  tl.to(tira, { y: -260 * k, x: 40 * k, rotation: 28, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.56);
  tl.to(bolsa, { scaleX: 1.12, scaleY: 1.12, duration: 0.09, ease: 'power2.out' }, 0.56);
  tl.to(bolsa, { scaleX: 0.96, scaleY: 0.96, duration: 0.22, ease: 'power2.inOut' }, 0.65);
  tl.to(bolsa, { scaleX: 1, scaleY: 1, duration: 0.25, ease: 'sine.out' }, 0.87);

  // Los textos se van hacia arriba
  tl.to(textos, { y: -20 * k, opacity: 0, duration: 0.4, ease: 'power1.in', stagger: 0.03 }, 0.7);

  tl.add(mostrarHome, T_HOME);
}

bolsa?.addEventListener('click', abrir);
// Las imágenes de los chicharrones se bajan sin competir con la carga de la intro
if (bolsa && !reducido) {
  const precargar = () => precargarChicharrones(bolsa);
  if (document.readyState === 'complete') precargar();
  else addEventListener('load', precargar, { once: true });
}
boton?.addEventListener('click', abrir);
