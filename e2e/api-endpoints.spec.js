// @ts-check
const { test, expect } = require('@playwright/test');
const { apiGuest } = require('./helpers');

const API = 'http://127.0.0.1:3000';

test.describe('Backend API — all endpoints callable', () => {
  test('GET /health', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.db).toBe(true);
  });

  test('GET /bible/psalms/23', async ({ request }) => {
    const res = await request.get(`${API}/bible/psalms/23`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.verses.length).toBeGreaterThan(0);
  });

  test('GET /bible/passage', async ({ request }) => {
    const res = await request.get(`${API}/bible/passage?ref=John+3:16`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.text).toContain('God');
  });

  test('GET /today/verse', async ({ request }) => {
    const res = await request.get(`${API}/today/verse`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ref).toBeTruthy();
    expect(body.text).toBeTruthy();
  });

  test('GET /verse/for-carrying', async ({ request }) => {
    const res = await request.get(`${API}/verse/for-carrying?tags=Worry`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.text).toBeTruthy();
  });

  test('GET /bible/search', async ({ request }) => {
    const res = await request.get(`${API}/bible/search?q=peace`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.nt.length + body.ot.length).toBeGreaterThan(0);
  });

  test('GET /me + PATCH /me', async ({ request }) => {
    const auth = await apiGuest(request);
    const token = auth.token;
    const me = await request.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(me.ok()).toBeTruthy();

    const patch = await request.patch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'E2E User', carrying: ['Hope'], onboarded: true },
    });
    expect(patch.ok()).toBeTruthy();
    const body = await patch.json();
    expect(body.profile.carrying).toContain('Hope');
  });

  test('POST/GET/DELETE /saved', async ({ request }) => {
    const auth = await apiGuest(request);
    const token = auth.token;
    const post = await request.post(`${API}/saved`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { ref: 'John 3:16', text: 'For God so loved the world' },
    });
    expect(post.status()).toBe(201);

    const list = await request.get(`${API}/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(list.ok()).toBeTruthy();
    const saved = await list.json();
    expect(saved.some((v) => v.ref === 'John 3:16')).toBeTruthy();

    const del = await request.delete(`${API}/saved/John%203:16`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(del.status()).toBe(204);
  });

  test('POST/GET /reflections', async ({ request }) => {
    const auth = await apiGuest(request);
    const token = auth.token;
    const post = await request.post(`${API}/reflections`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { word: 'peace', note: 'e2e test', ref: 'John 14:27' },
    });
    expect(post.status()).toBe(201);

    const list = await request.get(`${API}/reflections`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(list.ok()).toBeTruthy();
    const rows = await list.json();
    expect(rows.some((r) => r.word === 'peace')).toBeTruthy();
  });

  test('PUT/GET /progress', async ({ request }) => {
    const auth = await apiGuest(request);
    const token = auth.token;
    const put = await request.put(`${API}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { book: 'Psalms', chapter: 23, position: 1 },
    });
    expect(put.ok()).toBeTruthy();

    const list = await request.get(`${API}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(list.ok()).toBeTruthy();
    const prog = await list.json();
    expect(prog.some((p) => p.book === 'Psalms' && p.chapter === 23)).toBeTruthy();
  });

  test('POST /beta/redeem', async ({ request }) => {
    const auth = await apiGuest(request);
    const res = await request.post(`${API}/beta/redeem`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { code: 'grace-beta' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.subscribed).toBe(true);

    const me = await request.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const profile = (await me.json()).profile;
    expect(profile.subscribed).toBe(true);
  });

  test('POST /auth/refresh', async ({ request }) => {
    const auth = await apiGuest(request);
    const res = await request.post(`${API}/auth/refresh`, {
      data: { refresh: auth.refresh },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.session.accessToken).toBeTruthy();
  });
});
