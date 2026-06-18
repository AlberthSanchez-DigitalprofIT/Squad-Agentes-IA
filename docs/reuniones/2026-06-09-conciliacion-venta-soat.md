# Informe Ejecutivo — Conciliación Venta de SOAT

**Fecha:** 9 de junio de 2026  
**Asistentes:** Lina Marcela Sanchez Borda, Andrés Camilo Tao Romero, Daniela Vargas Guerrero, Daniel Felipe Salazar López, Alberth D'Angelo Sanchez Novoa

---

## 1. Resumen Ejecutivo

**Objetivo:** Definir la estructura, datos y proceso para generar el informe de conciliación financiera de ventas de SOAT con la aseguradora Axa.

**Contexto:** Proyectiva recauda pagos de SOAT a través de un gateway y debe devolver el recaudo a Axa periódicamente (cada 15 días), además de calcular y facturar comisiones. No existe actualmente un proceso automatizado para la conciliación — se requiere construir el primer informe operativo.

**Temas tratados:**
- Estructura del reporte de conciliación (campos obligatorios)
- Cálculo de comisiones (fórmula: valor × 77% × tasa)
- Identificación del ente emisor para escalabilidad multi-aseguradora
- Estrategia de reintentos para transacciones rechazadas
- Acceso a reportes del gateway para mercadeo
- Resolución de error técnico con Axa (Parameter Store AWS)

**Decisiones tomadas:**
- El reporte se genera vía script SQL desde base de datos de producción
- Se incluirá el cálculo de comisiones en el mismo archivo consolidado
- No se desarrollará interfaz gráfica (queda para estratégico)
- Se explorará con Sonia la parametrización del módulo de conciliación de Helpit

---

## 2. Puntos Clave

1. El reporte de conciliación debe incluir: número de póliza, ente emisor, placa del vehículo, valor recaudado y cálculo de comisión.
2. La fórmula de comisión es: valor recaudado × 77% (deducciones Runt/Simovit) × tasa de comisión (actualmente 8%).
3. El sistema no tiene identificador del ente emisor — por ahora se asume Axa, pero es obligatorio antes de integrar Mundial.
4. El link de pago tiene vigencia de 4 días — es posible reintentar transacciones rechazadas dentro de ese plazo.
5. Mercadeo requiere reportes diarios de producción — se puede resolver con acceso directo al gateway sin desarrollo adicional.
6. Se radicó ticket de infraestructura para actualizar parámetros de Axa en AWS (clave punto de venta, clave red, clave convenio).
7. La conciliación tiene dos momentos: (1) devolución de recaudo a Axa y (2) cálculo y facturación de comisiones.

---

## 3. Acuerdos y Decisiones

| # | Acuerdo / Decisión | Responsable | Fecha compromiso | Observaciones |
|---|-------------------|-------------|------------------|---------------|
| 1 | Reporte consolidado generado por script SQL en producción | Andrés Tao | Semana 9-13 jun | Unirá datos gateway + emisión de póliza |
| 2 | Incluir cálculo de comisiones en mismo archivo | Andrés Tao | Junto con reporte | Fórmula: valor × 77% × tasa |
| 3 | No desarrollar front de conciliación (estratégico) | Equipo | N/A | Evaluar Helpit como alternativa |
| 4 | Orquestador debe informar ente emisor | Alberth Sanchez | Próximo desarrollo | Necesario antes de Mundial |
| 5 | Acceso gateway para mercadeo vía Danilo Mora | Alberth + Daniela | Por gestionar | Sin desarrollo adicional |
| 6 | Pieza de comunicación para reintentos será definida con mercadeo | Alberth Sanchez | Por definir | Con Sebastián y Tatiana |

---

## 4. Compromisos y Pendientes

| # | Actividad | Responsable | Fecha objetivo | Estado | Dependencias / Riesgos |
|---|-----------|-------------|----------------|--------|----------------------|
| 1 | Crear reporte conciliación consolidado (SQL) | Andrés Tao | Semana 9-13 jun | Pendiente | Ticket DBA producción |
| 2 | Implementar ente emisor en orquestador | Alberth Sanchez | Próximo sprint | Pendiente | Coordinación con equipo orquestador |
| 3 | Validar proceso Axa con Luis (cómo recibe información) | Daniela Vargas | 9 jun | Pendiente | Disponibilidad de Luis |
| 4 | Revisar módulo conciliación Helpit con Sonia | Daniela Vargas | Por definir | Pendiente | Verificar parametrización |
| 5 | Reunión con mercadeo (Sebastián, Tatiana, Danilo) | Alberth Sanchez | Por agendar | Pendiente | Acceso reportes + pieza reintento |
| 6 | Definir pieza comunicación reintento de pago | Alberth Sanchez | Por definir | Pendiente | Con mercadeo |
| 7 | Revisar pieza gráfica transacciones rechazadas | Alberth Sanchez | Por definir | Pendiente | Depende de mercadeo |
| 8 | Reunión flujo estratégico (listar pendientes) | Alberth + Lina | 10 jun, 9-10am | Pendiente | — |
| 9 | Gestionar acceso a grabaciones/Drive | Lina Sanchez | 10 jun | Pendiente | Charlie + centro de costos |
| 10 | Consultar centro de costos Proyectiva a Daniela | Alberth Sanchez | 9 jun | Pendiente | Necesario para gestión de accesos |
| 11 | Resolver ticket infraestructura AWS (Parameter Store) | Infraestructura | 9 jun (tarde) | En curso | Bloqueante para pruebas Axa |
| 12 | Confirmar tasa de comisión definitiva | Daniela Vargas (vía Jimena/Luis) | Por definir | Pendiente | ¿Sigue siendo 8%? |

