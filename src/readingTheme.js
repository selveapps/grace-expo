// Reader palette, shared by every Reading screen so a theme change is not
// limited to the chapter view. Keys match profile.readingTheme.
import { colors } from './theme';

export const READING_THEMES = {
  light: { key: 'light', label: 'Light', bg: '#FFFDF9', ink: colors.ink, sub: colors.textMuted, line: colors.sandLine, bar: colors.textMuted, card: colors.white },
  sepia: { key: 'sepia', label: 'Sepia', bg: '#F3E9D6', ink: colors.ink, sub: colors.textMuted, line: colors.sepiaLine, bar: colors.textMuted, card: '#FBF4E4' },
  night: { key: 'night', label: 'Night', bg: '#2B2015', ink: '#F3E9D6', sub: '#C9B99B', line: '#3E3020', bar: '#C9B99B', card: '#3A2C1E' },
};

export const FONT_STEPS = [0.9, 1, 1.15, 1.3];
export const FONT_LABEL = { 0.9: 'S', 1: 'M', 1.15: 'L', 1.3: 'XL' };

/** Resolve the active reader theme from a profile, defaulting to sepia. */
export function readingTheme(profile) {
  return READING_THEMES[profile?.readingTheme] ?? READING_THEMES.sepia;
}
