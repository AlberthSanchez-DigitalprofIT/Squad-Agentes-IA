# Inventario de Agentes

> **Documento unificado** para identificar, actualizar y mantener los agentes del proyecto. Cada agente incluye: nombre, objetivo, MCPs, skills, tools, scripts, archivos de código y prompt.

---

## Índice de agentes

| # | Agente | Tipo | Regla/Prompt |
|---|--------|------|--------------|
| 1 | Orquestador (The Architect) | Steering | `.kiro/steering/00-swarm-orchestrator.md` |
| 2 | Knowledge Scout | Steering | `.kiro/steering/agent-scout.md` |
| 3 | Historian | Steering | `.kiro/steering/agent-historian.md` |
| 4 | Test Engineer | Steering | `.kiro/steering/agent-tech-guardian.md` |
| 5 | Platform Analyst | Steering | `.kiro/steering/agent-github-repos.md` |
| 6 | PO-Agile | Steering | `.kiro/steering/agent-po-agile.md` |
| 7 | Doc Updater | Steering | `.kiro/steering/agent-doc-updater.md` |
| 8 | Cloud SRE | Steering | `.kiro/steering/agent-cloud-sre.md` |
| 9 | Clarity Behavior | Steering | `.kiro/steering/agent-clarity-behavior.md` |
| 10 | Prompt Engineer | Steering (manual) | `.kiro/steering/agent-prompt-engineer.md` |
| 11 | Angular Developer | Steering | `.kiro/steering/agent-angular-developer.md` |
| 12 | Cloud Infra | Steering | `.kiro/steering/agent-cloud-infra.md` |
| 13 | AI Agent Ops | Steering | `.kiro/steering/agent-prompt-ops.md` |
| 14 | BI Strategist | Steering (manual) | `.kiro/steering/agent-bi-strategist.md` |
| 15 | Report Builder | Steering (manual) | `.kiro/steering/agent-report-builder.md` |
| 16 | Comms Analyst | Steering | `.kiro/steering/agent-comms-analyst.md` |
| 17 | Harness Engineer | Steering | `.kiro/steering/agent-harness-engineer.md` |
| 18 | Auditor | Steering | `.kiro/steering/agent-auditor.md` |

---

## 1. Orquestador (The Architect)

| Campo | Valor |
|-------|-------|
| **Nombre** | Orquestador / The Architect |
| **Objetivo** | Coordinar el enjambre: **decidir** qué agente especialista actúa en cada momento y **activarlo** vía subagentes. Gestionar el **presupuesto de tools MCP activas** (budget ≤ 50) decidiendo cuándo activar/desactivar tools temporalmente. No sustituir al especialista ejecutando MCP, CLI ni lectura/escritura del repo, salvo excepción explícita del usuario en ese turno. |
| **MCPs** | Ninguno en la sesión del Orquestador; el uso de MCP ocurre **solo** en subagentes (`atlassian`, `datadog`, `github`, etc.). |
| **Skills** | — |
| **Tools** | Subagentes (delegación). Texto al usuario (decisión de orquestación, aclaraciones, síntesis). |
| **Scripts** | `scripts/demo-agentes-run.js` (demo educativa) |
| **Archivos de código** | `.kiro/steering/00-swarm-orchestrator.md`, `.kiro/steering/01-plans-location.md` |
| **Otra información** | **inclusion: always**. Mapa Orquestador → agente en `00-swarm-orchestrator.md`. Planes en `Workspace/plans/`. |

---

## 2. Knowledge Scout (Explorador de Fuentes Documentales)

| Campo | Valor |
|-------|-------|
| **Nombre** | Knowledge Scout / Explorador de Fuentes Documentales |
| **Objetivo** | Leer y extraer información de todas las fuentes documentales: Jira, Confluence, Google Drive y AWS Docs. Responde: *¿Qué dice la documentación?* |
| **MCPs** | `atlassian` (Jira/Confluence), `google-drive` (Service Account: search_files, read_file_content, list_recent_files, get_file_metadata, get_file_permissions), `aws-docs` (search_documentation, read_documentation, read_sections) |
| **Archivos de código** | `.kiro/steering/agent-scout.md`. Referencia: `rules/AGENTS.md`. |
| **Regla de escritura Jira** | **Obligatorio:** Al crear o registrar en Jira, el prefijo **"Creado con IA"** debe ir en la **descripción**, no en el título. |
| **Otra información** | **fileMatch:** `Workspace/plans/**`, `**/platforms.json`, `docs/templates/**`. El Orquestador delega Scout vía subagente para usar MCP Jira. |

