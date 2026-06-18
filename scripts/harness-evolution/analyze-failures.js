'use strict';

const { getRecentEvents } = require('../harness-telemetry');
const { classifyBatch } = require('./failure-classifier');
const { proposeImprovement, saveProposals } = require('./improvement-proposer');

/**
 * Filtra eventos con status error o blocked.
 * @param {object[]} events - Todos los eventos de telemetría.
 * @returns {object[]} Eventos fallidos.
 */
function filterFailures(events) {
  return events.filter(e => e.status === 'error' || e.status === 'blocked');
}

/**
 * Genera propuestas a partir de clasificaciones.
 * @param {object[]} classifications - Array de clasificaciones.
 * @returns {object[]} Propuestas válidas (sin nulls).
 */
function generateProposals(classifications) {
  return classifications.map(proposeImprovement).filter(Boolean);
}

/**
 * Imprime resumen del análisis de fallos.
 * @param {object[]} failures - Eventos fallidos.
 * @param {object[]} classifications - Clasificaciones.
 * @param {object[]} proposals - Propuestas generadas.
 */
function printSummary(failures, classifications, proposals) {
  const byType = {};
  for (const c of classifications) {
    byType[c.type] = (byType[c.type] || 0) + 1;
  }
  console.log('\n=== Failure Pipeline - Resumen ===');
  console.log(`Total fallos analizados: ${failures.length}`);
  console.log('Por tipo:');
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }
  console.log(`Propuestas generadas: ${proposals.length}`);
}

/**
 * Ejecuta el pipeline completo de análisis de fallos.
 */
function run() {
  const events = getRecentEvents(7);
  const failures = filterFailures(events);
  if (failures.length === 0) {
    console.log('No se encontraron fallos en los últimos 7 días.');
    return;
  }
  const classifications = classifyBatch(failures);
  const proposals = generateProposals(classifications);
  if (proposals.length > 0) {
    const filePath = saveProposals(proposals);
    console.log(`Propuestas guardadas en: ${filePath}`);
  }
  printSummary(failures, classifications, proposals);
}

run();
