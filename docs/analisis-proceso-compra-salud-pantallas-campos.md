# Seguro Salud a su Medida (Proyectiva) - Pantallas y Campos

**URL:** https://www.segurosbolivar.com/seguros-en-linea/seguro-salud-a-su-medida/agencia-proyectiva  
**Producto:** Seguro de Salud Digital a tu Medida  
**Agencia:** Proyectiva  
**Fecha de analisis:** 2026-06-20

---

## Resumen del Flujo

```
Landing → Paso 1 → Paso 2a → Paso 2b → Paso 2c → Paso 3 → Paso 4 → Paso 5 → Paso 6
```

| # | Paso | URL path | Estado |
|---|------|----------|--------|
| 0 | Landing / Captacion | `/agencia-proyectiva` | Documentado |
| 1 | Cantidad de Asegurados | `/salud?source=agencia-proyectiva` | Documentado |
| 2a | Elija un plan | `/salud/planes` | Documentado |
| 2b | Arme su plan (Plus) | `/salud/planes-plus` | Documentado |
| 2c | Detalle de cobertura | `/salud/coberturas` | Documentado |
| 3 | Datos del titular | `/salud/informacion-titular` | Documentado (parcial) |
| 4 | Datos de los asegurados | — | No alcanzado |
| 5 | Confirmar | — | No alcanzado |
| 6 | Pagar | — | No alcanzado |

---

## Pantalla 0: Landing / Captacion

**URL:** `/seguros-en-linea/seguro-salud-a-su-medida/agencia-proyectiva`  
**Screenshot:** `salud-paso0-landing.png`

### Elementos visuales
- Banner principal con imagen
- Logo Agencia Proyectiva
- Alerta: "Aqui solo podra comprar seguros de salud. (Ni ARL ni EPS)."
- Titulo: "Seguro Salud a su Medida"
- Subtitulo: "Arme su plan y descubra una mejor forma de estar protegido."
- Seccion informativa de planes (S, M, L)
- Seccion "Que nos diferencia"
- Seccion "Por que Seguros Bolivar"

### Campos del formulario

| # | Campo | Tipo | Placeholder | Requerido | Validacion |
|---|-------|------|-------------|-----------|------------|
| 1 | Nombres y apellidos | text | Ej: Ana Pinzon | Si | — |
| 2 | Correo electronico | email | Ej: sucorreo@email.com | Si | Formato email |
| 3 | Numero de celular | tel | Ej: 311 123 1234 | Si | Formato numerico |

### Checkboxes

| # | Checkbox | Requerido |
|---|----------|-----------|
| 1 | Acepto los terminos y condiciones del canal digital | Si |
| 2 | Acepto la Politica de Tratamiento de Datos Personales y el Tratamiento de mis datos | Si |

### Acciones
- **Boton:** "Cotice y compre" — deshabilitado hasta completar todos los campos + checkboxes

---

## Pantalla 1: Cantidad de Asegurados

**URL:** `/salud?source=agencia-proyectiva`  
**Screenshot:** `salud-paso1-cantidad-asegurados.png`

### Stepper (sidebar)
Barra lateral con 6 pasos numerados: 1. Cantidad de Asegurados → 2. Elija un plan → 3. Datos del titular → 4. Datos de los asegurados → 5. Confirmar → 6. Pagar

### Campos

| # | Campo | Tipo | Opciones | Requerido | Notas |
|---|-------|------|----------|-----------|-------|
| 1 | Cuantas personas quiere asegurar? | spinbutton (numerico) | Min: 1, botones +/- | Si | — |
| 2 | Usted estara incluido en el seguro? | radio | Si / No | Si | Si selecciona "Si", aparece seccion de datos |
| 3 | Fecha de nacimiento | datepicker (calendario) | DD/MM/AAAA | Si | "El precio puede variar segun la edad" |

### Alertas
- "Todos los asegurados deben tener una afiliacion vigente a una EPS del regimen contributivo. De lo contrario, el seguro podra cancelarse."

### Acciones
- **Boton:** "Continuar" — deshabilitado hasta completar fecha de nacimiento
- **Boton header:** "Volver"

