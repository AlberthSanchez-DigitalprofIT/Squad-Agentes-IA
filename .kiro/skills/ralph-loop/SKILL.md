---
name: ralph-loop
description: Ejecución autónoma de specs completos con delegación a agentes especialistas. Usa este skill cuando el usuario pida implementar un spec completo, ejecución autónoma, Ralph Loop, o "déjalo corriendo hasta que termine".
---

# Skill: Ralph Loop (Orquestador)

## Cuándo usar

- El usuario pide: "implementa este spec", "ejecuta el Ralph Loop", "termina todas las tareas", "déjalo corriendo"
- Hay specs completos en `.kiro/specs/{feature}/` (requirements.md, design.md, tasks.md)
- La tarea requiere múltiples pasos con delegación a especialistas

## Pre-condiciones (verificar antes de iniciar)

1. Confirmar ruta del spec con el usuario
2. Verificar que existen: `requirements.md`, `design.md`, `tasks.md` en la ruta
3. Verificar que `npm run test:unit` funciona (ejecutar una vez)
4. Verificar git status limpio (no uncommitted changes)
5. Inicializar `progress.txt` si no existe

## Ejecución: Loop con delegación

Repetir hasta que todas las tareas estén completas (max 15 ciclos):

### Paso 1 — Leer estado

- Leer `tasks.md` → identificar siguiente tarea incompleta (`- [ ]`)
- Leer `progress.txt` → contexto de lo ya hecho
- Leer `Workspace/memory/auditor/` → hallazgos pendientes

### Paso 2 — Decidir agente (Chain-of-Thought obligatorio)

Evaluar la tarea y decidir qué agente especialista la ejecuta:

| Si la tarea involucra... | Delegar a... |
|--------------------------|-------------|
| Tests, E2E, Playwright, validación | **Test Engineer** |
| Código Angular, componentes, servicios | **Angular Developer** |
| Scripts transversales, hooks, config | **Harness Engineer** |
| Documentación, diagramas, README | **Doc Updater** |
| Infraestructura, Terraform, AWS | **Cloud Infra** |
| Historias de usuario, specs adicionales | **PO-Agile** |
| Cualquier otra implementación de código | **Harness Engineer** (default para código del proyecto) |

### Paso 3 — Delegar vía subagente

Invocar subagente con prompt específico que incluya:
- La tarea concreta a implementar (copiada de tasks.md)
- El diseño relevante (sección de design.md)
- Instrucción explícita: implementar, ejecutar tests, hacer commit, marcar [x] en tasks.md, actualizar progress.txt
- Restricción: SOLO esa tarea, nada más

### Paso 4 — Verificar resultado del subagente

- ¿La tarea fue marcada [x] en tasks.md?
- ¿Los tests pasan? (`npm run test:unit`)
- ¿Hubo commit?
- Si verificación falla: reintentar con el mismo agente (max 2 reintentos)
- Si falla 2 veces: marcar como bloqueada, reportar al usuario, pasar a la siguiente

### Paso 5 — Checkpoint cada 5 tareas

Cada 5 tareas completadas:
- Generar resumen de progreso
- Verificar que el contexto no está saturado (ver `09-context-compaction.md`)
- Si hay señales de saturación: compactar y continuar

### Paso 6 — Condición de salida

- Si NO quedan tareas `[ ]` y tests pasan → ÉXITO
- Si max ciclos alcanzado → reportar estado parcial al usuario
- Si 3 tareas consecutivas fallan → ABORT, escalar al usuario

## Post-ejecución

1. Reportar al usuario: tareas completadas, pendientes, tiempo estimado
2. Sugerir invocar al **Auditor** (Gemini) para revisión de calidad
3. Ejecutar `npm run harness:report` para telemetry

## Reglas del loop

- **Una tarea por ciclo** — nunca intentar múltiples tareas en un solo subagente
- **Subagente = contexto limpio** — cada delegación es fresh context para el especialista
- **El Orquestador NO implementa** — solo coordina, verifica y decide
- **progress.txt es la memoria entre ciclos** — resumen conciso, no historial completo
- **Hallazgos del Auditor tienen prioridad** — si hay pendientes, resolverlos primero
- **Stop conditions aplican** — ver `08-stop-conditions.md`

## Diferencia con el script bash (fallback)

| | Skill del Orquestador (principal) | Script bash (fallback overnight) |
|---|---|---|
| Delegación | Inteligente (Chain-of-Thought) | Por keywords o `--agent` |
| Context | Subagentes limpios, Orquestador compacta | Fresh context total por iteración |
| Hooks | Todos activos nativamente | Depende de `--agent` correcto |
| Cuándo usar | Sesión activa, supervisión ligera | Overnight sin sesión, se va a dormir |
| Comando | Invocar este skill en chat | `./scripts/ralph-loop/afk-ralph.sh` |

## Ejemplo de invocación

```
Usuario: "Implementa el spec de .kiro/specs/user-auth"

Orquestador (con este skill):
  1. Lee specs → 8 tareas pendientes
  2. Tarea 1: "Crear modelo de usuario" → delega a Harness Engineer
  3. Verifica → ✅ commit hecho, tests pasan
  4. Tarea 2: "Crear endpoint de login" → delega a Harness Engineer
  5. Verifica → ✅
  6. Tarea 3: "Agregar tests E2E" → delega a Test Engineer
  ...
  8. Todas completas → "Spec completado en 8 ciclos. ¿Invoco al Auditor?"
```
