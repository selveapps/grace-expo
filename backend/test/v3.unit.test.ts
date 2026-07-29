// Unit tests for the v3 pure logic. No database, so these run anywhere
// (the phase*.integration tests still need `npm run db:up`).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TEAS, teaOfDay, teaForClient, getTea } from '../src/lib/teaCatalog.js';
import { STORIES } from '../src/lib/storyCatalog.js';
import { STORY_SCRIPT_V2 } from '../src/lib/narrationScripts.js';
import { collapseToWords } from '../src/services/ttsService.js';

describe('Tea catalog (v3)', () => {
  test('ships 30 daily sermons with unique ids and orders', () => {
    assert.equal(TEAS.length, 30);
    assert.equal(new Set(TEAS.map((t) => t.id)).size, 30);
    assert.deepEqual(
      [...TEAS].map((t) => t.order).sort((a, b) => a - b),
      Array.from({ length: 30 }, (_, i) => i + 1),
    );
  });

  test('every tea has media, a duration in range, and a valid heat', () => {
    for (const t of TEAS) {
      assert.ok(t.image?.startsWith('/img/tea/'), `${t.id} image`);
      assert.ok(t.audioUrl?.includes('{teaId}') || t.audioUrl?.includes(t.id), `${t.id} audio`);
      assert.ok(t.durationSeconds! >= 45 && t.durationSeconds! <= 70, `${t.id} duration`);
      assert.ok([1, 2, 3].includes(t.heat), `${t.id} heat`);
    }
  });

  // 217 wpm is measured from the 30 rendered clips of the sassy preset, so the
  // word count is a real predictor of narration length, not a guess.
  const TEA_WPM = 217;

  test('every tea narrates in 45 to 70 seconds', () => {
    for (const t of TEAS) {
      const words = `${t.hook} ${t.tea}`.trim().split(/\s+/).length;
      const secs = (words / TEA_WPM) * 60;
      assert.ok(secs >= 45 && secs <= 70, `${t.id} narrates in ~${secs.toFixed(0)}s (${words} words)`);
    }
  });

  // durationSeconds is reconciled against the real MP3 by `npm run sync:durations`,
  // and `npm run verify:audio` is the authoritative check. Here we only assert the
  // declared value stays inside the product band.
  test('declared durationSeconds stays in the 45 to 70 second band', () => {
    for (const t of TEAS) {
      assert.ok(
        t.durationSeconds! >= 45 && t.durationSeconds! <= 70,
        `${t.id} declares ${t.durationSeconds}s`,
      );
    }
  });

  test('no em-dashes in user-facing copy', () => {
    for (const t of TEAS) {
      assert.ok(!t.hook.includes('—'), `${t.id} hook has an em-dash`);
      assert.ok(!t.tea.includes('—'), `${t.id} tea has an em-dash`);
      assert.ok(!t.badge.includes('—'), `${t.id} badge has an em-dash`);
    }
  });

  test('teaOfDay is stable within a day and cycles without repeats', () => {
    const d = new Date('2026-07-29T09:00:00Z');
    const later = new Date('2026-07-29T23:00:00Z');
    assert.equal(teaOfDay(d).id, teaOfDay(later).id);

    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      seen.add(teaOfDay(new Date(d.getTime() + i * 86_400_000)).id);
    }
    assert.equal(seen.size, 30, 'a 30 day window must not repeat');
  });

  test('teaForClient resolves the audio url template', () => {
    const t = teaForClient(getTea('vashti-no')!);
    assert.equal(t.audioUrl, '/audio/tea-vashti-no.mp3');
    assert.equal(t.hasAudio, true);
  });
});

