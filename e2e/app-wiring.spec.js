// @ts-check
const { test, expect } = require('@playwright/test');
const { skipOnboarding, waitForApp } = require('./helpers');

test.describe('Expo app — FE calls Grace API', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  test('boot creates guest session against API', async ({ page }) => {
    const guestReq = page.waitForRequest(
      (req) => req.url().includes('/auth/guest') && req.method() === 'POST',
      { timeout: 60_000 },
    );
    await page.goto('/');
    await guestReq;
    await page.waitForResponse(
      (res) => res.url().includes('/me') && res.status() === 200,
      { timeout: 60_000 },
    );
  });

  test('Reading tab loads chapter from API', async ({ page }) => {
    await waitForApp(page);
    await page.getByText('Reading', { exact: true }).click();

    const chapterRes = page.waitForResponse(
      (res) => /\/bible\/[^/]+\/\d+/.test(res.url()) && res.status() === 200,
      { timeout: 30_000 },
    );
    await page.getByText('CONTINUE READING').click();
    await chapterRes;
    await expect(page.getByText(/shepherd/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Search screen queries /bible/search', async ({ page }) => {
    await waitForApp(page);
    await page.getByText('Reading', { exact: true }).click();

    await page.getByTestId('reading-search').click();
    await expect(page.getByTestId('search-input')).toBeVisible();

    const searchRes = page.waitForResponse(
      (res) => res.url().includes('/bible/search') && res.status() === 200,
      { timeout: 20_000 },
    );
    await page.getByTestId('search-input').fill('peace');
    await page.getByTestId('search-submit').click();
    const res = await searchRes;
    const body = await res.json();
    expect(body.nt.length + body.ot.length).toBeGreaterThan(0);
    await expect(page.getByText(/John|Philippians|Psalm/i).first()).toBeVisible();
  });

  test('Today tab loads /today/verse', async ({ page }) => {
    const verseRes = page.waitForResponse(
      (res) => res.url().includes('/today/verse') && res.status() === 200,
      { timeout: 60_000 },
    );
    await waitForApp(page);
    await verseRes;
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 15_000 });
  });
});
