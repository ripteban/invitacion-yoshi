# Plan · Invitación "Party Familiar con Yoshi"

Figma: `Jwd5F7ykAxQtFDWMCu96sw` · página `0:1` "Invitación editable"
**Repo del proyecto: https://github.com/ripteban/invitacion-yoshi** (rama `main`, hoy solo tiene `README.md`)
Base reutilizable: repo `ripteban/invitacion-katalina` (Astro 7 + CSS + GSAP + Cloudflare Pages)

**Prioridad: móvil completo primero.** Todo sale de Figma vía MCP (modo Dev) con fidelidad 1:1: fuentes, colores, bordes, sombras, rotaciones y posiciones. Tablet y escritorio quedan para una fase aparte, al final.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Stack | Astro (estático) + CSS propio + GSAP, publicado en Cloudflare Pages. Igual que Katalina. Sin Tailwind ni React. |
| Repositorio | `ripteban/invitacion-yoshi` en GitHub, conectado a Cloudflare Pages. |
| Apertura de la bolsa | **Sacudida + estallido con chicharrones**: la bolsa tiembla, se infla y se rasga arriba, **los chicharrones (PNG que entrega el usuario) salen volando** de la bolsa y el Home aparece con un fundido de 300 ms. |
| Videos | **Los pone el usuario** y se integran como el video de seda de Katalina, con la Function de rangos para iPhone. |
| Música | **Sí.** Empieza al tocar la bolsa y tiene botón flotante para silenciar. |
| Mapas | **No.** Todo 100% como Figma, sin botones extra. |

---

## 1. Lo que hay en el Figma (extraído vía MCP)

### 1.1 Frames

| Frame | Nodo | Tamaño | Fondo | Rol |
|---|---|---|---|---|
| `1` | `15:85` | 412 × 917 | `#93E6F8` | **Intro**: bolsa por abrir |
| `2` | `22:180` | 412 × 2014 | `#CDF7FD` | **Home**: invitación con scroll |

### 1.2 Tipografías

| Uso | Familia | Peso / estilo | Tamaño | Interlineado | Tracking | Paquete |
|---|---|---|---|---|---|---|
| "Pero primero… abre los churros." | Lilita One | 400 | 28.84 | 27.398 | 0 | `@fontsource/lilita-one` |
| "Toca el churro para abrirlo" | Montserrat | 900 Black Italic | 20.6 | 21.63 | 0 | `@fontsource/montserrat` (latin-900-italic) |
| "Nos vemos aquí" (estilo *Display 47.38 · 3*) | Lilita One | 400 | 47.38 | 47.38 | −1.1845 | ↑ |
| FECHA / HORA / LUGAR | Lilita One | 400 | 26.51 | 29.161 | 0 | ↑ |
| Valores ("20 de Noviembre"…) | Barlow Condensed | 600 SemiBold | 25.367 | 27.396 | 0 | `@fontsource/barlow-condensed` |
| "¡Que no falten las risas!" | Lilita One | 400 | 61.902 | 61.283 | −1.5476 | ↑ |
| "Nos vemos en la fiesta." | Lilita One | 400 | 27.68 | 29.064 | 0 | ↑ |

Se cargan solo los subconjuntos `latin` (con ¡ ñ á é í ó ú), y se precargan Lilita One y Montserrat 900 italic porque aparecen en la intro.

### 1.3 Colores y efectos (tokens)

