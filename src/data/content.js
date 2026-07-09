// Static content used across the app. In production this comes from an API / bundled Bible text.

export const CARRY_OPTIONS = ['Peace', 'Worry', 'Gratitude', 'Grief', 'Direction', 'Rest', 'Forgiveness', 'Hope'];

export const REFLECTION_WORDS = ['Peace', 'Trust', 'Stillness', 'Courage', 'Mercy'];

export const RHYTHM_OPTIONS = [
  { key: 'morning', label: 'Morning' },
  { key: 'evening', label: 'Evening' },
  { key: 'both', label: 'Both' },
  { key: 'later', label: "I'll choose later" },
];

export const COLLECTIONS = [
  'Women of the Bible', 'Courage', 'Grief & Hope', "Jesus' Parables",
  'Wilderness Seasons', 'Prayer Stories',
];

export const STORIES_CONTINUE = [
  { title: 'Esther', sub: 'For such a time as this · 3 of 5' },
  { title: 'Mary', sub: 'The annunciation · 1 of 3' },
  { title: 'Hannah', sub: 'A prayer answered · not started' },
];

export const THEMES = ['Comfort', 'Anxiety', 'Grief', 'Hope', 'Forgiveness', 'Courage', 'Rest', 'Gratitude'];

export const OT_GROUPS = [
  { group: 'Law', books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'] },
  { group: 'Historical', books: ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'] },
  { group: 'Wisdom & Poetry', books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'] },
  { group: 'Major Prophets', books: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'] },
  { group: 'Minor Prophets', books: ['Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'] },
];

export const NT_GROUPS = [
  { group: 'Gospels', books: ['Matthew', 'Mark', 'Luke', 'John'] },
  { group: 'Church History', books: ['Acts'] },
  { group: "Paul's Letters", books: ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'] },
  { group: 'General Letters', books: ['Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'] },
  { group: 'Prophecy', books: ['Revelation'] },
];

export const PSALM_23 = [
  { n: 1, t: 'The Lord is my shepherd; I shall not want.' },
  { n: 2, t: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
  { n: 3, t: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\u2019s sake.' },
  { n: 4, t: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
  { n: 5, t: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
  { n: 6, t: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.' },
];

export const SAVED_VERSES = [
  { ref: 'Psalm 23:1', t: 'The Lord is my shepherd; I shall not want.' },
  { ref: 'Ruth 1:16', t: 'Whither thou goest, I will go.' },
  { ref: 'Isaiah 40:31', t: 'They that wait upon the Lord shall renew their strength.' },
  { ref: 'Philippians 4:13', t: 'I can do all things through Christ which strengtheneth me.' },
];
