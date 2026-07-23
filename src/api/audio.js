// Download story audio to device cache (auth required for TTS endpoint).
import * as FileSystem from 'expo-file-system';
import { getSession } from './session';
import { getApiBase } from './client';

// Resolve a static narration URL, tolerating the real (.mp3) vs placeholder (.m4a)
// formats. Tries the given path first (real render), then the .m4a fallback.
// Returns the first URL that responds 200, or null if none do.
export async function resolveStaticAudioUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  const base = pathOrUrl.startsWith('http') ? pathOrUrl : `${getApiBase()}${pathOrUrl}`;
  const candidates = [base];
  if (/\.mp3$/i.test(base)) candidates.push(base.replace(/\.mp3$/i, '.m4a'));
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return url;
    } catch {
      // network error — try next candidate
    }
  }
  return null;
}

export async function getStoryAudioUri(storyId, part = 1, { force = false } = {}) {
  const dest = `${FileSystem.cacheDirectory}grace-audio-${storyId}-p${part}.mp3`;
  if (!force) {
    const info = await FileSystem.getInfoAsync(dest);
    if (info.exists && info.size > 1024) return dest;
  }

  const session = await getSession();
  if (!session?.accessToken) throw new Error('Not signed in');

  const url = `${getApiBase()}/ai/stories/${encodeURIComponent(storyId)}/audio?part=${part}`;
  const result = await FileSystem.downloadAsync(url, dest, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (result.status !== 200) {
    throw new Error(`Audio download failed (${result.status})`);
  }
  return result.uri;
}