```css
--fondo-intro: #93E6F8;
--fondo-home:  #CDF7FD;
--navy:        #062652;   /* variable Figma --color-navy */
--blanco:      #FFFFFF;   /* --color-white */
--sol:         #FFE52C;   /* --color-sunshine (rayitas amarillas) */

/* Botón "Toca el churro" */
--boton-degradado: linear-gradient(to bottom, #FFF349, #FFE329);
--boton-borde:     0.936px solid #FFF5AA;
--boton-sombra:    drop-shadow(0 3.745px 5.618px rgba(11,136,170,0.19));
--boton-radio:     93.636px;           /* píldora */
/* padding 6.592 × 20 · gap 12.36 · min-height 44.945 */

/* Textos del cierre */
--sombra-cierre:     0 4.026px 0 #064B98, 0 6.542px 7.549px rgba(0,59,133,0.63);
--sombra-subcierre:  0 2.443px 0 #0663A0;

/* Yoshi */
--sombra-yoshi: -1px 4px 7.9px rgba(0,0,0,0.62);

/* Rayitas amarillas: 9.364 × 27.155, radios 11.162 (arriba) / 6.378 (abajo) */
```

Todo valor en px de Figma se escribe como `calc(N * var(--k))`, igual que en Katalina, para mantener la escala exacta.

### 1.4 Inventario de recursos

Las URLs de MCP **caducan en 7 días**: se descargan en la Fase 0 a `figma-export/raw/`, una carpeta ignorada en git.

**Intro (frame 1)**

| Recurso | Nodo | Tamaño diseño | Posición (x, y) | Destino |
|---|---|---|---|---|
| Fondo piscina + palmeras | `15:86` | 412 × 917 | 0, 0 | ⚠️ **No se exporta por MCP** (relleno de imagen del frame) → original o video |
| Título "¡Se armó la fiesta!" (raster) | `74:274` | 283.771 × 148.431 | 64.11, 67 | `src/assets/intro/titulo.png` |
| Rayita amarilla izquierda | `22:111` | 9.364 × 27.155, −55° | 6.35, 144 aprox. | CSS (div con radios) |
| Rayita amarilla derecha | `22:112` | 9.364 × 27.155, +34° | 378.5, 95 aprox. | CSS |
| Bolsa DIANA | `22:115` | 330.572 × 428.132 | 40.71, 315.33 | `src/assets/intro/bolsa.png` |
| Mano (SVG vectorizado) | `22:161` | 73.791 × 90.797 | 268.03, 612.2 | `src/assets/svg/mano.svg` |
| Flecha arriba (SVG) | `22:175` | 16.319 × 20.02 | dentro del botón | `src/assets/svg/flecha.svg` |
| Botón "Toca el churro…" | `22:143` | 370.55 × 44.945 | 20.72, 779.46 | HTML + CSS (texto real) |

Layout del frame 1: auto-layout en columna centrada, `gap 36`, `padding-top 67`, `padding-bottom 111`. El texto "Pero primero…" va **rotado −2°**.

**Home (frame 2)**

| Recurso | Nodo | Tamaño diseño | Posición (x, y) | Destino |
|---|---|---|---|---|
| Ilustración piscina tropical | `71:149` | 415.649 × 926 | −1.82, −4.06 | ⚠️ **No se exporta por MCP** → original `Tropical_pool_digital_illustration_2K_20261020080430` |
| Resplandor (elipse SVG, −8°) | `68:139` | 373.16 × 169.71 | centro +11.52, 153.95 | `src/assets/svg/resplandor.svg` (incluye el desenfoque) |
| Título "Party Familiar con Yoshi" | `71:147` | 378.536 × 198 | 16.73, 153.95 | `src/assets/home/titulo.png` |
| Retrato | `66:115` | 426.874 × 639 (recorte 148.38 % / −20.17 %) | −7.44, 302.53 | `src/assets/home/retrato.png` (recorte exacto en `preparar-recursos`) |
| Yoshi | `74:280` | 82.514 × 120.103 + sombra | 85.57, 380.07 | `src/assets/home/yoshi.png` |
| Ola (SVG) | `74:218` | 439 × 91 | −14, 835 | `src/assets/svg/ola.svg` |
| Banner "¡Estás invitado!" (raster) | `77:304` | 381.685 × 169.638 | 15.16, 923 | `src/assets/home/banner.png` |
| "Nos vemos aquí" | `72:92` | 297 × 48 | 57.5, 1130.43 | Texto HTML |
| Ícono calendario | `84:375` | 105 × 105 | 43.58, 1216.22 | `src/assets/iconos/fecha.png` |
| Ícono reloj | `84:382` | 105 × 105 | fila 2 (+121.45) | `src/assets/iconos/hora.png` |
| Ícono ubicación | `84:379` | 105 × 105 | fila 3 (+242.91) | `src/assets/iconos/lugar.png` |
| Fondo agua + pato | `72:86` | 412 × 759 | 0, 1254.67 | ⚠️ **No se exporta por MCP** → original o video |
| "¡Que no falten las risas!" (−3°) | `72:160` | 357.955 × 141.254 | 27.32, 1701.66 | Texto HTML |
| "Nos vemos en la fiesta." | `72:162` | — | centro, 1858.34 | Texto HTML |

