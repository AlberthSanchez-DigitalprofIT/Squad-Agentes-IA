# Analisis del Proceso de Compra — Seguro Salud a su Medida (Proyectiva)

**URL:** https://www.segurosbolivar.com/seguros-en-linea/seguro-salud-a-su-medida/agencia-proyectiva  
**Fecha de analisis:** 2026-06-20  
**Producto:** Seguro de Salud Digital a tu Medida  
**Agencia:** Proyectiva

---

## Resumen del Flujo

El proceso de compra consta de **6 pasos** precedidos por un landing con formulario de captacion:

| # | Paso | URL | Descripcion |
|---|------|-----|-------------|
| 0 | Landing / Captacion | `/agencia-proyectiva` | Formulario inicial de contacto |
| 1 | Cantidad de Asegurados | `/salud?source=agencia-proyectiva` | Cuantas personas y fecha nacimiento |
| 2a | Elija un plan | `/salud/planes` | Seleccion de plan S, M o L |
| 2b | Plan Plus (opcional) | `/salud/planes-plus` | Upgrade con coberturas adicionales |
| 2c | Detalle de cobertura | `/salud/coberturas` | Resumen de coberturas del plan elegido |
| 3 | Datos del titular | `/salud/informacion-titular` | Datos basicos + complementarios |
| 4 | Datos de los asegurados | *(no alcanzado — requiere validacion de identidad)* | Datos de cada persona asegurada |
| 5 | Confirmar | *(no alcanzado)* | Resumen y confirmacion |
| 6 | Pagar | *(no alcanzado)* | Gateway de pagos |

---

## Paso 0: Landing / Captacion

**Screenshot:** `docs/screenshots-auditoria/salud-paso0-landing.png`

### Campos del formulario

| Campo | Tipo | Placeholder | Requerido |
|-------|------|-------------|-----------|
| Nombres y apellidos | text | Ej: Ana Pinzon | Si |
| Correo electronico | email | Ej: sucorreo@email.com | Si |
| Numero de celular | tel | Ej: 311 123 1234 | Si |

### Checkboxes obligatorios

| Checkbox | Descripcion |
|----------|-------------|
| Terminos y condiciones | Acepto los terminos y condiciones del canal digital |
| Politica de datos | Acepto la Politica de Tratamiento de Datos Personales y el Tratamiento de mis datos |

### Accion
- **Boton:** "Cotice y compre" (deshabilitado hasta completar todos los campos + checkboxes)

### Informacion adicional en landing
- Banner de alerta: "Aqui solo podra comprar seguros de salud. (Ni ARL ni EPS)."
- Logo de Agencia Proyectiva visible
- Planes mostrados como referencia: Plan S, Plan M, Plan L
- Seccion "Que nos diferencia" y "Por que Seguros Bolivar"

---

## Paso 1: Cantidad de Asegurados

**Screenshot:** `docs/screenshots-auditoria/salud-paso1-cantidad-asegurados.png`

### Campos

| Campo | Tipo | Opciones/Validacion | Requerido |
|-------|------|---------------------|-----------|
| Cuantas personas quiere asegurar? | spinbutton (numerico) | Min: 1, botones +/- | Si |
| Usted estara incluido en el seguro? | radio (Si/No) | Si / No | Si |
| Fecha de nacimiento | datepicker (calendario) | Formato DD/MM/AAAA | Si |

### Notas
- Si responde "Si" a inclusion en seguro, aparece seccion "Ingrese sus datos" con campo de fecha de nacimiento
- Alerta: "Todos los asegurados deben tener una afiliacion vigente a una EPS del regimen contributivo. De lo contrario, el seguro podra cancelarse."
- Nota: "El precio puede variar segun la edad."
- **Boton:** "Continuar" (deshabilitado hasta completar fecha de nacimiento)

---

## Paso 2a: Elija un Plan

**Screenshot:** `docs/screenshots-auditoria/salud-paso2-elegir-plan.png`

### Planes disponibles

| Plan | Tipo | Precio mensual (IVA inc.) | Cobertura principal |
|------|------|---------------------------|---------------------|
| **Plan S** | Ambulatorio | $41,500 | 18 especialidades, medico en casa 24/7, odontologia, emergencias |
| **Plan M** | Ambulatorio | $101,400 | Igual que S + $420.000 en examenes laboratorio, consultas sin cita |
| **Plan L** | Hospitalario | $378,800 | Todas las especialidades, examenes ilimitados, hospitalizacion completa |

### Campos
| Campo | Tipo | Requerido |
|-------|------|-----------|
| Seleccion de plan | radio button (S/M/L) | Si |

### Elementos interactivos por plan
- Radio button para seleccionar
- Boton "Consultar detalles" (abre detalle de coberturas)
- Nota: "Los servicios y puntos de atencion varian de acuerdo a la ubicacion de los asegurados."
- Nota: "El costo de cada plan, corresponde al valor mensual por todos los asegurados."

---

## Paso 2b: Plan Plus (Upgrade Opcional)

**Screenshot:** `docs/screenshots-auditoria/salud-paso2b-plan-plus.png`

### Contenido

| Elemento | Tipo | Valor | Descripcion |
|----------|------|-------|-------------|
| Plan seleccionado | info (solo lectura) | Plan S - $41,500 | Muestra plan elegido |
| Plan S Plus (upgrade) | switch (toggle) | $23,300 adicionales | Cobertura de hasta $200.000 para examenes medicos |

