import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  isWebhookAuthorized,
  verifyRevenueCatAuthorization,
  verifyRevenueCatWebhookSignature,
} from '../src/lib/revenuecatWebhook.js';
import { applyRevenueCatWebhookEvent, GRACE_PRODUCT_IDS } from '../src/services/revenueCatService.js';

describe('RevenueCat webhook auth (GRACE-025)', () => {
  it('verifyRevenueCatAuthorization accepts matching Bearer tokens', () => {
    assert.equal(
      verifyRevenueCatAuthorization('Bearer secret-token', 'Bearer secret-token'),
      true,
    );
    assert.equal(verifyRevenueCatAuthorization('wrong', 'Bearer secret-token'), false);
  });

  it('verifyRevenueCatWebhookSignature validates HMAC over timestamp.body', () => {
    const secret = 'signing-secret';
    const body = '{"event":{"type":"TEST"}}';
    const ts = String(Date.now());
    const sig = createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
    const header = `t=${ts},v1=${sig}`;
    assert.equal(verifyRevenueCatWebhookSignature(body, header, secret), true);
    assert.equal(verifyRevenueCatWebhookSignature(body, header, 'other'), false);
  });

  it('isWebhookAuthorized prefers signing secret when configured', () => {
    const secret = 'signing-secret';
    const body = '{"event":{"type":"TEST"}}';
    const ts = String(Date.now());
    const sig = createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
    assert.equal(
      isWebhookAuthorized(
        body,
        { authorization: 'Bearer wrong', signature: `t=${ts},v1=${sig}` },
        { authSecret: 'auth', signingSecret: secret },
      ),
      true,
    );
  });
});

describe('RevenueCat product IDs', () => {
  it('includes Grace Plus ASC identifiers', () => {
    assert.ok(GRACE_PRODUCT_IDS.has('grace.yearly'));
    assert.ok(GRACE_PRODUCT_IDS.has('grace.monthly'));
  });
});

describe('applyRevenueCatWebhookEvent', () => {
  it('is exported for integration tests', () => {
    assert.equal(typeof applyRevenueCatWebhookEvent, 'function');
  });
});
