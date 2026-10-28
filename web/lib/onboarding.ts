export const CARRY_OPTIONS = [
  'Peace', 'Worry', 'Gratitude', 'Grief', 'Direction', 'Rest', 'Forgiveness', 'Hope',
] as const;

export const REFLECTION_WORDS = ['Peace', 'Trust', 'Stillness', 'Courage', 'Mercy'] as const;

export const GENTLENESS = [
  { key: 'softly', word: 'Softly', blurb: 'Quiet comfort' },
  { key: 'steadily', word: 'Steadily', blurb: 'Grounded encouragement' },
  { key: 'directly', word: 'Directly', blurb: 'Clear guidance' },
] as const;

export const RHYTHM = [
  { key: 'morning', label: 'Morning' },
  { key: 'evening', label: 'Evening' },
  { key: 'both', label: 'Both' },
  { key: 'later', label: "I'll choose later" },
] as const;

export const PLANS = [
  { id: 'grace.yearly', name: 'Annual', price: '$69.99 / year', detail: 'Best value. 3-day free trial, then the price above.' },
  { id: 'grace.monthly', name: 'Monthly', price: '$12.99 / month', detail: '3-day free trial, then the price above.' },
] as const;

export type OnboardingDraft = {
  name: string;
  carrying: string[];
  gentleness: string;
  rhythm: string;
  reflection: string;
};

export function toggleCarry(selected: string[], option: string): string[] {
  return selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
}

export function canContinueCarry(selected: string[]): boolean {
  return selected.length > 0;
}

export function profilePatch(draft: OnboardingDraft) {
  return {
    name: draft.name.trim(),
    carrying: draft.carrying,
    gentleness: draft.gentleness,
    rhythm: draft.rhythm === 'later' ? 'morning' : draft.rhythm,
    onboarded: true,
  };
}