---

## 5. Próximos Pasos

### Alta
1. Resolver ticket infraestructura AWS — desbloquear pruebas con Axa
2. Crear reporte de conciliación consolidado (script SQL)
3. Reunión flujo estratégico (10 jun, 9-10am)
4. Validar con Luis cómo recibe la información Axa

### Media
5. Agendar reunión con mercadeo (acceso + pieza reintento)
6. Revisar módulo conciliación Helpit con Sonia
7. Confirmar tasa de comisión definitiva
8. Gestionar acceso a grabaciones/Drive

### Baja
9. Definir pieza gráfica de reintento (estratégico)
10. Evaluar implementación de notificación a mercadeo para pagos pendientes
11. Investigar experiencia real de entrega de póliza al cliente

---

## 6. Riesgos y Bloqueos

| # | Riesgo / Bloqueo | Impacto | Mitigación |
|---|-----------------|---------|-----------|
| 1 | Ticket infra no atendido a tiempo | No se hacen pruebas con Axa → retraso producción | Correo escalado a Juan Camilo Espina |
| 2 | Conciliación manual no escala | Depende de equipo técnico cada 15 días | Evaluar Helpit / automatización futura |
| 3 | Sin identificador de aseguradora | No se puede conciliar si entra Mundial | Implementar ente emisor en próximo sprint |
| 4 | Tasa de comisión sin confirmar | Puede haber discrepancia en facturación | Daniela validará con Jimena/Luis |
| 5 | Mecanismo de entrega de póliza desconocido | Incertidumbre en experiencia cliente | Solicitar experiencia a Axa |
| 6 | Acceso a producción requiere ticket DBA | Cada ejecución de conciliación tiene latencia | Proceso manual temporal |

---

## 7. Preguntas Abiertas

1. ¿Cuál es la tasa de comisión definitiva? (¿Sigue siendo 8%?)
2. ¿Cómo se entrega la póliza al cliente final? (¿Link SMS o PDF?)
3. ¿El módulo de conciliación de Helpit puede parametrizarse para estos campos y cálculos?
4. ¿Cuándo se atenderá el ticket de infraestructura AWS?
5. ¿Qué información exacta contiene el reporte de Axa? (validar con Luis)
6. ¿Quién operará la ejecución del script SQL periódicamente? (¿Siempre requiere ticket DBA?)
7. ¿Cuál será el formato/canal de la pieza de reintento? (correo, SMS, push)

---

## 8. Resumen para Envío por Correo

> **Asunto: Resumen — Conciliación Venta SOAT (9 junio 2026)**
>
> Equipo, resumen de acuerdos de la sesión de conciliación:
>
> 1. Tao generará el reporte consolidado vía script SQL esta semana. Incluirá: póliza, ente emisor, placa, valor recaudado y cálculo de comisión (valor × 77% × tasa).
> 2. Se radicó ticket de infraestructura para corregir parámetros de Axa en AWS — pendiente resolución para pruebas con Postman.
> 3. Daniela validará con Luis cómo recibe Axa la información y confirmará la tasa de comisión con Jimena.
> 4. Daniela revisará con Sonia la viabilidad de parametrizar el módulo de conciliación de Helpit.
> 5. Alberth agendará reunión con mercadeo (Sebastián, Tatiana, Danilo) para acceso a reportes y definición de pieza de reintento.
> 6. Mañana 10 jun (9-10am): sesión para revisar flujo estratégico y priorizar pendientes.
> 7. El ente emisor se incluirá en próximo desarrollo del orquestador (obligatorio antes de Mundial).
>
> Confirmen avances. Gracias.

---

## Acciones Prioritarias para Seguimiento (Top 5)

| # | Acción | Responsable | Criticidad |
|---|--------|-------------|-----------|
| 1 | Resolver ticket AWS Parameter Store | Infraestructura | 🔴 Crítica |
| 2 | Crear reporte conciliación consolidado (SQL) | Andrés Tao | 🔴 Crítica |
| 3 | Revisar flujo estratégico y listar pendientes (10 jun) | Alberth + Lina | 🟠 Alta |
| 4 | Validar proceso de conciliación Axa con Luis | Daniela Vargas | 🟠 Alta |
| 5 | Agendar reunión con mercadeo | Alberth Sanchez | 🟠 Alta |
