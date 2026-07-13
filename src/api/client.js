// Grace API client — fetch wrapper, JWT attach, 401 refresh, timeout.
import { getSession, setSession } from './session';

const STAGING_API = 'https://grace-api-production.up.railway.app';
const BASE = (process.env.EXPO_PUBLIC_API_BASE || STAGING_API).replace(/\/$/, '');
const TIMEOUT = 12000;

async function refreshTokens() {
  const session = await getSession();
  if (!session?.refreshToken) return false;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refreshToken }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = await res.json();
    await setSession({
      ...session,
      accessToken: data.session.accessToken,
      refreshToken: data.session.refreshToken,
      expiresIn: data.session.expiresIn,
    });
    return true;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

async function request(method, path, body, { auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body != null) headers['Content-Type'] = 'application/json';

  if (auth) {
    const session = await getSession();
    if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body == null ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (res.status === 401 && auth && retry) {
      const refreshed = await refreshTokens();
      if (refreshed) return request(method, path, body, { auth, retry: false });
    }

    let data = null;
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!res.ok) {
      const err = new Error((data && data.error) || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return { ok: true, status: res.status, data };
  } catch (e) {
    clearTimeout(timer);
    if (e.status) throw e;
    const err = new Error(e.name === 'AbortError' ? 'Request timeout' : (e.message || 'Network error'));
    err.network = true;
    throw err;
  }
}

export const api = {
  get: (path, opts) => request('GET', path, null, opts),
  post: (path, body, opts) => request('POST', path, body, opts),
  patch: (path, body, opts) => request('PATCH', path, body, opts),
  put: (path, body, opts) => request('PUT', path, body, opts),
  delete: (path, opts) => request('DELETE', path, null, opts),
};

export function getApiBase() {
  return BASE;
}
