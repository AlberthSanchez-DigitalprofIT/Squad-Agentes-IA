[Requirements]
__REQ__

[Design]
__DES__

[Task List]
__TASKS__

[Progress]
__PROGRESS__

[Auditor Findings]
__AUDITOR__

## Instrucciones

1. Revisa el task list y progress — encuentra la siguiente tarea incompleta ([ ])
2. Implementa ESA SOLA tarea siguiendo el diseño y patrones existentes del proyecto
3. Ejecuta tests: `npm run test:unit` (NUNCA `npm test` que lanza Playwright)
4. Si tests pasan: marca [x] en tasks.md, haz commit con mensaje descriptivo, actualiza progress.txt
5. Si tests fallan: corrige y reintenta (max 3 intentos por iteración)
6. Escribe resumen en tu carpeta de memoria: `Workspace/memory/{agente}/{fecha}-{tarea}.md`
7. Solo output `<promise>COMPLETE</promise>` cuando NO queden tareas [ ] en tasks.md Y tests pasen
8. NUNCA output `<promise>COMPLETE</promise>` si hay tareas incompletas

## Restricciones

- Implementa SOLO UNA tarea por iteración
- Prohibido usar comandos interactivos o que esperen input del usuario
- Prohibido iniciar procesos persistentes (servidores, watchers, listeners)
- Prohibido inventar features no especificadas en Requirements o Design
- Prohibido modificar archivos fuera del scope de la tarea actual
- Si hay hallazgos del Auditor pendientes sobre ti: resuélvelos ANTES de la nueva tarea
- Sigue las convenciones: ESLint, Prettier, JSDoc, max 20 líneas/función
