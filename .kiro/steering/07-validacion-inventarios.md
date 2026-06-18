---
inclusion: manual
---

# Validación de Inventarios Funcionales

Reglas agnósticas para validar inventarios funcionales de cualquier plataforma o producto de terceros. Aplican cuando un agente documenta, revisa o migra un sistema existente.

---

## 1. Regla de Cruce contra Documentación Oficial del Vendor

Cuando se documenta un producto de terceros (CRM, ERP, SaaS, PaaS), **nunca declarar un inventario como completo** sin cruzarlo contra la documentación oficial del fabricante.

**Flujo obligatorio:**
1. Identificar el producto y versión exacta.
2. Buscar en la documentación oficial del vendor: módulos disponibles, APIs, tipos de automatización, componentes de UI.
3. Comparar lo que el vendor ofrece vs lo que la organización usa/documenta.
4. Reportar gaps como "capacidades del producto no documentadas en el inventario".

**Aplica a:** Knowledge Scout, Platform Analyst, cualquier agente que documente sistemas de terceros.

---

## 2. Regla de Lógica de Negocio Invisible

Las plataformas empresariales tienen **lógica de negocio configurada** que no es visible en la interfaz de usuario ni en el código fuente propio. Esta lógica es crítica para migraciones.

**Siempre preguntar por:**
- Reglas de negocio / Business Rules (condición → acción)
- Reglas de automatización de UI (triggers en formularios)
- Workflows / flujos de aprobación configurados
- Reglas de escalamiento y notificación automática
- Scripts o guías de asistencia para agentes
- Extensiones o plugins instalados por terceros

**Aplica a:** PO-Agile (al crear HUs de migración), Knowledge Scout (al levantar inventarios), Platform Analyst (al analizar repos).

---

## 3. Regla de Cruce Código vs Documentación

Cuando existe un repositorio de integración (middleware, APIs, ETL), **cruzar las entidades del código contra la documentación funcional**. Las discrepancias revelan gaps.

**Patrón:**
1. Extraer del código: DTOs, endpoints, constantes de objetos, tablas de BD.
2. Extraer de la documentación funcional: entidades, módulos, objetos documentados.
3. Comparar ambas listas.
4. Toda entidad en código pero no en documentación = gap a investigar.
5. Toda entidad en documentación pero no en código = funcionalidad sin integración.

**Aplica a:** Historian (al explorar repos), Platform Analyst (al analizar repos externos).

---

## 4. Regla de Completitud por Capas

Un inventario funcional está completo solo cuando cubre **todas las capas** del sistema:

| Capa | Qué documentar | Fuente |
|------|---------------|--------|
| **UI/Frontend** | Pantallas, flujos de navegación, campos visibles | Exploración directa o screenshots |
| **Lógica de negocio** | Reglas, validaciones, cálculos, workflows | Configuración de la plataforma |
| **Datos** | Entidades, campos, relaciones, volumetría | Schema/API metadata |
| **Integraciones** | Sistemas conectados, protocolos, frecuencia | Documentación técnica + código |
| **Automatización** | Reglas automáticas, triggers, notificaciones | Configuración admin |
| **Seguridad** | Perfiles, permisos, roles, grupos | Panel de administración |
| **Reportería** | Reportes, queries, dashboards | Módulo de analytics |

Si alguna capa no está documentada, el inventario tiene gaps.

**Aplica a:** Todos los agentes que participen en levantamiento de información.

---

## 5. Regla de Búsqueda Web como Validación

La documentación oficial de vendors está disponible públicamente en internet. **Usar búsqueda web proactivamente** para:

- Confirmar que una funcionalidad existe en el producto (no es custom).
- Descubrir capacidades del producto que la organización no usa.
- Obtener la lista oficial de APIs/recursos disponibles.
- Verificar limitaciones o deprecaciones del producto.

**No esperar a que el usuario pida buscar.** Si el agente está documentando un producto de terceros, la búsqueda web es parte del proceso estándar.

**Aplica a:** Knowledge Scout, Orquestador (modo validación).

---

## 6. Modo Validación del Orquestador

Cuando el usuario pida "validar" un documento o inventario existente, el Orquestador activa este flujo:

1. **Knowledge Scout:** Buscar documentación oficial del vendor vía web.
2. **Historian / Platform Analyst:** Cruzar código del repo contra lo documentado.
3. **Orquestador:** Consolidar gaps, clasificar por impacto, generar plan de acción con responsables y cronograma.

**Trigger:** El usuario usa palabras como "validar", "verificar", "cruzar", "complementar", "qué nos falta" sobre un documento existente.

---

## 7. Regla de Entregable de Gaps

Todo ejercicio de validación debe producir un entregable estructurado con:

- **Cobertura actual** (% estimado)
- **Gaps clasificados** por prioridad (Crítico / Alto / Medio)
- **Plan de acción** con: qué levantar, cómo hacerlo, quién es responsable, qué entregable se espera
- **Cronograma sugerido** con fases
- **Referencias** a documentación oficial del vendor

No basta con listar lo que falta — hay que decir **cómo obtenerlo**.

**Aplica a:** Orquestador, Knowledge Scout, cualquier agente que reporte gaps.
