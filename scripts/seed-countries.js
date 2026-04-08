#!/usr/bin/env node
'use strict';

/**
 * Seed: Countries (EN default + FR + ES localizations)
 *
 * Usage:
 *   STRAPI_TOKEN=<api-token> node scripts/seed-countries.js
 *
 * Saves Webflow→Strapi mapping to scripts/webflow-id-map.json
 */

const fs   = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const MAP_FILE = path.join(__dirname, 'webflow-id-map.json');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env variable is required.\n  Usage: STRAPI_TOKEN=<token> node scripts/seed-countries.js');
  process.exit(1);
}

const COUNTRIES = [
  { wid: '681226d9ac7d04e4b62b5b03', name: 'Finland',        slug: 'finland',        fr: 'Finlande',    es: 'Finlandia'     },
  { wid: '660c5c8114250a416fcc4b72', name: 'Austria',        slug: 'austria',        fr: 'Autriche',    es: 'Austria'       },
  { wid: '660c5c7866a8169111f1f12d', name: 'Global',         slug: 'global',         fr: 'Global',      es: 'Mundial'       },
  { wid: '660c5c70628092adfbcc3d7c', name: 'Scotland',       slug: 'scotland',       fr: 'Escoce',      es: 'Escocia'       },
  { wid: '660c5c689a2cc136bab0eb1e', name: 'Mexico',         slug: 'mexico',         fr: 'Mexique',     es: 'México'        },
  { wid: '660c5c5e631a8fd1c332c0b9', name: 'United Kingdom', slug: 'united-kingdom', fr: 'Royaume-Uni', es: 'Reino Unido'   },
  { wid: '660c5c5353b452108ea87e67', name: 'Canada',         slug: 'canada',         fr: 'Canada',      es: 'Canada'        },
  { wid: '660c5c4d8a12e469d58e5834', name: 'Australia',      slug: 'australia',      fr: 'Australie',   es: 'Australia'     },
  { wid: '660c5c449a2cc136bab0c043', name: 'United States',  slug: 'united-states',  fr: 'États-Unis',  es: 'Estados Unidos'},
];

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

  map.countries = map.countries || {};

  for (const c of COUNTRIES) {
    process.stdout.write(`→ ${c.name} ... `);

    // 1. Create EN entry (default locale)
    const { data: en } = await api('POST', '/api/countries', {
      data: { name: c.name, slug: c.slug },
    });

    const { id, documentId } = en;

    // 2. FR localization
    await api('PUT', `/api/countries/${documentId}?locale=fr`, {
      data: { name: c.fr, slug: c.slug },
    });

    // 3. ES localization
    await api('PUT', `/api/countries/${documentId}?locale=es`, {
      data: { name: c.es, slug: c.slug },
    });

    map.countries[c.wid] = { id, documentId, name: c.name };
    console.log(`id=${id}, documentId=${documentId}`);
  }

  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  console.log(`\nMapping saved → ${MAP_FILE}`);
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
