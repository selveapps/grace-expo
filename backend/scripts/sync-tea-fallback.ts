#!/usr/bin/env tsx
/**
 * Regenerate the offline Tea fallback bundled into the app.
 *
 * `src/services/TeaService.js` carries a copy of all 30 teas so the tab works
 * with no network. Its header has always claimed the copy is generated from
 * `teaCatalog.ts` "so the two cannot drift" — but no generator existed, and
 * they had drifted a long way: the bundled copy still held the v1 scripts,
 * complete with the `---` marker left over from the original drafting format,
 * and durations that no rendered file had matched for several builds. Offline,
 * the app told a different story than online.
 *
 * Run after any edit to the tea catalog:
 *   npm run sync:tea-fallback
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEAS } from '../src/lib/teaCatalog.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.join(HERE, '../../src/services/TeaService.js');

const START = 'const FALLBACK_TEAS = [';
const END = '];';

const rows = TEAS.map((t) => JSON.stringify({
  id: t.id,
  cardTitle: t.cardTitle,
  heat: t.heat,
  badge: t.badge,
  hook: t.hook,
  tea: t.tea,
  ref: t.ref,
  book: t.book,
  chapter: t.chapter,
  mood: t.mood,
  order: t.order,
  durationSeconds: t.durationSeconds,
}));

const source = readFileSync(TARGET, 'utf8');
const start = source.indexOf(START);
if (start < 0) throw new Error(`${TARGET}: could not find "${START}"`);

const bodyStart = start + START.length;
const end = source.indexOf(`\n${END}`, bodyStart);
if (end < 0) throw new Error(`${TARGET}: could not find the end of FALLBACK_TEAS`);

const next =
  source.slice(0, bodyStart) +
  '\n' + rows.map((r) => `  ${r},`).join('\n') +
  source.slice(end);

if (next === source) {
  console.log('✓ tea fallback already matches the catalog');
} else {
  writeFileSync(TARGET, next);
  console.log(`✓ tea fallback regenerated from teaCatalog (${TEAS.length} teas)`);
}
