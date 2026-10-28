import Link from 'next/link';
import { ReminderForm } from '@/components/Pieces';

export default function RemindersPage() {
  return (
    <main className="page">
      <p className="kicker"><Link href="/you">You</Link></p>
      <h1>Reminders</h1>
      <p className="lede">A short note for morning or evening.</p>
      <ReminderForm />
    </main>
  );
}
