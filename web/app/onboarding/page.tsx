import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { hasSession } from '@/lib/grace';
import { PRIVATE_PAGE } from '@/lib/site';

export const metadata = PRIVATE_PAGE;

export default async function OnboardingPage() {
  if (!(await hasSession())) redirect('/');
  return <OnboardingWizard />;
}
