import { describe, expect, it } from 'vitest';
import { FEATURES, featureGaps } from './features';

describe('feature catalog', () => {
  it('covers the mobile tabs and the you stack, each with a ticket', () => {
    expect(featureGaps()).toEqual([]);
    const paths = FEATURES.map((feature) => feature.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const feature of FEATURES) {
      expect(feature.tickets.every((ticket) => /^(SEL|DEC)-\d+$/.test(ticket))).toBe(true);
    }
    expect(paths).toEqual(expect.arrayContaining(['/today', '/reading', '/stories', '/you', '/tea']));
  });
});
