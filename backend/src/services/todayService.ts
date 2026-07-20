import * as auth from './authService.js';
import * as bible from './bibleService.js';
import * as library from './libraryService.js';
import { getStory, STORIES } from '../lib/storyCatalog.js';

const FALLBACK_VERSE = { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' };

export async function getTodayPayload(userId: string) {
  const user = await auth.getUserWithProfile(userId);
  const [saved, readingProgress, storyProgress] = await Promise.all([
    library.listSaved(userId),
    library.listProgress(userId),
    library.listStoryProgress(userId),
  ]);

  const dailyVerse = saved[0] ?? (await bible.getTodaysVerse()) ?? FALLBACK_VERSE;
  const recommendedReading = readingProgress[0] ?? { book: 'Psalms', chapter: 23, position: 0 };

  const inProgress = storyProgress.find((p) => p.seconds > 0 && !p.completed);
  let recommendedStory: Record<string, unknown> = STORIES[0];
  if (inProgress) {
    const story = getStory(inProgress.storyId);
    if (story) {
      recommendedStory = {
        ...story,
        progress: { seconds: inProgress.seconds, completed: inProgress.completed },
      };
    }
  }

  return {
    name: user?.name ?? '',
    dailyVerse,
    recommendedReading: {
      book: recommendedReading.book,
      chapter: recommendedReading.chapter,
    },
    recommendedStory,
    reflectionPrompt: 'Where might you need Grace today?',
    userIntention: user?.profile?.carrying?.[0] ?? 'Trust',
    rhythm: user?.profile?.rhythm ?? 'morning',
  };
}
