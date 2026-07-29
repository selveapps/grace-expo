// TeaService — the daily sermon plus a 30-card archive from the Grace API.
// Falls back to a bundled copy of the same 30 so Tea works offline; the fallback
// is generated from backend/src/lib/teaCatalog.ts so the two cannot drift.
// Mirrors StoryService caching and persists like/save engagement to the server.
import { api } from '../api/client';
import { AuthService } from './AuthService';
import { StorageService, KEYS } from './StorageService';

const FALLBACK_TEAS = [
  { id: 'vashti-no', heat: 2, badge: "Today's tea", hook: 'Vashti said no to the king and kept her whole self.', tea: 'She got summoned to perform for a hall full of drunk men. She said no. The empire lost its mind and wrote it down forever. Sis had boundaries before boundaries had a name, and Scripture keeps her refusal on the record.', ref: 'Esther 1:12', book: 'Esther', chapter: 1, mood: 'dark', order: 1 },
  { id: 'ruth-field', heat: 1, badge: 'Plot twist', hook: 'Ruth rewrote her whole story in a barley field.', tea: 'Widowed, broke, and foreign. She showed up to work anyway, gleaning the leftovers at the edge of the field. A few chapters later she is in the family line of kings. Loyalty is a flex.', ref: 'Ruth 2:2', book: 'Ruth', chapter: 2, mood: 'light', order: 2 },
  { id: 'deborah-palm', heat: 2, badge: 'Receipts', hook: 'Deborah ran a nation from under a palm tree.', tea: 'Judge, prophet, and war strategist. Barak refused to go into battle without her, so she went. Then she called the shot on how it would end, and it ended exactly that way. Palm tree corner office energy.', ref: 'Judges 4:4', book: 'Judges', chapter: 4, mood: 'dark', order: 3 },
  { id: 'abigail-intercept', heat: 2, badge: 'Hot take', hook: 'Abigail stopped a war with snacks and a speech.', tea: 'Her husband insulted David, and David saddled up for revenge. Abigail rode out with food and truth, got in front of four hundred armed men, and talked a future king off the ledge. Diplomacy queen.', ref: '1 Samuel 25:18', book: '1 Samuel', chapter: 25, mood: 'light', order: 4 },
  { id: 'mary-yes', heat: 1, badge: "Today's tea", hook: 'A teenager said yes to the impossible and the world turned.', tea: 'Unmarried, unknown, and unbothered by the odds against her. An angel showed up with news that would cost her everything, and she said let it be. The most quietly radical yes in history.', ref: 'Luke 1:38', book: 'Luke', chapter: 1, mood: 'dark', order: 5 },
  { id: 'martha-mary', heat: 1, badge: 'Plot twist', hook: 'Mary ignored the whole room and chose the moment.', tea: 'The house was full, the kitchen was chaos, and everyone had opinions about where she should be. She sat down at his feet instead. He said she chose the better thing, and he did not take it back.', ref: 'Luke 10:42', book: 'Luke', chapter: 10, mood: 'light', order: 6 },
  { id: 'well-woman', heat: 3, badge: 'Wild', hook: 'The woman at the well came for water and left a preacher.', tea: 'Five marriages behind her and a noon walk to avoid the whispers. A stranger asked her for a drink and then told her her whole life. She dropped the jar and ran back to the town that had been talking about her.', ref: 'John 4:28', book: 'John', chapter: 4, mood: 'dark', order: 7 },
  { id: 'esther-uninvited', heat: 2, badge: 'Hot take', hook: 'Esther walked in uninvited and saved a nation.', tea: 'Approaching the king without a summons was a death sentence. She fasted three days, fixed her crown, and walked in anyway. If I perish, I perish. Then she threw the dinner party that flipped an empire.', ref: 'Esther 4:16', book: 'Esther', chapter: 4, mood: 'light', order: 8 },
  { id: 'hannah-prayer', heat: 1, badge: "Today's tea", hook: 'Hannah prayed so hard the priest thought she was drunk.', tea: 'Years of ache poured out in the temple with no sound, just moving lips. The priest told her to sober up. She told him the truth, and heaven heard the silent one.', ref: '1 Samuel 1:13', book: '1 Samuel', chapter: 1, mood: 'dark', order: 9 },
  { id: 'magdalene-first', heat: 2, badge: 'Receipts', hook: 'Mary Magdalene was the first to preach the resurrection.', tea: 'She stayed at the tomb crying after everyone else went home. So she was the first to see him alive, and the first one sent to go tell. The whole faith starts with a woman running with news.', ref: 'John 20:18', book: 'John', chapter: 20, mood: 'light', order: 10 },
  { id: 'rahab-rope', heat: 3, badge: 'Wild', hook: 'Rahab ran a safe house and negotiated her family out of a war.', tea: 'A working woman with a wall-side window and excellent instincts. She hid the spies, lied to the king, and cut a deal for everyone she loved. Then she made it into the genealogy of Jesus.', ref: 'Joshua 2:4', book: 'Joshua', chapter: 2, mood: 'dark', order: 11 },
  { id: 'jael-tent', heat: 3, badge: 'Wild', hook: 'Jael ended a war with a tent peg and a glass of milk.', tea: 'The enemy commander asked for shelter. She gave him milk, tucked him in, and handled it. Deborah put it in a song. Scripture does not soften it, and neither will I.', ref: 'Judges 4:21', book: 'Judges', chapter: 4, mood: 'dark', order: 12 },
  { id: 'tamar-veil', heat: 3, badge: 'Wild', hook: 'Tamar outmaneuvered a patriarch and got it in writing.', tea: 'Cheated out of her rights and left with nothing, she took the evidence before she took the risk. When he came for her life, she produced the receipts. He said she was more righteous than he was.', ref: 'Genesis 38:26', book: 'Genesis', chapter: 38, mood: 'light', order: 13 },
  { id: 'miriam-song', heat: 1, badge: 'Plot twist', hook: 'Miriam grabbed a tambourine at the edge of a dry sea.', tea: 'She had watched a baby brother float away in a basket and grown up under an empire. When the water split and closed, she led the whole nation in the first worship song on record.', ref: 'Exodus 15:20', book: 'Exodus', chapter: 15, mood: 'light', order: 14 },
  { id: 'shunammite', heat: 2, badge: 'Receipts', hook: 'The Shunammite woman refused to leave without an answer.', tea: 'Her son died on her lap, so she saddled a donkey and rode straight to the prophet. She grabbed his feet and would not let go until he came back with her. Faith can look like refusing to be managed.', ref: '2 Kings 4:30', book: '2 Kings', chapter: 4, mood: 'dark', order: 15 },
  { id: 'widow-oil', heat: 1, badge: "Today's tea", hook: 'A widow with one jar of oil out-earned her debt.', tea: 'Creditors were coming for her sons and all she had was a little oil. The prophet said borrow every empty vessel you can find. She poured until there was nothing left to pour into.', ref: '2 Kings 4:6', book: '2 Kings', chapter: 4, mood: 'light', order: 16 },
  { id: 'bleeding-woman', heat: 2, badge: 'Hot take', hook: 'She touched his coat in a crowd and stopped a whole procession.', tea: 'Twelve years of bleeding, every doctor paid, every option gone. She decided the hem of his robe was enough, reached through a crush of people, and got called daughter in front of everyone.', ref: 'Mark 5:34', book: 'Mark', chapter: 5, mood: 'dark', order: 17 },
  { id: 'canaanite-mother', heat: 3, badge: 'Wild', hook: 'A foreign mother argued with Jesus and won.', tea: 'He gave her a hard line about bread and dogs. She took the metaphor, turned it around, and asked for the crumbs. He called it great faith and healed her daughter on the spot.', ref: 'Matthew 15:28', book: 'Matthew', chapter: 15, mood: 'light', order: 18 },
  { id: 'anna-temple', heat: 1, badge: 'Plot twist', hook: 'Anna waited eighty years in the temple for one look.', tea: 'Widowed young, she stayed and prayed for decades. When a poor couple carried in a newborn, she recognized him immediately and started telling everyone who would listen. Patience is not passivity.', ref: 'Luke 2:38', book: 'Luke', chapter: 2, mood: 'dark', order: 19 },
  { id: 'lydia-house', heat: 2, badge: 'Receipts', hook: 'Lydia bankrolled the first church in Europe.', tea: 'A businesswoman in purple, the luxury goods trade of her day. She heard Paul by a river, got baptized with her whole household, and then told the apostles they were staying at her place. Not asked. Told.', ref: 'Acts 16:15', book: 'Acts', chapter: 16, mood: 'light', order: 20 },
  { id: 'priscilla-teach', heat: 2, badge: 'Hot take', hook: 'Priscilla corrected a famous preacher in private.', tea: 'Apollos was eloquent and half informed. Rather than embarrass him publicly, she and her husband took him aside and filled in what he was missing. Her name is usually listed first, which in that era says plenty.', ref: 'Acts 18:26', book: 'Acts', chapter: 18, mood: 'dark', order: 21 },
  { id: 'sarah-laugh', heat: 2, badge: 'Plot twist', hook: 'Sarah laughed at God and still got the promise.', tea: 'Ninety years old, eavesdropping on an impossible announcement from behind a tent flap. She laughed out loud. He asked why, she denied it, and the baby came anyway. She named him laughter.', ref: 'Genesis 18:12', book: 'Genesis', chapter: 18, mood: 'light', order: 22 },
  { id: 'hagar-seen', heat: 2, badge: "Today's tea", hook: 'Hagar named God herself, out loud, in the desert.', tea: 'Pregnant, used, and running with nothing. An angel found her at a spring in the middle of nowhere. She became the first person in Scripture to give God a name. You are the God who sees me.', ref: 'Genesis 16:13', book: 'Genesis', chapter: 16, mood: 'dark', order: 23 },
  { id: 'zelophehad', heat: 3, badge: 'Wild', hook: 'Five sisters sued for their inheritance and changed the law.', tea: 'Their father died with no sons, so under the rules they got nothing. They walked up to Moses and the whole assembly and said this is not right. God agreed with them and the law was rewritten.', ref: 'Numbers 27:7', book: 'Numbers', chapter: 27, mood: 'light', order: 24 },
  { id: 'huldah-scroll', heat: 2, badge: 'Receipts', hook: 'When a lost scroll turned up, the king sent for Huldah.', tea: 'They found the book of the law during renovations and nobody knew what it meant. The king had priests and scribes on payroll. He sent them to a prophetess, and her reading became national policy.', ref: '2 Kings 22:14', book: '2 Kings', chapter: 22, mood: 'dark', order: 25 },
  { id: 'widow-mite', heat: 1, badge: 'Plot twist', hook: 'She gave two coins and out-gave the entire treasury.', tea: 'Rich men were making a show of their offerings. A widow dropped in two small coins, everything she had. He told the disciples to watch her, because she gave more than all of them.', ref: 'Mark 12:44', book: 'Mark', chapter: 12, mood: 'light', order: 26 },
  { id: 'joanna-fund', heat: 2, badge: 'Hot take', hook: 'Wealthy women funded the entire ministry.', tea: 'Mary Magdalene, Joanna, Susanna, and others supported the work out of their own pockets. Luke names them on purpose. The most famous ministry in history ran on women money.', ref: 'Luke 8:3', book: 'Luke', chapter: 8, mood: 'dark', order: 27 },
  { id: 'dorcas-needle', heat: 1, badge: "Today's tea", hook: 'Dorcas sewed so much love that they refused to bury her.', tea: 'She made clothes for widows who had nobody. When she died the whole room filled with women holding the coats she had made and weeping. They sent for Peter, and she got up.', ref: 'Acts 9:39', book: 'Acts', chapter: 9, mood: 'light', order: 28 },
  { id: 'phoebe-letter', heat: 2, badge: 'Receipts', hook: 'Phoebe hand-carried the letter to Romans.', tea: 'Paul calls her a deacon and a benefactor, and asks the whole church to give her whatever she needs. The most theologically dense letter in the New Testament arrived in a woman travel bag.', ref: 'Romans 16:1', book: 'Romans', chapter: 16, mood: 'dark', order: 29 },
  { id: 'mary-perfume', heat: 3, badge: 'Wild', hook: 'She poured a year of wages on his feet and let them talk.', tea: 'The jar was worth about a year of work. She broke it open, poured it out, and wiped his feet with her hair while the room criticized the budget. He said leave her alone, she is preparing me for burial.', ref: 'John 12:7', book: 'John', chapter: 12, mood: 'light', order: 30 },
];

