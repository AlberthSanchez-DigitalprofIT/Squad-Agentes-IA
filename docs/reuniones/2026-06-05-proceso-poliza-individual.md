# Informe Ejecutivo — Revisemos Proceso de Póliza Individual

**Fecha:** 5 de junio de 2026  
**Asistentes:** Wilber Giovanny Barrera Monroy, Gonzalo Chaparro López, Lina Marcela Sanchez Borda, Paola Andrea Muñoz Real, Luis Alberto Vásquez Soriano, Paola Andrea García Izquierdo, Sandra Patricia Posada Calderón, Carlos Andrés Patiño Vélez, Cristian David Carreño Ruiz, Norma Piedad Moreno Salazar, Alberth D'Angelo Sanchez Novoa

---

## 1. Resumen Ejecutivo

**Objetivo:** Definir la estrategia de modernización tecnológica para el proceso de póliza individual de arrendamiento, eliminando procesos manuales y unificando sistemas.

**Contexto:** El proceso actual de póliza individual opera fuera del stack tecnológico aprobado, con un cotizador web vulnerable, datos en Excel personal, y dependencia de procesos manuales. Se busca migrar toda la gestión a SAI con automatización mediante un motor de suscripción.

**Temas tratados:**
- Vulnerabilidades del cotizador actual (fuera de stack)
- Desconexión entre Tronador, SAI y Simón Web
- Propuesta de nuevo modelo: zona pública/privada + motor de suscripción + API de emisión
- Distribución de responsabilidades técnicas (Squad Proyectiva vs. Línea de Negocio)
- Integración con estudio digital y CRMs de inmobiliarias
- Manejo de excepciones y límites para brokers

**Decisiones tomadas:**
- Migrar gestión completa de póliza individual a SAI
- Crear motor de suscripción con OpenL para reglas dinámicas
- Desarrollar API de emisión de pólizas individuales
- Squad Proyectiva se encarga del frontend; Línea de Negocio del backend/motor/APIs
- Casos complejos se escalarán automáticamente a operaciones

---

## 2. Puntos Clave

1. El cotizador actual está fuera del stack tecnológico — genera vulnerabilidades de seguridad y riesgo de fuga de información.
2. Las solicitudes se almacenan en Excel personal — riesgo crítico de pérdida de datos.
3. Tronador está subutilizado y hay desconexión con SAI en el flujo de póliza individual.
4. El motor de suscripción evaluará condiciones en tiempo real y activará el estudio digital automáticamente si no hay uno vigente.
5. OpenL permitirá al negocio parametrizar reglas sin depender de tecnología.
6. La unificación en SAI habilitará pagos de siniestros en menos de 24 horas (vs. ~8 días actuales).
7. El nuevo modelo permite escalar integrando APIs directamente con CRMs de inmobiliarias.
8. Se requiere presentación ante gerencia (Juan Manuel y Paola) para aprobación.

---

## 3. Acuerdos y Decisiones

| # | Acuerdo / Decisión | Responsable | Fecha compromiso | Observaciones |
|---|-------------------|-------------|------------------|---------------|
| 1 | Póliza individual se gestiona 100% en SAI | Equipo línea negocio | Q3-Q4 2026 | Elimina dependencia Tronador |
| 2 | Motor de suscripción con OpenL (reglas dinámicas) | Sandra Posada / equipo línea negocio | Q3-Q4 2026 | Negocio parametriza sin tecnología |
| 3 | API de emisión de pólizas individuales | Equipo línea negocio | Q3-Q4 2026 | Conecta motor → SAI automáticamente |
| 4 | Squad Proyectiva: frontend (zona pública/privada, cotizador, emisor) | Squad Proyectiva | Q3-Q4 2026 | Dentro del stack tecnológico |
| 5 | Equipo línea negocio: motor + SAI + APIs | Sandra Posada | Q3-Q4 2026 | Incluye preparación SAI |
| 6 | Escalamiento automático de casos complejos a operaciones | Motor de suscripción | Diseño | No todo manual, pero excepciones van a persona |
| 7 | Incluir renovaciones en el nuevo esquema | Sandra Posada | Q3-Q4 2026 | Ajustar proceso actual |
| 8 | Incluir revocaciones y devolución de primas | Sandra Posada | Q3-Q4 2026 | Tiempos y procedimientos claros |

---

## 4. Compromisos y Pendientes

| # | Actividad | Responsable | Fecha objetivo | Estado | Dependencias / Riesgos |
|---|-----------|-------------|----------------|--------|----------------------|
| 1 | Desarrollar zona pública/privada + cotizador + emisor | Squad Proyectiva | Q3-Q4 2026 | Pendiente | Definir equipo |
| 2 | Construir motor de suscripción (OpenL) | Equipo línea negocio | Q3-Q4 2026 | Pendiente | Definir reglas con negocio |
| 3 | Preparar SAI para nuevas integraciones | Equipo línea negocio | Q3-Q4 2026 | Pendiente | — |
| 4 | Crear API de emisión pólizas individuales | Equipo línea negocio | Q3-Q4 2026 | Pendiente | SAI listo |
| 5 | Validar API estudio digital existente | Equipo línea negocio | Por definir | Pendiente | ¿Funcional bajo nuevo modelo? |
| 6 | Definir criterios de escalamiento (automático vs. manual) | Grupo completo | Por definir | Pendiente | Reglas de negocio |
| 7 | Incluir contexto macro en presentación | Cristian Carreño | Antes de reunión con gerencia | Pendiente | Diferenciar colectiva vs. individual |
| 8 | Revisar presentación antes de exponerla | Grupo completo | Antes de reunión con gerencia | Pendiente | Validar puntos acordados |
| 9 | Compartir presentación final al equipo | Cristian Carreño | Al confirmar sesión con gerencia | Pendiente | — |
| 10 | Ajustar proceso de renovaciones | Sandra Posada | Q3-Q4 2026 | Pendiente | Incluir mejoras identificadas |
| 11 | Integrar revocaciones y devolución de primas | Sandra Posada | Q3-Q4 2026 | Pendiente | Definir tiempos |
| 12 | Documentar reglas motor (canon, cuota administración) | Sandra Posada | Por definir | Pendiente | Validar con certificado tradición/libertad |
| 13 | Involucrar equipo comercial en construcción | Cristian Carreño | Fase de diseño | Pendiente | Casos especiales |

