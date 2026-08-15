// Every section stays reachable.
//
// Guards the v5 report "I can't navigate to Tea or all Stories now? Only the
// chosen ones for the day." Home's listen card opens the player inside the
// Stories stack; the player was presented as a modal, which covered the tab bar
// and made it inert, and the tab remembered the player afterwards. Between them
// the Stories list, its collections and the whole Tea surface became
// unreachable once you had played anything from Home.
const { test, expect } = require('@playwright/test');
const { skipOnboarding, waitForApp } = require('./helpers');

const SHOTS = process.env.SHOT_DIR || '/tmp/grace-shots';

// The tab bar renders last, above the stack content. Screens underneath keep
// their own "Stories"/"Tea" text mounted, so tab taps must target .last().
const tab = (page, name) => page.getByText(name, { exact: true }).last();

/** Click the first match that is actually on screen (screens stay mounted). */
async function clickVisible(page, locator, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const n = await locator.count();
    for (let i = n - 1; i >= 0; i--) {
      const el = locator.nth(i);
      if (await el.isVisible().catch(() => false)) { await el.click(); return true; }
    }
    await page.waitForTimeout(300);
  }
  throw new Error('no visible match to click');
}

test.describe('tab navigation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('Stories and Tea stay reachable after playing from Home', async ({ page }) => {
    await skipOnboarding(page);
    await waitForApp(page);

    // Open the player from Home's listen card.
    await tab(page, 'Today').click();
    // The card is disabled until its story resolves; tapping "Preparing…" is a
    // no-op and the player never opens.
    const listen = page.getByTestId('today-listen').last();
    await expect(listen).toBeVisible({ timeout: 20_000 });
    await expect(listen).not.toContainText('Preparing', { timeout: 20_000 });
    await listen.click();
    await expect(page.getByText('NOW PLAYING').last()).toBeVisible({ timeout: 20_000 });

    // The tab bar must still work from inside the player.
    await tab(page, 'Stories').click({ timeout: 20_000 });
    await expect(page.getByText('Real people. Real struggle. Real faith.').last())
      .toBeVisible({ timeout: 20_000 });

    // Every collection is present and the Tea segment is reachable.
    for (const c of ['Women of the Bible', 'Courage', 'Grief & Hope',
      "Jesus' Parables", 'Wilderness Seasons', 'Prayer Stories']) {
      await expect(page.getByText(c, { exact: true }).last()).toBeVisible();
    }
    await page.screenshot({ path: `${SHOTS}/30-stories-reachable.png` });

    await clickVisible(page, page.getByText('Tea', { exact: true }));
    await expect(page.getByText('A daily sermon, one minute at a time.').last())
      .toBeVisible({ timeout: 20_000 });
    await page.screenshot({ path: `${SHOTS}/31-tea-reachable.png` });
  });

  test('a collection opens and can be left again', async ({ page }) => {
    await skipOnboarding(page);
    await waitForApp(page);
    await tab(page, 'Stories').click();
    await page.waitForTimeout(1500);

    await clickVisible(page, page.getByText('Women of the Bible', { exact: true }));
    await expect(page.getByText('‹ Stories').last()).toBeVisible({ timeout: 20_000 });
    // Real listing, not an empty state.
    await expect(page.getByText(/\d+ stories/).last()).toBeVisible();

    await clickVisible(page, page.getByText('‹ Stories'));
    await expect(page.getByText('Real people. Real struggle. Real faith.').last())
      .toBeVisible({ timeout: 20_000 });
  });

  // Item 4: "when I click the back button on top left, it doesn't go out to
  // other texts". Two causes, both fixed: opening a chapter from Home made it
  // the ONLY route in the Reading stack (no `initial: false`), and paging
  // between chapters used push(), so back walked the chapters one at a time.
  test('Reading: a chapter opened from Home can be backed out of', async ({ page }) => {
    await skipOnboarding(page);
    await waitForApp(page);

    const read = page.getByTestId('today-reading').last();
    await expect(read).toBeVisible({ timeout: 20_000 });
    await read.click();

    // We are in the reader.
    await expect(page.getByText('KJV').last()).toBeVisible({ timeout: 25_000 });

    // One back press must leave the reader entirely, not dead-end on it.
    await clickVisible(page, page.getByText('\u2039', { exact: true }));
    await expect(page.getByText('Choose a place to begin. I\'ll keep it for you.').last())
      .toBeVisible({ timeout: 20_000 });
    await page.screenshot({ path: `${SHOTS}/32-reading-back.png` });
  });

  test('Reading: back from a chapter reached via a book returns to that book',
    async ({ page }) => {
      await skipOnboarding(page);
      await waitForApp(page);
      await tab(page, 'Reading').click();
      await page.waitForTimeout(1200);

      await clickVisible(page, page.getByText('39 books'));
      await page.waitForTimeout(1200);
      await clickVisible(page, page.getByText('Wisdom & Poetry'));
      await page.waitForTimeout(800);
      await clickVisible(page, page.getByText('Psalms', { exact: true }));
      await expect(page.getByTestId('book-resume').last()).toBeVisible({ timeout: 20_000 });

      await clickVisible(page, page.getByText('23', { exact: true }));
      await expect(page.getByText('KJV').last()).toBeVisible({ timeout: 25_000 });

      await clickVisible(page, page.getByText('\u2039', { exact: true }));
      await expect(page.getByTestId('book-resume').last()).toBeVisible({ timeout: 20_000 });
    });
});
