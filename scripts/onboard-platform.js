#!/usr/bin/env node

/**
 * Onboarding de Plataforma — Squad Agentes IA
 *
 * CLI interactivo que guía al usuario paso a paso para registrar
 * una nueva plataforma en el enjambre de agentes.
 *
 * Jerarquía: Tribu → Squad → Plataforma/Iniciativa
 *
 * Uso: node scripts/onboard-platform.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_DIR = path.join(WORKSPACE_ROOT, 'Workspace');

const TRIBUS_CONOCIDAS = [
  'Tribu Servicios Bolivar - Facilities - Proyectiva - El Libertador - Mercadeo',
  'Otra (escribir)'
];

const SQUADS_CONOCIDOS = [
  'Ciencuadras - MIA - Ecosistema Home',
  'Mercadeo y RC',
  'Proyectiva & El Libertador (Empresa)',
  'Facilities Bolívar',
  'Banca Servicios',
  'Jelpit Conjuntos - Jelpit Pagos',
  'Otro (escribir)'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    const suffix = defaultValue ? ` [${defaultValue}]` : '';
    rl.question(`  ${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function askList(question, hint) {
  return new Promise((resolve) => {
    const hintText = hint ? ` (${hint})` : '';
    rl.question(`  ${question}${hintText}: `, (answer) => {
      const items = answer.split(',').map(s => s.trim()).filter(Boolean);
      resolve(items);
    });
  });
}

async function selectOption(question, options) {
  console.log(`\n  ${question}`);
  options.forEach((opt, i) => console.log(`    ${i + 1}. ${opt}`));
  const answer = await ask('Selecciona (número)');
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < options.length) {
    if (options[idx].includes('(escribir)')) {
      return await ask('Escribe el nombre');
    }
    return options[idx];
  }
  return options[0];
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function printHeader() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ONBOARDING DE PLATAFORMA — Squad Agentes IA            ║');
  console.log('║   Jerarquía: Tribu → Squad → Plataforma                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
}

function printStep(num, title) {
  console.log(`\n── Paso ${num}: ${title} ${'─'.repeat(40 - title.length)}`);
}

async function main() {
  printHeader();

  // ─── Paso 1: Jerarquía organizacional ───
  printStep(1, 'Jerarquía organizacional');

  const tribu = await selectOption('¿A qué Tribu pertenece?', TRIBUS_CONOCIDAS);
  const squad = await selectOption('¿A qué Squad pertenece?', SQUADS_CONOCIDOS);
  const platformName = await ask('Nombre de la Plataforma/Iniciativa');
  const platformId = slugify(platformName);
  const po = await ask('Product Owner (nombre completo)');
  const poMaster = await ask('PO Transversal', 'Carlos Andrés Patiño Vélez');
  const ltt = await ask('Líder Técnico Transversal (LTT)', 'Ricardo Gómez Cuervo');

  console.log(`\n  → ID generado: "${platformId}"`);

  // ─── Paso 2: URLs y ambientes ───
  printStep(2, 'URLs y ambientes');

  const urlProd = await ask('URL Producción');
  const urlPre = await ask('URL Pre-producción (opcional)');
  const urlQa = await ask('URL QA/Stage (opcional)');

  const auditZonesRaw = await askList(
    'Zonas de auditoría',
    'separadas por coma, ej: Home,Login,Dashboard'
  );
  const auditZones = auditZonesRaw.map(name => ({
    name,
    url: name.toLowerCase() === 'home' ? '/' : `/${slugify(name)}`
  }));

  // ─── Paso 3: Jira ───
  printStep(3, 'Jira');

  const jiraProjectKey = await ask('Project Key de Jira (ej: GD768)');
  const jiraProjectUrl = await ask('URL del proyecto en Jira');
  const jiraIncidentBoardId = await ask('ID del tablero de incidentes');
  const jiraIncidentBoardUrl = await ask('URL del tablero de incidentes');
  const jiraSecurityBoardId = await ask('ID del tablero de seguridad', '32394');
  const jiraSecurityBoardUrl = await ask(
    'URL del tablero de seguridad',
    'https://jirasegurosbolivar.atlassian.net/jira/dashboards/32394'
  );

  // ─── Paso 4: Datadog ───
  printStep(4, 'Datadog');

  const ddDashboardId = await ask('Dashboard ID de Datadog (ej: wei-k9v-vkx)');
  const ddDashboardUrl = await ask('URL del dashboard de Datadog');
  const ddServices = await askList(
    'Servicios críticos',
    'separados por coma'
  );

  // ─── Paso 5: Clarity (opcional) ───
  printStep(5, 'Microsoft Clarity (opcional)');

  const clarityProjectId = await ask('Project ID de Clarity (dejar vacío si no aplica)');
  let clarityDashboardUrl = '';
  if (clarityProjectId) {
    clarityDashboardUrl = `https://clarity.microsoft.com/projects/view/${clarityProjectId}/dashboard`;
  }

  // ─── Paso 6: GitHub / Source Control ───
  printStep(6, 'GitHub / Source Control');

  const githubOrg = await ask('Organización de GitHub', 'segurosbolivar');
  const githubRepos = await askList(
    'Repos principales',
    'separados por coma'
  );
  const sourceControlNote = await ask('Nota sobre source control (ej: repos en CodeCommit, dejar vacío si es GitHub)');

  // ─── Paso 7: AWS (opcional) ───
  printStep(7, 'AWS (opcional)');

  const awsRegion = await ask('Región AWS', 'us-east-1');
  const awsCluster = await ask('Cluster ECS (dejar vacío si no aplica)');
  const awsServices = await askList(
    'Servicios AWS principales',
    'separados por coma, ej: ECS,RDS,S3,CloudFront'
  );

  // ─── Generar estructura ───
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  Generando estructura...');
  console.log('══════════════════════════════════════════════════════════\n');

  const platformDir = path.join(WORKSPACE_DIR, platformName);

  const dirs = [
    'config',
    'audit/lighthouse',
    'audit/screenshots',
    'data',
    'observabilidad/runbooks',
    'plans',
    'playwright',
    'reports/evidencias',
    'repos',
    'scripts',
    'specs',
    'steering'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(platformDir, dir);
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✅ Creado: Workspace/${platformName}/${dir}/`);
  });

  // ─── Generar platforms.json ───
  const platformsJson = {
    tribu,
    squad: {
      name: squad,
      po,
      poTransversal: poMaster,
      ltt
    },
    platforms: [
      {
        id: platformId,
        name: platformName,
        urls: {
          app: urlProd,
          pre: urlPre,
          qa: urlQa,
          staging: urlPre || urlQa,
          docs: ''
        },
        smokePaths: auditZones.map(z => z.url),
        auditZones,
        jira: {
          cloudId: '',
          projectKey: jiraProjectKey,
          projectUrl: jiraProjectUrl,
          boardId: '',
          incidentBoardId: jiraIncidentBoardId,
          incidentBoardUrl: jiraIncidentBoardUrl,
          securityIncidentBoardId: jiraSecurityBoardId,
          securityIncidentBoardUrl: jiraSecurityBoardUrl
        },
        datadog: {
          site: 'us1',
          dashboardId: ddDashboardId,
          dashboardUrl: ddDashboardUrl,
          dashboardIds: ddDashboardId ? [ddDashboardId] : [],
          monitorTags: [],
          criticalServices: ddServices,
          serviceToRepos: {}
        },
        clarity: clarityProjectId ? {
          projectId: clarityProjectId,
          dashboardUrl: clarityDashboardUrl,
          tokenEnvVar: 'CLARITY_API_TOKEN'
        } : null,
        github: {
          org: githubOrg,
          repos: githubRepos,
          note: sourceControlNote || undefined
        },
        aws: (awsCluster || awsServices.length > 0) ? {
          region: awsRegion,
          cluster: awsCluster,
          services: awsServices
        } : null
      }
    ],
    defaultPlatformId: platformId,
    onboardedAt: new Date().toISOString(),
    onboardedBy: 'onboard-platform v1.0'
  };

  const configPath = path.join(platformDir, 'config', 'platforms.json');
  fs.writeFileSync(configPath, JSON.stringify(platformsJson, null, 2), 'utf-8');
  console.log(`  ✅ Generado: Workspace/${platformName}/config/platforms.json`);

  // ─── Generar README.md ───
  const readmeContent = `# Squad: ${squad}

PO: ${po.toUpperCase()}
PO Transversal: ${poMaster.toUpperCase()}
LTT: ${ltt.toUpperCase()}

## Tribu

${tribu}

## Plataformas

| Plataforma | URL Producción | Jira |
|------------|---------------|------|
| ${platformName} | ${urlProd} | ${jiraProjectKey} |

## Recursos Conectados

| Recurso | ID / URL |
|---------|----------|
| Jira | ${jiraProjectKey} — ${jiraProjectUrl} |
| Datadog | ${ddDashboardId ? ddDashboardId + ' — ' + ddDashboardUrl : 'Pendiente'} |
| Clarity | ${clarityProjectId ? clarityProjectId + ' — ' + clarityDashboardUrl : 'No configurado'} |
| GitHub | ${githubOrg}/${githubRepos.length > 0 ? githubRepos.join(', ') : 'Pendiente'} |
| Tablero Incidentes | ${jiraIncidentBoardId ? 'Dashboard ' + jiraIncidentBoardId + ' — ' + jiraIncidentBoardUrl : 'Pendiente'} |
| Tablero Seguridad | ${jiraSecurityBoardId ? 'Dashboard ' + jiraSecurityBoardId + ' — ' + jiraSecurityBoardUrl : 'Pendiente'} |

## Estado del Onboarding

- [x] Estructura de carpetas creada
- [x] platforms.json generado
- [ ] Baseline de observabilidad (Datadog)
- [ ] Baseline de comportamiento (Clarity)
- [ ] Auditoría Lighthouse
- [ ] Primera Historia de Usuario creada
`;

  const readmePath = path.join(platformDir, 'README.md');
  fs.writeFileSync(readmePath, readmeContent, 'utf-8');
  console.log(`  ✅ Generado: Workspace/${platformName}/README.md`);

  // ─── Generar steering de contexto ───
  const steeringContent = `---
inclusion: always
---
# Contexto ${platformName}

Aprendizajes verificados para que todos los agentes operen con información precisa.
Los datos específicos (IDs, URLs, servicios) se leen de \`Workspace/${platformName}/config/platforms.json\`.

---

## 1. Arquitectura del Portal

- **Framework:** [Completar tras exploración]
- **Ambientes:** Leer URLs de \`platforms.json\` → \`urls.app\`, \`urls.pre\`, \`urls.qa\`

## 2. Métricas Baseline

Pendiente: ejecutar auditoría de estado cero.

## 3. Aprendizajes Operativos

[Se irán agregando conforme los agentes operen sobre esta plataforma]

## 4. Archivos de Referencia

| Archivo | Contenido |
|---------|-----------|
| Workspace/${platformName}/config/platforms.json | Fuente de verdad — IDs, URLs, servicios |
| Workspace/${platformName}/reports/ | Reportes y evidencias |
| Workspace/${platformName}/observabilidad/ | Runbooks y baselines |
| Workspace/${platformName}/plans/ | Planes generados por agentes |
`;

  const steeringPath = path.join(platformDir, 'steering', `${platformId}-context.md`);
  fs.writeFileSync(steeringPath, steeringContent, 'utf-8');
  console.log(`  ✅ Generado: Workspace/${platformName}/steering/${platformId}-context.md`);

  // ─── Generar script de upload evidencias ───
  const uploadScript = `#!/bin/bash
# Upload de evidencias a Jira — ${platformName}
# Uso: ./upload-evidencias-jira.sh ISSUE_KEY archivo1.png archivo2.png
# Requiere: JIRA_EMAIL y JIRA_API_TOKEN como variables de entorno

ISSUE_KEY=\$1
shift

if [ -z "\$ISSUE_KEY" ] || [ -z "\$1" ]; then
  echo "Uso: ./upload-evidencias-jira.sh ISSUE_KEY archivo1.png [archivo2.png ...]"
  exit 1
fi

if [ -z "\$JIRA_EMAIL" ] || [ -z "\$JIRA_API_TOKEN" ]; then
  echo "Error: Variables JIRA_EMAIL y JIRA_API_TOKEN requeridas"
  exit 1
fi

JIRA_BASE="https://jirasegurosbolivar.atlassian.net"
AUTH=\$(echo -n "\${JIRA_EMAIL}:\${JIRA_API_TOKEN}" | base64)

for FILE in "\$@"; do
  if [ ! -f "\$FILE" ]; then
    echo "⚠️  Archivo no encontrado: \$FILE"
    continue
  fi
  echo "📎 Subiendo \$FILE a \$ISSUE_KEY..."
  curl -s -X POST \\
    -H "Authorization: Basic \$AUTH" \\
    -H "X-Atlassian-Token: no-check" \\
    -F "file=@\$FILE" \\
    "\$JIRA_BASE/rest/api/3/issue/\$ISSUE_KEY/attachments" | jq '.[] | .filename'
done

echo "✅ Upload completado para \$ISSUE_KEY"
`;

  const uploadPath = path.join(platformDir, 'scripts', 'upload-evidencias-jira.sh');
  fs.writeFileSync(uploadPath, uploadScript, 'utf-8');
  fs.chmodSync(uploadPath, '755');
  console.log(`  ✅ Generado: Workspace/${platformName}/scripts/upload-evidencias-jira.sh`);

  // ─── Resumen final ───
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  ✅ ONBOARDING COMPLETADO');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`\n  Tribu:       ${tribu}`);
  console.log(`  Squad:       ${squad}`);
  console.log(`  Plataforma:  ${platformName} (${platformId})`);
  console.log(`  Directorio:  Workspace/${platformName}/`);
  console.log(`\n  Próximos pasos:`);
  console.log(`  1. Verificar platforms.json generado`);
  console.log(`  2. Ejecutar baseline de observabilidad (Datadog)`);
  console.log(`  3. Ejecutar auditoría Lighthouse`);
  console.log(`  4. Configurar Clarity si aplica`);
  console.log(`  5. Crear primera Historia de Usuario\n`);

  rl.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  rl.close();
  process.exit(1);
});
