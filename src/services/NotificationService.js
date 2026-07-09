// NotificationService — reminder scheduling. Uses expo-notifications if present,
// otherwise persists the preference and no-ops the scheduling (Expo Go safe).
// UI reads permission/status from here; a dev build wires real local notifications.
import { StorageService, KEYS } from './StorageService';

let Notifications = null;
try { Notifications = require('expo-notifications'); } catch { Notifications = null; }

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
    return StorageService.get(KEYS.reminders, { type: 'morning', morningTime: '07:00', eveningTime: '21:00', enabled: false });
  },

  async scheduleReminder(pref) {
    await StorageService.set(KEYS.reminders, { ...pref, enabled: pref.type !== 'off' });
    if (!Notifications || pref.type === 'off') return { scheduled: false };
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      const times = [];
      if (pref.type === 'morning' || pref.type === 'both') times.push(pref.morningTime);
      if (pref.type === 'evening' || pref.type === 'both') times.push(pref.eveningTime);
      for (const t of times) {
        const [h, m] = t.split(':').map(Number);
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Grace', body: 'Your quiet place is ready.' },
          trigger: { hour: h, minute: m, repeats: true },
        });
      }
      return { scheduled: true, count: times.length };
    } catch { return { scheduled: false }; }
  },

  async cancelReminders() {
    const pref = await this.getPreference();
    await StorageService.set(KEYS.reminders, { ...pref, type: 'off', enabled: false });
    if (Notifications) { try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {} }
  },
};
