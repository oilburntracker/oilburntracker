// Cloudflare Pages Function — proxies NASA FIRMS API
// Env var FIRMS_MAP_KEY must be set in Cloudflare Pages dashboard

interface Env {
  FIRMS_MAP_KEY: string;
}

const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';
// FIRMS format: south_lat,west_lon,north_lat,east_lon
const MIDDLE_EAST_BBOX = '10,30,40,65';
const CACHE_SECONDS = 1800; // 30 min

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const bbox = url.searchParams.get('bbox') || MIDDLE_EAST_BBOX;
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '2'), 1), 5);
  const source = url.searchParams.get('source') || 'VIIRS_SNPP_NRT';

  const mapKey = context.env.FIRMS_MAP_KEY;

  if (!mapKey) {
    return Response.json(
      { type: 'FeatureCollection', features: [], metadata: { error: 'FIRMS_MAP_KEY not configured', count: 0 } },
      { status: 200, headers: corsHeaders() }
    );
  }

  try {
    const firmsUrl = `${FIRMS_BASE_URL}/${mapKey}/${source}/${bbox}/${days}`;
    const res = await fetch(firmsUrl);

    if (!res.ok) {
      throw new Error(`FIRMS API returned ${res.status}`);
    }

    const csv = await res.text();
    if (!csv || csv.trim().length === 0 || csv.includes('Invalid')) {
      throw new Error('FIRMS returned empty or invalid data');
    }

    const geojson = csvToGeoJSON(csv);

    return Response.json(
      { ...geojson, metadata: { source, bbox, days, fetchedAt: new Date().toISOString(), count: geojson.features.length } },
      { headers: { ...corsHeaders(), 'Cache-Control': `public, max-age=${CACHE_SECONDS}` } }
    );
  } catch (error) {
    return Response.json(
      { type: 'FeatureCollection', features: [], metadata: { error: String(error), fetchedAt: new Date().toISOString(), count: 0 } },
      { status: 200, headers: corsHeaders() }
    );
  }
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}

// Inline CSV→GeoJSON (no imports in CF Functions)
function classifyIntensity(frp: number): string {
  if (frp < 10) return 'low';
  if (frp < 50) return 'medium';
  if (frp < 200) return 'high';
  return 'extreme';
}

function csvToGeoJSON(csv: string) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return { type: 'FeatureCollection', features: [] };

  const headers = lines[0].split(',').map((h) => h.trim());

  const features = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || ''; });

    const lat = parseFloat(row.latitude);
    const lng = parseFloat(row.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;

    const frp = parseFloat(row.frp) || 0;

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        latitude: lat,
        longitude: lng,
        bright_ti4: parseFloat(row.bright_ti4) || 0,
        frp,
        confidence: row.confidence || 'nominal',
        acq_date: row.acq_date || '',
        acq_time: row.acq_time || '',
        satellite: row.satellite || '',
        daynight: row.daynight || '',
        intensity: classifyIntensity(frp),
        estimatedCO2TonsDay: frp * 52.7, // conservative default: mult(0.12, 42.3, 3.10)
        matchedFacility: null
      }
    });
  }

  return { type: 'FeatureCollection', features };
}
