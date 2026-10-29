'use client';

import { useEffect, useState, useTransition } from 'react';
import { addReflection, askReminder, askSupport, deleteAccount, redeemCode, rememberChapter, rememberStory, removeVerse, saveTea, saveVerse, signOut } from '@/lib/actions';

function isRedirect(err: unknown) {
  return typeof err === 'object' && err !== null && 'digest' in err && String((err as { digest?: string }).digest).startsWith('NEXT_REDIRECT');
}

export function RememberChapter({ book, chapter }: { book: string; chapter: number }) {
  useEffect(() => { void rememberChapter(book, chapter); }, [book, chapter]);
  return null;
}

export function AudioPlayer({ src, storyId }: { src: string; storyId?: string }) {
  return (
    <audio
      className="audio"
      controls
      preload="none"
      src={src}
      onPlay={() => { if (storyId) void rememberStory(storyId); }}
    />
  );
}

export function SaveVerseButton({ refName, text }: { refName: string; text: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="text-btn" disabled={pending || done} onClick={() => start(async () => { await saveVerse(refName, text); setDone(true); })}>
      {done ? 'Saved' : 'Save verse'}
    </button>
  );
}

export function RemoveVerseButton({ refName }: { refName: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="text-btn" disabled={pending} onClick={() => start(() => removeVerse(refName))}>
      Remove
    </button>
  );
}

export function SaveTeaButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn secondary" disabled={pending || done} onClick={() => start(async () => { await saveTea(id); setDone(true); })}>
      {done ? 'Saved' : 'Save tea'}
    </button>
  );
}

export function ReflectionForm() {
  const [word, setWord] = useState('Trust');
  const [note, setNote] = useState('');
  const [refName, setRef] = useState('');
  const [pending, start] = useTransition();
  return (
    <form action={() => start(() => addReflection(word, note, refName))}>
      <label>Word <input value={word} onChange={(event) => setWord(event.target.value)} required /></label>
      <label>Note <textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
      <label>Reference <input value={refName} onChange={(event) => setRef(event.target.value)} placeholder="Psalm 23:1" /></label>
      <button className="btn" type="submit" disabled={pending}>Save reflection</button>
    </form>
  );
}

export function ReminderForm() {
  const [type, setType] = useState('morning');
  const [reply, setReply] = useState('');
  const [pending, start] = useTransition();
  return (
    <form action={() => start(async () => setReply(await askReminder(type)))}>
      <label>
        When
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="morning">Morning</option>
          <option value="evening">Evening</option>
          <option value="both">Both</option>
          <option value="off">Off</option>
        </select>
      </label>
      <button className="btn" disabled={pending} type="submit">Write the reminder</button>
      {reply && <p className="card">{reply}</p>}
    </form>
  );
}

export function SupportForm() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [pending, start] = useTransition();
  return (
    <form action={() => start(async () => setReply(await askSupport(message, 'general')))}>
      <label>Message <textarea value={message} onChange={(event) => setMessage(event.target.value)} required /></label>
      <button className="btn" disabled={pending} type="submit">Send</button>
      {reply && <p className="card">{reply}</p>}
    </form>
  );
}

export function RedeemForm() {
  const [code, setCode] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  return (
    <form action={() => start(async () => {
      setError('');
      try { setReply(await redeemCode(code)); } catch (err) { setError(err instanceof Error ? err.message : 'Could not redeem'); }
    })}>
      <label>Beta code <input value={code} onChange={(event) => setCode(event.target.value)} required /></label>
      <button className="btn" disabled={pending} type="submit">Redeem</button>
      {reply && <p>{reply}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export function SignOutButton() {
  const [pending, start] = useTransition();
  return <button type="button" className="btn secondary" disabled={pending} onClick={() => start(() => signOut())}>Sign out</button>;
}

export function DeleteAccountButton() {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  if (!armed) {
    return (
      <button type="button" className="text-btn danger" onClick={() => setArmed(true)}>
        Delete account
      </button>
    );
  }
  return (
    <div>
      <p>This removes your saved verses, reflections, and progress. A subscription is cancelled in the App Store, separately.</p>
      <p className="row">
        <button type="button" className="btn secondary" disabled={pending} onClick={() => setArmed(false)}>Keep my account</button>
        <button
          type="button"
          className="text-btn danger"
          disabled={pending}
          onClick={() => start(async () => {
            setError('');
            try {
              await deleteAccount();
            } catch (err) {
              if (isRedirect(err)) throw err;
              setError(err instanceof Error ? err.message : 'Could not delete account');
            }
          })}
        >
          {pending ? 'Deleting…' : 'Delete'}
        </button>
      </p>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
