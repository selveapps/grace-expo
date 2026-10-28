import Link from 'next/link';
import { ReflectionForm } from '@/components/Pieces';
import { grace } from '@/lib/grace';

export const dynamic = 'force-dynamic';

type Reflection = { id?: string; word?: string; note?: string | null; ref?: string | null };
type ReflectionsBody = Reflection[] | { reflections?: Reflection[] };

function reflectionList(body: ReflectionsBody): Reflection[] {
  const list = Array.isArray(body) ? body : body.reflections;
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item && typeof item === 'object');
}

export default async function ReflectionsPage() {
  let reflections: Reflection[];
  try {
    reflections = reflectionList(await grace<ReflectionsBody>('/reflections', { cache: 'no-store' }));
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
      <h1>Reflections</h1>
      {reflections.length === 0 ? <p className="lede">No reflections yet.</p> : (
        reflections.map((item, index) => (
          <article className="card" key={item.id ?? `${item.word ?? 'reflection'}-${index}`}>
            {item.word ? <h2>{item.word}</h2> : null}
            {item.note ? <p>{item.note}</p> : null}
            {item.ref ? <p className="meta">{item.ref}</p> : null}
          </article>
        ))
      )}
      <ReflectionForm />
    </main>
  );
}
