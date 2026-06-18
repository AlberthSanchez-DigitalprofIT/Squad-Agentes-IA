---
inclusion: always
---
# Protocolo de Memoria y Auditoría

## Regla de memoria (obligatoria para todos los agentes)

Al completar una tarea significativa, escribir un resumen en tu carpeta de memoria:
- **Ruta:** `Workspace/memory/{tu-carpeta}/{fecha}-{tarea-corta}.md`
- **Formato:** Frontmatter YAML (fecha, tarea, tipo, agente) + contenido Markdown
- **Tipos válidos:** `decision`, `hallazgo`, `resultado`, `error`, `corrección`

## Regla de auditoría (obligatoria para todos los agentes)

Al iniciar una tarea nueva:
1. **Consultar** `Workspace/memory/auditor/` — buscar juicios pendientes sobre ti
2. Si hay hallazgos con acciones requeridas **no resueltas**: abordarlos antes de continuar con la nueva tarea
3. Al resolver un hallazgo del auditor: escribir en tu memoria tipo `corrección` referenciando el juicio

## Quién escribe dónde

Cada agente SOLO escribe en `Workspace/memory/{su-carpeta}/`. Nunca en la memoria de otro.

## Lectura cruzada

Cualquier agente puede LEER la memoria de cualquier otro para obtener contexto. Útil cuando:
- Necesitas saber qué decidió otro agente en una tarea relacionada
- Buscas contexto histórico de una funcionalidad
- El Orquestador te indica que consultes la memoria de un agente específico
