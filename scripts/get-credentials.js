#!/usr/bin/env node

/**
 * Helper para leer credenciales del vault local.
 *
 * Uso:
 *   node scripts/get-credentials.js <app> <environment> <type>
 *
 * Ejemplo:
 *   node scripts/get-credentials.js huella qa web
 *
 * Devuelve JSON con { url, user, password, token? } o error si no existe.
 *
 * El archivo de credenciales se lee desde:
 *   1. Variable de entorno CREDENTIALS_PATH (si está definida)
 *   2. Workspace/config/credentials.json (por defecto)
 *
 * IMPORTANTE: Este script NUNCA imprime credenciales en logs.
 * Solo devuelve el JSON al stdout para consumo programático.
 *
 * @param {string} app - Nombre de la aplicación (ej. "huella")
 * @param {string} environment - Ambiente (ej. "local", "qa", "staging")
 * @param {string} type - Tipo de acceso (ej. "web", "api")
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

/**
 * Resuelve la ruta al archivo de credenciales.
 * @returns {string} Ruta absoluta al archivo credentials.json
 */
function resolveCredentialsPath() {
  if (process.env.CREDENTIALS_PATH) {
    return path.resolve(process.env.CREDENTIALS_PATH);
  }
  return path.join(WORKSPACE_ROOT, 'Workspace', 'config', 'credentials.json');
}

/**
 * Lee y parsea el archivo de credenciales.
 * @returns {object} Contenido parseado del archivo
 */
function loadCredentials() {
  const credPath = resolveCredentialsPath();

  if (!fs.existsSync(credPath)) {
    console.error(JSON.stringify({
      error: 'CREDENTIALS_NOT_FOUND',
      message: `No se encontró ${credPath}. Copia docs/templates/credentials.example.json a Workspace/config/credentials.json y llena los valores.`,
    }));
    process.exit(1);
  }

  const raw = fs.readFileSync(credPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Obtiene las credenciales para una app, ambiente y tipo específicos.
 * @param {string} app - Nombre de la aplicación
 * @param {string} env - Ambiente
 * @param {string} type - Tipo de acceso
 * @returns {object} Credenciales encontradas
 */
function getCredentials(app, env, type) {
  const data = loadCredentials();

  const appData = data.credentials[app];
  if (!appData) {
    return { error: 'APP_NOT_FOUND', message: `App "${app}" no encontrada. Apps disponibles: ${Object.keys(data.credentials).join(', ')}` };
  }

  const envData = appData[env];
  if (!envData) {
    return { error: 'ENV_NOT_FOUND', message: `Ambiente "${env}" no encontrado para "${app}". Ambientes disponibles: ${Object.keys(appData).join(', ')}` };
  }

  const typeData = envData[type];
  if (!typeData) {
    return { error: 'TYPE_NOT_FOUND', message: `Tipo "${type}" no encontrado para "${app}/${env}". Tipos disponibles: ${Object.keys(envData).join(', ')}` };
  }

  return typeData;
}

// CLI execution
const [,, app, env, type] = process.argv;

if (!app || !env || !type) {
  console.error(JSON.stringify({
    error: 'USAGE',
    message: 'Uso: node scripts/get-credentials.js <app> <environment> <type>',
    example: 'node scripts/get-credentials.js huella qa web',
  }));
  process.exit(1);
}

const result = getCredentials(app, env, type);

if (result.error) {
  console.error(JSON.stringify(result));
  process.exit(1);
}

// Output solo el JSON con credenciales (consumo programático)
console.log(JSON.stringify(result));
