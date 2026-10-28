import { describe, expect, it } from 'vitest';
import { canContinueCarry, profilePatch, toggleCarry } from './onboarding';

describe('onboarding', () => {
  it('requires at least one thing being carried', () => {
    expect(canContinueCarry([])).toBe(false);
    expect(canContinueCarry(['Hope'])).toBe(true);
  });

  it('toggles a carrying chip', () => {
    expect(toggleCarry(['Hope'], 'Worry')).toEqual(['Hope', 'Worry']);
    expect(toggleCarry(['Hope', 'Worry'], 'Hope')).toEqual(['Worry']);
  });

  it('sends the same profile fields the mobile app writes', () => {
    expect(profilePatch({
      name: ' Mara ',
      carrying: ['Worry', 'Hope'],
      gentleness: 'Steadily',
      rhythm: 'evening',
      reflection: 'Trust',
    })).toEqual({
      name: 'Mara',
      carrying: ['Worry', 'Hope'],
      gentleness: 'Steadily',
      rhythm: 'evening',
      onboarded: true,
    });
  });

  it('maps choose-later onto the morning rhythm the API already stores', () => {
    expect(profilePatch({
      name: '',
      carrying: ['Rest'],
      gentleness: 'Softly',
      rhythm: 'later',
      reflection: 'Peace',
    }).rhythm).toBe('morning');
  });
});
