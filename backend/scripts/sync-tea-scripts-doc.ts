#!/usr/bin/env tsx
/**
 * Regenerate `docs/TEA_SCRIPTS.md` from the catalog.
 *
 * The doc has always been headed "Generated from teaCatalog.ts" without a
 * generator existing, so it drifted: it still carried the `---` drafting marker
 * and durations from an older render. This makes the claim true.
 *
 *   npm run sync:tea-doc
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEAS } from '../src/lib/teaCatalog.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.join(HERE, '../../docs/TEA_SCRIPTS.md');
const AUDIO = path.join(HERE, '../public/audio');

/**
 * The teas still on the original narration style. Everything else is the
 * voice-note style, either from `Grace_Tea_Scripts_Voice_Actors.md` or from the
 * later rewrites.
 */
const LEGACY_STYLE = new Set([
  'priscilla-teach', 'hagar-seen', 'zelophehad',
  'widow-mite', 'joanna-fund', 'dorcas-needle',
]);

const header = `# Grace — Tea scripts (as shipped)

Generated from \`backend/src/lib/teaCatalog.ts\` by \`npm run sync:tea-doc\`.
Do not edit by hand. Durations are measured from the rendered MP3s by
\`npm run sync:durations\`, and every script here is the exact text sent to TTS
(\`npm run verify:audio\` asserts that against the caption sidecars).

**Style** marks which pass a script belongs to. \`voice-note\` is the current
spoken-voice-note style; \`earlier\` is the original narration, kept where the
rewrite has not been rendered yet.
`;

const sections = [...TEAS]
  .sort((a, b) => a.order - b.order)
  .map((t) => {
    const style = LEGACY_STYLE.has(t.id) ? 'earlier' : 'voice-note';
    let words = 0;
    try {
      const sidecar = JSON.parse(readFileSync(path.join(AUDIO, `tea-${t.id}.json`), 'utf8'));
      words = sidecar.words?.length ?? 0;
    } catch {
      words = 0;
    }
    return [
      `## ${t.order}. ${t.cardTitle}`,
      `\`${t.id}\` · **${t.ref}** · ${t.durationSeconds}s · ${words} words · **${style}**`,
      '',
      `**Hook:** ${t.hook}`,
      '',
      t.tea,
    ].join('\n');
  });

writeFileSync(TARGET, `${header}\n---\n\n${sections.join('\n\n---\n\n')}\n`);
console.log(`✓ docs/TEA_SCRIPTS.md regenerated (${TEAS.length} teas)`);
