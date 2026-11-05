---
name: devlog
description: Registra un hito del proyecto en DEVLOG.md con el formato que pide el write-up del hackathon. Úsala después de cada hito, de cada release o de resolver un problema de despliegue.
---

# Registrar un hito

1. Reúne los hechos: ejecuta `git log --oneline -15` y repasa lo ocurrido en la conversación desde la última entrada de `DEVLOG.md`.
2. Pregunta a Joel solo lo que no se pueda saber de otra forma, como qué aprendió o qué configuró en AWS.
3. Pasa esos hechos al subagente `devlog-writer` para que añada una entrada con este formato:

```markdown
## AAAA-MM-DD — Título del hito

**Qué se hizo:**
**Servicios de AWS y configuración:**
**Retos y cómo se resolvieron:**
**Qué se aprendió:**
**Qué hizo Joel:**
**En qué ayudó el agente de código:**
```

4. Actualiza la lista de capturas pendientes.

Deja `TODO` en lo que no esté confirmado. Nunca presentes a Claude como autor o coautor.
