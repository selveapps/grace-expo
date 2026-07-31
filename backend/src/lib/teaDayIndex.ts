/**
 * Tea-of-day index: one stable integer per calendar day in a given IANA timezone.
 *
 * Policy: the client sends its timezone on GET /tea/today; offline fallback uses
 * the device timezone via Intl. Both sides hash YYYY-MM-DD in that zone so the
 * daily pick matches whether she is online or offline.
 */
export function teaDayIndex(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = Number(parts.find((p) => p.type === 'year')!.value);
  const m = Number(parts.find((p) => p.type === 'month')!.value);
  const d = Number(parts.find((p) => p.type === 'day')!.value);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Default when the client omits tz: UTC calendar day (server-side fallback). */
export const DEFAULT_TEA_TIMEZONE = 'UTC';
