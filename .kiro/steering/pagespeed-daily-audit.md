---
inclusion: manual
description: "Ejecuta auditorías Lighthouse sobre las URLs definidas en auditZones de la plataforma activa (platforms.json) y guarda los resultados en Workspace/{plataforma}/reports/pagespeed/. Ejecutar diariamente para tracking de tendencias."
---

Ejecuta auditorías Lighthouse de performance sobre la plataforma activa. Sigue estos pasos:

1. Lee Workspace/config/platforms.json (o el platforms.json de la plataforma activa según el contexto).
2. Identifica la plataforma activa (defaultPlatformId o la que el usuario indique).
3. Obtén la URL base de producción desde platforms[].urls.app.
4. Obtén las URLs a auditar desde platforms[].auditZones (cada entrada tiene name y url relativa o absoluta).
5. Para cada auditZone, construye la URL completa: si url empieza con http, úsala tal cual; si no, concatena urls.app + url.
6. Ejecuta npx lighthouse con --output=json --chrome-flags="--headless --no-sandbox" --only-categories=performance para cada URL en modo mobile.
7. Guarda cada resultado en Workspace/{plataforma-id}/reports/pagespeed/ con nombre {auditZone.name en kebab-case}-{fecha-YYYY-MM-DD}.json.
8. Al final genera un resumen con el score de performance de cada URL.
9. Si existe un reporte previo en la misma carpeta, compara con el último resultado disponible para mostrar tendencia (mejora/degradación).
