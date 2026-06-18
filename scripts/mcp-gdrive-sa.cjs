#!/usr/bin/env node

/**
 * MCP Server for Google Drive using Service Account authentication.
 * Bypasses OAuth interactive flow — uses GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Tools: search_files, read_file_content, list_recent_files,
 *        get_file_metadata, get_file_permissions
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { google } = require('googleapis');
const { z } = require('zod');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

/** Build authenticated Drive client from Service Account. */
async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
  const client = await auth.getClient();
  return google.drive({ version: 'v3', auth: client });
}

/** Truncate text to a max length for large files. */
function truncate(text, max = 80000) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max) + '\n\n[... truncated at ' + max + ' chars]';
}

const server = new McpServer({
  name: 'google-drive-sa',
  version: '1.0.0',
});

// ── search_files ──────────────────────────────────────────
server.tool(
  'search_files',
  'Search for Drive files using a structured query (syntax: query_term operator values).',
  {
    query: z.string().optional().describe('Search query using Drive query syntax'),
    pageSize: z.number().optional().describe('Max results per page (default 10)'),
    pageToken: z.string().optional().describe('Pagination token'),
  },
  async ({ query, pageSize, pageToken }) => {
    const drive = await getDriveClient();
    const params = {
      q: query || undefined,
      pageSize: pageSize || 10,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, owners, size, webViewLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    };
    const res = await drive.files.list(params);
    const files = (res.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      owners: f.owners ? f.owners.map((o) => o.displayName).join(', ') : '',
      size: f.size,
      webViewLink: f.webViewLink,
    }));
    const result = { files, nextPageToken: res.data.nextPageToken || null };
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── read_file_content ─────────────────────────────────────
server.tool(
  'read_file_content',
  'Read the content of a Drive file. Google Workspace files are exported (Docs to text, Sheets to CSV, Slides to text).',
  {
    fileId: z.string().describe('The ID of the file to read'),
  },
  async ({ fileId }) => {
    const drive = await getDriveClient();
    const meta = await drive.files.get({ fileId, fields: 'id,name,mimeType', supportsAllDrives: true });
    const mime = meta.data.mimeType || '';
    let text = '';

    if (mime.startsWith('application/vnd.google-apps.')) {
      const exportMap = {
        'application/vnd.google-apps.document': 'text/plain',
        'application/vnd.google-apps.spreadsheet': 'text/csv',
        'application/vnd.google-apps.presentation': 'text/plain',
        'application/vnd.google-apps.drawing': 'text/plain',
      };
      const exportMime = exportMap[mime] || 'text/plain';
      const exp = await drive.files.export({ fileId, mimeType: exportMime }, { responseType: 'text' });
      text = typeof exp.data === 'string' ? exp.data : JSON.stringify(exp.data);
    } else {
      const dl = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'text' });
      text = typeof dl.data === 'string' ? dl.data : JSON.stringify(dl.data);
    }

    return {
      content: [
        { type: 'text', text: 'File: ' + meta.data.name + ' (' + mime + ')\n\n' + truncate(text) },
      ],
    };
  }
);

// ── list_recent_files ─────────────────────────────────────
server.tool(
  'list_recent_files',
  'List recent files sorted by recency, last modified, or last modified by me.',
  {
    orderBy: z.string().optional().describe('Sort: recency | lastModified | lastModifiedByMe'),
    pageSize: z.number().optional().describe('Max results (default 10)'),
    pageToken: z.string().optional().describe('Pagination token'),
  },
  async ({ orderBy, pageSize, pageToken }) => {
    const drive = await getDriveClient();
    const sortMap = {
      recency: 'recency desc',
      lastModified: 'modifiedTime desc',
      lastModifiedByMe: 'modifiedByMeTime desc',
    };
    const res = await drive.files.list({
      orderBy: sortMap[orderBy || 'lastModified'] || 'modifiedTime desc',
      pageSize: pageSize || 10,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, owners, webViewLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const files = (res.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      owners: f.owners ? f.owners.map((o) => o.displayName).join(', ') : '',
      webViewLink: f.webViewLink,
    }));
    return { content: [{ type: 'text', text: JSON.stringify({ files, nextPageToken: res.data.nextPageToken }, null, 2) }] };
  }
);

// ── get_file_metadata ─────────────────────────────────────
server.tool(
  'get_file_metadata',
  'Get metadata of a Drive file (name, type, size, owners, dates, permissions).',
  {
    fileId: z.string().describe('The ID of the file'),
  },
  async ({ fileId }) => {
    const drive = await getDriveClient();
    const res = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,createdTime,modifiedTime,size,owners,permissions,webViewLink,description',
      supportsAllDrives: true,
    });
    return { content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }] };
  }
);

// ── get_file_permissions ──────────────────────────────────
server.tool(
  'get_file_permissions',
  'List permissions of a Drive file.',
  {
    fileId: z.string().describe('The ID of the file'),
  },
  async ({ fileId }) => {
    const drive = await getDriveClient();
    const res = await drive.permissions.list({
      fileId,
      fields: 'permissions(id,type,role,emailAddress,displayName)',
      supportsAllDrives: true,
    });
    return { content: [{ type: 'text', text: JSON.stringify(res.data.permissions || [], null, 2) }] };
  }
);

// ── Start server ──────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write('MCP gdrive-sa fatal: ' + err.message + '\n');
  process.exit(1);
});
