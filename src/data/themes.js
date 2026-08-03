// Browse by theme.
//
// The Reading tab has always shown these eight chips, but they were decorative:
// the only thing tapping one did was fire a haptic. This is the content behind
// them.
//
// Every entry is a real KJV passage chosen because it is *about* the theme, not
// because it contains the word. `note` is the reason it is on the list, in the
// app's voice, and is the thing that makes a list of references feel like it was
// put together by a person.
//
// References are verified against the bundled KJV by
// `backend/test/themePassages.unit.test.ts`; a typo fails the build rather than
// shipping a chip that opens an empty screen.

export const THEME_BLURB = {
  Comfort: 'For the days when you need to be held more than you need to be fixed.',
  Anxiety: 'For the mind that will not stop running the same lap.',
  Grief: 'Scripture does not rush you. Neither do these.',
  Hope: 'For when you need to remember that this is not the end of the story.',
  Forgiveness: 'The hardest one. Both directions.',
  Courage: 'For the thing you already know you have to do.',
  Rest: 'Permission, straight from the source.',
  Gratitude: 'For finding the good that was already there.',
};

export const THEME_PASSAGES = {
  Comfort: [
    { ref: 'Psalm 23:1-4', note: 'The valley is walked through, not around.' },
    { ref: 'Psalm 34:18', note: 'He is nearest at the worst point, not after it.' },
    { ref: 'Psalm 147:3', note: 'Healing and binding up, in that order.' },
    { ref: 'Isaiah 41:10', note: 'Fear not, because of who is holding you.' },
    { ref: 'Matthew 5:4', note: 'Mourning is not a failure of faith.' },
    { ref: 'John 14:1-3', note: 'Said to frightened people the night before everything.' },
    { ref: '2 Corinthians 1:3-4', note: 'Comfort received becomes comfort you can give.' },
    { ref: 'Revelation 21:4', note: 'The promise that every tear is accounted for.' },
  ],

  Anxiety: [
    { ref: 'Philippians 4:6-7', note: 'A peace that outruns your ability to explain it.' },
    { ref: 'Matthew 6:25-27', note: 'Worry has never added a single hour to anything.' },
    { ref: 'Psalm 55:22', note: 'Cast it. You were not built to carry it.' },
    { ref: 'Psalm 94:19', note: 'For when the thoughts multiply.' },
    { ref: 'Isaiah 26:3', note: 'Perfect peace is tied to where the mind is fixed.' },
    { ref: 'John 14:27', note: 'Not the kind of peace the world hands out.' },
    { ref: 'Proverbs 12:25', note: 'A good word makes it lighter. Say it to someone.' },
    { ref: '1 Peter 5:6-7', note: 'He cares. That is the whole reason given.' },
  ],

  Grief: [
    { ref: 'Psalm 34:17-19', note: 'Many are the afflictions. The verse does not pretend otherwise.' },
    { ref: 'John 11:33-35', note: 'He wept, knowing He was about to fix it.' },
    { ref: 'Psalm 30:5', note: 'Weeping gets the night. It does not get everything.' },
    { ref: 'Lamentations 3:31-33', note: 'He does not afflict willingly.' },
    { ref: 'Ecclesiastes 3:1-4', note: 'There is a time to mourn, and it is not wasted time.' },
    { ref: 'Isaiah 61:1-3', note: 'Beauty for ashes. An exchange, not a cover-up.' },
    { ref: 'Psalm 116:15', note: 'Precious. Not overlooked.' },
    { ref: '1 Thessalonians 4:13-14', note: 'Grief, but not the kind without hope.' },
  ],

  Hope: [
    { ref: 'Isaiah 40:29-31', note: 'Strength arrives for the ones who have run out.' },
    { ref: 'Lamentations 3:22-26', note: 'New every morning, written from the ruins.' },
    { ref: 'Jeremiah 29:11', note: 'Said to people in exile, not people who were comfortable.' },
    { ref: 'Romans 5:3-5', note: 'The whole chain: tribulation to patience to hope.' },
    { ref: 'Romans 15:13', note: 'Abounding, not rationed.' },
    { ref: 'Hebrews 11:1', note: 'The definition itself.' },
    { ref: 'Psalm 42:11', note: 'Talking to your own soul is biblical.' },
    { ref: '1 Peter 1:3', note: 'A hope that is alive, present tense.' },
  ],

  Forgiveness: [
    { ref: 'Psalm 103:10-12', note: 'As far as the east is from the west. That distance never closes.' },
    { ref: '1 John 1:9', note: 'Faithful and just. Both words matter.' },
    { ref: 'Colossians 3:12-14', note: 'Forgive as you were forgiven, which sets the bar.' },
    { ref: 'Matthew 6:14-15', note: 'The uncomfortable half of the Lord’s Prayer.' },
    { ref: 'Matthew 18:21-22', note: 'Peter offered seven. He was not close.' },
    { ref: 'Ephesians 4:31-32', note: 'Put away the bitterness first, then be kind.' },
    { ref: 'Micah 7:18-19', note: 'He delights in mercy. Delights.' },
    { ref: 'Luke 23:34', note: 'Said from the cross, about the people who put Him there.' },
  ],

  Courage: [
    { ref: 'Psalm 27:1-3', note: 'Whom shall I fear is a question, and it has no answer.' },
    { ref: 'Joshua 1:9', note: 'A command, not a suggestion.' },
    { ref: 'Deuteronomy 31:6', note: 'He will not fail thee, nor forsake thee.' },
    { ref: 'Isaiah 41:13', note: 'He holds your right hand. Picture it.' },
    { ref: '2 Timothy 1:7', note: 'Not the spirit of fear. Power, love, a sound mind.' },
    { ref: 'Esther 4:14-16', note: 'For such a time as this, and then she went.' },
    { ref: 'Psalm 31:24', note: 'Courage is something you let happen to your heart.' },
    { ref: '1 Corinthians 16:13', note: 'Stand fast. Be strong. Four short orders.' },
  ],

  Rest: [
    { ref: 'Matthew 11:28-30', note: 'The invitation is specifically to the exhausted.' },
    { ref: 'Psalm 46:10', note: 'Be still is the instruction. Know is the result.' },
    { ref: 'Exodus 33:14', note: 'My presence shall go with thee, and I will give thee rest.' },
    { ref: 'Mark 6:31', note: 'He told them to come apart and rest. It is in the job description.' },
    { ref: 'Psalm 62:5-8', note: 'Wait only upon God, and pour out your heart while you do.' },
    { ref: 'Psalm 4:8', note: 'Lie down and sleep. Safety is the reason given.' },
    { ref: 'Genesis 2:2-3', note: 'Rest was built into the week before anyone was tired.' },
    { ref: 'Hebrews 4:9-11', note: 'There remaineth a rest.' },
  ],

  Gratitude: [
    { ref: 'Psalm 100:1-5', note: 'The whole psalm is one instruction: come in glad.' },
    { ref: 'Psalm 103:1-5', note: 'Forget not all his benefits. A list worth rereading.' },
    { ref: '1 Thessalonians 5:16-18', note: 'In everything, which is not the same as for everything.' },
    { ref: 'Colossians 3:15-17', note: 'Be ye thankful, said three different ways.' },
    { ref: 'Philippians 4:11-13', note: 'Contentment is learned. Paul says so outright.' },
    { ref: 'James 1:17', note: 'Every good gift, from someone who does not change.' },
    { ref: 'Psalm 136:1', note: 'His mercy endureth for ever, twenty-six times in one psalm.' },
    { ref: '1 Chronicles 16:34', note: 'The oldest chorus in the book.' },
  ],
};
