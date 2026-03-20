'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFireStore, type FireFeature } from '@/stores/fire-store';
import { curatedFires, type FacilityStatus } from '@/features/fires/data/curated-fires';
import { createPulsingDot, INTENSITY_CONFIGS } from '../utils/pulsing-dot';
import { getEventsUpTo, CATEGORY_COLORS, type ConflictEvent } from '@/features/timeline/data/conflict-events';

// Free satellite tiles — no API key needed
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: 'Satellite + Terrain',
  sources: {
    'satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxzoom: 19
    },
    'terrain-dem': {
      type: 'raster-dem',
      tiles: [
        'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      encoding: 'terrarium',
      maxzoom: 15
    },
    'labels': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      maxzoom: 18
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite'
    },
    {
      id: 'labels-layer',
      type: 'raster',
      source: 'labels',
      paint: {
        'raster-opacity': 0.7
      }
    }
  ],
  terrain: {
    source: 'terrain-dem',
    exaggeration: 1.5
  },
  sky: {
    'sky-color': '#0a0a1a',
    'sky-horizon-blend': 0.1,
    'horizon-color': '#111133',
    'horizon-fog-blend': 0.5,
    'fog-color': '#0a0a1a',
    'fog-ground-blend': 0.8
  }
};

const STATUS_COLORS: Record<FacilityStatus, string> = {
  active_fire: '#ef4444',
  damaged: '#f97316',
  monitoring: '#eab308',
  offline: '#6b7280',
  operational: '#22c55e'
};

// Capacity label: show BPD or BCF/day or storage
function capacityLabel(f: typeof curatedFires[0]): string {
  if (f.capacityBPD >= 1000000) return `${(f.capacityBPD / 1000000).toFixed(1)}M BPD`;
  if (f.capacityBPD > 0) return `${(f.capacityBPD / 1000).toFixed(0)}K BPD`;
  if (f.gasCapacityBCFD) return `${f.gasCapacityBCFD} BCF/d`;
  if (f.storageMBBL) return `${f.storageMBBL}M bbl`;
  return '';
}

// Impact radius scales with percentGlobalCapacity
// bigger facilities = bigger glow on the map
function impactScale(pct: number): number {
  if (pct >= 20) return 6;   // Hormuz-level
  if (pct >= 5) return 5;    // Abqaiq, Kharg
  if (pct >= 2) return 4;    // South Pars, Ghawar
  if (pct >= 1) return 3;    // Ras Laffan, Rumaila
  if (pct >= 0.3) return 2;  // Most refineries
  return 1;                   // Small facilities
}

function buildFacilitiesGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: curatedFires.map((f) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [f.lng, f.lat] as [number, number]
      },
      properties: {
        id: f.id,
        name: f.name,
        capacityText: capacityLabel(f),
        labelText: f.name.length > 22 ? f.name.slice(0, 20) + '...' : f.name,
        facilityType: f.facilityType,
        status: f.status,
        country: f.country,
        percentGlobalCapacity: f.percentGlobalCapacity,
        color: STATUS_COLORS[f.status],
        impactScale: impactScale(f.percentGlobalCapacity),
        isActive: f.status === 'active_fire' || f.status === 'damaged' ? 1 : 0,
        threatLevel: f.threatLevel
      }
    }))
  };
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function buildEventsGeoJSON(events: ConflictEvent[]) {
  return {
    type: 'FeatureCollection' as const,
    features: events
      .filter((e) => e.lat && e.lng)
      .map((e) => {
        const ytMedia = e.mediaUrls?.find((m) => m.type === 'youtube');
        const videoId = ytMedia ? getYouTubeId(ytMedia.url) : null;
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [e.lng!, e.lat!] as [number, number]
          },
          properties: {
            id: e.id,
            title: e.title,
            description: e.description.slice(0, 200),
            category: e.category,
            date: e.date,
            color: CATEGORY_COLORS[e.category],
            videoId: videoId || '',
            videoLabel: ytMedia?.label || '',
            hasVideo: videoId ? 1 : 0,
            killed: e.casualties?.killed || 0,
            sourceUrl: e.sourceUrl || ''
          }
        };
      })
  };
}

