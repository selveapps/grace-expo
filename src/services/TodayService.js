// TodayService — Today tab payload from Grace API with local fallback.
import { api } from '../api/client';
import { VerseService } from './VerseService';
import { StoryService } from './StoryService';
import { ReadingService } from './ReadingService';

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

async function getTodayLocal(profile = {}) {
  const [saved, cont, prog] = await Promise.all([
    ReadingService.getSavedVerses(),
    StoryService.getContinue(),
    ReadingService.getReadingProgress(),
  ]);
  const dailyVerse = saved && saved[0] ? saved[0] : await VerseService.getDaily();
  const last = prog && prog.__last;
  return {
    greeting: greetingFor(),
    name: profile.name || 'friend',
    dailyVerse,
    recommendedReading: last || { book: 'Psalms', chapter: 23 },
    recommendedStory: cont && cont[0] ? cont[0] : await StoryService.getFeatured(),
    reflectionPrompt: 'Where might you need Grace today?',
    userIntention: (profile.carrying && profile.carrying[0]) || profile.reflectionWord || 'Trust',
    rhythm: profile.rhythm || 'morning',
  };
}

export const TodayService = {
  async getToday(profile = {}) {
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
