// Pre-render story + Tea + onboarding narration to static MP3s with a real TTS key:
//   ELEVENLABS_API_KEY=... npm run generate:audio          (default provider)
//   TTS_PROVIDER=openai OPENAI_API_KEY=sk-... npm run generate:audio
//   ONLY=onboarding npm run generate:audio                 (smoke-test one group)
//   ONLY=stories|tea|onboarding|<id>   FORCE=1 to re-render existing files
//
// Writes (the app resolves .mp3 first, then the .m4a placeholder):
//   backend/public/audio/<storyId>-part-<n>.mp3   + .json sidecar
//   backend/public/audio/tea-<teaId>.mp3          + .json sidecar
//   backend/public/audio/onboarding-preview.mp3   + .json sidecar
//   backend/public/audio/ruth-preview.mp3          + .json sidecar (~18s hook)
//
// Every MP3 gets a JSON sidecar holding the EXACT text that was sent to TTS plus
// ElevenLabs word timings. GET /stories/:id/transcript serves that sidecar, which
// is why the transcript matches the audio word for word and supports tap-to-seek.
// Nothing regenerates narrative text for display any more.
//
// Voices are matched per character; Tea is faster + sassier with per-card variation.
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORIES, STORY_VOICE } from '../src/lib/storyCatalog.js';
import { TEAS } from '../src/lib/teaCatalog.js';
import { storyPartText, STORY_SCRIPT_V2 } from '../src/lib/narrationScripts.js';
import { VOICE_STYLE, VOICES, type VoiceSettings } from '../src/lib/voiceProfiles.js';
import { synthesizeSpeechTimed } from '../src/services/ttsService.js';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/audio');

// Per-story delivery preset (voice comes from story.voice in the catalog).
const STORY_STYLE: Record<string, keyof typeof VOICE_STYLE> = {
  'ruth-stays': 'steady',
  'esther-uninvited': 'bold',
  'davids-rooftop': 'steady',
  'hannah-prayer': 'tender',
  'mary-annunciation': 'tender',
};
// A couple of characters want a touch slower/weightier read than the preset.
const STORY_SPEED: Record<string, number> = {
  'davids-rooftop': 0.96, // a king's grief, measured
};

// Tea = sassy, brisk. Voice by mood (both premade, in the account), with a little
// per-card speed/style variation so thirty cards don't sound identical.
const TEA_VOICE_BY_MOOD: Record<'dark' | 'light', string> = {
  dark: 'FGY2WhTYpPnrIDTdsKH5', // Laura, sassy with a little edge
  light: 'cgSgspJ2msm6clMCkdW9', // Jessica, young, playful, bright
};

// Onboarding samples. Bundled into the app at assets/audio/, so the emotional
// beat never depends on the network or on a runtime API key.
//
// These are SHORT previews. Onboarding must never play a full story part: a
// 3 minute piece is the Stories experience, not a product teaser. Each preview
// uses the same voice and delivery preset as the story it advertises, and its
// text is drawn verbatim from that story's narration so the preview is an
// excerpt, never a separately invented retelling. `assertExcerptOf` enforces it.
type Preview = {
  id: string;
  title: string;
  voice: string;
  style: keyof typeof VOICE_STYLE;
  text: string;
  /** Story whose narration this must be a verbatim excerpt of. */
  excerptOf?: string;
};

const PREVIEWS: Preview[] = [
  {
    id: 'onboarding-preview',
    title: 'Esther walks in uninvited',
    voice: 'pFZP5JQG7iQjIQuC4Bku', // Lily, the Grace narrator
    style: 'bold',
    text: [
      'A decree went out across the empire. Every Jew, marked for death.',
      'And a young queen sat safe behind the palace walls, saying nothing.',
      'Mordecai sent word. Who knows but that you have come to your royal place for such a time as this.',
      'To approach the king uninvited meant death. Esther fasted three days, fixed her crown, and stepped into the throne room anyway.',
      'The king raised his golden scepter. She lived.',
      'This is Grace. Come and hear the rest.',
    ].join(' '),
  },
  {
    // ~18s hook for the Ruth card in onboarding. Every sentence below appears
    // verbatim in ruth-stays parts 1 and 2; Sarah + 'steady', the same voice and
    // preset the full Ruth story is rendered with.
    id: 'ruth-preview',
    title: 'Ruth stays',
    voice: STORY_VOICE['ruth-stays'],
    style: 'steady',
    excerptOf: 'ruth-stays',
    text: [
      'Two women on a road out of Moab.',
      'One of them just did the sensible thing.',
      'The other one would not let go.',
      'Intreat me not to leave thee, or to return from following after thee.',
      'For whither thou goest, I will go.',
      'Thy people shall be my people, and thy God my God.',
    ].join(' '),
  },
];

