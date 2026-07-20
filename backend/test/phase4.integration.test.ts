import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { checkDatabase } from '../src/db.js';

describe('Phase 4 — scripture search (SEL-13)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  before(async () => {
    assert.ok(await checkDatabase());
    app = await buildApp();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('empty query returns empty arrays', async () => {
    const res = await app.inject({ method: 'GET', url: '/bible/search?q=' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { ot: unknown[]; nt: unknown[] };
    assert.deepEqual(body, { ot: [], nt: [] });
  });

  it('?q=peace returns OT and NT hits', async () => {
    const res = await app.inject({ method: 'GET', url: '/bible/search?q=peace' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { ot: { ref: string; text: string }[]; nt: { ref: string; text: string }[] };
    assert.ok(body.nt.length > 0, 'Philippians 4:6-7 contains peace');
    assert.ok(body.nt[0].ref && body.nt[0].text);
  });

  it('search responds under 500ms on sample data', async () => {
    const start = Date.now();
    const res = await app.inject({ method: 'GET', url: '/bible/search?q=God' });
    const ms = Date.now() - start;
    assert.equal(res.statusCode, 200);
    assert.ok(ms < 500, `took ${ms}ms`);
  });
});
