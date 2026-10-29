import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="page">
      <p className="kicker">Grace</p>
      <h1>This page is not here</h1>
      <p className="lede">The reading you asked for is not in the library.</p>
      <p className="row">
        <Link className="btn" href="/reading">Scripture</Link>
        <Link className="btn secondary" href="/stories">Stories</Link>
        <Link className="btn secondary" href="/tea">Tea</Link>
      </p>
    </main>
  );
}
