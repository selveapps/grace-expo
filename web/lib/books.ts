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

export function slugToBook(slug: string): string | null {
  const normalized = decodeURIComponent(slug).trim().toLowerCase().replace(/-/g, ' ');
  return BOOK_NAMES.find((book) => book.toLowerCase() === normalized) ?? null;
}

export function chapterHref(book: string, chapter: number): string {
  return `/reading/${bookToSlug(book)}/${chapter}`;
}
