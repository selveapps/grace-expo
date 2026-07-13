/** Mirrors src/api/bible.js — keep in sync when onboarding tags change. */
export const CARRY_VERSE: Record<string, string> = {
  Peace: 'John 14:27',
  Worry: 'Philippians 4:6-7',
  Gratitude: 'Psalm 100:4',
  Grief: 'Psalm 34:18',
  Direction: 'Proverbs 3:5-6',
  Rest: 'Matthew 11:28',
  Forgiveness: 'Colossians 3:13',
  Hope: 'Romans 15:13',
};

export const DAILY_VERSE_REFS = [
  'Psalm 23:1',
  'Isaiah 40:31',
  'Philippians 4:13',
  'Psalm 46:10',
  'Lamentations 3:22-23',
  'Proverbs 3:5-6',
  'John 1:5',
];

export const FALLBACK_REF = 'Psalm 23:1';

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
