import Link from 'next/link';
import { SupportForm } from '@/components/Pieces';

export default function SupportPage() {
  return (
    <main className="page">
      <p className="kicker"><Link href="/you">You</Link></p>
      <h1>Support</h1>
      <p className="lede">Tell Grace what happened. A reply comes back here.</p>
      <SupportForm />
      <p>
        <a href="mailto:support@selveapps.xyz">support@selveapps.xyz</a>
      </p>
      <p>
        <a href="https://www.selveapps.xyz/grace/support">https://www.selveapps.xyz/grace/support</a>
      </p>
    </main>
  );
}
