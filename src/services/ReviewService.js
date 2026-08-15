// ReviewService — records App Store review prompts so we never ask twice in a
// 90-day window and never after a completed review. Every call fails silently:
// a review prompt must never block or interrupt the user, online or offline.
import { api } from '../api/client';
import { AuthService } from './AuthService';
import { StorageService, KEYS } from './StorageService';

async function record(surface, action) {
  // Keep a local copy so the policy still holds offline.
  const log = await StorageService.get(KEYS.reviewPrompts, []);
  const entry = { surface, action, at: Date.now() };
  await StorageService.set(KEYS.reviewPrompts, [...log, entry].slice(-20));
  try {
    await AuthService.ensureGuest();
    await api.post('/review/event', { surface, action });
  } catch {
    // offline, or not signed in yet — the local log is enough
  }
  return entry;
}

export const ReviewService = {
  async shouldAsk() {
    try {
      const { data } = await api.get('/review/should-ask');
      return !!data.ask;
    } catch {
      const log = await StorageService.get(KEYS.reviewPrompts, []);
      const last = log[log.length - 1];
      if (!last) return true;
      if (last.action === 'completed') return false;
      return (Date.now() - last.at) / 86400000 > 90;
    }
  },
  markPrompted(surface) { return record(surface, 'prompted'); },
  markDeclined(surface) { return record(surface, 'declined'); },
  markCompleted(surface) { return record(surface, 'completed'); },
};
