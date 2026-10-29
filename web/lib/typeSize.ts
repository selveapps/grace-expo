export const TYPE_SIZES = [
  { id: 's', label: 'S', scale: 0.9 },
  { id: 'm', label: 'M', scale: 1 },
  { id: 'l', label: 'L', scale: 1.15 },
  { id: 'xl', label: 'XL', scale: 1.3 },
] as const;

export type TypeSizeId = (typeof TYPE_SIZES)[number]['id'];

export const TYPE_SIZE_KEY = 'grace.typeSize';

export const BASE_VERSE_PX = 17;

export function normalizeTypeSize(id: string | null | undefined): TypeSizeId {
  return TYPE_SIZES.some((size) => size.id === id) ? id as TypeSizeId : 'm';
}

export function verseFontSize(id: string | null | undefined): string {
  const scale = TYPE_SIZES.find((size) => size.id === normalizeTypeSize(id))!.scale;
  return `${BASE_VERSE_PX * scale}px`;
}

export function typeSizeBootScript(): string {
  const scales = Object.fromEntries(TYPE_SIZES.map((size) => [size.id, size.scale]));
  return `try{var id=localStorage.getItem(${JSON.stringify(TYPE_SIZE_KEY)});var scale=${JSON.stringify(scales)}[id]||1;document.documentElement.style.setProperty("--verse-size",${BASE_VERSE_PX}*scale+"px");}catch(e){}`;
}

export function applyTypeSize(id: string) {
  const next = normalizeTypeSize(id);
  window.localStorage.setItem(TYPE_SIZE_KEY, next);
  document.documentElement.style.setProperty('--verse-size', verseFontSize(next));
}

export function readTypeSize(): TypeSizeId {
  try {
    return normalizeTypeSize(window.localStorage.getItem(TYPE_SIZE_KEY));
  } catch {
    return 'm';
  }
}
