# invitacion-yoshi

Invitación web "Party Familiar con Yoshi". Sitio estático (Astro + CSS + GSAP) para móvil, réplica 1:1 del
Figma `Jwd5F7ykAxQtFDWMCu96sw`, publicado en Cloudflare Pages.

## Uso diario

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/ (lo que se publica)
```

Requiere Node 22.

## Cambiar contenido

| Qué | Dónde |
|---|---|
| Textos: fecha, hora, lugar, frases, título y descripción de WhatsApp | [`src/data/evento.ts`](src/data/evento.ts) |
| Imágenes, chicharrones, videos o música | Dejar el archivo en `entrada/` y correr `npm run recursos` (ver `scripts/preparar-recursos.mjs`) |
| Imagen de vista previa de WhatsApp | `npm run og` → `public/og-image.jpg` |
| URL pública (la usa la vista previa de WhatsApp) | `site` en `astro.config.mjs` |

## Cómo está hecho

- **Escala 1:1 con Figma**: todo valor de diseño se multiplica por `--u` (Home, ancho completo) o `--ui` (intro, que
  además cabe en alto). Ver `src/styles/tokens.css`. Cada elemento usa sus coordenadas de Figma (`.abs` con
  `--x --y --w --h`); el DOM va en orden de lectura y el orden de capas de Figma lo da `--z`.
- **Intro** (`Intro.astro`, `src/scripts/intro.ts`): la bolsa flota y la mano la presiona; al tocarla (o el botón)
  tiembla, se infla, se rasga la tira de arriba y salen volando los chicharrones (`chicharrones.ts`, GSAP
  Physics2DPlugin). Luego el Home aparece con un fundido de 300 ms.
- **Home**: entradas con resorte (título, Yoshi, sombra) y revelado al hacer scroll (`revelar.ts`).
- **Videos de fondo** (`VideoFondo.astro`, `videos.ts`): reemplazan los fondos de Figma en su misma caja; aparecen
  con un fundido cuando de verdad se reproducen y se pausan fuera de pantalla.
- **Música** (`Musica.astro`, `musica.ts`): lista para cuando exista `public/medios/musica.m4a`.
- **Carga**: la intro baja solo lo suyo (~660 KB sin video); el Home y los chicharrones se precargan en segundo
  plano después del evento `load` (`content-visibility` en `.home` hasta entonces).
- **Medios** (`public/medios/`): se sirven con `functions/medios/[archivo].js` (Cloudflare Pages Function) porque
  Safari en iPhone exige respuestas por partes (206).
- **Movimiento reducido**: sin sacudida, chicharrones, bucles ni videos; solo fundidos.
- **Sin JavaScript**: el Home se ve completo directamente.
- **Privacidad**: `noindex` en meta, `X-Robots-Tag` en `public/_headers` y `robots.txt` con `Disallow: /`.

## QA

Con el sitio compilado y servido (`npm run build && npx astro preview --port 4322`):

```bash
node scripts/qa-capturas.mjs http://localhost:4322     # comparación con Figma a 412 px @2×
node scripts/qa-tamanos.mjs http://localhost:4322      # 13 tamaños de móvil
node scripts/qa-animaciones.mjs http://localhost:4322  # fluidez con CPU 4× más lenta, videos, CLS y demo
node scripts/qa-peso.mjs http://localhost:4322         # presupuesto de peso
```

## Publicar en Cloudflare Pages

1. Cloudflare → **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
2. Elegir el repositorio `ripteban/invitacion-yoshi`, rama `main`.
3. Configuración de build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Variable de entorno: `NODE_VERSION` = `22`
4. **Save and Deploy**. La carpeta `functions/` se detecta sola.
5. Si la URL final no es `https://invitacion-yoshi.pages.dev`, actualizar `site` en `astro.config.mjs` y
   publicar de nuevo (la vista previa de WhatsApp usa esa URL).

Cada push a `main` vuelve a publicar.

Para probar en local igual que en Pages (con la Function de `/medios`): `npm run build && npm run pages:dev`
→ http://localhost:8788

## Carpetas de trabajo (no se publican)

- `entrada/`: archivos entregados (chicharrones, videos, retrato). Ignorada en git.
- `figma-export/`: descarga de Figma vía MCP. Ignorada en git.
- `qa/referencia/`: renders de Figma para comparar. `qa/capturas/`: salidas de QA (ignorada).
