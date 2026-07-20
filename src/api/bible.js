// Scripture data layer — Grace API first, bible-api.com fallback, AsyncStorage cache offline.
import { PSALM_23 } from '../data/content';
import { StorageService } from '../services/StorageService';
import { api } from './client';

const PUBLIC_BASE = 'https://bible-api.com';
const TIMEOUT = 8000;

const q = (s) => String(s).toLowerCase().trim().replace(/\s+/g, '+');
const slug = (book) => String(book).toLowerCase().trim().replace(/\s+/g, '-');

async function getPublic(path) {
  const url = `${PUBLIC_BASE}/${path}?translation=kjv`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('bible-api ' + res.status);
      return await res.json();
    } catch (e) {
      clearTimeout(timer);
      if (attempt === 1) throw e;
    }
  }
}

async function getPrivate(path) {
  try {
    const res = await api.get(path, { auth: false });
    return res.data;
  } catch {
    return null;
  }
}

export async function getChapter(book, chapter) {
  const cacheKey = `bible.${q(book)}.${chapter}`;
  const data = await getPrivate(`/bible/${slug(book)}/${chapter}`);
  if (data?.verses?.length) {
    const out = { reference: data.reference, verses: data.verses, online: true };
    StorageService.set(cacheKey, out.verses);
    return out;
  }

  try {
    const pub = await getPublic(`${q(book)}+${chapter}`);
    const out = {
      reference: pub.reference,
      verses: pub.verses.map((v) => ({ n: v.verse, t: v.text.trim() })),
      online: true,
    };
    StorageService.set(cacheKey, out.verses);
    return out;
  } catch {
    const cached = await StorageService.get(cacheKey, null);
    if (cached) return { reference: `${book} ${chapter}`, verses: cached, online: false };
    if (String(book).toLowerCase() === 'psalms' && Number(chapter) === 23) {
      return { reference: 'Psalm 23', verses: PSALM_23, online: false };
    }
    return { reference: `${book} ${chapter}`, verses: null, online: false, error: true };
  }
}

export async function getPassage(ref) {
  const cacheKey = `bible.p.${q(ref)}`;
  const data = await getPrivate(`/bible/passage?ref=${encodeURIComponent(ref)}`);
  if (data?.text) {
    const out = { ref: data.ref, text: data.text, online: true };
    StorageService.set(cacheKey, out);
    return out;
  }

  try {
    const pub = await getPublic(q(ref));
    const out = { ref: pub.reference, text: pub.text.trim().replace(/\s+/g, ' '), online: true };
    StorageService.set(cacheKey, out);
    return out;
  } catch {
    const cached = await StorageService.get(cacheKey, null);
    if (cached) return { ...cached, online: false };
    return { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.', online: false };
  }
}

export async function verseForCarrying(carrying = []) {
  const tags = carrying.filter(Boolean).join(',');
  const data = await getPrivate(`/verse/for-carrying?tags=${encodeURIComponent(tags)}`);
  if (data?.text) return { ref: data.ref, text: data.text, online: true };
  const key = carrying.find((c) => c) || null;
  const CARRY = {
    Peace: 'John 14:27', Worry: 'Philippians 4:6-7', Gratitude: 'Psalm 100:4', Grief: 'Psalm 34:18',
    Direction: 'Proverbs 3:5-6', Rest: 'Matthew 11:28', Forgiveness: 'Colossians 3:13', Hope: 'Romans 15:13',
  };
  return getPassage(key && CARRY[key] ? CARRY[key] : 'Psalm 23:1');
}

export async function todaysVerse() {
  const data = await getPrivate('/today/verse');
  if (data?.text) return { ref: data.ref, text: data.text, online: true };
  const DAILY = ['Psalm 23:1', 'Isaiah 40:31', 'Philippians 4:13', 'Psalm 46:10', 'Lamentations 3:22-23', 'Proverbs 3:5-6', 'John 1:5'];
  const day = Math.floor(Date.now() / 86400000);
  return getPassage(DAILY[day % DAILY.length]);
}

export async function searchScripture(query) {
  try {
    const res = await api.get(`/bible/search?q=${encodeURIComponent(query)}`, { auth: false });
    return res.data;
  } catch {
    return { ot: [], nt: [] };
  }
}
