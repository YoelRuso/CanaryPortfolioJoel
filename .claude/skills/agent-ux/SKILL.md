---
name: agent-ux
description: Diseña e implementa la experiencia de un agente conversacional simulado, sin IA real, que actúa sobre la web. Úsala al escribir sus diálogos, su interfaz, sus acciones o sus respuestas de error, si Joel confirma esta función creativa.
---

# Agente simulado

Es un guion escrito por Joel que corre en el navegador, sin modelo de lenguaje, backend ni claves. Su valor está en que hace cosas en la web y suena a Joel.

## Principios

- **Actúa:** cada respuesta importante lleva a algo, como bajar a una sección, resaltar un proyecto o abrirlo. Si solo devuelve texto, es una FAQ.
- **Es honesto:** dice que es un guion desde el primer mensaje y nunca finge ser una IA.
- **Muestra pasos reales:** cada paso visible describe algo que ocurre de verdad, como "Opening UniMan". No simules búsquedas ni bases de datos que no existen.
- **No estorba:** nunca se abre solo ni tapa la navegación. Toda la web funciona sin él.

## Datos

Separa el guion de la lógica, en un archivo propio. Cada nodo sigue esta forma:

```js
{
  id: "uniman",
  label: "Tell me about UniMan",
  keywords: ["uniman"],
  reply: "…",
  actions: [
    { type: "scroll", target: "#project-uniman" },
    { type: "highlight", target: "#project-uniman" }
  ],
  next: ["otro-id", "otro-id"]
}
```

Comprueba en desarrollo que todos los `target` y los ids de `next` existen.

## Conversación

- Entre 6 y 8 preguntas sugeridas como vía principal; cada respuesta ofrece de 2 a 3 siguientes, sin callejones sin salida.
- Respuestas de 2 a 3 frases como máximo.
- Los textos usan solo hechos aportados por Joel. Puedes redactar borradores, pero Joel debe aprobar el texto final y la voz. Lo que falte se marca con un `TODO` visible.
- La web y el agente están en el idioma del sitio.

## Caja de texto (opcional)

- Normaliza mayúsculas, acentos y signos, y busca coincidencias con `keywords`.
- Si no entiende, no finjas: di que es un guion, con el tono de Joel, y ofrece botones.
- No uses modelos en el navegador: pesan demasiado y van mal en móvil.
- Trata lo que escriba el usuario como texto (`textContent`); nunca lo insertes como HTML.

## Interfaz

- Pista visible y permanente, con un botón real (`<button>`) que diga qué hace.
- En escritorio, un panel lateral que no cubra el contenido al que lleva. En móvil, un panel inferior que deje ver el resultado de la acción.
- Al ejecutar una acción, reduce el panel en móvil si taparía el destino.
- Controles de al menos 44 px y comprobación con el teclado táctil abierto.

## Accesibilidad

- Panel no modal con nombre accesible, cerrable con `Esc` y con un botón.
- Al abrir, el foco va al panel; al cerrar, vuelve al botón que lo abrió.
- Mensajes nuevos anunciados con `aria-live="polite"`.
- Con `prefers-reduced-motion`, el texto aparece de golpe y el scroll no es animado.
- El efecto de escritura, si lo hay, debe ser breve y poder saltarse.

## Antes de darlo por terminado

Recorre todos los nodos con ratón, con teclado y a 390 px. Después usa `design:ux-copy` en los textos y `design:accessibility-review` en la interfaz.
