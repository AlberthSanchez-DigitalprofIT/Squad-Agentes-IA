'use strict';

/**
 * Clasifica un evento de telemetría con status de fallo.
 * @param {object} event - Evento con agent, tool, status, action, blockedByHook.
 * @returns {{type: string, severity: string, description: string, suggestedAction: string}}
 */
function classifyFailure(event) {
  if (event.status === 'blocked' && event.blockedByHook) {
    return buildResult('permission_denied', 'low',
      `Hook bloqueó ${event.tool} para ${event.agent}`,
      'No se requiere acción, el hook funciona correctamente');
  }
  if (event.status === 'error' && isToolMisuse(event)) {
    return buildResult('tool_misuse', 'medium',
      `${event.agent} usó ${event.tool} incorrectamente`,
      'Restringir herramienta al agente correcto');
  }
  if (event.status === 'error' && isContextInsufficient(event)) {
    return buildResult('context_insufficient', 'medium',
      `${event.agent} falló por falta de contexto en ${event.action}`,
      'Agregar información al steering del agente');
  }
  if (event.status === 'error') {
    return buildResult('unknown', 'low',
      `Error no clasificado: ${event.agent}/${event.tool}/${event.action}`,
      'Revisar manualmente el evento');
  }
  return buildResult('unknown', 'low', 'Evento no reconocido', 'Revisar manualmente');
}

/**
 * Construye el objeto de resultado de clasificación.
 * @param {string} type - Tipo de fallo.
 * @param {string} severity - Severidad.
 * @param {string} description - Descripción del fallo.
 * @param {string} suggestedAction - Acción sugerida.
 * @returns {{type: string, severity: string, description: string, suggestedAction: string}}
 */
function buildResult(type, severity, description, suggestedAction) {
  return { type, severity, description, suggestedAction };
}

/**
 * Determina si el evento es un uso incorrecto de herramienta.
 * @param {object} event - Evento de telemetría.
 * @returns {boolean}
 */
function isToolMisuse(event) {
  const agentToolMap = {
    'seo-agent': ['lighthouse_audit', 'browser_navigate', 'web_fetch'],
    'security-agent': ['register_usage_event'],
    'infra-agent': ['call_aws', 'use_aws']
  };
  const allowed = agentToolMap[event.agent];
  return allowed && !allowed.includes(event.tool);
}

/**
 * Determina si el fallo se debe a contexto insuficiente.
 * @param {object} event - Evento de telemetría.
 * @returns {boolean}
 */
function isContextInsufficient(event) {
  const contextActions = ['read_config', 'get_credentials', 'fetch_context'];
  return contextActions.includes(event.action);
}

/**
 * Clasifica un lote de eventos detectando loops.
 * @param {object[]} events - Array de eventos de telemetría.
 * @returns {Array<{type: string, severity: string, description: string, suggestedAction: string}>}
 */
function classifyBatch(events) {
  const results = [];
  for (let i = 0; i < events.length; i++) {
    if (isLoopAt(events, i)) {
      results.push(buildResult('loop_detected', 'high',
        `Loop detectado: ${events[i].agent}/${events[i].tool}/${events[i].action}`,
        'Agregar regla de stop condition al steering'));
    } else {
      results.push(classifyFailure(events[i]));
    }
  }
  return results;
}

/**
 * Detecta si hay 3+ eventos consecutivos idénticos en la posición dada.
 * @param {object[]} events - Array de eventos.
 * @param {number} idx - Índice actual.
 * @returns {boolean}
 */
function isLoopAt(events, idx) {
  if (idx < 2) return false;
  const curr = events[idx];
  const prev1 = events[idx - 1];
  const prev2 = events[idx - 2];
  return curr.agent === prev1.agent && curr.agent === prev2.agent
    && curr.tool === prev1.tool && curr.tool === prev2.tool
    && curr.action === prev1.action && curr.action === prev2.action;
}

module.exports = { classifyFailure, classifyBatch };
