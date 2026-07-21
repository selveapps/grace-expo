export type StoryMeta = {
  id: string;
  title: string;
  subtitle: string;
  hook: string;
  scriptureRange: string;
  testament: 'old' | 'new';
  books: string[];
  durationSeconds: number;
  coverTint: string;
  tags: string[];
  isPremium: boolean;
  parts: number;
  /** Optional hosted MP3 (supports `{part}` token). When set, skips TTS. */
  audioUrl?: string | null;
};

export const STORY_COLLECTIONS = [
  { id: 'women', name: 'Women of the Bible', tint: '#F1E6CF' },
  { id: 'courage', name: 'Courage', tint: '#E7EDE7' },
  { id: 'grief-hope', name: 'Grief & Hope', tint: '#E6EDF1' },
  { id: 'parables', name: "Jesus' Parables", tint: '#EFE3D3' },
  { id: 'wilderness', name: 'Wilderness Seasons', tint: '#F0E8DE' },
  { id: 'prayer', name: 'Prayer Stories', tint: '#EAE4D3' },
];

export const STORIES: StoryMeta[] = [
  { id: 'ruth-stays', title: 'Ruth stays', subtitle: 'Loyalty in the harvest', hook: 'She had every reason to leave. She stayed.', scriptureRange: 'Ruth 1–4', testament: 'old', books: ['Ruth'], durationSeconds: 540, coverTint: '#6B5D4E', tags: ['Women of the Bible', 'Loyalty'], isPremium: true, parts: 4 },
  { id: 'esther-uninvited', title: 'Esther walks in uninvited', subtitle: 'Courage in the palace', hook: 'For such a time as this.', scriptureRange: 'Esther 4–5', testament: 'old', books: ['Esther'], durationSeconds: 540, coverTint: '#5A4632', tags: ['Women of the Bible', 'Courage'], isPremium: true, parts: 4 },
  { id: 'davids-rooftop', title: "David's rooftop era", subtitle: 'A king, a mistake, a mercy', hook: 'Power looked away. Grace did not.', scriptureRange: '2 Samuel 11–12', testament: 'old', books: ['2 Samuel'], durationSeconds: 620, coverTint: '#4A382C', tags: ['Kings', 'Mercy'], isPremium: true, parts: 3 },
  { id: 'hannah-prayer', title: 'Hannah', subtitle: 'A prayer answered', hook: 'She prayed so hard they thought her drunk.', scriptureRange: '1 Samuel 1–2', testament: 'old', books: ['1 Samuel'], durationSeconds: 480, coverTint: '#6B5D4E', tags: ['Women of the Bible', 'Prayer'], isPremium: true, parts: 2 },
  { id: 'mary-annunciation', title: 'Mary', subtitle: 'The annunciation', hook: 'A teenager said yes to the impossible.', scriptureRange: 'Luke 1', testament: 'new', books: ['Luke'], durationSeconds: 500, coverTint: '#5A4632', tags: ['Women of the Bible', 'Faith'], isPremium: false, parts: 3, audioUrl: '/audio/mary-annunciation-part-{part}.mp3' },
];

export function getStory(id: string) {
  return STORIES.find((s) => s.id === id) ?? null;
}

export function resolveStoryAudioUrl(story: StoryMeta, part = 1): string | null {
  if (!story.audioUrl) return null;
  return story.audioUrl.replace('{part}', String(part));
}

export function storyForClient(story: StoryMeta) {
  return {
    ...story,
    hasAudio: true,
    audioUrl: resolveStoryAudioUrl(story, 1),
  };
}
