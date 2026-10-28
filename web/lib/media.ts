const DEFAULT_API = 'https://grace-api-production.up.railway.app';

export function apiBase(): string {
  return (process.env.GRACE_API_BASE || process.env.NEXT_PUBLIC_GRACE_API_BASE || DEFAULT_API).replace(/\/$/, '');
}

export function absoluteApiUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = apiBase();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function resolveAudioUrl(template: string | null | undefined, part = 1): string | null {
  if (!template) return null;
  return absoluteApiUrl(template.replace('{part}', String(part)));
}