---

## 3. Historian (Fase de Contexto)

| Campo | Valor |
|-------|-------|
| **Nombre** | Historian / El experto en historia |
| **Objetivo** | Revisar código y cambios recientes para evitar repetir errores. Responde: *¿Qué impacto tendrá este cambio?* |
| **Tools** | Exploración del repo, `gh pr list`, `git log -n 5`, `tree -L 3` |
| **Archivos de código** | `.kiro/steering/agent-historian.md`. Referencia: `rules/AGENTS.md`. |
| **Otra información** | **fileMatch:** `**/*.{js,ts,tsx,cjs,mjs}`, `**/scripts/**`, `**/tests/**`, `**/tools/**`, `package.json`, `docs/**`. **Scope: repo actual.** |

---

## 4. Test Engineer (Calidad y Testing)

| Campo | Valor |
|-------|-------|
| **Nombre** | Test Engineer / Calidad y Testing |
| **Objetivo** | Validar que los tests E2E pasan. Self-healing de tests. Exigir cobertura mínima. |
| **MCPs** | Chrome DevTools MCP (`chrome-devtools-mcp`): declarado en `.kiro/settings/mcp.json`; **uso reservado** a este agente y al skill `prueba`. |
| **Skills** | `prueba` (`.kiro/skills/prueba/SKILL.md`) |
| **Tools** | `npx playwright test`; herramientas MCP de Chrome DevTools solo para depuración/rendimiento en contexto E2E |
| **Scripts** | `npm test`, `npm run test:ui`, `npx playwright test --project=miniverse` |
| **Archivos de código** | `.kiro/steering/agent-tech-guardian.md`, `tests/smoke.spec.js`, `tests/reportes.spec.js`, `playwright.config.js` |
| **Otra información** | **fileMatch:** `**/tests/**`, `playwright.config.js`, `**/*.spec.js`. Referencia cobertura: `docs/architecture/3-tech-stack-org.md` (70%). |

---

## 5. Platform Analyst (Analista de Plataforma)

| Campo | Valor |
|-------|-------|
| **Nombre** | Platform Analyst / Analista de Plataforma |
| **Objetivo** | Analizar repositorios externos de la plataforma. Responde: *¿Cómo está el código de la plataforma?* |
| **MCPs** | `github` (get_file_contents, list_pull_requests, list_commits, search_code, list_issues, search_repositories) |
| **Tools** | MCP GitHub, CLI `gh` |
| **Archivos de código** | `.kiro/steering/agent-github-repos.md`, `Workspace/**/config/platforms.json` |
| **Otra información** | **Scope: repos externos** definidos en `platforms[].github.repos`. Solo lectura. |

---

## 6. PO-Agile (Product Owner / Agile Master)

| Campo | Valor |
|-------|-------|
| **Nombre** | PO-Agile |
| **Objetivo** | Transformar requisitos en Historias de Usuario (INVEST, Dado-Cuando-Entonces). |
| **MCPs** | `atlassian` (opcional, para crear HU en Jira) |
| **Archivos de código** | `.kiro/steering/agent-po-agile.md` |
| **Regla de escritura Jira** | **Obligatorio:** Al crear HU en Jira, el prefijo **"Creado con IA"** debe ir en la **descripción**, no en el título. |
| **Otra información** | **fileMatch:** `Workspace/plans/**`, `**/docs/**`, `**/*.spec.md`, `**/platforms.json`. Proceso Chain-of-Thought obligatorio. |

---

## 7. Doc Updater (Experto en Documentación)

| Campo | Valor |
|-------|-------|
| **Nombre** | Doc Updater |
| **Objetivo** | Mantener la documentación viva. Actualizar `docs/` cuando el código cambia con una solución definitiva. |
| **MCPs** | `drawio-mcp` (`@drawio/mcp`): `open_drawio_xml`, `open_drawio_csv`, `open_drawio_mermaid` — **uso exclusivo** de este agente y skill `diagramas-drawio`. |
| **Skills** | `diagramas-drawio` (si se actualizan diagramas) |
| **Archivos de código** | `.kiro/steering/agent-doc-updater.md`, `.githooks/pre-commit` |
| **Otra información** | **fileMatch:** `**/*.{js,ts,tsx,cjs,mjs}`, `scripts/`, `tests/`, `tools/`, `miniverse/`, `docs/**`, `rules/**`. Trigger adicional: pre-commit hook. |

