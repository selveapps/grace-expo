import Link from 'next/link';
import { grace, publicGrace } from '@/lib/grace';
import { savedTeaList, savedTeaRows, type TeaCard } from '@/lib/library';
import { PRIVATE_PAGE } from '@/lib/site';

export const metadata = { ...PRIVATE_PAGE, title: 'Saved tea' };

export const dynamic = 'force-dynamic';

export default async function SavedTeaPage() {
  let saved;
  try {
    saved = savedTeaRows(await grace<unknown>('/tea/saved', { cache: 'no-store' }));
  } catch {
    return (
      <main className="page">
        <p>We could not open this page.</p>
        <p><Link href="/">Home</Link></p>
      </main>
    );
  }

  let catalog: TeaCard[] = [];
  try {
    const body = await publicGrace<{ tea?: TeaCard[] }>('/tea', 300);
    catalog = body.tea ?? [];
  } catch {
    catalog = [];
  }

  const items = savedTeaList(catalog, saved);

  return (
    <main className="page">
      <p className="kicker"><Link href="/you">You</Link></p>
      <h1>Saved tea</h1>
      {items.length === 0 ? (
        <p className="lede">Nothing saved yet. <Link href="/tea">Browse Tea</Link>.</p>
      ) : (
        <div className="list">
          {items.map((item) => (
            <Link key={item.id} href={`/tea/${item.id}`} className="item">
              <h2>{item.cardTitle}</h2>
              {item.ref ? <p className="meta">{item.ref}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
