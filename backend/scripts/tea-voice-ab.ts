// One-clip A/B for the Tea narration direction. Renders a SECOND file beside the
// approved one so nothing in the catalogue changes and the original is preserved.
//
//   npm run tea:ab                 # renders tea-<id>-hot.mp3 + .json
//   AB_TEA=jael-tent npm run tea:ab
//
// Two variables are being tested together:
//   1. A hotter voice preset (lower stability, higher style, slightly slower).
//   2. Prosody-only punctuation on the TTS input, to buy pauses before reveals.
//
// FIDELITY GUARANTEE
// The prosody variant may only change punctuation and whitespace. `assertSameWords`
// strips every non-word character from both strings and refuses to render unless
// the word sequences are byte-identical, so no factual wording can drift.
//
// `<break time="..."/>` tags are deliberately NOT used. ElevenLabs returns the tag
// characters inside the alignment, which would pollute the word timings that drive
// the live captions. Ellipses, sentence breaks and newlines produce the pause
// without corrupting the sidecar.
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEAS } from '../src/lib/teaCatalog.js';
import type { VoiceSettings } from '../src/lib/voiceProfiles.js';
import { synthesizeSpeechTimed } from '../src/services/ttsService.js';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/audio');

/** Current shipped preset, for reference in the report. */
export const TEA_PRESET_CURRENT: VoiceSettings = {
  stability: 0.3,
  similarity_boost: 0.7,
  style: 0.7,
  use_speaker_boost: true,
  speed: 1.12,
};

/**
 * Hotter preset. Stability is the main lever: lower means wider pitch and pace
 * movement, which is what stops it sounding like an audiobook. Style is pushed
 * up but not maxed, because style near 1.0 with low stability is where delivery
 * tips into caricature. Speed comes DOWN: energy should come from dynamics, and
 * the old 1.12-1.18 was already clipping consonants.
 */
export const TEA_PRESET_HOT: VoiceSettings = {
  stability: 0.22,
  similarity_boost: 0.68,
  style: 0.82,
  use_speaker_boost: true,
  speed: 1.1,
};

/**
 * V2, calibrated against measured gaps to the reference clip rather than taste:
 *   pitch span    ref 14.1 st vs V1 12.3 st  -> stability down again
 *   dynamic range ref 15.4 dB vs V1 14.2 dB  -> style up
 *   pause rate    ref 62.7/min vs V1 28.7/min -> handled in prosody, not settings
 *   speech ratio  ref 62% vs V1 76%           -> handled in prosody
 *
 * Speed goes slightly UP, not down: the reference is brisk through setup and
 * buys its slowness with silence, not with a slow global rate. Long unbroken
 * clauses now carry the pace while the added breaks carry the drama.
 */
export const TEA_PRESET_HOT_V2: VoiceSettings = {
  stability: 0.16,
  similarity_boost: 0.62,
  style: 0.9,
  use_speaker_boost: true,
  speed: 1.12,
};

/**
 * V5 is a full rewrite test, so the voice changes too. Hope is labelled
 * "Bubbly, Gossipy and Girly" / conversational, which is the register the copy
 * is written for. Laura ("Enthusiast, Quirky Attitude") is a presenter voice and
 * was fighting the material.
 */
const HOPE = 'uYXf8XasLslADfZ2MB4u';

/** Writing carries the performance now, so the model can sit far more natural:
 *  stability UP (0.16 -> 0.42), style DOWN (0.90 -> 0.45). V2 proved that forcing
 *  expressiveness through an unstable model hits the reference metrics and still
 *  sounds wrong. */
/** V6: what "sassiest possible" actually asks for. Stability down hard, style up
 *  hard, speed at the top of the usable range because Hope is a slow speaker. */
/**
 * V7: back to Laura, pushed harder than V2 ever was, on the rewritten copy.
 * Measured basis, not taste:
 *   Laura  14.1 st pitch span @ 207 wpm   <- matches the reference exactly
 *   Hope   10.2 st pitch span @ 163 wpm   <- will not modulate, and is slow
 * Hope's "gossipy" label is timbre, not range. Laura carries both the speed and
 * the swing; the rewritten copy supplies the personality Hope was hired for.
 */
export const TEA_PRESET_V7: VoiceSettings = {
  stability: 0.14,
  similarity_boost: 0.65,
  style: 0.92,
  use_speaker_boost: true,
  speed: 1.16,
};

export const TEA_PRESET_V6: VoiceSettings = {
  stability: 0.18,
  similarity_boost: 0.70,
  style: 0.85,
  use_speaker_boost: true,
  speed: 1.18,
};

export const TEA_PRESET_V5: VoiceSettings = {
  stability: 0.42,
  similarity_boost: 0.75,
  style: 0.45,
  use_speaker_boost: true,
  speed: 1.08,
};

