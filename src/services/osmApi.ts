import type { OSMFeature, OSMFeatureType } from '../types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/* Map OSM golf tag values → our OSMFeatureType */
const TAG_MAP: Record<string, OSMFeatureType> = {
  green: 'green',
  tee: 'tee',
  fairway: 'fairway',
  bunker: 'bunker',
  water_hazard: 'water_hazard',
  lateral_water_hazard: 'water_hazard',
  rough: 'rough',
  hole: 'hole_path',
};

function buildQuery(lat: number, lng: number, radius: number): string {
  const tags = Object.keys(TAG_MAP)
    .map((t) => `way[golf=${t}](around:${radius},${lat},${lng});`)
    .join('\n  ');

  return `[out:json][timeout:25];
(
  ${tags}
);
out geom;`;
}

interface OverpassElement {
  type: string;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function parseElements(elements: OverpassElement[]): OSMFeature[] {
  const features: OSMFeature[] = [];

  for (const el of elements) {
    if (!el.geometry || el.geometry.length < 2) continue;

    const golfTag = el.tags?.['golf'];
    if (!golfTag) continue;

    const featureType = TAG_MAP[golfTag];
    if (!featureType) continue;

    const coordinates: [number, number][] = el.geometry.map(
      (pt) => [pt.lat, pt.lon] as [number, number]
    );

    features.push({
      type: featureType,
      holeRef: el.tags?.['ref'] ?? undefined,
      coordinates,
    });
  }

  return features;
}

/* Simple module-level cache to avoid hammering Overpass */
const cache = new Map<string, OSMFeature[]>();

export const osmApi = {
  async fetchGolfFeatures(
    lat: number,
    lng: number,
    radiusMeters = 800
  ): Promise<OSMFeature[]> {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)},${radiusMeters}`;
    if (cache.has(key)) return cache.get(key)!;

    const body = buildQuery(lat, lng, radiusMeters);

    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(body)}`,
    });

    if (!res.ok) throw new Error(`Overpass API error ${res.status}`);

    const json = (await res.json()) as OverpassResponse;
    const features = parseElements(json.elements ?? []);

    cache.set(key, features);
    return features;
  },

  /** Fetch features and filter to a specific hole ref number */
  async fetchHoleFeatures(
    lat: number,
    lng: number,
    holeRef: string
  ): Promise<OSMFeature[]> {
    const all = await osmApi.fetchGolfFeatures(lat, lng);
    return all.filter((f) => f.holeRef === holeRef || f.holeRef === undefined);
  },
};
