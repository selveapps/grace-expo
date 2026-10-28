import Link from 'next/link';
import { publicGrace } from '@/lib/grace';

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

export default async function TeaTodayPage() {
  const { tea } = await publicGrace<{ tea: Tea }>(
    '/tea/today?tz=' + encodeURIComponent('America/Los_Angeles'),
    900,
  );

  return (
    <main className="page">
      <p className="kicker">Today&apos;s tea</p>
      <h1>{tea.cardTitle}</h1>
      <p className="lede">{tea.hook}</p>
      <p>{tea.tea}</p>
      <p className="meta">{tea.ref}</p>
      <p className="row">
        <Link className="btn" href={`/tea/${tea.id}`}>Open</Link>
        <Link className="btn secondary" href="/tea">Archive</Link>
      </p>
    </main>
  );
}
