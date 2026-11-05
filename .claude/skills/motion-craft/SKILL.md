---
name: motion-craft
description: Guía las animaciones y microinteracciones del portfolio con CSS y JavaScript vanilla. Úsala al añadir transiciones, efectos de scroll, estados hover o focus, o cualquier movimiento en la web.
---

# Movimiento

Cada animación debe explicar algo: de dónde viene un elemento, qué ha cambiado o qué se puede hacer. Si no aporta nada de eso, quítala.

## Valores

Usa los tokens definidos en `/visual-direction`:

| Uso | Duración |
|---|---|
| Hover, focus, pulsación | 100–200 ms |
| Paneles y cambios de estado | 200–350 ms |
| Un único momento destacado | hasta 800 ms |

- Entradas con desaceleración (`ease-out`) y salidas algo más rápidas que las entradas.
- Desplazamientos pequeños: de 8 a 24 px suelen bastar.

## Implementación

- Primero CSS: `transition`, `@keyframes` y `animation`. JavaScript solo para coordinar estados, cambiando clases o atributos.
- Sin librerías de animación.
- Anima solo `transform` y `opacity`, y evita animar propiedades que recalculan el layout.
- Usa `IntersectionObserver` para animar al entrar en pantalla, una sola vez.
- Reserva el espacio de los elementos para que no se mueva el contenido.

## Accesibilidad

Parte de una versión sin movimiento y añádelo solo si el usuario no pide lo contrario:

```css
@media (prefers-reduced-motion: no-preference) {
  /* animaciones */
}
```

- Con movimiento reducido, los cambios siguen ocurriendo, pero sin desplazamientos; usa un cambio instantáneo o un fundido muy breve.
- El contenido debe verse sin JavaScript y aunque una animación no llegue a dispararse.
- Nada debe parpadear más de tres veces por segundo.
- Lo que dure más de 5 segundos debe poder pausarse.

## Qué evitar

- Secuestrar el scroll o cambiar su velocidad.
- Cursores personalizados imprescindibles o efectos que solo funcionen con hover, porque en móvil no existen.
- Hacer esperar al visitante: nada de pantallas de carga decorativas.
- Animar a la vez todos los elementos de la página.
- Más de un momento espectacular: si todo destaca, no destaca nada.

## Comprobación

Prueba a 390 px con la CPU limitada a 4x en las herramientas del navegador, y repite con movimiento reducido activado. Si algo va a tirones, simplifícalo.
