import { prisma } from '../db.js';

export async function patchMe(
  userId: string,
  data: {
    name?: string;
    email?: string;
    carrying?: string[];
    gentleness?: string;
    rhythm?: string;
    onboarded?: boolean;
  },
) {
  const { name, email, ...profileFields } = data;

  if (name !== undefined || email !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
      },
    });
  }

  const profileUpdates = Object.fromEntries(
    Object.entries(profileFields).filter(([, v]) => v !== undefined),
  );

  if (Object.keys(profileUpdates).length > 0) {
    await prisma.profile.update({
      where: { userId },
      data: profileUpdates,
    });
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}

export async function listSaved(userId: string) {
  const rows = await prisma.savedVerse.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({ ref: r.ref, text: r.text }));
}

export async function addSaved(userId: string, ref: string, text: string) {
  return prisma.savedVerse.upsert({
    where: { userId_ref: { userId, ref } },
    create: { userId, ref, text },
    update: { text },
  });
}

export async function deleteSaved(userId: string, ref: string) {
  const deleted = await prisma.savedVerse.deleteMany({
    where: { userId, ref },
  });
  return deleted.count > 0;
}

export async function listReflections(userId: string) {
  const rows = await prisma.reflection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    id: r.id,
    word: r.word,
    note: r.note,
    ref: r.ref,
    date: r.createdAt.toISOString().slice(0, 10),
  }));
}

export async function addReflection(
  userId: string,
  data: { word: string; note?: string; ref?: string },
) {
  return prisma.reflection.create({
    data: { userId, word: data.word, note: data.note ?? null, ref: data.ref ?? null },
  });
}

export async function listProgress(userId: string) {
  const rows = await prisma.readingProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map((r) => ({
    book: r.book,
    chapter: r.chapter,
    position: r.position,
  }));
}

export async function upsertProgress(
  userId: string,
  data: { book: string; chapter: number; position: number },
) {
  return prisma.readingProgress.upsert({
    where: { userId_book: { userId, book: data.book } },
    create: {
      userId,
      book: data.book,
      chapter: data.chapter,
      position: data.position,
    },
    update: {
      chapter: data.chapter,
      position: data.position,
    },
  });
}

export async function listStoryProgress(userId: string) {
  const rows = await prisma.storyProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map((r) => ({
    storyId: r.storyId,
    seconds: r.seconds,
    completed: r.completed,
  }));
}

export async function upsertStoryProgress(
  userId: string,
  storyId: string,
  data: { seconds: number; completed?: boolean },
) {
  return prisma.storyProgress.upsert({
    where: { userId_storyId: { userId, storyId } },
    create: {
      userId,
      storyId,
      seconds: Math.max(0, Math.floor(data.seconds)),
      completed: !!data.completed,
    },
    update: {
      seconds: Math.max(0, Math.floor(data.seconds)),
      ...(data.completed !== undefined ? { completed: data.completed } : {}),
    },
  });
}

export async function createSupportTicket(
  userId: string,
  data: { category: string; message: string; email?: string; reply?: string },
) {
  return prisma.supportTicket.create({
    data: {
      userId,
      category: data.category,
      message: data.message,
      email: data.email ?? null,
      reply: data.reply ?? null,
    },
  });
}