describe('Story catalog (v3)', () => {
  test('every story part targets 3 to 4.5 minutes', () => {
    for (const s of STORIES) {
      assert.ok(
        s.durationSeconds >= 180 && s.durationSeconds <= 270,
        `${s.id} is ${s.durationSeconds}s, expected 180-270`,
      );
    }
  });

  test('every story has a narration script and a scripture ref per part', () => {
    for (const s of STORIES) {
      const parts = STORY_SCRIPT_V2[s.id];
      assert.ok(parts, `${s.id} has no narration script`);
      assert.equal(parts.length, s.parts, `${s.id} declares ${s.parts} parts but has ${parts.length} scripts`);
      parts.forEach((p, i) => {
        assert.ok(p.ref && /\d/.test(p.ref), `${s.id} part ${i + 1} has no scripture ref`);
      });
    }
  });

  // Per-preset rates, measured/derived from the rendered clips.
  const STORY_WPM: Record<string, number> = {
    'ruth-stays': 146, 'esther-uninvited': 154, 'davids-rooftop': 140,
    'hannah-prayer': 137, 'mary-annunciation': 137,
  };

  test('every story part is 450 to 600 words and narrates in 3 to 4.5 minutes', () => {
    for (const [id, parts] of Object.entries(STORY_SCRIPT_V2)) {
      parts.forEach((p, i) => {
        const words = p.text.trim().split(/\s+/).length;
        const secs = (words / STORY_WPM[id]) * 60;
        assert.ok(words >= 450 && words <= 600, `${id} part ${i + 1} is ${words} words`);
        assert.ok(secs >= 180 && secs <= 270, `${id} part ${i + 1} narrates in ~${secs.toFixed(0)}s`);
      });
    }
  });

  test('no em-dashes in any narration script', () => {
    for (const [id, parts] of Object.entries(STORY_SCRIPT_V2)) {
      parts.forEach((p, i) => {
        assert.ok(!p.text.includes('—'), `${id} part ${i + 1} contains an em-dash`);
      });
    }
  });
});

describe('Onboarding previews', () => {
  // Onboarding advertises the product; it must not open with a 3 minute
  // commitment. Anything bundled into the app as a preview stays short, and the
  // full-length parts stay in the Stories tab.
  const PREVIEW_MAX_WORDS = 110; // ~35s at the slowest story preset

  test('the Ruth onboarding preview is a verbatim excerpt of the Ruth story', () => {
    const excerpt = [
      'Two women on a road out of Moab.',
      'One of them just did the sensible thing.',
      'The other one would not let go.',
      'Intreat me not to leave thee, or to return from following after thee.',
      'For whither thou goest, I will go.',
      'Thy people shall be my people, and thy God my God.',
    ];
    const source = STORY_SCRIPT_V2['ruth-stays'].map((p) => p.text).join(' ');
    for (const sentence of excerpt) {
      assert.ok(source.includes(sentence), `not verbatim in ruth-stays: ${sentence}`);
    }
    assert.ok(
      excerpt.join(' ').split(/\s+/).length <= PREVIEW_MAX_WORDS,
      'the Ruth preview is too long for onboarding',
    );
  });

  test('no full story part is short enough to be mistaken for a preview', () => {
    for (const [id, parts] of Object.entries(STORY_SCRIPT_V2)) {
      parts.forEach((p, i) => {
        assert.ok(
          p.text.trim().split(/\s+/).length > PREVIEW_MAX_WORDS,
          `${id} part ${i + 1} is preview-length; onboarding must not use full parts`,
        );
      });
    }
  });
});

describe('TTS word timings', () => {
  test('collapses character alignment into word spans', () => {
    const words = collapseToWords({
      characters: ['H', 'i', ' ', 't', 'h', 'e', 'r', 'e'],
      character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
      character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
    });
    assert.deepEqual(words, [
      { w: 'Hi', start: 0, end: 0.2 },
      { w: 'there', start: 0.3, end: 0.8 },
    ]);
  });

  test('returns null when the provider sent no alignment', () => {
    assert.equal(collapseToWords(undefined), null);
    assert.equal(collapseToWords({ characters: [] }), null);
  });
});
