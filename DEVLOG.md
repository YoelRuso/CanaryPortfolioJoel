# Devlog

Registro del proyecto para el write-up del AWS Student Builder Challenge.

## 2026-11-05 — Preparación del entorno

**Qué se hizo:** Repositorio Git con Gitflow (`main`, `develop`), subagentes y skills del proyecto, atribución desactivada en la configuración y servidor estático local.

**Servicios de AWS y configuración:** Ninguno todavía. El despliegue será con Amplify Hosting.

**Retos y cómo se resolvieron:** La terminal interactiva prevista como función creativa se descartó por estar muy vista. La función creativa sigue pendiente.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Definió los requisitos, eligió Gitflow y descartó la terminal.

**En qué ayudó el agente de código:** Propuso y creó la estructura del entorno, y actualizó las instrucciones del proyecto.

## 2026-11-05 — Primera versión de la web

**Qué se hizo:** Web estática en HTML, CSS y JavaScript sin dependencias, con las tres secciones y el menú. El diseño es una carta náutica de Gran Canaria: el mapa de la portada enlaza con cada sección y el fondo se hace más profundo al bajar. La función creativa es "the pilot", un agente simulado con guion escrito que hace scroll, traza un rumbo hasta un elemento, lo marca y abre las notas de los proyectos.

**Servicios de AWS y configuración:** Ninguno todavía. El despliegue será con Amplify Hosting.

**Retos y cómo se resolvieron:**
- La primera isla generada parecía una flor por usar barrancos regulares. Se cambiaron por ruido irregular y un contorno menos circular.
- "tell me about AWS" llevaba a About por la palabra "about". Las palabras comunes ahora solo cuentan si no coincide nada más.
- En escritorio el panel tapaba contenido, así que la página se aparta mientras está abierto. En móvil es una hoja inferior.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Dio libertad de diseño para esta versión. El contenido sale de su perfil y sus repositorios de GitHub. Después aportó su historia personal, confirmó el nombre de UniMan (con contenido limitado por ser sensible) y su papel en Snake (gran parte del desarrollo y DevOps del equipo).

**En qué ayudó el agente de código:** Propuso el concepto y el diseño, generó el mapa con un script, escribió el código y los textos a partir de esas fuentes, y lo probó en el navegador.

## 2026-11-05 — Isla real en 3D y más movimiento

**Qué se hizo:** El mapa de la portada pasa a ser una maqueta en relieve hecha con capas apiladas en 3D con CSS: cinco de mar y siete de tierra, una cada 300 m, más nubes. Sube al cargar, se inclina hacia el ratón, se hunde al hacer scroll y tiene marea, nubes con su sombra y un barco recorriendo el rumbo. Las etiquetas flotan sobre palos. Debajo, cada sección tiene curvas de nivel reales que se mueven más despacio que el texto (parallax).

**Servicios de AWS y configuración:** La costa y el relieve salen de los Terrain Tiles del registro AWS Open Data (bucket público `elevation-tiles-prod`, sin cuenta ni coste). Se descargaron una vez con `tools/fetch-tiles.js` y se convirtieron en SVG con `tools/gen-layers.js`, así que la web no depende de ese servicio. El hosting sigue siendo Amplify.

**Retos y cómo se resolvieron:**
- Las teselas de zoom 11 traen el mar plano a 0 m y las de zoom 8 son demasiado bastas cerca de la costa. La profundidad del mar se estiliza según la distancia a la costa real, y el pie de página lo dice.
- Las etiquetas dentro del espacio 3D se veían borrosas y quedaban bajo las nubes. Se dibujan en 2D encima, en la posición proyectada de unos puntos ancla 3D.
- La sombra de las nubes flotaba sobre el mar. Se recorta con la forma de la isla mediante una máscara.
- Con `prefers-reduced-motion` la maqueta queda quieta en su pose de reposo y no hay parallax.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Pidió más movimiento, capas con profundidad y una isla más fiel.

**En qué ayudó el agente de código:** Buscó la fuente de datos, escribió los scripts de descarga y generación, y montó y probó el 3D y el parallax.

## 2026-11-05 — La isla viaja por toda la web y el piloto la pilota

**Qué se hizo:**
- La isla 3D pasa a estar fija detrás de toda la página. Al hacer scroll, la cámara vuela de puerto en puerto: la isla entera en la portada, Puerto de la Luz para About, Agaete para Skills y Mogán para Projects. Ahí cada proyecto es una boya en el mapa.
- El mar se oscurece al bajar y las secciones son paneles de carta que flotan delante.
- El piloto ya no dibuja una línea: su barco navega por la ruta 3D, la cámara lo sigue y la página atraca en la sección.
- El piloto tiene personaje: la bandera H del código internacional ("llevo práctico a bordo"), respuestas que se escriben poco a poco y variadas, saludo según la hora y preguntas sobre la isla (cumbre, Teide, nubes, de dónde salen los datos).

**Servicios de AWS y configuración:** Sin cambios. Datos de relieve de AWS Open Data, hosting en Amplify (pendiente).

**Retos y cómo se resolvieron:**
- Las etiquetas de la isla deben verse solo en su sección. Cada pose de cámara dice qué etiquetas muestra, y la opacidad se mezcla con el scroll.
- El bucle de animación solo corre mientras algo se mueve (scroll, ratón, barco), para no gastar batería.
- En móvil, el piloto primero enseña la isla y luego baja hasta el texto.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Valoró la web completa, eligió "isla que viaja" para el 3D y un piloto que pilote la isla y tenga más personaje.

