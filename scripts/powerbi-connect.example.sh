#!/bin/bash
# =============================================================================
# Power BI REST API — Autenticación con Device Code Flow + Consulta
# Template agnóstico: copiar a powerbi-connect.sh y rellenar valores.
#
# Variables a configurar (por env vars o editando el archivo copiado):
#   PBI_TENANT_ID  — Azure AD Tenant ID de la organización
#   PBI_REPORT_ID  — ID del reporte Power BI a consultar
#   PBI_USER_EMAIL — Correo del usuario que se autenticará
#
# Uso:
#   cp scripts/powerbi-connect.example.sh scripts/powerbi-connect.sh
#   # Editar powerbi-connect.sh con los valores reales, o exportar env vars:
#   export PBI_TENANT_ID="tu-tenant-id"
#   export PBI_REPORT_ID="tu-report-id"
#   export PBI_USER_EMAIL="tu-email@dominio.onmicrosoft.com"
#   bash scripts/powerbi-connect.sh
# =============================================================================

set -euo pipefail

# --- Configuración particular (rellenar al copiar o usar env vars) ---
TENANT_ID="${PBI_TENANT_ID:-YOUR_TENANT_ID_HERE}"
REPORT_ID="${PBI_REPORT_ID:-YOUR_REPORT_ID_HERE}"
USER_EMAIL="${PBI_USER_EMAIL:-usuario@dominio.onmicrosoft.com}"

# Client ID público de Microsoft Power BI (aplicación first-party, no requiere registro de app)
CLIENT_ID="ea0616ba-638b-4df5-95b9-636659ae5121"
SCOPE="https://analysis.windows.net/powerbi/api/.default offline_access"
TOKEN_FILE="/tmp/powerbi_token.json"

# --- Validación de configuración ---
if [ "$TENANT_ID" = "YOUR_TENANT_ID_HERE" ]; then
  echo "❌ Error: Debes configurar PBI_TENANT_ID (env var) o editar TENANT_ID en el script."
  echo "   Ver instrucciones en la cabecera del archivo."
  exit 1
fi

if [ "$REPORT_ID" = "YOUR_REPORT_ID_HERE" ]; then
  echo "❌ Error: Debes configurar PBI_REPORT_ID (env var) o editar REPORT_ID en el script."
  exit 1
fi

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Power BI REST API — Device Code Authentication         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# --- Paso 1: Solicitar Device Code ---
echo "▶ Solicitando código de dispositivo..."
DEVICE_RESPONSE=$(curl -s -X POST \
  "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/devicecode" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}&scope=${SCOPE}")

USER_CODE=$(echo "$DEVICE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['user_code'])" 2>/dev/null)
DEVICE_CODE=$(echo "$DEVICE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['device_code'])" 2>/dev/null)
VERIFICATION_URI=$(echo "$DEVICE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['verification_uri'])" 2>/dev/null)
INTERVAL=$(echo "$DEVICE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('interval',5))" 2>/dev/null)

if [ -z "$USER_CODE" ] || [ -z "$DEVICE_CODE" ]; then
  echo "❌ Error al obtener device code. Respuesta:"
  echo "$DEVICE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DEVICE_RESPONSE"
  exit 1
fi

echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  1. Abre en tu navegador: $VERIFICATION_URI"
echo "│  2. Ingresa el código:    $USER_CODE"
echo "│  3. Inicia sesión con:    $USER_EMAIL"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "⏳ Esperando autenticación..."

# --- Paso 2: Polling hasta obtener token ---
while true; do
  sleep "$INTERVAL"
  TOKEN_RESPONSE=$(curl -s -X POST \
    "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=urn:ietf:params:oauth:grant-type:device_code&client_id=${CLIENT_ID}&device_code=${DEVICE_CODE}")

  ERROR=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

  if [ "$ERROR" = "authorization_pending" ]; then
    printf "."
    continue
  elif [ "$ERROR" = "slow_down" ]; then
    INTERVAL=$((INTERVAL + 5))
    continue
  elif [ -n "$ERROR" ] && [ "$ERROR" != "" ]; then
    echo ""
    echo "❌ Error de autenticación: $ERROR"
    echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"
    exit 1
  fi

  # Token obtenido
  echo ""
  echo "✅ Autenticación exitosa!"
  echo "$TOKEN_RESPONSE" > "$TOKEN_FILE"
  break
done

ACCESS_TOKEN=$(python3 -c "import json; print(json.load(open('$TOKEN_FILE'))['access_token'])")

# --- Paso 3: Obtener info del reporte ---
echo ""
echo "▶ Consultando reporte..."
REPORT_INFO=$(curl -s \
  "https://api.powerbi.com/v1.0/myorg/reports/${REPORT_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

REPORT_NAME=$(echo "$REPORT_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name','N/A'))" 2>/dev/null)
DATASET_ID=$(echo "$REPORT_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('datasetId','N/A'))" 2>/dev/null)

echo "  Reporte: $REPORT_NAME"
echo "  Dataset ID: $DATASET_ID"

# --- Paso 4: Obtener páginas del reporte ---
echo ""
echo "▶ Páginas del reporte:"
curl -s \
  "https://api.powerbi.com/v1.0/myorg/reports/${REPORT_ID}/pages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for page in data.get('value', []):
    print(f\"  - {page.get('displayName', 'N/A')} (order: {page.get('order', 'N/A')})\")
"

# --- Paso 5: Intentar query DAX al dataset ---
if [ "$DATASET_ID" != "N/A" ]; then
  echo ""
  echo "▶ Ejecutando query DAX de prueba (tablas del modelo)..."
  DAX_RESULT=$(curl -s -X POST \
    "https://api.powerbi.com/v1.0/myorg/datasets/${DATASET_ID}/executeQueries" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "queries": [{"query": "EVALUATE INFO.TABLES()"}],
      "serializerSettings": {"includeNulls": true}
    }')

  DAX_ERROR=$(echo "$DAX_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message',''))" 2>/dev/null)

  if [ -n "$DAX_ERROR" ] && [ "$DAX_ERROR" != "" ]; then
    echo "  ⚠️  No se pudo ejecutar DAX: $DAX_ERROR"
    echo "  (Puede requerir permisos Build sobre el dataset)"
  else
    echo "$DAX_RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
results = data.get('results', [{}])
rows = results[0].get('tables', [{}])[0].get('rows', [])
print(f'  Tablas en el modelo ({len(rows)}):')
for row in rows[:20]:
    name = row.get('[Name]', 'N/A')
    print(f'    - {name}')
if len(rows) > 20:
    print(f'    ... y {len(rows)-20} más')
" 2>/dev/null || echo "  (Respuesta no parseada — revisar $TOKEN_FILE)"
  fi
fi

# --- Resumen ---
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Conexión establecida                                ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Token guardado en: $TOKEN_FILE"
echo "║  Report ID: $REPORT_ID"
echo "║  Dataset ID: $DATASET_ID"
echo "║                                                          ║"
echo "║  Para usar el token en otras consultas:                  ║"
echo "║  export PBI_TOKEN=\$(python3 -c \"import json;             ║"
echo "║    print(json.load(open('$TOKEN_FILE'))['access_token'])\")"
echo "╚══════════════════════════════════════════════════════════╝"
