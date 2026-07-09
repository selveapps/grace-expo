// SupportService — ticket submission. Mocked (resolves after a beat) but shaped for
// a real endpoint. Categories match the design boards.
export const SUPPORT_CATEGORIES = ['Billing', 'Account', 'Audio issue', 'Bible reading issue', 'Bug', 'Feedback', 'Content sensitivity', 'Other'];

export const SupportService = {
  async submitTicket({ category, message, email, screenshotUri = null, includeLogs = false }) {
    if (!message || !message.trim()) return { ok: false, error: 'empty' };
    // Simulate a network round-trip. Replace with POST /support/ticket.
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, id: 'tkt_' + Date.now(), category, email, hasAttachment: !!screenshotUri, includeLogs };
  },
};
