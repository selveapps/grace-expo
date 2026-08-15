// Ensures react-native-purchases autolinks under Expo SDK 54 + New Architecture.
// See docs/IAP_REVENUECAT_SUPERWALL.md and RevenueCat issue #1747.
module.exports = {
  dependencies: {
    'react-native-purchases': {
      platforms: { ios: {}, android: {} },
    },
  },
};
