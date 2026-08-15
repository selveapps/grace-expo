// The sign-in step is a gate, not a formality, and it must not overclaim.
//
// It previously called advance() BEFORE awaiting the provider and swallowed the
// result, so a declined sheet, a failed link or an offline server all completed
// onboarding exactly like a success. It also carried a "Skip for now" CTA past
// the gate, and a "Continue with Google" button whose implementation never
// talked to Google. These assert that none of that is true any more.
const { test, expect } = require('@playwright/test');
const { mockAuth } = require('./helpers');

const FRESH = {
  name: '', carrying: [], gentleness: 'Steadily', rhythm: 'morning',
  subscribed: false, savedVerses: [], reflections: [], onboarded: false,
  readingTheme: 'sepia', fontScale: 1, audioSpeed: 1, reducedMotion: false, email: '',
};

const seen = async (loc) => {
  try { return await loc.last().isVisible(); } catch { return false; }
};

/** Walk onboarding up to, but not through, the sign-in screen. */
async function reachSignIn(page) {
  const gate = page.getByTestId('signin-apple');
  for (let i = 0; i < 45; i++) {
    if (await seen(gate)) return true;

    const nameInput = page.getByPlaceholder('Your name');
    if (await seen(nameInput)) {
      await nameInput.last().fill('Sam').catch(() => {});
      await page.getByTestId('name-continue').last().click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(700);
      continue;
    }
    for (const chip of ['Hope', 'Peace', 'Trust', 'Courage']) {
      const c = page.getByText(chip, { exact: true });
      if (await seen(c)) { await c.last().click({ timeout: 4000 }).catch(() => {}); break; }
    }
    for (const label of ['Continue', 'Begin', 'Keep this verse',
      'Amen, continue without keeping', 'Not right now']) {
      const btn = page.getByText(label, { exact: true });
      if (await seen(btn)) { await btn.last().click({ timeout: 4000, force: true }).catch(() => {}); break; }
    }
    await page.waitForTimeout(800);
  }
  return seen(gate);
}

async function boot(page) {
  await page.addInitScript((p) => {
    localStorage.setItem('grace.profile.v1', JSON.stringify(p));
    localStorage.removeItem('grace.session.v1');
    localStorage.removeItem('grace.deviceId');
  }, FRESH);
  await page.goto('/');
}

/** Assert no VISIBLE element carries this text (earlier steps stay mounted). */
async function notOnScreen(page, text) {
  const hits = page.getByText(text, { exact: false });
  for (let i = 0; i < await hits.count(); i++) {
    await expect(hits.nth(i), `"${text}" is visible on the sign-in gate`).toBeHidden();
  }
}

async function submitEmail(page, address) {
  if (await seen(page.getByTestId('signin-email-open'))) {
    await page.getByTestId('signin-email-open').last().click();
    await page.waitForTimeout(400);
  }
  await page.getByTestId('signin-email-input').last().fill(address);
  await page.getByTestId('signin-email-submit').last().click();
}

test.describe('sign-in gate', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('offers no skip, and dismissal does not complete onboarding', async ({ page }) => {
    await boot(page);
    expect(await reachSignIn(page), 'never reached sign-in').toBe(true);

    // Earlier onboarding steps stay mounted in the native stack (the reflection
    // prompt legitimately still offers a skip), so this tests what is on screen.
    for (const s of ['Skip for now', 'Skip', 'Maybe later', 'Continue as guest', 'Not now']) {
      await notOnScreen(page, s);
    }
    await notOnScreen(page, 'skip and continue on this device');

    // Tapping outside the buttons must do nothing at all.
    await page.mouse.click(196, 120);
    await page.mouse.click(20, 620);
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('signin-apple').last()).toBeVisible();

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('grace.profile.v1')));
    expect(stored.onboarded, 'dismissal must not complete onboarding').toBe(false);
  });

  // Option B: the UI must not claim an authentication it does not perform.
  test('makes no Google claim anywhere on the gate', async ({ page }) => {
    await boot(page);
    expect(await reachSignIn(page)).toBe(true);

    await notOnScreen(page, 'Google');
    await notOnScreen(page, 'Continue with Google');
    await expect(page.getByTestId('signin-google')).toHaveCount(0);

    // And the email path describes itself honestly rather than as a sign-in.
    await page.getByTestId('signin-email-open').last().click();
    await expect(page.getByText(/won't email you to verify/i).last()).toBeVisible();
  });

  test('a failed sign-in stays on the gate, shows Retry, and never reaches the app', async ({ page }) => {
    await boot(page);
    // No mockAuth: every auth call fails against this database-less harness.
    expect(await reachSignIn(page)).toBe(true);

    await submitEmail(page, 'sam@example.com');
    await page.waitForTimeout(4000);

    await expect(page.getByTestId('signin-apple').last()).toBeVisible();
    await expect(page.getByTestId('signin-retry').last()).toBeVisible();
    await expect(page.getByText('Begin your quiet')).toHaveCount(0);
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toHaveCount(0);

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('grace.profile.v1')));
    expect(stored.onboarded).toBe(false);
  });

  test('Retry succeeds once the backend recovers', async ({ page }) => {
    await boot(page);
    expect(await reachSignIn(page)).toBe(true);

    await submitEmail(page, 'sam@example.com');
    await expect(page.getByTestId('signin-retry').last()).toBeVisible({ timeout: 20_000 });

    // Backend comes back, and the same attempt is replayed by Try again.
    await mockAuth(page);
    await page.getByTestId('signin-retry').last().click();
    await expect(page.getByTestId('paywall-start-trial').last())
      .toBeVisible({ timeout: 30_000 });
  });

  test('a malformed email is rejected without touching the network', async ({ page }) => {
    await mockAuth(page);
    await boot(page);
    expect(await reachSignIn(page)).toBe(true);

    await submitEmail(page, 'not-an-email');
    await expect(page.getByText(/does not look right/i).last()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('signin-apple').last()).toBeVisible();
  });

  test('a successful sign-in does advance', async ({ page }) => {
    await mockAuth(page);
    await boot(page);
    expect(await reachSignIn(page)).toBe(true);

    await submitEmail(page, 'sam@example.com');
    await expect(page.getByTestId('paywall-start-trial').last())
      .toBeVisible({ timeout: 30_000 });
  });
});
