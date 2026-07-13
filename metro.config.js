const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude backend from Metro bundler (mobile app only).
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /backend\/.*/,
  /e2e\/.*/,
  /test-results\/.*/,
  /playwright-report\/.*/,
];

module.exports = config;
