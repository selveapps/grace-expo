/** Google client ids always end in .apps.googleusercontent.com. */
const realClientId = (v) =>
  (typeof v === 'string' && v.trim().endsWith('.apps.googleusercontent.com') ? v.trim() : null);

const googleIosClientId = realClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
const googleUrlScheme = googleIosClientId
  ? `com.googleusercontent.apps.${googleIosClientId.replace(/\.apps\.googleusercontent\.com$/i, '')}`
  : null;

export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    ...(googleUrlScheme ? {
      infoPlist: {
        ...config.ios?.infoPlist,
        CFBundleURLTypes: [
          ...(config.ios?.infoPlist?.CFBundleURLTypes ?? []),
          { CFBundleURLSchemes: [googleUrlScheme] },
        ],
      },
    } : {}),
  },
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
    // Only a real Google client id counts. A placeholder left in by mistake
    // would otherwise light up a Google button that cannot complete a sign-in.
    googleIosClientId: realClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
    googleWebClientId: realClientId(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    googleIosUrlScheme: googleUrlScheme,
  },
});
