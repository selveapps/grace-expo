import type { Metadata } from 'next';
import { Cormorant_Garamond, Hanken_Grotesk } from 'next/font/google';
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
  title: 'Grace',
  description: 'An audio-first Bible. Today’s reading, stories, and Tea.',
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
