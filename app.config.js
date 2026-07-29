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
  },
});
