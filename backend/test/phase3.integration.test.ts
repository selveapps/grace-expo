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
  assert.equal(res.statusCode, 200);
  return (res.json() as { session: { accessToken: string } }).session.accessToken;
}

describe('Phase 3 — profile & library CRUD (SEL-14)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const deviceId = `phase3-crud-${Date.now()}`;
  let token: string;

  before(async () => {
    assert.ok(await checkDatabase());
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
    app = await buildApp();
    await app.ready();
    token = await guestToken(app, deviceId);
  });

  after(async () => {
    await app.close();
  });

  it('PATCH /me updates name and profile fields', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/me',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: 'Grace',
        carrying: ['Hope'],
        gentleness: 'Soft',
        rhythm: 'Morning',
        onboarded: true,
      },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { user: { name: string }; profile: { carrying: string[]; onboarded: boolean } };
    assert.equal(body.user.name, 'Grace');
    assert.deepEqual(body.profile.carrying, ['Hope']);
    assert.equal(body.profile.onboarded, true);
  });

  it('full guest → save → list → delete flow', async () => {
    const save = await app.inject({
      method: 'POST',
      url: '/saved',
      headers: { authorization: `Bearer ${token}` },
      payload: { ref: 'Psalm 23:1', text: 'The Lord is my shepherd' },
    });
    assert.equal(save.statusCode, 201);

    const list = await app.inject({
      method: 'GET',
      url: '/saved',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(list.statusCode, 200);
    const saved = list.json() as { ref: string; text: string }[];
    assert.equal(saved.length, 1);
    assert.equal(saved[0].ref, 'Psalm 23:1');

    const del = await app.inject({
      method: 'DELETE',
      url: '/saved/Psalm%2023:1',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(del.statusCode, 204);

    const list2 = await app.inject({
      method: 'GET',
      url: '/saved',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal((list2.json() as unknown[]).length, 0);
  });

  it('POST /reflections and GET /reflections', async () => {
    const post = await app.inject({
      method: 'POST',
      url: '/reflections',
      headers: { authorization: `Bearer ${token}` },
      payload: { word: 'Hope', note: 'Quiet morning', ref: 'Psalm 23:1' },
    });
    assert.equal(post.statusCode, 201);
    const created = post.json() as { id: string; word: string };
    assert.ok(created.id);
    assert.equal(created.word, 'Hope');

    const list = await app.inject({
      method: 'GET',
      url: '/reflections',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(list.statusCode, 200);
    const rows = list.json() as { id: string }[];
    assert.ok(rows.some((r) => r.id === created.id));
  });

  it('PUT /progress and GET /progress', async () => {
    const put = await app.inject({
      method: 'PUT',
      url: '/progress',
      headers: { authorization: `Bearer ${token}` },
      payload: { book: 'Psalms', chapter: 23, position: 0.5 },
    });
    assert.equal(put.statusCode, 200);

    const list = await app.inject({
      method: 'GET',
      url: '/progress',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(list.statusCode, 200);
    const rows = list.json() as { book: string; chapter: number; position: number }[];
    assert.equal(rows[0].book, 'Psalms');
    assert.equal(rows[0].chapter, 23);
    assert.equal(rows[0].position, 0.5);
  });
});
