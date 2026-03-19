'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFireStore, type FireFeature } from '@/stores/fire-store';
import { createPulsingDot, INTENSITY_CONFIGS } from '../utils/pulsing-dot';

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

export default function FireMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);

  const fireData = useFireStore((s) => s.fireData);
  const layers = useFireStore((s) => s.layers);
  const setSelectedFire = useFireStore((s) => s.setSelectedFire);
  const mapState = useFireStore((s) => s.mapState);

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

      // Fire data source
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
            0, 0,
            10, 0.3,
            50, 0.6,
            200, 1
          ],
          'heatmap-intensity': [
            'interpolate', ['linear'],
            ['zoom'],
            0, 1,
            12, 3
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
            0, 15,
            6, 30,
            12, 50
          ],
          'heatmap-opacity': 0.8
        }
      });

      // Symbol layer (pulsing dots)
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

      // Facility circle layer
      m.addLayer({
        id: 'fires-facilities',
        type: 'circle',
        source: 'fires',
        filter: ['!=', ['get', 'matchedFacility'], null],
        paint: {
          'circle-radius': 12,
          'circle-color': 'transparent',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#00e5ff'
        }
      });

      // Click handler
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

        const facilityHtml = matchedFacility
          ? `<div style="border-top:1px solid #333;margin-top:6px;padding-top:6px">
              <strong style="color:#00e5ff">${matchedFacility.name}</strong><br/>
              Type: ${matchedFacility.facilityType}<br/>
              Capacity: ${(matchedFacility.capacityBPD / 1000).toFixed(0)}K BPD<br/>
              Status: ${matchedFacility.status}<br/>
              ${matchedFacility.newsSourceUrl ? `<a href="${matchedFacility.newsSourceUrl}" target="_blank" style="color:#4fc3f7">Source</a>` : ''}
            </div>`
          : '';

        popup.current = new maplibregl.Popup({ closeButton: true, maxWidth: '300px' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:system-ui;font-size:13px;color:#e0e0e0;background:#1a1a1a;padding:8px;border-radius:6px">
              <strong>FRP:</strong> ${Number(props?.frp || 0).toFixed(1)} MW<br/>
              <strong>Confidence:</strong> ${props?.confidence}<br/>
              <strong>Satellite:</strong> ${props?.satellite}<br/>
              <strong>Detected:</strong> ${props?.acq_date} ${props?.acq_time}<br/>
              <strong>CO&#8322;/day:</strong> ~${Number(props?.estimatedCO2TonsDay || 0).toFixed(0)} tons
              ${facilityHtml}
            </div>
          `)
          .addTo(m);
      });

      // Cursor
      m.on('mouseenter', 'fires-points', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'fires-points', () => {
        m.getCanvas().style.cursor = '';
      });
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

  // Toggle layers
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const m = map.current;
    try {
      m.setLayoutProperty('fires-heat', 'visibility', layers.heatmap ? 'visible' : 'none');
      m.setLayoutProperty('fires-points', 'visibility', layers.markers ? 'visible' : 'none');
      m.setLayoutProperty('fires-facilities', 'visibility', layers.facilities ? 'visible' : 'none');
    } catch {}
  }, [layers]);

  // Listen for flyTo events from parent components
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
