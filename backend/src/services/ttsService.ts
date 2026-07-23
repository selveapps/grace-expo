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