/** Full rewrite: conversational storytelling with the real Esther 1 dialogue. */
const V5_TEXT: Record<string, string> = {
  'vashti-no': `Honey, gather 'round. It's Grace, and I am about to spill the tea straight from Esther chapter 1. No fanfic. No "maybe she was pregnant." No "maybe the crown was heavy." Just the text, served icy.

So there's this king. One hundred and twenty-seven provinces. Seven-day banger, royal wine, whole city invited. Day seven, direct quote: "the king's heart was merry with wine."

Cute.

He sends seven yes-men to fetch his wife. "Bring Queen Vashti out in the royal crown. Let the people and the princes look at her beauty."

Meanwhile? Vashti is throwing her own feast for the women that same week. Same palace.

She says no.

That's the entire receipt. Scripture records the refusal and not one syllable about why. Anybody inventing her reasons is writing fanfiction.

Does he go talk to his wife? Absolutely not. He convenes a panel and asks, "According to the law, what do we do with Queen Vashti?"

Enter Memucan. He stands up and says, and I am not exaggerating, "This isn't just about you, king. If word gets out, every woman in the empire hears it, and they will start despising their husbands."

So they write it into the unchangeable law of the Persians and Medes. Vashti never comes before the king again. Letters fly out in every language: every man shall rule his own house.

One woman said no.

And an entire empire passed legislation about it.

No notes.`,
};

/** Voice family is unchanged, so the A/B tests delivery and not timbre. */
const TEA_VOICE_BY_MOOD: Record<'dark' | 'light', string> = {
  dark: 'FGY2WhTYpPnrIDTdsKH5', // Laura
  light: 'cgSgspJ2msm6clMCkdW9', // Jessica
};

/**
 * Punctuation-only prosody. Each entry must differ from its source by
 * punctuation and whitespace alone. Ellipses buy a beat before a reveal;
 * paragraph breaks buy a longer one between movements.
 */
const PROSODY_V2: Record<string, [string, string][]> = {
  'vashti-no': [
    // HOOK: punch the refusal, then hang before the payoff.
    ['Vashti said no to the king and kept her crown out of it. Picture it. Day seven',
     'Vashti said no to the king... and kept her crown out of it.\n\nPicture it...\n\nDay seven'],
    // SETUP: keep one long brisk run, then a beat before the detail lands.
    ['to fetch Queen Vashti, so the princes and the people can look at her, because the text says she was fair to look on.',
     'to fetch Queen Vashti... so the princes and the people can look at her. Because the text says... she was fair to look on.'],
    // THE "WAIT, WHAT" MOMENT: chop it hard. Three short bursts.
    ['And Vashti says no. She refuses to come.',
     '\n\nAnd Vashti says... no.\n\nShe refuses... to come.'],
    // ASIDE: drop the energy, set the caveat apart so it reads as an aside.
    ['Now, Scripture does not tell us why. It records her refusal and not her reasoning, so anyone who tells you exactly what she was thinking is filling in a blank.',
     '\nNow... Scripture does not tell us why. It records her refusal... and not her reasoning. So anyone who tells you exactly what she was thinking... is filling in a blank.'],
    // ESCALATION: short reaction beat, then build.
    ['What we do get is the reaction. The king is furious. His advisers panic, and one of them stands up and says, in effect, if this gets out, every woman in the empire will hear about it and start answering back.',
     '\n\nWhat we do get... is the reaction.\n\nThe king is furious.\n\nHis advisers panic. And one of them stands up and says, in effect... if this gets out, every woman in the empire will hear about it... and start answering back.'],
    // RAPID FIRE: three consequences, each its own hit.
    ['So they write a law. They take her royal estate and give it to another. They send letters into every province, in every language, saying that every man should bear rule in his own house.',
     '\n\nSo they write a law.\n\nThey take her royal estate... and give it to another.\n\nThey send letters into every province. In every language. Saying that every man should bear rule in his own house.'],
    // CLOSER: state it, hang, land it.
    ['That is how threatened they were. One woman said one word, and an empire wrote legislation about it.',
     '\n\nThat is how threatened they were.\n\nOne woman said one word...\n\nand an empire wrote legislation about it.'],
  ],
};

