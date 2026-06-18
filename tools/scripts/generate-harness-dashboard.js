'use strict';

const fs = require('fs');
const path = require('path');

const { getRecentEvents } = require('../../scripts/harness-telemetry');

const IMPROVEMENTS_DIR = path.resolve(__dirname, '../../Workspace/harness-improvements');
const OUTPUT_PATH = path.resolve(__dirname, '../../docs/harness-dashboard.html');

/**
 * Reads improvement proposals from the harness-improvements directory.
 * @returns {{ pending: string[], applied: string[] }} Proposals grouped by status.
 */
function readImprovements() {
  if (!fs.existsSync(IMPROVEMENTS_DIR)) return { pending: [], applied: [] };
  const files = fs.readdirSync(IMPROVEMENTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.json'));
  const pending = [];
  const applied = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(IMPROVEMENTS_DIR, file), 'utf-8');
    const isApplied = content.includes('status: applied') || content.includes('"status":"applied"');
    (isApplied ? applied : pending).push(file);
  }
  return { pending, applied };
}

/**
 * Counts occurrences of each value for a given key across events.
 * @param {object[]} events - Telemetry events.
 * @param {string} key - Object key to group by.
 * @returns {Record<string, number>} Counts per value.
 */
function countBy(events, key) {
  const counts = {};
  for (const ev of events) {
    const val = ev[key] || 'unknown';
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

/**
 * Gets the top N entries from a counts object sorted descending.
 * @param {Record<string, number>} counts - Counts map.
 * @param {number} n - Number of top entries.
 * @returns {[string, number][]} Top N entries as [key, count] pairs.
 */
function topN(counts, n) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

/**
 * Calculates success and failure rates from events.
 * @param {object[]} events - Telemetry events.
 * @returns {{ total: number, success: number, error: number, rate: string }}
 */
function calculateRates(events) {
  const total = events.length;
  const success = events.filter(e => e.status === 'success').length;
  const error = total - success;
  const rate = total > 0 ? ((success / total) * 100).toFixed(1) : '0.0';
  return { total, success, error, rate };
}

/**
 * Calculates per-agent success rates.
 * @param {object[]} events - Telemetry events.
 * @returns {{ agent: string, total: number, success: number, rate: string }[]}
 */
function perAgentRates(events) {
  const grouped = {};
  for (const ev of events) {
    const agent = ev.agent || 'unknown';
    if (!grouped[agent]) grouped[agent] = [];
    grouped[agent].push(ev);
  }
  return Object.entries(grouped).map(([agent, evs]) => {
    const { total, success, rate } = calculateRates(evs);
    return { agent, total, success, rate };
  }).sort((a, b) => b.total - a.total);
}

/**
 * Gets events blocked by enforcement hooks.
 * @param {object[]} events - Telemetry events.
 * @returns {object[]} Blocked events.
 */
function getBlockedEvents(events) {
  return events.filter(e => e.blockedByHook === true);
}

/**
 * Generates the full HTML dashboard string.
 * @param {object} data - Computed metrics data.
 * @returns {string} Complete HTML document.
 */
function generateHtml(data) {
  const { global, byAgent, topTools, blocked, improvements, isEmpty } = data;

  const emptyMessage = `<div class="empty-state">
    <h2>Sin datos de telemetry aún</h2>
    <p>Ejecuta <code>npm run harness:report</code> después de usar agentes para ver métricas.</p>
  </div>`;

  const summaryCards = `<section class="cards">
    <div class="card"><span class="big">${global.total}</span><span class="label">Eventos totales</span></div>
    <div class="card"><span class="big">${global.rate}%</span><span class="label">Tasa de éxito</span></div>
    <div class="card"><span class="big">${global.error}</span><span class="label">Errores</span></div>
    <div class="card"><span class="big">${blocked.length}</span><span class="label">Bloqueados por hooks</span></div>
    <div class="card"><span class="big">${improvements.pending.length}</span><span class="label">Propuestas pendientes</span></div>
  </section>`;

  const agentRows = byAgent.map(a =>
    `<tr><td>${a.agent}</td><td>${a.total}</td><td>${a.success}</td><td>${a.rate}%</td></tr>`
  ).join('\n');

  const agentTable = `<section>
    <h2>Actividad por agente</h2>
    <table><thead><tr><th>Agente</th><th>Total</th><th>Éxito</th><th>Tasa</th></tr></thead>
    <tbody>${agentRows || '<tr><td colspan="4">Sin datos</td></tr>'}</tbody></table>
  </section>`;

  const toolsList = topTools.map(([t, c]) => `<li><strong>${t}</strong>: ${c}</li>`).join('\n');
  const toolsSection = `<section>
    <h2>Top 5 tools más usadas</h2>
    <ul>${toolsList || '<li>Sin datos</li>'}</ul>
  </section>`;

  const blockedRows = blocked.slice(0, 20).map(e =>
    `<tr><td>${e.agent || '-'}</td><td>${e.tool || '-'}</td><td>${e.action || '-'}</td><td>${e.timestamp || '-'}</td></tr>`
  ).join('\n');

  const enforcementSection = `<section>
    <h2>Enforcement — Hooks que bloquearon</h2>
    <table><thead><tr><th>Agente</th><th>Tool</th><th>Acción</th><th>Timestamp</th></tr></thead>
    <tbody>${blockedRows || '<tr><td colspan="4">Ningún evento bloqueado</td></tr>'}</tbody></table>
  </section>`;

  const pendingList = improvements.pending.map(f => `<li>${f}</li>`).join('\n');
  const improvementsSection = `<section>
    <h2>Propuestas de mejora pendientes</h2>
    <ul>${pendingList || '<li>No hay propuestas pendientes</li>'}</ul>
    <p><em>${improvements.applied.length} propuestas aplicadas.</em></p>
  </section>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Harness Health Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1a1a2e;color:#e0e0e0;font-family:system-ui,-apple-system,sans-serif;padding:2rem;line-height:1.6}
h1{text-align:center;margin-bottom:2rem;font-size:2rem;color:#fff}
h2{margin-bottom:1rem;color:#a0c4ff;font-size:1.3rem}
section{margin-bottom:2rem}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:2rem}
.card{background:#16213e;border-radius:12px;padding:1.5rem;text-align:center}
.card .big{display:block;font-size:2.5rem;font-weight:700;color:#4fc3f7}
.card .label{display:block;margin-top:.5rem;font-size:.9rem;color:#90a4ae}
table{width:100%;border-collapse:collapse;background:#16213e;border-radius:8px;overflow:hidden}
th,td{padding:.75rem 1rem;text-align:left;border-bottom:1px solid #263238}
th{background:#0f3460;color:#a0c4ff}
ul{list-style:disc inside;padding-left:1rem}
li{margin-bottom:.4rem}
code{background:#263238;padding:2px 6px;border-radius:4px;font-size:.9em}
footer{text-align:center;margin-top:3rem;color:#607d8b;font-size:.85rem}
.empty-state{text-align:center;padding:4rem 2rem;background:#16213e;border-radius:12px}
.empty-state h2{color:#ffab40;margin-bottom:1rem}
</style>
</head>
<body>
<h1>Harness Health Dashboard</h1>
${isEmpty ? emptyMessage : summaryCards + agentTable + toolsSection + enforcementSection + improvementsSection}
<footer>Generado: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</footer>
</body>
</html>`;
}

/**
 * Main entry point: reads data, computes metrics, generates HTML.
 */
function main() {
  const events = getRecentEvents(30);
  const improvements = readImprovements();
  const isEmpty = events.length === 0;

  const global = calculateRates(events);
  const byAgent = perAgentRates(events);
  const toolCounts = countBy(events, 'tool');
  const topTools = topN(toolCounts, 5);
  const blocked = getBlockedEvents(events);

  const html = generateHtml({ global, byAgent, topTools, blocked, improvements, isEmpty });

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');

  console.log('=== Harness Health Dashboard ===');
  console.log(`Eventos (30d): ${global.total}`);
  console.log(`Tasa éxito: ${global.rate}%`);
  console.log(`Bloqueados por hooks: ${blocked.length}`);
  console.log(`Propuestas pendientes: ${improvements.pending.length}`);
  console.log(`Propuestas aplicadas: ${improvements.applied.length}`);
  console.log(`\nDashboard generado: ${OUTPUT_PATH}`);
}

main();
