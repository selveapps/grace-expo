import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { checkDatabase } from '../src/db.js';

async function guestToken(app: Awaited<ReturnType<typeof buildApp>>, deviceId: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/guest',
    payload: { deviceId },
  });
  return (res.json() as { session: { accessToken: string } }).session.accessToken;
}

describe('Phase 5 — beta entitlement (SEL-16)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const deviceId = `phase5-beta-${Date.now()}`;
  let token: string;

  before(async () => {
    assert.ok(await checkDatabase());
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
    process.env.BETA_REDEEM_CODE = 'grace-beta';
    app = await buildApp();
    await app.ready();
    token = await guestToken(app, deviceId);
  });

  after(async () => {
    await app.close();
  });

  it('new user defaults to subscribed false', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: `Bearer ${token}` },
    });
    const body = res.json() as { profile: { subscribed: boolean } };
    assert.equal(body.profile.subscribed, false);
  });

  it('POST /beta/redeem with valid code sets subscribed true', async () => {
    const redeem = await app.inject({
      method: 'POST',
      url: '/beta/redeem',
      headers: { authorization: `Bearer ${token}` },
      payload: { code: 'grace-beta' },
    });
    assert.equal(redeem.statusCode, 200);
    const body = redeem.json() as { subscribed: boolean; status: string };
    assert.equal(body.subscribed, true);
    assert.equal(body.status, 'trialing');

    const me = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal((me.json() as { profile: { subscribed: boolean } }).profile.subscribed, true);
  });

  it('POST /beta/redeem rejects invalid code', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/beta/redeem',
      headers: { authorization: `Bearer ${token}` },
      payload: { code: 'wrong-code' },
    });
    assert.equal(res.statusCode, 400);
  });
});
