// Real Bible book metadata — testament, group, order, chapter counts, abbreviation.
// This is the structural source of truth for Reading. Verse text is fetched live
// (see api/bible.js); this file gives the app the shape of the whole canon offline.

const CH = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, Ezra: 10, Nehemiah: 13, Esther: 10,
  Job: 42, Psalms: 150, Proverbs: 31, Ecclesiastes: 12, 'Song of Solomon': 8,
  Isaiah: 66, Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12,
  Hosea: 14, Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3,
  Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13, Galatians: 6, Ephesians: 6,
  Philippians: 4, Colossians: 4, '1 Thessalonians': 5, '2 Thessalonians': 3,
  '1 Timothy': 6, '2 Timothy': 4, Titus: 3, Philemon: 1,
  Hebrews: 13, James: 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, Jude: 1,
  Revelation: 22,
};

const ABBR = {
  Genesis: 'Gen', Exodus: 'Exo', Leviticus: 'Lev', Numbers: 'Num', Deuteronomy: 'Deu',
  Joshua: 'Jos', Judges: 'Jdg', Ruth: 'Rut', '1 Samuel': '1Sa', '2 Samuel': '2Sa',
  '1 Kings': '1Ki', '2 Kings': '2Ki', '1 Chronicles': '1Ch', '2 Chronicles': '2Ch',
  Ezra: 'Ezr', Nehemiah: 'Neh', Esther: 'Est', Job: 'Job', Psalms: 'Psa', Proverbs: 'Pro',
  Ecclesiastes: 'Ecc', 'Song of Solomon': 'Sng', Isaiah: 'Isa', Jeremiah: 'Jer',
  Lamentations: 'Lam', Ezekiel: 'Eze', Daniel: 'Dan', Hosea: 'Hos', Joel: 'Joe', Amos: 'Amo',
  Obadiah: 'Oba', Jonah: 'Jon', Micah: 'Mic', Nahum: 'Nah', Habakkuk: 'Hab', Zephaniah: 'Zep',
  Haggai: 'Hag', Zechariah: 'Zec', Malachi: 'Mal', Matthew: 'Mat', Mark: 'Mar', Luke: 'Luk',
  John: 'Joh', Acts: 'Act', Romans: 'Rom', '1 Corinthians': '1Co', '2 Corinthians': '2Co',
  Galatians: 'Gal', Ephesians: 'Eph', Philippians: 'Php', Colossians: 'Col',
  '1 Thessalonians': '1Th', '2 Thessalonians': '2Th', '1 Timothy': '1Ti', '2 Timothy': '2Ti',
  Titus: 'Tit', Philemon: 'Phm', Hebrews: 'Heb', James: 'Jas', '1 Peter': '1Pe', '2 Peter': '2Pe',
  '1 John': '1Jo', '2 John': '2Jo', '3 John': '3Jo', Jude: 'Jud', Revelation: 'Rev',
};

// Short intros for book-detail screens (extend as desired).
export const BOOK_INTROS = {
  Psalms: '150 songs of lament, praise and trust — the prayer book of the Bible.',
  Ruth: 'A story of loyalty and redemption in the harvest fields of Bethlehem.',
  Esther: 'Courage in a foreign palace — "for such a time as this."',
  John: "The fourth Gospel — that you might believe, and have life.",
  Philippians: "Paul's letter of joy, written from prison.",
};

import { OT_GROUPS, NT_GROUPS } from './content';

function build(groups, testament) {
  const books = [];
  let order = testament === 'old' ? 1 : 40;
  for (const g of groups) {
    for (const name of g.books) {
      books.push({
        id: (ABBR[name] || name).toLowerCase(),
        name,
        testament,
        group: g.group,
        order: order++,
        chaptersCount: CH[name] || 1,
        abbreviation: ABBR[name] || name.slice(0, 3),
      });
    }
  }
  return books;
}

export const BOOKS = [...build(OT_GROUPS, 'old'), ...build(NT_GROUPS, 'new')];
export const BOOK_BY_NAME = Object.fromEntries(BOOKS.map((b) => [b.name, b]));
export function chapterCount(name) { return CH[name] || 1; }