Notas del frame 2:
- El grupo `71:151` ("— Faded") recorta su contenido a 412 × 917.87 con `overflow: clip`. El retrato llega hasta y=941 y queda cortado, así que hay que replicar el recorte.
- La `Fade Mask` está **oculta** en Figma, así que no se aplica.
- Lista Día/Hora/Lugar: columna con `gap 16.454`; cada fila tiene `gap 20.111` entre ícono y texto y un bloque de texto de 199.721 de ancho.
- En Figma las capas de HORA y LUGAR se llaman "DÍA" y "[Fecha por confirmar]". Es solo el nombre de la capa, porque el contenido es correcto. Se usa el **contenido**.

---

## 2. Qué se reutiliza de Katalina

| Archivo de Katalina | Uso | Cambios |
|---|---|---|
| `package.json`, `.node-version`, `.gitignore`, `.vscode/` | Copiar | Nombre, fuentes nuevas |
| `astro.config.mjs` | Copiar | `site` nuevo |
| `public/_headers`, `public/robots.txt` | Tal cual | — |
| `functions/medios/[archivo].js` | **Tal cual** | Videos y música por partes (206) para iPhone |
| `src/components/Img.astro` | **Tal cual** | WebP de 1× a 4×, escalas `home` e `intro` |
| `src/components/Musica.astro` + `src/scripts/musica.ts` | Copiar | Estilo del botón con la paleta navy/amarillo |
| `src/components/Fondo.astro` | Base para `VideoFondo.astro` | Video de piscina en lugar de seda |
| `src/scripts/intro.ts` | Base | Misma estructura (gesto → música → video → `inert` → quitar intro) con la secuencia nueva de la bolsa |
| `src/styles/tokens.css` | Base | Mismo sistema `--u`/`--ui`, colores y curvas nuevos |
| `src/styles/global.css` | **Tal cual** | `.abs`, `.seccion`, reset |
| `src/styles/animaciones.css` | Base | Mismo patrón (`translate`/`rotate`/`scale` sueltos, variables `--dur`/`--giro`, reducir movimiento) |
| `scripts/preparar-recursos.mjs` | Base | Recortes y conversiones nuevos (retrato, audio, videos) |
| `scripts/generar-og.mjs` | Tal cual | Vista previa de WhatsApp |
| `scripts/qa-capturas.mjs`, `qa-tamanos.mjs`, `qa-peso.mjs`, `qa-medios.mjs` | Copiar | Referencias nuevas, sin la prueba de arrastre |
| `CLAUDE.md`, `README.md` | Plantilla | Reescribir para este proyecto |

**Se descarta** (no aplica a este diseño): `Galeria`, `Polaroid`, `Sticker`, `Pista`, `arrastrar.ts`, `BotonesMapa`, `TarjetaTransporte`, `Sobre`, `Encabezado`, `TextoDegradado`, `Separador`, `alinear-fotos.py` y `qa-arrastre.mjs`.

---

## 3. Fases

### Fase 0 · Preparación y extracción (sin código de UI)

