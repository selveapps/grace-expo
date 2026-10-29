import type { Metadata } from 'next';

export const SITE_NAME = 'Grace';

export const PRIVATE_PAGE: Metadata = {
  robots: { index: false, follow: false },
};

export const SITE_DESCRIPTION =
  'Grace is a Bible companion that reads to you. A little scripture, stories told properly, and Tea. She keeps your place. She does not guard a streak.';

const DEFAULT_SITE = 'https://grace.selveapps.xyz';

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE).replace(/\/$/, '');
}
