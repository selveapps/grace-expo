import { VOICE_STYLE, type VoiceSettings } from '../lib/voiceProfiles.js';

export type TtsOpts = { voice?: string; style?: string; settings?: VoiceSettings };

// Provider-switchable TTS. Same synthesizeSpeech(text) signature so nothing
// downstream changes; TTS_PROVIDER selects elevenlabs (default) or openai.
export async function synthesizeSpeech(text: string, opts: TtsOpts = {}): Promise<Buffer> {
  const provider = process.env.TTS_PROVIDER || 'elevenlabs';
  const input = text.trim().slice(0, 5000);
  if (!input) throw new Error('Empty narration text');
  return provider === 'openai' ? openaiTts(input, opts) : elevenLabsTts(input, opts);
}

async function elevenLabsTts(text: string, opts: TtsOpts): Promise<Buffer> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY not configured');
  const voice = opts.voice || process.env.ELEVENLABS_DEFAULT_VOICE;
  if (!voice) throw new Error('ELEVENLABS_DEFAULT_VOICE not configured');
  const modelId = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
  const settings = opts.settings ?? VOICE_STYLE[opts.style || 'default'] ?? VOICE_STYLE.default;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: modelId, voice_settings: settings }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export type WordTiming = { w: string; start: number; end: number };
export type TimedSpeech = { audio: Buffer; words: WordTiming[] | null };

/**
 * Render speech AND the word timings for exactly that render. ElevenLabs
 * `/with-timestamps` returns per-character start/end times, which we collapse
 * into word spans. The sidecar written from this is what /stories/:id/transcript
 * serves, which is why the transcript matches the audio word for word.
 *
 * Falls back to plain synthesis (words: null) on any provider that cannot do it.
 */
export async function synthesizeSpeechTimed(text: string, opts: TtsOpts = {}): Promise<TimedSpeech> {
  const provider = process.env.TTS_PROVIDER || 'elevenlabs';
  const input = text.trim().slice(0, 5000);
  if (!input) throw new Error('Empty narration text');
  if (provider !== 'elevenlabs') {
    return { audio: await synthesizeSpeech(input, opts), words: null };
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY not configured');
  const voice = opts.voice || process.env.ELEVENLABS_DEFAULT_VOICE;
  if (!voice) throw new Error('ELEVENLABS_DEFAULT_VOICE not configured');
  const modelId = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
  const settings = opts.settings ?? VOICE_STYLE[opts.style || 'default'] ?? VOICE_STYLE.default;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ text: input, model_id: modelId, voice_settings: settings }),
  });

  if (!res.ok) {
    // Older keys/models may not expose the endpoint. Degrade to audio only
    // rather than failing the whole render.
    if (res.status === 404 || res.status === 400) {
      return { audio: await synthesizeSpeech(input, opts), words: null };
    }
    throw new Error(`ElevenLabs timestamps ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const body = (await res.json()) as {
    audio_base64?: string;
    alignment?: {
      characters?: string[];
      character_start_times_seconds?: number[];
      character_end_times_seconds?: number[];
    };
  };
  if (!body.audio_base64) throw new Error('ElevenLabs returned no audio');

  return {
    audio: Buffer.from(body.audio_base64, 'base64'),
    words: collapseToWords(body.alignment),
  };
}

/** Character-level alignment -> word spans, splitting on whitespace. */
export function collapseToWords(alignment?: {
  characters?: string[];
  character_start_times_seconds?: number[];
  character_end_times_seconds?: number[];
}): WordTiming[] | null {
  const chars = alignment?.characters;
  const starts = alignment?.character_start_times_seconds;
  const ends = alignment?.character_end_times_seconds;
  if (!chars?.length || !starts?.length || !ends?.length) return null;

  const words: WordTiming[] = [];
  let buf = '';
  let start = 0;
  let end = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (/\s/.test(ch)) {
      if (buf) words.push({ w: buf, start, end });
      buf = '';
      continue;
    }
    if (!buf) start = starts[i] ?? end;
    buf += ch;
    end = ends[i] ?? start;
  }
  if (buf) words.push({ w: buf, start, end });
  return words.length ? words : null;
}

async function openaiTts(text: string, opts: TtsOpts): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_TTS_MODEL || 'tts-1';
  const voice = opts.voice || process.env.OPENAI_TTS_VOICE || 'nova';

  const res = await fetch(`${base}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, voice, input: text, response_format: 'mp3' }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS error ${res.status}: ${err.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
