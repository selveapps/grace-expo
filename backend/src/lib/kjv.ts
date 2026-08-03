/**
 * The complete KJV, bundled as a file rather than read from Postgres.
 *
 * Why this exists: every scripture route reads `bible_verse`, and that table is
 * seeded by a 1,189-request crawl of a public API that rate-limits. On staging
 * the table is empty, so `/bible/search` returned `{ot:[],nt:[]}` for every
 * query, `/bible/:book/:chapter` 404'd for every chapter, and the carry-verse
 * route fell through to its hardcoded Psalm 23:1. The reader only looked alive
 * because the *client* silently falls back to bible-api.com per chapter.
 *
 * The KJV is public domain, fixed, and 4MB. Treating it as data we ship removes
 * a runtime dependency on both the seed and the third-party API. The database
 * stays the primary source so a properly seeded deployment is unaffected; this
 * answers only when the query finds nothing.
 *
 * Shape: { "Genesis": [ ["verse 1", "verse 2", ...], ... ] } — verse numbers are
 * array indices, so the file carries no keys it does not need.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOK_NAMES, NT_BOOKS } from './bookMeta.js';
import { formatReference } from './passageRef.js';

type Bible = Record<string, string[][]>;

const DATA = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../data/kjv.full.json',
);

let cache: Bible | null = null;
let failed = false;

/** Parsed once on first use, then held. Absent file degrades to "no fallback". */
function load(): Bible | null {
  if (cache) return cache;
  if (failed) return null;
  try {
    cache = JSON.parse(readFileSync(DATA, 'utf8')) as Bible;
    return cache;
  } catch {
    failed = true;
    return null;
  }
}

export function kjvAvailable(): boolean {
  return load() !== null;
}

const NT = new Set(NT_BOOKS);
const testamentOf = (book: string): 'old' | 'new' => (NT.has(book) ? 'new' : 'old');

export function kjvChapter(book: string, chapter: number): { n: number; t: string }[] | null {
  const bible = load();
  const verses = bible?.[book]?.[chapter - 1];
  if (!verses?.length) return null;
  return verses.map((t, i) => ({ n: i + 1, t }));
}

export function kjvPassage(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
): string | null {
  const bible = load();
  const verses = bible?.[book]?.[chapter - 1];
  if (!verses?.length) return null;
  const slice = verses.slice(verseStart - 1, verseEnd);
  if (!slice.length) return null;
  return slice.join(' ');
}

export type SearchHit = { ref: string; text: string };

/**
 * Reference-shaped queries: "John 3:16", "psalm 23", "1 Cor 13:4-7".
 *
 * Search used to be text-only, so typing a reference (the single most obvious
 * thing to type into a Bible search box) matched nothing, because no verse
 * contains the string "John 3:16".
 */
const ABBREV: Record<string, string> = {
  gen: 'Genesis', ex: 'Exodus', exod: 'Exodus', lev: 'Leviticus', num: 'Numbers',
  deut: 'Deuteronomy', dt: 'Deuteronomy', josh: 'Joshua', judg: 'Judges',
  '1 sam': '1 Samuel', '2 sam': '2 Samuel', '1 kgs': '1 Kings', '2 kgs': '2 Kings',
  '1 chr': '1 Chronicles', '2 chr': '2 Chronicles', neh: 'Nehemiah', est: 'Esther',
  ps: 'Psalms', psalm: 'Psalms', psa: 'Psalms', prov: 'Proverbs', eccl: 'Ecclesiastes',
  song: 'Song of Solomon', sos: 'Song of Solomon', isa: 'Isaiah', jer: 'Jeremiah',
  lam: 'Lamentations', ezek: 'Ezekiel', dan: 'Daniel', hos: 'Hosea', obad: 'Obadiah',
  mic: 'Micah', nah: 'Nahum', hab: 'Habakkuk', zeph: 'Zephaniah', hag: 'Haggai',
  zech: 'Zechariah', mal: 'Malachi',
  matt: 'Matthew', mt: 'Matthew', mk: 'Mark', lk: 'Luke', jn: 'John',
  rom: 'Romans', '1 cor': '1 Corinthians', '2 cor': '2 Corinthians', gal: 'Galatians',
  eph: 'Ephesians', phil: 'Philippians', col: 'Colossians',
  '1 thess': '1 Thessalonians', '2 thess': '2 Thessalonians',
  '1 tim': '1 Timothy', '2 tim': '2 Timothy', tit: 'Titus', philem: 'Philemon',
  heb: 'Hebrews', jas: 'James', '1 pet': '1 Peter', '2 pet': '2 Peter',
  rev: 'Revelation',
};

const BY_LENGTH = [...BOOK_NAMES].sort((a, b) => b.length - a.length);

export type RefQuery = {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
};

