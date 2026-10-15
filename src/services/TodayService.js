// TodayService — Today tab payload from Grace API with a bundled fallback.
//
// The fallback used to be "local" in name only: a failed /today kicked off
// another chain of /saved, /stories and bible-api calls. If those hung, Home
// stayed on "Preparing…" because the screen swallowed the rejection. The
// bundled payload is synchronous and always renderable, so a failed or empty
// load still has a verse and a story. `degraded` tells the screen to show a
// retry instead of pretending the live reading arrived.
import { api } from '../api/client';
import { StoryService } from './StoryService';
import { TeaService } from './TeaService';
import { StorageService, KEYS } from './StorageService';
import { PSALM_23 } from '../data/content';

// One in-flight payload, shared. Confirmation primes this while she is still
// reading the blessing, so tapping Enter Grace mounts a Home that already has
// its data instead of a tab that spins. Keyed by name so a profile change is
// not served a stale greeting.
const FRESH_MS = 60_000;
let cache = null; // { key, at, promise }

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function verseOf(v) {
  if (!v || typeof v !== 'object') return null;
  const text = typeof v.text === 'string' ? v.text.trim() : '';
  if (!text) return null;
  return { ref: v.ref == null ? '' : String(v.ref), text };
}

export function storyOf(s) {
  if (!s || typeof s !== 'object' || s.id == null) return null;
  if (typeof s.title !== 'string' || !s.title.trim()) return null;
  return s;
}

function bundledToday(profile = {}) {
  const story = StoryService.bundledCatalog().featured;
  return {
    greeting: greetingFor(),
    name: profile.name || 'friend',
    dailyVerse: {
      ref: 'Psalm 23:1-4',
      text: PSALM_23.slice(0, 4).map((v) => v.t).join(' '),
    },
    recommendedReading: { book: 'Psalms', chapter: 23 },
    recommendedStory: story,
    reflectionPrompt: 'Where might you need Grace today?',
    userIntention: (profile.carrying && profile.carrying[0]) || profile.reflectionWord || 'Trust',
    rhythm: profile.rhythm || 'morning',
    degraded: true,
  };
}

async function getTodayLocal(profile = {}, baseline) {
  // Storage only. Another network waterfall here is what left Home blank while
  // every request timed out in sequence.
  const base = baseline || bundledToday(profile);
  let kept = null;
  try {
    const saved = await StorageService.get(KEYS.savedVerses, []);
    kept = verseOf(Array.isArray(saved) ? saved[0] : null);
  } catch { /* storage unavailable — bundled verse still renders */ }
  const fromProfile = verseOf(profile.savedVerses && profile.savedVerses[0]);
  return {
    ...base,
    dailyVerse: kept || fromProfile || base.dailyVerse,
    degraded: true,
  };
}

export const TodayService = {
  /** Synchronous content Home can paint before any request settles. */
  bundled(profile = {}) {
    return bundledToday(profile);
  },

  async getToday(profile = {}, { force = false } = {}) {
    const key = profile.name || '';
    const fresh = cache && cache.key === key && Date.now() - cache.at < FRESH_MS;
    if (fresh && !force) return cache.promise;
    const promise = this.fetchToday(profile).catch((e) => {
      // A rejected promise must not stay in the cache or every later read fails.
      if (cache && cache.promise === promise) cache = null;
      throw e;
    });
    cache = { key, at: Date.now(), promise };
    return promise;
  },

  /** Drop the cached payload, e.g. after progress changes elsewhere. */
  invalidate() {
    cache = null;
  },

  /**
   * Warm everything the tab app reads on first paint, without blocking on it.
   * Called from Confirmation so the navigator remount that Enter Grace triggers
   * has nothing left to fetch.
   */
  prime(profile = {}) {
    this.getToday(profile).catch(() => {});
    StoryService.getFeatured().catch(() => {});
    StoryService.getCollections().catch(() => {});
    StoryService.getStories().catch(() => {});
    TeaService.getToday().catch(() => {});
    TeaService.getAll().catch(() => {});
  },

  async fetchToday(profile = {}) {
    const baseline = bundledToday(profile);
    try {
      // Progress sync must not sit in front of the payload. Home has its own
      // continue fetch, and a stuck /stories/progress used to delay the verse
      // until the reviewer had already called the screen blank.
      StoryService.hydrateProgress().catch(() => {});
      const { data } = await api.get('/today');
      const dailyVerse = verseOf(data?.dailyVerse);
      const recommendedStory = storyOf(data?.recommendedStory);
      const book = data?.recommendedReading?.book;
      return {
        greeting: greetingFor(),
        name: profile.name || (typeof data?.name === 'string' && data.name) || baseline.name,
        dailyVerse: dailyVerse || baseline.dailyVerse,
        recommendedReading: book
          ? { book: String(book), chapter: Number(data.recommendedReading.chapter) || 1 }
          : baseline.recommendedReading,
        recommendedStory: recommendedStory || baseline.recommendedStory,
        reflectionPrompt: (typeof data?.reflectionPrompt === 'string' && data.reflectionPrompt)
          || baseline.reflectionPrompt,
        userIntention: data?.userIntention || baseline.userIntention,
        rhythm: data?.rhythm || profile.rhythm || baseline.rhythm,
        // An empty 200 is the same stuck screen as a transport failure if we
        // render "…" and wait. Fill the holes and say so.
        degraded: !dailyVerse || !recommendedStory,
      };
    } catch {
      return getTodayLocal(profile, baseline);
    }
  },
};
