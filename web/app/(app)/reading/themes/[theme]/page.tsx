import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { publicGrace } from '@/lib/grace';
import { THEME_BLURB, THEME_PASSAGES } from '@/lib/themes';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const { theme: raw } = await params;
  let theme = raw;
  try {
    theme = decodeURIComponent(raw);
  } catch {
    return { title: 'Theme' };
  }
  const blurb = THEME_BLURB[theme];
  if (!blurb) return { title: 'Theme' };
  return {
    title: theme,
    description: blurb,
    alternates: { canonical: `/reading/themes/${encodeURIComponent(theme)}` },
  };
}

type PassageResponse = { ref: string; text: string };

export default async function ThemePage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: raw } = await params;
  let theme: string;
  try {
    theme = decodeURIComponent(raw);
  } catch {
    notFound();
  }

  const blurb = THEME_BLURB[theme];
  const passages = THEME_PASSAGES[theme];
  if (blurb == null || passages == null) notFound();

  const loaded = await Promise.all(
    passages.map(async (passage) => {
      try {
        const data = await publicGrace<PassageResponse>(
          '/bible/passage?ref=' + encodeURIComponent(passage.ref),
          3600,
        );
        return { ref: passage.ref, note: passage.note, text: data.text };
      } catch {
        return { ref: passage.ref, note: passage.note, text: null };
      }
    }),
  );

  return (
    <main className="page">
      <p className="kicker"><a href="/reading">Reading</a></p>
      <h1>{theme}</h1>
      <p className="lede">{blurb}</p>
      {loaded.map((passage) => (
        <article key={passage.ref} className="card">
          <p className="kicker">{passage.ref}</p>
          {passage.text != null ? <p>{passage.text}</p> : null}
          <p className="meta">{passage.note}</p>
        </article>
      ))}
    </main>
  );
}
