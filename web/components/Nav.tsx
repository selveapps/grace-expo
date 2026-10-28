'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/today', label: 'Today' },
  { href: '/reading', label: 'Reading' },
  { href: '/stories', label: 'Stories' },
  { href: '/tea', label: 'Tea' },
  { href: '/you', label: 'You' },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Primary">
      {LINKS.map((link) => {
        const on = path === link.href || path.startsWith(`${link.href}/`);
        return (
          <Link key={link.href} href={link.href} aria-current={on ? 'page' : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
