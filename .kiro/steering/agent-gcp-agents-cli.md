---
inclusion: manual
---
# CAPACIDAD: Google Agents CLI (ADK Lifecycle)

> Capacidad asignada al **AI Agent Ops** para la construcción, evaluación y despliegue de agentes de IA en Google Cloud usando `agents-cli`.

## Qué es

Google Agents CLI (`agents-cli`) es una herramienta CLI + skills de Google que permite construir, evaluar y desplegar agentes de IA sobre Google Cloud. Los agentes se construyen con el Agent Development Kit (ADK) de Google. Agents CLI maneja scaffolding, evaluación, deployment y observabilidad.

- **Versión instalada:** 0.3.0
- **Instalación:** `uv tool install google-agents-cli` (ya instalado globalmente)
- **Documentación oficial:** https://google.github.io/agents-cli/
- **Repo:** https://github.com/google/agents-cli
- **PyPI:** https://pypi.org/project/google-agents-cli/

## Prerrequisitos

| Requisito | Estado | Comando de verificación |
|-----------|--------|------------------------|
| Python 3.11+ | ✅ | `python3 --version` |
| uv | ✅ | `which uv` |
| Node.js | ✅ | `node --version` |
| Google Cloud SDK | Opcional (deploy) | `gcloud --version` |
| Terraform | Opcional (infra) | `terraform --version` |

## Autenticación

```bash
# Opción 1: Si gcloud está autenticado, usa ADC automáticamente
gcloud auth application-default login

# Opción 2: API key de AI Studio (para desarrollo local)
# Configurar variable de entorno GEMINI_API_KEY

# Verificar estado de autenticación
agents-cli login --status
```

## Comandos principales

### Ciclo de vida básico

```bash
# Crear un proyecto de agente
agents-cli create my-agent --prototype --yes

# Instalar dependencias
cd my-agent && agents-cli install

# Lanzar playground local (http://localhost:8080)
agents-cli playground

# Ejecutar agente con un prompt
agents-cli run "Describe what you can do"
```

### Scaffolding

```bash
# Crear con template específico
agents-cli create my-agent --agent adk --deployment-target agent_runtime --yes

# Crear agente RAG
agents-cli create rag-agent --agent agentic_rag --yes

# Crear sistema multi-agente A2A
agents-cli create multi-agent --agent adk_a2a --yes

# Mejorar proyecto existente (añadir CI/CD, deployment)
agents-cli scaffold enhance . --deployment-target cloud_run --cicd-runner github_actions

# Actualizar a nueva versión de agents-cli
agents-cli scaffold upgrade .
```

### Evaluación

```bash
# Generar trazas de evaluación
agents-cli eval generate --dataset tests/eval/datasets/basic-dataset.json

# Calificar trazas
agents-cli eval grade --traces artifacts/traces/ --metrics final_response_quality

# Generar + calificar en un solo paso
agents-cli eval run --dataset eval_cases.json --metrics final_response_quality

# Sintetizar dataset de evaluación automáticamente
agents-cli eval dataset synthesize -n 10 --max-turns 5

# Analizar clusters de fallos
agents-cli eval analyze --eval-result artifacts/grade_results/results.json

# Optimizar prompts automáticamente (framework GEPA)
agents-cli eval optimize --dataset eval_cases.json --target-metric final_response_quality

# Comparar dos evaluaciones
agents-cli eval compare baseline.json candidate.json
```

### Deployment

```bash
# Deploy a Agent Runtime (default)
agents-cli deploy --project my-gcp-project --region us-east1

# Deploy dry-run (preview sin ejecutar)
agents-cli deploy --dry-run

# Listar deployments existentes
agents-cli deploy --list

# Deploy async (no esperar)
agents-cli deploy --no-wait
agents-cli deploy --status
```

### Infraestructura

```bash
# Configurar CI/CD completo
agents-cli infra setup-cicd --staging-project proj-stg --prod-project proj-prd --cicd-runner github_actions --apply

# Provisionar infra single-project (preview)
agents-cli infra single-project --project my-project

# Provisionar datastore para RAG
agents-cli infra datastore --project my-project --region us-central1
```

### Publicación

