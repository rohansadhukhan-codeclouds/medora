/**
 * Split an AsterMD imageUrl into individual usable image sources.
 * One field may concatenate multiple complete data URLs (newline or "\\n").
 */
export function parseImageSources(value?: string | null): string[] {
  if (!value) return [];

  const normalized = value.replace(/\\n/g, "\n").trim();
  if (!normalized) return [];

  const dataUrls = normalized.match(
    /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g,
  );

  if (dataUrls?.length) {
    return dataUrls.map((src) => src.trim()).filter(Boolean);
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("blob:")
  ) {
    return [normalized];
  }

  return [];
}
