// Paywall entry/exit contract. These guard a bug that shipped twice: flipping
// `onboarded` was expected to move the user into the app, but React Navigation
// restored the existing stack and left her on the paywall ("same screen pops up").
//
// Covers the two behaviours that must not be confused with each other:
//   1. tapping empty space on the paywall (declining to buy) enters Home
//   2. a purchase that FAILS stays on the paywall with a recoverable error
const { test, expect } = require('@playwright/test');
const { mockAuth } = require('./helpers');

const SHOTS = process.env.SHOT_DIR || '/tmp/grace-shots';

// A fresh install: not onboarded, not subscribed.
const FRESH = {
  name: '', carrying: [], gentleness: 'Steadily', rhythm: 'morning',
  subscribed: false, savedVerses: [], reflections: [], onboarded: false,
  readingTheme: 'sepia', fontScale: 1, audioSpeed: 1, reducedMotion: false, email: '',
};

async function bootFresh(page, { auth = true } = {}) {
  await page.addInitScript((p) => {
    localStorage.setItem('grace.profile.v1', JSON.stringify(p));
    localStorage.removeItem('grace.session.v1');
    localStorage.removeItem('grace.deviceId');
  }, FRESH);
  // Sign-in is a real gate now, so reaching the paywall means passing it.
  if (auth) await mockAuth(page);
  await page.goto('/');
}

/**
 * Walk onboarding by clicking whatever "advance" control is on screen until the
 * paywall shows up. Label-driven rather than step-indexed so an added screen does
 * not break the test.
 */
// Screens already visited stay mounted in the native stack, so presence in the
// DOM proves nothing: every check here is on VISIBILITY.
const seen = async (loc) => {
  try { return await loc.last().isVisible(); } catch { return false; }
};

async function reachPaywall(page, name = 'Sam D.') {
  const cta = page.getByTestId('paywall-start-trial');
  for (let i = 0; i < 45; i++) {
    if (await seen(cta)) return true;

    // The name step needs typing before Continue does anything.
    const nameInput = page.getByPlaceholder('Your name');
    if (await seen(nameInput)) {
      await nameInput.last().fill(name).catch(() => {});
      await page.getByTestId('name-continue').last().click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(700);
      continue;
    }

    // The sign-in gate: there is no skip, so get past it with the email path.
    // (Apple is unavailable off-device, and there is no Google button at all.)
    if (await seen(page.getByTestId('signin-email-open'))) {
      await page.getByTestId('signin-email-open').last().click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(400);
    }
    if (await seen(page.getByTestId('signin-email-input'))) {
      await page.getByTestId('signin-email-input').last().fill('sam@example.com').catch(() => {});
      await page.getByTestId('signin-email-submit').last().click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1200);
      continue;
    }

    // Carry/Reflection steps want a chip picked before Continue means anything.
    for (const chip of ['Hope', 'Peace', 'Trust', 'Courage']) {
      const c = page.getByText(chip, { exact: true });
      if (await seen(c)) { await c.last().click({ timeout: 4000 }).catch(() => {}); break; }
    }

    // Every advance control in src/screens/onboarding, most specific first so we
    // never take a secondary path when a primary one is on screen.
    const ADVANCE = [
      'Continue', 'Begin', 'Keep this verse',
      'Amen, continue without keeping', 'Skip for now', 'Not right now',
    ];
    for (const label of ADVANCE) {
      const btn = page.getByText(label, { exact: true });
      if (await seen(btn)) {
        await btn.last().click({ timeout: 4000, force: true }).catch(() => {});
        break;
      }
    }
    await page.waitForTimeout(900);
    if (process.env.TRACE_FLOW) {
      const heads = await page.locator('div[dir="auto"], span').allInnerTexts().catch(() => []);
      const head = heads.find((t) => t && t.length > 12 && t.length < 70);
      console.log(`step ${i}: ${head ?? '(?)'}`);
    }
  }
  return seen(cta);
}

test.describe('v4 paywall flow', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('tapping empty space on the paywall enters Home', async ({ page }) => {
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));

    await bootFresh(page);
    const reached = await reachPaywall(page);
    expect(reached, 'never reached the paywall during onboarding').toBe(true);

    await expect(page.getByText('Begin your quiet')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/10-paywall.png` });

    // Restore must be reachable from the purchase screen.
    await expect(page.getByTestId('paywall-restore')).toBeVisible();

    // Tap high on the screen, well clear of the plan cards and the CTA island.
    await page.mouse.click(196, 96);

    // Lands on Home, and is NOT celebrated as a subscriber.
    await expect(page.getByText(/Good (morning|afternoon|evening)/))
      .toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Your place is ready')).toHaveCount(0);
    await page.screenshot({ path: `${SHOTS}/11-home-after-tapout.png` });

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('grace.profile.v1')));
    expect(stored.onboarded, 'tap-out should finish onboarding').toBe(true);
    expect(stored.subscribed, 'tap-out must NOT grant entitlement').toBe(false);
    expect(errs).toEqual([]);
  });

  test('a successful trial goes Confirmation -> Enter Grace -> Home', async ({ page }) => {
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));

    await bootFresh(page);
    // Entitlement granted. /beta/redeem needs a database this harness lacks.
    await page.route('**/beta/redeem', (r) => r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'trialing' }),
    }));

    expect(await reachPaywall(page, 'Sam')).toBe(true);
    await page.getByTestId('paywall-start-trial').click();

    // Confirmation, showing the name she actually typed rather than a placeholder.
    // `.last()` throughout: earlier onboarding screens stay mounted in the stack.
    const blessing = page.getByText('Your place is ready,').last();
    await expect(blessing).toBeVisible({ timeout: 20_000 });
    await expect(blessing).toContainText('Sam');
    await expect(blessing).not.toContainText('friend');
    // The trial subtext is the motivating line, not the old "Three days on us".
    await expect(page.getByText(/Everything is open for the next three days/).last()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/13-confirmation.png` });

    // Enter Grace must actually land on Home.
    await page.getByTestId('confirmation-enter').last().click();
    await expect(page.getByText(/Good (morning|afternoon|evening)/).last())
      .toBeVisible({ timeout: 20_000 });
    await page.screenshot({ path: `${SHOTS}/14-home-after-enter.png` });

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('grace.profile.v1')));
    expect(stored.subscribed).toBe(true);
    expect(stored.onboarded).toBe(true);
    expect(stored.name).toBe('Sam');
    expect(errs).toEqual([]);
  });

  test('a failed purchase stays gated with a recoverable error', async ({ page }) => {
    await bootFresh(page);
    // Force the entitlement call to fail.
    await page.route('**/beta/redeem', (r) => r.fulfill({ status: 500, body: '{}' }));

    const reached = await reachPaywall(page);
    expect(reached).toBe(true);

    await page.getByTestId('paywall-start-trial').click();

    // Still on the paywall, told plainly, and no entitlement granted.
    await expect(page.getByText(/haven't been charged/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Begin your quiet')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/12-paywall-failed.png` });

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('grace.profile.v1')));
    expect(stored.subscribed, 'a failed purchase must not grant entitlement').toBe(false);
    expect(stored.onboarded, 'a failed purchase must not bypass the paywall').toBe(false);
  });
});
