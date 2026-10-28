import Link from 'next/link';
import { RedeemForm } from '@/components/Pieces';
import { grace } from '@/lib/grace';
import { PLANS } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

type Me = { profile?: { subscribed?: boolean } };

export default async function SubscriptionPage() {
  let subscribed = false;
  let missing = false;
  try {
    const me = await grace<Me>('/me', { cache: 'no-store' });
    subscribed = me.profile?.subscribed === true;
  } catch {
    missing = true;
  }

  return (
    <main className="page">
      <p className="kicker"><Link href="/you">You</Link></p>
      <h1>Subscription</h1>
      {missing ? (
        <p>Your session is missing. <Link href="/">Begin again</Link>.</p>
      ) : (
        <p>{subscribed ? 'You are subscribed.' : 'You are not subscribed.'}</p>
      )}
      <p className="lede">3-day trial. Purchase stays in the iOS app.</p>
      {PLANS.map((plan) => (
        <article className="card" key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.id}</p>
          <p>{plan.price}</p>
          <p className="meta">{plan.detail}</p>
        </article>
      ))}
      <h2>Beta code</h2>
      <RedeemForm />
      <p className="meta">
        <a href="https://www.selveapps.xyz/grace/terms">Terms</a>
        {' · '}
        <a href="https://www.selveapps.xyz/grace/privacy">Privacy</a>
      </p>
    </main>
  );
}
