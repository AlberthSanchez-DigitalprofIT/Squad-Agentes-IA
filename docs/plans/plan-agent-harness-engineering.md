# Plan: Implementación Agent Harness Engineering (Gaps)

> Basado en el framework de Addy Osmani — ["Agent Harness Engineering"](https://addyosmani.com/blog/agent-harness-engineering/)
> Fecha: 2026-06-03
> Estado: Propuesta

---

## Contexto

El proyecto ya implementa ~80% del framework. Este plan cubre los 5 gaps identificados, priorizados por impacto y esfuerzo.

## Priorización

| # | Gap | Impacto | Esfuerzo | Prioridad |
|---|-----|---------|----------|-----------|
| 1 | Observabilidad del harness | Alto | Medio | 🔴 P1 |
| 2 | Stop conditions & budget caps | Alto | Bajo | 🔴 P1 |
| 3 | Self-improving harness | Alto | Alto | 🟡 P2 |
| 4 | Context compaction strategy | Medio | Bajo | 🟡 P2 |
| 5 | Sandbox de ejecución | Medio | Alto | 🟢 P3 |

---

## Fase 1 — Observabilidad y Control (Semanas 1-2)

### 1.1 Harness Telemetry Logger

**Objetivo:** Capturar qué hizo cada agente, con qué tools, en cuánto tiempo, y si tuvo éxito o falló.

**Implementación:**

```
scripts/harness-telemetry/
├── telemetry-collector.js    # Hook postToolUse que registra cada acción
├── telemetry-store.js        # Almacena en JSON Lines (Workspace/telemetry/)
└── telemetry-report.js       # Genera reporte HTML de actividad del harness
```

**Datos a capturar por evento:**

| Campo | Ejemplo |
|-------|---------|
| `timestamp` | `2026-06-03T22:00:00Z` |
| `agent` | `Cloud SRE` |
| `tool` | `call_aws` |
| `mcp_server` | `aws-api` |
| `action` | `describe-instances` |
| `duration_ms` | `1200` |
| `status` | `success` / `error` / `blocked` |
| `context_tokens_used` | `4500` |
| `blocked_by_hook` | `null` / `aws-api-guard` |

**Entregable:** Hook `telemetry-logger` (tipo `postToolUse`) + script de reporte HTML.

### 1.2 Stop Conditions & Budget Caps

**Objetivo:** Prevenir loops infinitos y consumo excesivo en tareas complejas.

**Implementación:** Nuevo steering `08-stop-conditions.md` con reglas claras.

**Reglas propuestas:**

| Parámetro | Límite | Acción al exceder |
|-----------|--------|-------------------|
| Max tool calls por tarea | 50 | Pausar, reportar al usuario, pedir confirmación |
| Max tiempo por subtarea | 10 min | Timeout, reportar estado parcial |
| Max errores consecutivos | 3 | Cambiar estrategia o escalar al usuario |
| Max tokens de contexto activo | 80% del window | Compactar o dividir tarea |
| Max reintentos por tool call | 2 | Fallar con diagnóstico, no reintentar |

**Entregable:** Steering file + hook `stop-conditions-guard` (tipo `postToolUse`) que cuenta invocaciones y alerta.

---

## Fase 2 — Auto-evolución y Context Management (Semanas 3-4)

### 2.1 Failure Capture & Harness Improvement Pipeline

**Objetivo:** Cada fallo de agente genera un candidato de mejora del harness (nuevo hook, steering patch, o tool restriction).

**Flujo propuesto:**

```
Fallo detectado
    ↓
Captura automática (telemetry-collector)
    ↓
Clasificación del fallo:
  - hook_missing: el agente hizo algo prohibido no cubierto
  - context_insufficient: el agente no tenía info necesaria
  - tool_misuse: el agente usó tool incorrecta
  - loop_detected: el agente repitió acción sin progreso
    ↓
Generar propuesta de mejora (en Workspace/harness-improvements/)
    ↓
Revisión humana → Aplicar o descartar
```

**Implementación:**

```
scripts/harness-evolution/
├── failure-classifier.js     # Clasifica fallos del telemetry log
├── improvement-proposer.js   # Genera candidatos (steering patch / hook)
└── improvement-tracker.md    # Registro de mejoras aplicadas y descartadas
```

**Entregable:** Script que analiza `Workspace/telemetry/` y genera propuestas en `Workspace/harness-improvements/`.

### 2.2 Context Compaction Strategy

**Objetivo:** Política documentada y aplicable para gestión de contexto en tareas largas.

**Implementación:** Nuevo steering `09-context-compaction.md`.

**Estrategias:**

| Situación | Acción |
|-----------|--------|
| Tarea con >5 subtareas | Dividir en subagentes independientes (cada uno con contexto limpio) |
| Tool output >2000 tokens | Resumir antes de devolver al agente (pedir solo lo relevante) |
| Conversación >60 turnos | Compactar: resumen de decisiones + estado actual + pendientes |
| Archivos grandes leídos | Leer solo secciones relevantes (offset/limit), no archivos completos |
| Multi-agente secuencial | Cada agente recibe solo: objetivo + output del anterior (no el historial completo) |

**Entregable:** Steering file con reglas accionables. Actualizar `00-swarm-orchestrator.md` para referenciar estas políticas.

---

## Fase 3 — Sandbox y Aislamiento (Semanas 5-6)

### 3.1 Execution Boundaries

**Objetivo:** Definir boundaries de ejecución por agente para contener errores.

**Enfoque pragmático** (sin containers, compatible con Kiro CLI):

| Boundary | Implementación |
|----------|---------------|
| **Filesystem scope** | Cada agente solo puede escribir en paths definidos en su steering |
| **Command allowlist** | Hook que valida comandos shell contra allowlist por agente |
| **Network scope** | Agentes solo pueden alcanzar dominios de sus MCPs autorizados |
| **Write confirmation** | Operaciones destructivas (delete, overwrite) requieren confirmación |

**Implementación:**

```
.kiro/hooks/
├── filesystem-scope-guard.kiro.hook    # Valida paths de escritura por agente
└── command-allowlist-guard.kiro.hook   # Valida shell commands por agente
```

**Configuración en steering de cada agente:**

```markdown
## Boundaries
- **Escritura permitida:** `docs/`, `Workspace/{plataforma}/`
- **Comandos permitidos:** `npm test`, `npx playwright test`, `git status`
- **Comandos prohibidos:** `rm -rf`, `git push --force`, `DROP TABLE`
```

**Entregable:** 2 hooks nuevos + sección `Boundaries` en cada steering de agente.

---

## Fase 4 — Métricas y Dashboard (Semana 7)

### 4.1 Harness Health Dashboard

**Objetivo:** Visualizar la salud del harness en un reporte HTML (estilo Report Builder).

**Métricas del dashboard:**

| Sección | Métricas |
|---------|----------|
| **Actividad** | Invocaciones por agente, tools más usadas, horarios pico |
| **Efectividad** | Tasa de éxito/fallo por agente, tiempo promedio por tarea |
| **Enforcement** | Bloqueos por hook, intentos de violación de permisos |
| **Evolución** | Mejoras aplicadas al harness (timeline), fallos recurrentes |
| **Budget** | Tools activas vs budget, contexto consumido por tarea |

**Implementación:**

```
tools/scripts/generate-harness-dashboard.js
```

Usa datos de `Workspace/telemetry/` → genera `docs/harness-dashboard.html` para GitHub Pages.

**Entregable:** Script + página HTML desplegada en GitHub Pages.

---

## Resumen de entregables

| Fase | Entregable | Tipo | Archivo |
|------|-----------|------|---------|
| 1.1 | Telemetry Logger | Hook + Script | `telemetry-logger.kiro.hook`, `scripts/harness-telemetry/` |
| 1.2 | Stop Conditions | Steering + Hook | `08-stop-conditions.md`, `stop-conditions-guard.kiro.hook` |
| 2.1 | Failure Pipeline | Scripts | `scripts/harness-evolution/` |
| 2.2 | Context Compaction | Steering | `09-context-compaction.md` |
| 3.1 | Execution Boundaries | Hooks + Steering patches | `filesystem-scope-guard`, `command-allowlist-guard` |
| 4.1 | Harness Dashboard | Script + HTML | `tools/scripts/generate-harness-dashboard.js` |

---

## Criterios de éxito

| Métrica | Target |
|---------|--------|
| Fallos de agente que se repiten | Reducir 50% vs línea base (mes 1) |
| Tiempo promedio de diagnóstico de fallo | < 5 min (con telemetry) |
| Cobertura de enforcement (hooks/agent) | 100% agentes con boundaries definidos |
| Propuestas de mejora generadas por mes | ≥ 5 (pipeline de auto-evolución) |
| Visibilidad de actividad del harness | 100% acciones registradas |

---

## Dependencias

- No requiere cambios en MCPs externos
- No requiere nuevas dependencias npm (usa Node.js nativo + JSON)
- Compatible con estructura existente del proyecto
- Report Builder puede generar el dashboard (delegación desde Orquestador)

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Telemetry agrega overhead a cada tool call | Escritura async a archivo, no blocking |
| Stop conditions demasiado agresivas | Empezar con límites altos, ajustar según datos |
| Propuestas de mejora incorrectas | Siempre requieren revisión humana |
| Filesystem guard falsos positivos | Allowlist generosa al inicio, apretar con datos |

---

## Fase 5 — Memoria Compartida y Auditor (Semanas 8-9)

> Propuesta del VP de Tecnología. Modelo de comunicación inter-agentes.

### 5.1 Sistema de Memorias por Agente

**Principio:** Cada agente alimenta su propia memoria. Todos pueden leer las memorias de los demás, pero solo escribir en las suyas.

**Implementación:**

```
Workspace/memory/
├── README.md                 # Reglas y formato
├── auditor/                  # Juicios de calidad
├── scout/                    # Hallazgos documentales
├── historian/                # Análisis de impacto
├── test-engineer/            # Resultados de tests
├── platform-analyst/         # Análisis de repos
├── po-agile/                 # Decisiones de producto
├── doc-updater/              # Cambios documentales
├── cloud-sre/                # Incidentes y diagnósticos
├── clarity-behavior/         # Insights UX
├── angular-developer/        # Decisiones de código
├── cloud-infra/              # Auditorías AWS
├── ai-agent-ops/             # Estado agentes producción
├── bi-strategist/            # Insights de negocio
├── report-builder/           # Reportes generados
├── comms-analyst/            # Análisis comunicaciones
└── harness-engineer/         # Cambios al harness
```

**Enforcement:** Hook `memory-write-guard` (preToolUse) valida que cada agente solo escriba en su carpeta.

### 5.2 Agente Auditor (#18)

| Campo | Valor |
|-------|-------|
| Modelo | Gemini (Google) — independiente del resto |
| Objetivo | Emitir juicios de calidad sobre el trabajo de los demás |
| Escritura | Solo en `Workspace/memory/auditor/` |
| Lectura | Todas las memorias + código del proyecto |
| Max ciclos | 2 correcciones, luego escala al usuario |

### 5.3 Protocolo de comunicación

```
Agente completa tarea → Escribe en su memoria → Orquestador invoca Auditor
                                                         ↓
                                              Auditor lee memoria + artefactos
                                                         ↓
                                              Auditor escribe juicio en su memoria
                                                         ↓
                                    Agente auditado lee juicio al iniciar siguiente tarea
                                                         ↓
                                              Toma acciones correctivas → Escribe corrección
```

### Entregables Fase 5

| Entregable | Archivo |
|-----------|---------|
| Steering Auditor | `.kiro/steering/agent-auditor.md` |
| Estructura de memoria | `Workspace/memory/` (16 carpetas + README) |
| Hook de escritura | `.kiro/hooks/memory-write-guard.kiro.hook` |
| Protocolo transversal | `.kiro/steering/10-memory-audit-protocol.md` |
