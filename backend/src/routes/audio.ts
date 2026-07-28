import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { FastifyInstance } from 'fastify';

const audioDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public/audio');

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
}
