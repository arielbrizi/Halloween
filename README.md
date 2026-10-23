# Noche Zombie · Buenos Aires

Juego Three.js/WebGL con personajes fotográficos y escenarios construidos a partir de cartografía real de OpenStreetMap.

## Jugar

Descargar `index.html` y abrirlo en un navegador moderno con WebGL. Incluye motor, imágenes, cartografía, estilos y lógica: funciona sin conexión. También se puede servir con `npm start` (puerto 3000). No requiere cuentas ni claves.

Elegir personaje y distrito inicial: Recoleta, Obelisco o Caminito.

- WASD / flechas: movimiento. Disparo automático al zombi más cercano.
- Espacio: impulso e invulnerabilidad breve. E: ataque especial de área.
- C o botón de cámara: alternar vista cercana y amplia.
- P / Escape: pausa. Se pausa al perder foco.
- Celular: joystick y botones de especial e impulso.
- Sonido opcional desde el menú.

Esqueleto tiene más vida; Brujita es más rápida y dispara con mayor frecuencia. Hay zombis comunes, corredores y guardianes. Los corazones recuperan salud, los combos aumentan puntos y las mejoras entre oleadas se acumulan. Tras las oleadas 3 y 6 se cambia de distrito. Superar la 9 completa la partida.

## Personajes

Las fotos originales nuevas se muestran en selección y en el retrato de la partida. Los héroes del mundo usan recortes fotográficos generados a partir de esas referencias, con sus caras descubiertas y siempre visibles para la cámara. Son **sprites 2.5D dentro del entorno 3D**, no escaneos humanos volumétricos. El atlas recrea las caras; el retrato conserva la fotografía original. Ver [procedencia de imágenes](assets/CHARACTERS.md).

## Ciudad y fuentes

© [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL 1.0. Se descargaron mediante Overpass 934 contornos de edificios y 868 calles/senderos en tres radios de 300 metros. Los contornos y trazados tienen ubicación real. Alturas y anchos faltantes se estiman. Fachadas, luces, tumbas y monumentos son recreaciones de juego. **No es fotogrametría ni Google Maps 3D.** El pie del juego muestra atribución y un enlace al mapa del distrito.

Ver [fuentes, consultas, escala y límites](assets/maps/SOURCES.md). Los originales `*-raw.json` y su hash permiten auditar y regenerar los datos con `python3 scripts/prepare-maps.py`.

Se consultó la documentación oficial de [Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles). Usar ese servicio requiere un proyecto con facturación, Map Tiles API y API key, además de su atribución y condiciones de uso. Esta versión usa OSM local y no depende de Google.

## Desarrollo

Node.js 20+:

```sh
npm ci
npm run build
npm start
```

- `src/main.js`: juego, personajes, cámara y navegación por cuadrícula de flujo.
- `src/geography.js`: edificios y calles a partir de los datos reales.
- `src/shell.html` y `style.css`: interfaz.
- `assets/maps/`: cartografía y procedencia.
- `build.mjs`: integra bundle, fotos y datos en `index.html`.

Ejecutar build después de editar fuentes. El HTML generado se versiona para jugar sin herramientas ni servidor. Three.js conserva su licencia MIT en el bundle. Requiere WebGL; el rendimiento depende del dispositivo. Los datos geográficos y los sprites quedan incluidos; no hay descargas externas durante la partida.
