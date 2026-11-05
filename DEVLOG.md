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

**Qué se aprendió:** Que existe el registro AWS Open Data: datos de elevación de todo el planeta (Terrain Tiles), libres y listos para usar en un proyecto. (Joel)

**Qué hizo Joel:** Pidió más movimiento, capas con profundidad y una isla más fiel.

**En qué ayudó el agente de código:** Buscó la fuente de datos, escribió los scripts de descarga y generación, y montó y probó el 3D y el parallax.

## 2026-11-05 — La isla viaja por toda la web y el piloto la pilota

**Qué se hizo:**
- La isla 3D pasa a estar fija detrás de toda la página. Al hacer scroll, la cámara vuela de puerto en puerto: la isla entera en la portada, Puerto de la Luz para About, Agaete para Skills y Mogán para Projects. Ahí cada proyecto es una boya en el mapa.
- El mar se oscurece al bajar y las secciones son paneles de carta que flotan delante.
- El piloto ya no dibuja una línea: su barco navega por la ruta 3D, la cámara lo sigue y la página atraca en la sección.
- El piloto tiene personaje: la bandera H del código internacional ("llevo práctico a bordo"), respuestas que se escriben poco a poco y variadas, saludo según la hora y preguntas sobre la isla (cumbre, Teide, nubes, de dónde salen los datos).

**Servicios de AWS y configuración:** Sin cambios. Datos de relieve de AWS Open Data, hosting en Amplify (desplegado después, ver hito de CI/CD).

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

**Qué se aprendió:** Que en 3D la optimización de la web y de los recursos es importante desde el principio: cada capa, animación e imagen tiene un coste. (Joel)

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

**Qué se aprendió:** Que en 3D la optimización de la web y de los recursos es importante desde el principio: cada capa, animación e imagen tiene un coste. (Joel)

**Qué hizo Joel:** Pidió el análisis y aprobó el paquete de mejoras.

**En qué ayudó el agente de código:** Midió (peso, memoria gráfica, coste por fotograma), propuso mejoras priorizadas y las aplicó.

## 2026-11-05 — CI/CD con GitHub Actions y despliegue en Amplify por OIDC

**Qué se hizo:** Workflow `.github/workflows/ci-cd.yml`. En cada push y pull request ejecuta los tests: sintaxis de JavaScript con `node --check` y HTML válido con `html-validate`. En `main`, si los tests pasan, empaqueta solo la web y la despliega en Amplify con la CLI de AWS (`create-deployment`, subida del zip, `start-deployment` y espera a `get-job`). Guía de configuración en `docs/aws-deploy.md`.

**Servicios de AWS y configuración:** Amplify Hosting como app sin Git conectado (despliegues manuales que lanza Actions). IAM con un proveedor OIDC de GitHub y un rol que solo puede asumir el entorno `production` de este repo, con permiso únicamente para desplegar la rama `main` de esta app. No hay claves de AWS en GitHub.

**Retos y cómo se resolvieron:**
- `html-validate` detectó `<p>` dentro de `<summary>`, que no está permitido. Se cambió por `<span>`.
- Los estilos en línea que marcaba son variables de posición de las capas (datos, no estilo), así que esa regla se desactivó en `.htmlvalidate.json`.
- Con el despliegue desde Actions, `amplify.yml` dejó de hacer falta y se eliminó.
- Primer despliegue: `Not authorized to perform sts:AssumeRoleWithWebIdentity`. El repo usa el formato nuevo del claim `sub` de GitHub, con IDs numéricos (`repo:YoelRuso@116205447/CanaryPortfolioJoel@1447465204:environment:production`), y la política de confianza solo tenía el formato clásico. Se vio con `gh api repos/.../actions/oidc/customization/sub` y se aceptaron los dos formatos.
- Segundo: `AccessDenied` en `amplify:CreateDeployment`. Esa acción actúa sobre `branches/main/deployments/*`, que faltaba en la política de permisos. Se añadió ese recurso, sin ampliar nada más.
- Resultado: el workflow pasa tests y despliega en ~40 s. Web en vivo en https://main.d1zb8l9pcqy7u2.amplifyapp.com (Amplify en eu-north-1, Estocolmo).

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Pidió usar GitHub Actions para los tests y el despliegue, eligió OIDC y el nombre del repo. Configura AWS y las variables del repo siguiendo la guía.

**En qué ayudó el agente de código:** Escribió el workflow, la guía con las políticas IAM de mínimo privilegio y corrigió el HTML.

## 2026-11-05 — Sonido del mar, bocina y campana

**Qué se hizo:** Sonido generado en el navegador con la Web Audio API, sin archivos de audio. Hay olas tranquilas de fondo (olas sueltas a intervalos irregulares, con espuma suave) y la bocina del barco al zarpar. Está apagado por defecto: se activa con el botón del altavoz de la cabecera, se recuerda la elección y se silencia al cambiar de pestaña. El piloto también responde si le preguntan por el sonido.

