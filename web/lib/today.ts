export const FALLBACK_VERSE = {
  ref: 'Psalm 23:1',
  text: 'The Lord is my shepherd; I shall not want.',
};

export type TodayPayload = {
  name?: string;
  dailyVerse?: { ref?: string; text?: string };
  recommendedReading?: { book?: string; chapter?: number };
  recommendedStory?: { id?: string; title?: string };
  reflectionPrompt?: string;
  userIntention?: string;
  rhythm?: string;
};

export type TodayView = {
  greeting: string;
  verseRef: string;
  verseText: string;
  loadError: boolean;
  readingBook: string;
  readingChapter: number;
  storyId: string;
  storyTitle: string;
  intention: string;
  rhythm: string;
  prompt: string;
};

export function greeting(hour: number, name: string): string {
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const who = name.trim();
  return who ? `${hello}, ${who}` : hello;
}

export function todayView(payload: TodayPayload | null, hour: number, failed = false): TodayView {
  const verse = payload?.dailyVerse?.text ? payload.dailyVerse : FALLBACK_VERSE;
  return {
    greeting: greeting(hour, payload?.name ?? ''),
    verseRef: verse.ref || FALLBACK_VERSE.ref,
    verseText: verse.text || FALLBACK_VERSE.text,
    loadError: failed || !payload?.dailyVerse?.text,
    readingBook: payload?.recommendedReading?.book || 'Psalms',
    readingChapter: payload?.recommendedReading?.chapter || 23,
    storyId: payload?.recommendedStory?.id || 'ruth-stays',
    storyTitle: payload?.recommendedStory?.title || 'Ruth stays',
    intention: payload?.userIntention || 'Trust',
    rhythm: payload?.rhythm || 'morning',
    prompt: payload?.reflectionPrompt || 'Where might you need Grace today?',
  };
}
