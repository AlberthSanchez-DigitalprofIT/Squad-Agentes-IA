# ADR-002: Reescribir Microservicio ImagineCX (Paz y Salvo)

**Estado:** Aceptada  
**Fecha:** 2026-05-09  
**Decisores:** Equipo de Arquitectura — Squad Agentes IA  
**Contexto:** Migración Huella (Oracle B2C Service → Stack AWS)

---

## Contexto

El microservicio ImagineCX (~2 años en producción) orquesta tres procesos críticos:
1. Paz y Salvo
2. Terminación de siniestros
3. Desocupación

Es mantenido por el proveedor ImagineCX, corre fuera de Huella y tiene comunicación casi inmediata con SAI. Resuelve la latencia anterior entre Huella y SAI.

## Decisión

**Reescribir el microservicio como un servicio propio** en el stack aprobado de la organización.

Se construirá un nuevo servicio que replique la lógica de paz y salvo, terminación de siniestros y desocupación, con diseño limpio, stack moderno y observabilidad completa.

## Opciones Evaluadas

| Opción | Descripción | Descartada por |
|--------|-------------|----------------|
| Mantener | Conservar microservicio ImagineCX | Dependencia de proveedor externo; caja negra; sin observabilidad |
| Internalizar | Absorber lógica en servicio existente | Mezcla responsabilidades; no es un servicio dedicado |
| **Reescribir (elegida)** | Nuevo servicio propio | — |

## Consecuencias

### Positivas
- Control total del código y la lógica
- Observable con Datadog (APM, logs, métricas)
- Sin dependencia de ImagineCX para mantenimiento
- Stack moderno (Node.js 20 + Express o Java 21 + Spring Boot)
- Diseño limpio alineado con estándares organizacionales
- CI/CD con GitHub Actions

### Negativas
- Esfuerzo de desarrollo significativo
- Riesgo de bugs al replicar lógica no documentada
- Requiere entender completamente la lógica actual antes de reescribir

### Riesgos
- La lógica interna del microservicio ImagineCX puede no estar completamente documentada
- Período de transición donde ambos servicios coexisten

## Acciones Derivadas

1. **Documentar lógica actual** — Solicitar a ImagineCX documentación técnica del microservicio (endpoints, flujos, reglas)
2. **Definir stack** — Elegir entre Node.js/Express o Java/Spring Boot según complejidad de la lógica
3. **Diseñar API** — Definir contratos OpenAPI del nuevo servicio
4. **Implementar con tests** — Cobertura mínima 80% en lógica de negocio
5. **Migración gradual** — Dual-run durante transición para validar paridad funcional

## Notas

- El nuevo servicio se desplegará en AWS ECS Fargate
- Se integrará con AWS Step Functions para la orquestación de los flujos
- La comunicación con SAI se mantiene via el bus de servicios (ADR-001)
