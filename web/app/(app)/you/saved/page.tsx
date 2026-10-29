import Link from 'next/link';
import { RemoveVerseButton } from '@/components/Pieces';
import { grace } from '@/lib/grace';
import { PRIVATE_PAGE } from '@/lib/site';

export const metadata = PRIVATE_PAGE;

export const dynamic = 'force-dynamic';

type SavedVerse = { ref: string; text: string };
type SavedBody = SavedVerse[] | { saved?: SavedVerse[] };

function savedVerses(body: SavedBody): SavedVerse[] {
  const list = Array.isArray(body) ? body : body.saved;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => {
    if (!item || typeof item.ref !== 'string' || !item.ref.trim()) return [];
    return [{ ref: item.ref, text: typeof item.text === 'string' ? item.text : '' }];
  });
}

export default async function SavedPage() {
  let verses: SavedVerse[];
  try {
    verses = savedVerses(await grace<SavedBody>('/saved', { cache: 'no-store' }));
  } catch {
    return (
      <main className="page">
        <p>We could not open this page.</p>
        <p><Link href="/">Home</Link></p>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="kicker">You</p>
      <h1>Saved verses</h1>
      {verses.length === 0 ? <p className="lede">No verses saved yet.</p> : (
        verses.map((verse) => (
          <article className="card" key={verse.ref}>
            <p className="meta">{verse.ref}</p>
            <p>{verse.text}</p>
            <RemoveVerseButton refName={verse.ref} />
          </article>
        ))
      )}
    </main>
  );
}
