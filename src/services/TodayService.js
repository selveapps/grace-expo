// TodayService — assembles the daily Today payload from the other services.
// One call the Today screen can consume; the backend later returns the same shape.
import { VerseService } from './VerseService';
import { StoryService } from './StoryService';
import { ReadingService } from './ReadingService';

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const TodayService = {
  async getToday(profile = {}) {
    const [saved, cont, prog] = await Promise.all([
      ReadingService.getSavedVerses(),
      StoryService.getContinue(),
      ReadingService.getReadingProgress(),
    ]);
    // Prefer the verse kept in onboarding; else today's live verse.
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
  },
};
