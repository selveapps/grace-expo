const TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'nova';

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY;
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_TTS_MODEL || 'tts-1';

  if (!key) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const input = text.trim().slice(0, 4096);
  if (!input) throw new Error('Empty narration text');

  const res = await fetch(`${base}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice: TTS_VOICE,
      input,
      response_format: 'mp3',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS error ${res.status}: ${err.slice(0, 200)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
