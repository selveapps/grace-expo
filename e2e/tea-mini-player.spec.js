// The Tea mini player.
//
// Tea audio used to be owned by TeaDetailScreen and unloaded on blur, so
// leaving the screen silently killed playback. Ownership now sits in
// TeaAudioService, which means a clip keeps going — and that only works if
// there is a way to stop it from anywhere. That is this bar.
const { test, expect } = require('@playwright/test');
const { skipOnboarding, waitForApp } = require('./helpers');

const SHOTS = process.env.SHOT_DIR || '/tmp/grace-shots';
const tab = (page, name) => page.getByText(name, { exact: true }).last();

async function clickVisible(page, locator, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (let i = (await locator.count()) - 1; i >= 0; i--) {
      const el = locator.nth(i);
      if (await el.isVisible().catch(() => false)) { await el.click(); return; }
    }
    await page.waitForTimeout(300);
  }
  throw new Error('no visible match');
}

async function openATea(page) {
  await skipOnboarding(page);
  await waitForApp(page);
  await tab(page, 'Stories').click();
  await page.waitForTimeout(1500);
  await clickVisible(page, page.getByText('Tea', { exact: true }));
  await expect(page.getByText('A daily sermon, one minute at a time.').last())
    .toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1000);
  // The hero card opens the detail screen. Target its title, not the badge:
  // the badge's uppercase is a CSS transform, so its DOM text is "Today's tea".
  const hero = page.getByText(/^(All Her Living|She Would Not Come|Loyalty In The Barley|Court Under A Palm|The Most Costly Yes)$/);
  await clickVisible(page, hero);
  await expect(page.getByTestId('tea-play').last()).toBeVisible({ timeout: 20_000 });
}

test.describe('tea mini player', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('is hidden on Tea Detail, appears after leaving, and can stop playback',
    async ({ page }) => {
      await openATea(page);

      // Detail owns the full controls, so the bar must not double up here.
      await expect(page.getByTestId('mini-player-toggle')).toHaveCount(0);

      await page.getByTestId('tea-play').last().click();
      await page.waitForTimeout(2500);

      // Leave Tea entirely.
      await tab(page, 'Today').click();
      await page.waitForTimeout(1500);

      // The bar is now the only way to stop it, so it has to be here.
      const toggle = page.getByTestId('mini-player-toggle').last();
      await expect(toggle).toBeVisible({ timeout: 15_000 });
      await page.screenshot({ path: `${SHOTS}/40-mini-player.png` });

      // Pause and resume both work from outside Tea.
      await toggle.click();
      await page.waitForTimeout(800);
      await expect(toggle).toBeVisible();
      await toggle.click();
      await page.waitForTimeout(800);
      await expect(toggle).toBeVisible();

      // Closing dismisses it for good.
      await page.getByTestId('mini-player-close').last().click();
      await expect(page.getByTestId('mini-player-toggle')).toHaveCount(0, { timeout: 15_000 });
      await page.screenshot({ path: `${SHOTS}/41-mini-player-closed.png` });
    });

  test('does not appear when nothing is playing', async ({ page }) => {
    await skipOnboarding(page);
    await waitForApp(page);
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('mini-player-toggle')).toHaveCount(0);
  });
});
