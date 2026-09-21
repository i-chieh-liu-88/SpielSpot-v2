import type { MapLocation } from "../types/map";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

const resultCache = new Map<string, MapLocation | null>();

export async function searchMapLocation(
  query: string,
  signal?: AbortSignal,
): Promise<MapLocation | null> {
  const normalizedQuery = query.trim();
  const cacheKey = normalizedQuery.toLocaleLowerCase();

  if (!normalizedQuery) return null;
  if (resultCache.has(cacheKey)) return resultCache.get(cacheKey) ?? null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: normalizedQuery,
    format: "jsonv2",
    limit: "1",
    countrycodes: "de",
    "accept-language": "en,de",
  }).toString();

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error("Location search is temporarily unavailable.");
  }

  const results = (await response.json()) as NominatimResult[];
  const firstResult = results[0];
  const latitude = Number(firstResult?.lat);
  const longitude = Number(firstResult?.lon);
  const location =
    firstResult && Number.isFinite(latitude) && Number.isFinite(longitude)
      ? {
          coordinates: [latitude, longitude] as [number, number],
          label: firstResult.display_name,
        }
      : null;

  resultCache.set(cacheKey, location);
  return location;
}
