// Generate KEY-FREE placeholder narration so audio is testable end-to-end before
// a real TTS render. Uses macOS `say` (per-character voices, brisk/bright for Tea)
// and `afconvert` (AAC) → backend/public/audio/*.m4a.
//
//   npm run generate:audio:placeholder          # macOS only
//
// The app tries `<name>.mp3` first, then `<name>.m4a`, so a later real render
// (`npm run generate:audio`, needs a key) drops in .mp3s that supersede these.
import { execFileSync } from 'child_process';
import { mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { STORIES } from '../src/lib/storyCatalog.js';
import { TEAS } from '../src/lib/teaCatalog.js';
import { storyPartText } from '../src/lib/narrationScripts.js';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/audio');

// Warm narrator voice per character (suited to the person + testament mood).
const STORY_VOICE: Record<string, { voice: string; rate: number }> = {
  'ruth-stays': { voice: 'Moira', rate: 176 }, // loyal, warm (Irish)
  'esther-uninvited': { voice: 'Karen', rate: 172 }, // bold, regal (Australian)
  'davids-rooftop': { voice: 'Daniel', rate: 168 }, // the king (British male)
  'hannah-prayer': { voice: 'Samantha', rate: 170 }, // tender
  'mary-annunciation': { voice: 'Samantha', rate: 176 }, // quiet radical yes
};

// Tea = sassy but reverent: bright voice, brisk pace. Vary by mood.
const TEA_VOICE: Record<'dark' | 'light', { voice: string; rate: number }> = {
  dark: { voice: 'Karen', rate: 196 },
  light: { voice: 'Samantha', rate: 198 },
};

function synth(voice: string, rate: number, text: string, base: string) {
  const aiff = path.join(tmpdir(), `${base}.aiff`);
  const out = path.join(outDir, `${base}.m4a`);
  execFileSync('say', ['-v', voice, '-r', String(rate), '-o', aiff, text]);
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac@22050', aiff, out]);
  return out;
}

async function main() {
  if (process.platform !== 'darwin') {
    throw new Error('generate:audio:placeholder needs macOS `say` + `afconvert`. Use `generate:audio` with a key instead.');
  }
  await mkdir(outDir, { recursive: true });

  for (const story of STORIES) {
    const v = STORY_VOICE[story.id] ?? { voice: 'Samantha', rate: 175 };
    for (let part = 1; part <= story.parts; part++) {
      const text = storyPartText(story.id, part, story.hook);
      const file = synth(v.voice, v.rate, text, `${story.id}-part-${part}`);
      console.log(`✓ ${path.basename(file)} — ${v.voice}`);
    }
  }

  for (const tea of TEAS) {
    const v = TEA_VOICE[tea.mood];
    const text = `${tea.hook} ${tea.tea}`;
    const file = synth(v.voice, v.rate, text, tea.id);
    console.log(`✓ ${path.basename(file)} — ${v.voice} (${tea.mood})`);
  }

  await rm(path.join(tmpdir(), 'placeholder.aiff'), { force: true }).catch(() => {});
  console.log('Done. Placeholder .m4a written to public/audio (mp3 render supersedes them).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
