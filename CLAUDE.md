# Invitación "Party Familiar con Yoshi"

Astro estático + CSS propio + GSAP, publicado en Cloudflare Pages. Base reutilizada de `ripteban/invitacion-katalina`.
El plan completo está en `PLAN.md` y el inventario de recursos de Figma en `RECURSOS.md`.

## Reglas

- **Fidelidad 1:1 con Figma** (`Jwd5F7ykAxQtFDWMCu96sw`, frames `15:85` Intro y `22:180` Home). Todo valor en px de Figma
  se escribe como `calc(N * var(--k))`: `--k` es `--u` en el Home y `--ui` en la Intro (ver `src/styles/tokens.css`).
- Móvil = Figma 1:1. Tablet y escritorio: tarjeta centrada sobre el video de la piscina (breakpoints en `tokens.css`, como Katalina).
- Videos: 1080p en AV1, HEVC y H.264 con CRF calibrado por VMAF (`npm run calibrar`, luego `npm run recursos`).
- Textos editables solo en `src/data/evento.ts`.
- Animaciones: solo `transform`/`opacity`, con `translate`/`rotate`/`scale` sueltos. GSAP solo para la apertura de la bolsa.
- Los recursos maestros (`src/assets/`) salen de `npm run recursos` (`scripts/preparar-recursos.mjs`), nunca a mano.
  Los originales de Figma viven en `figma-export/originales/` (ignorado en git) y los del usuario en `entrada/`.
- Node local 22.17: Astro queda fijado en `~7.3.5` (7.4 pide Node ≥ 22.23.4).

## Desarrollo

```
npm run dev        # http://localhost:4321
npm run build
npm run recursos   # regenera src/assets
```
