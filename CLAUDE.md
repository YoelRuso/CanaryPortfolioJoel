# Portfolio de Joel Morera Apaza — AWS Student Builder Challenge

Portfolio personal para el hackathon **AWS Student Builder Challenge: Build Your Tech Superpower**.
Se despliega con **AWS Amplify Hosting** y el código vive en un repo de GitHub.

## Plazo (crítico)
- Cierre: **6 nov 2026, 23:59 PT** (= 7 nov 07:59 en Canarias).
- La web debe seguir online y accesible hasta el **23 nov 2026** (fin del periodo de evaluación).
- Prioridad absoluta: algo completo y funcionando antes que algo ambicioso a medias.

## Requisitos de la inscripción (pass/fail, no se puede omitir ninguno)
1. Web pública alojada en AWS (Amplify Hosting) con URL en vivo.
2. Enlace al repositorio de GitHub.
3. Tres secciones, accesibles y fáciles de navegar:
   - About Me (historia personal)
   - Skills / Tech Superpowers
   - Projects / Achievements (los proyectos de aprendizaje cuentan)
4. **Una función creativa** que refleje a Joel: interactiva, que funcione, con una **pista visible** para descubrirla, y que **no estorbe la navegación**.
5. Proyecto publicado en "Tu proyecto" del hackathon: descripción de la función creativa, capturas de la web y de la configuración en AWS, servicios AWS usados, aprendizajes y retos.
6. Web original, no publicada antes.

## Rúbrica (para decidir en qué invertir el tiempo)
- Creatividad y memorabilidad: 30 %
- Implementación funcional en AWS (carga, enlaces, uso de AWS documentado): 25 %
- Calidad de la comunicación (write-up, capturas): 25 %
- Completitud y usabilidad (3 secciones, navegación, desktop y móvil): 20 %

## Stack y decisiones técnicas
- **HTML + CSS + JavaScript vanilla, sin paso de build** y sin dependencias de npm salvo que sea imprescindible. Amplify sirve sitios estáticos directamente.
- Sin backend, base de datos, login ni formularios de contacto (opcional y fuera de alcance por tiempo).
- No añadir servicios AWS más allá de Amplify Hosting salvo petición explícita (evitar costes).
- Nunca commitear credenciales, claves de AWS ni datos personales sensibles. No tocar configuración de la cuenta de AWS desde el agente: eso lo hace Joel.
- Responsive: debe verse y usarse bien en móvil (390 px) y escritorio.
- Accesible: HTML semántico, contraste suficiente, navegación por teclado, `alt` en imágenes, `prefers-reduced-motion` respetado.
- Rendimiento: sin imágenes pesadas, fuentes del sistema o una sola fuente web.

## Función creativa (por defecto, confirmar con Joel)
Terminal interactiva en el navegador donde el visitante escribe comandos para explorar el portfolio
(`help`, `about`, `skills`, `projects`, `contact`, `clear`, y algún comando secreto/easter egg).
Reglas de diseño:
- Pista visible y permanente (por ejemplo un botón o texto "pulsa `~` o haz clic aquí para abrir la terminal").
- Cerrada por defecto; se abre como panel/overlay que se puede cerrar con `Esc` y con un botón.
- La web debe ser completamente navegable sin usar la terminal.
- Funciona con teclado en escritorio y con el teclado táctil en móvil.

## Contenido (a completar con Joel — no inventar datos)
- Idioma del sitio: inglés (los jueces son de AWS); cambiar a español si Joel lo prefiere.
- Sobre mí: estudiante de último curso de Ingeniería Informática (ULPGC, Las Palmas de Gran Canaria).
- Skills: _[Joel indica la lista]_
- Proyectos (3–4): _[Joel indica nombre, descripción de una frase, tecnologías y enlace si existe]_
- Estilo visual: _[oscuro/minimalista/retro-terminal — Joel decide]_
- No inventar logros, empleos, métricas ni enlaces. Si falta un dato, dejar un `TODO` visible y avisar.

## Flujo de trabajo
1. Estructura base: `index.html`, `css/styles.css`, `js/main.js`, `js/terminal.js`, `assets/`.
2. Construir las tres secciones y la navegación primero; la función creativa después.
3. Probar en local (servidor estático simple) en móvil y escritorio antes de cada despliegue.
4. Commits pequeños y con mensajes claros; Amplify despliega desde la rama `main`.
5. Antes de dar algo por terminado, revisar el checklist de requisitos de arriba.

## Registro para el write-up (importante: 25 % de la nota)
Mantener un archivo `DEVLOG.md` y actualizarlo tras cada hito con:
- Qué se hizo y qué servicios de AWS se usaron (y cómo se configuraron).
- Retos encontrados y cómo se resolvieron.
- Qué se aprendió.
- Qué hizo Joel y en qué ayudó el agente de código (usar IA está permitido; documentarlo en el proyecto).
- Lista de capturas pendientes (web en móvil y escritorio, panel de Amplify, build/deploy, repo).

## Estilo de trabajo con el agente
- Responder en español, de forma breve y directa.
- Antes de crear o cambiar muchos archivos, resumir el plan en 3–5 líneas.
- Explicar los cambios de forma que Joel pueda entender y arreglar el despliegue si falla.
- No hacer cambios fuera del alcance pedido ni añadir funcionalidades no solicitadas.
