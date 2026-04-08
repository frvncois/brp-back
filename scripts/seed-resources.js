#!/usr/bin/env node
'use strict';

/**
 * Seed: Resources (with cover upload, partner + category relations, i18n locale)
 *
 * Usage:
 *   STRAPI_TOKEN=<api-token> node scripts/seed-resources.js
 *
 * Reads resources from /Users/frvncois/Desktop/resources.json
 * Reads partner + category documentIds from webflow-id-map.json
 * Saves Webflow→Strapi mapping back to webflow-id-map.json
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const http  = require('http');

const STRAPI_URL   = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const MAP_FILE     = path.join(__dirname, 'webflow-id-map.json');
const SOURCE_FILE  = '/Users/frvncois/Desktop/resources.json';

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env variable is required.\n  Usage: STRAPI_TOKEN=<token> node scripts/seed-resources.js');
  process.exit(1);
}

// Manual locale overrides for resources the heuristic gets wrong
const LOCALE_OVERRIDE = {
  '67001dfa8a5ed93ab21eeccc': 'fr', // Violence au travail – Affiches
  '662298e6bb76ada5db833167': 'fr', // VIE EN LIGNE et cyberviolence
  '6616de2de0ee449dc4136ee8': 'fr', // +FORT (application mobile)
};

function detectLocale(id, name) {
  if (LOCALE_OVERRIDE[id]) return LOCALE_OVERRIDE[id];
  if (/[¿¡]/.test(name) || /\b(sitio|comunidad|apoyo|ciudadanía|certificado)\b/i.test(name)) return 'es';
  if (/[àâäéèêëîïôùûüç]/i.test(name) ||
      /\b(les|des|une|pour|avec|dans|sur|aux|du|contre|chez|milieu|service|travail)\b/i.test(name)) return 'fr';
  return 'en';
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'image/png' }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadCover(coverUrl, retries = 4) {
  const urlObj = new URL(coverUrl);
  const filename = path.basename(urlObj.pathname);

  const { buffer, contentType } = await downloadBuffer(coverUrl);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const boundary = `----FormBoundary${Date.now()}`;
      const header = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
      );
      const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
      const body   = Buffer.concat([header, buffer, footer]);

      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body,
      });

      const text = await uploadRes.text();
      if (!uploadRes.ok) throw new Error(`HTTP ${uploadRes.status}: ${text}`);

      const [file] = JSON.parse(text);
      return file.id;
    } catch (err) {
      if (attempt === retries) throw new Error(`Cover upload failed for ${filename} after ${retries} attempts: ${err.message}`);
      process.stdout.write(`(retry ${attempt})… `);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function api(method, endpoint, body) {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} → HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  const map = fs.existsSync(MAP_FILE)
    ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'))
    : {};

  if (!map.partners)   throw new Error('No partners in map — run seed-partners.js first.');
  if (!map.categories) throw new Error('No categories in map — run seed-categories.js first.');

  map.resources = map.resources || {};

  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const published = source.items.filter(i => !i.isDraft);
  const toSeed = published.filter(i => !map.resources[i.id]);

  console.log(`Seeding ${toSeed.length} resources (${published.length - toSeed.length} already in map)…\n`);

  for (const item of toSeed) {
    const f = item.fieldData;
    const locale = detectLocale(item.id, f.name);

    process.stdout.write(`→ [${locale}] ${f.name.slice(0, 55).padEnd(55)} … `);

    // Resolve partner documentId
    const partnerEntry = map.partners[f['partner-2']];
    if (!partnerEntry) throw new Error(`Partner not found in map: ${f['partner-2']} (resource: ${f.name})`);

    // Resolve category documentIds (skip any that are somehow still missing)
    const categoryDocIds = (f.category || [])
      .map(cid => map.categories[cid]?.documentId)
      .filter(Boolean);

    // Upload cover
    process.stdout.write('cover… ');
    const coverId = await uploadCover(f.cover.url);

    // POST resource in target locale
    const localeParam = locale !== 'en' ? `?locale=${locale}` : '';
    const { data } = await api('POST', `/api/resources${localeParam}`, {
      data: {
        name: f.name,
        slug: f.slug,
        url: f.url,
        partner: partnerEntry.documentId,
        categories: { connect: categoryDocIds.map(docId => ({ documentId: docId })) },
        cover: coverId,
      },
    });

    const { id, documentId } = data;
    map.resources[item.id] = { id, documentId, name: f.name, locale };
    console.log(`id=${id}`);

    // Persist after each item so partial runs are resumable
    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  }

  console.log(`\nDone. Mapping saved → ${MAP_FILE}`);
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
