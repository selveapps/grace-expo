// ReadingService — Bible reading data layer. Verse text + search via Grace API.
import { BOOKS, BOOK_BY_NAME, BOOK_INTROS, chapterCount } from '../data/bookMeta';
import { getChapter as fetchChapter, getPassage, searchScripture } from '../api/bible';
import { api } from '../api/client';
import { StorageService, KEYS } from './StorageService';

export const ReadingService = {
  getTestaments() {
    return [
      { key: 'old', name: 'Old Testament', count: BOOKS.filter((b) => b.testament === 'old').length },
      { key: 'new', name: 'New Testament', count: BOOKS.filter((b) => b.testament === 'new').length },
    ];
  },

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

  async getChapter(book, chapter) {
    return fetchChapter(book, chapter);
  },

  chapterCount(book) { return chapterCount(book); },

  async search(query) {
    const q = String(query || '').trim();
    if (!q) return { ot: [], nt: [] };
    return searchScripture(q);
  },

  async getSavedVerses() {
    try {
      const res = await api.get('/saved');
      return res.data;
    } catch {
      return StorageService.get(KEYS.savedVerses, []);
    }
  },

  async saveVerse(v) {
    try {
      await api.post('/saved', { ref: v.ref, text: v.text });
    } catch { /* offline — local cache updated by profile */ }
    const list = await StorageService.get(KEYS.savedVerses, []);
    if (list.some((x) => x.ref === v.ref)) return list;
    const next = [v, ...list];
    await StorageService.set(KEYS.savedVerses, next);
    return next;
  },

  async unsaveVerse(ref) {
    try {
      await api.delete(`/saved/${encodeURIComponent(ref)}`);
    } catch { /* offline */ }
    const list = await StorageService.get(KEYS.savedVerses, []);
    const next = list.filter((x) => x.ref !== ref);
    await StorageService.set(KEYS.savedVerses, next);
    return next;
  },

  async getReadingProgress() {
    try {
      const res = await api.get('/progress');
      const rows = res.data || [];
      const prog = {};
      for (const r of rows) prog[r.book] = r;
      if (rows.length) prog.__last = rows[0];
      return prog;
    } catch {
      return StorageService.get(KEYS.readingProgress, {});
    }
  },

  async updateReadingProgress(book, chapter, verse = 1) {
    try {
      await api.put('/progress', { book, chapter, position: verse });
    } catch { /* offline */ }
    const prog = await StorageService.get(KEYS.readingProgress, {});
    prog[book] = { book, chapter, verse, updatedAt: Date.now() };
    prog.__last = { book, chapter, verse };
    await StorageService.set(KEYS.readingProgress, prog);
    return prog;
  },
};
