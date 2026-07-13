import { resolveBookFromRef } from './books.js';

export type ParsedRef = {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
};

export function parsePassageRef(ref: string): ParsedRef | null {
  const resolved = resolveBookFromRef(ref);
  if (!resolved) return null;

  const match = resolved.rest.match(/^(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) return null;

  const chapter = Number(match[1]);
  const verseStart = Number(match[2]);
  const verseEnd = match[3] ? Number(match[3]) : verseStart;

  if (!chapter || !verseStart || verseEnd < verseStart) return null;
  return { book: resolved.book, chapter, verseStart, verseEnd };
}

export function formatReference(book: string, chapter: number, verseStart: number, verseEnd: number): string {
  const bookLabel = book === 'Psalms' ? 'Psalm' : book;
  if (verseStart === verseEnd) return `${bookLabel} ${chapter}:${verseStart}`;
  return `${bookLabel} ${chapter}:${verseStart}-${verseEnd}`;
}
