// TodayService — Today tab payload from Grace API with local fallback.
import { api } from '../api/client';
import { VerseService } from './VerseService';
import { StoryService } from './StoryService';
import { TeaService } from './TeaService';
import { ReadingService } from './ReadingService';

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

const settled = (p, fallback) => Promise.resolve(p).then((v) => v, () => fallback);

async function getTodayLocal(profile = {}) {
  // allSettled semantics on purpose. With Promise.all, one rejected sub-fetch
  // took the whole payload down, and Home then sat on "Preparing…" forever
  // because its listen and continue cards had nothing to render.
  const [saved, cont, prog] = await Promise.all([
    settled(ReadingService.getSavedVerses(), []),
    settled(StoryService.getContinue(), []),
    settled(ReadingService.getReadingProgress(), {}),
  ]);
  const [dailyVerse, featured] = await Promise.all([
    saved && saved[0] ? saved[0] : settled(VerseService.getDaily(), null),
    settled(StoryService.getFeatured(), null),
  ]);
  const last = prog && prog.__last;
  return {
    greeting: greetingFor(),
    name: profile.name || 'friend',
    dailyVerse,
    recommendedReading: last || { book: 'Psalms', chapter: 23 },
    recommendedStory: (cont && cont[0]) || featured,
    reflectionPrompt: 'Where might you need Grace today?',
    userIntention: (profile.carrying && profile.carrying[0]) || profile.reflectionWord || 'Trust',
    rhythm: profile.rhythm || 'morning',
  };
}

export const TodayService = {
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
    try {
      await StoryService.hydrateProgress();
      const { data } = await api.get('/today');
      return {
        greeting: greetingFor(),
        name: profile.name || data.name || 'friend',
        dailyVerse: data.dailyVerse,
        recommendedReading: data.recommendedReading,
        recommendedStory: data.recommendedStory,
        reflectionPrompt: data.reflectionPrompt || 'Where might you need Grace today?',
        userIntention: data.userIntention || 'Trust',
        rhythm: data.rhythm || profile.rhythm || 'morning',
      };
    } catch {
      return getTodayLocal(profile);
    }
  },
};
