// Render contract for the screens reworked in the v4 feedback pass.
const { test, expect } = require('@playwright/test');
const { skipOnboarding, waitForApp } = require('./helpers');

const SHOTS = process.env.SHOT_DIR || '/tmp/grace-shots';

function watchConsole(page, sink) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') sink.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => sink.push(`[pageerror] ${e.message}`));
}

test.describe('v4 render smoke', () => {
  // iPhone 15 Pro logical size: the layout decisions are phone decisions.
  test.use({ viewport: { width: 393, height: 852 } });

  test('every reworked screen renders without a page error', async ({ page }) => {
    const errs = [];
    watchConsole(page, errs);
    await skipOnboarding(page);
    await waitForApp(page);

    // Today — the listen + continue cards are now real controls.
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
    // The listen card must resolve to a real story, not sit on "Preparing…".
    const listen = page.getByTestId('today-listen');
    await expect(listen).toBeVisible({ timeout: 20_000 });
    await expect(listen).not.toContainText('Preparing', { timeout: 20_000 });
    // The verse card must fill in too. Here every DB-backed endpoint 500s, so
    // this is exercising the whole fallback chain down to the public API.
    await expect(page.getByText(/^[1-3]?\s?[A-Z][A-Z]+\s+\d+[:\d\-]*$/)).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: `${SHOTS}/01-today.png`, fullPage: false });

    // Stories — featured art, three prominent rows, then the rail.
    await page.getByText('Stories', { exact: true }).first().click();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${SHOTS}/02-stories.png` });

    // Tea — must now be a light surface.
    await page.getByText('Tea', { exact: true }).first().click();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${SHOTS}/03-tea.png` });

    // Reading -> Old Testament -> Psalms, for the heading contrast and the grid.
    await page.getByText('Reading', { exact: true }).first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/04-reading.png` });

    // The OT card wraps its title across two lines, so target its book count.
    await page.getByText('39 books').first().click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/05-ot.png` });

    // Books live inside collapsed group accordions, so open the one holding Psalms.
    await page.getByText('Wisdom & Poetry').first().click({ timeout: 15_000 });
    await page.waitForTimeout(900);
    await page.getByText('Psalms', { exact: true }).first().click({ timeout: 15_000 });
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${SHOTS}/06-psalms.png` });

    // Reading controls: the resume card is real and names a real chapter, and
    // the book title is set on-dark so it is not lost in the espresso hero.
    const resume = page.getByTestId('book-resume').last();
    await expect(resume).toBeVisible({ timeout: 15_000 });
    await expect(resume).toContainText('Psalms');
    // 150 chapters, not the old hardcoded default of 30.
    await expect(page.getByText('150 chapters').last()).toBeVisible();
    await expect(page.getByText('126–150').last()).toBeVisible();

    const fatal = errs.filter((e) => e.startsWith('[pageerror]'));
    console.log('--- console output ---');
    for (const e of errs.slice(0, 40)) console.log(e);
    expect(fatal, `page errors:\n${fatal.join('\n')}`).toEqual([]);
  });
});
