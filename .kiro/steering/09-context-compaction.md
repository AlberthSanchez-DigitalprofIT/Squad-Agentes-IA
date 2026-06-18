---
inclusion: always
---

# Context Compaction Strategy

## Principio

El agente solo conoce lo que está en su context window. Cargar todo al inicio degrada rendimiento antes de la primera acción. Gestionar contexto es responsabilidad del harness.

## Reglas de carga (Just-in-Time Context)

- Skills se cargan solo cuando la tarea lo requiere (fileMatch)
- Tool outputs >2000 caracteres: resumir antes de devolver (pedir solo campos relevantes)
- Archivos grandes: leer con offset/limit, nunca completos salvo que sea estrictamente necesario
- Steering de agentes manuales (inclusion: manual): nunca cargar automáticamente

## Reglas de compaction en tareas largas

- Cada 30 turnos de conversación: el agente debe generar un checkpoint (resumen de decisiones tomadas, estado actual, pendientes)
- Al delegar a subagente: pasar solo objetivo + entregable esperado + contexto mínimo necesario (no el historial completo)
- Output de subagente al Orquestador: solo síntesis + artefactos generados (no el razonamiento intermedio)
- Si un subagente necesita contexto de otro: el Orquestador extrae y pasa solo lo relevante

## Reglas de división de tareas

- Tarea con >5 subtareas distintas: dividir en subagentes independientes (cada uno con contexto limpio)
- Tarea que requiere >3 archivos de referencia simultáneos: leer uno a uno, extraer lo necesario, no mantener todos abiertos
- Multi-agente secuencial: cada agente recibe solo el output del anterior + su instrucción (no acumular)

## Señales de contexto saturado

- El agente empieza a repetir información ya dicha
- El agente olvida restricciones mencionadas al inicio
- Respuestas se vuelven genéricas o pierden especificidad
- El agente confunde archivos o rutas ya mencionados

Acción: pausar, generar checkpoint, y continuar con contexto limpio.

## Anti-patrones (prohibido)

- Cargar todos los steerings al inicio de la sesión
- Pasar historial completo de conversación a subagentes
- Leer archivos enteros 'por si acaso'
- Mantener outputs largos de tools en contexto cuando ya se extrajeron los datos necesarios
- Repetir instrucciones largas que ya están en el steering del agente delegado
