# ADR-007: Mantener Portal ELI (con pendiente de validación)

**Estado:** Aceptada (con pendiente de validación)  
**Fecha:** 2026-05-09  
**Decisores:** Equipo de Arquitectura — Squad Agentes IA  
**Contexto:** Migración Huella (Oracle B2C Service → Stack AWS)

---

## Contexto

ELI es un portal web utilizado por inmobiliarias para:
- Solicitar desocupaciones de inmuebles
- Validar estado de cuenta en SAI (regla 4-2-10)
- Registrar solicitudes que luego se procesan en Huella

El flujo actual es: Inmobiliaria ingresa a ELI, ELI valida en SAI, si procede registra en Huella.

## Decisión

**Mantener Portal ELI como está.** La nueva plataforma recibirá las solicitudes de ELI en lugar de Huella Oracle.

## Pendiente de Validación

> Se debe validar qué es exactamente Portal ELI — su stack tecnológico, equipo responsable, cómo se comunica con Huella (API, webhook, formulario), y si es un desarrollo propio o de terceros.

## Opciones Evaluadas

| Opción | Descripción | Descartada por |
|--------|-------------|----------------|
| **Mantener (elegida)** | Conservar ELI, apuntar a nueva API | — |
| Integrar | Módulo dentro de la nueva plataforma | Esfuerzo innecesario en Fase 1; requiere onboarding de inmobiliarias |
| Reescribir | Nuevo portal para inmobiliarias | Mayor esfuerzo; no es prioritario |

## Consecuencias

### Positivas
- Cero impacto para las inmobiliarias (no cambian de portal)
- Menor scope de migración
- ELI sigue funcionando mientras se estabiliza la nueva plataforma
- Cambio mínimo: solo el endpoint destino de las solicitudes

### Negativas
- Dependencia de un sistema externo no controlado
- UX desconectada de la nueva plataforma
- Sin observabilidad sobre el portal ELI

### Riesgos
- Si ELI no puede cambiar su endpoint destino fácilmente, puede requerir un adaptador/proxy
- La validación de regla 4-2-10 en SAI debe seguir funcionando

## Acciones Derivadas

1. **Investigar Portal ELI** — Identificar: stack, equipo responsable, protocolo de comunicación con Huella, capacidad de cambiar endpoint
2. **Definir API de recepción** — Endpoint en la nueva plataforma que reciba solicitudes de ELI
3. **Validar regla 4-2-10** — Confirmar que la validación en SAI sigue funcionando con la nueva plataforma
4. **Plan de cutover** — Coordinar con equipo ELI el cambio de endpoint (Huella Oracle a nueva plataforma)

## Notas

- En una fase posterior (Fase 3+), se puede evaluar integrar la funcionalidad de ELI como módulo de la nueva plataforma
- La prioridad es que las inmobiliarias no se vean afectadas durante la migración
