'use strict';

const fs = require('fs');
const path = require('path');
const { getWorkspaceRoot } = require('../workspace-root');

const PROPOSALS_DIR = path.join(getWorkspaceRoot(), 'harness-improvements');

/**
 * Genera una propuesta de mejora a partir de una clasificación de fallo.
 * @param {object} classification - Objeto de clasificación del failure-classifier.
 * @returns {object|null} Propuesta de mejora o null si no aplica.
 */
function proposeImprovement(classification) {
  if (classification.type === 'permission_denied') return null;
  const proposal = buildProposal(classification);
  if (!proposal) return null;
  return {
    id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    classification,
    proposal,
    status: 'pending'
  };
}

/**
 * Construye el objeto proposal según el tipo de clasificación.
 * @param {object} classification - Clasificación del fallo.
 * @returns {{type: string, target: string, description: string, priority: string}|null}
 */
function buildProposal(classification) {
  const map = {
    hook_missing: {
      type: 'new_hook',
      target: '.kiro/hooks/',
      description: `Crear hook que prevenga: ${classification.description}`,
      priority: classification.severity
    },
    tool_misuse: {
      type: 'tool_restriction',
      target: '.kiro/steering/',
      description: `Restringir herramienta: ${classification.description}`,
      priority: classification.severity
    },
    loop_detected: {
      type: 'steering_patch',
      target: '.kiro/steering/',
      description: `Agregar stop condition: ${classification.description}`,
      priority: classification.severity
    },
    context_insufficient: {
      type: 'context_addition',
      target: '.kiro/steering/',
      description: `Agregar contexto faltante: ${classification.description}`,
      priority: classification.severity
    }
  };
  return map[classification.type] || null;
}

/**
 * Guarda las propuestas en un archivo JSON diario.
 * @param {object[]} proposals - Array de propuestas generadas.
 * @returns {string} Ruta del archivo guardado.
 */
function saveProposals(proposals) {
  if (!fs.existsSync(PROPOSALS_DIR)) {
    fs.mkdirSync(PROPOSALS_DIR, { recursive: true });
  }
  const dateStr = new Date().toISOString().slice(0, 10);
  const filePath = path.join(PROPOSALS_DIR, `proposals-${dateStr}.json`);
  fs.writeFileSync(filePath, JSON.stringify(proposals, null, 2));
  return filePath;
}

module.exports = { proposeImprovement, saveProposals };
