import { prisma } from '../db.js';
import { normalizeBookSlug } from '../lib/books.js';
import { formatReference, parsePassageRef } from '../lib/passageRef.js';
import {
  carryVerseRef,
  dailyVerseRef,
  FALLBACK_REF,
} from '../lib/scriptureMeta.js';

export async function getChapter(bookSlug: string, chapter: number) {
  const book = normalizeBookSlug(bookSlug);
  if (!book || !Number.isInteger(chapter) || chapter < 1) return null;

  const verses = await prisma.bibleVerse.findMany({
    where: { book, chapter },
    orderBy: { verse: 'asc' },
  });
  if (!verses.length) return null;

  const reference = book === 'Psalms' ? `Psalm ${chapter}` : `${book} ${chapter}`;
  return {
    reference,
    verses: verses.map((v) => ({ n: v.verse, t: v.text })),
  };
}

export async function getPassage(ref: string) {
  const parsed = parsePassageRef(ref);
  if (!parsed) return null;

  const rows = await prisma.bibleVerse.findMany({
    where: {
      book: parsed.book,
      chapter: parsed.chapter,
      verse: { gte: parsed.verseStart, lte: parsed.verseEnd },
    },
    orderBy: { verse: 'asc' },
  });
  if (!rows.length) return null;

  const outRef = formatReference(parsed.book, parsed.chapter, parsed.verseStart, parsed.verseEnd);
  const text = rows.map((r) => r.text.trim()).join(' ');
  return { ref: outRef, text };
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
