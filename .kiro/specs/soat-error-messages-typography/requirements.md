# Requirements Document

## Introduction

Este documento especifica los requisitos para ajustar los mensajes de error y la tipografía en el flujo de venta de SOAT en Proyectiva (proyectivaseguros.com). El objetivo es proporcionar mensajes de error claros, amigables y con la fuente institucional Bolívar, mejorando la experiencia del usuario cuando ocurren problemas durante la cotización o compra del SOAT.

## Glossary

- **Frontend_SOAT**: Aplicación web del flujo de cotización y compra de SOAT en proyectivaseguros.com
- **Modal_Error**: Componente de interfaz tipo diálogo superpuesto que muestra información de error al usuario
- **AXA_Colpatria**: Asegurador externo con el que el sistema se comunica para obtener cotizaciones de SOAT
- **Fuente_Bolivar**: Tipografía institucional del Grupo Bolívar que debe aplicarse en toda la interfaz del Frontend_SOAT
- **Error_Comunicacion**: Condición en la que el sistema no recibe respuesta válida del asegurador AXA Colpatria
- **Error_Desconocido**: Condición de error no clasificada, incluyendo punto de venta no creado u otros fallos no detectados específicamente
- **Pagina_Principal_Proyectiva**: Página de inicio de proyectivaseguros.com

## Requirements

### Requirement 1: Mensaje de error de comunicación con AXA Colpatria

**User Story:** Como un usuario que compra SOAT en Proyectiva, quiero ver un mensaje claro cuando falla la comunicación con el asegurador, para que entienda que debe intentar más tarde sin preocuparse por un error técnico.

#### Acceptance Criteria

1. CUANDO ocurre un Error_Comunicacion durante la cotización o compra, EL Modal_Error DEBE mostrar el título "Intenta más tarde"
2. CUANDO ocurre un Error_Comunicacion durante la cotización o compra, EL Modal_Error DEBE mostrar el mensaje de cuerpo "En este momento no es posible atender tu solicitud."
3. CUANDO ocurre un Error_Comunicacion durante la cotización o compra, EL Modal_Error DEBE mostrar un botón con el texto "Aceptar"
4. CUANDO el usuario presiona el botón "Aceptar" en el Modal_Error de comunicación, EL Frontend_SOAT DEBE cerrar el modal y mantener al usuario en la pantalla actual

### Requirement 2: Mensaje de error desconocido

**User Story:** Como un usuario que compra SOAT en Proyectiva, quiero ver un mensaje orientador cuando ocurre un error inesperado, para que sepa que puede intentar nuevamente y tenga una acción clara para continuar.

#### Acceptance Criteria

1. CUANDO ocurre un Error_Desconocido durante la cotización o compra, EL Modal_Error DEBE mostrar el título "Algo salió mal"
2. CUANDO ocurre un Error_Desconocido durante la cotización o compra, EL Modal_Error DEBE mostrar el mensaje de cuerpo "No pudimos completar tu solicitud en este momento. Por favor intenta nuevamente en unos minutos."
3. CUANDO ocurre un Error_Desconocido durante la cotización o compra, EL Modal_Error DEBE mostrar un botón con el texto "Volver al inicio"
4. CUANDO el usuario presiona el botón "Volver al inicio" en el Modal_Error de error desconocido, EL Frontend_SOAT DEBE redirigir al usuario a la Pagina_Principal_Proyectiva

### Requirement 3: Tipografía institucional Bolívar

**User Story:** Como un usuario que compra SOAT en Proyectiva, quiero ver la interfaz con la tipografía institucional Bolívar, para que la experiencia visual sea coherente con la identidad de marca del Grupo Bolívar.

#### Acceptance Criteria

1. EL Frontend_SOAT DEBE utilizar la Fuente_Bolivar como tipografía principal en todos los elementos de texto de la interfaz
2. EL Frontend_SOAT DEBE aplicar la Fuente_Bolivar en los títulos, cuerpos de texto, botones y etiquetas de los modales de error
3. SI la Fuente_Bolivar no carga correctamente, ENTONCES EL Frontend_SOAT DEBE utilizar una fuente sans-serif del sistema como fallback sin afectar la funcionalidad

### Requirement 4: Diferenciación de errores

**User Story:** Como un usuario que compra SOAT en Proyectiva, quiero que el sistema me muestre mensajes distintos según el tipo de problema, para que pueda tomar la acción correcta en cada situación.

#### Acceptance Criteria

1. CUANDO el sistema detecta un error durante el flujo de SOAT, EL Frontend_SOAT DEBE clasificar el error como Error_Comunicacion o Error_Desconocido antes de mostrar el modal
2. EL Frontend_SOAT DEBE mostrar el modal correspondiente al Requisito 1 cuando el error sea de tipo Error_Comunicacion
3. EL Frontend_SOAT DEBE mostrar el modal correspondiente al Requisito 2 cuando el error sea de tipo Error_Desconocido
4. EL Frontend_SOAT DEBE tratar como Error_Desconocido cualquier error que no sea explícitamente clasificado como Error_Comunicacion