---

## 8. Cloud SRE (Site Reliability Engineer)

| Campo | Valor |
|-------|-------|
| **Nombre** | Cloud SRE / Site Reliability Engineer |
| **Objetivo** | Respuesta a incidentes y observabilidad cloud. Ciclo completo: alerta (Datadog) → diagnóstico de infra (AWS) → código (GitHub) → trazabilidad (Jira). Evolución del anterior "Cloud Agent Datadog Alert". |
| **MCPs** | `datadog`, `aws-api` (`call_aws`), `aws-docs`, `atlassian`, `github` |
| **Archivos de código** | `.kiro/steering/agent-cloud-sre.md`, `docs/templates/automation-datadog-alert-prompt.md`, `docs/runbook/automation-datadog-alert.md`, `Workspace/**/config/platforms.json` |
| **Archivo de prompt** | `.kiro/steering/agent-cloud-sre.md` (steering), `docs/templates/automation-datadog-alert-prompt.md` (prompt original) |
| **Otra información** | Variables de entorno: `PLATFORMS_JSON`, `JIRA_CLOUD_ID`, `JIRA_PROJECT_KEY`. Config: `datadog.serviceToRepos`, `github.repos`, `aws` en platforms.json. AWS solo lectura para diagnóstico. |

---

## 9. Clarity Behavior (Analista Clarity / UX comportamiento)

| Campo | Valor |
|-------|-------|
| **Nombre** | Clarity Behavior / Analista Clarity |
| **Objetivo** | Analizar comportamiento de usuarios reales con Microsoft Clarity vía MCP. |
| **MCPs** | `@microsoft/clarity-mcp-server`: `query-analytics-dashboard`, `list-session-recordings`, `query-documentation-resources` |
| **Tools** | Herramientas del MCP Clarity; autenticación con token JWT de exportación (`CLARITY_API_TOKEN`). |
| **Archivos de código** | `.kiro/steering/agent-clarity-behavior.md`, `docs/onboarding/02-playwright-mcp-config.md`, `docs/data/clarity-projects.md` |
| **Otra información** | **fileMatch:** `docs/**`, `**/ux/**`, `**/analytics/**`. No sustituye al Test Engineer en E2E. Respetar privacidad de datos de usuarios reales. |

---

## 10. Prompt Engineer (Diseñador de Prompts Avanzados)

| Campo | Valor |
|-------|-------|
| **Nombre** | Prompt Engineer / Diseñador de Prompts |
| **Objetivo** | Diseñar prompts avanzados, efectivos y optimizados para modelos de IA. Aplicar técnicas de prompting (CoT, Few-Shot, RAG, ReAct, Tree of Thoughts, etc.) y explicar las decisiones tomadas. |
| **MCPs** | Ninguno. Opera con conocimiento y razonamiento. |
| **Skills** | — |
| **Tools** | Texto al usuario (prompt creado + explicación + recomendaciones). Web search para benchmarks de modelos si se solicita. |
| **Archivos de código** | `.kiro/steering/agent-prompt-engineer.md` |
| **Otra información** | **inclusion: manual**. **NUNCA activado automáticamente por el Orquestador.** Solo bajo petición explícita del usuario. No aparece en el mapa de agentes del Orquestador. |

---

## 11. Angular Developer (Especialista Angular)

