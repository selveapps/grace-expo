// NotificationService — reminder scheduling with LLM-generated copy from Grace API.
import { api, LLM_REQUEST_OPTS } from '../api/client';
import { StorageService, KEYS } from './StorageService';

let Notifications = null;
try { Notifications = require('expo-notifications'); } catch { Notifications = null; }

async function fetchReminderCopy(pref) {
  try {
    const { data } = await api.post('/ai/reminder', {
      type: pref.type,
      morningTime: pref.morningTime,
      eveningTime: pref.eveningTime,
    }, LLM_REQUEST_OPTS);
    return {
      body: data.notification || 'Your quiet place is ready.',
      preview: data.preview || data.notification || 'Your quiet place is ready.',
    };
  } catch {
    return { body: 'Your quiet place is ready.', preview: 'Your quiet place is ready.' };
  }
}

export const NotificationService = {
  available() { return !!Notifications; },

  async getPermissionStatus() {
    if (!Notifications) return 'unavailable';
    try { const s = await Notifications.getPermissionsAsync(); return s.granted ? 'granted' : s.canAskAgain ? 'undetermined' : 'denied'; }
    catch { return 'unavailable'; }
  },

  async requestPermission() {
    if (!Notifications) return 'unavailable';
    try { const s = await Notifications.requestPermissionsAsync(); return s.granted ? 'granted' : 'denied'; }
    catch { return 'unavailable'; }
  },

  async getPreference() {
    const pref = await StorageService.get(KEYS.reminders, { type: 'morning', morningTime: '07:00', eveningTime: '21:00', enabled: false });
    return { ...pref, preview: pref.preview || null };
  },

  async previewMessage(pref) {
    if (pref.type === 'off') return { body: '', preview: '' };
    return fetchReminderCopy(pref);
  },

  async scheduleReminder(pref) {
    const copy = pref.type === 'off' ? { body: '', preview: '' } : await fetchReminderCopy(pref);
    const stored = {
      ...pref,
      enabled: pref.type !== 'off',
      preview: copy.preview,
      notificationBody: copy.body,
    };
    await StorageService.set(KEYS.reminders, stored);

    if (!Notifications || pref.type === 'off') return { scheduled: false, preview: copy.preview };

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      const times = [];
      if (pref.type === 'morning' || pref.type === 'both') times.push(pref.morningTime);
      if (pref.type === 'evening' || pref.type === 'both') times.push(pref.eveningTime);
      for (const t of times) {
        const [h, m] = t.split(':').map(Number);
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Grace', body: copy.body },
          trigger: { hour: h, minute: m, repeats: true },
        });
      }
      return { scheduled: true, count: times.length, preview: copy.preview };
    } catch {
      return { scheduled: false, preview: copy.preview };
    }
  },

  async cancelReminders() {
    const pref = await this.getPreference();
    await StorageService.set(KEYS.reminders, { ...pref, type: 'off', enabled: false, preview: null });
    if (Notifications) { try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {} }
  },
};
