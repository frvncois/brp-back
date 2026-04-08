#!/usr/bin/env node
'use strict';

/**
 * Cleanup: Deduplicate categories, set audiences relation on resources.
 *
 * Run AFTER:
 *   1. Restarting Strapi (schema changes: Audience type, Resource audiences field)
 *   2. Running seed-audiences.js (populates map.audiences)
 *
 * Usage:
 *   STRAPI_TOKEN=<api-token> node scripts/cleanup-categories.js
 *
 * What it does:
 *  1. Groups seeded categories by EN name → picks one canonical per name
 *  2. For each resource: computes which audiences it served (from its old Webflow category list)
 *     and sets the audiences + deduplicated categories relations
 *  3. DELETEs all non-canonical duplicate categories
 *  4. Updates webflow-id-map.json so all wids point to the canonical documentId
 */

const fs   = require('fs');
const path = require('path');

const STRAPI_URL   = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const MAP_FILE     = path.join(__dirname, 'webflow-id-map.json');
const SOURCE_FILE  = '/Users/frvncois/Desktop/resources.json';

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN env variable is required.');
  process.exit(1);
}

// Webflow category ID → audience name
const AUDIENCE_BY_WID = {
  // Adult
  '6700340d2d936f77afc048b6': 'adult', '6700123bde750f8977c4d1a2': 'adult',
  '6700121fb72860ccaee19dd6': 'adult', '6700120511cca9cbb82db52f': 'adult',
  '670011e8c3b0d7abb1b5478d': 'adult', '670011cbf9942a91ca7557af': 'adult',
  '670011ac72e9b58704173373': 'adult', '67001179c3b0d7abb1b4c1a1': 'adult',
  '6700114bde750f8977c39efa': 'adult', '67001123a261bb0d99a75611': 'adult',
  // Parent
  '660c5ac7f4b0828e89983898': 'parent', '660c5ac7f63e67063a056375': 'parent',
  '660c5ac7631a8fd1c3312ea0': 'parent', '660c5ac75412aaff46751a82': 'parent',
  '660c5ac7342b949bc78b32bf': 'parent', '660c5ac7bc03d5ce7df86e65': 'parent',
  '660c5ac756beceaf4a559ef8': 'parent', '660c5ac72a74a3b33b1bec7c': 'parent',
  '660c5ac7cde066e819e22bff': 'parent', '660c5ac8ce35ab84218b30ba': 'parent',
  '6616d67a7dd8ed5f4b106b7e': 'parent', '6617d07b547d1117a29b1462': 'parent',
  '6616aa7fa71a72fc94f5afcf': 'parent', '6616aa41c92600cd463b5e34': 'parent',
  '6616aa0d16ffc1830e9ec33c': 'parent', '6616a93970143aac448aa621': 'parent',
  // Teacher
  '660c5ac8697c42f695826119': 'teacher', '660c5ac8342b949bc78b34c6': 'teacher',
  '660c5ac89ac96028f228f96b': 'teacher', '660c5ac8b55a6090901c0200': 'teacher',
  '660c5ac738505fd4d5f5179b': 'teacher', '660c5ac7cde066e819e22c26': 'teacher',
  '660c5ac7dd97ebc73461f1b5': 'teacher', '660c5ac7f63e67063a0563e5': 'teacher',
  '660c5ac7de0d4915006c6ef8': 'teacher', '66229bf9ab5332294ab95a9b': 'teacher',
  '6617d09b547d1117a29b31ee': 'teacher', '6616a906baee1f9ab0a46cae': 'teacher',
  '6616a8b6393b7c37a920af3a': 'teacher',
  // Coach
  '660c5ac8889881bee4cb6f1f': 'coach',  '660c5ac845deeb86e7221b90': 'coach',
  '660c5ac8706c8c704cfaee8e': 'coach',  '660c5ac8578348c88806abc9': 'coach',
  '660c5ac8342b949bc78b3515': 'coach',  '660c5ac815d142678b70c000': 'coach',
  '660c5ac86f3f164f6b2cbc53': 'coach',  '660c5ac8c70cb2e592308522': 'coach',
  '660c5ac8b55a6090901c023c': 'coach',  '6617d0b2ceb7312d1c56d8c1': 'coach',
  // Kid
  '660c5ac92a74a3b33b1bee22': 'kid',    '660c5ac914250a416fca435e': 'kid',
  '660c5ac9fa9ab223a3b24972': 'kid',    '660c5ac90366c7a0070aea2d': 'kid',
  '660c5ac9fe8455079daf9a51': 'kid',    '660c5ac945deeb86e7221cb2': 'kid',
  '660c5ac946528f2be3232b72': 'kid',    '660c5ac925e29e84014d9429': 'kid',
  '660c5ac99a2cc136baae9dd9': 'kid',    '660c5ac9ce35ab84218b316b': 'kid',
  '660c5ac80aa2734474adec17': 'kid',    '660c5ac815d142678b70c043': 'kid',
  '6617d0a970d797b9dd824b40': 'kid',
  // Teenager
  '660c5acadc2827bbc80166f4': 'teenager', '660c5ac97b399707dd3c310f': 'teenager',
  '660c5ac91878e41540f1e1fc': 'teenager', '6617d0bd9ee84e596d944b8d': 'teenager',
  '660c5acac1af3dedd12dc02c': 'teenager', '660c5aca8c6cc996f08db479': 'teenager',
  '660c5aca8a5439927f1bbb27': 'teenager', '660c5aca706c8c704cfaf005': 'teenager',
  '660c5acaa0409d9886cd6ef6': 'teenager', '660c5acaf4b0828e89983bac': 'teenager',
  '660c5ac90aa2734474adef63': 'teenager', '660c5ac914250a416fca437b': 'teenager',
  '660c5ac906640360f86ce8d5': 'teenager',
  // Temp (no audience)
  '6616a98dbaee1f9ab0a50c36': null,
  '6616a9b316ffc1830e9e4e86': null,
};

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
  return text ? JSON.parse(text) : null;
}

