import { describe, expect, it } from 'vitest';
import { normalizeTypeSize, typeSizeBootScript, verseFontSize } from './typeSize';

describe('type size', () => {
  it('keeps the four mobile scales and falls back to medium', () => {
    expect(normalizeTypeSize('xl')).toBe('xl');
    expect(normalizeTypeSize(null)).toBe('m');
    expect(normalizeTypeSize('night')).toBe('m');
    expect(parseFloat(verseFontSize('s'))).toBeCloseTo(15.3);
    expect(verseFontSize(undefined)).toBe('17px');
    expect(parseFloat(verseFontSize('l'))).toBeCloseTo(19.55);
    expect(parseFloat(verseFontSize('xl'))).toBeCloseTo(22.1);
  });

  it('boots from local storage and does not call the API', () => {
    const script = typeSizeBootScript();
    expect(script).toContain('grace.typeSize');
    expect(script).toContain('"xl":1.3');
    expect(script).not.toContain('/me');
    expect(script).not.toContain('fetch');
  });
});
