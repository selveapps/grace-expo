/** Canonical KJV book names. Same order as backend/src/lib/bookMeta.ts. */
export const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
  '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
  '3 John', 'Jude', 'Revelation',
] as const;

const OT_COUNT = 39;
export const OT_BOOKS = BOOK_NAMES.slice(0, OT_COUNT);
export const NT_BOOKS = BOOK_NAMES.slice(OT_COUNT);

export function bookToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Protestant canon chapter counts, Genesis through Revelation. Sum is 1,189. */
export const CHAPTER_COUNTS = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13,
  10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3,
  3, 3, 2, 14, 4,
  28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1,
  13, 5, 5, 3, 5, 1, 1, 1, 22,
] as const;

export function chapterCount(book: string): number {
  const index = BOOK_NAMES.findIndex((name) => name === book);
  return index === -1 ? 0 : CHAPTER_COUNTS[index];
}

export function slugToBook(slug: string): string | null {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    return null;
  }
  const normalized = decoded.trim().toLowerCase().replace(/-/g, ' ');
  return BOOK_NAMES.find((book) => book.toLowerCase() === normalized) ?? null;
}

export function chapterHref(book: string, chapter: number): string {
  return `/reading/${bookToSlug(book)}/${chapter}`;
}
