export type ProgressRow = { book: string; chapter: number; position?: number };

export type TeaCard = { id: string; cardTitle: string; ref?: string };

export type SavedTeaRow = { teaId: string };

export function latestReading(rows: ProgressRow[] | null | undefined): ProgressRow | null {
  const row = rows?.[0];
  if (!row || typeof row.book !== 'string' || !row.book.trim()) return null;
  if (typeof row.chapter !== 'number' || !Number.isInteger(row.chapter) || row.chapter < 1) return null;
  return { book: row.book.trim(), chapter: row.chapter, position: row.position };
}

export function readingLabel(row: ProgressRow): string {
  const name = row.book === 'Psalms' ? 'Psalm' : row.book;
  return `${name} ${row.chapter}`;
}

export function progressRows(body: unknown): ProgressRow[] {
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object' && Array.isArray((body as { progress?: unknown }).progress)
      ? (body as { progress: unknown[] }).progress
      : [];
  return list.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as ProgressRow;
    const latest = latestReading([row]);
    return latest ? [latest] : [];
  });
}

export function savedTeaRows(body: unknown): SavedTeaRow[] {
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object' && Array.isArray((body as { saved?: unknown }).saved)
      ? (body as { saved: unknown[] }).saved
      : [];
  return list.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const teaId = (item as { teaId?: unknown }).teaId;
    if (typeof teaId !== 'string' || !teaId.trim()) return [];
    return [{ teaId }];
  });
}

export function savedTeaList(
  catalog: TeaCard[] | null | undefined,
  saved: SavedTeaRow[] | null | undefined,
): TeaCard[] {
  const byId = new Map((catalog ?? []).filter((card) => card?.id).map((card) => [card.id, card]));
  const seen = new Set<string>();
  const out: TeaCard[] = [];
  for (const row of saved ?? []) {
    if (!row?.teaId || seen.has(row.teaId)) continue;
    const card = byId.get(row.teaId);
    if (!card?.cardTitle) continue;
    seen.add(row.teaId);
    out.push({ id: card.id, cardTitle: card.cardTitle, ref: card.ref });
  }
  return out;
}
