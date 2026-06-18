#!/usr/bin/env node
'use strict';

const { getRecentEvents } = require('./telemetry-store');

/**
 * Groups events by a key extracted via a function.
 * @param {object[]} events - Array of events.
 * @param {Function} keyFn - Function to extract group key.
 * @returns {Object<string, object[]>} Grouped events.
 */
function groupBy(events, keyFn) {
  const map = {};
  for (const e of events) {
    const k = keyFn(e) || 'unknown';
    (map[k] = map[k] || []).push(e);
  }
  return map;
}

/**
 * Prints total events per agent.
 * @param {Object<string, object[]>} byAgent - Events grouped by agent.
 */
function printEventsByAgent(byAgent) {
  console.log('\n=== Total eventos por agente ===');
  for (const [agent, evts] of Object.entries(byAgent)) {
    console.log(`  ${agent}: ${evts.length}`);
  }
}

/**
 * Prints top 5 most-used tools.
 * @param {object[]} events - All events.
 */
function printTopTools(events) {
  const counts = {};
  for (const e of events) counts[e.tool] = (counts[e.tool] || 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log('\n=== Top 5 tools más usadas ===');
  for (const [tool, count] of sorted) console.log(`  ${tool}: ${count}`);
}

/**
 * Prints success/failure rate per agent.
 * @param {Object<string, object[]>} byAgent - Events grouped by agent.
 */
function printSuccessRate(byAgent) {
  console.log('\n=== Tasa éxito/fallo por agente ===');
  for (const [agent, evts] of Object.entries(byAgent)) {
    const ok = evts.filter(e => e.status === 'success').length;
    const fail = evts.length - ok;
    console.log(`  ${agent}: ✓${ok} ✗${fail} (${((ok / evts.length) * 100).toFixed(1)}%)`);
  }
}

/**
 * Prints count of events blocked by hooks.
 * @param {object[]} events - All events.
 */
function printBlockedByHooks(events) {
  const blocked = events.filter(e => e.blockedByHook).length;
  console.log(`\n=== Eventos bloqueados por hooks: ${blocked} ===`);
}

/**
 * Prints average duration per tool.
 * @param {object[]} events - All events.
 */
function printAvgDuration(events) {
  const sums = {};
  const counts = {};
  for (const e of events) {
    if (e.durationMs == null) continue;
    sums[e.tool] = (sums[e.tool] || 0) + e.durationMs;
    counts[e.tool] = (counts[e.tool] || 0) + 1;
  }
  console.log('\n=== Promedio duración por tool (ms) ===');
  for (const tool of Object.keys(sums)) {
    console.log(`  ${tool}: ${(sums[tool] / counts[tool]).toFixed(1)}`);
  }
}

/** Main entry point for the report script. */
function main() {
  const events = getRecentEvents(7);
  if (!events.length) { console.log('Sin eventos en los últimos 7 días.'); return; }
  const byAgent = groupBy(events, e => e.agent);
  printEventsByAgent(byAgent);
  printTopTools(events);
  printSuccessRate(byAgent);
  printBlockedByHooks(events);
  printAvgDuration(events);
}

main();
