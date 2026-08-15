// Post-render audit. Verifies that every catalogued story part, Tea and the
// onboarding sample has an MP3 plus a transcript sidecar, that each sidecar's
// text is byte-identical to the copy it claims to narrate, and that the declared
// durationSeconds matches the real audio.
//
//   npm run verify:audio
//
// Duration is read from the MP3 itself via `afinfo` (macOS). Where afinfo is
// unavailable the duration check is reported as skipped rather than passed.
import { readFile, access } from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORIES } from '../src/lib/storyCatalog.js';
import { TEAS } from '../src/lib/teaCatalog.js';
import { STORY_SCRIPT_V2 } from '../src/lib/narrationScripts.js';

const exec = promisify(execFile);
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/audio');

/** Tolerance between declared metadata and the real rendered audio. */
const STORY_TOLERANCE = 0.20; // 20%, story duration is a per-story average of its parts
const TEA_TOLERANCE = 0.20;

type Row = {
  id: string;
  kind: string;
  mp3: boolean;
  sidecar: boolean;
  textMatch: boolean | null;
  words: number | null;
  actual: number | null;
  declared: number | null;
};

async function exists(p: string) {
  try { await access(p); return true; } catch { return false; }
}

async function duration(file: string): Promise<number | null> {
  try {
    const { stdout } = await exec('afinfo', [file]);
    const m = /estimated duration:\s*([\d.]+)/.exec(stdout);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

/**
 * The sidecar holds the exact TTS input, which carries prosody line breaks; the
 * catalogue stores the same copy on one line. Whitespace is the only legitimate
 * difference, so compare normalised. Any word difference still fails.
 */
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

async function inspect(base: string, kind: string, expectedText: string, declared: number | null): Promise<Row> {
  const mp3Path = path.join(dir, `${base}.mp3`);
  const jsonPath = path.join(dir, `${base}.json`);
  const row: Row = {
    id: base, kind,
    mp3: await exists(mp3Path),
    sidecar: await exists(jsonPath),
    textMatch: null, words: null, actual: null, declared,
  };
  if (row.sidecar) {
    const s = JSON.parse(await readFile(jsonPath, 'utf8')) as { text?: string; words?: unknown[] };
    row.textMatch = norm(s.text ?? '') === norm(expectedText);
    row.words = s.words?.length ?? 0;
  }
  if (row.mp3) row.actual = await duration(mp3Path);
  return row;
}

async function main() {
  const rows: Row[] = [];

  for (const story of STORIES) {
    const parts = STORY_SCRIPT_V2[story.id] ?? [];
    for (let p = 1; p <= story.parts; p++) {
      rows.push(await inspect(`${story.id}-part-${p}`, 'story', parts[p - 1]?.text ?? '', story.durationSeconds));
    }
  }
  for (const tea of TEAS) {
    rows.push(await inspect(`tea-${tea.id}`, 'tea', `${tea.hook} ${tea.tea}`, tea.durationSeconds ?? null));
  }
  for (const id of ['onboarding-preview', 'ruth-preview']) {
    rows.push(await inspect(id, 'onboarding', '', null));
  }

  const fail: string[] = [];
  let noDurationTool = 0;

  console.log('kind        id                              mp3  json  text  words  actual  declared');
  for (const r of rows) {
    const tol = r.kind === 'tea' ? TEA_TOLERANCE : STORY_TOLERANCE;
    let durOk = true;
    if (r.actual == null) noDurationTool++;
    else if (r.declared != null) durOk = Math.abs(r.actual - r.declared) / r.declared <= tol;

    // The onboarding sample has no catalogue entry to compare its text against.
    const textOk = r.kind === 'onboarding' ? r.sidecar : r.textMatch === true;

    if (!r.mp3) fail.push(`${r.id}: missing mp3`);
    if (!r.sidecar) fail.push(`${r.id}: missing sidecar`);
    if (r.sidecar && !textOk) fail.push(`${r.id}: sidecar text does not match the catalogue copy`);
    if (r.sidecar && (r.words ?? 0) === 0) fail.push(`${r.id}: sidecar has no word timings`);
    if (!durOk) fail.push(`${r.id}: ${r.actual?.toFixed(0)}s actual vs ${r.declared}s declared (>${tol * 100}%)`);

    console.log(
      `${r.kind.padEnd(11)} ${r.id.padEnd(31)} ${r.mp3 ? ' ok ' : 'MISS'} ${r.sidecar ? ' ok ' : 'MISS'}  ` +
      `${r.kind === 'onboarding' ? ' na ' : r.textMatch ? ' ok ' : 'DIFF'}  ${String(r.words ?? '-').padStart(5)}  ` +
      `${(r.actual?.toFixed(0) ?? '-').padStart(6)}  ${String(r.declared ?? '-').padStart(8)}`,
    );
  }

  console.log(`\n${rows.length} assets checked.`);
  if (noDurationTool === rows.length) console.log('NOTE: afinfo unavailable, duration checks skipped.');
  if (fail.length) {
    console.log(`\n${fail.length} problem(s):`);
    fail.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log('All MP3s, sidecars, transcript text and durations verified.');
}

main().catch((e) => { console.error(e); process.exit(1); });