let catalogCache = null;
let todayCache = null;

function normalize(t) {
  return {
    ...t,
    likes: t.likes ?? 0,
    heat: t.heat ?? 1,
    durationSeconds: t.durationSeconds ?? 62,
    image: t.image ?? `/img/tea/${t.id}.jpg`,
    audioUrl: t.audioUrl ?? `/audio/tea-${t.id}.mp3`,
    hasAudio: true,
  };
}

async function loadCatalog() {
  if (catalogCache) return catalogCache;
  try {
    const { data } = await api.get('/tea', { auth: false });
    const tea = (data.tea || []).map(normalize);
    catalogCache = tea.length ? tea : FALLBACK_TEAS.map(normalize);
    await StorageService.set(KEYS.teaCatalog, catalogCache);
  } catch {
    // Prefer the last catalog we actually saw over the bundled copy.
    const cached = await StorageService.get(KEYS.teaCatalog, null);
    catalogCache = (cached && cached.length ? cached : FALLBACK_TEAS).map(normalize);
  }
  return catalogCache;
}

/** Same rule the server uses, so offline picks the same tea as online. */
function localTeaOfDay(all) {
  const day = Math.floor(Date.now() / 86400000);
  const ordered = [...all].sort((a, b) => a.order - b.order);
  return ordered[((day % ordered.length) + ordered.length) % ordered.length];
}

export const TeaService = {
  async getToday({ force = false } = {}) {
    if (todayCache && !force) return todayCache;
    try {
      const { data } = await api.get('/tea/today', { auth: false });
      todayCache = normalize(data.tea);
    } catch {
      todayCache = localTeaOfDay(await loadCatalog());
    }
    return todayCache;
  },
  async getAll() {
    return loadCatalog();
  },
  async refresh() {
    catalogCache = null;
    todayCache = null;
    const [today, all] = [await this.getToday({ force: true }), await this.getAll()];
    return { today, all };
  },
  async getOne(id) {
    try {
      const { data } = await api.get(`/tea/${encodeURIComponent(id)}`, { auth: false });
      return normalize(data);
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
    } catch { /* offline, local only */ }
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
    } catch { /* offline, local only */ }
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
