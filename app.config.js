export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    // App Store Connect listing name is "Grace: Bible BFF for Women"; the
    // home-screen name stays "Grace" (app.json `name`) so it never truncates.
    storeName: 'Grace: Bible BFF for Women',
    apiBase:
      process.env.EXPO_PUBLIC_API_BASE ||
      'https://grace-api-production.up.railway.app',
    betaRedeemCode: process.env.EXPO_PUBLIC_BETA_REDEEM_CODE || 'grace-beta',
    // Google OAuth client ids, from the Google Cloud console. The iOS one is
    // used by the App Store / TestFlight build; the web one is what Expo Go's
    // auth proxy needs. When neither is set the app hides the Google button
    // rather than offering a sign-in that cannot complete.
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || null,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || null,
  },
});
