# MCP Google Drive — Configuración con Service Account

## Resumen

El MCP de Google Drive usa una **Service Account** para autenticación, evitando el flujo OAuth interactivo que falla en entornos corporativos (proxy, firewall, callback en localhost).

## Arquitectura

```
Kiro → node scripts/mcp-gdrive-sa.cjs → Google Drive API (v3)
                    ↓
        GOOGLE_APPLICATION_CREDENTIALS
                    ↓
        Service Account JSON key file
```

## Componentes

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| MCP Server | `scripts/mcp-gdrive-sa.cjs` | Server MCP stdio que expone tools de Drive |
| Credenciales | Ruta en variable `GOOGLE_APPLICATION_CREDENTIALS` | JSON key de la Service Account |
| Config MCP | `~/.kiro/settings/mcp.json` → server `google-drive` | Configuración del server en Kiro |

## Service Account

- **Email:** `kiro-drive-reader@i-d-iportafoliodenegocio.iam.gserviceaccount.com`
- **Proyecto GCP:** `i-d-iportafoliodenegocio`
- **Scopes:** `https://www.googleapis.com/auth/drive.readonly`
- **Permisos:** Solo lectura. La SA solo ve archivos/carpetas compartidos explícitamente con ella.

## Configuración en `~/.kiro/settings/mcp.json`

```json
"google-drive": {
  "command": "node",
  "args": [
    "<WORKSPACE_ROOT>/scripts/mcp-gdrive-sa.cjs"
  ],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "<RUTA_AL_ARCHIVO_CREDENCIALES_SA>.json",
    "NODE_EXTRA_CA_CERTS": "<RUTA_AL_CA_BUNDLE_CORPORATIVO>.pem"
  },
  "disabled": false,
  "autoApprove": [
    "search_files",
    "read_file_content",
    "list_recent_files",
    "get_file_metadata",
    "get_file_permissions"
  ]
}
```

## Tools disponibles

| Tool | Descripción |
|------|-------------|
| `search_files` | Buscar archivos con query syntax de Drive |
| `read_file_content` | Leer contenido (Docs→texto, Sheets→CSV, Slides→texto) |
| `list_recent_files` | Listar archivos recientes |
| `get_file_metadata` | Obtener metadata de un archivo |
| `get_file_permissions` | Listar permisos de un archivo |

## Compartir carpetas con la Service Account

Para que la SA pueda acceder a una carpeta de Drive:

1. Abrir la carpeta en Google Drive (navegador)
2. Clic derecho → **Compartir**
3. Agregar: `kiro-drive-reader@i-d-iportafoliodenegocio.iam.gserviceaccount.com`
4. Rol: **Lector** (o Editor si se necesita escritura futura)

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| `ERR_CONNECTION_REFUSED localhost:27844` | Se reconfiguró a OAuth interactivo (`mcp-remote`) | Restaurar config con Service Account (ver arriba) |
| `Files found: 0` | La carpeta no está compartida con la SA | Compartir con `kiro-drive-reader@...` |
| `Cannot find module 'googleapis'` | Dependencia no instalada | `npm install googleapis` en el workspace |
| `Cannot find module '@modelcontextprotocol/sdk'` | Dependencia no instalada | `npm install @modelcontextprotocol/sdk` en el workspace |

## ⚠️ NO CAMBIAR A

**Nunca** reconfigurar el server `google-drive` para usar:
- `mcp-remote` con `drivemcp.googleapis.com` (requiere OAuth interactivo → falla con proxy corporativo)
- `@modelcontextprotocol/server-gdrive` (deprecated, requiere OAuth interactivo)
- Cualquier flujo que necesite callback en `localhost` (bloqueado por firewall/proxy)

## Dependencias del workspace

```bash
npm install googleapis @modelcontextprotocol/sdk zod
```

## Historial

- **2026-05-04:** Reconfigurado de OAuth interactivo a Service Account (fix ERR_CONNECTION_REFUSED)
- **2026-04-XX:** Creación original de la Service Account en GCP
