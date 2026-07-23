// Pre-render story + Tea narration to static MP3s. Run ONCE locally with a key:
//   ELEVENLABS_API_KEY=... ELEVENLABS_DEFAULT_VOICE=... npm run generate:audio
//   # or: OPENAI_API_KEY=sk-... TTS_PROVIDER=openai npm run generate:audio
// Writes (naming is the contract the app resolves against):
//   backend/public/audio/<storyId>-part-<n>.mp3
//   backend/public/audio/<teaId>.mp3
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORIES } from '../src/lib/storyCatalog.js';
import { TEAS } from '../src/lib/teaCatalog.js';
import { pickVoice } from '../src/lib/voiceProfiles.js';
import { generateStoryNarrative } from '../src/services/llmService.js';
import { synthesizeSpeech } from '../src/services/ttsService.js';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/audio');

async function main() {
  const provider = process.env.TTS_PROVIDER || 'elevenlabs';
  const hasKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.ELEVENLABS_API_KEY;
  if (!hasKey) {
    throw new Error(`Set ${provider === 'openai' ? 'OPENAI_API_KEY' : 'ELEVENLABS_API_KEY'} to pre-render audio`);
  }
  await mkdir(outDir, { recursive: true });

  for (const story of STORIES) {
    const { voice, style } = pickVoice({
      kind: 'story',
      mood: story.testament === 'new' ? 'light' : 'dark',
    });
    for (let part = 1; part <= story.parts; part++) {
      const text = await generateStoryNarrative(story, {}, part); // neutral (no user ctx) for shipped audio
      const mp3 = await synthesizeSpeech(text, { voice: story.voice ?? voice, style });
      const file = path.join(outDir, `${story.id}-part-${part}.mp3`);
      await writeFile(file, mp3);
      console.log(`✓ ${story.id} part ${part} — ${(mp3.length / 1024).toFixed(0)}kb`);
    }
  }

  for (const tea of TEAS) {
    const { voice, style } = pickVoice({ kind: 'tea', mood: tea.mood });
    const text = `${tea.hook}. ${tea.tea}`;
    const mp3 = await synthesizeSpeech(text, { voice: tea.voice ?? voice, style });
    const file = path.join(outDir, `${tea.id}.mp3`);
    await writeFile(file, mp3);
    console.log(`✓ ${tea.id} — ${(mp3.length / 1024).toFixed(0)}kb`);
  }

  console.log('Done. Commit backend/public/audio/*.mp3 (or sync to CDN — see 01b).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
