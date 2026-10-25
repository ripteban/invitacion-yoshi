// Piezas voladoras de la apertura (hoy la W; antes chicharrones, de ahí los nombres):
// estallar() las lanza desde el pecho de la silueta en abanico (±65° de la vertical) con velocidad inicial y
// gravedad (Physics2DPlugin), giro propio y escala de 0.6 a 1.3, como si vinieran hacia la cámara.
// Las de adelante van en una capa fija sobre todo (siguen cruzando mientras aparece el Home); las de atrás,
// dentro de la intro, más chicas y desenfocadas. Todas salen de pantalla.
// Solo se usan las imágenes ya decodificadas: si la red es lenta, el estallido no espera.
import { gsap } from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

gsap.registerPlugin(Physics2DPlugin);

type Pieza = { src: string; proporcion: number };

const CANTIDAD_DELANTE = 12;
const CANTIDAD_DETRAS = 7;
const DURACION = 1.8; // s: con esta gravedad todas salen de pantalla antes
const GRAVEDAD = 1600; // u/s²
// Origen: pecho de la silueta (257:492, caja de 22.88 a 389.12 × 226.13 a 754.77) en coordenadas del frame
const BOCA = { x: 206, y: 420, ancho: 220 };

const azar = (a: number, b: number) => a + Math.random() * (b - a);

let piezas: Pieza[] = [];
const listas = new Map<number, HTMLImageElement>();

/** Descarga y decodifica las imágenes con baja prioridad (llamar al cargar la página) */
export function precargarChicharrones(origen: HTMLElement) {
  try {
    piezas = JSON.parse(origen.dataset.chicharrones ?? '[]');
  } catch {
    piezas = [];
  }
  piezas.forEach((p, i) => {
    const img = new Image();
    img.decoding = 'async';
    img.setAttribute('fetchpriority', 'low');
    img.alt = '';
    img.src = p.src;
    img
      .decode()
      .then(() => listas.set(i, img))
      .catch(() => {});
  });
}

function pieza(i: number, anchoPx: number) {
  const base = listas.get(i);
  if (!base) return null;
  const img = base.cloneNode() as HTMLImageElement;
  img.className = 'chicharron';
  img.setAttribute('aria-hidden', 'true');
  img.style.cssText = `position:absolute;left:0;top:0;width:${anchoPx}px;height:${anchoPx * piezas[i].proporcion}px;will-change:transform;pointer-events:none;`;
  return img;
}

const disponibles = () => [...listas.keys()];

/** Lanza el estallido. `lienzo` es el frame de la intro (para convertir u → px) */
export function estallar(lienzo: HTMLElement, k: number) {
  const ids = disponibles();
  if (!ids.length) return;
  const caja = lienzo.getBoundingClientRect();

  const detras = document.createElement('div');
  detras.className = 'chicharrones chicharrones--detras';
  lienzo.prepend(detras);

  const delante = document.createElement('div');
  delante.className = 'chicharrones chicharrones--delante';
  document.body.append(delante);

  let pendientes = 0;
  const terminar = (el: HTMLElement) => {
    el.remove();
    if (--pendientes === 0) delante.remove();
  };

  const lanzar = (n: number, capa: HTMLElement, enPantalla: boolean) => {
    const adelante = capa === delante;
    const ancho = (adelante ? azar(90, 140) : azar(60, 90)) * k;
    const el = pieza(ids[n % ids.length], ancho);
    if (!el) return;
    // Salida a lo ancho de la boca; las de adelante, en px de pantalla
    const x0 = (BOCA.x + azar(-BOCA.ancho / 2, BOCA.ancho / 2)) * k - ancho / 2 + (enPantalla ? caja.left : 0);
    const y0 = BOCA.y * k - ancho / 2 + (enPantalla ? caja.top : 0);
    const espejo = Math.random() < 0.5 ? -1 : 1;
    const s0 = adelante ? 0.6 : 0.5;
    gsap.set(el, { x: x0, y: y0, rotation: azar(-180, 180), scaleX: s0 * espejo, scaleY: s0 });
    capa.append(el);
    pendientes++;

    const retraso = azar(0, 0.16);
    const s1 = adelante ? 1.3 : 0.8;
    gsap.to(el, {
      delay: retraso,
      duration: DURACION,
      ease: 'none',
      physics2D: {
        velocity: (adelante ? azar(950, 1400) : azar(700, 1050)) * k,
        angle: -90 + azar(-65, 65),
        gravity: GRAVEDAD * k,
      },
      rotation: `+=${azar(-540, 540)}`,
      onComplete: () => terminar(el),
    });
    gsap.to(el, { delay: retraso, duration: DURACION * 0.6, ease: 'power1.out', scaleX: s1 * espejo, scaleY: s1 });
  };

  for (let n = 0; n < CANTIDAD_DETRAS; n++) lanzar(n, detras, false);
  for (let n = 0; n < CANTIDAD_DELANTE; n++) lanzar(n + CANTIDAD_DETRAS, delante, true);
  if (pendientes === 0) delante.remove();
}