| Campo | Valor |
|-------|-------|
| **Nombre** | Angular Developer / Especialista Angular |
| **Objetivo** | Revisar y construir código Angular siguiendo mejores prácticas oficiales, patrones del proyecto existente y reglas organizacionales. Code review + generación de componentes, servicios, directivas, pipes, guards, interceptors y resolvers. |
| **MCPs** | Figma (Power) — para leer diseños e implementar componentes. |
| **Skills** | — |
| **Tools** | `readCode`, `readFile`, `grepSearch`, `fileSearch`, `fsWrite`, `strReplace`, `getDiagnostics`. Lectura y escritura de código Angular. |
| **Archivos de código** | `.kiro/steering/agent-angular-developer.md` |
| **Otra información** | **fileMatch:** `**/*.ts`, `**/*.html`, `**/*.scss`, `**/*.css`, `**/angular.json`, `**/tsconfig*.json`, `**/*.component.*`, `**/*.service.*`, `**/*.module.*`, `**/*.directive.*`, `**/*.pipe.*`, `**/*.guard.*`, `**/*.interceptor.*`, `**/*.resolver.*`. Sigue guía de estilo Angular oficial. TypeScript estricto obligatorio. Prohibido `any` sin justificación. |

---

## 12. Cloud Infra (Auditor de Infraestructura AWS)

| Campo | Valor |
|-------|-------|
| **Nombre** | Cloud Infra / Auditor de Infraestructura AWS |
| **Objetivo** | Auditoría, optimización y gobierno de infraestructura AWS. Costos (FinOps), seguridad, inventario de recursos, optimización y compliance de tagging. Responde: *¿Cómo está nuestra infraestructura y dónde podemos mejorar?* |
| **MCPs** | `aws-api` (`call_aws`), `aws-docs`, `atlassian` (opcional, para crear HUs de optimización) |
| **Archivos de código** | `.kiro/steering/agent-cloud-infra.md`, `Workspace/**/config/platforms.json` |
| **Otra información** | AWS solo lectura. Reportes en `Workspace/{plataforma}/reports/`. Evalúa contra `.iarules/rules-infrastructure.md` y `.iarules/rules-security.md`. Dominios: costos, inventario, seguridad, optimización, tagging. |

---

## 13. AI Agent Ops (Operaciones de Agentes IA)

| Campo | Valor |
|-------|-------|
| **Nombre** | AI Agent Ops / Operaciones de Agentes IA |
| **Objetivo** | Gestión operativa de prompts de agentes IA en producción (Langfuse) + lifecycle completo de agentes ADK en Google Cloud (scaffold, eval, deploy con `agents-cli`). Responde: *¿Cómo están nuestros agentes IA en producción y cómo los llevamos al siguiente nivel?* |
| **MCPs** | `langfuse`: `get-prompts` (listar prompts), `get-prompt` (obtener prompt específico con variables) |
| **CLI** | `agents-cli` v0.3.0: scaffold, eval, deploy, lint, publish de agentes ADK en GCP |
| **Skills** | — |
| **Tools** | Herramientas del MCP Langfuse + CLI `agents-cli` (create, eval, deploy, scaffold, infra, publish, lint). |
| **Scripts** | — |
| **Archivos de código** | `.kiro/steering/agent-prompt-ops.md`, `.kiro/steering/agent-gcp-agents-cli.md` |
| **Otra información** | **fileMatch:** `Workspace/**/prompts/**`, `**/langfuse/**`, `**/mia/**`, `**/agents-cli-manifest.yaml`, `**/adk/**`. Langfuse: solo lectura. agents-cli: requiere autenticación GCP para deploy. Complementario al Prompt Engineer (que diseña prompts del enjambre, no de producción). |

---

## 14. BI Strategist (Estratega de Inteligencia de Negocios)

| Campo | Valor |
|-------|-------|
| **Nombre** | BI Strategist / Estratega de Inteligencia de Negocios |
| **Objetivo** | Análisis estratégico de datos de negocio. Consultar dashboards (Power BI, Looker), extraer KPIs, comparar períodos (MoM, YoY), detectar anomalías, generar resúmenes ejecutivos con insights accionables. Responde: *¿Qué dicen los datos y qué debería hacer el negocio?* |
| **MCPs** | `powerbi` (Remote MCP Server — execute_query, get_semantic_model_schema, get_report_metadata, generate_query), `looker` (MCP Toolbox — queries en lenguaje natural), `google-drive` (lectura de Sheets como fuente alternativa para Looker Studio) |
| **Skills** | — |
| **Tools** | Herramientas de los MCPs Power BI y Looker. Google Drive MCP para Sheets. Solo lectura. |
| **Scripts** | — |
| **Archivos de código** | `.kiro/steering/agent-bi-strategist.md`, `Workspace/**/config/platforms.json` |
| **Otra información** | **inclusion: manual**. Solo lectura — nunca modifica modelos ni dashboards. No escribe en Jira — transmite hallazgos al Orquestador para delegación. Reportes en `Workspace/{plataforma}/reports/bi/`. Config de IDs en `platforms.json` sección `bi`. |

