import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nonceMatches, sha256Hex } from '../src/services/appleAuthService.js';

describe('appleAuthService nonce', () => {
  it('accepts a direct hash match (native iOS flow)', () => {
    const hash = sha256Hex('test-raw-nonce');
    assert.equal(nonceMatches(hash, hash), true);
  });

  it('accepts sha256(raw) when the client sent the raw nonce by mistake', () => {
    const raw = 'test-raw-nonce';
    const hash = sha256Hex(raw);
    assert.equal(nonceMatches(hash, raw), true);
  });

  it('rejects a mismatched nonce', () => {
    assert.equal(nonceMatches('aaaa', 'bbbb'), false);
  });
});
