import type { FireFeature, FireGeoJSON } from '@/stores/fire-store';

interface FIRMSRow {
  latitude: string;
  longitude: string;
  bright_ti4: string;
  frp: string;
  confidence: string;
  acq_date: string;
  acq_time: string;
  satellite: string;
  daynight: string;
  [key: string]: string;
}

function classifyIntensity(frp: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (frp < 10) return 'low';
  if (frp < 50) return 'medium';
  if (frp < 200) return 'high';
  return 'extreme';
}

function estimateCO2Simple(frpMW: number): number {
  // Base estimate: ~60 tons CO2/day per MW FRP for unknown facility
  return frpMW * 60;
}

export function parseCSVToRows(csv: string): FIRMSRow[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: FIRMSRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim() || '';
    });
    rows.push(row as FIRMSRow);
  }

  return rows;
}

export function csvToGeoJSON(csv: string): FireGeoJSON {
  const rows = parseCSVToRows(csv);

  const features: FireFeature[] = rows
    .filter((row) => {
      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      return !isNaN(lat) && !isNaN(lng);
    })
    .map((row) => {
      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      const frp = parseFloat(row.frp) || 0;
      const intensity = classifyIntensity(frp);

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [lng, lat] as [number, number]
        },
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
          intensity,
          estimatedCO2TonsDay: estimateCO2Simple(frp),
          matchedFacility: null
        }
      };
    });

  return {
    type: 'FeatureCollection',
    features
  };
}
