#!/bin/bash
# Ralph Loop para Kiro CLI — Squad Agentes IA
# Uso: ./scripts/ralph-loop/afk-ralph.sh [max_iterations] [spec_path]
# Ejemplo: ./scripts/ralph-loop/afk-ralph.sh 15 .kiro/specs/my-feature
#
# Requiere: kiro-cli instalado y en PATH
# Seguridad: Los hooks del harness (.kiro/hooks/) protegen cada iteración

set -euo pipefail

MAX_ITERATIONS="${1:-15}"
SPEC_DIR="${2:-.kiro/specs/current}"
PROGRESS_FILE="progress.txt"
MEMORY_DIR="Workspace/memory"
AUDITOR_DIR="$MEMORY_DIR/auditor"
LOG_DIR="/tmp/ralph-logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$LOG_DIR"

echo "══════════════════════════════════════════"
echo "  RALPH LOOP — Squad Agentes IA"
echo "══════════════════════════════════════════"
echo "  Max iteraciones: $MAX_ITERATIONS"
echo "  Specs: $SPEC_DIR"
echo "  Progress: $PROGRESS_FILE"
echo "  Logs: $LOG_DIR"
echo "  Inicio: $(date)"
echo "══════════════════════════════════════════"
echo ""

# Validar que existen los specs
if [ ! -f "${SPEC_DIR}/tasks.md" ]; then
  echo "ERROR: No se encontró ${SPEC_DIR}/tasks.md"
  echo "Genera los specs primero con PO-Agile o Kiro IDE."
  exit 1
fi

# Inicializar progress si no existe
[ -f "$PROGRESS_FILE" ] || echo "No progress yet" > "$PROGRESS_FILE"

# Contador de iteraciones sin progreso
no_progress_count=0
prev_uncompleted=-1

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo "──── Iteración $i/$MAX_ITERATIONS ── $(date +%H:%M:%S) ────"

  # Leer specs
  req="$(cat "${SPEC_DIR}/requirements.md" 2>/dev/null || echo 'No requirements file')"
  des="$(cat "${SPEC_DIR}/design.md" 2>/dev/null || echo 'No design file')"
  tasks="$(cat "${SPEC_DIR}/tasks.md")"
  progress="$(cat "$PROGRESS_FILE")"

  # Leer hallazgos del auditor (solo recientes)
  auditor_findings="None"
  if [ -d "$AUDITOR_DIR" ]; then
    recent=$(find "$AUDITOR_DIR" -name '*.md' -mtime -1 -exec cat {} \; 2>/dev/null)
    [ -n "$recent" ] && auditor_findings="$recent"
  fi

  # Construir prompt desde template
  prompt=$(sed -e "s|__REQ__|$req|" \
               -e "s|__DES__|$des|" \
               -e "s|__TASKS__|$tasks|" \
               -e "s|__PROGRESS__|$progress|" \
               -e "s|__AUDITOR__|$auditor_findings|" \
               scripts/ralph-loop/ralph-prompt-template.md 2>/dev/null || \
  cat <<EOF
[Requirements]
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
3. Ejecuta tests: npm run test:unit (NUNCA npm test que lanza Playwright)
4. Si tests pasan: marca [x] en tasks.md, haz commit, actualiza progress.txt
5. Si tests fallan: corrige y reintenta (max 3 intentos)
6. Escribe resumen en Workspace/memory/ de tu agente
7. Solo output <promise>COMPLETE</promise> cuando NO queden tareas [ ] y tests pasen
8. NUNCA output <promise>COMPLETE</promise> si hay tareas incompletas
9. Implementa SOLO UNA tarea por iteración
10. Prohibido comandos interactivos, procesos persistentes, o features no especificadas
EOF
)

  # Ejecutar Kiro CLI
  logfile="$LOG_DIR/iteration-${i}.log"
  echo "  Ejecutando kiro-cli..."
  echo "$prompt" | kiro-cli chat --no-interactive --trust-all-tools 2>&1 | tee "$logfile"

  # Verificar condición de salida
  uncompleted=$(grep -cE '^\- \[ \]' "${SPEC_DIR}/tasks.md" 2>/dev/null || echo "0")
  has_promise=$(grep -q "<promise>COMPLETE</promise>" "$logfile" && echo "yes" || echo "no")

  echo ""
  echo "  → Tareas pendientes: $uncompleted"
  echo "  → Promise COMPLETE: $has_promise"

  # Detectar falta de progreso
  if [ "$uncompleted" -eq "$prev_uncompleted" ]; then
    no_progress_count=$((no_progress_count + 1))
  else
    no_progress_count=0
  fi
  prev_uncompleted=$uncompleted

  # Condición de éxito
  if [ "$uncompleted" -eq 0 ] && [ "$has_promise" = "yes" ]; then
    echo ""
    echo "══════════════════════════════════════════"
    echo "  ✅ RALPH LOOP COMPLETADO"
    echo "  Iteraciones: $i"
    echo "  Fin: $(date)"
    echo "══════════════════════════════════════════"
    exit 0
  fi

  # Safety: abort si no hay progreso en 3 iteraciones
  if [ "$no_progress_count" -ge 3 ]; then
    echo ""
    echo "══════════════════════════════════════════"
    echo "  ⚠️  SIN PROGRESO en 3 iteraciones"
    echo "  Tareas pendientes: $uncompleted"
    echo "  Abortando. Revisar logs: $LOG_DIR"
    echo "══════════════════════════════════════════"
    exit 1
  fi
done

echo ""
echo "══════════════════════════════════════════"
echo "  ⚠️  MAX ITERACIONES ALCANZADO ($MAX_ITERATIONS)"
echo "  Tareas pendientes: $(grep -cE '^\- \[ \]' "${SPEC_DIR}/tasks.md" 2>/dev/null || echo '?')"
echo "  Revisar logs: $LOG_DIR"
echo "══════════════════════════════════════════"
exit 1
