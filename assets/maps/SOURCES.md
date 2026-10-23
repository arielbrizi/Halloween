# Fuentes geográficas

© OpenStreetMap contributors, datos bajo [ODbL 1.0](https://www.openstreetmap.org/copyright).

Descarga mediante [Overpass API](https://overpass-api.de/) el 23 de octubre de 2026. La fecha de base y SHA-256 del resultado original se conservan en cada JSON procesado. Los archivos `*-raw.json` guardan el resultado original para auditoría y regeneración; no se incluyen en el HTML del juego.

Centros y consultas (radio de 300 metros):

- Recoleta: -34.5881, -58.393.
- Obelisco: -34.603738, -58.38157.
- Caminito: -34.63925, -58.3629.

```overpass
[out:json][timeout:30];
(
  way["building"](around:300,LAT,LON);
  way["highway"](around:300,LAT,LON);
  way["landuse"](around:300,LAT,LON);
);
out tags geom;
```

Las posiciones y huellas de edificios provienen del mapa. Si no existe `height`, se usa `building:levels × 3.2` o una altura estimada. Se aplica una escala uniforme de 0.5 unidades de juego por metro. Ventanas, materiales, luces, vegetación, tumbas y monumentos son recreaciones para el juego, no fotogrametría. El Obelisco se recrea con su altura de 67.5 m. El plano local se proyecta en metros mediante aproximación equirectangular, adecuada a este radio; norte hacia -Z.

Se consultó [Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles): requiere cuenta de facturación, Map Tiles API y API key. Esta versión no consume ni descarga mosaicos de Google y no incluye sus imágenes. La cartografía OSM permanece local y funciona sin conexión.

Los anchos de calles también se estiman cuando OSM no informa `width`, usando el número de carriles o un valor por tipo de vía. Los avatares se agrandan respecto de la escala cartográfica para que sean legibles durante el combate. La colisión usa los contornos cartográficos y los obstáculos de juego; una cuadrícula de flujo guía a los enemigos por las zonas transitables.