---

## 15. Report Builder (Constructor de Reportes HTML)

| Campo | Valor |
|-------|-------|
| **Nombre** | Report Builder / Constructor de Reportes HTML |
| **Objetivo** | Construir reportes, dashboards e informes ejecutivos en HTML estático. Transforma datos estructurados en artefactos visuales profesionales, consistentes y accesibles. Responde: *¿Cómo presentamos estos datos de forma clara y ejecutiva?* |
| **MCPs** | Ninguno. Opera exclusivamente con tools nativas de lectura/escritura. |
| **Skills** | — |
| **Tools** | `readFile`, `readCode`, `fsWrite`, `strReplace`, `listDirectory`, `fileSearch`, `getDiagnostics` |
| **Scripts** | — |
| **Archivos de código** | `.kiro/steering/agent-report-builder.md`, `docs/Asset/report-base.css`, `docs/Asset/report-components.css`, `docs/Asset/template-report.html`, `docs/Asset/template-report-index.html` |
| **Otra información** | **inclusion: manual**. Recibe datos ya procesados por otros agentes — no consulta MCPs de datos. Design system con variables CSS institucionales (tema dark). Reportes públicos en `docs/` (CSS externo), particulares en `Workspace/{plataforma}/reports/` (CSS inline autocontenido). Soporta branding por plataforma (Ciencuadras, Libertador, Huella, Fácil Pro). |

---

## 18. Auditor (Quality Reviewer)

| Campo | Valor |
|-------|-------|
| **Nombre** | Auditor / Quality Reviewer |
| **Modelo** | Gemini (Google) — distinto al resto del enjambre para independencia de criterio |
| **Objetivo** | Revisar el trabajo de los demás agentes, emitir juicios de calidad, y escribir hallazgos accionables. Responde: *¿El trabajo entregado cumple con los estándares?* |
| **MCPs** | Ninguno. Solo tools nativas de lectura + escritura en su propia memoria. |
| **Skills** | — |
| **Tools** | `readFile`, `grepSearch`, `fileSearch`, `writeFile` (SOLO en `Workspace/memory/auditor/`) |
| **Scripts** | — |
| **Archivos de código** | `.kiro/steering/agent-auditor.md` |
| **Otra información** | **inclusion: always**. Modelo Gemini para independencia de criterio. Audita: consistencia, completitud, calidad de código, seguridad, documentación, tests, harness compliance. Max 2 ciclos de corrección, luego escala al usuario. Juicios en `Workspace/memory/auditor/audit-{fecha}-{agente}-{tarea}.md`. |

---

## 17. Harness Engineer (Ingeniero del Harness)

| Campo | Valor |
|-------|-------|
| **Nombre** | Harness Engineer / Ingeniero del Harness |
| **Objetivo** | Mantener y evolucionar la infraestructura interna del enjambre: scripts transversales, hooks de enforcement, configuración de MCPs, telemetry y observabilidad del harness. Responde: *¿Cómo mejoramos el scaffolding que envuelve a los agentes?* |
| **MCPs** | Ninguno. Opera con tools nativas de lectura/escritura + shell (npm scripts). |
| **Skills** | — |
| **Tools** | `readFile`, `writeFile`, `shell` (npm test, npm run lint), `grepSearch`, `fileSearch` |
| **Scripts** | `scripts/harness-telemetry/`, `scripts/harness-evolution/` (futuro) |
| **Archivos de código** | `.kiro/steering/agent-harness-engineer.md`, `scripts/harness-telemetry/`, `.kiro/hooks/stop-conditions-guard.kiro.hook` |
| **Otra información** | **fileMatch:** `**/scripts/**`, `**/.kiro/hooks/**`, `**/.kiro/settings/**`, `**/tools/**`, `**/harness-telemetry/**`, `**/harness-evolution/**`. CommonJS, sin dependencias externas, JSDoc obligatorio, max 20 líneas/función. Scope de escritura: `scripts/`, `tools/scripts/`, `.kiro/hooks/`, `.kiro/steering/` (solo stop-conditions/context-compaction), `Workspace/telemetry/`. |