1. Clonar `https://github.com/ripteban/invitacion-yoshi` (carpeta `invitacion-yoshi/`), conservar su `README.md` como punto de partida y trabajar en una rama por fase (`fase-0-recursos`, `fase-1-base`, …) con PR a `main`.
   - ⚠️ El repo es **público**. Katalina se publicó desde un repo privado porque la invitación lleva fotos y datos del evento. Se recomienda pasarlo a privado (GitHub → Settings → Danger Zone → Change visibility) antes de subir recursos.
2. Abrir sesión de Figma MCP y descargar **todos** los recursos de la tabla 1.4 a `figma-export/raw/`, guardando el nombre de nodo de cada archivo.
3. Medir la resolución nativa de cada raster. Si alguno mide **menos de 3× su ancho de diseño** (por ejemplo, la bolsa < 990 px), se pide el original.
4. Generar renders de referencia de Figma a 2× (824 px de ancho) con `get_screenshot` en `qa/referencia/`: `intro@2x.png` y `home@2x.png`, además de recortes por sección.
5. Recibir del usuario los recursos de la sección 4 y guardarlos en `entrada/`.
6. `scripts/preparar-recursos.mjs` deja los maestros en `src/assets/`:
   - Rasters como PNG sin pérdida y a resolución nativa, sin recomprimir; Astro genera los WebP después.
   - Retrato: recorte exacto de Figma (imagen al 148.38 % de ancho, desplazada −20.17 %).
   - SVG optimizados con `svgo`, sin tocar `width`/`height` ni el filtro de desenfoque del resplandor.
   - Chicharrones (cuando lleguen, ver 4.2) → `src/assets/chicharrones/chicharron-1.png …`: se recorta el borde transparente sobrante, se conserva el alfa y se guardan sin pérdida.
   - Música → `public/medios/musica.m4a` (AAC 128 kbps).
   - Videos → `public/medios/*.mp4` (H.264, `faststart`, sin audio, ver 4.3) + póster `.jpg` del primer cuadro.

✅ **Listo cuando**: no queda ninguna URL de Figma en el código, cada recurso tiene su maestro local verificado y las referencias de QA existen.

### Fase 1 · Base del proyecto

1. Copiar los archivos marcados en la sección 2 y ajustar nombre, `site` y dependencias:
   `astro`, `gsap`, `@fontsource/lilita-one`, `@fontsource/montserrat`, `@fontsource/barlow-condensed`; dev: `playwright`, `sharp`, `svgo`.
2. `src/data/evento.ts`, como única fuente de textos:
   ```ts
   export const evento = {
     titulo: 'Party Familiar con Yoshi',
     descripcion: '…',              // vista previa de WhatsApp
     instruccion: ['Pero primero…', 'abre los churros.'],
     boton: 'Toca el churro para abrirlo',
     encabezadoDetalles: 'Nos vemos aquí',
     fecha: '20 de Noviembre',
     hora: '3:30 P.M.',
     lugar: 'Rancho Las 3 Flores',
     cierre: ['¡Que no falten', 'las risas!'],
     subcierre: 'Nos vemos en la fiesta.',
   };
   ```
3. `tokens.css`: tokens de la sección 1.3 y escalas:
   - `--u = 100vw / 412` (Home, ancho completo en móvil).
   - `--ui = min(100vw / 412, 100svh / 917)` (Intro: cabe completa en ancho **y** alto, incluso en iPhone SE).
4. Estructura de `src/`:
   ```
   src/
     assets/{intro,home,iconos,svg,chicharrones}/
     components/
       Img.astro            (Katalina)
       Musica.astro         (Katalina, restyle)
       VideoFondo.astro     (basado en Fondo.astro)
       Intro.astro          frame 1 completo
       Bolsa.astro          bolsa + mano + capa de chicharrones voladores
       BotonAbrir.astro     píldora amarilla
       Portada.astro        piscina + resplandor + título + retrato + Yoshi
       Ola.astro            SVG de la ola
       Detalles.astro       "Nos vemos aquí" + 3 filas
       FilaDetalle.astro    ícono + etiqueta + valor
       Cierre.astro         agua + pato + textos finales
     data/evento.ts
     pages/index.astro
     scripts/{intro.ts, musica.ts, chicharrones.ts, revelar.ts}
     styles/{tokens.css, global.css, animaciones.css}
   ```
