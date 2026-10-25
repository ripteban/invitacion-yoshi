// Revelado al hacer scroll: cada [data-revelar] recibe .revelado una sola vez al entrar en pantalla.
// Las animaciones viven en CSS (animaciones.css y cada componente); aquí solo se observa.
// Se inicia cuando el Home ya está visible, para que nada se revele detrás de la intro.
export function iniciarRevelado() {
  const elementos = document.querySelectorAll<HTMLElement>('.home [data-revelar]');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('revelado'));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('revelado');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  elementos.forEach((el) => observador.observe(el));
}
