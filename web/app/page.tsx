import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ensureGuest } from '@/lib/actions';
import { grace, hasSession, publicGrace } from '@/lib/grace';
import { SITE_DESCRIPTION, siteUrl } from '@/lib/site';
import { FALLBACK_VERSE } from '@/lib/today';

export const metadata: Metadata = {
  title: { absolute: 'Grace — a Bible that reads to you' },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

async function begin() {
  'use server';
  await ensureGuest();
  redirect('/onboarding');
}

type Me = { profile?: { onboarded?: boolean } };
type Verse = { ref?: string; text?: string };
type Story = { id: string; title: string; hook?: string; scriptureRange?: string };
type Tea = { id: string; cardTitle: string; hook: string; ref: string };

async function landingPreview() {
  const [verse, stories, tea] = await Promise.all([
    publicGrace<Verse>('/today/verse', 900).catch(() => FALLBACK_VERSE),
    publicGrace<{ stories?: Story[] }>('/stories', 300)
      .then((data) => (data.stories ?? []).slice(0, 3))
      .catch(() => [] as Story[]),
    publicGrace<{ tea: Tea }>('/tea/today?tz=' + encodeURIComponent('America/Los_Angeles'), 900)
      .then((data) => data.tea)
      .catch(() => null),
  ]);
  const text = verse.text?.trim() ? verse : FALLBACK_VERSE;
  return { verse: text, stories, tea };
}

export default async function SplashPage() {
  if (await hasSession()) {
    let me: Me | undefined;
    try {
      me = await grace<Me>('/me', { cache: 'no-store' });
    } catch {
      me = undefined;
    }
    if (me) {
      if (me.profile?.onboarded) redirect('/today');
      redirect('/onboarding');
    }
  }

  const preview = await landingPreview();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Grace',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web, iOS',
    description: SITE_DESCRIPTION,
    url: siteUrl(),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Read on the web as a guest. Grace Plus is purchased in the iOS app.',
    },
  };

  return (
    <main className="landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="hero">
        <p className="kicker">Audio-first Bible</p>
        <h1>Grace</h1>
        <p className="lede">A quiet place for your soul to breathe.</p>
        <p>
          Five quiet minutes. A little scripture, said plainly. Stories told properly.
          She keeps your place. She does not guard a streak.
        </p>
        <form action={begin}>
          <button className="btn" type="submit">Begin</button>
        </form>
        <p className="meta">
          <Link href="/reading">Read the Bible</Link>
          {' · '}
          <Link href="/stories">Stories</Link>
          {' · '}
          <Link href="/tea">Tea</Link>
        </p>
      </header>

      <section className="page">
        <p className="kicker">{preview.verse.ref}</p>
        <p className="verse">{preview.verse.text}</p>
        <p className="meta">King James Version, public domain.</p>
      </section>

      <section className="page">
        <h2>What you get</h2>
        <div className="feature-grid">
          <article className="card">
            <h3>Today</h3>
            <p>A short passage for the day, and a place to put what you are carrying.</p>
          </article>
          <article className="card">
            <h3>The full Bible</h3>
            <p>Every book, clean type, search, and themes. Pick up a chapter whenever you want.</p>
            <p><Link href="/reading">Open scripture</Link></p>
          </article>
          <article className="card">
            <h3>Stories</h3>
            <p>Episodes short enough for a commute. The Bible is stranger than most of us were taught.</p>
            <p><Link href="/stories">Listen</Link></p>
          </article>
          <article className="card">
            <h3>Tea</h3>
            <p>A daily sermon with a point of view. No streak to protect.</p>
            <p><Link href="/tea/today">Today&apos;s tea</Link></p>
          </article>
        </div>
      </section>

      {preview.stories.length > 0 ? (
        <section className="page">
          <h2>Stories</h2>
          {preview.stories.map((story) => (
            <Link key={story.id} href={`/stories/${story.id}`} className="card">
              <h3>{story.title}</h3>
              {story.scriptureRange ? <p className="meta">{story.scriptureRange}</p> : null}
              {story.hook ? <p>{story.hook}</p> : null}
            </Link>
          ))}
        </section>
      ) : null}

      {preview.tea ? (
        <section className="page">
          <h2>Today&apos;s tea</h2>
          <article className="card">
            <h3>{preview.tea.cardTitle}</h3>
            <p className="meta">{preview.tea.ref}</p>
            <p>{preview.tea.hook}</p>
            <p><Link href={`/tea/${preview.tea.id}`}>Open</Link></p>
          </article>
        </section>
      ) : null}

      <footer className="page">
        <p className="meta">
          Grace Plus is purchased in the iOS app. The web reads with a guest session.
          {' '}
          <a href="https://www.selveapps.xyz/grace/terms">Terms</a>
          {' · '}
          <a href="https://www.selveapps.xyz/grace/privacy">Privacy</a>
          {' · '}
          <a href="https://www.selveapps.xyz/grace/support">Support</a>
        </p>
      </footer>
    </main>
  );
}
