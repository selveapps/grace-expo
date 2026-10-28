/** Routes the web app must keep. Tickets point at docs/web/TICKETS.md. */
export const FEATURES = [
  { id: 'splash', path: '/', tickets: ['SEL-17'] },
  { id: 'onboarding', path: '/onboarding', tickets: ['SEL-17', 'SEL-14'] },
  { id: 'today', path: '/today', tickets: ['SEL-18'] },
  { id: 'reading', path: '/reading', tickets: ['SEL-12'] },
  { id: 'chapter', path: '/reading/[book]/[chapter]', tickets: ['SEL-12', 'SEL-22'] },
  { id: 'search', path: '/reading/search', tickets: ['SEL-13', 'SEL-20'] },
  { id: 'theme', path: '/reading/themes/[theme]', tickets: ['SEL-12'] },
  { id: 'stories', path: '/stories', tickets: ['SEL-31'] },
  { id: 'story', path: '/stories/[id]', tickets: ['SEL-31'] },
  { id: 'tea', path: '/tea', tickets: ['DEC-014'] },
  { id: 'tea-detail', path: '/tea/[id]', tickets: ['DEC-014'] },
  { id: 'you', path: '/you', tickets: ['SEL-14'] },
  { id: 'saved', path: '/you/saved', tickets: ['SEL-14'] },
  { id: 'reflections', path: '/you/reflections', tickets: ['SEL-14'] },
  { id: 'reminders', path: '/you/reminders', tickets: ['SEL-31'] },
  { id: 'support', path: '/you/support', tickets: ['SEL-31'] },
  { id: 'subscription', path: '/you/subscription', tickets: ['SEL-16', 'SEL-23'] },
  { id: 'settings', path: '/you/settings', tickets: ['SEL-14'] },
] as const;

export function featureGaps(): string[] {
  return FEATURES.filter((feature) => feature.path.length < 1 || feature.tickets.length < 1).map((feature) => feature.id);
}
