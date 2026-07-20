#!/usr/bin/env tsx
/**
 * Fetch KJV chapters from bible-api.com and write normalized JSON.
 * Usage:
 *   npm run seed:prepare              # sample chapters (fast, for E2E)
 *   npm run seed:prepare -- --full    # entire canon (~20-40 min)
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHAPTER_COUNTS,
  OT_BOOKS,
  NT_BOOKS,
  SAMPLE_CHAPTERS,
  testamentFor,
} from './bookMeta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../data/kjv.normalized.json');
const BASE = 'https://bible-api.com';
const DELAY_MS = 120;

export type NormalizedVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: 'old' | 'new';
};

const q = (s: string) => String(s).toLowerCase().trim().replace(/\s+/g, '+');

async function fetchChapter(book: string, chapter: number): Promise<NormalizedVerse[]> {
  const url = `${BASE}/${q(book)}+${chapter}?translation=kjv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`bible-api ${res.status} for ${book} ${chapter}`);
  const data = await res.json() as { verses: { verse: number; text: string }[] };
  const testament = testamentFor(book);
  return data.verses.map((v) => ({
    book,
    chapter,
    verse: v.verse,
    text: v.text.trim(),
    testament,
  }));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function allChapters() {
  const out: { book: string; chapter: number }[] = [];
  for (const book of [...OT_BOOKS, ...NT_BOOKS]) {
    const n = CHAPTER_COUNTS[book] ?? 1;
    for (let c = 1; c <= n; c++) out.push({ book, chapter: c });
  }
  return out;
}

async function main() {
  const full = process.argv.includes('--full');
  const targets = full ? allChapters() : SAMPLE_CHAPTERS;
  const verses: NormalizedVerse[] = [];

  console.log(`Fetching ${targets.length} chapter(s) from bible-api.com…`);
  for (let i = 0; i < targets.length; i++) {
    const { book, chapter } = targets[i];
    process.stdout.write(`  [${i + 1}/${targets.length}] ${book} ${chapter}\n`);
    const rows = await fetchChapter(book, chapter);
    verses.push(...rows);
    if (i < targets.length - 1) await sleep(DELAY_MS);
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(verses, null, 2));
  console.log(`Wrote ${verses.length} verses → ${OUT}`);

  const ps23 = verses.filter((v) => v.book === 'Psalms' && v.chapter === 23);
  if (ps23.length !== 6) {
    console.error(`FAIL: Psalms 23 expected 6 verses, got ${ps23.length}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
