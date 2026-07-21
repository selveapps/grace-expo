// Download story audio to device cache (auth required for TTS endpoint).
import * as FileSystem from 'expo-file-system';
import { getSession } from './session';
import { getApiBase } from './client';

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
