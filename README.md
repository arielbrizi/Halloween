# Delfi y Nahue · Noche Zombie

Aventura de supervivencia **en tercera o primera persona**, con Nahue y Delfi como protagonistas, sus fotos originales en pantalla y el otro personaje acompañándote por Buenos Aires.

## Jugar

Descargar `index.html` y abrirlo en un navegador con WebGL 2 y aceleración gráfica. Incluye código, modelos, texturas, fotos y cartografía: funciona **sin conexión**, sin cuentas ni API keys. El archivo es mayor que antes porque incluye los modelos animados y las superficies. La vista previa de archivos de un chat o gestor móvil puede no ejecutar juegos; abrirlo en el navegador o servir el proyecto con `npm start`.

El juego inicia en tercera persona para ver al protagonista elegido de cuerpo completo y en movimiento. **V** o el botón de cámara alternan con primera persona. La cámara evita atravesar paredes.

Elegir a **Nahue** o **Delfi** y un lugar: Recoleta, Obelisco o Caminito. El otro protagonista te acompaña, se mueve y ayuda con magia. La selección cambia vida, velocidad, arma y especial. Las dos caras originales permanecen en el HUD con sus nombres.

| Control | Acción |
| --- | --- |
| V / botón de cámara | Alternar tercera y primera persona |
| Mouse / arrastrar | Mirar y apuntar; captura de cursor con alternativa de arrastre |
| WASD | Moverse respecto de la mirada |
| Flechas izquierda/derecha | Girar sin mouse |
| Flechas arriba/abajo | Avanzar/retroceder |
| Clic izquierdo / X | Disparar; mantener para fuego continuo |
| Clic derecho | Afinar la puntería |
| R | Recargar energía; reserva ilimitada, cargador limitado |
| Shift | Correr, consume resistencia |
| Espacio | Saltar |
| Q | Impulso con recarga breve |
| E | Especial del protagonista |
| F | Encender/apagar linterna |
| C / Control | Agacharse |
| P / Escape | Pausa y continuar; Escape también libera el cursor |

**Celular:** joystick izquierdo; deslizar sobre la escena para mirar; botones de disparo, recarga, salto, especial e impulso. Admite dedos independientes para moverse, mirar y disparar simultáneamente. Hay asistencia leve de puntería en pantalla táctil.

**Gamepad estándar:** stick izquierdo para moverse, derecho para mirar, gatillo derecho para disparar, izquierdo para apuntar, stick izquierdo pulsado para correr, botón inferior para saltar, izquierdo para recargar, hombro izquierdo para especial, derecho para impulso y Start para pausar. La navegación de menús y reanudación se realiza con la interfaz. Probado con entradas de mando simuladas; no se verificó cada controlador físico.

## Combate y progresión

Disparo manual con raycast, impactos a la cabeza, cargadores, recarga, retroceso, destellos, trazas mágicas e indicadores de impacto. Las paredes bloquean los disparos. Los zombis tienen rigs 3D y clips diferentes para caminar, correr, atacar con anticipación, recibir golpes y morir. Los comunes, corredores y guardianes tienen estadísticas distintas. Usan navegación por zonas transitables y no atraviesan edificios.

El especial daña un área; el salto y el impulso ayudan a esquivar. Corazones recuperan vida. Los combos aumentan puntos. Cada oleada superada recupera vida y permite elegir una mejora acumulable. Tras las oleadas 3 y 6 cambia el distrito. Completar la 9 salva la ciudad.

## Presentación y alcance

Iluminación nocturna, linterna, luces de calle, superficies con texturas, relieve de detalle, niebla, lluvia y materiales físicos. Modo Alto: bloom, reflejos aproximados de entorno y tratamiento de imagen. Modo Rendimiento: evita el posprocesado. Auto empieza según el dispositivo y reduce el costo si detecta fotogramas lentos. No se promete una tasa de cuadros para todos los equipos.

Los brazos y armas en primera persona y los enemigos son 3D. El protagonista y el acompañante tienen cuerpos 3D articulados con texturas faciales basadas en las referencias; los retratos muestran sus caras originales. No es un escaneo de los niños ni una producción con equivalencia técnica o artística garantizada a PlayStation 4. Ver [personajes](assets/CHARACTERS.md).

Los escenarios usan 934 contornos de edificios y 868 calles/senderos de OpenStreetMap, con alturas faltantes estimadas y detalles recreados. No es Google Maps 3D ni fotogrametría. El mapa mantiene atribución y enlace a la zona real. Ver [cartografía](assets/maps/SOURCES.md) y [créditos y licencias](ASSET_CREDITS.md).

## Desarrollo

Node.js 20+:

```sh
npm ci
npm run build
npm start
```

`npm start` usa un servidor Node.js sin dependencias adicionales. Escucha en `0.0.0.0` y en el puerto de `PORT` (3000 cuando no está definido). No requiere Python. En un teléfono de la misma red, acceder al servidor desde la dirección del equipo; en una plataforma remota se debe exponer el puerto mediante esa plataforma. No abrir enlaces localhost desde otro dispositivo.

