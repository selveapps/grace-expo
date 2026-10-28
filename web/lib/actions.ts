'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { grace, writeSession, clearSession } from './grace';
import { profilePatch, type OnboardingDraft } from './onboarding';

type GuestResponse = {
  session: { accessToken: string; refreshToken: string; expiresIn?: number };
};

export async function ensureGuest() {
  const data = await grace<GuestResponse>('/auth/guest', {
    method: 'POST',
    body: JSON.stringify({ deviceId: `web-${randomUUID()}` }),
    cache: 'no-store',
  }, false);
  await writeSession(data.session);
}

export async function finishOnboarding(draft: OnboardingDraft) {
  await grace('/me', { method: 'PATCH', body: JSON.stringify(profilePatch(draft)), cache: 'no-store' });
  const word = draft.reflection.trim();
  if (word) {
    await grace('/reflections', {
      method: 'POST',
      body: JSON.stringify({ word, note: draft.carrying.join(', ') }),
      cache: 'no-store',
    });
  }
  revalidatePath('/today');
  redirect('/today');
}

export async function signOut() {
  await clearSession();
  redirect('/');
}

export async function saveVerse(ref: string, text: string) {
  await grace('/saved', { method: 'POST', body: JSON.stringify({ ref, text }), cache: 'no-store' });
  revalidatePath('/you/saved');
}

export async function removeVerse(ref: string) {
  await grace(`/saved/${encodeURIComponent(ref)}`, { method: 'DELETE', cache: 'no-store' });
  revalidatePath('/you/saved');
}

export async function addReflection(word: string, note: string, ref: string) {
  await grace('/reflections', {
    method: 'POST',
    body: JSON.stringify({ word, note, ref: ref || undefined }),
    cache: 'no-store',
  });
  revalidatePath('/you/reflections');
}

export async function rememberChapter(book: string, chapter: number) {
  try {
    await grace('/progress', {
      method: 'PUT',
      body: JSON.stringify({ book, chapter, position: 0 }),
      cache: 'no-store',
    });
  } catch {
    // A public reader with no session can still read the chapter.
  }
}

export async function rememberStory(storyId: string) {
  try {
    await grace(`/stories/progress/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify({ seconds: 1, completed: false }),
      cache: 'no-store',
    });
  } catch {
    // Listening still works without a session.
  }
}

export async function saveTea(id: string) {
  await grace(`/tea/${id}/save`, { method: 'POST', cache: 'no-store' });
  revalidatePath('/tea');
}

export async function redeemCode(code: string): Promise<string> {
  await grace('/beta/redeem', { method: 'POST', body: JSON.stringify({ code }), cache: 'no-store' });
  revalidatePath('/you/subscription');
  return 'Code accepted.';
}

export async function askReminder(type: string): Promise<string> {
  const data = await grace<{ preview?: string; notification?: string }>('/ai/reminder', {
    method: 'POST',
    body: JSON.stringify({ type }),
    cache: 'no-store',
  });
  return data.preview || data.notification || 'Reminder saved.';
}

export async function askSupport(message: string, category: string): Promise<string> {
  const data = await grace<{ reply?: string }>('/ai/support', {
    method: 'POST',
    body: JSON.stringify({ message, category }),
    cache: 'no-store',
  });
  return data.reply || 'Received.';
}
