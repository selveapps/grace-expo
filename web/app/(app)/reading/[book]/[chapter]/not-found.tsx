import Link from 'next/link';

export default function ChapterNotFound() {
  return (
    <main className="page">
      <p className="kicker">Reading</p>
      <h1>Chapter not found</h1>
      <p className="lede">That book or chapter is not in the library.</p>
      <p>
        <Link href="/reading">Back to reading</Link>
      </p>
    </main>
  );
}
