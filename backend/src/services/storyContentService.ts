import { getStory } from '../lib/storyCatalog.js';
import * as auth from './authService.js';
import { generateStoryNarrative, type UserContext } from './llmService.js';
import { synthesizeSpeech } from './ttsService.js';

const narrativeCache = new Map<string, { content: string; cachedAt: number }>();
const audioCache = new Map<string, { buffer: Buffer; cachedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

async function loadUserContext(userId: string): Promise<UserContext> {
  const user = await auth.getUserWithProfile(userId);
  if (!user) return {};
  return {
    name: user.name,
    carrying: user.profile?.carrying ?? [],
    gentleness: user.profile?.gentleness,
    rhythm: user.profile?.rhythm,
  };
}

export async function getStoryNarrative(userId: string, storyId: string, part = 1) {
  const story = getStory(storyId);
  if (!story) return null;
  if (part > story.parts) throw new Error(`part must be 1–${story.parts}`);

  const cacheKey = `${userId}:${storyId}:${part}`;
  const cached = narrativeCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { story, content: cached.content, cached: true };
  }

  const ctx = await loadUserContext(userId);
  const content = await generateStoryNarrative(story, ctx, part);
  narrativeCache.set(cacheKey, { content, cachedAt: Date.now() });
  return { story, content, cached: false };
}

export async function getStoryAudioMp3(userId: string, storyId: string, part = 1) {
  const cacheKey = `${userId}:${storyId}:${part}`;
  const cached = audioCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.buffer;
  }

  const narrative = await getStoryNarrative(userId, storyId, part);
  if (!narrative) return null;

  const buffer = await synthesizeSpeech(narrative.content);
  audioCache.set(cacheKey, { buffer, cachedAt: Date.now() });
  return buffer;
}
