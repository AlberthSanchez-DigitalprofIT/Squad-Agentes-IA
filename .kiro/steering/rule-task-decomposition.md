# Regla de Descomposición de Tareas — Anti Long-Task

## Principio

> **"Ningún agente debe ejecutar una tarea que tome más de 3-5 interacciones con herramientas sin reportar progreso parcial al Orquestador."**

Las tareas largas (long tasks) degradan la calidad del contexto, aumentan el riesgo de pérdida de trabajo y dificultan la orquestación. Toda tarea compleja debe descomponerse en subtareas atómicas, conectadas y con entregables intermedios.

---

## Regla obligatoria para TODOS los agentes

### 1. Descomponer antes de ejecutar

Al recibir una tarea, el agente DEBE:

1. **Evaluar complejidad:** ¿La tarea requiere más de 5 llamadas a herramientas o más de 3 pasos lógicos?
2. **Si es compleja:** Descomponer en subtareas de máximo 3-5 interacciones cada una.
3. **Declarar el plan:** Listar las subtareas antes de ejecutar la primera.
4. **Ejecutar secuencialmente:** Completar una subtarea, reportar resultado, pasar a la siguiente.

### 2. Formato de descomposición

```
## Plan de ejecución (N subtareas)

1. [Subtarea 1] — Entregable: [qué produce]
2. [Subtarea 2] — Entregable: [qué produce]  
3. [Subtarea N] — Entregable: [qué produce]

Ejecutando subtarea 1...
```

### 3. Criterios de una buena subtarea

| Criterio | Descripción |
|----------|-------------|
| **Atómica** | Se completa en 3-5 interacciones con herramientas |
| **Con entregable** | Produce un resultado verificable (archivo, dato, confirmación) |
| **Conectada** | Su output es input de la siguiente subtarea |
| **Independiente en fallo** | Si falla, no pierde el trabajo de subtareas anteriores |
| **Reportable** | El resultado se puede comunicar en 1-2 líneas |

### 4. Umbrales de descomposición

| Complejidad estimada | Acción |
|---------------------|--------|
| 1-3 herramientas | Ejecutar directamente (no descomponer) |
| 4-8 herramientas | Descomponer en 2-3 subtareas |
| 9-15 herramientas | Descomponer en 3-5 subtareas |
| 16+ herramientas | Descomponer en 5+ subtareas con checkpoints |

### 5. Checkpoints obligatorios

Después de cada subtarea completada, el agente DEBE:

- **Guardar progreso:** Si genera datos, escribirlos a archivo inmediatamente (no acumular en memoria).
- **Reportar resultado:** Indicar qué se completó y qué sigue.
- **Validar continuidad:** Verificar que el resultado es correcto antes de pasar a la siguiente subtarea.

### 6. Regla de persistencia

> **"Todo hallazgo parcial se escribe a disco inmediatamente."**

- No acumular datos en memoria para escribir "al final".
- Cada subtarea que produce datos debe guardarlos en un archivo antes de pasar a la siguiente.
- Si el contexto se compacta o la sesión se interrumpe, el trabajo parcial no se pierde.

---

## Ejemplos

### Malo — Long task sin descomposición

```
Tarea: "Exportar Business Rules de 10 objetos"
El agente intenta hacer login, navegar, exportar los 10 objetos, 
analizar resultados y generar reporte TODO en una sola ejecución.
Resultado: timeout, pérdida de contexto, trabajo incompleto.
```

### Bueno — Descomposición en subtareas

```
Tarea: "Exportar Business Rules de 10 objetos"

Plan de ejecución (4 subtareas):
1. Login + navegar al editor de reglas — Entregable: sesión activa
2. Exportar Bitácora (objeto principal) — Entregable: CSV guardado
3. Exportar los 9 objetos restantes — Entregable: CSVs o confirmación de vacíos
4. Consolidar reporte — Entregable: markdown con análisis

Ejecutando subtarea 1...
```

---

## Aplicación por agente

| Agente | Ejemplo de descomposición |
|--------|--------------------------|
| **Test Engineer** | Login → Navegar sección → Capturar datos → Guardar archivo |
| **Knowledge Scout** | Buscar en fuente 1 → Extraer datos → Buscar en fuente 2 → Consolidar |
| **Platform Analyst** | Listar repos → Analizar repo 1 → Analizar repo 2 → Generar reporte |
| **Cloud SRE** | Consultar alertas → Diagnosticar → Correlacionar con código → Documentar |
| **PO-Agile** | Analizar requisito → Formular HU → Validar INVEST → Crear en Jira |
| **Doc Updater** | Identificar docs afectados → Leer estado actual → Actualizar → Verificar |

---

## Excepciones

- Tareas triviales (1-3 herramientas): No requieren descomposición formal.
- El usuario dice explícitamente "hazlo todo de una vez": Respetar la instrucción pero advertir si hay riesgo.
- Tareas de solo lectura/consulta: No requieren checkpoints de persistencia.