**En qué ayudó el agente de código:** Revisó la página, propuso las opciones e implementó la escena, la cámara y el nuevo piloto.

## 2026-11-05 — Nitidez de las capas y barco siempre visible

**Qué se hizo:**
- Las capas 3D se maquetan más grandes de lo que se ven (factor `--Q`) y la cámara las reduce. Así el navegador las rasteriza con más detalle y no se pixelan al acercar. El factor baja en retina y en móvil para no agotar la memoria de la GPU.
- El barco del piloto se dibuja en 2D por encima de todo, en la posición proyectada de la ruta 3D. Lleva la bandera H y deja una estela dibujada en el propio mapa.
- Durante la travesía, el contenido de la página se desvanece, la cámara encuadra el barco en la zona libre y en móvil la hoja del piloto se recoge.

**Retos y cómo se resolvieron:**
- El barco quedaba tapado por la tierra, las nubes y los paneles. Se separó en una capa 2D superior.
- Si el navegador deja de dibujar (pestaña en segundo plano), la travesía se cierra sola por tiempo, para que la página nunca se quede oculta.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Detectó la baja calidad de las capas y que el barco quedaba tapado.

**En qué ayudó el agente de código:** Diagnosticó la causa (rasterizado a baja escala) e implementó las soluciones.

## 2026-11-05 — Parpadeo de la escena 3D

**Qué se hizo:** Se quitaron la animación de los guiones de la ruta, la "marea" (escalado de las capas de mar), la sombra animada de las nubes (que iba dentro de una máscara) y el desenfoque de fondo (`backdrop-filter`) de paneles y cabecera. Las capas llevan `will-change: transform`, y el factor de nitidez en escritorio baja de 2,4 a 2.

**Retos y cómo se resolvieron:** Las capas, más grandes desde el cambio de nitidez, se volvían a dibujar en cada fotograma por esas animaciones. Al quedarse corta la memoria gráfica, el navegador las redibujaba por trozos y se veía parpadeo. Ahora cada capa se rasteriza una vez y la cámara solo la mueve.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Detectó el parpadeo al mover el ratón y en reposo.

**En qué ayudó el agente de código:** Identificó las animaciones que forzaban el redibujado y las sustituyó.

## 2026-11-05 — Optimización y ajustes visuales

**Qué se hizo:**
- Cada capa SVG se recorta a la caja que ocupa su contenido (el generador guarda las cajas en `assets/chart/layers.json`). La memoria gráfica de la escena pasa de ~123 MB a ~50 MB en una pantalla de 1280 px.
- En cada fotograma se leen primero todas las posiciones y después se escribe: de ~1,8 ms a ~0,6 ms por fotograma en las etiquetas.
- La isla aparece con un fundido cuando todas las capas están decodificadas, y entonces sube.
- El tinte de aguas profundas es un degradado desde abajo: la isla conserva su color en Projects.
- Nuevo encuadre de Projects: la isla queda en la mitad superior, con las cuatro boyas visibles.
- Paredes de los niveles más finas y claras, y nubes apartadas de los tres puertos.

**Retos y cómo se resolvieron:** El navegador rasteriza la caja completa de cada capa aunque sea transparente. Las capas altas ocupaban menos del 2 % de su cuadrado, así que recortarlas era la mayor ganancia.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Pidió el análisis y aprobó el paquete de mejoras.

**En qué ayudó el agente de código:** Midió (peso, memoria gráfica, coste por fotograma), propuso mejoras priorizadas y las aplicó.

## 2026-11-05 — CI/CD con GitHub Actions y despliegue en Amplify por OIDC

**Qué se hizo:** Workflow `.github/workflows/ci-cd.yml`. En cada push y pull request ejecuta los tests: sintaxis de JavaScript con `node --check` y HTML válido con `html-validate`. En `main`, si los tests pasan, empaqueta solo la web y la despliega en Amplify con la CLI de AWS (`create-deployment`, subida del zip, `start-deployment` y espera a `get-job`). Guía de configuración en `docs/aws-deploy.md`.

**Servicios de AWS y configuración:** Amplify Hosting como app sin Git conectado (despliegues manuales que lanza Actions). IAM con un proveedor OIDC de GitHub y un rol que solo puede asumir el entorno `production` de este repo, con permiso únicamente para desplegar la rama `main` de esta app. No hay claves de AWS en GitHub.

**Retos y cómo se resolvieron:**
- `html-validate` detectó `<p>` dentro de `<summary>`, que no está permitido. Se cambió por `<span>`.
- Los estilos en línea que marcaba son variables de posición de las capas (datos, no estilo), así que esa regla se desactivó en `.htmlvalidate.json`.
- Con el despliegue desde Actions, `amplify.yml` dejó de hacer falta y se eliminó.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Pidió usar GitHub Actions para los tests y el despliegue, eligió OIDC y el nombre del repo. Configura AWS y las variables del repo siguiendo la guía.

**En qué ayudó el agente de código:** Escribió el workflow, la guía con las políticas IAM de mínimo privilegio y corrigió el HTML.

## Capturas pendientes

- [ ] Web en escritorio
- [ ] Web en móvil
- [ ] Función creativa en uso
- [ ] Panel de Amplify
- [ ] Build y deploy en Amplify
- [ ] Workflow de GitHub Actions en verde (tests y despliegue)
- [ ] Rol IAM con la política de confianza OIDC
- [ ] Repositorio de GitHub
