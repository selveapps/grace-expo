// StoryService — catalog + LLM narratives from Grace API; progress syncs to server.
import { api, LLM_REQUEST_OPTS } from '../api/client';
import { StorageService, KEYS } from './StorageService';

const FALLBACK_STORIES = [
  { id: 'ruth-stays', title: 'Ruth stays', subtitle: 'Loyalty in the harvest', hook: 'She had every reason to leave. She stayed.', scriptureRange: 'Ruth 1–4', testament: 'old', books: ['Ruth'], durationSeconds: 540, audioUrl: null, coverTint: '#6B5D4E', tags: ['Women of the Bible', 'Loyalty'], isPremium: true, parts: 4 },
  { id: 'esther-uninvited', title: 'Esther walks in uninvited', subtitle: 'Courage in the palace', hook: 'For such a time as this.', scriptureRange: 'Esther 4–5', testament: 'old', books: ['Esther'], durationSeconds: 540, audioUrl: null, coverTint: '#5A4632', tags: ['Women of the Bible', 'Courage'], isPremium: true, parts: 4 },
  { id: 'davids-rooftop', title: "David's rooftop era", subtitle: 'A king, a mistake, a mercy', hook: 'Power looked away. Grace did not.', scriptureRange: '2 Samuel 11–12', testament: 'old', books: ['2 Samuel'], durationSeconds: 620, audioUrl: null, coverTint: '#4A382C', tags: ['Kings', 'Mercy'], isPremium: true, parts: 3 },
  { id: 'hannah-prayer', title: 'Hannah', subtitle: 'A prayer answered', hook: 'She prayed so hard they thought her drunk.', scriptureRange: '1 Samuel 1–2', testament: 'old', books: ['1 Samuel'], durationSeconds: 480, audioUrl: null, coverTint: '#6B5D4E', tags: ['Women of the Bible', 'Prayer'], isPremium: true, parts: 2 },
  { id: 'mary-annunciation', title: 'Mary', subtitle: 'The annunciation', hook: 'A teenager said yes to the impossible.', scriptureRange: 'Luke 1', testament: 'new', books: ['Luke'], durationSeconds: 500, audioUrl: null, coverTint: '#5A4632', tags: ['Women of the Bible', 'Faith'], isPremium: false, parts: 3 },
];

const FALLBACK_COLLECTIONS = [
  { id: 'women', name: 'Women of the Bible', tint: '#F1E6CF' },
  { id: 'courage', name: 'Courage', tint: '#E7EDE7' },
  { id: 'grief-hope', name: 'Grief & Hope', tint: '#E6EDF1' },
  { id: 'parables', name: "Jesus' Parables", tint: '#EFE3D3' },
  { id: 'wilderness', name: 'Wilderness Seasons', tint: '#F0E8DE' },
  { id: 'prayer', name: 'Prayer Stories', tint: '#EAE4D3' },
];

let catalogCache = null;
let progressHydrated = false;

async function loadCatalog() {
  if (catalogCache) return catalogCache;
  try {
    const { data } = await api.get('/stories');
    catalogCache = {
      featured: data.featured,
      collections: data.collections,
      stories: data.stories,
    };
    return catalogCache;
  } catch {
    catalogCache = {
      featured: FALLBACK_STORIES[0],
      collections: FALLBACK_COLLECTIONS,
      stories: FALLBACK_STORIES,
    };
    return catalogCache;
  }
}

async function hydrateProgressFromServer() {
  if (progressHydrated) return;
  try {
    const { data } = await api.get('/stories/progress');
    const local = await StorageService.get(KEYS.storyProgress, {});
    for (const row of data || []) {
      const prev = local[row.storyId];
      if (!prev || (row.updatedAt && row.updatedAt > (prev.updatedAt || 0))) {
        local[row.storyId] = {
          seconds: row.seconds,
          completed: row.completed,
          updatedAt: Date.now(),
        };
      }
    }
    await StorageService.set(KEYS.storyProgress, local);
  } catch {
    // offline — local cache only
  } finally {
    progressHydrated = true;
  }
}

function estimateDurationFromText(text, fallback) {
  if (!text) return fallback;
  const words = text.trim().split(/\s+/).length;
  return Math.max(120, Math.round(words / 2.5));
}

export const StoryService = {
  async hydrateProgress() {
    await hydrateProgressFromServer();
  },

  async getFeatured() {
    await hydrateProgressFromServer();
    const c = await loadCatalog();
    return c.featured;
  },
  async getCollections() {
    const c = await loadCatalog();
    return c.collections;
  },
  async getStories(collectionName) {
    const c = await loadCatalog();
    if (!collectionName) return c.stories;
    return c.stories.filter((s) => s.tags.includes(collectionName));
  },
  async getStory(id) {
    try {
      const { data } = await api.get(`/stories/${id}`);
      return data;
    } catch {
      return FALLBACK_STORIES.find((s) => s.id === id) || null;
    }
  },
  async getNarrative(id, part = 1) {
    const { data } = await api.post(`/ai/stories/${id}/narrative`, { part }, LLM_REQUEST_OPTS);
    return data;
  },
  estimateDurationFromText,
  async getContinue() {
    await hydrateProgressFromServer();
    const prog = await StorageService.get(KEYS.storyProgress, {});
    const stories = (await loadCatalog()).stories;
    return stories
      .filter((s) => prog[s.id] && prog[s.id].seconds > 0)
      .map((s) => ({ ...s, progress: prog[s.id] }));
  },
  async getProgress(id) {
    await hydrateProgressFromServer();
    const prog = await StorageService.get(KEYS.storyProgress, {});
    return prog[id] || { seconds: 0, completed: false };
  },
  async saveProgress(id, seconds, completed = false) {
    const prog = await StorageService.get(KEYS.storyProgress, {});
    prog[id] = { seconds, completed, updatedAt: Date.now() };
    await StorageService.set(KEYS.storyProgress, prog);
    api.put(`/stories/progress/${encodeURIComponent(id)}`, { seconds, completed }).catch(() => {});
    return prog[id];
  },
};
