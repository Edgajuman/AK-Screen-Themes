# Publicar un tema

Haz un **fork**, crea una rama y añade únicamente `themes/tu-usuario-de-github/tu-tema/`. No cambies paquetes de otros autores. Abre un pull request hacia `main`; Edgajuman revisará la vista previa, los recursos y las licencias. No se publica nada de un PR sin aceptar.

```text
themes/
└── tu-usuario/
    └── mi-tema/
        ├── theme.json
        ├── preview.png
        ├── info.md
        ├── LICENSE.txt
        └── assets/
            ├── backgrounds/  (PNG, JPEG, GIF, WebP)
            ├── icons/        (SVG)
            └── fonts/        (TTF/OTF y su licencia)
```

## Empezar

Copia `themes/edgajuman/ak-midnight/`, cambia `author`, `id`, `name`, `version` y los colores. El autor y el id deben coincidir con las carpetas. Usa la plantilla nativa completa y consulta [SCHEMA.md](SCHEMA.md) para todas las opciones. También se acepta el formato anterior de Aurora Glass y Sakura Pulse.

La vista previa debe representar el tema; no incluyas contenido de otras aplicaciones sin licencia. En AK Screen exporta una paleta desde **Temas → Exportar paleta** para usar los valores actuales como punto de partida. Para una modificación de un tema ya publicado, aumenta su versión.

## Validar antes de enviar

Necesitas Python 3.12 o posterior solamente para validar el paquete, no para usarlo:

```sh
python -m unittest discover -s scripts -p 'test_*.py'
python scripts/catalog.py --check
```

Se admiten como máximo 256 componentes, 64 MB por paquete y 16 MB por archivo (8 MB por fuente, 256 KB por SVG). Los nombres y rutas no pueden contener `..`, enlaces simbólicos ni rutas absolutas. No se permiten ejecutables, scripts ni referencias externas dentro de los SVG.

Para probar antes del PR, ejecuta `python scripts/catalog.py`, extrae el ZIP creado en packages/ e importa su theme.json en AK Screen. Ese ZIP ya contiene el manifiesto de componentes y sus checksums. Envía únicamente tu carpeta de autor; no incluyas el catálogo generado en el pull request.

Conserva la licencia de cada fuente. El arte debe ser propio o tener una licencia que permita redistribuirlo. Describe autoría, origen y licencia en `info.md`; añade las licencias de terceros dentro del paquete.

## Después de la aprobación

El workflow **Catálogo de temas** valida `main`, fija la revisión de origen, calcula los SHA-256, genera ZIP independientes y publica el catálogo web. La aplicación descarga recursos de esa revisión concreta, evitando mezclar archivos de actualizaciones distintas. No hay API propia ni cuentas dentro de la aplicación.

El editor admite colores, medidas, iconos SVG, fuentes y fondos. Las antiguas animaciones de widgets, texturas de botones y degradados declarativos no tienen equivalente directo en el editor Rust: no se anuncian como funciones activas. Los archivos se conservan para que puedan reutilizarse en versiones futuras.
