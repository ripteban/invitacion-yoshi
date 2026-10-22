# Recursos · Fase 0

Figma `Jwd5F7ykAxQtFDWMCu96sw` · página `0:1`. Descargado vía MCP el 2026-10-22.

Los originales están en `figma-export/originales/` (carpeta ignorada en git), con el nombre `<nodo>_<uso>`.
Cada archivo se identificó por hash contra la descarga por nodo, así que la correspondencia nodo ↔ archivo es exacta.

## Rasters

La **densidad** es cuántos píxeles del original caen en 1 px de diseño, al tamaño en que se ve en pantalla.
Para teléfonos con DPR 3 hace falta ≥ 3×.

| Recurso | Nodo | Original | Densidad | Alfa | Estado |
|---|---|---|---|---|---|
| Fondo intro (piscina y palmeras) | `15:86` | 1080 × 1920 | 2.09× | no | ⚠️ bajo 3× |
| Ilustración portada (piscina tropical) | `71:149` | 1080 × 1920 | 2.07× | no | ⚠️ bajo 3× |
| Fondo cierre (agua y pato) | `72:86` | 1080 × 1920 | 2.53× | no | ⚠️ bajo 3× |
| Título "¡Se armó la fiesta!" | `74:274` | 1734 × 907 | 6.11× | sí | ✅ |
| Bolsa DIANA | `22:115` | 1094 × 1438 | 3.31× | sí | ✅ |
| Título "Party Familiar con Yoshi" | `71:147` | 1734 × 907 | 4.58× | sí | ✅ |
| Retrato | `66:115` | 1024 × 1536 | **1.62×** | sí | ❌ pedir original |
| Yoshi | `74:280` | 1864 × 2713 | 22.6× | sí | ✅ |
| Banner "¡Estás invitado!" | `77:304` | 1881 × 836 | 4.93× | sí | ✅ |
| Ícono fecha | `84:375` | 1254 × 1254 | 11.9× | sí | ✅ |
| Ícono hora | `84:382` | 1254 × 1254 | 11.9× | sí | ✅ |
| Ícono lugar | `84:379` | 1254 × 1254 | 11.9× | sí | ✅ |

## SVG

| Recurso | Nodo | Tamaño | Nota |
|---|---|---|---|
| Mano | `22:161` | 73.791 × 90.797 | Vectorizada |
| Flecha arriba | `22:175` | 16.319 × 20.02 | Dentro del botón |
| Resplandor | `68:139` | 455.65 × 216.602 | Elipse `#000B25` al 52 % con desenfoque de 23.95; en realidad es una **sombra oscura**, no un brillo |
| Ola | `74:218` | 439 × 91 | Con su `clip-path` |

Las rayitas amarillas (`22:111`, `22:112`) se hacen con CSS, como dice el plan.

## Recortes de los fondos (verificados contra el render de Figma)

Los tres fondos son rellenos de imagen en modo **cover centrado** (`object-fit: cover; object-position: center`).
Se verificó recortando el original y comparándolo con el export de Figma a 2× (error medio por canal, 0–255):

| Fondo | Caja en el diseño | Error |
|---|---|---|
| Intro | 412 × 917 en (0, 0) | 0.94 |
| Portada | 415.649 × 926 en (−1.82, −4.06), recortada por el grupo de 412 × 917.87 | 2.12 |
| Cierre | 412 × 759 en (0, 1254.67) | 0.21 |

El **retrato** va en una caja de 426.874 × 639 con la imagen al 148.38 % × 148.69 %, desplazada −20.17 % en x.
Solo se ve el 67.4 % central del ancho del original, y por eso su densidad efectiva queda en 1.62×.

## Correcciones al plan

- El plan decía que los 3 fondos no se exportan por MCP. **Sí se exportan**: `download_assets` entrega el relleno original de cada frame.
- `get_screenshot` no amplía por encima de 1×. Las referencias a 2× salen de `download_assets` con escala 2.

## Referencias de QA (`qa/referencia/`)

| Archivo | Tamaño |
|---|---|
| `intro@1x.png` / `intro@2x.png` | 412 × 917 / 824 × 1834 |
| `home@1x.png` / `home@2x.png` | 412 × 2014 / 824 × 4028 |

## Falta (lo entrega el usuario)

1. **Retrato original** sin recortar, en la máxima resolución (≥ 1900 px de ancho para llegar a 3×). Bloquea la fidelidad de la portada.
2. *(Opcional)* Fondos en mayor resolución (≥ 1600 × 2800). Si no hay, los de 1080 × 1920 sirven y los videos pueden reemplazarlos.
3. Chicharrones en PNG (sección 4.2 del plan). Bloquea la Fase 3C.
4. Videos (4.3) y música (4.4).
5. URL de Cloudflare Pages y texto de la vista previa de WhatsApp (4.5).
