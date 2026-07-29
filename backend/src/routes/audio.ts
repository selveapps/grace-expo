import { readFile } from 'fs/promises';
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

export async function registerAudioRoutes(app: FastifyInstance) {
  app.get('/audio/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string };
    const match = /^[\w-]+\.(mp3|m4a|wav)$/.exec(filename);
    if (!match) {
      return reply.code(400).send({ error: 'Invalid audio filename' });
    }
    try {
      const buf = await readFile(path.join(audioDir, filename));
      return reply
        .header('Content-Type', CONTENT_TYPE[match[1]])
        .header('Cache-Control', 'public, max-age=86400')
        .send(buf);
    } catch {
      return reply.code(404).send({ error: 'Audio not found' });
    }
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