---

## 16. Comms Analyst (Analista de Comunicaciones Infobip)

| Campo | Valor |
|-------|-------|
| **Nombre** | Comms Analyst / Analista de Comunicaciones Infobip |
| **Objetivo** | Análisis y gestión de flujos de comunicación omnicanal usando Infobip. Consultar templates, logs, reportes de entrega, gestionar WhatsApp Flows y perfiles de contactos. Responde: *¿Cómo están nuestras comunicaciones y cómo optimizarlas?* |
| **MCPs** | 9 servidores remotos HTTP de Infobip: `whatsapp-flow`, `whatsapp`, `sms`, `email`, `2fa`, `people`, `search` (docs), `deep-research`, `account-management`. MCP local: `infobip-docs` (`explore`). |
| **Skills** | — |
| **Tools** | Herramientas de los MCPs Infobip. Solo lectura y gestión de templates/flujos. **NUNCA envío directo de mensajes.** |
| **Scripts** | — |
| **Archivos de código** | `.kiro/steering/agent-comms-analyst.md` |
| **Otra información** | **fileMatch:** `**/infobip/**`, `**/whatsapp/**`, `**/comms/**`, `**/communications/**`. Restricción crítica: prohibido enviar SMS, WhatsApp, Email, Voice, Push, Viber, RCS o PINs de 2FA. Auth: variable de entorno `INFOBIP_API_KEY`. Hook de enforcement: `infobip-mcp-guard`. |

---

## Reglas de soporte (no son agentes)

| Regla | Propósito |
|-------|-----------|
| `.kiro/steering/01-plans-location.md` | Planes en `Workspace/plans/` |
| `.kiro/steering/02-onboarding-first-interaction.md` | Validar MCPs/CLIs y crear platforms.json si no existe |
| `.kiro/steering/03-validacion-agnostico-particular.md` | Pregunta obligatoria: transversal vs particular al producto |
| `.kiro/steering/vitest-cli.md` | Scripts npm y patrones CLI para Vitest / cobertura |
| `.kiro/steering/04-playwright-cli-vs-mcp.md` | Cuándo usar Playwright Test (CLI) vs Playwright MCP |
| `.kiro/steering/project-rules.md` | Reglas generales del proyecto |

---

## Skills disponibles (reutilizables por agentes)

| Skill | Ubicación | Uso |
|-------|-----------|-----|
| **construir** | `.kiro/skills/construir/SKILL.md` | Build, commit, push a producción |
| **prueba** | `.kiro/skills/prueba/SKILL.md` | Playwright E2E, corrección de fallos, reintento |
| **diagramas-drawio** | `.kiro/skills/diagramas-drawio/SKILL.md` | Crear/editar diagramas con MCP drawio |

---

## Hooks de enforcement del enjambre

> Todos los hooks viven en `.kiro/hooks/` y se versionan con el repo. Al bajar la rama, cualquier usuario los carga automáticamente en Kiro.

### Control de acceso MCP (preToolUse)

| Hook | Archivo | Propósito |
|------|---------|-----------|
| `atlassian-write-guard` | `.kiro/hooks/atlassian-write-guard.kiro.hook` | Solo Scout, PO-Agile, Cloud SRE y Cloud Infra (opcional) pueden ESCRIBIR en Jira/Confluence |
| `clarity-mcp-guard` | `.kiro/hooks/clarity-mcp-guard.kiro.hook` | Solo Clarity Behavior puede usar MCP Clarity |
| `datadog-mcp-guard` | `.kiro/hooks/datadog-mcp-guard.kiro.hook` | Solo Cloud SRE puede usar MCP Datadog |
| `aws-api-guard` | `.kiro/hooks/aws-api-guard.kiro.hook` | Solo Cloud SRE y Cloud Infra pueden usar MCP AWS API (solo lectura) |
| `chrome-devtools-guard` | `.kiro/hooks/chrome-devtools-guard.kiro.hook` | Solo Test Engineer (skill prueba) puede usar Chrome DevTools MCP |
| `playwright-mcp-guard` | `.kiro/hooks/playwright-mcp-guard.kiro.hook` | Solo Test Engineer (skill prueba) puede usar Playwright MCP |
| `github-mcp-guard` | `.kiro/hooks/github-mcp-guard.kiro.hook` | Solo GitHub Repos y Cloud SRE pueden usar MCP GitHub |
| `google-drive-guard` | `.kiro/hooks/google-drive-guard.kiro.hook` | Solo Knowledge Scout puede usar MCP Google Drive |
| `drawio-mcp-guard` | `.kiro/hooks/drawio-mcp-guard.kiro.hook` | Solo Doc Updater (skill diagramas-drawio) puede usar MCP Draw.io |
| `langfuse-mcp-guard` | `.kiro/hooks/langfuse-mcp-guard.kiro.hook` | Solo Prompt Ops puede usar MCP Langfuse |
| `bi-mcp-guard` | `.kiro/hooks/bi-mcp-guard.kiro.hook` | Solo BI Strategist puede usar MCPs de Power BI y Looker |
| `infobip-mcp-guard` | `.kiro/hooks/infobip-mcp-guard.kiro.hook` | Solo Comms Analyst puede usar MCPs de Infobip |

