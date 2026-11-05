---
name: visual-direction
description: Define la dirección visual del portfolio de Joel y la convierte en tokens CSS. Úsala antes de maquetar, al elegir colores, tipografía o layout, y cuando la web parezca una plantilla. Complementa a frontend-design con las restricciones de este proyecto.
---

# Dirección visual

Carga antes `frontend-design:frontend-design`. El estilo lo decide Joel: no apliques uno sin su visto bueno.

## Proceso

1. Pide a Joel tres palabras sobre cómo quiere que se perciba la web y, si las tiene, una o dos referencias.
2. Propón tres direcciones claramente distintas. Cada una con:
   - Una frase que resuma el concepto, ligado a Joel y no a una moda.
   - Paleta: fondo, superficie, texto, texto secundario y un acento.
   - Tipografía: como máximo una fuente web, con fuentes del sistema de respaldo.
   - Idea de layout de la primera pantalla a 390 px y en escritorio.
   - Un elemento distintivo que se recuerde.
3. Cuando Joel elija, guarda la decisión en `docs/design-direction.md` y crea los tokens en `:root` de `css/styles.css`.
4. Usa siempre los tokens. Si necesitas un valor nuevo, añade un token en lugar de escribirlo suelto.

## Tokens mínimos

- Color: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-focus`.
- Tipografía: una escala fluida con `clamp()`, de `--text-sm` a `--text-display`.
- Espacio: una escala única, de `--space-1` a `--space-8`.
- Forma y movimiento: `--radius`, `--ease`, `--duration-fast`, `--duration-base`.

## Restricciones

- Contraste de al menos 4.5:1 en texto y 3:1 en texto grande y controles; compruébalo con los colores finales.
- Un solo color de acento, reservado para lo interactivo y lo importante.
- El foco de teclado debe verse siempre sobre cualquier fondo.
- Sin imágenes pesadas ni más de una fuente web.
- La estética de terminal queda fuera: Joel la descartó.

## Señales de plantilla

Si aparece alguna, replantea esa parte:

- Degradado azul o morado sobre fondo oscuro.
- Portada centrada con nombre, frase y dos botones, seguida de tres tarjetas iguales.
- Tarjetas de cristal, brillos sin función o emojis como iconos.
- Barras de porcentaje para las skills.
- Todas las secciones con la misma estructura y el mismo peso visual.

## Comprobación final

Tapa el nombre de Joel y pregúntate si la página podría ser de cualquiera. Si la respuesta es sí, falta el elemento distintivo. Después usa `design:design-critique` con capturas a 390 px y en escritorio.