---

## Pantalla 2a: Elija un Plan

**URL:** `/salud/planes`  
**Screenshot:** `salud-paso2-elegir-plan.png`

### Titulo
"Escoja su plan ideal"

### Nota superior
"El costo de cada plan, corresponde al valor mensual por todos los asegurados."

### Planes disponibles

| Plan | Tipo | Precio mensual (IVA inc.) | Especialidades | Deducible |
|------|------|---------------------------|----------------|-----------|
| **Plan S** | Ambulatorio | $41,500 | 18 especialidades | $20.000 por servicio |
| **Plan M** | Ambulatorio | $101,400 | 18 especialidades | $20.000 por servicio |
| **Plan L** | Hospitalario | Desde $378,800 | Todas las especialidades | $32.000 por servicio |

### Coberturas comunes (todos los planes)
- Acceso directo a citas con especialidades medicas
- Medico en casa 24/7
- Citas medicas virtuales y orientacion telefonica
- Traslados en ambulancia
- Odontologia general y especializada
- Examenes de laboratorio y diagnostico
- Consultas sin cita previa
- Hospitalizacion, cirugias y medicamentos
- Atencion a urgencias medicas
- Tratamiento y rehabilitacion enfermedades de alto costo
- Terapias fisicas, respiratorias y de lenguaje
- Cobertura para embarazo y recien nacido

### Campos

| # | Campo | Tipo | Requerido |
|---|-------|------|-----------|
| 1 | Seleccion de plan | radio button (S / M / L) | Si |

### Acciones por tarjeta
- Radio button para seleccionar
- "Consultar detalles" (abre detalle de coberturas)

### Nota inferior
"Los servicios y puntos de atencion varian de acuerdo a la ubicacion de los asegurados."

### Acciones
- **Boton:** "Continuar" — deshabilitado hasta seleccionar un plan

---

## Pantalla 2b: Arme su Plan (Upgrade Plus)

**URL:** `/salud/planes-plus`  
**Screenshot:** `salud-paso2b-plan-plus.png`

### Titulo
"Arme su plan, a su medida"

### Secciones

#### Plan seleccionado (solo lectura)
| Dato | Valor (ejemplo) |
|------|-----------------|
| Plan | Plan S |
| Precio | $41,500 |
| Boton | "Consultar detalles" |

#### Cobertura opcional

| # | Campo | Tipo | Valor adicional | Descripcion | Default |
|---|-------|------|-----------------|-------------|---------|
| 1 | Plan S Plus | switch (toggle) | $23,300 | Cobertura de hasta $200.000 para examenes medicos | Activo (ON) |

### Resumen de costos (panel lateral)
| Concepto | Valor |
|----------|-------|
| Plan S | $41,500 |
| Cobertura adicional: Plan S Plus | $23,300 |
| **Total mensual (IVA incluido)** | **$64,800** |

### Acciones
- **Boton:** "Continuar" — siempre habilitado (plan plus es opcional)

---

## Pantalla 2c: Detalle de Coberturas

**URL:** `/salud/coberturas`  
**Screenshot:** `salud-paso2c-coberturas.png`

### Titulo
"Detalle de la cobertura"

### Contenido (solo lectura — Plan S Plus ejemplo)

| # | Cobertura | Detalle clave |
|---|-----------|---------------|
| 1 | Acceso directo a citas con 18 especialidades medicas | Deducible $20.000. No aplican reembolsos. |
| 2 | Medico en casa 24/7 | Red exclusiva de prestadores. Sujeto a disponibilidad por ubicacion. |
| 3 | Citas medicas virtuales y orientacion telefonica | Ilimitadas. Deducible $20.000. Especialidades: Medicina General, Familiar, Pediatria >2 años, Psicologia. |
| 4 | Traslados en ambulancia | Al centro hospitalario aliado mas cercano. Deducible $20.000. Evaluacion de sintomas previa. |
| 5 | Examenes de laboratorio y diagnostico | Bolsa $210.000 anuales por persona. Deducible $20.000 por orden/examen. |
| 6 | Odontologia general y especializada | Consultas ilimitadas. Urgencias domiciliarias. Endodoncia, periodoncia, cirugias dentales. Deducible $20.000. |

