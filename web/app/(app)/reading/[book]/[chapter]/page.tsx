import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RememberChapter, SaveVerseButton } from '@/components/Pieces';
import { bookToSlug, slugToBook } from '@/lib/books';
import { GraceError, publicGrace } from '@/lib/grace';

type ChapterResponse = {
  reference: string;
  verses: { n: number; t: string }[];
};

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;
  const bookName = slugToBook(book);
  const n = Number(chapter);
  if (!bookName || !Number.isInteger(n) || n < 1) notFound();

  let data: ChapterResponse;
  try {
    data = await publicGrace<ChapterResponse>(
      `/bible/${encodeURIComponent(bookName)}/${chapter}`,
      3600,
    );
  } catch (error) {
    if (error instanceof GraceError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="page">
      <RememberChapter book={bookName} chapter={n} />
      <p className="kicker">
        <Link href="/reading">Reading</Link>
      </p>
      <h1>{data.reference}</h1>
      <div>
        {data.verses.map((verse) => (
          <div key={verse.n} className="verse-line">
            <span>{verse.n}</span>
            <div>
              {verse.t}{' '}
              <SaveVerseButton refName={`${bookName} ${n}:${verse.n}`} text={verse.t} />
            </div>
          </div>
        ))}
      </div>
      <nav className="row" aria-label="Chapters" style={{ marginTop: 20 }}>
        {n > 1 ? (
          <Link className="chip" href={`/reading/${bookToSlug(bookName)}/${n - 1}`}>
            Previous chapter
          </Link>
        ) : null}
        <Link className="chip" href={`/reading/${bookToSlug(bookName)}/${n + 1}`}>
          Next chapter
        </Link>
      </nav>
    </main>
  );
}
