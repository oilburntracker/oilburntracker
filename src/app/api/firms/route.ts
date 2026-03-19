import { NextRequest, NextResponse } from 'next/server';
import { FIRMS_BASE_URL, MIDDLE_EAST_BBOX, FIRMS_SOURCES } from '@/lib/firms';
import { csvToGeoJSON } from '@/features/map/utils/geojson';

export const revalidate = 1800; // 30 min ISR cache

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const bbox = searchParams.get('bbox') || MIDDLE_EAST_BBOX;
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '1'), 1), 5);
  const source = searchParams.get('source') || FIRMS_SOURCES.VIIRS_SNPP;

  const mapKey = process.env.FIRMS_MAP_KEY;

  if (!mapKey) {
    return NextResponse.json(
      { error: 'FIRMS_MAP_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `${FIRMS_BASE_URL}/${mapKey}/${source}/${bbox}/${days}`;

    const response = await fetch(url, {
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      throw new Error(`FIRMS API returned ${response.status}: ${response.statusText}`);
    }

    const csv = await response.text();

    if (!csv || csv.trim().length === 0 || csv.includes('Invalid')) {
      throw new Error('FIRMS returned empty or invalid data');
    }

    const geojson = csvToGeoJSON(csv);

    return NextResponse.json({
      ...geojson,
      metadata: {
        source,
        bbox,
        days,
        fetchedAt: new Date().toISOString(),
        count: geojson.features.length
      }
    });
  } catch (error) {
    console.error('FIRMS API error:', error);
    return NextResponse.json(
      {
        type: 'FeatureCollection',
        features: [],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          fetchedAt: new Date().toISOString(),
          count: 0
        }
      },
      { status: 200 } // Return empty collection, not 500 — map still renders
    );
  }
}
