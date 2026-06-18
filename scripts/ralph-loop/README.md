# Ralph Loop — Squad Agentes IA

Ejecución autónoma de tareas con Kiro CLI. El agente corre en loop con fresh context por iteración hasta completar todas las tareas de un spec.

## Uso rápido

```bash
# Ejecutar loop completo (max 15 iteraciones)
./scripts/ralph-loop/afk-ralph.sh 15 .kiro/specs/mi-feature

# Una sola iteración (debug)
./scripts/ralph-loop/ralph-once.sh .kiro/specs/mi-feature
```

## Prerequisitos

- `kiro-cli` instalado y en PATH
- Specs generados en `.kiro/specs/{feature}/` (requirements.md, design.md, tasks.md)
- Tests unitarios configurados (`npm run test:unit`)
- Hooks del harness activos (seguridad automática)

## Cómo funciona

1. Lee specs + progress + hallazgos del auditor
2. Ejecuta `kiro-cli chat --no-interactive --trust-all-tools`
3. El agente implementa UNA tarea, ejecuta tests, hace commit
4. Verifica: ¿todas las tareas completadas? ¿Output COMPLETE?
5. Si no → descarta contexto → siguiente iteración
6. Si sí → éxito → invocar Auditor para revisión

## Safety

| Protección | Mecanismo |
|-----------|----------|
| Comandos destructivos | `command-allowlist-guard` hook |
| Escritura fuera de scope | `filesystem-scope-guard` hook |
| Loop infinito | max_iterations + detección de 3 iteraciones sin progreso |
| Secrets hardcodeados | `secrets-guard` hook |
| Calidad | Auditor (Gemini) revisa al final |

## Logs

Cada iteración genera un log en `/tmp/ralph-logs/iteration-N.log`.

## Personalización

Edita `ralph-prompt-template.md` para ajustar instrucciones del agente.
