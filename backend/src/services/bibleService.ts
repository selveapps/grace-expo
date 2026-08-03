import { prisma } from '../db.js';
import { normalizeBookSlug } from '../lib/books.js';
import { formatReference, parsePassageRef } from '../lib/passageRef.js';
import {
  carryVerseRef,
  dailyVerseRef,
  FALLBACK_REF,
} from '../lib/scriptureMeta.js';
import { kjvChapter, kjvPassage, kjvSearch, kjvRefHits, parseReferenceQuery } from '../lib/kjv.js';
import { NT_BOOKS } from '../lib/bookMeta.js';

/**
 * Every read below is "database first, bundled KJV second".
 *
 * The database stays authoritative so a seeded deployment behaves exactly as
 * before. The fallback answers when a query returns nothing, which is what an
 * unseeded environment looks like: before this, that state was indistinguishable
 * from "this chapter does not exist" and the whole Reading tab degraded silently.
 *
 * A database *error* falls back too. Scripture is fixed public-domain text we
 * already ship, so there is no reason for Reading to go down with Postgres.
 */
async function fromDb<T>(query: () => Promise<T>, empty: T): Promise<T> {
  try {
    return await query();
  } catch {
    return empty;
  }
}

export async function getChapter(bookSlug: string, chapter: number) {
  const book = normalizeBookSlug(bookSlug);
  if (!book || !Number.isInteger(chapter) || chapter < 1) return null;

  const verses = await fromDb(() => prisma.bibleVerse.findMany({
    where: { book, chapter },
    orderBy: { verse: 'asc' },
  }), []);

  const reference = book === 'Psalms' ? `Psalm ${chapter}` : `${book} ${chapter}`;
  if (verses.length) {
    return { reference, verses: verses.map((v) => ({ n: v.verse, t: v.text })) };
  }

  const fallback = kjvChapter(book, chapter);
  return fallback ? { reference, verses: fallback } : null;
}

export async function getPassage(ref: string) {
  const parsed = parsePassageRef(ref);
  if (!parsed) return null;

  const rows = await fromDb(() => prisma.bibleVerse.findMany({
    where: {
      book: parsed.book,
      chapter: parsed.chapter,
      verse: { gte: parsed.verseStart, lte: parsed.verseEnd },
    },
    orderBy: { verse: 'asc' },
  }), []);
  const outRef = formatReference(parsed.book, parsed.chapter, parsed.verseStart, parsed.verseEnd);
  if (rows.length) {
    return { ref: outRef, text: rows.map((r) => r.text.trim()).join(' ') };
  }

  const text = kjvPassage(parsed.book, parsed.chapter, parsed.verseStart, parsed.verseEnd);
  return text ? { ref: outRef, text } : null;
}

export async function getTodaysVerse(now = Date.now()) {
  const ref = dailyVerseRef(now);
  const passage = await getPassage(ref);
  if (passage) return passage;
  return getPassage(FALLBACK_REF);
}

export async function getVerseForCarrying(tags: string[]) {
  const ref = carryVerseRef(tags);
  const passage = await getPassage(ref);
  if (passage) return passage;
  return getPassage(FALLBACK_REF);
}

export type SearchHit = { ref: string; text: string };

const SEARCH_LIMIT = 100;

export async function searchScripture(
  query: string,
): Promise<{ ot: SearchHit[]; nt: SearchHit[]; total: number }> {
  const q = query.trim();
  if (!q) return { ot: [], nt: [], total: 0 };

  // "John 3:16" is the most obvious thing to type into a Bible search box, and
  // it used to match nothing at all: no verse contains its own reference as
  // text. Resolve reference-shaped queries to the passage itself first.
  const ref = parseReferenceQuery(q);
  if (ref) {
    const hits = kjvRefHits(ref);
    if (hits.length) {
      const isNt = NT_BOOKS.includes(ref.book);
      return {
        ot: isNt ? [] : hits.slice(0, SEARCH_LIMIT),
        nt: isNt ? hits.slice(0, SEARCH_LIMIT) : [],
        total: hits.length,
      };
    }
  }

  const rows = await fromDb(() => prisma.bibleVerse.findMany({
    where: { text: { contains: q, mode: 'insensitive' } },
    orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
    take: SEARCH_LIMIT,
  }), []);

  if (!rows.length) return kjvSearch(q, SEARCH_LIMIT);

  const ot: SearchHit[] = [];
  const nt: SearchHit[] = [];

  for (const r of rows) {
    const hit = { ref: formatReference(r.book, r.chapter, r.verse, r.verse), text: r.text.trim() };
    if (r.testament === 'new') nt.push(hit);
    else ot.push(hit);
  }

  return { ot, nt, total: ot.length + nt.length };
}