```bash
# Registrar agente en Gemini Enterprise
agents-cli publish gemini-enterprise --interactive
```

### Utilidades

```bash
# Ver info del proyecto
agents-cli cmd-info --json

# Lint del código
agents-cli lint --fix

# Actualizar skills en coding agents
agents-cli update
```

## Templates disponibles

| Template | Descripción | Uso |
|----------|-------------|-----|
| `adk` | Agente básico ADK (single agent) | Chatbots, asistentes, bots programados |
| `adk_a2a` | Multi-agente con protocolo A2A | Coordinación entre agentes especializados |
| `agentic_rag` | RAG con retrieval integrado | Knowledge bases, Q&A sobre documentos |

## Targets de deployment

| Target | Cuándo usar |
|--------|-------------|
| `agent_runtime` | Default. Managed by Google. Sin infra que gestionar. |
| `cloud_run` | Serverless containers. Mayor control. |
| `gke` | Kubernetes. Máximo control, muchas instancias concurrentes. |

## Estructura de proyecto generada

```
my-agent/
├── agents-cli-manifest.yaml    # Configuración del proyecto
├── pyproject.toml               # Dependencias Python
├── my_agent/                    # Código del agente ADK
│   ├── __init__.py
│   ├── agent.py                 # Definición del agente
│   └── tools.py                 # Herramientas del agente
├── tests/
│   └── eval/
│       └── datasets/
│           └── basic-dataset.json
├── artifacts/                   # Trazas y resultados de eval
├── deployment/                  # Config de deployment (si no --prototype)
└── terraform/                   # IaC (si no --prototype)
```

## Cuándo usar agents-cli

| Situación | Acción |
|-----------|--------|
| Crear nuevo agente IA para GCP | `agents-cli create` |
| Evaluar calidad de un agente existente | `agents-cli eval run` |
| Optimizar prompts de un agente | `agents-cli eval optimize` |
| Desplegar agente a producción GCP | `agents-cli deploy` |
| Configurar CI/CD para agente | `agents-cli infra setup-cicd` |
| Añadir deployment a proyecto existente | `agents-cli scaffold enhance` |

## Cuándo NO usar agents-cli

- Para agentes que NO van a GCP (usar las herramientas del stack aprobado).
- Para modificar agentes del enjambre local (los steerings se editan directamente).
- Para tests E2E de frontend (usar Playwright, skill `prueba`).
- Para consultar infraestructura AWS existente (usar Cloud Infra / Cloud SRE).

## Integración con el enjambre

El **AI Agent Ops** opera `agents-cli` cuando el Orquestador delega tareas de:
- Scaffolding de nuevos agentes ADK
- Ejecución de evaluaciones
- Deployment a GCP
- Lint y verificación de proyectos de agentes

El flujo típico es:
1. **Orquestador** recibe petición de crear/evaluar/desplegar agente ADK.
2. **AI Agent Ops** ejecuta los comandos `agents-cli` correspondientes.
3. **Doc Updater** actualiza documentación si el cambio es definitivo.
4. **PO-Agile** crea HUs en Jira si se necesita seguimiento.

## Restricciones de seguridad

- **Nunca hardcodear** API keys o credenciales GCP en código.
- Usar variables de entorno o Secret Manager.
- Los proyectos creados deben seguir las reglas de `rule-security.md`.
- Deployment solo a ambientes autorizados (seguir `org-rules-devops.md`).
- Validar que dependencias generadas sean legítimas (no typosquatting).

## Limitaciones conocidas

- Solo agentes Python (no Go, Java, TypeScript nativos).
- No soporta real-time voice/video.
- Enfocado en Google Cloud — no multi-cloud.
- Requiere autenticación GCP para deploy y evaluación cloud.

## Referencias

- Documentación: https://google.github.io/agents-cli/
- Getting Started: https://google.github.io/agents-cli/guide/getting-started/
- CLI Reference: https://google.github.io/agents-cli/cli/
- Use Cases: https://google.github.io/agents-cli/guide/use-cases/
- Templates: https://google.github.io/agents-cli/guide/templates/
- Evaluation: https://google.github.io/agents-cli/guide/evaluation/
- Deployment: https://google.github.io/agents-cli/guide/deployment/
