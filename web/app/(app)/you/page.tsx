import Link from 'next/link';
import { SignOutButton } from '@/components/Pieces';
import { grace } from '@/lib/grace';
import { PRIVATE_PAGE } from '@/lib/site';

export const metadata = PRIVATE_PAGE;

export const dynamic = 'force-dynamic';

type Me = {
  user?: { name?: string | null; email?: string | null };
  profile?: {
    onboarded?: boolean;
    subscribed?: boolean;
    carrying?: string[];
    gentleness?: string | null;
    rhythm?: string | null;
  };
};

const LINKS = [
  { href: '/you/saved', label: 'Saved verses' },
  { href: '/you/reflections', label: 'Reflections' },
  { href: '/you/reminders', label: 'Reminders' },
  { href: '/you/support', label: 'Help & support' },
  { href: '/you/subscription', label: 'Subscription' },
  { href: '/you/settings', label: 'Settings' },
] as const;

const RHYTHM: Record<string, string> = {
  morning: 'Meeting each morning',
  evening: 'Meeting each evening',
  both: 'Morning & evening',
  later: 'No set rhythm yet',
};

function textOr(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function rhythmLabel(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return 'Not set';
  return RHYTHM[trimmed] ?? trimmed;
}

export default async function YouPage() {
  let me: Me;
  try {
    me = await grace<Me>('/me', { cache: 'no-store' });
  } catch {
    return (
      <main className="page">
        <p>We could not open this page.</p>
        <p><Link href="/">Home</Link></p>
      </main>
    );
  }

  const profile = me.profile;
  const carrying = (profile?.carrying ?? []).map((item) => item.trim()).filter(Boolean);

  return (
    <main className="page">
      <p className="kicker">You</p>
      <h1>{textOr(me.user?.name, 'friend')}</h1>
      <p className="lede">{profile?.subscribed ? 'Subscribed' : 'Not subscribed'}</p>
      <section className="card">
        <p><span className="meta">Carrying</span><br />{carrying.length ? carrying.join(', ') : 'Nothing noted yet'}</p>
        <p><span className="meta">Gentleness</span><br />{textOr(profile?.gentleness, 'Not set')}</p>
        <p><span className="meta">Rhythm</span><br />{rhythmLabel(profile?.rhythm)}</p>
      </section>
      <nav className="list" aria-label="Your library" style={{ display: 'grid', gap: 8 }}>
        {LINKS.map((link) => (
          <Link key={link.href} className="item" href={link.href}>{link.label}</Link>
        ))}
      </nav>
      <SignOutButton />
    </main>
  );
}