### Link externo
- "Consulte el Directorio Medico oficial de Seguros Bolivar" → https://www.segurosbolivar.com/salud/?z=pb

### Campos
Ninguno — pantalla informativa.

### Acciones
- **Boton:** "Continuar" — siempre habilitado

---

## Pantalla 3: Datos del Titular

**URL:** `/salud/informacion-titular`  
**Screenshots:** `salud-paso3-datos-titular.png`, `salud-paso3-datos-titular-form.png`

### Titulo
"Datos del titular"

### Seccion 1: Datos Basicos (accordion expandido)

| # | Campo | Tipo | Placeholder | Requerido | Notas |
|---|-------|------|-------------|-----------|-------|
| 1 | Tipo de documento | select (dropdown) | Seleccione una opcion | Si | Ver opciones abajo |
| 2 | Numero de documento | text | Ej: 1111111111 | Si | — |
| 3 | Fecha de expedicion del documento | datepicker | DD/MM/AAAA | Si | Solo fechas pasadas |
| 4 | Primer Nombre | text | Ej: Simon | Si | — |
| 5 | Segundo Nombre | text | Ej: Andres | No | — |
| 6 | Primer Apellido | text | Ej: Bolivar | Si | — |
| 7 | Segundo Apellido | text | Ej: Libertad | No | — |
| 8 | Numero de celular | tel | Ej: 3110000000 | Si | Pre-llenado del landing |

#### Opciones Tipo de Documento

| # | Valor |
|---|-------|
| 1 | Carnet Diplomatico |
| 2 | Cedula de Ciudadania |
| 3 | Cedula de Extranjeria |
| 4 | Pasaporte |
| 5 | Permiso Especial de Permanencia |
| 6 | Permiso por Proteccion Temporal |
| 7 | Registro Civil |
| 8 | Tarjeta de Identidad |

### Alerta
"Validaremos su identidad para continuar de forma segura. Asi garantizamos que su informacion este protegida en todo momento."

### Accion interna
- **Boton:** "Continuar" — deshabilitado hasta completar campos obligatorios. Al hacer clic, dispara validacion de identidad.

### Seccion 2: Datos Complementarios (accordion colapsado)
- **Estado:** Bloqueado/deshabilitado hasta completar validacion de identidad
- Campos: No visibles hasta pasar validacion

---

## Pantalla 3 (sub): Validacion de Identidad

**Screenshots:** `salud-paso3-validacion-otp.png`, `salud-paso3-validacion-identidad-pregunta.png`, `salud-paso3-validacion-fallida.png`, `salud-paso3-error-validacion-bloqueado.png`

### Flujo de validacion

```
Datos basicos completos
    → OTP por SMS (6 digitos, 72 seg vigencia)
        → Preguntas de seguridad (bureau de credito, 3-4 preguntas)
            → Exito: desbloquea Datos Complementarios
            → Fallo: modal de error + reintento
            → Bloqueo: tras multiples fallos, bloqueo temporal
```

### Sub-pantalla 3.1: Codigo OTP

| # | Campo | Tipo | Placeholder | Requerido | Notas |
|---|-------|------|-------------|-----------|-------|
| 1 | Codigo de verificacion | text (6 digitos) | 111111 | Si | Enviado por SMS al celular registrado |

#### Elementos
- Titulo: "Codigo enviado!"
- Texto: "Enviamos un codigo a: *******477"
- Temporizador: "El codigo estara activo por X segundos"
- Link: "No recibio el codigo?" → Boton "Reenviar codigo"

#### Acciones
| Boton | Estado | Funcion |
|-------|--------|---------|
| Validar codigo | Deshabilitado hasta ingresar 6 digitos | Valida OTP |
| Intentar otro metodo | Siempre habilitado | Metodo alternativo |
| Reenviar codigo | Siempre habilitado | Reenvia SMS |

### Sub-pantalla 3.2: Preguntas de Seguridad (Bureau de Credito)

