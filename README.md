# Noche Zombie · Buenos Aires 3D

Juego de supervivencia 3D con Three.js/WebGL. Personajes inspirados en las fotos, ciudad modelada con geometría original, iluminación, sombras, niebla y cámara que sigue al jugador.

## Jugar

Descargar `index.html` y abrirlo en un navegador moderno con WebGL. El archivo incluye el motor, las fotos, los estilos y el juego: funciona sin conexión. También se puede servir con `npm start` (puerto 3000). No necesita cuentas ni claves.

- WASD / flechas: movimiento.
- Los ataques apuntan y disparan automáticamente al enemigo más cercano.
- Espacio: impulso, con 2,4 segundos de recarga e invulnerabilidad breve.
- E: especial de área (explosión de huesos o tormenta de magia).
- P / Escape: pausa. Se pausa al perder el foco.
- Celular: joystick izquierdo, botones de especial e impulso a la derecha.
- Sonido sintetizado opcional, activable desde el menú.

Esqueleto tiene más vida; Brujita es más rápida y dispara con mayor frecuencia. Hay zombis comunes, corredores y guardianes con más vida y daño. Recoger corazones recupera salud. Los combos aumentan puntos. Al superar una oleada se recupera vida y se elige una mejora acumulable. Tras las oleadas 3 y 6 se cambia de distrito: Recoleta, Obelisco y Caminito. Superar la oleada 9 completa la partida.

## Desarrollo

Node.js 20+.

```sh
npm ci
npm run build
npm start
```

`src/main.js`: escena y juego. `src/shell.html`: interfaz. `style.css`: estilos. `build.mjs`: integra el bundle y las imágenes en `index.html`. **Ejecutar build después de editar las fuentes**. `index.html` se versiona para poder jugar sin herramientas de desarrollo. No editar el HTML generado. Las fotografías están en `assets/` y Three.js conserva su aviso de licencia MIT en el bundle.

La ciudad es una interpretación estilizada de los lugares, no una reconstrucción geográfica. Requiere aceleración WebGL; el rendimiento depende del dispositivo. El límite de resolución del render y la geometría sencilla reducen el costo en celulares.
