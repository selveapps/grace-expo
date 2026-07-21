import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { FastifyInstance } from 'fastify';

const audioDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public/audio');

export async function registerAudioRoutes(app: FastifyInstance) {
  app.get('/audio/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string };
    if (!/^[\w-]+\.mp3$/.test(filename)) {
      return reply.code(400).send({ error: 'Invalid audio filename' });
    }
    try {
      const buf = await readFile(path.join(audioDir, filename));
      return reply
        .header('Content-Type', 'audio/mpeg')
        .header('Cache-Control', 'public, max-age=86400')
        .send(buf);
    } catch {
      return reply.code(404).send({ error: 'Audio not found' });
    }
  });
}
