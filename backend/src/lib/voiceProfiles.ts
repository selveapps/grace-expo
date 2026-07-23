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
  sassy: { stability: 0.3, similarity_boost: 0.7, style: 0.7, use_speaker_boost: true, speed: 1.12 }, // Tea — brisk + playful
};

// Named voices (premade ids available on the account). Env overrides win.
const GRACE_VOICE = 'pFZP5JQG7iQjIQuC4Bku'; // "Lily" — British, warm, velvety narrator
const TEA_VOICE = 'FGY2WhTYpPnrIDTdsKH5'; // "Laura" — young, sassy (social-media energy)

export const VOICES: Record<string, string | undefined> = {
  grace: process.env.ELEVENLABS_DEFAULT_VOICE || GRACE_VOICE,
  tea: process.env.ELEVENLABS_TEA_VOICE || TEA_VOICE,
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
