import type { Metadata } from 'next';
import Link from 'next/link';
import { publicGrace } from '@/lib/grace';

export const metadata: Metadata = {
  title: 'Tea',
  description: 'A daily sermon with a point of view. The Grace Tea archive, one short reading at a time.',
  alternates: { canonical: '/tea' },
};

type Tea = {
  id: string;
  cardTitle: string;
  hook: string;
  tea: string;
  badge: string;
  ref: string;
  book: string;
  chapter: number;
  heat: number;
  hasAudio: boolean;
  audioUrl: string | null;
  image: string;
};

export default async function TeaArchivePage() {
  const { tea } = await publicGrace<{ tea: Tea[] }>('/tea', 300);

  return (
    <main className="page">
      <p className="kicker">Tea</p>
      <h1>The archive</h1>
      <p className="lede">
        <Link href="/tea/today">Today&apos;s tea</Link>
      </p>
      <div className="list">
        {tea.map((item) => (
          <Link key={item.id} href={`/tea/${item.id}`} className="item">
            <h2>{item.cardTitle}</h2>
            <p className="meta">{item.badge}</p>
            <p className="meta">{item.ref}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
