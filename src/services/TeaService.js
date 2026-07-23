// TeaService — sassy-but-reverent Bible takes from the Grace API. Falls back to
// the 10 built-in placeholders offline. Mirrors StoryService caching + persists
// like/save engagement to the server.
import { api } from '../api/client';
import { AuthService } from './AuthService';
import { StorageService, KEYS } from './StorageService';

const FALLBACK_TEAS = [
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

let catalogCache = null;

function withAudio(t) {
  return { ...t, audioUrl: t.audioUrl ?? `/audio/${t.id}.mp3`, hasAudio: true };
}

async function loadCatalog() {
  if (catalogCache) return catalogCache;
  try {
    const { data } = await api.get('/tea', { auth: false });
    catalogCache = (data.tea || []).map(withAudio);
  } catch {
    catalogCache = FALLBACK_TEAS.map(withAudio);
  }
  return catalogCache;
}

export const TeaService = {
  async getAll() {
    return loadCatalog();
  },
  async getOne(id) {
    try {
      const { data } = await api.get(`/tea/${encodeURIComponent(id)}`, { auth: false });
      return withAudio(data);
    } catch {
      const local = (await loadCatalog()).find((t) => t.id === id);
      return local || null;
    }
  },
  async toggleLike(id) {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    const next = { ...(saved[id] || {}), liked: !saved[id]?.liked };
    saved[id] = next;
    await StorageService.set(KEYS.teaEngagement, saved);
    try {
      await AuthService.ensureGuest();
      await api.post(`/tea/${encodeURIComponent(id)}/like`);
    } catch { /* offline — local only */ }
    return next;
  },
  async save(id) {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    const next = { ...(saved[id] || {}), saved: !saved[id]?.saved };
    saved[id] = next;
    await StorageService.set(KEYS.teaEngagement, saved);
    try {
      await AuthService.ensureGuest();
      await api.post(`/tea/${encodeURIComponent(id)}/save`);
    } catch { /* offline — local only */ }
    return next;
  },
  async getEngagement(id) {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    return saved[id] || { liked: false, saved: false };
  },
  async getSaved() {
    const saved = await StorageService.get(KEYS.teaEngagement, {});
    const all = await loadCatalog();
    return all.filter((t) => saved[t.id]?.saved);
  },
};
