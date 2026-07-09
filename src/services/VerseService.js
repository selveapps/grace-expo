// VerseService — daily verse + personalization. Wraps api/bible so the picking
// logic lives behind a service the backend can later own.
import { todaysVerse, verseForCarrying, getPassage } from '../api/bible';

export const VerseService = {
  getDaily() { return todaysVerse(); },
  getForCarrying(intentions) { return verseForCarrying(intentions); },
  getByRef(ref) { return getPassage(ref); },
};
