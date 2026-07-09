// ReadingService — the Bible reading data layer.
// Structure (books/groups/counts) is bundled (data/bookMeta); verse TEXT is fetched
// live from api/bible.js. Progress + saved verses persist via StorageService.
// Every method returns the shape the real backend will return, so screens don't change
// when a server is introduced.

import { BOOKS, BOOK_BY_NAME, BOOK_INTROS, chapterCount } from '../data/bookMeta';
import { getChapter as fetchChapter, getPassage } from '../api/bible';
import { StorageService, KEYS } from './StorageService';

export const ReadingService = {
  getTestaments() {
    return [
      { key: 'old', name: 'Old Testament', count: BOOKS.filter((b) => b.testament === 'old').length },
      { key: 'new', name: 'New Testament', count: BOOKS.filter((b) => b.testament === 'new').length },
    ];
  },

  // Grouped books for a testament: [{ group, books: [BibleBook] }]
  getBooks(testament) {
    const inT = BOOKS.filter((b) => b.testament === testament);
    const order = [];
    const byGroup = {};
    for (const b of inT) {
      if (!byGroup[b.group]) { byGroup[b.group] = []; order.push(b.group); }
      byGroup[b.group].push(b);
    }
    return order.map((group) => ({ group, books: byGroup[group] }));
  },

  getBook(name) {
    const b = BOOK_BY_NAME[name];
    if (!b) return null;
    return { ...b, intro: BOOK_INTROS[name] || null };
  },

  // Live chapter text → { reference, verses:[{n,t}], online }
  async getChapter(book, chapter) {
    return fetchChapter(book, chapter);
  },

  chapterCount(book) { return chapterCount(book); },

  // Naive client-side search across the live API for a few common books, grouped by testament.
  // The real backend replaces this with a proper full-text index (see BACKEND.md /bible/search).
  async search(query) {
    const q = String(query || '').trim();
    if (!q) return { ot: [], nt: [] };
    try {
      const hit = await getPassage(q); // if the query is itself a reference, resolve it
      if (hit && hit.online) {
        const b = BOOK_BY_NAME[hit.ref.replace(/\s*\d+:.*$/, '').trim()];
        const bucket = b && b.testament === 'new' ? 'nt' : 'ot';
        return { ot: bucket === 'ot' ? [hit] : [], nt: bucket === 'nt' ? [hit] : [] };
      }
    } catch {}
    return { ot: [], nt: [] };
  },

  async getSavedVerses() { return StorageService.get(KEYS.savedVerses, []); },
  async saveVerse(v) {
    const list = await StorageService.get(KEYS.savedVerses, []);
    if (list.some((x) => x.ref === v.ref)) return list;
    const next = [v, ...list];
    await StorageService.set(KEYS.savedVerses, next);
    return next;
  },
  async unsaveVerse(ref) {
    const list = await StorageService.get(KEYS.savedVerses, []);
    const next = list.filter((x) => x.ref !== ref);
    await StorageService.set(KEYS.savedVerses, next);
    return next;
  },

  async getReadingProgress() { return StorageService.get(KEYS.readingProgress, {}); },
  async updateReadingProgress(book, chapter, verse = 1) {
    const prog = await StorageService.get(KEYS.readingProgress, {});
    prog[book] = { book, chapter, verse, updatedAt: Date.now() };
    prog.__last = { book, chapter, verse };
    await StorageService.set(KEYS.readingProgress, prog);
    return prog;
  },
};
