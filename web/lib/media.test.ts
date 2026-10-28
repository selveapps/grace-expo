import { afterEach, describe, expect, it } from 'vitest';
import { absoluteApiUrl, resolveAudioUrl } from './media';

describe('media urls', () => {
  const previous = process.env.GRACE_API_BASE;

  afterEach(() => {
    if (previous === undefined) delete process.env.GRACE_API_BASE;
    else process.env.GRACE_API_BASE = previous;
  });

  it('prefixes relative audio paths with the API origin', () => {
    process.env.GRACE_API_BASE = 'https://grace-api-production.up.railway.app/';
    expect(absoluteApiUrl('/audio/ruth-stays-part-1.mp3')).toBe(
      'https://grace-api-production.up.railway.app/audio/ruth-stays-part-1.mp3',
    );
  });

  it('leaves absolute urls alone and fills the part token', () => {
    expect(absoluteApiUrl('https://cdn.example/a.mp3')).toBe('https://cdn.example/a.mp3');
    expect(absoluteApiUrl(null)).toBeNull();
    process.env.GRACE_API_BASE = 'https://api.example';
    expect(resolveAudioUrl('/audio/ruth-stays-part-{part}.mp3', 2)).toBe(
      'https://api.example/audio/ruth-stays-part-2.mp3',
    );
  });
});
