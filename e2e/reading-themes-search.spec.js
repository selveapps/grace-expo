// Browse by theme, and scripture search.
//
// Both of these shipped looking complete and did nothing. The theme chips were
// `onPress={tick}` — a haptic and no navigation. Search rendered a perfectly
// good results screen against a `bible_verse` table that is empty wherever the
// KJV seed has not been run, so every query produced "No verses found".
//
// These specs are the regression net for both, and they run without Postgres:
// scripture now falls back to the bundled KJV, which is the whole point.
const { test, expect } = require('@playwright/test');
const { skipOnboarding, waitForApp } = require('./helpers');

const SHOTS = process.env.SHOT_DIR || '/tmp/grace-shots';
const tab = (page, name) => page.getByText(name, { exact: true }).last();

async function openReading(page) {
  await skipOnboarding(page);
  await waitForApp(page);
  await tab(page, 'Reading').click();
  await expect(page.getByText('BROWSE BY THEME').last()).toBeVisible({ timeout: 20_000 });
}

test.describe('browse by theme', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('a chip opens its passages, with verse text and a reason for each', async ({ page }) => {
    await openReading(page);

    await page.getByTestId('theme-chip-Courage').click();

    // The blurb proves we are on the theme screen and not somewhere generic.
    await expect(page.getByText('For the thing you already know you have to do.').last())
      .toBeVisible({ timeout: 20_000 });

    // Reference and editorial note render immediately from bundled data...
    await expect(page.getByText('PSALM 27:1-3').last()).toBeVisible();
    await expect(page.getByText('Whom shall I fear is a question, and it has no answer.').last())
      .toBeVisible();

    // ...and the verse text arrives from the API.
    await expect(page.getByText(/The LORD is my light and my salvation/).last())
      .toBeVisible({ timeout: 20_000 });

    await page.screenshot({ path: `${SHOTS}/50-theme-courage.png` });
  });

  test('tapping a passage opens that chapter at that verse', async ({ page }) => {
    await openReading(page);
    await page.getByTestId('theme-chip-Rest').click();

    await expect(page.getByText(/Come unto me, all ye that labour/).last())
      .toBeVisible({ timeout: 20_000 });

    await page.getByTestId('theme-passage-Matthew 11:28-30').click();

    // The reader, on the right chapter.
    await expect(page.getByText(/Matthew 11/).last()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Come unto me, all ye that labour/).last()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/51-theme-to-chapter.png` });
  });

  test('every theme chip leads somewhere real', async ({ page }) => {
    const THEMES = ['Comfort', 'Anxiety', 'Grief', 'Hope', 'Forgiveness', 'Courage', 'Rest', 'Gratitude'];
    await openReading(page);

    for (const theme of THEMES) {
      await page.getByTestId(`theme-chip-${theme}`).click();
      // Each theme screen is titled with its own name and lists passages.
      await expect(page.getByTestId('theme-back').last()).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText('Tap any passage to open the full chapter.').last())
        .toBeVisible({ timeout: 20_000 });
      await page.getByTestId('theme-back').click();
      await expect(page.getByText('BROWSE BY THEME').last()).toBeVisible({ timeout: 20_000 });
    }
  });
});

test.describe('scripture search', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  async function openSearch(page) {
    await openReading(page);
    await page.getByTestId('reading-search').click();
    await expect(page.getByTestId('search-input')).toBeVisible({ timeout: 20_000 });
  }

  test('a keyword returns verses from both testaments', async ({ page }) => {
    await openSearch(page);
    await page.getByTestId('search-input').fill('peace');

    // No Go press: results are debounced off typing.
    await expect(page.getByTestId('search-count')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Old Testament').last()).toBeVisible();
    await expect(page.getByText('New Testament').last()).toBeVisible();

    // The count must admit that results are capped rather than imply it found 100.
    await expect(page.getByTestId('search-count')).toContainText(/Showing \d+ of \d+ verses/);
    await page.screenshot({ path: `${SHOTS}/52-search-keyword.png` });
  });

  // The regression that mattered most: this used to return nothing at all,
  // because no verse contains the string "John 3:16".
  test('a reference returns that exact verse', async ({ page }) => {
    await openSearch(page);
    await page.getByTestId('search-input').fill('John 3:16');

    await expect(page.getByText('John 3:16').last()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/For God so loved the world/).last()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/53-search-reference.png` });
  });

  test('a suggestion runs a search, and a hit opens the chapter', async ({ page }) => {
    await openSearch(page);
    await page.getByTestId('search-suggest-Psalm 23').click();

    await expect(page.getByText(/The LORD is my shepherd/).last()).toBeVisible({ timeout: 20_000 });
    await page.getByText(/The LORD is my shepherd/).last().click();

    // Assert on something only the reader renders. The search screen stays in
    // the DOM behind the chapter, so matching on a bare reference picks up a
    // hidden result row instead of the header.
    await expect(page.getByText('Press & hold a verse for options.').last())
      .toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Psalms 23', { exact: true }).last()).toBeVisible();
  });

  test('a word that is not in the Bible says so plainly', async ({ page }) => {
    await openSearch(page);
    await page.getByTestId('search-input').fill('zzzqqq');
    await expect(page.getByTestId('search-empty')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('search-empty')).toContainText('No verses found');
  });

  test('clearing the field returns to the suggestions', async ({ page }) => {
    await openSearch(page);
    await page.getByTestId('search-input').fill('peace');
    await expect(page.getByTestId('search-count')).toBeVisible({ timeout: 20_000 });

    await page.getByTestId('search-clear').click();
    await expect(page.getByTestId('search-suggest-peace')).toBeVisible({ timeout: 20_000 });
  });
});
