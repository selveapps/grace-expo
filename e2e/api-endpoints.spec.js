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

  test('GET /stories', async ({ request }) => {
    const res = await request.get(`${API}/stories`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.stories.length).toBeGreaterThan(0);
    expect(body.featured.id).toBeTruthy();
  });

  test('POST /ai/stories/:id/narrative', async ({ request }) => {
    const auth = await apiGuest(request);
    const res = await request.post(`${API}/ai/stories/mary-annunciation/narrative`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { part: 1 },
      timeout: 60000,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.content.length).toBeGreaterThan(50);
  });

  test('POST /ai/reminder', async ({ request }) => {
    const auth = await apiGuest(request);
    const res = await request.post(`${API}/ai/reminder`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { type: 'morning', morningTime: '07:00' },
      timeout: 60000,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.notification.length).toBeGreaterThan(0);
  });

  test('POST /ai/support', async ({ request }) => {
    const auth = await apiGuest(request);
    const res = await request.post(`${API}/ai/support`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { category: 'Feedback', message: 'Love the app so far.' },
      timeout: 60000,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.reply.length).toBeGreaterThan(20);
  });

  test('GET /docs/json (OpenAPI)', async ({ request }) => {
    const res = await request.get(`${API}/docs/json`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.openapi).toMatch(/^3\./);
    expect(body.paths['/health']).toBeTruthy();
    expect(body.paths['/ai/support']).toBeTruthy();
    expect(body.paths['/today']).toBeTruthy();
    expect(body.paths['/stories/progress']).toBeTruthy();
  });

  test('GET /today', async ({ request }) => {
    const auth = await apiGuest(request);
    const res = await request.get(`${API}/today`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.dailyVerse.ref).toBeTruthy();
    expect(body.recommendedStory.id).toBeTruthy();
  });

  test('PUT/GET /stories/progress', async ({ request }) => {
    const auth = await apiGuest(request);
    const token = auth.token;
    const put = await request.put(`${API}/stories/progress/mary-annunciation`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { seconds: 120, completed: false },
    });
    expect(put.ok()).toBeTruthy();

    const list = await request.get(`${API}/stories/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(list.ok()).toBeTruthy();
    const prog = await list.json();
    expect(prog.some((p) => p.storyId === 'mary-annunciation' && p.seconds === 120)).toBeTruthy();
  });
});