| # | Campo | Tipo | Requerido |
|---|-------|------|-----------|
| 1 | Pregunta de validacion | radio (5-6 opciones) | Si |

#### Tipos de preguntas observadas
- Valor de cuota de credito de vivienda con entidad X
- Con cual entidad tiene/tuvo credito en ultimos 5 años
- Hace cuanto tiempo tiene credito hipotecario con entidad X
- Con cual entidad tiene/tuvo cuenta de ahorro en ultimos 5 años
- Cuantos planes de voz/datos activos en postpago con operador X

#### Caracteristicas
- Se presentan 3-4 preguntas secuenciales
- Cada pregunta tiene 5-6 opciones de radio button
- Siempre incluye opcion "Ninguna de las anteriores" o "No tengo X con la entidad"
- Boton "Continuar" deshabilitado hasta seleccionar respuesta

### Sub-pantalla 3.3: Error de Validacion

#### Modal de fallo recuperable
- Titulo: "No pudimos validar su identidad"
- Texto: "Las respuestas proporcionadas no coinciden con nuestros registros. Por favor, intente nuevamente o comuniquese con un asesor."
- Boton: "Aceptar" → reinicia proceso de validacion

#### Modal de bloqueo (multiples fallos)
- Titulo: "Algo ocurrio, pero no se preocupe, pronto le daremos solucion."
- Texto: "Por favor, comuniquese con un asesor a la Red #322 o a nuestro WhatsApp."
- Boton: "Aceptar" → cierra modal, no permite reintentar

---

## Pantalla 4: Datos de los Asegurados (No alcanzado)

**URL estimada:** `/salud/informacion-asegurados`

### Campos probables (inferidos del stepper)
- Datos personales de cada persona asegurada (si son diferentes al titular)
- Fecha de nacimiento de cada asegurado
- Relacion con el titular

---

## Pantalla 5: Confirmar (No alcanzado)

**URL estimada:** `/salud/confirmar`

### Contenido probable
- Resumen del plan seleccionado
- Datos del titular
- Datos de los asegurados
- Valor total mensual
- Terminos y condiciones del seguro

---

## Pantalla 6: Pagar (No alcanzado)

**URL estimada:** `/salud/pagar`

### Integracion
- Gateway de pagos (Jelpit Pagos)
- Estados aplicables: LOADED → PENDIENTE → APROBADO / RECHAZADO / CANCELADO / EXPIRADA / RETURNED

---

## Observaciones Tecnicas

| # | Observacion |
|---|-------------|
| 1 | Aplicacion Angular (SPA) — no permite navegacion directa a pasos intermedios |
| 2 | Parametro `?source=agencia-proyectiva` se mantiene en toda la navegacion para trazabilidad |
| 3 | Stepper de 6 pasos visible en sidebar durante todo el flujo |
| 4 | Validacion progresiva: botones deshabilitados hasta completar campos obligatorios |
| 5 | Pre-llenado de celular desde el landing hacia el paso 3 |
| 6 | Plan Plus viene activo por defecto (patron upsell — opt-out) |
| 7 | Logo de Agencia Proyectiva visible en header durante todo el flujo |
| 8 | Calendario con selector de decada → año → mes → dia |
| 9 | Validacion de identidad en 2 etapas: OTP SMS + preguntas bureau credito |
| 10 | Bloqueo temporal tras multiples fallos de validacion (seguridad anti-fraude) |
| 11 | Widget Survicate (encuesta) puede interferir con interacciones del usuario |
| 12 | Sin limite de edad de ingreso (segun landing) |
| 13 | Planes S y M sin preexistencias — no evaluan estado de salud actual |

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
| `salud-paso3-datos-titular-form.png` | 3 | Formulario con dropdown tipo documento |
| `salud-paso3-validacion-otp.png` | 3.1 | Modal OTP enviado por SMS |
| `salud-paso3-validacion-identidad-pregunta.png` | 3.2 | Pregunta de seguridad bureau credito |
| `salud-paso3-validacion-fallida.png` | 3.3 | Modal error validacion fallida |
| `salud-paso3-error-validacion-bloqueado.png` | 3.3 | Modal bloqueo por multiples fallos |
