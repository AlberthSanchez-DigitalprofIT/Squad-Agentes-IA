# ADR-006: AWS Step Functions como Motor de Procesos (BPM)

**Estado:** Aceptada  
**Fecha:** 2026-05-09  
**Decisores:** Equipo de Arquitectura — Squad Agentes IA  
**Contexto:** Migración Huella (Oracle B2C Service → Stack AWS)

---

## Contexto

Huella opera como un BPM (Business Process Management) con:
- Flujos de trabajo configurables con 15+ estados
- Transiciones definidas entre estados
- Reglas de negocio embebidas en los flujos
- Escalamientos automáticos por tiempo (timers)
- Asignación automática de tareas
- Gateways exclusivos (XOR) y paralelos (AND)
- Eventos de mensaje, error y señal

Los 4 procesos core son:
1. **Cobranza Jurídica** — Muy alta complejidad (15 estados de alistamiento, distribución regional, tiempos procesales)
2. **Cobranza Pre-Jurídica** — Alta complejidad (motor de scoring, múltiples canales, acuerdos con seguimiento)
3. **Desistimiento** — Alta complejidad (flujo multi-actor, liquidaciones con jerarquía 3 niveles)
4. **Desocupación** — Media complejidad (flujo más lineal, validaciones externas)

## Decisión

**AWS Step Functions para flujos principales + state machines en código para lógica simple.**

- Los 4 procesos core se implementarán como Step Functions (Standard Workflows).
- La lógica simple (validaciones, asignaciones, cálculos) se implementará como state machines en el backend (patrón State en código).
- El motor de scoring se implementará como un servicio independiente invocado por Step Functions.

## Opciones Evaluadas

| Opción | Descripción | Descartada por |
|--------|-------------|----------------|
| State machines en código (custom) | Todo en código | Difícil de mantener con 15+ estados; no visual; cambios requieren deploy |
| Temporal.io | Durable workflows open-source | Curva de aprendizaje; infraestructura adicional (Temporal Server) |
| **AWS Step Functions (elegida)** | Managed + state machines en código | — |

## Consecuencias

### Positivas
- Managed — Sin infraestructura que mantener (serverless)
- Visual — Facilita documentación y debugging (ASL visual en consola AWS)
- Integración nativa — Se integra con Lambda, ECS, SES, SNS, SQS, DynamoDB
- Timers nativos — Wait states para SLAs y escalamientos automáticos
- Parallel states — Para actividades simultáneas (notificar + actualizar)
- Error handling — Catch/Retry nativos para resiliencia
- Observable — CloudWatch + Datadog integration
- Versionable — Definiciones ASL en código (IaC con Terraform)

### Negativas
- Costo por transición de estado (puede ser significativo con alto volumen)
- Vendor lock-in con AWS
- Limitaciones en flujos muy complejos (máximo 25,000 eventos por ejecución)
- ASL (Amazon States Language) tiene curva de aprendizaje

### Riesgos
- Volumen de 789K siniestros puede generar muchas ejecuciones concurrentes
- Flujos de larga duración (procesos jurídicos pueden durar meses) requieren Standard Workflows (no Express)
- Cambios en flujos requieren nueva versión del Step Function

## Arquitectura de Implementación

### Componentes

| Componente | Tecnología | Responsabilidad |
|-----------|-----------|-----------------|
| Step Functions (Standard) | AWS Step Functions | Orquestación de los 4 procesos core |
| Scoring Service | Lambda o ECS Task | Motor de priorización (puntaje compuesto) |
| Asignación Service | Lambda | Distribución regional y por carga |
| Notificación Service | Lambda invoca Salesforce API | Envío de SMS/correo via Salesforce |
| CRUD Service | ECS Fargate (backend principal) | Operaciones sobre PostgreSQL |
| Timer/Scheduler | Step Functions Wait + EventBridge | SLAs y escalamientos automáticos |

### State Machines en Código (lógica simple)

Para lógica que no requiere orquestación compleja:
- Validaciones de entrada (Pydantic/Zod)
- Cálculos de liquidación
- Transiciones de estado simples (ej. Vigente a Terminado)
- Asignación por regla directa (ciudad a grupo)

Se implementarán como patrón State en el backend (Node.js/Express o Java/Spring Boot).

## Acciones Derivadas

1. **Modelar flujos en ASL** — Traducir los 4 procesos BPMN a Amazon States Language
2. **Implementar Scoring Service** — Lambda con lógica de priorización configurable
3. **Definir eventos de trigger** — Qué inicia cada Step Function (creación de siniestro, mora, solicitud)
4. **Configurar timers** — Wait states para SLAs por estado (documentar tiempos exactos)
5. **Integrar con Salesforce** — Notificaciones via API desde Lambda
6. **Definir IaC** — Terraform para Step Functions, Lambdas y permisos IAM
7. **Tests de flujo** — Validar cada camino del proceso con datos de prueba

## Notas

- Standard Workflows (no Express) para procesos de larga duración (jurídicos pueden durar meses)
- El motor de scoring es un servicio independiente para facilitar cambios en pesos/variables sin modificar el flujo
- EventBridge Rules para triggers basados en tiempo (ej. "si no hay pago en 30 días, escalar")
- Los 15 estados de alistamiento jurídico se modelan como Choice states en Step Functions
