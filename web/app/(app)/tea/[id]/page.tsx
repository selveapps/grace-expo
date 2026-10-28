import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AudioPlayer, SaveTeaButton } from '@/components/Pieces';
import { GraceError, publicGrace } from '@/lib/grace';
import { resolveAudioUrl } from '@/lib/media';

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

export default async function TeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let tea: Tea;
  try {
    tea = await publicGrace<Tea>('/tea/' + encodeURIComponent(id), 300);
  } catch (error) {
    if (error instanceof GraceError && error.status === 404) notFound();
    throw error;
  }

  const src = resolveAudioUrl(tea.audioUrl);

  return (
    <main className="page">
      <p className="kicker">{tea.badge}</p>
      <h1>{tea.cardTitle}</h1>
      <p className="lede">{tea.hook}</p>
      <p>{tea.tea}</p>
      <p className="meta">{tea.ref}</p>
      {src ? <AudioPlayer src={src} /> : null}
      <SaveTeaButton id={id} />
      <p>
        <Link href="/tea">Archive</Link>
      </p>
    </main>
  );
}
