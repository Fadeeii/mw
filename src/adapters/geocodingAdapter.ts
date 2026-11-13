import { GeocodingResult } from '../types';

/**
 * Real Geographic Location Geocoding Adapter
 * Queries OpenStreetMap Nominatim for verified real-world coordinates and bounding boxes.
 */
export async function searchGeographicLocation(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      boundingBox: item.boundingbox ? [
        parseFloat(item.boundingbox[0]),
        parseFloat(item.boundingbox[1]),
        parseFloat(item.boundingbox[2]),
        parseFloat(item.boundingbox[3])
      ] : undefined,
      type: item.type
    }));
  } catch (err) {
    console.error('Geocoding search failed:', err);
    return [];
  }
}