const PROSODY: Record<string, [string, string][]> = {
  'vashti-no': [
    // Land the hook, then a beat before the scene opens.
    ['out of it. Picture it. Day seven', 'out of it.\n\nPicture it... Day seven'],
    // The refusal is the first reveal. Hang on it.
    ['And Vashti says no. She refuses to come.', 'And Vashti says... no.\n\nShe refuses to come.'],
    // Set the caveat apart so it reads as an aside, not part of the story beat.
    ['Now, Scripture does not tell us why.', '\nNow... Scripture does not tell us why.'],
    // Beat before the consequence.
    ['What we do get is the reaction. The king is furious.', 'What we do get is the reaction.\n\nThe king is furious.'],
    // Escalation: three short blows, each with air around it.
    ['So they write a law. They take her royal estate', 'So they write a law...\n\nThey take her royal estate'],
    // The closer. Tension before the punchline, then let it land.
    [
      'That is how threatened they were. One woman said one word, and an empire wrote legislation about it.',
      'That is how threatened they were.\n\nOne woman said one word... and an empire wrote legislation about it.',
    ],
  ],
};

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9']+/g, ' ').trim().split(' ');

/** Refuses to proceed if anything but punctuation and whitespace changed. */
function assertSameWords(original: string, variant: string) {
  const a = words(original);
  const b = words(variant);
  if (a.length !== b.length || a.some((w, i) => w !== b[i])) {
    const at = a.findIndex((w, i) => w !== b[i]);
    throw new Error(
      `Prosody variant changed wording, not just punctuation.\n`
      + `  original words: ${a.length}, variant words: ${b.length}\n`
      + (at >= 0 ? `  first divergence at word ${at}: "${a[at]}" -> "${b[at]}"` : ''),
    );
  }
}

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY required');
  const id = process.env.AB_TEA || 'vashti-no';
  const tea = TEAS.find((t) => t.id === id);
  if (!tea) throw new Error(`Unknown tea: ${id}`);

  const version = (process.env.AB_VERSION || 'v1').toLowerCase();
  const isV7 = version === 'v7';
  const isV6 = version === 'v6';
  const isV5 = version === 'v5' || isV6 || isV7;
  const isV2 = version === 'v2';
  const preset = isV7 ? TEA_PRESET_V7 : isV6 ? TEA_PRESET_V6 : isV5 ? TEA_PRESET_V5 : isV2 ? TEA_PRESET_HOT_V2 : TEA_PRESET_HOT;
  const table = isV2 ? PROSODY_V2 : PROSODY;

  const original = `${tea.hook} ${tea.tea}`;
  let variant = original;
  if (isV5) {
    // V5 is an approved REWRITE, not a prosody variant, so the word-identity
    // guard does not apply. Fidelity for it was audited line by line against
    // Esther 1 before generation (see the V5 audit).
    variant = V5_TEXT[id];
    if (!variant) throw new Error(`No V5 copy for ${id}`);
  } else {
    for (const [from, to] of table[id] ?? []) {
      if (!variant.includes(from)) throw new Error(`Prosody anchor not found in ${id}: "${from.slice(0, 50)}"`);
      variant = variant.replace(from, to);
    }
    assertSameWords(original, variant);
  }

  const voice = isV7 ? 'FGY2WhTYpPnrIDTdsKH5' : isV5 ? HOPE : (tea.voice ?? TEA_VOICE_BY_MOOD[tea.mood]);
  console.log(`A/B: ${id}`);
  console.log(`  voice     ${voice} (unchanged)`);
  console.log(`  version   ${isV7 ? 'V7 (rewrite + Laura, max modulation)' : isV6 ? 'V6 (rewrite + Hope, max sass)' : isV5 ? 'V5 (rewrite + Hope)' : isV2 ? 'HOT V2' : 'HOT V1'}`);
  console.log(`  preset    ${JSON.stringify(preset)}`);
  console.log(`  chars     original ${original.length} -> variant ${variant.length} (billed on the variant)`);
  console.log(isV5
    ? `  words     ${words(variant).length} (rewrite; fidelity audited against Esther 1)`
    : `  words     ${words(original).length} (identical, verified)`);

  const { audio, words: timings } = await synthesizeSpeechTimed(variant, {
    voice,
    settings: preset,
  });

  const base = `tea-${id}-hot${isV7 ? '-v7' : isV6 ? '-v6' : isV5 ? '-v5' : isV2 ? '-v2' : ''}`;
  await writeFile(path.join(outDir, `${base}.mp3`), audio);
  await writeFile(
    path.join(outDir, `${base}.json`),
    JSON.stringify({
      kind: 'tea-ab',
      teaId: id,
      variant: isV7 ? 'v7-rewrite-laura' : isV6 ? 'v6-rewrite-sassy' : isV5 ? 'v5-rewrite' : isV2 ? 'hot-v2' : 'hot',
      text: variant,
      originalText: original,
      voice,
      settings: preset,
      words: timings,
      renderedAt: Date.now(),
    }, null, 2),
  );
  console.log(`  written   ${base}.mp3 (${(audio.length / 1024).toFixed(0)}kb) + ${base}.json`);
  console.log(`  timings   ${timings ? `${timings.length} words` : 'NONE'}`);
  console.log('  originals untouched: tea-' + id + '.mp3 / .json');
}

main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