- `src/main.js`: partida, combate, equipo y progresión.
- `src/controls.js`: mouse, teclado, touch y gamepad.
- `src/actors.js`: modelos glTF, animaciones y cuerpos 3D articulados.
- `src/viewmodel.js`: brazos, armas y animaciones en primera persona.
- `src/presentation.js`: materiales, iluminación ambiental y posprocesado.
- `src/navigation.js`: colisiones y navegación.
- `src/geography.js`: generación de la ciudad desde datos reales.
- `src/audio.js`: efectos sintetizados.
- `src/shell.html` / `style.css`: interfaz.
- `build.mjs`: integra todo en `index.html`. No editar el HTML generado.

## Verificación

```sh
npm test
```

Pruebas con Playwright y Chromium: controles relativos, salto/carrera, recarga, raycast y obstrucción, poses de animación, anticipación de ataques, progresión de nueve oleadas, muerte/reinicio, identidad de ambos protagonistas, controles táctiles simultáneos y gamepad simulado. También prueban un render en modo Alto, ausencia de errores JavaScript y cero descargas de red al jugar.

El runner usa `/usr/bin/chromium` si está disponible. Alternativamente configurar `CHROMIUM_PATH` o instalar el Chromium de Playwright con `npx playwright install chromium`. Para guardar capturas: `TEST_ARTIFACTS_DIR=/tmp/capturas npm test`.

Las pruebas avanzan el tiempo de simulación de forma determinista para que el render por software del entorno no oculte fallos de lógica. No son una medición de FPS en un celular físico o una consola. Sus fixtures no se incorporan al HTML distribuido.

## Railway

El arranque es `npm start`, con Node.js 20 o posterior. `railway.json` define ese comando y el health check `/health`. El servidor usa automáticamente el `PORT` asignado por Railway; no fijar el puerto a 3000 en el comando del servicio. El HTML del juego ya está versionado, por lo que el arranque no requiere herramientas de compilación. Si se genera durante el build, instalar también las dependencias de desarrollo para ejecutar `npm run build`.

`npm run test:server` comprueba el arranque con `PORT` dinámico, sin Python ni un PATH de herramientas, desde otro directorio; también valida el HTML completo, gzip y la respuesta de salud.

### Controles en celular (vertical y horizontal)

Joystick izquierdo con zona muerta: al llevarlo a fondo hacia adelante se corre. El pulgar derecho puede mirar arrastrando el escenario **o manteniendo y arrastrando DISPARAR**; moverse, apuntar y disparar funcionan simultáneamente. Los botones se redistribuyen al girar el teléfono, respetan las áreas seguras y dejan libre el centro. El botón ⛶ activa pantalla completa cuando el navegador lo permite. Cambiar de aplicación pausa y suelta todos los controles. Auto/Rendimiento desactiva sombras dinámicas y postprocesado para reducir el trabajo de GPU. Alto sigue disponible manualmente.

Las fachadas incorporan detalles de fotografías reales de los tres barrios, junto con los volúmenes OSM y relieves 3D de cornisas/balcones. Créditos visibles en el menú y en [ASSET_CREDITS.md](ASSET_CREDITS.md). Son recreaciones con texturas fotográficas, no fotogrametría ni una equivalencia con PS4. La verificación móvil automatizada usa Chromium con pantalla táctil emulada; no mide FPS de un Samsung S25+ físico.

El cuerpo del protagonista ahora es volumétrico y tiene una orientación independiente de la cámara. En reposo, arrastrar orbita alrededor sin hacer girar al personaje. Al moverse gira hacia el desplazamiento; al disparar apunta hacia la mira. La cara fotográfica aparece en el frente de la cabeza al rodearlo, con pelo y vestuario detrás. El acompañante usa también un cuerpo 3D articulado. Estos modelos son estilizados y no son escaneos humanos.

El inicio ofrece tarjetas con fotos para elegir escenario y botones Auto / Alto / Fluido para gráficos; ambas selecciones tienen estado accesible y funcionan por teclado o toque.

Las intersecciones de cámara y disparos usan BVH (`three-mesh-bvh`) en las mallas grandes de la ciudad, construido al cargar cada distrito; evita recorrer todos los triángulos cada cuadro.

Los disparos usan haces con núcleo claro, halo de color, destello en el origen e impacto persistente durante 180 ms; funcionan sin bloom. Mira de alto contraste con expansión al disparar y confirmación de impacto. Android compatible ofrece vibración optativa de disparo/daño/especial; se puede apagar en el menú y se detiene al pausar. **Safari en iPhone no ofrece `navigator.vibrate`**: el botón no se muestra y el juego conserva respuesta visual/sonora. Pantalla completa se ofrece solo cuando el navegador la admite. Se respetan safe areas y altura dinámica del navegador, incluido el cambio de orientación. Los tests cubren también la ausencia de vibración y fullscreen; no sustituyen una prueba física en iPhone/Safari.

Actualización de personajes: **ambos** integrantes del equipo usan cuerpos volumétricos, articulaciones de hombros/codos/caderas/rodillas, calzado y vestuario 3D. No se usan planos fotográficos de cuerpo entero dentro de la partida. El acompañante gira hacia su desplazamiento y hacia los enemigos al atacar. Las caras usan texturas del atlas; los retratos del menú/HUD usan las fotos originales. Son modelos estilizados creados en código, no modelos humanos escaneados o animación capturada.
