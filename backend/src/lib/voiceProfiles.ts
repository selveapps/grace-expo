// Voice + delivery presets. Maps content signals (kind / mood / gentleness) to
// an ElevenLabs voice id + a voice_settings tuning preset — data-driven so no
// per-content logic is needed. Defaults use ElevenLabs premade voices available
// on the account; override per env for a custom brand voice.

export type VoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost?: boolean;
  speed?: number; // 0.7 (slow) … 1.2 (fast); >1 reads brisker/sassier
};

export const VOICE_STYLE: Record<string, VoiceSettings> = {
  default: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 1.0 },
  tender: { stability: 0.62, similarity_boost: 0.8, style: 0.12, use_speaker_boost: true, speed: 0.94 }, // Softly / grief / comfort
  steady: { stability: 0.5, similarity_boost: 0.78, style: 0.35, use_speaker_boost: true, speed: 1.0 }, // Steadily
  bold: { stability: 0.4, similarity_boost: 0.72, style: 0.55, use_speaker_boost: true, speed: 1.06 }, // Directly
  // Tea, approved V7 direction. Measured against a creator reference clip:
  // Laura holds 14.1 st of pitch movement at ~200 wpm, which matches the
  // reference; Hope tested flatter (10.2 st) and 27% slower despite a
  // "gossipy" label. Low stability + high style is the swing; the rewritten
  // conversational copy supplies the personality. Duration is allowed to run
  // past 70s rather than compromise the delivery.
  sassy: { stability: 0.14, similarity_boost: 0.65, style: 0.92, use_speaker_boost: true, speed: 1.16 },
};

// Named voices (premade ids available on the account). Env overrides win.
const GRACE_VOICE = 'pFZP5JQG7iQjIQuC4Bku'; // "Lily" — British, warm, velvety narrator
const TEA_VOICE = 'FGY2WhTYpPnrIDTdsKH5'; // "Laura" — young, sassy (social-media energy)

/**
 * Voice ids are pasted into .env with trailing "# which voice this is" notes.
 * Node's --env-file strips those, but Railway/other loaders may not, and a voice
 * id with a comment glued on 404s at the API. Take the first token, always.
 */
function voiceId(raw: string | undefined, fallback: string): string {
  const cleaned = raw?.split('#')[0].trim();
  return cleaned || fallback;
}

export const VOICES: Record<string, string | undefined> = {
  grace: voiceId(process.env.ELEVENLABS_DEFAULT_VOICE, GRACE_VOICE),
  tea: voiceId(process.env.ELEVENLABS_TEA_VOICE, TEA_VOICE),
};

export function pickVoice({
  kind,
  mood,
  gentleness,
}: {
  kind: 'story' | 'tea';
  mood?: string;
  gentleness?: string;
}): { voice: string | undefined; style: string } {
  const voice = kind === 'tea' ? VOICES.tea || VOICES.grace : VOICES.grace;
  const style =
    kind === 'tea'
      ? 'sassy'
      : gentleness === 'Softly'
        ? 'tender'
        : gentleness === 'Directly'
          ? 'bold'
          : mood === 'light'
            ? 'steady'
            : 'default';
  return { voice, style };
}
