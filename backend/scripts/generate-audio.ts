// Pre-render story + Tea narration to static MP3s with a real TTS key:
//   ELEVENLABS_API_KEY=... npm run generate:audio          (default provider)
//   TTS_PROVIDER=openai OPENAI_API_KEY=sk-... npm run generate:audio
// Writes (the app resolves .mp3 first, then the .m4a placeholder):
//   backend/public/audio/<storyId>-part-<n>.mp3
//   backend/public/audio/<teaId>.mp3
//
// Voices are matched per character; Tea is faster + sassier with per-card variation.
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORIES } from '../src/lib/storyCatalog.js';
import { TEAS } from '../src/lib/teaCatalog.js';
import { storyPartText } from '../src/lib/narrationScripts.js';
import { VOICE_STYLE, VOICES, type VoiceSettings } from '../src/lib/voiceProfiles.js';
import { synthesizeSpeech } from '../src/services/ttsService.js';

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
  'davids-rooftop': 0.96, // a king's grief — measured
};

// Tea = sassy, brisk. Voice by mood (both premade, in the account), with a little
// per-card speed/style variation so ten cards don't sound identical.
const TEA_VOICE_BY_MOOD: Record<'dark' | 'light', string> = {
  dark: 'FGY2WhTYpPnrIDTdsKH5', // Laura — sassy, a little edge
  light: 'cgSgspJ2msm6clMCkdW9', // Jessica — young, playful, bright
};

// Re-render is idempotent + quota-friendly: skip anything already on disk.
// Delete a file (or the whole dir) to force a re-render of it.
const FORCE = process.env.FORCE === '1';

function teaSettings(order: number): VoiceSettings {
  const base = VOICE_STYLE.sassy;
  const jitter = ((order - 1) % 3) * 0.03; // 0, .03, .06 across cards
  return {
    ...base,
    speed: Math.min(1.2, (base.speed ?? 1.12) + jitter),
    style: Math.min(1, base.style + ((order % 2) ? 0.05 : 0)),
  };
}

async function main() {
  const provider = process.env.TTS_PROVIDER || 'elevenlabs';
  const hasKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.ELEVENLABS_API_KEY;
  if (!hasKey) {
    throw new Error(`Set ${provider === 'openai' ? 'OPENAI_API_KEY' : 'ELEVENLABS_API_KEY'} to render audio`);
  }
  await mkdir(outDir, { recursive: true });

  for (const story of STORIES) {
    const style = STORY_STYLE[story.id] ?? 'default';
    const settings: VoiceSettings = {
      ...(VOICE_STYLE[style] ?? VOICE_STYLE.default),
      ...(STORY_SPEED[story.id] ? { speed: STORY_SPEED[story.id] } : {}),
    };
    for (let part = 1; part <= story.parts; part++) {
      const out = path.join(outDir, `${story.id}-part-${part}.mp3`);
      if (!FORCE && existsSync(out)) { console.log(`· ${story.id} part ${part} — exists, skip`); continue; }
      const text = storyPartText(story.id, part, story.hook);
      const mp3 = await synthesizeSpeech(text, { voice: story.voice ?? VOICES.grace, settings });
      await writeFile(out, mp3);
      console.log(`✓ ${story.id} part ${part} — ${style} — ${(mp3.length / 1024).toFixed(0)}kb`);
    }
  }

  for (const tea of TEAS) {
    const out = path.join(outDir, `${tea.id}.mp3`);
    if (!FORCE && existsSync(out)) { console.log(`· ${tea.id} — exists, skip`); continue; }
    const voice = tea.voice ?? TEA_VOICE_BY_MOOD[tea.mood];
    const settings = teaSettings(tea.order);
    const text = `${tea.hook} ${tea.tea}`;
    const mp3 = await synthesizeSpeech(text, { voice, settings });
    await writeFile(out, mp3);
    console.log(`✓ ${tea.id} — ${tea.mood} sassy@${settings.speed?.toFixed(2)} — ${(mp3.length / 1024).toFixed(0)}kb`);
  }

  console.log('Done. Real .mp3 render written to public/audio (supersedes the .m4a placeholders).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
