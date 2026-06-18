# ADR-004: Integrar SMS con Salesforce

**Estado:** Aceptada  
**Fecha:** 2026-05-09  
**Decisores:** Equipo de Arquitectura — Squad Agentes IA  
**Contexto:** Migración Huella (Oracle B2C Service → Stack AWS)

---

## Contexto

Huella utiliza un proveedor externo de SMS para:
- Campañas SMS (único, transaccional, recurrente)
- SMS automáticos al crear siniestros
- Control de horarios hábiles y festivos
- Límite de 160 caracteres por SMS

El módulo de SMS tiene 8 Custom Objects dedicados (paquete CampanaSMS) y funcionalidades de envío individual, masivo, plantillas, tracking de entrega, programación y reportes.

## Decisión

**Integrar el canal SMS con Salesforce** como plataforma de comunicaciones.

Salesforce gestionará el envío de SMS, las campañas, el tracking y los reportes, aprovechando sus capacidades nativas de marketing automation y comunicación multicanal.

## Opciones Evaluadas

| Opción | Descripción | Descartada por |
|--------|-------------|----------------|
| Mantener proveedor actual | Conservar proveedor SMS externo | Dependencia de proveedor; sin observabilidad AWS; posible costo alto |
| AWS SNS/Pinpoint | Servicio managed de AWS | No se alinea con la estrategia de comunicaciones unificada en Salesforce |
| **Integrar Salesforce (elegida)** | Salesforce como plataforma de comunicaciones | — |

## Consecuencias

### Positivas
- Plataforma unificada de comunicaciones (SMS + correo en un solo lugar)
- Capacidades avanzadas de marketing automation
- Tracking y analytics nativos
- Gestión de campañas con segmentación avanzada
- Cumplimiento de horarios y regulaciones integrado
- Historial de comunicaciones centralizado por contacto

### Negativas
- Costo de licenciamiento Salesforce
- Dependencia de plataforma externa (Salesforce)
- Curva de aprendizaje para el equipo
- Integración bidireccional necesaria entre nueva plataforma y Salesforce

### Riesgos
- Latencia en la integración (SMS automáticos al crear siniestros deben ser inmediatos)
- Complejidad de migración de plantillas y lógica de campañas existentes
- Necesidad de sincronizar datos de contactos entre sistemas

## Acciones Derivadas

1. **Definir alcance Salesforce** — Determinar qué módulos de Salesforce se usarán (Marketing Cloud, Service Cloud, etc.)
2. **Diseñar integración** — API REST o eventos entre la nueva plataforma y Salesforce
3. **Migrar plantillas SMS** — Extraer plantillas actuales y recrear en Salesforce
4. **Configurar horarios** — Replicar lógica de horarios hábiles y festivos en Salesforce
5. **Definir SLA de envío** — Garantizar que SMS automáticos se envíen en menos de 30 segundos

## Notas

- La integración con Salesforce también cubrirá el canal de correo electrónico (ADR-005)
- Se debe evaluar si Salesforce también gestionará WhatsApp Business (integración por confirmar)
- Los datos de contacto (arrendatarios, inmobiliarias) deben sincronizarse con Salesforce
