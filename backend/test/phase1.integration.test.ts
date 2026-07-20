import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { checkDatabase } from '../src/db.js';

const prisma = new PrismaClient();

describe('Phase 1 — database schema (SEL-9)', () => {
  before(async () => {
    const ok = await checkDatabase();
    assert.ok(ok, 'DATABASE_URL must be reachable — run docker compose up -d');
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it('all required tables exist', async () => {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    const names = tables.map((t) => t.tablename).sort();
    for (const expected of [
      'bible_verse',
      'profile',
      'reading_progress',
      'reflection',
      'saved_verse',
      'subscription',
      'user',
    ]) {
      assert.ok(names.includes(expected), `missing table: ${expected}`);
    }
  });

  it('user + profile roundtrip', async () => {
    const user = await prisma.user.create({
      data: {
        guestDeviceId: `test-${Date.now()}`,
        name: 'Test',
        profile: { create: { carrying: ['Hope'], onboarded: true } },
      },
      include: { profile: true },
    });
    assert.equal(user.name, 'Test');
    assert.equal(user.profile?.carrying[0], 'Hope');
    await prisma.user.delete({ where: { id: user.id } });
  });
});

describe('Phase 1 — KJV seed (SEL-8 / SEL-11)', () => {
  after(async () => {
    await prisma.$disconnect();
  });

  it('Psalms 23 has 6 verses', async () => {
    const count = await prisma.bibleVerse.count({
      where: { book: 'Psalms', chapter: 23 },
    });
    assert.equal(count, 6, 'run npm run seed:bible after seed:prepare');
  });

  it('verse text matches known KJV opening', async () => {
    const v = await prisma.bibleVerse.findFirst({
      where: { book: 'Psalms', chapter: 23, verse: 1 },
    });
    assert.ok(v?.text.toLowerCase().includes('shepherd'));
  });
});
