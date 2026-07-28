// Tea — short, sassy-but-reverent Bible takes worth sharing. 10 placeholder cards.
// Copy is a draft; product/theology review before ship.
export type Tea = {
  id: string;
  hook: string; // shareable serif line
  tea: string; // 2–3 sentence punchy body
  badge: string; // 'Today's tea' | 'Plot twist' | 'Hot take' | 'Receipts'
  ref: string;
  book: string;
  chapter: number;
  mood: 'dark' | 'light';
  likes: number;
  order: number;
  audioUrl?: string | null; // filled once narration is rendered
  voice?: string | null; // optional per-card ElevenLabs voice override
};

/** Default template: pre-rendered static MP3 per tea, served by /audio/:filename. */
const TEA_AUDIO_URL = '/audio/{teaId}.mp3';

export const TEAS: Tea[] = [
  { id: 'tea-01', hook: 'Vashti said no to the king — and kept her whole self.', tea: 'Summoned to perform at the afterparty, she declined. The empire lost it. Boundaries before boundaries were a thing.', badge: "Today's tea", ref: 'Esther 1:12', book: 'Esther', chapter: 1, mood: 'dark', likes: 0, order: 1 },
  { id: 'tea-02', hook: 'Ruth rewrote her whole story in a barley field.', tea: 'Widowed, broke, foreign — she showed up to work anyway. Chapters later she is in the lineage of kings. Loyalty is a flex.', badge: 'Plot twist', ref: 'Ruth 2:2', book: 'Ruth', chapter: 2, mood: 'light', likes: 0, order: 2 },
  { id: 'tea-03', hook: 'Deborah ran the nation from under a palm tree.', tea: 'Judge, prophet, war strategist. Barak would not go to battle without her. Corner-office energy, ancient edition.', badge: 'Receipts', ref: 'Judges 4:4', book: 'Judges', chapter: 4, mood: 'dark', likes: 0, order: 3 },
  { id: 'tea-04', hook: 'Abigail stopped a war with snacks and a speech.', tea: 'Her husband insulted David; David rode out for revenge. She met him with food and truth and talked a king off the ledge.', badge: 'Hot take', ref: '1 Samuel 25:18', book: '1 Samuel', chapter: 25, mood: 'light', likes: 0, order: 4 },
  { id: 'tea-05', hook: 'A teenager said yes to the impossible.', tea: 'Unmarried, unknown, unbothered by the odds. "Let it be." The most quietly radical yes in history.', badge: "Today's tea", ref: 'Luke 1:38', book: 'Luke', chapter: 1, mood: 'dark', likes: 0, order: 5 },
  { id: 'tea-06', hook: 'Mary of Bethany ignored the room and chose the moment.', tea: 'Everyone said help in the kitchen. She sat at his feet instead. He said she chose the better thing.', badge: 'Plot twist', ref: 'Luke 10:42', book: 'Luke', chapter: 10, mood: 'light', likes: 0, order: 6 },
  { id: 'tea-07', hook: 'The woman at the well came for water and left a preacher.', tea: 'Five marriages and a noon-day walk to avoid the whispers. One conversation later she is running back to tell the whole town.', badge: 'Receipts', ref: 'John 4:28', book: 'John', chapter: 4, mood: 'dark', likes: 0, order: 7 },
  { id: 'tea-08', hook: 'Esther walked in uninvited — and saved a nation.', tea: 'One wrong move meant death. She fixed her crown, held her nerve, and said, "If I perish, I perish."', badge: 'Hot take', ref: 'Esther 4:16', book: 'Esther', chapter: 4, mood: 'light', likes: 0, order: 8 },
  { id: 'tea-09', hook: 'Hannah prayed so hard they thought she was drunk.', tea: 'Years of ache poured out in the temple, no words, just moving lips. Heaven heard the silent ones.', badge: "Today's tea", ref: '1 Samuel 1:13', book: '1 Samuel', chapter: 1, mood: 'dark', likes: 0, order: 9 },
  { id: 'tea-10', hook: 'Mary Magdalene was the first to preach the resurrection.', tea: 'She stayed at the tomb when everyone left. So she was the first to see him — and the first sent to tell.', badge: 'Plot twist', ref: 'John 20:18', book: 'John', chapter: 20, mood: 'light', likes: 0, order: 10 },
];

export function getTea(id: string) {
  return TEAS.find((t) => t.id === id) ?? null;
}

export function resolveTeaAudioUrl(tea: Tea): string | null {
  const url = tea.audioUrl ?? TEA_AUDIO_URL;
  return url.replace('{teaId}', tea.id);
}

export function teaForClient(tea: Tea) {
  const audioUrl = resolveTeaAudioUrl(tea);
  return { ...tea, hasAudio: Boolean(audioUrl), audioUrl };
}
