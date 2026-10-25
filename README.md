# invitacion-yoshi

Invitación web "CumpleMania" de Eduardo (temática WWE). Sitio estático (Astro + CSS + GSAP), réplica 1:1 del
Figma `Jwd5F7ykAxQtFDWMCu96sw` (página "Invitación WWE 2"), publicado en Cloudflare Pages.

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
| Imágenes, chicharrones, videos o música | Dejar el archivo en `entrada/` y correr `npm run recursos` (ver `scripts/preparar-recursos.mjs`). Si cambia un video, antes `npm run calibrar` (tarda varios minutos) |
| Imagen de vista previa de WhatsApp | `public/og-image.jpg` (1200 × 630): el "Frame 17" (287:719) de Figma exportado a 4×. `npm run og` genera otra a partir del héroe |
| URL pública (la usa la vista previa de WhatsApp) | `site` en `astro.config.mjs` |

## Cómo está hecho

- **Escala 1:1 con Figma**: todo valor de diseño se multiplica por `--u` (Home, ancho completo) o `--ui` (intro, que
  además cabe en alto). Ver `src/styles/tokens.css`. Cada elemento usa sus coordenadas de Figma (`.abs` con
  `--x --y --w --h`); el DOM va en orden de lectura y el orden de capas de Figma lo da `--z`.
- **Intro** (`Intro.astro`, `src/scripts/intro.ts`): placa "SE ARMO LA PELEA!" y la silueta del campeón (modo
  multiplicar sobre el estadio). Al tocarla (o el botón) tiembla, se ilumina, se desvanece y salen volando las W
  (`chicharrones.ts`, GSAP Physics2DPlugin). Luego el Home aparece con un fundido de 300 ms.
- **Home**: héroe con estadio, filtros de mezcla, haces de luz, avatar, "CumpleMania" y la placa "Eduardo"
  (`Heroe.astro`); mensaje, placas de Fecha / Lugar / Hora y cierre con el cinturón. Entradas con resorte y revelado
  al hacer scroll (`revelar.ts`).
- **Fondos con ajustes de Figma**: los estadios usan el render de Figma del nodo, porque los ajustes de imagen
  (exposición, contraste…) no vienen en el código.
- **SF Pro**: la usa Figma en los datos y el cierre; su licencia no permite servirla, así que se usa la fuente del
  sistema (idéntica en iPhone, iPad y Mac; Roboto o Segoe UI en Android y Windows).
- **Tamaños de pantalla** (`--ancho` en `tokens.css`, igual que Katalina; si se cambian, actualizar `sizes` en
  `Img.astro`):
  - Móvil (< 600 px): la invitación ocupa todo el ancho, igual que en Figma.
  - Tablet vertical: tarjeta centrada de hasta 640 px.
  - Tablet horizontal y escritorio: tarjeta de 440–540 px con esquinas redondeadas y sombra sobre el estadio
    desenfocado (`Fondo.astro`). Con mouse, la silueta se acerca y el botón se eleva al pasar el cursor.
- **Videos de fondo**: este diseño no los usa. El flujo sigue listo (`VideoFondo.astro`, `videos.ts`,
  `scripts/videos-config.mjs`): 1080p en AV1, HEVC y H.264 con la calidad calibrada por VMAF (`npm run calibrar`).
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
node scripts/qa-heroe-fps.mjs http://localhost:4322   # fluidez del héroe en un Android de gama media
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
5. Si la URL final no es `https://fiesta-eduardo.pages.dev`, actualizar `site` en `astro.config.mjs` y
   publicar de nuevo (la vista previa de WhatsApp usa esa URL).

Cada push a `main` vuelve a publicar.

Para probar en local igual que en Pages (con la Function de `/medios`): `npm run build && npm run pages:dev`
→ http://localhost:8788

## Carpetas de trabajo (no se publican)

- `entrada/`: archivos entregados (chicharrones, videos, retrato). Ignorada en git.
- `figma-export/`: descarga de Figma vía MCP. Ignorada en git.
- `qa/referencia/`: renders de Figma para comparar. `qa/capturas/`: salidas de QA (ignorada).
