const ONBOARDED_PROFILE = {
  name: 'E2E',
  carrying: ['Hope'],
  gentleness: 'Steadily',
  rhythm: 'morning',
  subscribed: true,
  savedVerses: [],
  reflections: [],
  onboarded: true,
  readingTheme: 'sepia',
  fontScale: 1,
  audioSpeed: 1,
  reducedMotion: false,
};

/** @param {import('@playwright/test').Page} page */
async function skipOnboarding(page) {
  await page.addInitScript((profile) => {
    localStorage.setItem('grace.profile.v1', JSON.stringify(profile));
    localStorage.removeItem('grace.session.v1');
    localStorage.removeItem('grace.deviceId');
  }, ONBOARDED_PROFILE);
}

/** @param {import('@playwright/test').Page} page */
async function waitForApp(page) {
  await page.goto('/');
  await page.getByText(/Good (morning|afternoon|evening)|Reading/).first().waitFor({ timeout: 60_000 });
}

/** @param {import('@playwright/test').APIRequestContext} request */
async function apiGuest(request) {
  const deviceId = `e2e-${Date.now()}`;
  const guest = await request.post('http://127.0.0.1:3000/auth/guest', {
    data: { deviceId },
  });
  if (!guest.ok()) {
    const body = await guest.text();
    throw new Error(`guest auth failed: ${guest.status()} ${body}`);
  }
  const body = await guest.json();
  return {
    token: body.session.accessToken,
    refresh: body.session.refreshToken,
    userId: body.user.id,
  };
}

module.exports = { skipOnboarding, waitForApp, apiGuest, ONBOARDED_PROFILE };
