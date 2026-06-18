# ADR-005: Integrar Correo Electrónico con Salesforce

**Estado:** Aceptada  
**Fecha:** 2026-05-09  
**Decisores:** Equipo de Arquitectura — Squad Agentes IA  
**Contexto:** Migración Huella (Oracle B2C Service → Stack AWS)

---

## Contexto

Huella utiliza Oracle Mailbox para comunicaciones por correo electrónico:
- **Buzón Service (POP/IMAP):** Recibe correos y crea incidentes automáticamente
- **Buzón Outreach (SMTP):** Envía campañas y encuestas
- **Plantillas:** Campos de fusión dinámicos para personalización
- **Funcionalidades:** Cambio de notificaciones, estado de notificaciones, envío masivo, historial por contrato, reenvío de fallidos, adjuntos, programación diferida, reportes de entregabilidad

## Decisión

**Integrar el canal de correo electrónico con Salesforce** como plataforma unificada de comunicaciones.

Salesforce gestionará tanto el envío como la recepción de correos, las campañas, las plantillas con campos dinámicos y la creación automática de casos a partir de correos entrantes.

## Opciones Evaluadas

| Opción | Descripción | Descartada por |
|--------|-------------|----------------|
| AWS SES + Lambda | SES para envío, Lambda para recepción | No se alinea con estrategia de comunicaciones unificada en Salesforce |
| SendGrid | Envío + recepción con Inbound Parse | Proveedor externo adicional; fragmenta la gestión de comunicaciones |
| **Integrar Salesforce (elegida)** | Salesforce como plataforma de comunicaciones | — |

## Consecuencias

### Positivas
- Plataforma unificada de comunicaciones (correo + SMS en un solo lugar — ADR-004)
- Creación automática de casos desde correos entrantes (Email-to-Case nativo)
- Plantillas con merge fields nativos
- Tracking de apertura y clics
- Historial de comunicaciones centralizado por contacto/caso
- Campañas de email marketing con segmentación
- Cumplimiento de regulaciones (opt-out, CAN-SPAM)

### Negativas
- Costo de licenciamiento Salesforce
- Dependencia de plataforma externa
- Migración de plantillas existentes (campos de fusión Oracle a merge fields Salesforce)
- Integración bidireccional con la nueva plataforma

### Riesgos
- La lógica de "correo entrante crea incidente" debe replicarse fielmente
- Volumen de correos puede requerir tier específico de Salesforce
- Sincronización de datos de contacto entre sistemas

## Acciones Derivadas

1. **Definir módulo Salesforce** — Service Cloud (Email-to-Case) + Marketing Cloud (campañas)
2. **Migrar plantillas** — Extraer plantillas actuales y recrear con merge fields de Salesforce
3. **Configurar Email-to-Case** — Replicar lógica de creación de incidentes desde correos entrantes
4. **Diseñar integración** — Sincronización de casos/incidentes entre nueva plataforma y Salesforce
5. **Migrar buzones** — Configurar dominios y buzones en Salesforce

## Notas

- Salesforce unifica SMS (ADR-004) y correo en una sola plataforma de comunicaciones
- Se debe evaluar si WhatsApp Business también se integra via Salesforce (Digital Engagement)
- La nueva plataforma (backend Node.js/Java) se comunicará con Salesforce via REST API
