#!/usr/bin/env tsx
/**
 * Load kjv.normalized.json into bible_verse table (idempotent upsert).
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '../data/kjv.normalized.json');

type Row = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: string;
};

async function main() {
  const raw = await readFile(DATA, 'utf8');
  const rows = JSON.parse(raw) as Row[];
  if (!rows.length) throw new Error('Empty seed file');

  const prisma = new PrismaClient();
  try {
    let upserted = 0;
    const batch = 200;
    for (let i = 0; i < rows.length; i += batch) {
      const chunk = rows.slice(i, i + batch);
      await prisma.$transaction(
        chunk.map((r) =>
          prisma.bibleVerse.upsert({
            where: { book_chapter_verse: { book: r.book, chapter: r.chapter, verse: r.verse } },
            create: {
              book: r.book,
              chapter: r.chapter,
              verse: r.verse,
              text: r.text,
              testament: r.testament,
            },
            update: { text: r.text, testament: r.testament },
          }),
        ),
      );
      upserted += chunk.length;
    }
    const count = await prisma.bibleVerse.count();
    console.log(`Seeded ${upserted} verses (${count} total in bible_verse)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
