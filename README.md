# AK Screen Themes

Temas comunitarios revisados para **AK Screen**. Cada autor conserva sus paquetes, recursos y licencias en su propia carpeta.

[**Explorar el catálogo con vistas previas →**](https://edgajuman.github.io/AK-Screen-Themes/) · [**Abrir el constructor web**](https://edgajuman.github.io/AK-Screen-Themes/theme-studio.html) · [Guía para publicar](CONTRIBUTING.md) · [Descargar AK Screen](https://github.com/Edgajuman/AKScreen-Downloads/releases)

El constructor web representa la interfaz de AK Screen 2.4.0 para editar los 47 colores nativos, las 11 métricas, los espacios de trabajo, grupos y paneles, CSS nativo, SVG, fuentes y fondos. La vista previa conserva la resolución lógica de 1366 × 768 y exporta esa misma vista como `preview.png`. Exporta un ZIP con la ruta `themes/usuario/id/` listo para revisar y añadir a un pull request. El borrador y sus recursos se guardan en este navegador; no se publican automáticamente.

En **Temas publicados**, busca por nombre o autor y pulsa **Previsualizar**. El tema se carga con sus fondos, carga animada, fuente, iconos, CSS y disposición sin instalarlo ni descargar un ZIP. Los archivos se leen de la revisión aprobada del repositorio y se verifican mediante SHA-256. **Volver a mi tema** recupera la vista de tu borrador; **Crear variante** convierte el tema elegido en una copia editable con otro identificador, conservando licencias y créditos. El borrador anterior queda recuperable desde el mismo apartado. Revisa las licencias de los recursos antes de enviar tu variante al catálogo.

## Studio Gallery · edgajuman · 2.4.0

![Studio Gallery · ilustración](themes/edgajuman/studio-gallery/preview.png)

[Studio Gallery](themes/edgajuman/studio-gallery/) usa el esquema real del editor: 47 colores, métricas, layout, 24 iconos originales, fuente local con licencia, fondo WebP, carga GIF y CSS nativo. La biblioteca de efectos se presenta como galería de tres columnas, con animación al pasar el cursor. La imagen anterior es ilustrativa; las capturas reales se añaden al repositorio de descargas tras probar el binario.

```css
.effects-browser { display: grid; grid-template-columns: repeat(3, 1fr); }
.effect-card { border-radius: 8px; background-color: #223044; }
.effect-preview { play-on-hover: true; }
```

La distribución se define en `style.layout`, como árbol de divisiones y pestañas. El CSS actúa sobre los componentes nativos admitidos; no es un navegador ni ejecuta JavaScript. La opacidad del fondo se ajusta en Apariencia. [Guía completa](themes/edgajuman/studio-gallery/info.md).

## AK Studio Pro · ejemplo avanzado

![AK Studio Pro en AK Screen 2.2](themes/edgajuman/ak-studio-pro/preview.png)

[AK Studio Pro](themes/edgajuman/ak-studio-pro/) requiere AK Screen 2.2.0. Incluye 47 colores, 11 métricas, disposición propia de paneles, hoja CSS nativa, 24 SVG originales, fuente con licencia, fondo WebP y carga GIF animada. La imagen anterior es una captura real de AK Screen 2.2; las imágenes siguientes muestran los temas en 2.1.

## Temas disponibles

| Sakura Pulse | Aurora Glass |
|---|---|
| ![Sakura Pulse](themes/edgajuman/sakura-pulse/preview.png) | ![Aurora Glass](themes/edgajuman/aurora-glass/preview.png) |
| Índigo, neón sakura, fondos, SVG y fuente M PLUS Rounded 1c. | Una paleta oscura con acento violeta y cursor SVG. |

También incluimos **AK Midnight**, una plantilla nativa con los 38 colores del editor y medidas configurables.

Las vistas previas de Sakura Pulse y Aurora Glass muestran capturas reales de AK Screen 2.1 con contenido de demostración. La pantalla de carga también puede personalizarse:

![Pantalla de carga real con Sakura Pulse](themes/edgajuman/sakura-pulse/splash-preview.png)

## Instalar

En AK Screen 2.2: **Configuración → Temas y catálogo → Actualizar → Instalar y aplicar**. En 2.1, abre **Temas → Catálogo**. Puedes ver la imagen de vista previa antes de instalar. La app instala el paquete completo en la carpeta local de temas que tenga configurada cada usuario, conserva sus componentes y verifica tamaño y SHA-256. La ubicación se obtiene de la carpeta Documentos del usuario que ejecuta la app en su propio equipo; nunca se usa la ruta personal del creador. Puedes cambiarla desde Configuración. Los temas instalados funcionan sin conexión.

**En este repositorio de GitHub**, los archivos se organizan en `themes/autor/tema/`. Esa es la estructura que debes usar al crear tu fork o pull request; no debes crear carpetas Documentos dentro del repositorio.

Desde la web: descarga el ZIP, extráelo y selecciona su `theme.json` en **Importar paquete / JSON**. El instalador del tema no ejecuta scripts ni instala fuentes en Windows; las fuentes solo se usan dentro de AK Screen.

## Contribuir

1. Haz un fork de este repositorio.
2. Añade tu tema en `themes/tu-usuario/tu-tema/` usando la [guía y plantilla](CONTRIBUTING.md).
3. Abre un pull request. Las comprobaciones validarán el paquete.
4. **Solo después de que el mantenedor lo acepte en `main`**, GitHub genera el catálogo, el ZIP y la página web. Los forks y PR abiertos no aparecen en el catálogo oficial.

El esquema original con `schema_version: 1` se convierte automáticamente al formato nativo. [Consulta la compatibilidad y todos los campos disponibles](SCHEMA.md).

## Licencias

Cada paquete incluye sus propias atribuciones. Los recursos de Sakura Pulse son originales de Edgajuman / AK Screen; su fuente conserva la licencia SIL OFL 1.1. Los scripts y la página de este repositorio se distribuyen bajo [MIT](LICENSE.txt). Ningún recurso de terceros puede añadirse sin permiso de redistribución.


## Remakes de temas 2.0 y 2.1

En [Theme Studio](https://edgajuman.github.io/AK-Screen-Themes/theme-studio.html), abre **Temas publicados**, selecciona **Previsualizar** y pulsa **Crear variante**. Los temas anteriores a 2.2 también se pueden previsualizar: sus colores, fondos, fuentes e iconos se convierten a los controles actuales. La variante se exporta para AK Screen 2.4, con las licencias y créditos originales, y conserva tu borrador anterior para recuperarlo. No cambia el paquete original ni promete reproducir controles históricos que ya no existen en el editor Rust.