5. `index.astro`: metadatos (`noindex`, OG, `theme-color #93E6F8`, `viewport-fit=cover`), precarga de fuentes y estructura `<body class="bloqueado">` con Intro + `<main class="home" inert>`, igual que Katalina.

✅ **Listo cuando**: `npm run dev` levanta una página vacía con fuentes y tokens cargados y sin errores en consola.

### Fase 2 · Diseño estático, píxel a píxel (sin animaciones)

**2A. Intro (frame 1)**
- Fondo a pantalla completa (`object-fit: cover`, ancla al centro) que siempre cubre aunque el contenido se escale con `--ui`.
- Columna centrada con auto-layout: título (raster) → instrucción (texto, −2°) → bolsa → botón. Medidas exactas: `gap 36`, `pt 67`, `pb 111`.
- Rayitas amarillas en sus posiciones y rotaciones exactas.
- Mano SVG encima de la bolsa en (268.03, 612.2).
- Botón como `<button>` real (accesible), con texto en Montserrat Black Italic, flecha SVG, degradado, borde, sombra y radio exactos.
- Áreas táctiles: la bolsa **y** el botón abren. Se respeta `env(safe-area-inset-bottom)` en iPhones con barra inferior.

**2B. Home (frame 2)**, lienzo de 2014 u de alto con coordenadas de Figma (`.abs`)
- **Portada** (0–917.87): ilustración de piscina, resplandor con −8°, título, retrato recortado y Yoshi con su sombra. Todo dentro de un contenedor con `overflow: clip`.
- **Ola** en (−14, 835) superpuesta, con el SVG tal cual.
- **Banner** "¡Estás invitado!" en (15.16, 923).
- **Detalles**: "Nos vemos aquí" y tres filas con flexbox (gaps de Figma), con texto real para que se pueda editar en `evento.ts`.
- **Cierre**: fondo de agua con pato desde y=1254.67, "¡Que no falten las risas!" (−3°, dos sombras) y "Nos vemos en la fiesta." con su sombra.
- Imágenes con `Img.astro`: las de primera pantalla con `eager` y el resto en `lazy`. Fotos a calidad 90 y decoraciones a 80.

**2C. QA de fidelidad**
- `npm run qa` toma capturas con Playwright a 412 px y DPR 2 y las compara lado a lado con `qa/referencia/*@2x.png`, con un mapa de diferencias generado con `sharp`.
- Se revisan uno por uno: tipografía (tamaño, interlineado, tracking, ruptura de línea), colores, radios, sombras, rotaciones y posiciones (tolerancia de ±1 px a 412).
- Anchos de prueba: **320, 360, 375, 390, 393, 412, 414, 430**. Altos de la intro: **568, 667, 740, 844, 932**.
- Se verifica que cada recurso tiene archivo local no vacío, capa correcta en Figma, punto de uso correcto y geometría renderizada correcta.

✅ **Listo cuando**: las capturas coinciden con Figma en todos los anchos y la intro cabe completa en 320 × 568 sin recortar contenido.

### Fase 3 · Videos, música y animaciones (suaves, como en Katalina)

**Principios** (los mismos de Katalina):
- Se animan solo `transform`/`opacity`, con `translate`, `rotate` y `scale` sueltos para no chocar con GSAP.
- Las curvas son la *Gentle* (resorte) de `tokens.css` y `ease-out`. Nada lineal ni brusco.
- Con `prefers-reduced-motion` todo queda en fundidos simples.
- GSAP se usa solo para la apertura de la bolsa. Lo demás es CSS + `IntersectionObserver` (sin ScrollTrigger, para que pese menos).

