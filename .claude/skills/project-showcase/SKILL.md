---
name: project-showcase
description: Diseña la presentación de los cuatro proyectos del portfolio y redacta sus fichas sin inventar datos. Úsala al trabajar la sección Projects, sus textos, imágenes, vídeos o demos.
---

# Presentación de proyectos

Los proyectos son UniMan, TellMotion, FinanzasApp y Snake. Cada uno debe contar algo distinto sobre Joel.

## 1. Ficha de hechos

Antes de escribir o maquetar, reúne en `docs/projects.md`, por proyecto:

- Qué problema resuelve y para quién.
- Qué hizo Joel exactamente, y si trabajó solo o en equipo.
- Tecnologías realmente usadas, comprobadas en su repositorio si Joel da acceso.
- Enlaces reales: repositorio y demo.
- Material visual disponible.
- Qué dice este proyecto de Joel que los otros no digan.

Lo que no se pueda confirmar queda como `TODO`. No deduzcas métricas, usuarios, resultados ni funciones. Si lees un repositorio, nada de claves, datos personales o archivos `.env` puede acabar en la web.

## 2. Contenido de cada proyecto

- Nombre y una frase que explique el problema, sin jerga.
- Lo que hizo Joel, con verbos concretos.
- Una decisión o dificultad interesante, si Joel la confirma.
- Tecnologías, como texto breve al final, no como protagonista.
- Una prueba visible: demo, vídeo o imagen.
- Enlaces solo si funcionan.

## 3. Maquetación

- Evita cuatro tarjetas idénticas: varía tamaño o composición según lo que cada proyecto pueda mostrar.
- Ordena por lo que más impresione al jurado, no por fecha.
- Cada proyecto lleva un id estable (`project-uniman`, `project-tellmotion`, `project-finanzasapp`, `project-snake`) para enlazarlo y para que otras funciones puedan apuntar a él.
- La sección debe entenderse sin abrir nada ni usar la función creativa.

## 4. Imágenes, vídeo y demos

- Imágenes en WebP o AVIF, idealmente por debajo de 200 KB, con `width`, `height`, `alt` útil y `loading="lazy"` si están fuera de la primera pantalla.
- Vídeo solo si aporta: silenciado, `playsinline`, con `poster`, sin cargarse hasta hacer falta, y que no se reproduzca solo con movimiento reducido.
- Una demo en vivo solo si funciona sin backend ni claves. Debe iniciarse a petición, poder cerrarse y no romper la página si falla.
- Si no hay demo, usa vídeo o capturas y dilo con naturalidad. Nunca dejes un botón "Demo" que no lleve a nada.

## 5. Comprobación

Pide a `requirements-auditor` que compare los textos con `docs/projects.md`, y prueba cada enlace y demo con `qa-tester`.
