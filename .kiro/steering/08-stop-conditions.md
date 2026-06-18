---
inclusion: always
---

# Stop Conditions & Budget Caps

Define límites claros que previenen loops infinitos y consumo excesivo de recursos por parte de agentes.

## Límites de Ejecución

| Límite | Umbral | Acción al exceder |
|--------|--------|-------------------|
| Max tool calls por tarea | 50 | Pausar y reportar al usuario |
| Max errores consecutivos del mismo tipo | 3 | Cambiar estrategia o escalar |
| Max reintentos por tool call individual | 2 | Fallar con diagnóstico claro |
| Acciones sin resultado nuevo | 10 | Pausar y evaluar progreso |
| Contexto del window estimado | 80% | Compactar o dividir en subagente |

## Reglas

- Prohibido reintentar la misma acción con los mismos parámetros más de 2 veces. Si falla dos veces, el problema es estructural — cambiar el enfoque.
- Cada 20 tool calls, el agente debe hacer un checkpoint obligatorio:
  1. Resumir progreso hasta el momento.
  2. Listar pendientes.
  3. Decidir: continuar, compactar contexto, o escalar al usuario.
- Si el contexto supera el 80% del window estimado, compactar inmediatamente o delegar a un subagente antes de perder información crítica.

## Señales de Loop

Detectar y actuar si se observa cualquiera de estas señales:

- El agente repite el mismo patrón de acciones (misma secuencia de tools con mismos parámetros).
- Errores idénticos se repiten 3+ veces sin cambio de estrategia.
- El output de las acciones no cambia entre iteraciones.
- El agente alterna entre dos estados sin progreso (A → B → A → B).
- Se generan los mismos archivos o cambios que ya fueron revertidos.

## Protocolo de Escalación

Cuando se activa una stop condition:

1. **Pausar** — detener la ejecución inmediatamente.
2. **Informar** — comunicar al usuario:
   - Qué se intentó (acciones ejecutadas).
   - Qué falló (errores específicos, no genéricos).
   - Cuántas veces se reintentó y con qué variaciones.
3. **Proponer** — ofrecer el siguiente paso:
   - Estrategia alternativa concreta.
   - Información adicional necesaria del usuario.
   - División del problema en partes más pequeñas.

```
// ✅ Good — escalación con contexto
"He intentado 3 veces conectar al endpoint X con diferentes configuraciones de timeout (3s, 5s, 10s).
Todos fallan con connection refused. Posibles causas: el servicio no está corriendo, o el puerto está bloqueado.
¿Puedes verificar que el servicio esté activo en el puerto 8080?"

// ❌ Bad — escalación sin contexto
"No pude completar la tarea. ¿Qué hago?"
```

## Excepciones

- Tareas explícitamente marcadas como "long-running" por el usuario pueden exceder el límite de 50 tool calls, pero deben hacer checkpoints cada 20.
- Pipelines de CI/CD con reintentos esperados (flaky tests) pueden tener un umbral de 5 errores consecutivos en lugar de 3, solo si el usuario lo indica.
