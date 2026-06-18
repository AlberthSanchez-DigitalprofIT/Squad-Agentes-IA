'use strict';

const fs = require('fs');
const path = require('path');

const TELEMETRY_DIR = path.resolve(__dirname, '../../Workspace/telemetry');

/**
 * Ensures the telemetry directory exists.
 */
function ensureDir() {
  if (!fs.existsSync(TELEMETRY_DIR)) {
    fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
  }
}

/**
 * Returns the file path for a given date string.
 * @param {string} dateStr - Date in YYYY-MM-DD format.
 * @returns {string} Absolute path to the .jsonl file.
 */
function getFilePath(dateStr) {
  return path.join(TELEMETRY_DIR, `${dateStr}.jsonl`);
}

/**
 * Logs a telemetry event to the daily JSONL file.
 * @param {object} event - Event data.
 * @param {string} event.agent - Agent name.
 * @param {string} event.tool - Tool used.
 * @param {string} [event.mcpServer] - MCP server name.
 * @param {string} event.action - Action performed.
 * @param {number} [event.durationMs] - Duration in milliseconds.
 * @param {string} event.status - "success" or "error".
 * @param {number} [event.contextTokens] - Context token count.
 * @param {boolean} [event.blockedByHook] - Whether blocked by a hook.
 */
function logEvent(event) {
  ensureDir();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const record = { ...event, timestamp: now.toISOString() };
  fs.appendFileSync(getFilePath(dateStr), JSON.stringify(record) + '\n');
}

/**
 * Reads and parses all events for a given date.
 * @param {string} dateStr - Date in YYYY-MM-DD format.
 * @returns {object[]} Array of parsed event objects.
 */
function getEventsForDate(dateStr) {
  const filePath = getFilePath(dateStr);
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

/**
 * Reads events from the last N days.
 * @param {number} [days=7] - Number of days to look back.
 * @returns {object[]} Array of parsed event objects.
 */
function getRecentEvents(days = 7) {
  const events = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    events.push(...getEventsForDate(dateStr));
  }
  return events;
}

module.exports = { logEvent, getEventsForDate, getRecentEvents };
