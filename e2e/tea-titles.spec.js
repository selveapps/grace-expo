// Tea card titles and the card -> detail title continuity.
const { test, expect } = require('@playwright/test');
const { skipOnboarding, waitForApp } = require('./helpers');

const SHOTS = process.env.SHOT_DIR || '/tmp/grace-shots';

// Every title in the shipped catalogue, so this fails if one is dropped or
// rewritten into a sentence.
const TITLES = [
  'She Would Not Come', 'Loyalty In The Barley', 'Court Under A Palm',
  'She Intercepted A King', 'The Most Costly Yes', 'The Better Part',
  'She Left The Waterpot', 'If I Perish', 'Only Her Lips Moved',
  'The First To See', 'The Scarlet Cord', 'Milk, Then A Hammer',
  'She Took His Signet', 'Timbrel On The Shore', 'I Will Not Leave',
  'Borrow Not A Few', 'Twelve Years, One Touch', 'She Argued For Crumbs',
  'Decades Of Showing Up', 'And She Constrained Us', 'She Taught The Teacher',
  'Laughter Behind The Tent', 'Thou God Seest Me', 'Five Sisters Speak Right',
  'They Asked The Prophetess', 'All Her Living', 'Of Their Own Substance',
  'The Coats She Made', 'A Succourer Of Many', 'A Year Poured Out',
];

async function openTea(page) {
  await skipOnboarding(page);
  await waitForApp(page);
  await page.getByText('Stories', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await page.getByText('Tea', { exact: true }).first().click();
  // Wait for the surface itself rather than a fixed delay.
  await expect(page.getByText('A daily sermon, one minute at a time.').last())
    .toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1200);
}

/** The first catalogue title actually visible on screen. */
async function visibleTitle(page) {
  for (const t of TITLES) {
    const loc = page.getByText(t, { exact: true });
    if (await loc.count() && await loc.first().isVisible()) return t;
  }
  return null;
}

test.describe('tea card titles', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('all 30 titles are 3-4 words and present in the catalogue', async ({ page }) => {
    await openTea(page);

    // Pull what the API actually serves, so this covers the wire format too.
    const served = await page.evaluate(async () => {
      const res = await fetch('http://localhost:3000/tea');
      const j = await res.json();
      return (j.tea || []).map((t) => ({ id: t.id, cardTitle: t.cardTitle }));
    });
    expect(served.length).toBe(30);
    for (const t of served) {
      expect(t.cardTitle, `${t.id} has no cardTitle`).toBeTruthy();
      const words = t.cardTitle.trim().split(/\s+/).length;
      expect(words, `${t.id}: "${t.cardTitle}" is ${words} words`).toBeGreaterThanOrEqual(3);
      expect(words, `${t.id}: "${t.cardTitle}" is ${words} words`).toBeLessThanOrEqual(4);
    }
    expect(served.map((t) => t.cardTitle).sort()).toEqual([...TITLES].sort());
  });

  test('cards render their title, and it carries into detail', async ({ page }) => {
    await openTea(page);

    // Cards carry catalogue titles, not slices of the narration.
    const heroTitle = await visibleTitle(page);
    expect(heroTitle, 'no catalogue card title visible on the Tea surface').not.toBeNull();
    await page.screenshot({ path: `${SHOTS}/20-tea-cards.png` });

    // Opacity counts here: the title is animated out, not unmounted, so a plain
    // visibility check would happily pass on a fully transparent element.
    const shown = (t) => page.evaluate((title) => {
      const els = [...document.querySelectorAll('div,span')].filter((e) => !e.children.length);
      return els.filter((e) => {
        if ((e.textContent || '').trim() !== title) return false;
        const r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        // Opacity is inherited through the animated wrappers.
        let node = e, op = 1;
        while (node && node !== document.body) {
          op *= parseFloat(getComputedStyle(node).opacity || '1');
          node = node.parentElement;
        }
        return op > 0.1;
      }).length;
    }, t);

    // On the first frame the tapped line is still there, so nothing flashes.
    await page.getByText(heroTitle, { exact: true }).first().click();
    await page.waitForTimeout(200); // inside the hold, before the departure runs
    expect(await shown(heroTitle), 'title flashed out instantly instead of handing over')
      .toBeGreaterThan(0);

    // Once settled it is gone: it hands over to artwork + hook + captions and
    // never becomes a second persistent headline.
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SHOTS}/21-tea-detail.png` });
    expect(await shown(heroTitle), 'card title persisted as a detail heading').toBe(0);

    // And the Grace lockup appears exactly once, up top.
    const marks = await page.evaluate(() => {
      const els = [...document.querySelectorAll('div,span')].filter((e) => !e.children.length);
      return els.filter((e) => (e.textContent || '').trim() === 'Grace'
        && e.getBoundingClientRect().width > 0)
        .map((e) => Math.round(e.getBoundingClientRect().top));
    });
    expect(marks.length, `expected one Grace lockup, saw ${marks.length}`).toBe(1);
    expect(marks[0], 'Grace lockup is not at the top of the screen').toBeLessThan(140);
  });
});
