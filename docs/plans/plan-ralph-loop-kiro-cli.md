# Plan: Ralph Loop para Kiro CLI — Squad Agentes IA

> Basado en: Geoffrey Huntley (creador), implementación Kiro CLI por Mamezou, y framework de Osmani.
> Fecha: 2026-06-03
> Estado: Propuesta

---

## ¿Qué es el Ralph Loop?

Un patrón de ejecución autónoma donde un agente IA corre en un loop hasta que todos los items de un plan están completos. Principio clave: **fresh context per iteration** — cada iteración descarta el contexto anterior y arranca limpio, evitando degradación.

```
┌─────────────────────────────────────────────────────────┐
│                    RALPH LOOP                            │
│                                                         │
│  Iteración N:                                           │
│    1. Lee specs (requirements + design + tasks)         │
│    2. Lee progress.txt (estado acumulado)               │
│    3. Identifica siguiente tarea incompleta             │
│    4. Implementa + tests + commit                       │
│    5. Actualiza tasks.md (checkbox) + progress.txt      │
│    6. Si todas completas → output COMPLETE              │
│    7. Si no → contexto se descarta → Iteración N+1     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ¿Cómo convive con el Harness de Osmani?

| Concepto Osmani | Rol en el Ralph Loop |
|----------------|---------------------|
| **Context management** | Ralph RESUELVE el problema: fresh context por iteración elimina context rot |
| **Verification** | El loop no termina hasta que tests pasan (Test-Driven Verification) |
| **Completion promise** | Stop condition explícita: `<promise>COMPLETE</promise>` solo cuando TODO está hecho |
| **Hooks (enforcement)** | Nuestros hooks siguen activos dentro de cada iteración del loop |
| **Stop conditions** | Ralph agrega max_iterations como safety cap adicional a nuestro `08-stop-conditions.md` |
| **Feedback loops** | Cada iteración ES un feedback loop: implementa → verifica → registra → siguiente |
| **Self-improving harness** | `progress.txt` acumula aprendizajes entre iteraciones; el Auditor revisa al final |
| **Memory system** | `progress.txt` + `Workspace/memory/` persisten entre iteraciones (no se descartan) |

### Sinergia con nuestra estructura

```
RALPH LOOP + HARNESS + MEMORIAS
═══════════════════════════════

Iteración 1 (contexto limpio):
  ├── Lee: specs/ + progress.txt + Workspace/memory/auditor/ (hallazgos pendientes)
  ├── Hooks activos: stop-conditions, filesystem-scope, command-allowlist, memory-write
  ├── Ejecuta: 1 tarea del tasks.md
  ├── Escribe: memory del agente + progress.txt + commit
  └── Descarta contexto

Iteración 2 (contexto limpio):
  ├── Lee: specs/ + progress.txt (actualizado) + memorias relevantes
  ├── Hooks activos (mismos)
  ├── Ejecuta: siguiente tarea incompleta
  └── ...

Iteración N:
  ├── Todas las tareas completas + tests pasan
  ├── Output: <promise>COMPLETE</promise>
  └── FIN → Auditor (Gemini) revisa el trabajo completo
```

---

## Diseño para nuestro proyecto

### Estructura de archivos

```
scripts/ralph-loop/
├── afk-ralph.sh              # Script principal del loop
├── ralph-once.sh             # Una sola iteración (debug)
├── ralph-prompt-template.md  # Template del prompt por iteración
└── README.md                 # Instrucciones de uso
```

### Inputs del Ralph Loop

| Input | Fuente | Propósito |
|-------|--------|-----------|
| `requirements.md` | `.kiro/specs/{feature}/requirements.md` | Qué construir |
| `design.md` | `.kiro/specs/{feature}/design.md` | Cómo construir |
| `tasks.md` | `.kiro/specs/{feature}/tasks.md` | Lista de tareas con checkboxes |
| `progress.txt` | Raíz del proyecto | Resumen acumulado de lo hecho (persiste entre iteraciones) |
| `Workspace/memory/auditor/` | Memorias | Hallazgos pendientes del Auditor |
| Steerings activos | `.kiro/steering/` | Reglas del harness (se cargan automáticamente) |

### Prompt template por iteración

```markdown
[Requirements]
{contenido de requirements.md}

[Design]
{contenido de design.md}

[Task List]
{contenido de tasks.md}

[Progress]
{contenido de progress.txt}

[Auditor Findings]
{hallazgos pendientes del auditor, si existen}

## Instrucciones

