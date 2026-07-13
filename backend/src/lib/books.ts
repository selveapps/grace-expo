import { BOOK_NAMES } from './bookMeta.js';

const BOOKS: string[] = [...BOOK_NAMES];

/** Longest match first so "1 Samuel" wins over "Samuel". */
const BOOKS_BY_LENGTH = [...BOOKS].sort((a, b) => b.length - a.length);

const ALIASES: Record<string, string> = {
  psalm: 'Psalms',
  psalms: 'Psalms',
  songofsolomon: 'Song of Solomon',
  'song of solomon': 'Song of Solomon',
};

export function normalizeBookSlug(slug: string): string | null {
  const raw = decodeURIComponent(slug).trim();
  const lower = raw.toLowerCase().replace(/\+/g, ' ');
  if (ALIASES[lower]) return ALIASES[lower];

  const direct = BOOKS.find((b) => b.toLowerCase() === lower);
  if (direct) return direct;

  const titled = lower.replace(/\b\w/g, (c) => c.toUpperCase());
  const titledMatch = BOOKS.find((b) => b.toLowerCase() === titled.toLowerCase());
  return titledMatch ?? null;
}

export function resolveBookFromRef(ref: string): { book: string; rest: string } | null {
  const trimmed = ref.trim().replace(/\s+/g, ' ');
  const lower = trimmed.toLowerCase();

  for (const book of BOOKS_BY_LENGTH) {
    const prefix = book.toLowerCase();
    if (lower.startsWith(prefix)) {
      const rest = trimmed.slice(book.length).trim();
      if (rest.match(/^\d+:/)) return { book, rest };
    }
  }

  for (const [alias, book] of Object.entries(ALIASES)) {
    if (lower.startsWith(alias)) {
      const rest = trimmed.slice(alias.length).trim();
      if (rest.match(/^\d+:/)) return { book, rest };
    }
  }

  return null;
}
