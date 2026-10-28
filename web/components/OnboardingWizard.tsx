'use client';

import { useState, useTransition } from 'react';
import { finishOnboarding } from '@/lib/actions';
import { CARRY_OPTIONS, GENTLENESS, PLANS, REFLECTION_WORDS, RHYTHM, canContinueCarry, toggleCarry } from '@/lib/onboarding';

const STEPS = ['name', 'carry', 'gentleness', 'rhythm', 'reflection', 'plans'] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [carrying, setCarrying] = useState<string[]>(['Hope']);
  const [gentleness, setGentleness] = useState('Steadily');
  const [rhythm, setRhythm] = useState('morning');
  const [reflection, setReflection] = useState('Trust');

  const current = STEPS[step];

  function next() {
    if (current === 'carry' && !canContinueCarry(carrying)) {
      setError('Choose at least one.');
      return;
    }
    setError('');
    setStep((value) => Math.min(STEPS.length - 1, value + 1));
  }

  return (
    <main className="page">
      <p className="kicker">Grace · {step + 1} of {STEPS.length}</p>
      {current === 'name' && (
        <>
          <h1>What should Grace call you?</h1>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="given-name" />
          </label>
        </>
      )}
      {current === 'carry' && (
        <>
          <h1>What are you carrying today?</h1>
          <p className="lede">Choose all that feel true.</p>
          <div className="row">
            {CARRY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className="chip"
                aria-pressed={carrying.includes(option)}
                onClick={() => setCarrying((selected) => toggleCarry(selected, option))}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
      {current === 'gentleness' && (
        <>
          <h1>How direct should Grace be?</h1>
          <div className="row">
            {GENTLENESS.map((option) => (
              <button key={option.key} type="button" className="chip" aria-pressed={gentleness === option.word} onClick={() => setGentleness(option.word)}>
                {option.word}
              </button>
            ))}
          </div>
        </>
      )}
      {current === 'rhythm' && (
        <>
          <h1>When do you want a reminder?</h1>
          <div className="row">
            {RHYTHM.map((option) => (
              <button key={option.key} type="button" className="chip" aria-pressed={rhythm === option.key} onClick={() => setRhythm(option.key)}>
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
      {current === 'reflection' && (
        <>
          <h1>A word to keep</h1>
          <div className="row">
            {REFLECTION_WORDS.map((word) => (
              <button key={word} type="button" className="chip" aria-pressed={reflection === word} onClick={() => setReflection(word)}>
                {word}
              </button>
            ))}
          </div>
        </>
      )}
      {current === 'plans' && (
        <>
          <h1>Grace Plus</h1>
          <p className="lede">Subscriptions are purchased in the iOS app. You can enter Grace either way.</p>
          {PLANS.map((plan) => (
            <article className="card" key={plan.id}>
              <h2>{plan.name}</h2>
              <p>{plan.price}</p>
              <p className="meta">{plan.detail} Product {plan.id}.</p>
            </article>
          ))}
          <p className="meta">
            <a href="https://www.selveapps.xyz/grace/terms">Terms</a>
            {' · '}
            <a href="https://www.selveapps.xyz/grace/privacy">Privacy</a>
          </p>
        </>
      )}
      {error && <p className="error">{error}</p>}
      <p>
        {step > 0 && <button type="button" className="btn secondary" onClick={() => setStep((value) => value - 1)}>Back</button>}
        {' '}
        {current === 'plans' ? (
          <button
            type="button"
            className="btn"
            disabled={pending}
            onClick={() => start(() => finishOnboarding({ name, carrying, gentleness, rhythm, reflection }))}
          >
            {pending ? 'Entering…' : 'Enter Grace'}
          </button>
        ) : (
          <button type="button" className="btn" onClick={next}>Continue</button>
        )}
      </p>
    </main>
  );
}
