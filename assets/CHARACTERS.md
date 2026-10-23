# Personajes y fotografías

- `esqueleto-rostro.jpg` y `brujita-rostro.jpg`: fotografías originales proporcionadas por el usuario en este chat. Se muestran en selección y retrato durante la partida, sin sustituir sus caras por dibujos.
- `heroes-photo.png`: atlas transparente generado con imagegen a partir de esas dos fotografías: niño con disfraz de esqueleto y cara descubierta a la izquierda; niña con vestido de bruja y varita a la derecha. Las caras en el atlas son una recreación generada basada en las referencias; no son píxeles idénticos a las fotos originales.
- Cada personaje jugable usa su mitad del atlas como sprite fotográfico orientado a la cámara, con profundidad y colisión dentro del escenario 3D. Es una técnica 2.5D, no un escaneo volumétrico ni un modelo humano fotorrealista animado.
- Los originales `esqueleto.jpg` y `brujita.jpg` conservan las primeras fotos de disfraces, por referencia. No se usan en el bundle actual.

No se enviaron las fotos a servicios de mapas. El juego incluye todas las imágenes localmente y no las sube al jugar.