/**
 * Guarantees a preview is a real excerpt. Every sentence must appear verbatim in
 * the referenced story's narration, so the preview cannot drift into being a
 * different version of the story.
 */
function assertExcerptOf(p: Preview) {
  if (!p.excerptOf) return;
  const source = (STORY_SCRIPT_V2[p.excerptOf] ?? []).map((s) => s.text).join(' ');
  const missing = p.text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s && !source.includes(s));
  if (missing.length) {
    throw new Error(
      `${p.id} is not a verbatim excerpt of ${p.excerptOf}. Not found:\n  ` + missing.join('\n  '),
    );
  }
}

// Re-render is idempotent + quota-friendly: skip anything already on disk.
// Delete a file (or the whole dir), or set FORCE=1, to force a re-render.
const FORCE = process.env.FORCE === '1';
const ONLY = process.env.ONLY?.trim();

function wants(group: 'stories' | 'tea' | 'onboarding', id?: string) {
  if (!ONLY) return true;
  return ONLY === group || (id != null && ONLY === id);
}

// One approved direction across all 30. The old per-card speed/style jitter was
// added when cards sounded samey; with the V7 preset it just pulls some cards
// off the approved delivery, so it is gone.
function teaSettings(_order: number): VoiceSettings {
  return { ...VOICE_STYLE.sassy };
}

/** Write the MP3 plus its transcript sidecar. Returns false when skipped. */
async function render(
  base: string,
  text: string,
  opts: { voice?: string; settings?: VoiceSettings },
  meta: Record<string, unknown>,
): Promise<boolean> {
  const mp3Path = path.join(outDir, `${base}.mp3`);
  if (!FORCE && existsSync(mp3Path)) {
    console.log(`· ${base} — exists, skip`);
    return false;
  }
  const { audio, words } = await synthesizeSpeechTimed(text, opts);
  await writeFile(mp3Path, audio);
  await writeFile(
    path.join(outDir, `${base}.json`),
    JSON.stringify({ ...meta, text, voice: opts.voice, words, renderedAt: Date.now() }, null, 2),
  );
  console.log(
    `✓ ${base} — ${(audio.length / 1024).toFixed(0)}kb — ${words ? `${words.length} word timings` : 'no timings'}`,
  );
  return true;
}

async function main() {
  const provider = process.env.TTS_PROVIDER || 'elevenlabs';
  const hasKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.ELEVENLABS_API_KEY;
  if (!hasKey) {
    throw new Error(`Set ${provider === 'openai' ? 'OPENAI_API_KEY' : 'ELEVENLABS_API_KEY'} to render audio`);
  }
  await mkdir(outDir, { recursive: true });

  for (const preview of PREVIEWS) {
    if (!wants('onboarding', preview.id)) continue;
    assertExcerptOf(preview);
    await render(
      preview.id,
      preview.text,
      { voice: preview.voice, settings: VOICE_STYLE[preview.style] },
      { kind: 'onboarding', title: preview.title, excerptOf: preview.excerptOf ?? null },
    );
    console.log(`  → copy to the app bundle: cp public/audio/${preview.id}.mp3 ../assets/audio/`);
  }

  for (const story of STORIES) {
    if (!wants('stories', story.id)) continue;
    const style = STORY_STYLE[story.id] ?? 'default';
    const settings: VoiceSettings = {
      ...(VOICE_STYLE[style] ?? VOICE_STYLE.default),
      ...(STORY_SPEED[story.id] ? { speed: STORY_SPEED[story.id] } : {}),
    };
    for (let part = 1; part <= story.parts; part++) {
      await render(
        `${story.id}-part-${part}`,
        storyPartText(story.id, part, story.hook),
        { voice: story.voice ?? VOICES.grace, settings },
        { kind: 'story', storyId: story.id, part, style },
      );
    }
  }

  for (const tea of TEAS) {
    if (!wants('tea', tea.id)) continue;
    await render(
      `tea-${tea.id}`,
      `${tea.hook} ${tea.tea}`,
      { voice: tea.voice ?? TEA_VOICE_BY_MOOD[tea.mood], settings: teaSettings(tea.order) },
      { kind: 'tea', teaId: tea.id, mood: tea.mood, heat: tea.heat },
    );
  }

  console.log('Done. Real .mp3 renders + .json transcript sidecars written to public/audio.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
