import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AudioPlayer } from '@/components/Pieces';
import { GraceError, publicGrace } from '@/lib/grace';
import { resolveAudioUrl } from '@/lib/media';

type Story = {
  id: string;
  title: string;
  subtitle?: string;
  hook?: string;
  scriptureRange?: string;
  hasAudio?: boolean;
  audioUrl?: string | null;
  parts?: number;
};

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let story: Story;
  try {
    story = await publicGrace<Story>('/stories/' + encodeURIComponent(id), 300);
  } catch (error) {
    if (error instanceof GraceError && error.status === 404) notFound();
    throw error;
  }

  const src = resolveAudioUrl(story.audioUrl, 1);

  let transcript: string | undefined;
  try {
    const data = await publicGrace<{ text?: string }>('/stories/' + id + '/transcript?part=1', 300);
    transcript = data.text?.trim() ? data.text : undefined;
  } catch {
    transcript = undefined;
  }

  return (
    <main className="page">
      <p className="kicker"><Link href="/stories">Stories</Link></p>
      <h1>{story.title}</h1>
      {story.subtitle ? <p className="lede">{story.subtitle}</p> : null}
      {story.scriptureRange ? <p className="meta">{story.scriptureRange}</p> : null}
      {story.parts != null ? <p className="meta">{story.parts === 1 ? '1 part' : `${story.parts} parts`}</p> : null}
      {story.hook ? <p className="card">{story.hook}</p> : null}
      {src ? <AudioPlayer src={src} storyId={story.id} /> : null}
      {transcript ? (
        <section className="card">
          <h2>Transcript</h2>
          <p>{transcript}</p>
        </section>
      ) : null}
    </main>
  );
}