export function parseReferenceQuery(query: string): RefQuery | null {
  const q = query.trim().replace(/\s+/g, ' ').replace(/\.$/, '');
  if (!q) return null;

  let book: string | null = null;
  let rest = '';

  const lower = q.toLowerCase();
  for (const name of BY_LENGTH) {
    if (lower.startsWith(name.toLowerCase())) {
      book = name;
      rest = q.slice(name.length).trim();
      break;
    }
  }

  if (!book) {
    // Longest abbreviation first, so "1 cor" is not shadowed by a shorter key.
    for (const abbrev of Object.keys(ABBREV).sort((a, b) => b.length - a.length)) {
      if (lower === abbrev || lower.startsWith(`${abbrev} `) || lower.startsWith(`${abbrev}.`)) {
        book = ABBREV[abbrev];
        rest = q.slice(abbrev.length).replace(/^\./, '').trim();
        break;
      }
    }
  }

  if (!book) return null;

  // Bare book name is a browse intent, not a search; let keyword search have it.
  if (!rest) return null;

  const m = rest.match(/^(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/);
  if (!m) return null;

  const chapter = Number(m[1]);
  if (!chapter) return null;
  if (!m[2]) return { book, chapter };

  const verseStart = Number(m[2]);
  const verseEnd = m[3] ? Number(m[3]) : verseStart;
  if (!verseStart || verseEnd < verseStart) return null;
  return { book, chapter, verseStart, verseEnd };
}

/** Verses for a parsed reference, as search hits. */
export function kjvRefHits(ref: RefQuery): SearchHit[] {
  const bible = load();
  const verses = bible?.[ref.book]?.[ref.chapter - 1];
  if (!verses?.length) return [];

  const start = ref.verseStart ?? 1;
  const end = ref.verseEnd ?? verses.length;
  const out: SearchHit[] = [];
  for (let n = start; n <= Math.min(end, verses.length); n++) {
    out.push({ ref: formatReference(ref.book, ref.chapter, n, n), text: verses[n - 1] });
  }
  return out;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Keyword search over the whole KJV.
 *
 * The old query was a single `contains`, so "peace hope" only matched verses
 * holding that exact adjacent phrase and multi-word searches looked broken.
 * Here every token must be present (AND), and whole-phrase matches are ranked
 * above scattered ones so the obvious hit comes first.
 */
export function kjvSearch(
  query: string,
  limit = 100,
): { ot: SearchHit[]; nt: SearchHit[]; total: number } {
  const bible = load();
  const q = query.trim().replace(/\s+/g, ' ');
  if (!bible || !q) return { ot: [], nt: [], total: 0 };

  const tokens = q.toLowerCase().split(' ').filter((t) => t.length > 1);
  if (!tokens.length) return { ot: [], nt: [], total: 0 };

  const phrase = new RegExp(escapeRe(q), 'i');
  const matchers = tokens.map((t) => new RegExp(`\\b${escapeRe(t)}`, 'i'));

  const scored: { hit: SearchHit; testament: 'old' | 'new'; score: number }[] = [];

  for (const book of BOOK_NAMES) {
    const chapters = bible[book];
    if (!chapters) continue;
    const testament = testamentOf(book);
    for (let ci = 0; ci < chapters.length; ci++) {
      const verses = chapters[ci];
      for (let vi = 0; vi < verses.length; vi++) {
        const text = verses[vi];
        if (!matchers.every((re) => re.test(text))) continue;
        scored.push({
          hit: { ref: formatReference(book, ci + 1, vi + 1, vi + 1), text },
          testament,
          // Only the whole-phrase match earns a boost. Everything else keeps
          // canonical order, which is what a concordance does and what the
          // database-backed path returned. Ranking single-word queries by verse
          // length instead made "peace" open with "Hold not thy peace, O God" —
          // technically the shortest match, and not what anyone was looking for.
          score: phrase.test(text) ? 1 : 0,
        });
      }
    }
  }

  const total = scored.length;
  // Books are walked in canonical order, so a stable sort leaves equally scored
  // hits in Genesis-to-Revelation order.
  scored.sort((a, b) => b.score - a.score);

  const otAll: SearchHit[] = [];
  const ntAll: SearchHit[] = [];
  for (const s of scored) (s.testament === 'new' ? ntAll : otAll).push(s.hit);

  // Split the cap between the testaments instead of taking the first N overall.
  // Canonical order means Genesis through Malachi fills the whole budget first,
  // so a search for "peace" showed 100 Old Testament verses and reported an
  // empty New Testament, which is simply wrong. Unused budget on one side goes
  // to the other, so a query that only hits one testament still gets all N.
  const half = Math.floor(limit / 2);
  const ntTake = Math.min(ntAll.length, Math.max(half, limit - otAll.length));
  const otTake = Math.min(otAll.length, limit - ntTake);

  return { ot: otAll.slice(0, otTake), nt: ntAll.slice(0, ntTake), total };
}
