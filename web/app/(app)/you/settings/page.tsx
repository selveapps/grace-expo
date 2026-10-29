import Link from 'next/link';
import { DeleteAccountButton, SignOutButton } from '@/components/Pieces';
import { TypeSizePicker } from '@/components/TypeSizePicker';
import { grace } from '@/lib/grace';
import { PRIVATE_PAGE } from '@/lib/site';

export const metadata = PRIVATE_PAGE;

export const dynamic = 'force-dynamic';

type Me = {
  user?: { name?: string | null; email?: string | null };
  profile?: {
    carrying?: string[];
    gentleness?: string | null;
    rhythm?: string | null;
    onboarded?: boolean;
  };
};

function field(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : 'Not set';
}

export default async function SettingsPage() {
  let me: Me | null = null;
  let missing = false;
  try {
    me = await grace<Me>('/me', { cache: 'no-store' });
  } catch {
    missing = true;
  }

  const carrying = me?.profile?.carrying?.filter(Boolean).join(', ');

  return (
    <main className="page">
      <p className="kicker"><Link href="/you">You</Link></p>
      <h1>Settings</h1>
      {missing ? (
        <p>Your session is missing. <Link href="/">Begin again</Link>.</p>
      ) : (
        <article className="card">
          <h2>Profile</h2>
          <p>Name: {field(me?.user?.name)}</p>
          <p>Email: {field(me?.user?.email)}</p>
          <p>Carrying: {field(carrying)}</p>
          <p>Gentleness: {field(me?.profile?.gentleness)}</p>
          <p>Rhythm: {field(me?.profile?.rhythm)}</p>
          <p>Onboarded: {me?.profile?.onboarded ? 'Yes' : 'No'}</p>
        </article>
      )}
      <section className="card">
        <h2>Type size</h2>
        <TypeSizePicker />
      </section>
      <p>Scripture quotations are from the King James Version (KJV), which is in the public domain.</p>
      <p className="meta">
        <a href="https://www.selveapps.xyz/grace/privacy">Privacy</a>
        {' · '}
        <a href="https://www.selveapps.xyz/grace/terms">Terms</a>
      </p>
      <SignOutButton />
      {missing ? null : <DeleteAccountButton />}
    </main>
  );
}
