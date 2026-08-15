import { prisma } from '../db.js';
import { ACCESS_EXPIRES_IN, signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt.js';
import { resolveSubscription } from './subscriptionService.js';

async function assertTokenVersion(userId: string, tokenVersion: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  });
  if (!user || user.tokenVersion !== tokenVersion) {
    throw new Error('Invalid token');
  }
}

export async function guestLogin(deviceId: string) {
  if (!deviceId?.trim()) throw new Error('deviceId required');

  const user = await prisma.user.upsert({
    where: { guestDeviceId: deviceId },
    create: {
      guestDeviceId: deviceId,
      profile: { create: {} },
    },
    update: {},
    include: { profile: true },
  });

  const accessToken = await signAccessToken(user.id, user.tokenVersion);
  const refreshToken = await signRefreshToken(user.id, user.tokenVersion);

  return {
    session: {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_EXPIRES_IN,
    },
    user: {
      id: user.id,
      guestDeviceId: user.guestDeviceId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

export async function refreshSession(refresh: string) {
  const { sub: userId, tv } = await verifyToken(refresh, 'refresh');
  await assertTokenVersion(userId, tv);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const accessToken = await signAccessToken(user.id, user.tokenVersion);
  const newRefresh = await signRefreshToken(user.id, user.tokenVersion);

  return {
    session: {
      accessToken,
      refreshToken: newRefresh,
      expiresIn: ACCESS_EXPIRES_IN,
    },
  };
}

export async function getUserWithProfile(userId: string) {
  await resolveSubscription(userId);
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, subscription: true },
  });
}

export async function verifyAccessToken(token: string): Promise<string> {
  const { sub, tv } = await verifyToken(token, 'access');
  await assertTokenVersion(sub, tv);
  return sub;
}

export async function sessionForUser(user: { id: string; tokenVersion: number }) {
  const accessToken = await signAccessToken(user.id, user.tokenVersion);
  const refreshToken = await signRefreshToken(user.id, user.tokenVersion);
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_EXPIRES_IN,
  };
}
