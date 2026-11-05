---
name: submission-check
description: Comprueba si el portfolio está listo para la inscripción del hackathon, repasando requisitos, contenido y pruebas en navegador. Úsala antes de cerrar una release y antes de publicar el proyecto.
---

# Comprobación de la inscripción

1. Lanza los subagentes `requirements-auditor` y `qa-tester`. A `qa-tester` indícale la URL de Amplify si ya existe; si no, la web local.
2. Une los resultados en una sola tabla con los seis requisitos de `CLAUDE.md`: requisito, estado y evidencia.
3. Añade una lista de lo que debe hacer Joel, como la configuración de Amplify, las capturas y la publicación en "Tu proyecto". Nada de eso se marca como hecho sin confirmación suya.
4. Ordena los bloqueantes según la rúbrica y el tiempo que quede hasta el cierre: 6 nov 2026, 23:59 PT (7 nov, 07:59 en Canarias).
5. Termina con un veredicto claro: LISTO o NO LISTO, con el motivo.

No corrijas nada en este paso. Pregunta a Joel qué bloqueante resolver primero.
