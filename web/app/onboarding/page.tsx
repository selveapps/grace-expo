import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { hasSession } from '@/lib/grace';

export default async function OnboardingPage() {
  if (!(await hasSession())) redirect('/');
  return <OnboardingWizard />;
}