**3A. Videos de fondo** (según lo que entregue el usuario, ver 4.3)
- `VideoFondo.astro`: `<video muted playsinline loop autoplay preload="metadata" poster=…>`, servido por la Function de rangos para iPhone.
- Arranque de respaldo con el primer toque (ahorro de batería en iPhone), reutilizando `intentarVideo()`.
- El video **reemplaza** la imagen de Figma en su misma posición y tamaño, y el póster es exactamente esa imagen, así que mientras carga se ve idéntico al diseño.
- Se pausa con `IntersectionObserver` cuando sale de pantalla y con `visibilitychange`, para ahorrar batería.

**3B. Intro en espera** (antes de tocar)
- Bolsa: flota suave (`translate` y ±4 px, 3.2 s, ida y vuelta) con un balanceo de ±1.5°.
- Mano: "presiona" la bolsa cada 1.8 s (escala 1 → 0.9 → 1 y desplazamiento de −4 px), como la mano del sobre.
- Botón: pulso suave de escala 1 → 1.03 y la flecha sube y baja 3 px.
- Rayitas amarillas: titilan con escala y opacidad, desfasadas entre sí.
- Título: rebote leve de entrada al cargar (escala 0.92 → 1 con *Gentle*).

**3C. Apertura: sacudida + estallido de chicharrones** (`intro.ts` + `chicharrones.ts`, línea de tiempo de GSAP)

> ⏸ **Punto de control**: antes de programar esta parte, si los PNG de chicharrones (sección 4.2) no han llegado, **se te piden** y se espera a tenerlos. No se usan sustitutos ni dibujos inventados.

| t (ms) | Qué pasa |
|---|---|
| 0 | Toque → `iniciarMusica()` (dentro del gesto), se desactiva el botón y la mano y el botón se desvanecen (150 ms) |
| 0–480 | **Sacudida**: rotación ±5° y desplazamiento ±6 px en 6 ciclos decrecientes, más un "inflado" (`scaleY` hasta 1.06 y `scaleX` hasta 0.97). Uno o dos chicharrones se asoman por arriba de la bolsa (`translate` y −20 px), como si empujaran |
| 480–560 | Pausa de tensión: escala a 1.08 |
| 560 | **Estallido**: la tira superior de la bolsa (misma imagen recortada con `clip-path`) sale volando hacia arriba girando, y el cuerpo hace un rebote de escala 1.12 → 0.96 |
| 560–1100 | **Chicharrones volando**: salen de la boca de la bolsa en abanico (entre −65° y +65° respecto a la vertical) con trayectoria de parábola (velocidad inicial + gravedad), giro propio y escala de 0.6 a 1.3, como si vinieran hacia la cámara |
| 700–1100 | El título y el texto se desvanecen hacia arriba mientras los chicharrones pasan por delante |
| 1100 | Espera de 100 ms y el Home aparece con un **fundido de 300 ms ease-out** (igual que Katalina) mientras los últimos chicharrones salen de pantalla; luego se elimina la intro |

Detalles de los chicharrones voladores:
- **Cantidad**: 16–22 piezas en pantalla, generadas a partir de los 5–8 PNG entregados. Cada pieza varía en tamaño (60–140 u de ancho), rotación inicial, volteo horizontal y velocidad, así no se notan repetidos.
- **Profundidad**: algunas piezas pasan **delante** del título (`z-index` alto, más grandes y rápidas) y otras **detrás** de la bolsa (más chicas y con un leve desenfoque de 1–2 px), para dar sensación de 3D.
- **Física**: Physics2DPlugin de GSAP (gratis desde GSAP 3.13), con `velocity`, `angle` y `gravity`, más `rotation` aleatoria de ±540°. Las piezas que suben salen por arriba y las que caen salen por abajo; ninguna queda flotando.
- **Sombra**: `drop-shadow` suave igual a la de la bolsa para integrarlas con la foto.
- **Carga**: los PNG se convierten a WebP con alfa vía `astro:assets` (2× su tamaño máximo en pantalla) y se **precargan con baja prioridad** al terminar de cargar la intro, para que el estallido no espere a la red. Si por red lenta no están listos al tocar, se omiten y el estallido sigue sin trabarse.
- **Rendimiento**: solo `transform` y `opacity`, `will-change` durante la animación y limpieza del DOM al terminar. Objetivo: 60 fps en gama media.
- **Movimiento reducido**: sin chicharrones; solo un fundido de la bolsa al Home.
- **Acento opcional**: 10–15 rayitas amarillas `#FFE52C` (la forma de Figma) junto a los chicharrones. Se decide al ver el demo.

