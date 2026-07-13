import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { checkDatabase } from '../src/db.js';
import { dailyVerseRef } from '../src/lib/scriptureMeta.js';

describe('Phase 2 — scripture HTTP (SEL-12)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  before(async () => {
    assert.ok(await checkDatabase(), 'DATABASE_URL must be reachable');
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
    app = await buildApp();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('GET /bible/psalms/23 returns 6 verses', async () => {
    const res = await app.inject({ method: 'GET', url: '/bible/psalms/23' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { reference: string; verses: { n: number; t: string }[] };
    assert.equal(body.verses.length, 6);
    assert.match(body.reference, /Psalm 23/i);
    assert.ok(body.verses[0].t.toLowerCase().includes('shepherd'));
  });

  it('GET /bible/passage?ref=John+3:16 returns text', async () => {
    const res = await app.inject({ method: 'GET', url: '/bible/passage?ref=John+3:16' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { ref: string; text: string };
    assert.match(body.ref, /John 3:16/);
    assert.ok(body.text.length > 10);
  });

  it('GET /today/verse is stable for UTC day', async () => {
    const fixed = Date.UTC(2026, 6, 13);
    const res1 = await app.inject({
      method: 'GET',
      url: `/today/verse`,
      headers: {},
    });
    assert.equal(res1.statusCode, 200);
    const expectedRef = dailyVerseRef(fixed);
    assert.equal(dailyVerseRef(fixed), expectedRef);
    const body = res1.json() as { ref: string; text: string };
    assert.ok(body.ref);
    assert.ok(body.text);
  });

  it('GET /verse/for-carrying?tags=Worry maps to Philippians', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/verse/for-carrying?tags=Worry,Hope',
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { ref: string; text: string };
    assert.match(body.ref, /Philippians 4:6/i);
  });

  it('GET /bible/unknown/99 returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/bible/unknown/99' });
    assert.equal(res.statusCode, 404);
  });
});

describe('Phase 2 — guest JWT auth (SEL-10)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const deviceId = `phase2-test-${Date.now()}`;

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
    app = await buildApp();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('POST /auth/guest creates session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/guest',
      payload: { deviceId },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { session: { accessToken: string; refreshToken: string }; user: { id: string } };
    assert.ok(body.session.accessToken);
    assert.ok(body.session.refreshToken);
    assert.ok(body.user.id);
  });

  it('same deviceId returns same user id', async () => {
    const a = await app.inject({ method: 'POST', url: '/auth/guest', payload: { deviceId } });
    const b = await app.inject({ method: 'POST', url: '/auth/guest', payload: { deviceId } });
    const idA = (a.json() as { user: { id: string } }).user.id;
    const idB = (b.json() as { user: { id: string } }).user.id;
    assert.equal(idA, idB);
  });

  it('GET /me returns 401 without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/me' });
    assert.equal(res.statusCode, 401);
  });

  it('GET /me returns user with valid token', async () => {
    const login = await app.inject({
      method: 'POST',
      url: '/auth/guest',
      payload: { deviceId: `me-test-${Date.now()}` },
    });
    const token = (login.json() as { session: { accessToken: string } }).session.accessToken;
    const res = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { user: { id: string }; profile: object };
    assert.ok(body.user.id);
    assert.ok(body.profile);
  });

  it('POST /auth/refresh returns new session', async () => {
    const login = await app.inject({
      method: 'POST',
      url: '/auth/guest',
      payload: { deviceId: `refresh-test-${Date.now()}` },
    });
    const refresh = (login.json() as { session: { refreshToken: string } }).session.refreshToken;
    const res = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refresh },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { session: { accessToken: string } };
    assert.ok(body.session.accessToken);
  });
});
