// The bundled KJV that backs every scripture route when the database has no
// rows. No database needed, so these run anywhere.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  kjvAvailable,
  kjvChapter,
  kjvPassage,
  kjvSearch,
  kjvRefHits,
  parseReferenceQuery,
} from '../src/lib/kjv.js';

describe('bundled KJV', () => {
  test('the data file ships and parses', () => {
    assert.ok(kjvAvailable(), 'data/kjv.full.json is missing from the build');
  });

  test('reads a chapter with contiguous verse numbers', () => {
    const ps23 = kjvChapter('Psalms', 23);
    assert.ok(ps23);
    assert.equal(ps23!.length, 6);
    assert.equal(ps23![0].n, 1);
    assert.match(ps23![0].t, /^The LORD is my shepherd/);
    ps23!.forEach((v, i) => assert.equal(v.n, i + 1));
  });

  // The source prefixes Psalm superscriptions to verse 1 in square brackets.
  // Left in, every Psalm would open with "[To the chief Musician...]" and the
  // bracket text would pollute search results.
  test('psalm superscriptions are stripped, not left in verse 1', () => {
    assert.doesNotMatch(kjvChapter('Psalms', 3)![0].t, /^\[/);
    assert.match(kjvChapter('Psalms', 3)![0].t, /^LORD, how are they increased/);
  });

  test('unknown books and out-of-range chapters return null', () => {
    assert.equal(kjvChapter('Hezekiah', 1), null);
    assert.equal(kjvChapter('Jude', 2), null);
    assert.equal(kjvChapter('Genesis', 51), null);
  });

  test('reads a multi-verse passage as one string', () => {
    const text = kjvPassage('Psalms', 27, 1, 3);
    assert.ok(text);
    assert.match(text!, /^The LORD is my light/);
    assert.ok(text!.length > 200, 'three verses should be more than one clause');
  });

  test('every book named in the canon is present and non-empty', () => {
    for (const book of ['Genesis', 'Psalms', '1 Samuel', 'Song of Solomon', 'John', '3 John', 'Revelation']) {
      assert.ok(kjvChapter(book, 1)?.length, `${book} 1 is empty`);
    }
  });
});

describe('reference queries', () => {
  test('parses book chapter verse in the forms a user actually types', () => {
    assert.deepEqual(parseReferenceQuery('John 3:16'), { book: 'John', chapter: 3, verseStart: 16, verseEnd: 16 });
    assert.deepEqual(parseReferenceQuery('john 3:16'), { book: 'John', chapter: 3, verseStart: 16, verseEnd: 16 });
    assert.deepEqual(parseReferenceQuery('Psalm 23'), { book: 'Psalms', chapter: 23 });
    assert.deepEqual(parseReferenceQuery('ps 23:1-4'), { book: 'Psalms', chapter: 23, verseStart: 1, verseEnd: 4 });
    assert.deepEqual(parseReferenceQuery('1 Cor 13:4'), { book: '1 Corinthians', chapter: 13, verseStart: 4, verseEnd: 4 });
  });

  test('a bare book name is a browse intent, not a reference', () => {
    assert.equal(parseReferenceQuery('John'), null);
    assert.equal(parseReferenceQuery('Psalms'), null);
  });

  test('ordinary words are not mistaken for references', () => {
    assert.equal(parseReferenceQuery('peace'), null);
    assert.equal(parseReferenceQuery('love one another'), null);
    assert.equal(parseReferenceQuery('John 3:0'), null);
    assert.equal(parseReferenceQuery('John 3:9-4'), null, 'end before start');
  });

  test('resolves a reference to its verses', () => {
    const hits = kjvRefHits({ book: 'John', chapter: 3, verseStart: 16, verseEnd: 16 });
    assert.equal(hits.length, 1);
    assert.equal(hits[0].ref, 'John 3:16');
    assert.match(hits[0].text, /^For God so loved the world/);
  });

  test('a chapter-only reference returns the whole chapter', () => {
    assert.equal(kjvRefHits({ book: 'Psalms', chapter: 23 }).length, 6);
  });
});

describe('keyword search', () => {
  test('finds a common word across both testaments', () => {
    const r = kjvSearch('peace');
    assert.ok(r.total > 100, `expected many hits, got ${r.total}`);
    assert.ok(r.ot.length > 0 && r.nt.length > 0, 'both testaments should be represented');
  });

  // The old implementation was a single `contains`, so a two-word query only
  // matched that exact adjacent phrase and looked broken for normal input.
  test('multi-word queries match verses containing all the words', () => {
    const r = kjvSearch('faith hope charity');
    assert.ok(r.total > 0);
    const all = [...r.ot, ...r.nt];
    for (const hit of all) {
      const t = hit.text.toLowerCase();
      assert.ok(t.includes('faith') && t.includes('hope') && t.includes('charity'), hit.ref);
    }
    assert.ok(all.some((h) => h.ref.startsWith('1 Corinthians 13')), 'should surface 1 Cor 13');
  });

  test('an exact phrase outranks scattered words', () => {
    const r = kjvSearch('The LORD is my shepherd');
    assert.equal(r.ot[0].ref, 'Psalm 23:1');
  });

  // Ranking single-word queries by verse length put "Hold not thy peace, O God"
  // at the top of a search for "peace". Equal-scoring hits stay canonical.
  test('equally matching hits keep canonical order', () => {
    const r = kjvSearch('shepherd');
    assert.equal(r.ot[0].ref, 'Genesis 46:32', 'first OT hit should be the earliest, not the shortest');
    const refs = r.ot.map((h) => h.ref);
    assert.ok(refs.indexOf('Genesis 46:32') < refs.indexOf('Psalm 23:1'));
  });

  test('results are capped but the true total is reported', () => {
    const r = kjvSearch('the', 10);
    assert.equal(r.ot.length + r.nt.length, 10);
    assert.ok(r.total > 10, 'total must be the unclipped count');
  });

  test('nonsense and empty queries return nothing rather than throwing', () => {
    assert.equal(kjvSearch('zzzzqqqq').total, 0);
    assert.equal(kjvSearch('').total, 0);
    assert.equal(kjvSearch('   ').total, 0);
  });

  test('regex metacharacters in a query are treated as literal text', () => {
    assert.doesNotThrow(() => kjvSearch('a(b'));
    assert.equal(kjvSearch('a(b').total, 0);
  });
});
