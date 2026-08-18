// Legal + attribution constants, referenced from Settings and the paywall.
// The documents themselves live in `docs/legal/` and are published at these
// URLs; App Store Connect points at the same two links (Privacy Policy URL and
// the EULA field), which Guideline 3.1.2 requires next to the subscription CTA.
// The `www` host is canonical. The apex redirects to it with a 308 rather than
// being dead, so either form opens, but linking straight at `www` saves the
// redirect hop and does not depend on that redirect staying configured.
export const LEGAL = {
  privacyUrl: 'https://www.selveapps.xyz/grace/privacy',
  termsUrl: 'https://www.selveapps.xyz/grace/terms',
  supportUrl: 'https://www.selveapps.xyz/grace/support',
  supportEmail: 'support@selveapps.xyz',
  // KJV is public domain; stated in Settings > About per attribution practice.
  scriptureAttribution: 'Scripture quotations are from the King James Version (KJV), which is in the public domain.',
};