1. Revisa el task list y el progress — encuentra la siguiente tarea incompleta ([ ])
2. Implementa ESA SOLA tarea siguiendo el diseño y los patrones existentes
3. Ejecuta tests: `npm run test:unit` (NUNCA `npm test` que lanza Playwright)
4. Si tests pasan: marca [x] en tasks.md, haz commit, actualiza progress.txt
5. Si tests fallan: corrige y reintenta (max 3 intentos por iteración)
6. Escribe un resumen en tu memoria: Workspace/memory/{agente}/{fecha}-{tarea}.md
7. Solo output <promise>COMPLETE</promise> cuando NO queden tareas [ ] y tests pasen
8. NUNCA output <promise>COMPLETE</promise> si hay tareas incompletas

## Restricciones
- Implementa SOLO UNA tarea por iteración
- Prohibido usar comandos interactivos o que esperen input
- Prohibido procesos persistentes (servidores, watchers)
- Prohibido inventar features no especificadas
- Sigue las reglas de 08-stop-conditions.md y 09-context-compaction.md
```

### Script principal: `afk-ralph.sh`

```bash
#!/bin/bash
# Ralph Loop para Kiro CLI — Squad Agentes IA
# Uso: ./scripts/ralph-loop/afk-ralph.sh [max_iterations] [spec_path]
# Ejemplo: ./scripts/ralph-loop/afk-ralph.sh 15 .kiro/specs/my-feature

set -euo pipefail

MAX_ITERATIONS="${1:-15}"
SPEC_DIR="${2:-.kiro/specs/current}"
PROGRESS_FILE="progress.txt"
MEMORY_DIR="Workspace/memory"
AUDITOR_DIR="$MEMORY_DIR/auditor"
LOG_DIR="/tmp/ralph-logs"

mkdir -p "$LOG_DIR"

echo "═══ RALPH LOOP — Squad Agentes IA ═══"
echo "Max iteraciones: $MAX_ITERATIONS"
echo "Specs: $SPEC_DIR"
echo "════════════════════════════════════════"

# Inicializar progress si no existe
[ -f "$PROGRESS_FILE" ] || echo "No progress yet" > "$PROGRESS_FILE"

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo ""
  echo "──── Iteración $i/$MAX_ITERATIONS ────"

  # Leer specs
  req="$(cat "${SPEC_DIR}/requirements.md" 2>/dev/null || echo 'No requirements found')"
  des="$(cat "${SPEC_DIR}/design.md" 2>/dev/null || echo 'No design found')"
  tasks="$(cat "${SPEC_DIR}/tasks.md" 2>/dev/null || echo 'No tasks found')"
  progress="$(cat "$PROGRESS_FILE")"

  # Leer hallazgos del auditor (si existen)
  auditor_findings=""
  if [ -d "$AUDITOR_DIR" ]; then
    auditor_findings="$(find "$AUDITOR_DIR" -name '*.md' -newer "$PROGRESS_FILE" -exec cat {} \; 2>/dev/null || echo 'None')"
  fi

  # Construir prompt
  prompt="[Requirements]
$req

[Design]
$des

[Task List]
$tasks

[Progress]
$progress

[Auditor Findings]
$auditor_findings

## Instrucciones
1. Revisa el task list y progress — encuentra la siguiente tarea incompleta ([ ])
2. Implementa ESA SOLA tarea siguiendo el diseño y patrones existentes
3. Ejecuta tests: npm run test:unit (NUNCA npm test)
4. Si tests pasan: marca [x] en tasks.md, haz commit, actualiza progress.txt
5. Si tests fallan: corrige y reintenta (max 3 intentos)
6. Solo output <promise>COMPLETE</promise> cuando NO queden tareas [ ] y tests pasen
7. NUNCA output <promise>COMPLETE</promise> si hay tareas incompletas
8. Implementa SOLO UNA tarea por iteración
9. Prohibido comandos interactivos, procesos persistentes, o features no especificadas"

  # Ejecutar Kiro CLI
  logfile="$LOG_DIR/iteration-${i}.log"
  echo "$prompt" | kiro-cli chat --no-interactive --trust-all-tools 2>&1 | tee "$logfile"

  # Verificar condición de salida
  uncompleted=$(grep -cE '^\- \[ \]' "${SPEC_DIR}/tasks.md" 2>/dev/null || echo "0")
  has_promise=$(grep -q "<promise>COMPLETE</promise>" "$logfile" && echo "yes" || echo "no")

  echo "  → Tareas pendientes: $uncompleted"
  echo "  → Promise COMPLETE: $has_promise"

  if [ "$uncompleted" -eq 0 ] && [ "$has_promise" = "yes" ]; then
    echo ""
    echo "═══ ✅ RALPH LOOP COMPLETADO en $i iteraciones ═══"
    echo "Invocar auditor para revisión final..."
    exit 0
  fi

  if [ "$uncompleted" -eq 0 ] && [ "$has_promise" = "no" ]; then
    echo "  ⚠️  Todas las tareas marcadas pero sin COMPLETE promise. Iteración extra."
  fi