### Seguridad (preToolUse)

| Hook | Archivo | Propósito |
|------|---------|-----------|
| `secrets-guard` | `.kiro/hooks/secrets-guard.kiro.hook` | Bloquea escritura de credenciales/tokens hardcodeados en código |
| `git-safety-guard` | `.kiro/hooks/git-safety-guard.kiro.hook` | Exige dry-run o stash antes de operaciones git destructivas |
| `jira-metadata-check` | `.kiro/hooks/jira-metadata-check.kiro.hook` | Obliga a consultar metadata de campos antes de crear issues en Jira |

### Delegación y orquestación (promptSubmit)

| Hook | Archivo | Propósito |
|------|---------|-----------|
| `swarm-delegation-enforcer` | `.kiro/hooks/swarm-delegation-enforcer.kiro.hook` | Obliga al Orquestador a evaluar delegación a especialista antes de responder |

### Calidad de código (fileEdited, fileCreated, postToolUse, postTaskExecution)

| Hook | Archivo | Tipo | Propósito |
|------|---------|------|-----------|
| `hardcoded-data-validator` | `.kiro/hooks/hardcoded-data-validator.kiro.hook` | postToolUse (write) | Detecta datos hardcodeados que deberían venir de platforms.json |
| `doc-updater-reminder` | `.kiro/hooks/doc-updater-reminder.kiro.hook` | fileEdited (código) | Recuerda actualizar docs/ cuando cambia código fuente |
| `agnostico-particular-check` | `.kiro/hooks/agnostico-particular-check.kiro.hook` | fileCreated (Workspace/, scripts/, tools/) | Valida si la acción es transversal o particular al producto |
| `lint-on-save` | `.kiro/hooks/lint-on-save.kiro.hook` | fileEdited (JS/TS) | Ejecuta ESLint al guardar archivos |
| `post-task-tests` | `.kiro/hooks/post-task-tests.kiro.hook` | postTaskExecution | Ejecuta `npm test` tras completar una tarea de spec |
| `stop-conditions-guard` | `.kiro/hooks/stop-conditions-guard.kiro.hook` | postToolUse | Detecta loops, errores consecutivos y falta de progreso — aplica reglas de `08-stop-conditions.md` |
| `memory-write-guard` | `.kiro/hooks/memory-write-guard.kiro.hook` | preToolUse (write) | Enforcea que cada agente solo escriba en su propia carpeta de memoria |

---

## Diagrama de referencia

| Diagrama | Descripción |
|----------|-------------|
| [equipo-agentes.html](../diagrams/equipo-agentes.html) | Equipo Orquestador → Scout, Historian, Test Engineer |
| [4-fases-protocolo.html](../diagrams/4-fases-protocolo.html) | 4 fases del protocolo |
| [flujo-automation-datadog-alert.html](../diagrams/flujo-automation-datadog-alert.html) | Cloud Agent Datadog (6 pasos) |
| [agentes-mcps-cli-skills-actividades.html](../diagrams/agentes-mcps-cli-skills-actividades.html) | Agentes ↔ MCPs, CLIs, skills |

---

## Agentes CLI (Kiro CLI)

