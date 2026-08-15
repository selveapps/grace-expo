import { readFile, stat } from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { FastifyInstance } from 'fastify';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public');
const audioDir = path.join(publicDir, 'audio');
const teaImageDir = path.join(publicDir, 'img/tea');

const IMAGE_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// Real TTS renders are .mp3; key-free placeholder narration is .m4a (AAC). Both
// are valid; the app requests .mp3 first and falls back to .m4a.
const CONTENT_TYPE: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
};

/**
 * Parse a single-range `Range: bytes=a-b` header against a known size.
 * Returns null for absent/!bytes/multi-range headers so the caller falls back to
 * a normal 200, and 'unsatisfiable' when the range sits outside the file.
 */
function parseRange(header: string | undefined, size: number):
  { start: number; end: number } | 'unsatisfiable' | null {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;
  const [, rawStart, rawEnd] = m;
  if (rawStart === '' && rawEnd === '') return null;

  let start: number;
  let end: number;
  if (rawStart === '') {
    // Suffix form: the last N bytes.
    const suffix = Number(rawEnd);
    if (!Number.isFinite(suffix) || suffix <= 0) return 'unsatisfiable';
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === '' ? size - 1 : Number(rawEnd);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start >= size || start > end) return 'unsatisfiable';
  return { start, end: Math.min(end, size - 1) };
}

export async function registerAudioRoutes(app: FastifyInstance) {
  // Served with byte-range support on purpose. iOS AVFoundation (expo-av) probes
  // a remote track with `Range: bytes=0-1` before it will treat the resource as
  // seekable. This route used to ignore Range and always return the whole body
  // with a 200, so AVPlayer classed every story as a non-seekable stream: it
  // never resolved durationMillis (the player showed -0:00) and setPositionAsync
  // had nothing to seek against, which is why ±15s did nothing.
  app.get('/audio/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string };
    const match = /^[\w-]+\.(mp3|m4a|wav)$/.exec(filename);
    if (!match) {
      return reply.code(400).send({ error: 'Invalid audio filename' });
    }

    const filePath = path.join(audioDir, filename);
    let size: number;
    try {
      const info = await stat(filePath);
      if (!info.isFile()) throw new Error('not a file');
      size = info.size;
    } catch {
      return reply.code(404).send({ error: 'Audio not found' });
    }

    const contentType = CONTENT_TYPE[match[1]];
    reply
      .header('Content-Type', contentType)
      .header('Cache-Control', 'public, max-age=86400')
      .header('Accept-Ranges', 'bytes');

    const range = parseRange(req.headers.range, size);

    if (range === 'unsatisfiable') {
      // The audio content-type was already set above; the error body is JSON, so
      // put it back or Fastify fails to serialize an object as audio/mpeg.
      return reply
        .code(416)
        .header('Content-Type', 'application/json; charset=utf-8')
        .header('Content-Range', `bytes */${size}`)
        .send({ error: 'Range not satisfiable' });
    }

    if (range) {
      const { start, end } = range;
      return reply
        .code(206)
        .header('Content-Range', `bytes ${start}-${end}/${size}`)
        .header('Content-Length', String(end - start + 1))
        .send(createReadStream(filePath, { start, end }));
    }

    return reply
      .header('Content-Length', String(size))
      .send(createReadStream(filePath));
  });

  // Tea card art. Mirrors /audio. A 404 here is expected until the 30 stills
  // land: the app falls back to a deterministic gradient, never a broken image.
  app.get('/img/tea/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string };
    const match = /^[\w-]+\.(jpg|jpeg|png|webp)$/.exec(filename);
    if (!match) {
      return reply.code(400).send({ error: 'Invalid image filename' });
    }
    try {
      const buf = await readFile(path.join(teaImageDir, filename));
      return reply
        .header('Content-Type', IMAGE_TYPE[match[1]])
        .header('Cache-Control', 'public, max-age=604800')
        .send(buf);
    } catch {
      return reply.code(404).send({ error: 'Image not found' });
    }
  });
}
