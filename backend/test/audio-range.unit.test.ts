// Byte-range serving for /audio/:filename. No database, so this runs anywhere.
//
// Why this is worth a test: iOS AVFoundation decides whether a remote track is
// seekable from the range headers. When this route answered every request with
// a plain 200, the player never resolved a duration (it displayed -0:00) and
// setPositionAsync had nothing to seek against, so the ±15s controls did
// nothing. These assertions are the contract that keeps that from regressing.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Fastify, { type FastifyInstance } from 'fastify';
import { registerAudioRoutes } from '../src/routes/audio.js';

const FIXTURE = 'ruth-stays-part-1.mp3';
const audioPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/audio',
  FIXTURE,
);

describe('GET /audio/:filename byte ranges', () => {
  let app: FastifyInstance;
  let size: number;

  before(async () => {
    size = statSync(audioPath).size;
    app = Fastify({ logger: false });
    await registerAudioRoutes(app);
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  test('a plain request advertises range support and a real length', async () => {
    const res = await app.inject({ method: 'GET', url: `/audio/${FIXTURE}` });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['accept-ranges'], 'bytes');
    assert.equal(res.headers['content-type'], 'audio/mpeg');
    assert.equal(res.headers['content-length'], String(size));
  });

  // The probe AVFoundation actually sends before it will treat audio as seekable.
  test('the two-byte probe returns 206 with a Content-Range', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/audio/${FIXTURE}`,
      headers: { range: 'bytes=0-1' },
    });
    assert.equal(res.statusCode, 206);
    assert.equal(res.headers['content-range'], `bytes 0-1/${size}`);
    assert.equal(res.headers['content-length'], '2');
    assert.equal(res.rawPayload.length, 2);
  });

  test('an open-ended range runs to the last byte', async () => {
    const start = size - 128;
    const res = await app.inject({
      method: 'GET',
      url: `/audio/${FIXTURE}`,
      headers: { range: `bytes=${start}-` },
    });
    assert.equal(res.statusCode, 206);
    assert.equal(res.headers['content-range'], `bytes ${start}-${size - 1}/${size}`);
    assert.equal(res.rawPayload.length, 128);
  });

  test('a suffix range returns the tail', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/audio/${FIXTURE}`,
      headers: { range: 'bytes=-64' },
    });
    assert.equal(res.statusCode, 206);
    assert.equal(res.headers['content-range'], `bytes ${size - 64}-${size - 1}/${size}`);
    assert.equal(res.rawPayload.length, 64);
  });

  test('a range past the end is refused with 416, not a silent full body', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/audio/${FIXTURE}`,
      headers: { range: `bytes=${size + 10}-${size + 20}` },
    });
    assert.equal(res.statusCode, 416);
    assert.equal(res.headers['content-range'], `bytes */${size}`);
  });

  test('an unparseable or non-bytes range falls back to the whole file', async () => {
    for (const range of ['items=0-1', 'bytes=abc-def', 'bytes=-']) {
      const res = await app.inject({
        method: 'GET',
        url: `/audio/${FIXTURE}`,
        headers: { range },
      });
      assert.equal(res.statusCode, 200, range);
      assert.equal(res.headers['content-length'], String(size), range);
    }
  });

  test('a missing file is still a 404 and a bad name is still a 400', async () => {
    const missing = await app.inject({ method: 'GET', url: '/audio/not-here.mp3' });
    assert.equal(missing.statusCode, 404);

    const bad = await app.inject({ method: 'GET', url: '/audio/..%2Fsecret.mp3' });
    assert.equal(bad.statusCode, 400);
  });
});
