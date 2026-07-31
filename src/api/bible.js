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
    // Last resort, fully offline. Still a passage rather than one clause, so an
    // offline first run does not hand her the single most generic line there is.
    return {
      ref: 'Psalm 23:1-4',
      text: PSALM_23.slice(0, 4).map((v) => v.t).join(' '),
      online: false,
    };
  }
}

// Mirror of backend/src/lib/scriptureMeta.ts — keep the two in sync.
//
// Passages rather than single lines, and every choice on both onboarding
// screens is covered. Previously the reflection words (Courage, Trust,
// Stillness, Mercy) were absent, so choosing Courage silently fell through to
// Psalm 23:1 and the "chosen for you" verse was the most generic one there is.
const CARRY_VERSE = {
  Peace: 'John 14:25-27',
  Worry: 'Matthew 6:25-27',
  Gratitude: 'Psalm 100:1-5',
  Grief: 'Psalm 34:17-19',
  Direction: 'Proverbs 3:5-8',
  Rest: 'Matthew 11:28-30',
  Forgiveness: 'Colossians 3:12-14',
  Hope: 'Isaiah 40:29-31',
  Trust: 'Psalm 62:5-8',
  Stillness: 'Psalm 46:1-3',
  Courage: 'Psalm 27:1-3',
  Mercy: 'Lamentations 3:22-26',
};
const FALLBACK_REF = 'Psalm 23:1-4';

/**
 * The server hands back a hardcoded "Psalm 23:1" whenever it cannot resolve a
 * passage from its own verse table, which happens for any reference the KJV
 * seed did not cover. That is indistinguishable from a real answer, so a woman
 * who chose Courage silently got the most generic verse in the Bible again.
 *
 * If we asked for a specific tag and got the generic single verse back, we
 * resolve the mapped passage ourselves instead of trusting it.
 */
const GENERIC_FALLBACK = /^psalm\s*23:1$/i;

export async function verseForCarrying(carrying = []) {
  const tags = carrying.filter(Boolean).join(',');
  // Match on the first tag we actually have a passage for, rather than only
  // ever looking at carrying[0].
  const key = carrying.find((c) => CARRY_VERSE[c]);
  const data = await getPrivate(`/verse/for-carrying?tags=${encodeURIComponent(tags)}`);

  const serverGaveGeneric = data?.ref && GENERIC_FALLBACK.test(String(data.ref).trim());
  if (data?.text && !(serverGaveGeneric && key)) {
    return { ref: data.ref, text: data.text, online: true };
  }
  return getPassage(key ? CARRY_VERSE[key] : FALLBACK_REF);
}

export async function todaysVerse() {
  const data = await getPrivate('/today/verse');
  if (data?.text) return { ref: data.ref, text: data.text, online: true };
  const DAILY = [
    'Psalm 23:1-4', 'Isaiah 40:29-31', 'Philippians 4:11-13', 'Psalm 46:1-3',
    'Lamentations 3:22-26', 'Proverbs 3:5-8', 'John 1:1-5',
  ];
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
