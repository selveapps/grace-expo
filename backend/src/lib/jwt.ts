import * as jose from 'jose';

const ACCESS_TTL = '1h';
const REFRESH_TTL = '30d';

function secret(): Uint8Array {
  const key = process.env.JWT_SECRET;
  if (!key) throw new Error('JWT_SECRET is required');
  return new TextEncoder().encode(key);
}

export type TokenPayload = {
  sub: string;
  type: 'access' | 'refresh';
  tv: number;
};

export async function signAccessToken(userId: string, tokenVersion: number): Promise<string> {
  return new jose.SignJWT({ type: 'access', tv: tokenVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secret());
}

export async function signRefreshToken(userId: string, tokenVersion: number): Promise<string> {
  return new jose.SignJWT({ type: 'refresh', tv: tokenVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(secret());
}

export async function verifyToken(
  token: string,
  expectedType: 'access' | 'refresh',
): Promise<{ sub: string; tv: number }> {
  const { payload } = await jose.jwtVerify(token, secret());
  if (payload.type !== expectedType || typeof payload.sub !== 'string') {
    throw new Error('Invalid token');
  }
  const tv = payload.tv;
  if (typeof tv !== 'number' || !Number.isInteger(tv) || tv < 0) {
    throw new Error('Invalid token');
  }
  return { sub: payload.sub, tv };
}

export const ACCESS_EXPIRES_IN = 3600;
