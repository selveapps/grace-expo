import type { Metadata } from 'next';
import Link from 'next/link';
import { publicGrace } from '@/lib/grace';

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Scripture told in short episodes. Ruth, Esther, David, Hannah, and Mary, with audio and a transcript.',
  alternates: { canonical: '/stories' },
};

type Collection = { id: string; name: string };

type Story = {
  id: string;
  title: string;
  subtitle?: string;
  hook?: string;
  scriptureRange?: string;
  tags?: string[];
};

type Catalog = {
  collections?: Collection[];
  stories: Story[];
};

function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.id}`} className="card">
      <h3>{story.title}</h3>
      {story.subtitle ? <p className="meta">{story.subtitle}</p> : null}
      {story.hook ? <p>{story.hook}</p> : null}
      {story.scriptureRange ? <p className="meta">{story.scriptureRange}</p> : null}
    </Link>
  );
}

export default async function StoriesPage() {
  const data = await publicGrace<Catalog>('/stories', 300);
  const stories = data.stories ?? [];
  const collections = data.collections ?? [];
  const groups = collections
    .map((collection) => ({
      collection,
      stories: stories.filter((story) => story.tags?.includes(collection.name)),
    }))
    .filter((group) => group.stories.length > 0);
  const grouped = new Set(groups.flatMap((group) => group.stories.map((story) => story.id)));
  const rest = stories.filter((story) => !grouped.has(story.id));

  return (
    <main className="page">
      <p className="kicker">Listen</p>
      <h1>Stories</h1>
      {groups.map((group) => (
        <section key={group.collection.id}>
          <h2>{group.collection.name}</h2>
          {group.stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </section>
      ))}
      {rest.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </main>
  );
}