**Servicios de AWS y configuración:** Sin cambios.

**Retos y cómo se resolvieron:** Los navegadores no dejan reproducir audio sin un clic del usuario. Si el visitante lo dejó activado, el sonido vuelve con su primer clic o tecla en la página. La escena avisa de la salida y la llegada con eventos (`island:depart` e `island:arrive`), así el sonido queda en un archivo aparte. En móvil, el botón nuevo desbordaba la cabecera 16 px, y se ajustaron los espacios.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Propuso añadir el sonido del oleaje, el embarque y el desembarque. Tras escucharlo pidió olas más tranquilas y una bocina más realista, y quitar las campanas y el sonido de la travesía, que sumado a las olas sonaba a que estas subían de golpe.

**En qué ayudó el agente de código:** Diseñó los sonidos con Web Audio, el botón accesible y su integración con la escena y el piloto.

## 2026-11-05 — La ruta del barco ya no cruza tierra

**Qué se hizo:** El tramo de About (Puerto de la Luz) a Skills (Agaete) pasaba por encima de La Isleta y de la esquina noroeste de la isla. Ahora rodea La Isleta por el este y por el norte, y sigue la costa norte por el mar.

**Servicios de AWS y configuración:** Sin cambios.

**Retos y cómo se resolvieron:** Para no fiarse de la vista se escribió un test pequeño: muestrea la curva de la ruta y comprueba cada punto contra el contorno real de la costa (`land-1.svg`). La ruta antigua tenía 13 puntos sobre tierra. La nueva tiene 0, y su punto más cercano queda a 35 unidades de la costa (unos 2,6 km), para que tampoco parezca tocarla con la perspectiva 3D.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Se dio cuenta de que el barco atravesaba la isla.

**En qué ayudó el agente de código:** Comprobó el fallo con datos, trazó la ruta nueva y verificó que va por mar.

## 2026-11-05 — Gaviotas y peces

**Qué se hizo:** Detalles de vida en la isla, solo con CSS y SVG:
- Cuatro gaviotas, con el mismo trazo fino de la carta, que planean en círculos sobre los puertos y aletean de vez en cuando.
- Cada 6–12 s, un pez salta en algún punto del mar abierto (sobre la ruta del barco, que siempre es mar) y deja un anillo de agua al salir y otro al caer.

Todo va dentro de la escena 3D, así que se mueve con la cámara. Con "reducir movimiento" nada se mueve y no salta ningún pez.

**Servicios de AWS y configuración:** Sin cambios.

**Retos y cómo se resolvieron:**
- Tumbadas sobre el plano del mapa, la inclinación de la cámara aplanaba las gaviotas hasta parecer puntos. Ahora contrarrestan su giro y se ponen "de pie" hacia la cámara, así que siempre se leen como una gaviota.
- Volaban demasiado altas y quedaban lejos de los puertos. Se bajaron a la mitad.
- Los anillos blancos no se veían sobre el mar claro, y se pasaron a azul agua.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Propuso añadir pájaros y peces sin ensuciar la pantalla.

**En qué ayudó el agente de código:** Diseñó las animaciones, las integró en la escena 3D y ajustó tamaños tras revisarlas en el navegador.

## 2026-11-05 — Delfines, faro de Maspalomas y modo noche

**Qué se hizo:**
- **Delfines:** cuando el barco zarpa, una pareja salta junto a él en su misma dirección, dos veces en las travesías largas. La escena expone la posición y el rumbo del barco (`islandScene.boat()`).
- **Faro de Maspalomas:** en su posición real (27,7353 N, 15,5986 O), comprobada contra la costa del mapa. Es una torre pequeña con el destello magenta de las cartas náuticas y una luz que parpadea cada 5 s.
- **Modo noche:** la escena pasa a luz de luna y el faro brilla. Al principio se activaba solo entre las 20:00 y las 07:00 de la hora del visitante. Joel prefirió que la web se vea siempre de día y que la noche se ponga a mano, con el botón de luna de la cabecera o pidiéndoselo al piloto ("night" / "day"). La elección se recuerda.

**Servicios de AWS y configuración:** Sin cambios.

**Retos y cómo se resolvieron:**
- Un tinte azul por multiplicación volvía verde oliva la tierra amarilla. Se añadió antes una capa de mezcla `saturation` que quita casi todo el color, y así queda gris azulado, como a la luz de la luna.
- El tinte nocturno también apagaba la luz del faro. Su resplandor se dibuja en 2D por encima del tinte, anclado a la punta de la torre, igual que el barco.
- El texto de la portada se pasa a tinta oscura de noche para mantener el contraste.
- Con el botón nuevo, la cabecera del móvil no cabía. Se redujeron un poco el texto y los márgenes del menú.

**Qué se aprendió:** TODO (Joel)

**Qué hizo Joel:** Pidió seguir con las ideas extra.

**En qué ayudó el agente de código:** Las implementó y las comprobó en el navegador de día y de noche.

