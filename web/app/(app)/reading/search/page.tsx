import { publicGrace } from '@/lib/grace';

type Hit = { ref?: string; text?: string; reference?: string };

type SearchResponse = {
  ot?: Hit[];
  nt?: Hit[];
  total?: number;
};

function hitRef(hit: Hit): string {
  return hit.ref || hit.reference || '';
}

function Hits({ title, hits }: { title: string; hits: Hit[] }) {
  return (
    <section>
      <h2>{title}</h2>
      {hits.map((hit, index) => (
        <article key={`${title}-${hitRef(hit)}-${index}`} className="card">
          <p className="kicker">{hitRef(hit)}</p>
          <p>{hit.text}</p>
        </article>
      ))}
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: raw } = await searchParams;
  const q = raw?.trim() ?? '';

  let result: SearchResponse | null = null;
  let failed = false;
  if (q) {
    try {
      result = await publicGrace<SearchResponse>(`/bible/search?q=${encodeURIComponent(q)}`, 120);
    } catch {
      failed = true;
    }
  }

  const ot = result?.ot ?? [];
  const nt = result?.nt ?? [];
  const shown = ot.length + nt.length;

  return (
    <main className="page">
      <h1>Search scripture</h1>
      <form method="GET" action="/reading/search">
        <label htmlFor="q">
          Search
          <input id="q" name="q" type="search" defaultValue={q} placeholder="peace, hope, John 3:16…" />
        </label>
        <button className="btn" type="submit">Search</button>
      </form>
      {result ? (
        <>
          {typeof result.total === 'number' ? <p>Showing {shown} of {result.total}</p> : null}
          <Hits title="Old Testament" hits={ot} />
          <Hits title="New Testament" hits={nt} />
        </>
      ) : null}
      {failed ? <p className="error">Could not reach the library.</p> : null}
    </main>
  );
}
