import { api } from '../api/client';
import { StorageService, KEYS } from './StorageService';
import { acknowledgeProfile, acknowledgeVerse, enqueue, replayQueue, requestFor } from './offlineQueue';

async function readQueue() {
  const queue = await StorageService.get(KEYS.writeQueue, []);
  return Array.isArray(queue) ? queue : [];
}

async function writeQueue(queue) {
  await StorageService.set(KEYS.writeQueue, queue);
}

export async function enqueueWrite(item) {
  const queue = await readQueue();
  await writeQueue(enqueue(queue, item));
}

export async function acknowledgeProfileWrite(fields) {
  const queue = await readQueue();
  await writeQueue(acknowledgeProfile(queue, fields));
}

export async function acknowledgeVerseWrite(ref) {
  const queue = await readQueue();
  await writeQueue(acknowledgeVerse(queue, ref));
}

export async function loadWriteQueue() {
  return readQueue();
}

export async function replayOfflineQueue() {
  const queue = await readQueue();
  if (!queue.length) return [];
  const remaining = await replayQueue(queue, async (item) => {
    const req = requestFor(item);
    if (!req) return;
    if (req.method === 'PATCH') await api.patch(req.path, req.body);
    else if (req.method === 'POST') await api.post(req.path, req.body);
    else if (req.method === 'DELETE') await api.delete(req.path);
    else throw new Error('Unsupported offline write');
  });
  await writeQueue(remaining);
  return remaining;
}
