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

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/audio');

// Warm narrator voice per character (suited to the person + testament mood).
const STORY_VOICE: Record<string, { voice: string; rate: number }> = {
  'ruth-stays': { voice: 'Moira', rate: 176 }, // loyal, warm (Irish)
  'esther-uninvited': { voice: 'Karen', rate: 172 }, // bold, regal (Australian)
  'davids-rooftop': { voice: 'Daniel', rate: 168 }, // the king (British male)
  'hannah-prayer': { voice: 'Samantha', rate: 170 }, // tender
  'mary-annunciation': { voice: 'Samantha', rate: 176 }, // quiet radical yes
};

// Short characterful script per story part (placeholder — a real render replaces it).
const STORY_SCRIPT: Record<string, string[]> = {
  'ruth-stays': [
    'Naomi had lost everything. Her husband, her sons, her home. She told her sons’ widows to turn back. Orpah kissed her goodbye. Ruth would not let go.',
    'Where you go, I will go. Your people will be my people, and your God, my God. A vow spoken on a dusty road, and she meant every word.',
    'Back in Bethlehem, Ruth went out to glean, gathering the leftover grain in the fields. The field belonged to a man named Boaz, and he noticed her.',
    'Boaz redeemed the family line and took Ruth as his wife. The widow from Moab became the great-grandmother of King David. Loyalty rewrote her whole story.',
  ],
  'esther-uninvited': [
    'A decree went out across the empire. Every Jew, marked for death. And a young queen sat safe behind the palace walls, saying nothing.',
    'Mordecai sent word. Who knows but that you have come to your royal place for such a time as this. The silence was no longer safe.',
    'To approach the king uninvited meant death. Esther fasted three days, fixed her crown, and stepped into the throne room anyway.',
    'The king raised his golden scepter. She lived. And with a banquet and the truth, she turned an empire’s death sentence into her people’s rescue.',
  ],
  'davids-rooftop': [
    'Evening on the palace roof. The king should have been away at war. Instead David saw Bathsheba, and let power do what power does.',
    'One sin covered by another. A faithful husband sent to die at the front line. David thought the story was closed. Heaven did not.',
    'The prophet Nathan told a tale of a stolen lamb, and David burned with anger, until he saw that the thief was himself. Then came grief, and mercy.',
  ],
  'hannah-prayer': [
    'Year after year, Hannah longed for a child, and wept. At the temple she prayed so hard, her lips moving with no sound, that the priest thought her drunk.',
    'God remembered Hannah. She bore a son, Samuel, and gave him back to the Lord. Her ache became a song that still teaches us how to pray.',
  ],
  'mary-annunciation': [
    'A young woman in a small town. An angel arrives with impossible news. She will carry the Son of God.',
    'How can this be, she asks. Not doubt, but wonder. And the answer is only this. Nothing is impossible with God.',
    'I am the Lord’s servant, she says. Let it be to me as you have said. The most quietly radical yes in all of history.',
  ],
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
    const parts = STORY_SCRIPT[story.id] ?? [story.hook];
    for (let part = 1; part <= story.parts; part++) {
      const text = parts[part - 1] ?? parts[parts.length - 1] ?? story.hook;
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
