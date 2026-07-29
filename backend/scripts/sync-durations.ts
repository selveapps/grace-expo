// Reconcile durationSeconds in the catalogues against the REAL rendered audio.
//
//   npm run sync:durations
//
// Word-count estimates are only a pre-render guide. Once the MP3s exist, the
// audio is the source of truth, so the cards never claim a length the file does
// not have. Run after every `generate:audio`.
import { readFile, writeFile } from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORIES } from '../src/lib/storyCatalog.js';
import { TEAS } from '../src/lib/teaCatalog.js';

const exec = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const audioDir = path.join(here, '../public/audio');

async function duration(base: string): Promise<number | null> {
  try {
    const { stdout } = await exec('afinfo', [path.join(audioDir, `${base}.mp3`)]);
    const m = /estimated duration:\s*([\d.]+)/.exec(stdout);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

async function main() {
  // Stories carry one duration for the whole piece, so use the mean of the parts.
  let storySrc = await readFile(path.join(here, '../src/lib/storyCatalog.ts'), 'utf8');
  for (const s of STORIES) {
    const durs: number[] = [];
    for (let p = 1; p <= s.parts; p++) {
      const d = await duration(`${s.id}-part-${p}`);
      if (d != null) durs.push(d);
    }
    if (!durs.length) { console.log(`· ${s.id} — no audio, left at ${s.durationSeconds}s`); continue; }
    const mean = Math.round(durs.reduce((a, b) => a + b, 0) / durs.length);
    if (mean !== s.durationSeconds) {
      storySrc = storySrc.replace(
        new RegExp(`(\\{ id: '${s.id}'[\\s\\S]*?durationSeconds: )\\d+`),
        `$1${mean}`,
      );
      console.log(`✓ ${s.id} — ${s.durationSeconds}s -> ${mean}s (parts: ${durs.map((d) => d.toFixed(0)).join(', ')})`);
    }
  }
  await writeFile(path.join(here, '../src/lib/storyCatalog.ts'), storySrc);

  let teaSrc = await readFile(path.join(here, '../src/lib/teaCatalog.ts'), 'utf8');
  let teaChanged = 0;
  for (const t of TEAS) {
    const d = await duration(`tea-${t.id}`);
    if (d == null) continue;
    const secs = Math.round(d);
    if (secs !== t.durationSeconds) {
      teaSrc = teaSrc.replace(new RegExp(`(\\{ id: '${t.id}', durationSeconds: )\\d+`), `$1${secs}`);
      teaChanged++;
    }
  }
  await writeFile(path.join(here, '../src/lib/teaCatalog.ts'), teaSrc);
  console.log(`✓ ${teaChanged} tea durations reconciled to the rendered audio`);
}

main().catch((e) => { console.error(e); process.exit(1); });