export default function FireMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);

  const fireData = useFireStore((s) => s.fireData);
  const layers = useFireStore((s) => s.layers);
  const setSelectedFire = useFireStore((s) => s.setSelectedFire);
  const setSelectedFacility = useFireStore((s) => s.setSelectedFacility);
  const mapState = useFireStore((s) => s.mapState);
  const timelineDate = useFireStore((s) => s.timelineDate);

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: SATELLITE_STYLE,
      center: mapState.center,
      zoom: mapState.zoom,
      pitch: 45,
      bearing: -10,
      maxPitch: 85,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.current.on('load', () => {
      const m = map.current!;

      // Add pulsing dot images
      for (const [key, config] of Object.entries(INTENSITY_CONFIGS)) {
        m.addImage(`pulsing-dot-${key}`, createPulsingDot(m, config), { pixelRatio: 2 });
      }

      // ── FIRMS fire data source ──
      m.addSource('fires', {
        type: 'geojson',
        data: fireData
      });

      // Heatmap layer
      m.addLayer({
        id: 'fires-heat',
        type: 'heatmap',
        source: 'fires',
        maxzoom: 12,
        paint: {
          'heatmap-weight': [
            'interpolate', ['linear'],
            ['get', 'frp'],
            0, 0, 10, 0.3, 50, 0.6, 200, 1
          ],
          'heatmap-intensity': [
            'interpolate', ['linear'],
            ['zoom'],
            0, 1, 12, 3
          ],
          'heatmap-color': [
            'interpolate', ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(255,255,0,0.4)',
            0.4, 'rgba(255,165,0,0.6)',
            0.6, 'rgba(255,69,0,0.8)',
            0.8, 'rgba(255,0,0,0.9)',
            1, 'rgba(183,28,28,1)'
          ],
          'heatmap-radius': [
            'interpolate', ['linear'],
            ['zoom'],
            0, 15, 6, 30, 12, 50
          ],
          'heatmap-opacity': 0.8
        }
      });

      // FIRMS fire points (pulsing dots)
      m.addLayer({
        id: 'fires-points',
        type: 'symbol',
        source: 'fires',
        minzoom: 4,
        layout: {
          'icon-image': [
            'match',
            ['get', 'intensity'],
            'low', 'pulsing-dot-low',
            'medium', 'pulsing-dot-medium',
            'high', 'pulsing-dot-high',
            'extreme', 'pulsing-dot-extreme',
            'pulsing-dot-low'
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // ── Curated facility markers (scaled by impact) ──
      m.addSource('facilities', {
        type: 'geojson',
        data: buildFacilitiesGeoJSON()
      });

      // Layer 1: Outer impact glow — large, faded, shows area of effect
      // Scales with percentGlobalCapacity via impactScale property
      m.addLayer({
        id: 'facility-impact-glow',
        type: 'circle',
        source: 'facilities',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            3, ['*', ['get', 'impactScale'], 6],
            6, ['*', ['get', 'impactScale'], 14],
            10, ['*', ['get', 'impactScale'], 25]
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.12,
          'circle-blur': 1
        }
      });

      // Layer 2: Mid ring — intermediate glow
      m.addLayer({
        id: 'facility-mid-ring',
        type: 'circle',
        source: 'facilities',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            3, ['*', ['get', 'impactScale'], 3.5],
            6, ['*', ['get', 'impactScale'], 8],
            10, ['*', ['get', 'impactScale'], 14]
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.25,
          'circle-blur': 0.6
        }
      });

      // Layer 3: Inner core — solid center dot
      m.addLayer({
        id: 'facility-core',
        type: 'circle',
        source: 'facilities',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            3, ['*', ['get', 'impactScale'], 1.8],
            6, ['*', ['get', 'impactScale'], 3.5],
            10, ['*', ['get', 'impactScale'], 5.5]
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.9,
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'isActive'], 1],
            2,
            1
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'isActive'], 1],
            '#ffffff',
            'rgba(255,255,255,0.5)'
          ]
        }
      });

      // Facility name + capacity labels (combined)
      m.addLayer({
        id: 'facility-labels',
        type: 'symbol',
        source: 'facilities',
        minzoom: 4,
        layout: {
          'text-field': [
            'case',
            ['!=', ['get', 'capacityText'], ''],
            ['concat', ['get', 'labelText'], '\n', ['get', 'capacityText']],
            ['get', 'labelText']
          ],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            4, 9,
            7, 11,
            10, 13
          ],
          'text-offset': [0, 2.2] as [number, number],
          'text-anchor': 'top',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': false,
          'text-optional': true,
          'text-max-width': 14,
          'text-line-height': 1.3
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.85)',
          'text-halo-width': 1.5
        }
      });

      // Status badge labels (FIRE / DMG) — only for active/damaged
      m.addLayer({
        id: 'facility-status',
        type: 'symbol',
        source: 'facilities',
        minzoom: 4,
        filter: ['==', ['get', 'isActive'], 1],
        layout: {
          'text-field': [
            'case',
            ['==', ['get', 'status'], 'active_fire'], 'FIRE',
            ['==', ['get', 'status'], 'damaged'], 'DAMAGED',
            ''
          ],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            4, 8,
            8, 10
          ],
          'text-offset': [0, -2.2] as [number, number],
          'text-anchor': 'bottom',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 1.5
        }
      });

      // ── Conflict event pins (synced to timeline) ──
      m.addSource('conflict-events', {
        type: 'geojson',
        data: buildEventsGeoJSON(getEventsUpTo(timelineDate))
      });

      // Outer pulse ring for events with video
      m.addLayer({
        id: 'event-pin-ring',
        type: 'circle',
        source: 'conflict-events',
        filter: ['==', ['get', 'hasVideo'], 1],
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            3, 6, 8, 14, 12, 20
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.2,
          'circle-blur': 0.8
        }
      });

      // Core pin marker
      m.addLayer({
        id: 'event-pin-core',
        type: 'circle',
        source: 'conflict-events',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            3, 4, 8, 7, 12, 10
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Video icon indicator for pins with video
      m.addLayer({
        id: 'event-pin-label',
        type: 'symbol',
        source: 'conflict-events',
        minzoom: 5,
        layout: {
          'text-field': [
            'case',
            ['==', ['get', 'hasVideo'], 1],
            '▶',
            '●'
          ],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            5, 8, 10, 12
          ],
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // ── Click handlers ──

      // Click event pin → popup with video + summary
      m.on('click', 'event-pin-core', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const coords = (e.features[0].geometry as any).coordinates.slice();

        if (popup.current) popup.current.remove();

        let html = `<div style="font-family:system-ui;color:#e0e0e0;background:#1a1a1a;padding:10px;border-radius:8px;max-width:300px">`;
        html += `<div style="font-size:11px;color:${props?.color};font-weight:700;text-transform:uppercase;margin-bottom:4px">${props?.category?.replace('_', ' ')}</div>`;
        html += `<div style="font-size:14px;font-weight:800;line-height:1.3;margin-bottom:6px">${props?.title}</div>`;
        html += `<div style="font-size:12px;opacity:0.75;line-height:1.4;margin-bottom:8px">${props?.description}...</div>`;

        if (props?.killed > 0) {
          html += `<div style="font-size:12px;color:#ef4444;font-weight:700;margin-bottom:6px">${Number(props.killed).toLocaleString()}+ killed</div>`;
        }

        if (props?.videoId) {
          html += `<div style="position:relative;width:100%;padding-bottom:56.25%;margin-bottom:6px;border-radius:6px;overflow:hidden;background:#000">`;
          html += `<iframe src="https://www.youtube-nocookie.com/embed/${props.videoId}?rel=0&autoplay=1&mute=1&enablejsapi=1" `;
          html += `style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" `;
          html += `allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>`;
          html += `</div>`;
          if (props?.videoLabel) {
            html += `<div style="font-size:10px;opacity:0.6;margin-bottom:4px">${props.videoLabel}</div>`;
          }
        }

        if (props?.sourceUrl) {
          html += `<a href="${props.sourceUrl}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#60a5fa;text-decoration:underline">Read more →</a>`;
        }

        html += `<div style="font-size:10px;opacity:0.4;margin-top:4px">${props?.date}</div>`;
        html += `</div>`;

        popup.current = new maplibregl.Popup({ closeButton: true, maxWidth: '340px', className: 'event-popup' })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(m);
      });

      // Click facility → open drawer
      m.on('click', 'facility-core', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const facility = curatedFires.find((f) => f.id === props?.id);
        if (facility) {
          setSelectedFacility(facility);
          m.flyTo({
            center: [facility.lng, facility.lat],
            zoom: Math.max(m.getZoom(), 8),
            pitch: 50,
            duration: 1500
          });
        }
      });

      // Click FIRMS fire point → popup
      m.on('click', 'fires-points', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;

        let matchedFacility = null;
        if (props?.matchedFacility && props.matchedFacility !== 'null') {
          try {
            matchedFacility = typeof props.matchedFacility === 'string'
              ? JSON.parse(props.matchedFacility)
              : props.matchedFacility;
          } catch {}
        }

        const fireFeature: FireFeature = {
          type: 'Feature',
          geometry: feature.geometry as any,
          properties: {
            latitude: props?.latitude ? Number(props.latitude) : 0,
            longitude: props?.longitude ? Number(props.longitude) : 0,
            bright_ti4: props?.bright_ti4 ? Number(props.bright_ti4) : 0,
            frp: props?.frp ? Number(props.frp) : 0,
            estimatedCO2TonsDay: props?.estimatedCO2TonsDay ? Number(props.estimatedCO2TonsDay) : 0,
            confidence: props?.confidence || 'nominal',
            acq_date: props?.acq_date || '',
            acq_time: props?.acq_time || '',
            satellite: props?.satellite || '',
            daynight: props?.daynight || '',
            intensity: props?.intensity || 'low',
            matchedFacility
          }
        };

        setSelectedFire(fireFeature);

        const coords = (feature.geometry as any).coordinates.slice();
        if (popup.current) popup.current.remove();

        popup.current = new maplibregl.Popup({ closeButton: true, maxWidth: '260px' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:system-ui;font-size:12px;color:#e0e0e0;background:#1a1a1a;padding:8px;border-radius:6px">
              <strong>FRP:</strong> ${Number(props?.frp || 0).toFixed(1)} MW &middot;
              <strong>CO&#8322;:</strong> ~${Number(props?.estimatedCO2TonsDay || 0).toFixed(0)} t/day<br/>
              <span style="opacity:0.7">${props?.satellite} &middot; ${props?.acq_date} ${props?.acq_time}</span>
            </div>
          `)
          .addTo(m);
      });

      // Cursors
      for (const layerId of ['facility-core', 'fires-points', 'event-pin-core']) {
        m.on('mouseenter', layerId, () => { m.getCanvas().style.cursor = 'pointer'; });
        m.on('mouseleave', layerId, () => { m.getCanvas().style.cursor = ''; });
      }
    });
  }, []);

  // Initialize map
  useEffect(() => {
    initMap();
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initMap]);

  // Update fire data on map
  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource('fires') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(fireData);
    }
  }, [fireData]);

  // Update event pins when timeline date changes
  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource('conflict-events') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(buildEventsGeoJSON(getEventsUpTo(timelineDate)));
    }
  }, [timelineDate]);

  // Toggle layers
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const m = map.current;
    try {
      m.setLayoutProperty('fires-heat', 'visibility', layers.heatmap ? 'visible' : 'none');
      m.setLayoutProperty('fires-points', 'visibility', layers.markers ? 'visible' : 'none');
      const fv = layers.facilities ? 'visible' : 'none';
      m.setLayoutProperty('facility-impact-glow', 'visibility', fv);
      m.setLayoutProperty('facility-mid-ring', 'visibility', fv);
      m.setLayoutProperty('facility-core', 'visibility', fv);
      m.setLayoutProperty('facility-labels', 'visibility', fv);
      m.setLayoutProperty('facility-status', 'visibility', fv);
    } catch {}
  }, [layers]);

  // Listen for flyTo events
  useEffect(() => {
    const handler = (e: Event) => {
      const { lng, lat, zoom } = (e as CustomEvent).detail;
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: zoom || 10,
          pitch: 50,
          duration: 2000
        });
      }
    };
    window.addEventListener('map-flyto', handler);
    return () => window.removeEventListener('map-flyto', handler);
  }, []);

  return (
    <div ref={mapContainer} className='h-full w-full' />
  );
}
