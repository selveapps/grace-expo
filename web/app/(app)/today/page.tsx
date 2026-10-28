import { chapterHref } from '@/lib/books';
import { grace } from '@/lib/grace';
import { todayView, type TodayPayload } from '@/lib/today';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  let payload: TodayPayload | null = null;
  let failed = false;
  try {
    payload = await grace<TodayPayload>('/today', { cache: 'no-store' });
  } catch {
    failed = true;
  }

  const view = todayView(payload, new Date().getHours(), failed);

  return (
    <main className="page">
      <p className="kicker">Today</p>
      <h1>{view.greeting}</h1>
      {view.loadError && (
        <div className="banner">
          <p>I couldn't load today's reading.</p>
          <a className="btn" href="/today">Try again</a>
        </div>
      )}
      <p className="kicker">{view.verseRef}</p>
      <p className="verse">{view.verseText}</p>
      <section className="card">
        <p className="kicker">Intention</p>
        <p>{view.intention}</p>
      </section>
      <section className="card">
        <p className="kicker">Prompt</p>
        <p>{view.prompt}</p>
      </section>
      <section className="card">
        <p className="kicker">Reading</p>
        <a href={chapterHref(view.readingBook, view.readingChapter)}>
          {view.readingBook} {view.readingChapter}
        </a>
      </section>
      <section className="card">
        <p className="kicker">Story</p>
        <a href={`/stories/${view.storyId}`}>{view.storyTitle}</a>
      </section>
    </main>
  );
}
