export default ({ config }) => ({
  ...config,
  extra: {
    apiBase:
      process.env.EXPO_PUBLIC_API_BASE ||
      'https://grace-api-production.up.railway.app',
    betaRedeemCode: process.env.EXPO_PUBLIC_BETA_REDEEM_CODE || 'grace-beta',
  },
});