async function main() {
  const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const published = source.items.filter(i => !i.isDraft);

  if (!map.audiences || Object.keys(map.audiences).length === 0) {
    console.error('Error: map.audiences is empty. Run seed-audiences.js first.');
    process.exit(1);
  }

  // Build audience name → documentId lookup
  const audienceDocId = {};
  for (const [name, entry] of Object.entries(map.audiences)) {
    audienceDocId[name] = entry.documentId;
  }

  // ── Step 1: group categories by EN name, pick canonical (lowest Strapi id) ──
  console.log('── Step 1: Building deduplication map ──');

  const byName = {};
  for (const [wid, entry] of Object.entries(map.categories)) {
    const name = entry.name;
    if (!byName[name]) byName[name] = [];
    byName[name].push({ wid, ...entry });
  }

  // wid → canonical documentId
  const canonicalDocId = {};
  // documentIds to DELETE (all non-canonical)
  const toDelete = [];

  for (const [name, entries] of Object.entries(byName)) {
    const sorted = entries.sort((a, b) => a.id - b.id);
    const canon = sorted[0];
    for (const e of sorted) {
      canonicalDocId[e.wid] = canon.documentId;
    }
    if (sorted.length > 1) {
      const dupes = sorted.slice(1);
      toDelete.push(...dupes.map(e => e.documentId));
      console.log(`  "${name}" → keep id=${canon.id}, delete ${dupes.length} duplicate(s)`);
    }
  }

  console.log(`\n  ${toDelete.length} categories will be deleted.\n`);

  // ── Step 2: Update resources ──────────────────────────────────────────────
  console.log('── Step 2: Updating resources (audiences relation + deduplicated categories) ──');

  for (const item of published) {
    const resourceEntry = map.resources[item.id];
    if (!resourceEntry) {
      console.log(`  ⚠ Resource not in map, skipping: ${item.fieldData.name}`);
      continue;
    }

    const catWids = item.fieldData.category || [];
    const locale = resourceEntry.locale || 'en';

    // Compute unique audience names from Webflow category IDs
    const audienceNames = [...new Set(
      catWids.map(wid => AUDIENCE_BY_WID[wid]).filter(Boolean)
    )];

    // Resolve to Strapi audience documentIds
    const audienceDocIds = audienceNames
      .map(name => audienceDocId[name])
      .filter(Boolean);

    // Compute deduplicated canonical category documentIds
    const canonDocIds = [...new Set(
      catWids.map(wid => canonicalDocId[wid]).filter(Boolean)
    )];

    process.stdout.write(`  → [${locale}] ${item.fieldData.name.slice(0, 50)} … `);

    await api('PUT', `/api/resources/${resourceEntry.documentId}?locale=${locale}`, {
      data: {
        audiences:  { set: audienceDocIds.map(docId => ({ documentId: docId })) },
        categories: { set: canonDocIds.map(docId => ({ documentId: docId })) },
      },
    });

    console.log(`[${audienceNames.join(',') || 'none'}]`);
  }

  // ── Step 3: Delete duplicate categories ───────────────────────────────────
  console.log(`\n── Step 3: Deleting ${toDelete.length} duplicate categories ──`);

  for (const docId of toDelete) {
    await api('DELETE', `/api/categories/${docId}`);
    process.stdout.write('.');
  }
  if (toDelete.length) console.log(' done');
  console.log();

  // ── Step 4: Update map — all wids now point to canonical ─────────────────
  console.log('── Step 4: Updating webflow-id-map.json ──');

  for (const [wid, entry] of Object.entries(map.categories)) {
    const newDocId = canonicalDocId[wid];
    if (newDocId && newDocId !== entry.documentId) {
      const canonEntry = Object.values(map.categories).find(e => e.documentId === newDocId);
      map.categories[wid] = { ...canonEntry, documentId: newDocId };
    }
  }

  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  console.log(`  Saved → ${MAP_FILE}\n`);

  console.log('All done.');
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
