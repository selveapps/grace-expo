import type { MetadataRoute } from 'next';
import { BOOK_NAMES, bookToSlug, chapterCount } from '@/lib/books';
import { publicGrace } from '@/lib/grace';
import { siteUrl } from '@/lib/site';
import { themeNames } from '@/lib/themes';

type Story = { id: string };
type Tea = { id: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/reading`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/reading/search`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/stories`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/tea`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/tea/today`, changeFrequency: 'daily', priority: 0.7 },
  ];

  for (const name of themeNames()) {
    pages.push({
      url: `${base}/reading/themes/${encodeURIComponent(name)}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  for (const book of BOOK_NAMES) {
    const slug = bookToSlug(book);
    const last = chapterCount(book);
    for (let chapter = 1; chapter <= last; chapter += 1) {
      pages.push({
        url: `${base}/reading/${slug}/${chapter}`,
        changeFrequency: 'yearly',
        priority: 0.5,
      });
    }
  }

  try {
    const data = await publicGrace<{ stories?: Story[] }>('/stories', 300);
    for (const story of data.stories ?? []) {
      pages.push({
        url: `${base}/stories/${encodeURIComponent(story.id)}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    // The catalog is optional. Chapter URLs still ship.
  }

  try {
    const data = await publicGrace<{ tea?: Tea[] }>('/tea', 300);
    for (const item of data.tea ?? []) {
      pages.push({
        url: `${base}/tea/${encodeURIComponent(item.id)}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    // Same as stories.
  }

  return pages;
}