done

echo ""
echo "═══ ⚠️ MAX ITERACIONES ALCANZADO ($MAX_ITERATIONS) ═══"
echo "Tareas pendientes: $(grep -cE '^\- \[ \]' "${SPEC_DIR}/tasks.md" 2>/dev/null || echo '?')"
echo "Revisar manualmente."
exit 1
```

### Integración con el Auditor (post-loop)

Al completar el Ralph Loop:
1. El script invoca al **Auditor (Gemini)** para revisión del trabajo completo
2. El Auditor lee las memorias generadas durante el loop + el código final
3. Emite juicio en `Workspace/memory/auditor/`
4. Si hay hallazgos críticos → el usuario decide si ejecutar otro ciclo Ralph

---

## Agentes involucrados

| Agente | Rol en el Ralph Loop |
|--------|---------------------|
| **Harness Engineer** | Crea y mantiene los scripts del loop (`scripts/ralph-loop/`) |
| **PO-Agile** | Genera los specs (requirements.md, design.md, tasks.md) en Fase 1 |
| **Cualquier agente implementador** | Ejecuta las tareas dentro del loop (Test Engineer, Angular Dev, etc.) |
| **Auditor** | Revisa al final del loop con Gemini |
| **Doc Updater** | Actualiza docs/ si el loop generó cambios significativos |

No se necesita un agente nuevo — el Ralph Loop es un **patrón de ejecución** que orquesta agentes existentes.

---

## Safety: Cómo los hooks del harness protegen el loop

| Riesgo | Protección existente |
|--------|---------------------|
| Agente ejecuta comando destructivo | `command-allowlist-guard` bloquea |
| Agente escribe fuera de su scope | `filesystem-scope-guard` bloquea |
| Loop infinito (nunca COMPLETE) | `max_iterations` en el script + `08-stop-conditions.md` |
| Agente hardcodea secrets | `secrets-guard` bloquea |
| Contexto se degrada | Ralph lo resuelve: fresh context cada iteración |
| Calidad se degrada sin revisión | Auditor revisa al final |
| Agente inventa features | Prompt explícito: "solo lo especificado" + spec como pin |

---

## Fases de implementación

| Fase | Entregable | Esfuerzo | Agente |
|------|-----------|----------|--------|
| 1 | Script `afk-ralph.sh` + `ralph-once.sh` | Bajo | Harness Engineer |
| 2 | Template de prompt `ralph-prompt-template.md` | Bajo | Harness Engineer |
| 3 | README con instrucciones de uso | Bajo | Doc Updater |
| 4 | Integración post-loop con Auditor | Medio | Harness Engineer |
| 5 | Skill `ralph-loop` en `.kiro/skills/` (opcional) | Medio | Harness Engineer |
| 6 | Telemetry del loop (iteraciones, duración, éxito) | Bajo | Harness Engineer |

**Estimación total:** 1-2 días de implementación.

---

## Ejemplo de uso

```bash
# 1. PO-Agile genera los specs
# (interactivo en Kiro IDE o CLI)

# 2. Ejecutar Ralph Loop (max 15 iteraciones sobre los specs)
./scripts/ralph-loop/afk-ralph.sh 15 .kiro/specs/mi-feature

# 3. Ir a dormir 😴

# 4. A la mañana: revisar commits + invocar auditor
npm run harness:report
# → ver qué hizo el loop durante la noche
```

---

## Prerequisitos

| Requisito | Estado |
|-----------|--------|
| Kiro CLI instalado con `--no-interactive` | ✅ Disponible |
| Specs en formato `.kiro/specs/` (requirements, design, tasks) | ✅ Ya usamos este formato |
| Tests unitarios configurados (Vitest) | ✅ `npm run test:unit` |
| Hooks de seguridad activos | ✅ 23 hooks |
| Sistema de memorias | ✅ `Workspace/memory/` |
| Auditor configurado | ✅ Agente #18 |
| Entorno aislado (devcontainer) | ⚠️ Recomendado pero no obligatorio con hooks |

---

## Riesgos específicos del Ralph Loop

| Riesgo | Mitigación |
|--------|-----------|
| `--trust-all-tools` ejecuta cualquier cosa | Hooks `command-allowlist-guard` + `filesystem-scope-guard` actúan como sandbox lógico |
| Token consumption alto (fresh context = re-leer todo) | Specs concisas, progress.txt resumido, no cargar memorias innecesarias |
| Iteraciones sin progreso (stuck) | Script detecta 0 cambios en 2 iteraciones consecutivas → abortar |
| Conflictos de git entre iteraciones | Cada iteración hace commit atómico; no hay conflictos |
| Specs ambiguas causan invención | PO-Agile genera specs con criterios de aceptación claros (INVEST + Gherkin) |
