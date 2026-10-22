# invitacion-yoshi

Invitación web "Party Familiar con Yoshi". Hecha con Astro y publicada en Cloudflare Pages.

## Cambiar contenido

Todos los textos (fecha, hora, lugar, frases) están en [`src/data/evento.ts`](src/data/evento.ts).

## Desarrollo

```
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run recursos   # regenera las imágenes de src/assets desde figma-export/ y entrada/
```

Requiere Node 22.

## Cómo está hecho

- `PLAN.md`: el plan por fases.
- `RECURSOS.md`: cada recurso de Figma con su resolución y recorte.
- `src/styles/tokens.css`: colores, sombras, curvas y la escala 1:1 con Figma.
- `functions/medios/`: Cloudflare Pages Function que sirve video y música por partes (necesario en iPhone).
