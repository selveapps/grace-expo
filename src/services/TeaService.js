// TeaService — the daily sermon plus a 30-card archive from the Grace API.
// Falls back to a bundled copy of the same 30 so Tea works offline; the fallback
// is generated from backend/src/lib/teaCatalog.ts so the two cannot drift.
// Mirrors StoryService caching and persists like/save engagement to the server.
import { AppState } from 'react-native';
import { api } from '../api/client';
import { AuthService } from './AuthService';
import { StorageService, KEYS } from './StorageService';
import { FALLBACK_TEAS } from './teaFallback.generated.js';

let catalogCache = null;
let todayCache = null;
/** Calendar-day key (YYYY-MM-DD in device tz) for todayCache invalidation. */
let todayCacheDay = null;

function deviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Same teaDayIndex policy as backend/src/lib/teaDayIndex.ts */
function teaDayIndex(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = Number(parts.find((p) => p.type === 'year').value);
  const m = Number(parts.find((p) => p.type === 'month').value);
  const d = Number(parts.find((p) => p.type === 'day').value);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function localCalendarDayKey(date = new Date(), timeZone = deviceTimeZone()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** First 4 words of the hook, only ever used if a card somehow ships untitled. */
function fallbackCardTitle(t) {
  const src = (t.hook || t.tea || '').replace(/["""'']/g, '').trim();
  if (!src) return 'Today’s tea';
  return src.split(/\s+/).slice(0, 4).join(' ').replace(/[.,;:!?]$/, '');
}

function normalize(t) {
  return {
    ...t,
    cardTitle: t.cardTitle || fallbackCardTitle(t),
    likes: t.likes ?? 0,
    heat: t.heat ?? 1,
    durationSeconds: t.durationSeconds ?? 62,
    image: t.image ?? `/img/tea/${t.id}.jpg`,
    audioUrl: t.audioUrl ?? `/audio/tea-${t.id}.mp3`,
    hasAudio: true,
  };
}

async function loadCatalog() {
  if (catalogCache) return catalogCache;
  try {
    const { data } = await api.get('/tea', { auth: false });
    const tea = (data.tea || []).map(normalize);
    catalogCache = tea.length ? tea : FALLBACK_TEAS.map(normalize);
    await StorageService.set(KEYS.teaCatalog, catalogCache);
  } catch {
    const cached = await StorageService.get(KEYS.teaCatalog, null);
    catalogCache = (cached && cached.length ? cached : FALLBACK_TEAS).map(normalize);
  }
  return catalogCache;
}

/** Offline tea-of-day: same calendar-day index as GET /tea/today?tz=… */
function localTeaOfDay(all, timeZone = deviceTimeZone()) {
  const day = teaDayIndex(new Date(), timeZone);
  const ordered = [...all].sort((a, b) => a.order - b.order);
  return ordered[((day % ordered.length) + ordered.length) % ordered.length];
}

function invalidateTodayIfDayChanged() {
  const key = localCalendarDayKey();
  if (todayCacheDay && todayCacheDay !== key) {
    todayCache = null;
  }
  todayCacheDay = key;
}

let appStateHooked = false;
function ensureAppStateRefresh() {
  if (appStateHooked) return;
  appStateHooked = true;
  AppState.addEventListener('change', (state) => {
    if (state !== 'active') return;
    invalidateTodayIfDayChanged();
    if (!todayCache) {
      TeaService.getToday({ force: true }).catch(() => {});
    }
  });
}

export const TeaService = {
  async getToday({ force = false } = {}) {
    ensureAppStateRefresh();
    invalidateTodayIfDayChanged();
    const dayKey = localCalendarDayKey();
    if (todayCache && todayCacheDay === dayKey && !force) return todayCache;
    const tz = deviceTimeZone();
    try {
      const { data } = await api.get(`/tea/today?tz=${encodeURIComponent(tz)}`, { auth: false });
      todayCache = normalize(data.tea);
      todayCacheDay = dayKey;
    } catch {
      todayCache = normalize(localTeaOfDay(await loadCatalog(), tz));
      todayCacheDay = dayKey;
    }
    return todayCache;
  },
  async getAll() {
    return loadCatalog();
  },
  async refresh() {
    catalogCache = null;
    todayCache = null;
    todayCacheDay = null;
    const [today, all] = [await this.getToday({ force: true }), await this.getAll()];
    return { today, all };
  },
  async getTranscript(id) {
    const cache = await StorageService.get(KEYS.transcripts, {});
    const key = `tea#${id}`;
    try {
      const { data } = await api.get(`/tea/${encodeURIComponent(id)}/transcript`, { auth: false });
      cache[key] = data;
      await StorageService.set(KEYS.transcripts, cache);
      return data;
    } catch {
      return cache[key] || null;
    }
  },
  async getOne(id) {
    try {
      const { data } = await api.get(`/tea/${encodeURIComponent(id)}`, { auth: false });
      return normalize(data);
    } catch {
      const local = (await loadCatalog()).find((t) => t.id === id);
      return local || null;
    }
  },
  async toggleLike(id) {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    const next = { ...(saved[id] || {}), liked: !saved[id]?.liked };
    saved[id] = next;
    await StorageService.set(KEYS.teaEngagement, saved);
    try {
      await AuthService.ensureGuest();
      await api.post(`/tea/${encodeURIComponent(id)}/like`);
    } catch { /* offline, local only */ }
    return next;
  },
  async save(id) {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    const next = { ...(saved[id] || {}), saved: !saved[id]?.saved };
    saved[id] = next;
    await StorageService.set(KEYS.teaEngagement, saved);
    try {
      await AuthService.ensureGuest();
      await api.post(`/tea/${encodeURIComponent(id)}/save`);
    } catch { /* offline, local only */ }
    return next;
  },
  async getEngagement(id) {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    return saved[id] || { liked: false, saved: false };
  },
  async getSaved() {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    const all = await loadCatalog();
    return all.filter((t) => saved[t.id]?.saved);
  },
};
