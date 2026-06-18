# ADR-001: Mantener Bus de Servicios On-Premise

**Estado:** Aceptada  
**Fecha:** 2026-05-09  
**Decisores:** Equipo de Arquitectura — Squad Agentes IA  
**Contexto:** Migración Huella (Oracle B2C Service → Stack AWS)

---

## Contexto

El bus de servicios on-premise orquesta la comunicación bidireccional entre SAI (Sistema de Administración de Inmuebles) y Huella. Contiene lógica de transformación de datos y es el primer punto de diagnóstico cuando hay desincronización entre sistemas.

SAI es la fuente de verdad de toda la información de cobranza y alimenta a Huella con siniestros, pólizas, contratos, amparos, aumentos y estados de pago en tiempo real.

## Decisión

**Mantener el bus de servicios on-premise actual.**

La nueva plataforma se conectará al bus existente de la misma forma que Huella Oracle lo hace hoy. No se reemplaza ni se migra el bus en esta fase.

## Opciones Evaluadas

| Opción | Descripción | Descartada por |
|--------|-------------|----------------|
| API Gateway AWS | Reemplazar bus por ALB + API Gateway | Riesgo alto de migración de integraciones; SAI es on-premise |
| Comunicación directa | Servicio a servicio sin intermediario | Acoplamiento fuerte; sin capa de abstracción |
| **Mantener bus (elegida)** | Conservar bus actual | — |

## Consecuencias

### Positivas
- Cero riesgo de migración de integraciones con SAI
- SAI no requiere cambios
- Menor scope de la migración (se enfoca en Huella, no en infraestructura de integración)
- Continuidad operativa garantizada durante la transición

### Negativas
- Dependencia on-premise persiste
- Opacidad de la lógica del bus (gap documental pendiente)
- No observable con Datadog (punto ciego)
- Punto único de fallo se mantiene

### Riesgos
- Si el bus falla, la nueva plataforma también se ve afectada
- La lógica de transformación del bus sigue sin documentar (gap crítico #2)

## Acciones Derivadas

1. **Documentar contratos del bus** — Obtener endpoints exactos y lógica de transformación (gap #2 del levantamiento)
2. **Monitorear el bus** — Evaluar si se puede agregar observabilidad al bus sin modificarlo (health checks externos)
3. **Evaluar migración futura** — En una fase posterior, considerar migrar el bus a API Gateway AWS cuando SAI también se modernice

## Notas

- Esta decisión aplica para la Fase 1 de la migración
- Se revisará cuando se aborde la modernización de SAI
