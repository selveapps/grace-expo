Saved tea and continue-reading on the web use the catalog and progress the client already has. Do not add a second catalog.

latestReading returns the first row whose book is non-blank and whose chapter is an integer of at least 1. Otherwise it returns null. A blank book or a chapter of 0 is ignored.
progressRows reads a progress array from the response body.
readingLabel prints "Psalm 23" for Psalms and "John 1" for John.
savedTeaRows keeps rows with a non-blank teaId.
savedTeaList joins those ids to catalog cards, drops unknown ids, and drops a repeated id.
/you/tea lists that result for the guest session. An empty list says none are saved yet and links to /tea. A missing session links to /.

The hidden tests import:
- `describe, expect, it` from `vitest`
- `latestReading, progressRows, readingLabel, savedTeaList, savedTeaRows` from `./library`
