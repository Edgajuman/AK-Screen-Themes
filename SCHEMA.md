# Esquema nativo de temas · AK Screen 2.2

El catálogo acepta `schema: 1` (nativo) y convierte `schema_version: 1` (formato anterior). No descargues ni modifiques manualmente los índices: GitHub lo genera tras aceptar los cambios.

## Metadatos y recursos

```json
{"schema":1,"id":"mi-tema","name":"Mi tema","author":"tu-usuario","version":"1.0.0","description":"Descripción breve","base":"dark","preview":"preview.png","colors":{"accent":"#408CFF"},"editor_background":"assets/backgrounds/editor.webp","splash_background":"assets/backgrounds/splash.gif","font":"assets/fonts/mi-fuente.ttf","icons":{"Play":"assets/icons/play.svg"},"style":{"metrics":{"radius":6,"radius_sm":4,"gap":4,"tab_h":32}}}
```

`base`: dark, medium, light, StudioBlue u oled. Las rutas siempre son relativas al paquete. Las propiedades no presentes heredan la base. `assets`, `revision` y los SHA-256 los genera el catálogo; no los escribas a mano. La plantilla [AK Studio Pro](themes/edgajuman/ak-studio-pro/theme.json) enumera los 47 colores, todas las métricas y un layout completo. [AK Midnight](themes/edgajuman/ak-midnight/theme.json) enumera todos los colores.

## Colores disponibles

Usa #RRGGBB. Los nombres nativos siguientes corresponden a partes reales del editor. Los 15 alias de paleta anteriores siguen admitidos: accent, background, header, panel, tabs, text, secondary, field, border, selection, track, trackAlternate, monitor, hover y danger.

| Propiedad de colors | Valor del ejemplo |
|---|---|
| `app_bg` | `#0D1118` |
| `header_bg` | `#121925` |
| `panel_bg` | `#171F2D` |
| `tab_bg` | `#121925` |
| `tab_text` | `#ADBBD0` |
| `tab_text_active` | `#F3F6FC` |
| `focus` | `#408CFF` |
| `accent` | `#408CFF` |
| `accent_hover` | `#2A486F` |
| `text` | `#F3F6FC` |
| `text_dim` | `#ADBBD0` |
| `text_faint` | `#6E6E6E` |
| `icon` | `#ADBBD0` |
| `icon_active` | `#D1D1D1` |
| `hover` | `#2A486F` |
| `pressed` | `#4B4B4B` |
| `field_bg` | `#0E1520` |
| `field_border` | `#33435B` |
| `separator` | `#33435B` |
| `row_alt` | `#212121` |
| `row_selected` | `#253F66` |
| `hot_text` | `#408CFF` |
| `tl_bg` | `#171F2D` |
| `tl_track_bg` | `#182334` |
| `tl_track_bg_alt` | `#1E2B40` |
| `tl_header_bg` | `#121925` |
| `tl_ruler_bg` | `#1D1D1D` |
| `tl_ruler_tick` | `#8D8D8D` |
| `tl_ruler_text` | `#B0B0B0` |
| `playhead` | `#408CFF` |
| `in_out_shade` | `#3F3F3F` |
| `clip_selected_border` | `#408CFF` |
| `render_red` | `#E34850` |
| `render_yellow` | `#F0F04F` |
| `render_green` | `#2D9D78` |
| `monitor_bg` | `#070A10` |
| `timecode` | `#408CFF` |
| `danger` | `#FF657A` |

## Medidas

`style.metrics`: radius y radius_sm (0–20 px), gap (0–16 px), tab_h (18–44 px). El formato anterior `geometry.radius.control/panel` se convierte también. Las medidas conservan límites para que las herramientas sigan siendo utilizables.

## Colores de contenido

`style.clip_colors` y `style.asset_colors` aceptan video, audio, image, text, effect y sequence. Los clips de tutorial añaden tutorial_cursor y tutorial_camera. Son colores visuales de la línea de tiempo y del panel de medios; no alteran el color del vídeo exportado ni las etiquetas almacenadas en el proyecto.

`style.timeline_colors.ruler` aplica el fondo de la regla; selected_border aplica el borde de clips seleccionados. El resto de la regla, los ticks, el cabezal y los estados de render se ajustan con los colores `tl_*`, playhead y render_* de la tabla.

## Iconos SVG

Son compatibles con el editor Rust: se rasterizan a una textura de 64×64 y se pintan en el lugar del icono nativo. No se ejecutan scripts ni se cargan imágenes externas desde el SVG. Usa viewBox, trazos y figuras SVG simples, con colores explícitos. Máximo 256 KB por archivo y 2.000 nodos.

Los antiguos marcadores `{text}` y `{accent}` no son colores SVG. Sustitúyelos por los valores hexadecimales de tu tema antes de enviar el PR; el catálogo rechaza los marcadores sin resolver para evitar iconos negros o ilegibles.

Los nombres nativos disponibles para `icons` son:

`Selection`, `TrackSelectFwd`, `TrackSelectBack`, `Ripple`, `Rolling`, `RateStretch`, `Remix`, `Razor`, `Slip`, `Slide`, `Pen`, `Rectangle`, `Ellipse`, `Hand`, `Zoom`, `Type`, `Play`, `Pause`, `StepBack`, `StepFwd`, `GoToIn`, `GoToOut`, `MarkIn`, `MarkOut`, `Marker`, `Insert`, `Overwrite`, `Lift`, `Extract`, `Camera`, `Loop`, `Wrench`, `Plus`, `Eye`, `EyeOff`, `Speaker`, `Mute`, `Lock`, `Unlock`, `SyncLock`, `Mic`, `Folder`, `Film`, `Sequence`, `Audio`, `Image`, `Search`, `ListView`, `IconView`, `Freeform`, `NewItem`, `Trash`, `Home`, `Workspaces`, `Hamburger`, `ChevronDown`, `ChevronRight`, `Magnet`, `Link`, `Keyframe`, `Stopwatch`, `Fx`, `Reset`, `Close`, `Fullscreen`, `Export`, `Gear`, `Info`, `Captions`, `Adjust`, `Nest`, `Undo`, `Redo`, `Bell`, `Chat`, `Globe`, `Code`, `Sparkle`, `Grid`, `Square`, `Proxy`, `Offline`, `TrackMaskBack`, `TrackMaskBackFrame`, `TrackMaskFwdFrame`, `TrackMaskFwd`, `SortIcons`, `Automate`, `Star`, `ChevronLeft`, `ArrowUp`, `Drive`, `Network`, `Clock`.

Se aceptan además estos alias del repositorio anterior: media, audio, text, transition, effects, import, record, tutorial, ui, cursor, camera, sub, smart, save, home, export, split, duplicate, delete, undo, redo, play, pause, back, forward, fit, fullscreen, guide, zoom_in, zoom_out, marker, keyframe, lock, eye y mute. Los alias se adaptan a las herramientas nativas equivalentes; varios botones pueden compartir un mismo icono. El antiguo `default` no reemplaza indiscriminadamente todos los iconos: elimínalo de los temas nuevos.

## Fuentes

`font` acepta una TTF/OTF válida de hasta 8 MB. Se carga solo dentro del editor y mantiene las fuentes incluidas como respaldo para caracteres ausentes. Se aplica a las familias proporcionales, incluidas medium/semibold; una única fuente regular no inventa variantes de peso. La fuente monoespaciada de los indicadores de tiempo conserva su función. Incluye siempre la licencia de redistribución de la fuente.

## Fondos y pantalla de carga

`editor_background` y `splash_background` aceptan PNG/JPEG/GIF/WebP; GIF y WebP animado mantienen sus fotogramas. En Temas y apariencia el usuario puede sustituir cada fondo, ajustar la opacidad del fondo del editor (0–100%), desactivar el inicio o cambiar su duración mínima (0,5–6 s). El inicio aparece antes de inicializar el editor y dispositivos multimedia.

Límites de decodificación: 4096×4096, 16 MB de archivo, 120 fotogramas y 64 MB decodificados. Si se supera un límite se informa el error y se mantiene operativo el editor. Son fondos decorativos: no aparecen en el MP4.

## Diferencias con el formato anterior

Se aplican la paleta, radios, el color de pulsación, los colores de clips y medios, SVG, fuentes y fondos Editor/Splash. Los degradados declarativos de widgets, rebote/glow personalizado, texturas de botones, el fondo Home y fondos distintos por panel no tienen aún un equivalente en el editor Rust. Se conservan sus archivos y metadatos sin anunciarlos como activos. Usa las propiedades nativas de esta guía para obtener un resultado reproducible.


## Novedades de 2.2: estilos, curvas y disposición

Declara `min_app_version: "2.2.0"` para usar las nuevas capacidades. `themes.json` conserva el catálogo compatible con 2.1; `themes-v2.json` contiene el catálogo completo usado por 2.2 y la web. Así un tema nuevo no impide instalar los anteriores.

Los nueve colores adicionales son `guide`, `snap`, `safe_margin`, `graph_bg`, `graph_grid`, `graph_curve`, `graph_velocity`, `graph_handle` y `keyframe`.

Las once métricas nativas son `radius`, `radius_sm`, `gap`, `tab_h`, `header_h`, `control_h`, `font_scale`, `animation_time`, `panel_border_width`, `panel_border_opacity` y `focus_border_opacity`. La superficie continua usa gap=0 y bordes de baja opacidad; puedes cambiarlo en el tema. La escala de fuente afecta widgets estándar; algunas etiquetas pintadas mantienen su tamaño.

`style.workspace` selecciona un espacio existente. `style.layout` define el árbol completo con nodos `Split` y `Tabs`: orientación, proporciones, grupos y pestaña activa. El ejemplo AK Studio Pro incluye un árbol listo para adaptar. No repitas paneles ni dejes grupos vacíos. Máximo 32 niveles, 127 nodos y 26 tipos de panel. La posición se puede reorganizar después desde el editor y se recuerda por espacio de trabajo.

`stylesheet: "editor.css"` admite una hoja local de hasta 64 KiB. También se acepta `style.css`. No es CSS de navegador: se traduce a los componentes nativos y rechaza scripts, imports, URLs o selectores desconocidos.

```css
:root { --accent: #49b6ff; --graph-curve: #49b6ff; --snap: #f6b56d; }
#editor { background-color: #10151e; }
.panel { gap: 0px; border-width: 1px; border-opacity: 0.16; focus-opacity: 0.35; border-radius: 0px; }
.tabs { background-color: #18212e; color: #a8b9cf; height: 32px; }
.toolbar { height: 42px; }
.timeline { background-color: #18212e; }
.button { background-color: #49b6ff; border-radius: 5px; height: 26px; }
.input { background-color: #101923; border-color: #35475a; border-radius: 5px; }
.menu { animation-duration: 0.14s; }
.text { color: #e9f3ff; font-scale: 1.05; }
```

`:root` admite los colores y métricas del esquema mediante nombres `--token-con-guiones`. Las propiedades admitidas por cada selector se muestran en el ejemplo y se validan al instalar. Un tema cambia presentación y distribución; no añade herramientas ejecutables ni modifica exportaciones.

La opacidad del fondo, su sustitución personal y la duración del splash se configuran por usuario en Configuración → Temas y apariencia. Se conservan entre temas para respetar las preferencias del usuario.
