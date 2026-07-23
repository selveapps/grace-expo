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

// Named voices, chosen by content. Defaults are ElevenLabs premade voices (stable
// public ids) so narration works out of the box; override per env for a custom
// brand voice. "Grace" = gentle US narrator; "Domi" = strong/confident for Tea sass.
const GRACE_VOICE = 'oWAxZDx7w5VEj9dCyTzz'; // premade "Grace"
const TEA_VOICE = 'AZnzlk1XvdvUeBnXmlld'; // premade "Domi"

export const VOICES: Record<string, string | undefined> = {
  grace: process.env.ELEVENLABS_DEFAULT_VOICE || GRACE_VOICE, // warm primary narrator
  tea: process.env.ELEVENLABS_TEA_VOICE || TEA_VOICE, // brighter/sassier for Tea
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
