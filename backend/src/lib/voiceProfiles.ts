// Voice + delivery presets. Maps content signals (kind / mood / gentleness) to
// an ElevenLabs voice id + a voice_settings tuning preset — data-driven so no
// per-content logic is needed. Fill VOICES.* with real ids from your account.

export type VoiceSettings = { stability: number; similarity_boost: number; style: number };

export const VOICE_STYLE: Record<string, VoiceSettings> = {
  default: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
  tender: { stability: 0.65, similarity_boost: 0.8, style: 0.15 }, // Softly / grief / comfort
  steady: { stability: 0.5, similarity_boost: 0.75, style: 0.35 }, // Steadily
  bold: { stability: 0.35, similarity_boost: 0.7, style: 0.6 }, // Directly / Tea sass
};

// Optional named voices, chosen by content. Fill ids from YOUR ElevenLabs library.
export const VOICES: Record<string, string | undefined> = {
  grace: process.env.ELEVENLABS_DEFAULT_VOICE, // warm primary narrator
  tea: process.env.ELEVENLABS_TEA_VOICE, // slightly brighter/sassier for Tea (optional)
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
    gentleness === 'Softly'
      ? 'tender'
      : gentleness === 'Directly'
        ? 'bold'
        : kind === 'tea'
          ? 'bold'
          : mood === 'light'
            ? 'steady'
            : 'default';
  return { voice, style };
}
