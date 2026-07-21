import { StorageService, KEYS } from '../services/StorageService';

export async function getSession() {
  return StorageService.get(KEYS.session, null);
}

export async function setSession(session) {
  return StorageService.set(KEYS.session, session);
}

export async function clearSession() {
  return StorageService.remove(KEYS.session);
}

export async function getDeviceId() {
  let id = await StorageService.get(KEYS.deviceId, null);
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    await StorageService.set(KEYS.deviceId, id);
  }
  return id;
}
