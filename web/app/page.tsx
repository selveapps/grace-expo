import { redirect } from 'next/navigation';
import { ensureGuest } from '@/lib/actions';
import { grace, hasSession } from '@/lib/grace';

async function begin() {
  'use server';
  await ensureGuest();
  redirect('/onboarding');
}

type Me = { profile?: { onboarded?: boolean } };

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

  return (
    <main className="splash">
      <div>
        <p className="kicker">Audio-first Bible</p>
        <h1>Grace</h1>
        <p className="lede">A quiet place for your soul to breathe.</p>
        <form action={begin}>
          <button className="btn" type="submit">Begin</button>
        </form>
      </div>
    </main>
  );
}
