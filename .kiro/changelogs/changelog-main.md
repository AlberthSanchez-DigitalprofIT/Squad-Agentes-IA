# Changelog — main

## [No publicado]

### Agregado
- Se creó inventario funcional HTML de la plataforma Indemnizaciones (Tribu Servicios & Operaciones / Squad Operaciones) en `Workspace/Tribu Servicios y Operaciones - Operaciones/Indemnizaciones/inventario-funcional-indemnizaciones.html`
- Se exploró la plataforma DEV: Angular 16.2.12, Java 11 + Spring Boot 2.3.4, AWS (S3, CloudFront, API Gateway, Lambda)
- Se identificaron 13 operaciones API del microservicio `comunes-poliza-siniestros-ms`
- Se documentaron 6 ramos con 14+ coberturas y flujo de formulario de 4 pasos
- Se identificaron 5 hallazgos técnicos (CORS, fuentes corruptas, repos incorrectos) y 8 items de deuda técnica
- Se documentó Clever Indemnizaciones (Backoffice): 6 módulos, 14 rutas, estructura completa del sistema de gestión interna
- Se documentó módulo Listar Radicaciones (`/listar-radicaciones`): tabla, búsqueda, paginación, panel detalle con 6 secciones
- Se validó radicado CL-186717743: póliza null, error interno en creación de reserva, 5/8 documentos adjuntos
- Se catalogaron 8 documentos requeridos para cobertura Renta Diaria y 3 sub-estados disponibles
- Se identificaron 4 tipos de error en "Rta Creación de Reserva" incluyendo conflicto de concurrencia MongoDB
