# ADR-003: Replicar Funcionalidad de SA Web (UI Propia)

**Estado:** Aceptada (con pendiente de investigación)  
**Fecha:** 2026-05-09  
**Decisores:** Equipo de Arquitectura — Squad Agentes IA  
**Contexto:** Migración Huella (Oracle B2C Service → Stack AWS)

---

## Contexto

Actualmente, tres funcionalidades de SA Web se renderizan dentro de Huella via iFrames:
1. **Liquidación** — Visualización y gestión de liquidaciones
2. **Histórico de siniestros** — Consulta de historial
3. **Histórico de bitácoras** — Consulta de gestiones anteriores

Huella es solo una "ventana" — no procesa ni almacena estos datos. Los scripts de carga están en el Gestor de Archivos de Oracle Service Cloud.

## Decisión

**Replicar la funcionalidad con UI propia** en la nueva plataforma (Angular 17+).

Se construirán vistas propias que repliquen la funcionalidad de liquidación, histórico de siniestros e histórico de bitácoras, con UX consistente con el resto de la nueva plataforma.

## Pendiente de Investigación

> ⚠️ **Se debe identificar qué es exactamente SA Web** — su stack, APIs disponibles, equipo responsable y fuente de datos. Sin esta información no se puede determinar de dónde se obtendrán los datos para las nuevas vistas.

## Opciones Evaluadas

| Opción | Descripción | Descartada por |
|--------|-------------|----------------|
| Mantener iFrames | Conservar embebidos de SA Web | UX inconsistente; dependencia; sin control de estilos ni performance |
| **Replicar funcionalidad (elegida)** | Nueva UI propia en Angular | — |
| Consumir via API | Datos de SA con UI propia | Requiere que SA exponga APIs (no confirmado) |

## Consecuencias

### Positivas
- UX consistente con la nueva plataforma
- Control total de la experiencia de usuario
- Performance optimizada (sin overhead de iFrames)
- Observable y testeable

### Negativas
- Esfuerzo de desarrollo para replicar 3 vistas
- Requiere fuente de datos (API de SA Web o datos propios)
- Posible duplicación de datos si no hay API disponible

### Riesgos
- Si SA Web no expone APIs, se necesitará otra fuente de datos
- La lógica de presentación de SA Web puede ser más compleja de lo visible

## Acciones Derivadas

1. **Investigar SA Web** — Identificar: stack tecnológico, equipo responsable, APIs disponibles, fuente de datos
2. **Definir fuente de datos** — Determinar si los datos vienen de SAI, Oracle DB, o una API de SA
3. **Diseñar vistas** — Wireframes de las 3 funcionalidades en la nueva plataforma
4. **Implementar en Angular** — Componentes standalone con TypeScript estricto

## Notas

- Si SA Web no tiene APIs, evaluar si los datos de liquidación e históricos pueden obtenerse directamente de la nueva base de datos PostgreSQL (que contendrá los datos migrados)
- Las vistas son de solo lectura/consulta — no requieren lógica de escritura compleja
