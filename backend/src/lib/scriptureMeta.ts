/** Mirrors src/api/bible.js — keep in sync when onboarding tags change. */

// Passages, not single lines.
//
// Two problems with what this used to be. Every entry was one verse, so the
// verse card she was given read as a fragment rather than something to sit
// with. And the table only covered the eight "carrying" options, while the
// reflection words (Courage, Trust, Stillness, Mercy) fell through to
// Psalm 23:1 — so a woman who chose Courage was handed the most generic verse
// in the Bible and told it was picked for her.
//
// Every choice on both screens now maps to a 2 to 4 verse passage that actually
// speaks to it. Kept deliberately short of 5 verses so the hero verse card does
// not overflow on a small phone.
export const CARRY_VERSE: Record<string, string> = {
  // Carrying options (CARRY_OPTIONS in src/data/content.js)
  Peace: 'John 14:25-27',
  Worry: 'Matthew 6:25-27',
  Gratitude: 'Psalm 100:1-5',
  Grief: 'Psalm 34:17-19',
  Direction: 'Proverbs 3:5-8',
  Rest: 'Matthew 11:28-30',
  Forgiveness: 'Colossians 3:12-14',
  Hope: 'Isaiah 40:29-31',
  // Reflection words (REFLECTION_WORDS in src/data/content.js). These were
  // missing entirely, which is what sent Courage to the fallback.
  Trust: 'Psalm 62:5-8',
  Stillness: 'Psalm 46:1-3',
  Courage: 'Psalm 27:1-3',
  Mercy: 'Lamentations 3:22-26',
};

export const DAILY_VERSE_REFS = [
  'Psalm 23:1-4',
  'Isaiah 40:29-31',
  'Philippians 4:11-13',
  'Psalm 46:1-3',
  'Lamentations 3:22-26',
  'Proverbs 3:5-8',
  'John 1:1-5',
];

/** Still Psalm 23, but the passage rather than the opening clause. */
export const FALLBACK_REF = 'Psalm 23:1-4';

export function utcDayIndex(now = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

export function dailyVerseRef(now = Date.now()): string {
  const day = utcDayIndex(now);
  return DAILY_VERSE_REFS[day % DAILY_VERSE_REFS.length];
}

export function carryVerseRef(tags: string[]): string {
  const key = tags.find((t) => CARRY_VERSE[t]);
  return key ? CARRY_VERSE[key] : FALLBACK_REF;
}
