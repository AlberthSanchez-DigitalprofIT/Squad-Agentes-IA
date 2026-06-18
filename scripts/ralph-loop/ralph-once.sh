#!/bin/bash
# Ralph Once — Una sola iteración del Ralph Loop (debug)
# Uso: ./scripts/ralph-loop/ralph-once.sh [spec_path]

set -euo pipefail
SPEC_DIR="${1:-.kiro/specs/current}"
exec ./scripts/ralph-loop/afk-ralph.sh 1 "$SPEC_DIR"
