import type { Metadata } from 'next';
import { Cormorant_Garamond, Hanken_Grotesk } from 'next/font/google';
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from '@/lib/site';
import './globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Grace — a Bible that reads to you',
    template: '%s · Grace',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['Bible', 'KJV', 'audio devotion', 'scripture', 'Grace', 'daily reading'],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Grace — a Bible that reads to you',
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grace — a Bible that reads to you',
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans), "Hanken Grotesk", sans-serif' }}>
        <style>{`:root { --serif: var(--font-serif), Georgia, serif; --sans: var(--font-sans), sans-serif; }`}</style>
        {children}
      </body>
    </html>
  );
}