---

## 5. Próximos Pasos

### Alta
1. Preparar y revisar presentación para gerencia (Juan Manuel y Paola)
2. Incluir contexto macro (colectiva vs. individual) en la presentación
3. Definir criterios de escalamiento (qué va automático vs. manual)
4. Validar si la API de estudio digital existente funciona bajo el nuevo modelo

### Media
5. Documentar reglas de negocio para el motor de suscripción
6. Involucrar al equipo comercial en la definición funcional
7. Ajustar proceso de renovaciones con las mejoras necesarias
8. Definir tiempos y procedimientos de revocaciones

### Baja
9. Evaluar integración futura con CRMs de inmobiliarias
10. Analizar discrepancias en valores (canon vs. administración)
11. Considerar certificado de tradición y libertad como validación

---

## 6. Riesgos y Bloqueos

| # | Riesgo / Bloqueo | Impacto | Mitigación |
|---|-----------------|---------|-----------|
| 1 | Cotizador actual vulnerable (fuera de stack) | Fuga de información, riesgo de seguridad activo | Migración planificada en roadmap |
| 2 | Datos en Excel personal | Pérdida de datos de solicitudes | Migración a SAI elimina el problema |
| 3 | Dependencia de aprobación de gerencia | Todo el proyecto depende de presentación exitosa | Preparar presentación con contexto macro y beneficios claros |
| 4 | API de estudio digital no validada | Si no funciona, retrasa el flujo automatizado | Validar antes de construir motor |
| 5 | Complejidad de reglas de negocio | Puede retrasar parametrización del motor | OpenL permite ajustes dinámicos sin tech |
| 6 | Distribución de responsabilidades entre squads | Posibles cuellos de botella si un equipo se retrasa | Definir dependencias claras y milestones |
| 7 | Proceso de renovaciones no incluido inicialmente | Afecta experiencia agencia/broker | Sandra lo incluirá en las mejoras |

---

## 7. Preguntas Abiertas

1. ¿Cuándo se confirma la reunión con Juan Manuel y Paola para presentar el proyecto?
2. ¿La API de estudio digital existente es funcional bajo el nuevo modelo?
3. ¿Cuáles son los valores/límites exactos que separan lo automático de lo manual en el motor?
4. ¿Cómo se resolverán las discrepancias entre valor del canon y cuota de administración?
5. ¿Se requiere validación con certificado de tradición y libertad en todos los casos?
6. ¿Cuál es la tasa de comisión para póliza individual? ¿Es diferente de SOAT?
7. ¿Qué capacidad de equipo hay para ejecutar frontend y backend en paralelo?

---

## 8. Resumen para Envío por Correo

> **Asunto: Resumen — Proceso Póliza Individual (5 junio 2026)**
>
> Equipo, resumen de la sesión:
>
> 1. Se acordó migrar la gestión completa de póliza individual a SAI, eliminando la dependencia de Tronador y los procesos manuales con Excel.
> 2. Se creará un motor de suscripción con OpenL que evaluará condiciones en tiempo real y escalará automáticamente casos complejos a operaciones.
> 3. Se desarrollará una API de emisión que conectará el motor con SAI de forma automatizada.
> 4. Distribución de responsabilidades: Squad Proyectiva → Frontend (zona pública/privada, cotizador, emisor). Equipo Línea de Negocio → Motor + SAI + APIs.
> 5. Se incluirán renovaciones, revocaciones y devolución de primas en el nuevo modelo.
> 6. Cristian preparará la presentación para gerencia incluyendo el contexto macro (colectiva vs. individual). El equipo la revisará antes de exponerla.
> 7. Pendiente: validar si la API de estudio digital funciona bajo el nuevo modelo y definir los criterios exactos de escalamiento.
>
> Por favor revisar y complementar antes de la sesión con gerencia. Gracias.

---

## Acciones Prioritarias para Seguimiento (Top 5)

| # | Acción | Responsable | Criticidad |
|---|--------|-------------|-----------|
| 1 | Preparar y revisar presentación para gerencia | Cristian Carreño + equipo | 🔴 Crítica |
| 2 | Validar API estudio digital bajo nuevo modelo | Equipo línea negocio | 🔴 Crítica |
| 3 | Definir criterios escalamiento (auto vs. manual) | Grupo completo | 🟠 Alta |
| 4 | Documentar reglas de negocio para motor de suscripción | Sandra Posada | 🟠 Alta |
| 5 | Involucrar equipo comercial en definición funcional | Cristian Carreño | 🟠 Alta |