### Resumen de costos (ejemplo con Plus activo)
- Plan S: $41,500
- Cobertura adicional Plan S Plus: $23,300
- **Total mensual (IVA incluido): $64,800**

### Campos
| Campo | Tipo | Requerido |
|-------|------|-----------|
| Activar Plan Plus | switch/toggle (viene activo por defecto) | No (opcional) |

---

## Paso 2c: Detalle de Coberturas

**Screenshot:** `docs/screenshots-auditoria/salud-paso2c-coberturas.png`

### Contenido (Plan S Plus — ejemplo)

Solo lectura. No hay campos editables. Muestra el detalle completo de las coberturas:

1. **Acceso directo a citas con 18 especialidades medicas** — Deducible $20.000
2. **Medico en casa 24/7** — Red exclusiva de prestadores
3. **Citas medicas virtuales y orientacion telefonica** — Ilimitadas, deducible $20.000
4. **Traslados en ambulancia** — Al centro hospitalario mas cercano, deducible $20.000
5. **Examenes de laboratorio y diagnostico** — Bolsa $210.000 anuales, deducible $20.000
6. **Odontologia general y especializada** — Consultas ilimitadas, urgencias domiciliarias

### Link
- "Consulte el Directorio Medico oficial de Seguros Bolivar" para conocer la red de cobertura

---

## Paso 3: Datos del Titular

**Screenshots:** `docs/screenshots-auditoria/salud-paso3-datos-titular.png`, `salud-paso3-datos-titular-form.png`

### Seccion 1: Datos Basicos

| Campo | Tipo | Placeholder | Requerido |
|-------|------|-------------|-----------|
| Tipo de documento | select (dropdown) | Seleccione una opcion | Si |
| Numero de documento | text | Ej: 1111111111 | Si |
| Fecha de expedicion del documento | datepicker | — | Si |
| Primer Nombre | text | Ej: Simon | Si |
| Segundo Nombre | text | Ej: Andres | No |
| Primer Apellido | text | Ej: Bolivar | Si |
| Segundo Apellido | text | Ej: Libertad | No |
| Numero de celular | tel | Ej: 3110000000 | Si (pre-llenado del landing) |

### Opciones de Tipo de Documento

| Valor |
|-------|
| Carnet Diplomatico |
| Cedula de Ciudadania |
| Cedula de Extranjeria |
| Pasaporte |
| Permiso Especial de Permanencia |
| Permiso por Proteccion Temporal |
| Registro Civil |
| Tarjeta de Identidad |

### Seccion 2: Datos Complementarios
- **Estado:** Bloqueada (requiere validacion de identidad previa)
- Alerta: "Validaremos su identidad para continuar de forma segura. Asi garantizamos que su informacion este protegida en todo momento."

### Accion
- **Boton interno:** "Continuar" (dentro de la seccion Datos Basicos, deshabilitado hasta completar)
- **Boton footer:** "Continuar" (deshabilitado hasta completar ambas secciones)

---

## Paso 4: Datos de los Asegurados

**No alcanzado** — Requiere completar validacion de identidad en paso 3.

Segun el stepper, este paso solicita los datos de cada persona que sera asegurada en la poliza.

---

## Paso 5: Confirmar

**No alcanzado** — Posterior a paso 4.

Segun el stepper, es un resumen de toda la informacion antes de proceder al pago.

---

## Paso 6: Pagar

**No alcanzado** — Ultimo paso del flujo.

Este es el paso donde se integra el **Gateway de Pagos** (Jelpit Pagos). Aqui aplican los estados documentados en la presentacion de Gateway Proyectiva (LOADED, PENDIENTE, APROBADO, RECHAZADO, CANCELADO, EXPIRADA, RETURNED).

---

## Evidencias Capturadas

| Archivo | Paso | Descripcion |
|---------|------|-------------|
| `salud-paso0-landing.png` | 0 | Landing completa con formulario y planes |
| `salud-paso1-cantidad-asegurados.png` | 1 | Formulario cantidad + fecha nacimiento |
| `salud-paso2-elegir-plan.png` | 2a | Seleccion de planes S/M/L |
| `salud-paso2b-plan-plus.png` | 2b | Upgrade Plan Plus con toggle |
| `salud-paso2c-coberturas.png` | 2c | Detalle de coberturas del plan elegido |
| `salud-paso3-datos-titular.png` | 3 | Formulario datos del titular (vacio) |
| `salud-paso3-datos-titular-form.png` | 3 | Formulario con dropdown de tipo doc |

---

## Observaciones

1. **Flujo lineal con stepper:** El usuario siempre sabe en que paso esta (barra lateral con 6 pasos numerados).
2. **Validacion progresiva:** Cada boton "Continuar" se habilita solo cuando todos los campos obligatorios estan completos.
3. **Pre-llenado:** El numero de celular del landing se mantiene en el paso 3.
4. **Validacion de identidad:** Antes de mostrar "Datos Complementarios" se valida identidad del titular (probablemente contra bases como CIFIN/Datacredito).
5. **Plan Plus por defecto:** El upgrade viene activo (switch on). El usuario debe desactivarlo si no lo quiere — patron de upsell.
6. **Logo de agencia:** Proyectiva aparece en el header durante todo el flujo, junto al logo de Seguros Bolivar.
7. **Parametro source:** Toda la navegacion mantiene `?source=agencia-proyectiva` para trazabilidad.
8. **Sin limite de edad de ingreso** — segun la landing.
9. **Planes S y M sin preexistencias** — no evaluan estado de salud actual.
