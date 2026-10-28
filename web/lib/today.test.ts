import { describe, expect, it } from 'vitest';
import { FALLBACK_VERSE, greeting, todayView } from './today';

describe('today', () => {
  it('greets by the hour and leaves the name off when it is blank', () => {
    expect(greeting(8, 'Mara')).toBe('Good morning, Mara');
    expect(greeting(14, '')).toBe('Good afternoon');
    expect(greeting(21, 'Mara')).toBe('Good evening, Mara');
  });

  it('keeps a passage on screen when the payload failed', () => {
    const view = todayView(null, 9, true);
    expect(view.loadError).toBe(true);
    expect(view.verseRef).toBe(FALLBACK_VERSE.ref);
    expect(view.verseText).toContain('shepherd');
    expect(view.greeting).toBe('Good morning');
  });

  it('uses the API verse when it arrived', () => {
    const view = todayView(
      {
        name: 'Mara',
        dailyVerse: { ref: 'John 1:1', text: 'In the beginning was the Word' },
        recommendedReading: { book: 'John', chapter: 1 },
        recommendedStory: { id: 'esther-uninvited', title: 'Esther' },
        userIntention: 'Hope',
      },
      8,
    );
    expect(view.loadError).toBe(false);
    expect(view.verseRef).toBe('John 1:1');
    expect(view.readingBook).toBe('John');
    expect(view.storyId).toBe('esther-uninvited');
    expect(view.intention).toBe('Hope');
  });
});
