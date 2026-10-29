import type { Metadata } from 'next';
import Link from 'next/link';
import { NT_BOOKS, OT_BOOKS, bookToSlug } from '@/lib/books';
import { themeNames } from '@/lib/themes';

export const metadata: Metadata = {
  title: 'Read the Bible',
  description: 'The King James Version, book by book. Search a phrase or open a theme. Public-domain scripture on Grace.',
  alternates: { canonical: '/reading' },
};

export default function ReadingPage() {
  return (
    <main className="page">
      <p className="kicker">Reading</p>
      <h1>Scripture</h1>
      <p className="lede">
        <Link href="/reading/search">Search</Link>
      </p>

      <h2 style={{ margin: '28px 0 12px' }}>Themes</h2>
      <div className="row">
        {themeNames().map((name) => (
          <Link key={name} className="chip" href={`/reading/themes/${encodeURIComponent(name)}`}>
            {name}
          </Link>
        ))}
      </div>

      <h2 style={{ margin: '28px 0 12px' }}>Old Testament</h2>
      <div className="book-grid">
        {OT_BOOKS.map((book) => (
          <Link key={book} href={`/reading/${bookToSlug(book)}/1`}>{book}</Link>
        ))}
      </div>

      <h2 style={{ margin: '28px 0 12px' }}>New Testament</h2>
      <div className="book-grid">
        {NT_BOOKS.map((book) => (
          <Link key={book} href={`/reading/${bookToSlug(book)}/1`}>{book}</Link>
        ))}
      </div>
    </main>
  );
}
