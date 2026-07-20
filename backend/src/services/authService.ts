import { prisma } from '../db.js';
import { ACCESS_EXPIRES_IN, signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt.js';
import { resolveSubscription } from './subscriptionService.js';

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

  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);

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
  const userId = await verifyToken(refresh, 'refresh');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const accessToken = await signAccessToken(user.id);
  const refreshToken = await signRefreshToken(user.id);

  return {
    session: {
      accessToken,
      refreshToken,
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
  return verifyToken(token, 'access');
}
