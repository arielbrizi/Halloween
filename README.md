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

Los brazos y armas en primera persona y los enemigos son 3D. El protagonista en tercera persona y el acompañante son **fotográficos 2.5D con rig**, para conservar el parecido de las referencias; los retratos muestran sus caras originales. No es un escaneo de los niños ni una producción con equivalencia técnica o artística garantizada a PlayStation 4. Ver [personajes](assets/CHARACTERS.md).

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
- `src/actors.js`: modelos glTF, animaciones y rig fotográfico.
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
