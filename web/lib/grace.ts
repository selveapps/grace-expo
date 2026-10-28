import { cookies } from 'next/headers';
import { apiBase } from './media';

const ACCESS = 'grace_access';
const REFRESH = 'grace_refresh';

export class GraceError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type SessionBody = {
  session?: { accessToken?: string; refreshToken?: string; expiresIn?: number };
};

async function readTokens() {
  const jar = await cookies();
  return {
    access: jar.get(ACCESS)?.value ?? null,
    refresh: jar.get(REFRESH)?.value ?? null,
  };
}

export async function writeSession(session: { accessToken: string; refreshToken: string; expiresIn?: number }) {
  const jar = await cookies();
  const maxAge = session.expiresIn ?? 60 * 60 * 24 * 30;
  const common = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };
  jar.set(ACCESS, session.accessToken, { ...common, maxAge });
  jar.set(REFRESH, session.refreshToken, { ...common, maxAge: 60 * 60 * 24 * 90 });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

export async function hasSession(): Promise<boolean> {
  const { access, refresh } = await readTokens();
  return Boolean(access || refresh);
}

async function raw(path: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${apiBase()}${path}`, { ...init, headers, cache: init.cache });
}

async function refreshTokens(): Promise<string | null> {
  const { refresh } = await readTokens();
  if (!refresh) return null;
  const res = await raw('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh }), cache: 'no-store' }, null);
  if (!res.ok) return null;
  const data = (await res.json()) as SessionBody;
  if (!data.session?.accessToken || !data.session.refreshToken) return null;
  await writeSession({
    accessToken: data.session.accessToken,
    refreshToken: data.session.refreshToken,
    expiresIn: data.session.expiresIn,
  });
  return data.session.accessToken;
}

export async function grace<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const tokens = auth ? await readTokens() : { access: null, refresh: null };
  let res = await raw(path, init, tokens.access);
  if (res.status === 401 && auth) {
    const next = await refreshTokens();
    if (next) res = await raw(path, init, next);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) as T & { error?: string } : ({} as T);
  if (!res.ok) {
    const message = (data as { error?: string }).error || `HTTP ${res.status}`;
    throw new GraceError(message, res.status);
  }
  return data;
}

export async function publicGrace<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, { next: { revalidate } });
  if (!res.ok) throw new GraceError(`HTTP ${res.status}`, res.status);
  return res.json() as Promise<T>;
}
