export const THEME_BLURB: Record<string, string> = {
  Comfort: 'For the days when you need to be held more than you need to be fixed.',
  Anxiety: 'For the mind that will not stop running the same lap.',
  Grief: 'Scripture does not rush you. Neither do these.',
  Hope: 'For when you need to remember that this is not the end of the story.',
  Forgiveness: 'The hardest one. Both directions.',
  Courage: 'For the thing you already know you have to do.',
  Rest: 'Permission, straight from the source.',
  Gratitude: 'For finding the good that was already there.',
};

export const THEME_PASSAGES: Record<string, { ref: string; note: string }[]> = {
  Comfort: [
    { ref: 'Psalm 23:1-4', note: 'The valley is walked through, not around.' },
    { ref: 'Psalm 34:18', note: 'He is nearest at the worst point, not after it.' },
    { ref: 'Isaiah 41:10', note: 'Fear not, because of who is holding you.' },
    { ref: 'Matthew 5:4', note: 'Mourning is not a failure of faith.' },
    { ref: 'John 14:1-3', note: 'Said to frightened people the night before everything.' },
  ],
  Anxiety: [
    { ref: 'Philippians 4:6-7', note: 'A peace that outruns your ability to explain it.' },
    { ref: 'Matthew 6:25-27', note: 'Worry has never added a single hour to anything.' },
    { ref: 'Psalm 55:22', note: 'Cast it. You were not built to carry it.' },
    { ref: '1 Peter 5:6-7', note: 'He cares. That is the whole reason given.' },
  ],
  Grief: [
    { ref: 'John 11:33-35', note: 'He wept, knowing He was about to fix it.' },
    { ref: 'Psalm 30:5', note: 'Weeping gets the night. It does not get everything.' },
    { ref: 'Ecclesiastes 3:1-4', note: 'There is a time to mourn, and it is not wasted time.' },
    { ref: '1 Thessalonians 4:13-14', note: 'Grief, but not the kind without hope.' },
  ],
  Hope: [
    { ref: 'Isaiah 40:29-31', note: 'Strength arrives for the ones who have run out.' },
    { ref: 'Lamentations 3:22-26', note: 'New every morning, written from the ruins.' },
    { ref: 'Romans 15:13', note: 'Abounding, not rationed.' },
    { ref: 'Psalm 42:11', note: 'Talking to your own soul is biblical.' },
  ],
  Forgiveness: [
    { ref: 'Psalm 103:10-12', note: 'As far as the east is from the west. That distance never closes.' },
    { ref: '1 John 1:9', note: 'Faithful and just. Both words matter.' },
    { ref: 'Matthew 18:21-22', note: 'Peter offered seven. He was not close.' },
    { ref: 'Luke 23:34', note: 'Said from the cross, about the people who put Him there.' },
  ],
  Courage: [
    { ref: 'Joshua 1:9', note: 'A command, not a suggestion.' },
    { ref: 'Deuteronomy 31:6', note: 'He will not fail thee, nor forsake thee.' },
    { ref: 'Esther 4:14-16', note: 'For such a time as this, and then she went.' },
    { ref: '2 Timothy 1:7', note: 'Not the spirit of fear. Power, love, a sound mind.' },
  ],
  Rest: [
    { ref: 'Matthew 11:28-30', note: 'The invitation is specifically to the exhausted.' },
    { ref: 'Psalm 46:10', note: 'Be still is the instruction. Know is the result.' },
    { ref: 'Mark 6:31', note: 'He told them to come apart and rest. It is in the job description.' },
    { ref: 'Genesis 2:2-3', note: 'Rest was built into the week before anyone was tired.' },
  ],
  Gratitude: [
    { ref: 'Psalm 100:1-5', note: 'The whole psalm is one instruction: come in glad.' },
    { ref: '1 Thessalonians 5:16-18', note: 'In everything, which is not the same as for everything.' },
    { ref: 'Philippians 4:11-13', note: 'Contentment is learned. Paul says so outright.' },
    { ref: 'Psalm 136:1', note: 'His mercy endureth for ever, twenty-six times in one psalm.' },
  ],
};

export function themeNames(): string[] {
  return Object.keys(THEME_BLURB);
}