**3D. Home**
- **Entrada** al terminar el fundido: el título "Party Familiar" aparece con *Gentle* (escala 0.85 → 1), el resplandor se enciende (opacidad 0 → 1) y Yoshi salta (`translate` y −20 → 0 con rebote).
- **En espera**: el título flota (±3 px, 4 s), el resplandor pulsa (opacidad 0.85 ↔ 1, 3 s) y Yoshi se balancea (±4°, 2.4 s, origen en los pies).
- **Al hacer scroll** (`revelar.ts` con IntersectionObserver, una sola vez):
  - Banner: sube 24 px y aparece con un rebote leve.
  - "Nos vemos aquí": sube y aparece.
  - Filas de detalles: entran escalonadas cada 120 ms y el ícono hace un "pop" (escala 0.8 → 1, *Gentle*).
  - Cierre: "¡Que no falten las risas!" aparece con un tambaleo (−3° ± 2°) y el subtítulo entra 150 ms después.
- **En espera, después de revelarse**: los íconos se mecen (±2°) desfasados y el título del cierre late muy leve (escala 1 ↔ 1.02).

**3E. Música**
- Empieza en el toque de la bolsa, con un fundido de volumen de 0 a 1 en 800 ms.
- Botón flotante para silenciar (reutilizado de Katalina): píldora amarilla con borde `#FFF5AA` e ícono navy, siguiendo el lenguaje del botón de Figma.
- Se pausa al salir de la pestaña y se reanuda al volver si no estaba silenciada.

✅ **Listo cuando**: todo corre a 60 fps en un móvil de gama media (Chrome DevTools con CPU 4× más lenta), no hay saltos de layout, la música y los videos funcionan en iPhone Safari y Android Chrome, y la versión con movimiento reducido funciona.

### Fase 4 · Pulido, rendimiento y publicación

1. **Peso**: intro < 1.5 MB, total sin videos < 5 MB y cada video ≤ 3 MB. Lighthouse móvil ≥ 90 en rendimiento.
2. **Accesibilidad**: `alt` descriptivos en los títulos raster ("¡Se armó la fiesta!", "Party Familiar con Yoshi", "¡Estás invitado!"), botones reales, foco visible e `inert` en el Home hasta abrir. `<noscript>` muestra el Home directo.
3. **Vista previa de WhatsApp**: `npm run og` genera 1200 × 630.
4. **Pruebas en dispositivos reales**: iPhone (Safari, modo bajo consumo), Android (Chrome) y el navegador interno de WhatsApp. Se revisan audio, video y la animación de apertura.
5. **Publicación**: `ripteban/invitacion-yoshi` → Cloudflare Pages (Workers & Pages → Create → Pages → conectar el repo, preset Astro, `npm run build`, salida `dist`, `NODE_VERSION=22`) → actualizar `site` en `astro.config.mjs` con la URL final.
6. `README.md` con "Cambiar contenido" (todo en `evento.ts`) y "Cómo está hecho".

### Fase 5 · Tablet y escritorio (después de aprobar el móvil)

