#!/usr/bin/env node
'use strict';

/**
 * Seed: Audiences (6 entries)
 *
 * Usage:
 *   STRAPI_TOKEN=<api-token> node scripts/seed-audiences.js
 *
 * Run AFTER restarting Strapi (schema changes).
 */

const fs   = require('fs');
const path = require('path');

const STRAPI_URL   = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const MAP_FILE     = path.join(__dirname, 'webflow-id-map.json');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env variable is required.');
  process.exit(1);
}

const AUDIENCES = ['adult', 'teenager', 'kid', 'coach', 'teacher', 'parent'];

async function api(method, endpoint, body) {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${STRAPI_TOKEN}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} → HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
  map.audiences = map.audiences || {};

  for (const name of AUDIENCES) {
    if (map.audiences[name]) { console.log(`✓ ${name} already in map`); continue; }

    const { data } = await api('POST', '/api/audiences', { data: { name } });
    map.audiences[name] = { id: data.id, documentId: data.documentId };
    console.log(`→ ${name}  id=${data.id}  documentId=${data.documentId}`);
    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  }

  console.log('\nDone.');
}

main().catch(err => { console.error('\nFailed:', err.message); process.exit(1); });
