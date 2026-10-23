# Atribución y procedencia

## Zombis animados: Quaternius — Zombie Apocalypse Kit

- Autor: Quaternius (Tomás Laulhé).
- Página oficial: https://quaternius.com/packs/zombieapocalypsekit.html
- Licencia: Creative Commons CC0 1.0 Universal, https://creativecommons.org/publicdomain/zero/1.0/.
- Comprobación: la página oficial del paquete se consultó el 23 de octubre de 2026 y enlaza CC0; describe uso personal y comercial gratuito y formatos FBX, OBJ, glTF y Blend.
- Archivo local de licencia: `assets/models/LICENSE-Quaternius.txt`, conservado sin modificar. El texto de esta copia lleva el encabezado de otro paquete del mismo autor (Ultimate Platformer Pack); la licencia específica del Zombie Apocalypse Kit se contrastó además en su página oficial.
- Copia de distribución usada, fijada a commit: `https://github.com/hendri1202/zombie-game/tree/9d7fa346c70fcec88b01a1b88bba345d9c0065e6/public/assets/characters/zombies`. Se copiaron únicamente los dos activos CC0 y su aviso, no código ni lógica de ese juego. La página oficial enlaza la carpeta de publicación original: `https://drive.google.com/drive/folders/1mWP6sCHun7OUMHQeDNZLrXTteXlzWg_t`.

| Archivo | SHA-256 |
| --- | --- |
| `Zombie_Basic.gltf` | `c6eab64ef87f89cbd6862b59964b20024ca7e329d3d44f72c76fced6c24861c8` |
| `Zombie_Chubby.gltf` | `7c65bae6f0c5f7754ca177a7de7658fc0e4c8de7c8aff33a872d7ffff57a423c` |

Cada modelo incluye un rig y 16 clips. El juego usa Walk, Run_Arms, Idle_Attack, HitReact, Death e Idle mediante AnimationMixer. Los archivos se conservan sin editar; el juego ajusta escala y materiales al instanciar. Los corredores usan el modelo Basic, con velocidad y tinte distintos. El guardián usa Chubby. Estos son activos estilizados, no humanos fotorrealistas.

## Delfi y Nahue

Fotografías proporcionadas por el usuario y nombres indicados por él en este chat. Ver [procedencia de personajes](assets/CHARACTERS.md). Las dos fotos originales permanecen visibles en el HUD; el acompañante usa una recreación fotográfica con rig 2.5D. No se usaron fotografías de menores de fuentes públicas.

## Superficies

`assets/surfaces.png`: atlas generado con imagegen para este proyecto, con asfalto, piedra, ladrillos y baldosas. No procede de Google Maps ni de imágenes de terceros. Se usa como albedo y relieve de detalle aproximado; no es un juego de mapas PBR medidos. Las manos, varita, lanzador, partículas y audio sintetizado son creados por el código del proyecto.

## Cartografía

© OpenStreetMap contributors, ODbL 1.0. Ver [fuentes y consultas](assets/maps/SOURCES.md). El pie del juego mantiene la atribución y un enlace al distrito. El entorno recrea materiales, alturas faltantes y decoración; no es fotogrametría.

## Motor y bibliotecas

Three.js y sus módulos adicionales (GLTFLoader, SkeletonUtils, EffectComposer, UnrealBloomPass, RoomEnvironment y otros): licencia MIT, conservada en el bundle. esbuild (MIT) y Playwright (Apache 2.0) son herramientas de desarrollo, no descargas del juego en ejecución.
