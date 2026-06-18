# Conexión a Power BI — REST API con Device Code Flow

Guía agnóstica para que cualquier usuario del enjambre conecte al BI Strategist con reportes de Power BI usando su cuenta corporativa Microsoft.

---

## Prerrequisitos

| Requisito | Verificación |
|-----------|-------------|
| Cuenta corporativa Microsoft (Entra ID) | `usuario@dominio.onmicrosoft.com` |
| Acceso al reporte Power BI desde el navegador | Abrir URL del reporte y verificar que carga |
| `curl` | `which curl` |
| `python3` | `python3 --version` |
| Navegador web | Para completar el Device Code Flow |

**No se requiere:** `az cli`, registrar una app en Azure AD, ni permisos de admin.

---

## Flujo de conexión

### Paso 1: Obtener IDs del reporte

De la URL del reporte, extraer:

```
https://app.powerbi.com/groups/me/reports/{REPORT_ID}/{PAGE_ID}?ctid={TENANT_ID}
```

Ejemplo:
- **Report ID:** `1ea5493a-aa1f-4387-843c-609fa5b2d42c`
- **Tenant ID:** `e62b3c46-c775-4b6a-9c2f-9dbe85c61a85`

### Paso 2: Solicitar Device Code

```bash
TENANT_ID="<tu-tenant-id>"

curl -s -X POST \
  "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/devicecode" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=ea0616ba-638b-4df5-95b9-636659ae5121&scope=https://analysis.windows.net/powerbi/api/.default offline_access"
```

> **Nota:** El Client ID `ea0616ba-638b-4df5-95b9-636659ae5121` es la app pública de Power BI Gateway de Microsoft — no requiere registro.

La respuesta incluye:
- `user_code`: código a ingresar en el navegador
- `device_code`: para el polling del token
- `verification_uri`: URL donde ingresar el código

### Paso 3: Autenticar en el navegador

1. Abrir **https://login.microsoft.com/device**
2. Ingresar el `user_code` mostrado
3. Iniciar sesión con tu cuenta corporativa
4. Autorizar la app "Power BI Gateway"

### Paso 4: Obtener el token

```bash
DEVICE_CODE="<device_code_del_paso_2>"

curl -s -X POST \
  "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:device_code&client_id=ea0616ba-638b-4df5-95b9-636659ae5121&device_code=${DEVICE_CODE}" \
  > /tmp/powerbi_token.json
```

Verificar:
```bash
python3 -c "import json; d=json.load(open('/tmp/powerbi_token.json')); print('✅ OK' if 'access_token' in d else f'❌ {d}')"
```

### Paso 5: Obtener Dataset ID del reporte

```bash
PBI_TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/powerbi_token.json'))['access_token'])")
REPORT_ID="<tu-report-id>"

curl -s "https://api.powerbi.com/v1.0/myorg/reports/${REPORT_ID}" \
  -H "Authorization: Bearer $PBI_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'Reporte: {d.get(\"name\")}')
print(f'Dataset ID: {d.get(\"datasetId\")}')
"
```

### Paso 6: Ejecutar queries DAX

```bash
DATASET_ID="<dataset-id-del-paso-5>"

curl -s -X POST \
  "https://api.powerbi.com/v1.0/myorg/datasets/${DATASET_ID}/executeQueries" \
  -H "Authorization: Bearer $PBI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"queries":[{"query":"EVALUATE ROW(\"Total\", COUNTROWS(<TABLA>))"}],"serializerSettings":{"includeNulls":true}}'
```

---

## Script automatizado

El script `scripts/powerbi-connect.sh` automatiza los pasos 2-5:

```bash
./scripts/powerbi-connect.sh
```

El usuario solo debe abrir la URL e ingresar el código. El script hace polling automático hasta que la autenticación se completa.

---

## Configuración en platforms.json

Después de obtener el Dataset ID, registrarlo en la configuración de la plataforma:

```json
{
  "bi": {
    "powerbi": {
      "tenantId": "<TENANT_ID>",
      "reportId": "<REPORT_ID>",
      "datasetId": "<DATASET_ID>",
      "reportName": "Nombre del reporte",
      "reportUrl": "https://app.powerbi.com/groups/me/reports/<REPORT_ID>"
    }
  }
}
```

---

## Operaciones disponibles post-conexión

| Operación | Endpoint |
|-----------|----------|
| Info del reporte | `GET /v1.0/myorg/reports/{reportId}` |
| Páginas del reporte | `GET /v1.0/myorg/reports/{reportId}/pages` |
| Ejecutar DAX | `POST /v1.0/myorg/datasets/{datasetId}/executeQueries` |
| Info del dataset | `GET /v1.0/myorg/datasets/{datasetId}` |
| Refresh del dataset | `POST /v1.0/myorg/datasets/{datasetId}/refreshes` |

---

## Limitaciones conocidas

| Limitación | Detalle |
|-----------|---------|
| Token expira en ~1 hora | Reejecutar el Device Code Flow para renovar |
| `INFO.TABLES()` bloqueado | Usar `COLUMNSTATISTICS()` para descubrir tablas/columnas |
| API `/tables` requiere permisos Write | Solo lectura vía DAX `executeQueries` |
| Sin MCP oficial habilitado | El MCP de Power BI (`api.powerbi.com/v1.0/myorg/mcp`) requiere activación por Tenant Admin |

---

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| `AADSTS50076` | MFA requerido | Completar MFA en el navegador durante Device Code Flow |
| `AADSTS700016` | Client ID no reconocido | Verificar que el tenant permite apps públicas de Microsoft |
| `DatasetExecuteQueriesError` | DAX no permitido o tabla inexistente | Usar `COLUMNSTATISTICS()` para descubrir estructura |
| `User does not have write access` | Permiso Build no asignado | Solo funciona lectura vía `executeQueries` |
| `authorization_pending` | El usuario aún no completó el login | Esperar — el polling continúa automáticamente |

---

## Referencias

- [Power BI REST API](https://learn.microsoft.com/en-us/rest/api/power-bi/)
- [Execute Queries (DAX)](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries)
- [Device Code Flow (OAuth 2.0)](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-device-code)
- Script: `scripts/powerbi-connect.sh`
- Steering: `.kiro/steering/agent-bi-strategist.md`
