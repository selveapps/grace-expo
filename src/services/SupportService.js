// SupportService — LLM-backed support replies via Grace API.
import { api, LLM_REQUEST_OPTS } from '../api/client';

export const SUPPORT_CATEGORIES = ['Billing', 'Account', 'Audio issue', 'Bible reading issue', 'Bug', 'Feedback', 'Content sensitivity', 'Other'];

export const SupportService = {
  async submitTicket({ category, message, email, screenshotUri = null, includeLogs = false }) {
    if (!message || !message.trim()) return { ok: false, error: 'empty' };
    try {
      const { data } = await api.post('/ai/support', {
        category,
        message: message.trim(),
        email: email || null,
      }, LLM_REQUEST_OPTS);
      return {
        ok: true,
        id: data.id,
        category: data.category,
        reply: data.reply,
        email,
        hasAttachment: !!screenshotUri,
        includeLogs,
      };
    } catch (e) {
      return { ok: false, error: e.message || 'network' };
    }
  },
};
