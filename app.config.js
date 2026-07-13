export default ({ config }) => ({
  ...config,
  extra: {
    apiBase: process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000',
    betaRedeemCode: process.env.EXPO_PUBLIC_BETA_REDEEM_CODE || 'grace-beta',
  },
});