> Los agentes CLI permiten ejecutar los especialistas del enjambre desde terminal vía `kiro-cli --agent <nombre>`. Cada agente tiene su propia configuración de tools, MCPs, hooks y permisos pre-aprobados. Viven en `.kiro/agents/`.

| # | Agente CLI | Archivo | Shortcut | MCPs | Tools principales |
|---|-----------|---------|----------|------|-------------------|
| 1 | Knowledge Scout | `.kiro/agents/knowledge-scout.json` | `ctrl+1` | Atlassian, Google Drive, AWS Docs | `read`, `@atlassian`, `@google-drive`, `@aws-docs` |
| 2 | Test Engineer | `.kiro/agents/guardian.json` | `ctrl+2` | Playwright, Chrome DevTools | `read`, `write`, `shell`, `@playwright`, `@chrome-devtools` |
| 3 | Historian | `.kiro/agents/historian.json` | `ctrl+3` | — | `read`, `shell` (git, gh) |
| 4 | Platform Analyst | `.kiro/agents/platform-analyst.json` | `ctrl+4` | GitHub | `read`, `shell` (gh), `@github` |
| 5 | Cloud SRE | `.kiro/agents/cloud-sre.json` | `ctrl+5` | Datadog, AWS API, GitHub, Atlassian | `read`, `write`, `shell`, `@datadog`, `@aws-api`, `@github`, `@atlassian` |
| 6 | Cloud Infra | `.kiro/agents/cloud-infra.json` | `ctrl+6` | AWS API, Atlassian | `read`, `write`, `shell`, `@aws-api`, `@atlassian` |

### Uso desde terminal

```bash
# Iniciar sesión con un agente específico
kiro-cli --agent scout

# Dentro de una sesión, cambiar de agente
/agent swap

# Listar agentes disponibles
/agent list
```

### Diseño de cada agente CLI

- **Prompt:** Apunta al steering existente del agente (`file://../steering/agent-*.md`).
- **MCPs:** Cada agente declara solo los MCPs que necesita (`includeMcpJson: false`).
- **Tools:** Restringidos al mínimo necesario. `allowedTools` pre-aprueba operaciones de lectura.
- **Resources:** Carga steering, lineamientos Jira, contexto de plataforma y `platforms.json`.
- **Hooks:** `agentSpawn` para contexto inicial. `preToolUse` para validaciones de escritura en Jira.
- **Seguridad:** Credenciales vía variables de entorno. Sin secretos en archivos.

### Agentes NO incluidos en CLI (y por qué)

| Agente | Razón |
|--------|-------|
| Orquestador | Es el agente default del IDE. No opera aislado. |
| Doc Updater | Necesita Draw.io MCP (visual). Mejor en IDE. |
| PO-Agile | Su valor principal es interactivo. Opcional futuro. |
| Clarity Behavior | MCP requiere token manual y login web. Opcional futuro. |
| Prompt Engineer | Manual, conversacional. No gana nada en CLI. |

---

## Cómo actualizar un agente

1. **Steering (1–7, 9):** Editar el `.md` en `.kiro/steering/`.
2. **Cloud Agent (8):** Editar `docs/templates/automation-datadog-alert-prompt.md`.
3. **MCPs/Skills:** Actualizar este documento y el steering correspondiente.
4. **Agente CLI:** Editar el `.json` en `.kiro/agents/`. El prompt apunta al steering, así que cambios en steering se reflejan automáticamente.
5. **Nuevo agente:** Añadir entrada en este inventario, fila en `00-swarm-orchestrator.md` y crear steering en `.kiro/steering/`. Si aplica CLI, crear `.kiro/agents/<nombre>.json`.
6. **Harness Engineer (17):** Para scripts transversales y hooks, editar `.kiro/steering/agent-harness-engineer.md`. Scripts en `scripts/harness-telemetry/` y `scripts/harness-evolution/`.

---

## Referencias

- [5-agents-functional-architecture.md](./5-agents-functional-architecture.md) — Documento para negocio
- [runbook/automation-datadog-alert.md](../runbook/automation-datadog-alert.md) — Configuración Cloud Agent
- [Kiro CLI — Custom Agents](https://kiro.dev/docs/cli/custom-agents/) — Documentación oficial
- [Kiro CLI — Configuration Reference](https://kiro.dev/docs/cli/custom-agents/configuration-reference) — Referencia de campos