- Mismo enfoque que Katalina: tarjeta centrada de 440–640 px con esquinas redondeadas y sombra sobre el video de piscina desenfocado.
- Efectos con mouse: la bolsa se acerca al pasar el cursor y el botón se eleva.
- Actualizar los `sizes` de `Img.astro` y repetir el QA de tamaños.

---

## 4. Recursos que necesito del usuario

### 4.1 Imágenes (bloquean la Fase 2)
Estos 3 fondos están como **relleno de imagen de frame** en Figma y el MCP no los entrega:

1. **Fondo de la intro**: piscina y palmeras (nodo `15:86`).
2. **Ilustración de la portada**: `Tropical_pool_digital_illustration_2K_20261020080430` (nodo `71:149`).
3. **Fondo del cierre**: agua y pato (nodo `72:86`).

Se necesitan en **máxima resolución**, en PNG o JPG originales. Si no los tienes, el plan B es exportarlos desde Figma (selecciona el frame → Export → PNG 4×). En ese caso el resultado es un render aplanado.

Si en la Fase 0 algún raster de Figma (bolsa, títulos, retrato, banner, íconos, Yoshi) mide menos de 3× su tamaño de diseño, te pediré también su original.

### 4.2 Chicharrones para la apertura (bloquean la Fase 3C)
Son los chicharrones que salen volando al tocar la bolsa. Se piden al llegar a la Fase 3C si no se entregaron antes.

- **Formato**: PNG con **fondo transparente**, un chicharrón por archivo y bordes limpios, sin halo blanco ni sombra pegada.
- **Cantidad**: **5 a 8 piezas distintas** en forma, tamaño y ángulo (de frente, de lado, una más chica o quebrada…), así la animación no se ve repetida.
- **Resolución**: mínimo **600 px** en su lado más largo (ideal 1000 px), porque se ven grandes al pasar frente a la cámara.
- **Estilo**: el mismo de la foto de la bolsa (chicharrón criollo picante, foto realista, luz de arriba), para que parezcan salidos de ella.
- **Nombres**: `chicharron-1.png`, `chicharron-2.png`, … (en `entrada/chicharrones/`).
- **Opcional**: migajas o trocitos sueltos (2–3 PNG chicos) para llenar el estallido, y un trozo de la tira rasgada de la bolsa si quieres que se vea más real que el recorte automático.

### 4.3 Videos
Por cada video:
- **Qué fondo reemplaza**: intro (piscina y palmeras), portada (piscina tropical) o cierre (agua y pato).
- Formato: MP4 o MOV, **vertical**, del mismo encuadre que la imagen de Figma que reemplaza (proporciones 412×917, 412×926 o 412×759). Mínimo 1080 px de ancho, 6–10 s, **bucle sin corte** y sin audio.
- El primer cuadro debe coincidir con la imagen de Figma, porque se usa como póster.

### 4.4 Música
- Archivo de audio (MP3, M4A o WAV). Si tiene silencio al inicio, indícame el segundo de arranque.

### 4.5 Datos
- Repo: ✅ `https://github.com/ripteban/invitacion-yoshi`.
- URL de Cloudflare Pages deseada (propuesta: `invitacion-yoshi.pages.dev`, que sale del nombre del repo).
- Texto de la vista previa de WhatsApp (propuesta: "Party Familiar con Yoshi · 20 de noviembre · 3:30 p.m.").

---

## 5. Orden de trabajo y entregables

| Fase | Entregable que revisas |
|---|---|
| 0 | Lista de recursos descargados con su resolución y lo que falta (primer commit en `invitacion-yoshi`) |
| 1 | Proyecto corriendo en `localhost:4321` con fuentes y tokens |
| 2 | Capturas lado a lado con Figma en los 8 anchos → **tu aprobación de fidelidad** |
| 3 | ⏸ Pedido de PNG de chicharrones (si faltan) → video demo de la apertura y del scroll en móvil → **tu aprobación de animaciones** |
| 4 | URL pública en Cloudflare Pages |
| 5 | Versión tablet/escritorio |
