// Home must not go blank when today's content fails, comes back empty, or
// never arrives. App Review's 2.1(a) note was a stuck blank screen after
// onboarding because the load failed. The greeting, a real passage, and a
// retry have to be on screen — including the short iPad compatibility window.
const { test, expect } = require('@playwright/test');
const { skipOnboarding } = require('./helpers');

const LIVE = {
  name: 'E2E',
  dailyVerse: { ref: 'John 1:1', text: 'In the beginning was the Word, and the Word was with God.' },
  recommendedReading: { book: 'John', chapter: 1 },
  recommendedStory: {
    id: 'mary-annunciation',
    title: 'Mary',
    scriptureRange: 'Luke 1',
    durationSeconds: 197,
  },
};

function isTodayAggregate(url) {
  try {
    const path = new URL(url).pathname;
    return path === '/today';
  } catch {
    return false;
  }
}

test.describe('Today survives a failed content load', () => {
  test('a successful /today does not show the failure banner', async ({ page }) => {
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await skipOnboarding(page);
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await expect(page.getByText(/Good (morning|afternoon|evening)/).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('today-listen')).toBeVisible();
    await expect(page.getByText(/Ruth stays|Mary/).first()).toBeVisible();
    await expect(page.getByTestId('today-load-error')).toHaveCount(0);
    expect(errs).toEqual([]);
  });

  test('a failed /today shows a retry and a real passage, and Reading still opens', async ({ page }) => {
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await skipOnboarding(page);
    await page.route('**/*', (route) => {
      if (isTodayAggregate(route.request().url())) {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      }
      return route.continue();
    });

    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    await expect(page.getByText(/Good (morning|afternoon|evening)/).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('today-load-error')).toBeVisible();
    await expect(page.getByTestId('today-retry')).toBeVisible();
    await expect(page.getByText(/shepherd/i).first()).toBeVisible();
    await expect(page.getByText('Ruth stays').first()).toBeVisible();
    await expect(page.getByText('Preparing…')).toHaveCount(0);

    await page.getByText('Reading', { exact: true }).click();
    await expect(page.getByText('Old Testament')).toBeVisible();
    expect(errs).toEqual([]);
  });

  test('an empty /today payload is the same visible failure, and retry can recover', async ({ page }) => {
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await skipOnboarding(page);

    let live = false;
    await page.route('**/*', (route) => {
      if (!isTodayAggregate(route.request().url())) return route.continue();
      if (!live) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: '',
            dailyVerse: null,
            recommendedStory: null,
            recommendedReading: null,
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(LIVE),
      });
    });

    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await expect(page.getByTestId('today-load-error')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/shepherd/i).first()).toBeVisible();

    live = true;
    await page.getByTestId('today-retry').click();
    await expect(page.getByText('In the beginning was the Word, and the Word was with God.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('today-load-error')).toHaveCount(0);
    await expect(page.getByText('Mary').first()).toBeVisible();
    expect(errs).toEqual([]);
  });

  test('a request that never returns still surfaces retry on a short frame', async ({ page }) => {
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await skipOnboarding(page);
    await page.route('**/*', (route) => {
      if (isTodayAggregate(route.request().url())) return undefined; // hang
      return route.continue();
    });

    // The iPad compatibility window the previous review used: phone width, short height.
    await page.setViewportSize({ width: 390, height: 320 });
    await page.goto('/');

    const retry = page.getByTestId('today-retry');
    await expect(retry).toBeVisible({ timeout: 20_000 });
    await retry.scrollIntoViewIfNeeded();
    await expect(retry).toBeInViewport();
    await expect(page.getByText(/shepherd/i).first()).toBeVisible();
    await expect(page.getByText(/Good (morning|afternoon|evening)/).first()).toBeVisible();
    expect(errs).toEqual([]);
  });
});
