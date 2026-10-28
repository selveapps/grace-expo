import { describe, expect, it } from 'vitest';
import { BOOK_NAMES, NT_BOOKS, OT_BOOKS, bookToSlug, chapterHref, slugToBook } from './books';

describe('books', () => {
  it('lists the 66-book Protestant canon, 39 then 27', () => {
    expect(BOOK_NAMES).toHaveLength(66);
    expect(OT_BOOKS).toHaveLength(39);
    expect(NT_BOOKS).toHaveLength(27);
    expect(OT_BOOKS[0]).toBe('Genesis');
    expect(NT_BOOKS[0]).toBe('Matthew');
    expect(NT_BOOKS.at(-1)).toBe('Revelation');
  });

  it('round-trips numbered books', () => {
    expect(bookToSlug('1 Samuel')).toBe('1-samuel');
    expect(slugToBook('1-samuel')).toBe('1 Samuel');
    expect(slugToBook('song-of-solomon')).toBe('Song of Solomon');
    expect(slugToBook('nope')).toBeNull();
  });

  it('builds a chapter path', () => {
    expect(chapterHref('Psalms', 23)).toBe('/reading/psalms/23');
  });
});
