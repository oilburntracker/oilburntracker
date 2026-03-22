import { create } from 'zustand';
import type { CuratedFire } from '@/features/fires/data/curated-fires';

export interface FireFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    latitude: number;
    longitude: number;
    bright_ti4: number;
    frp: number;
    confidence: string;
    acq_date: string;
    acq_time: string;
    satellite: string;
    daynight: string;
    intensity: 'low' | 'medium' | 'high' | 'extreme';
    estimatedCO2TonsDay: number;
    matchedFacility?: {
      id: string;
      name: string;
      facilityType: string;
      capacityBPD: number;
      country: string;
      status: string;
      newsSourceUrl?: string;
      description: string;
      percentGlobalCapacity: number;
    } | null;
  };
}

export interface FireGeoJSON {
  type: 'FeatureCollection';
  features: FireFeature[];
}

interface FireFilters {
  minFRP: number;
  confidence: ('low' | 'nominal' | 'high')[];
  facilityOnly: boolean;
  region: 'all' | 'persian_gulf' | 'red_sea' | 'hormuz' | 'levant';
  daynight: 'all' | 'D' | 'N';
}

interface MapState {
  center: [number, number];
  zoom: number;
  selectedFire: FireFeature | null;
}

interface LayerToggles {
  heatmap: boolean;
  markers: boolean;
  facilities: boolean;
}

interface FireStore {
  fireData: FireGeoJSON;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  filters: FireFilters;
  mapState: MapState;
  layers: LayerToggles;

  selectedFacility: CuratedFire | null;
  timelineDate: string; // current date on scrubber
  isMuted: boolean;

  setFireData: (data: FireGeoJSON) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date) => void;

  setFilter: <K extends keyof FireFilters>(key: K, value: FireFilters[K]) => void;
  setSelectedFire: (fire: FireFeature | null) => void;
  setSelectedFacility: (facility: CuratedFire | null) => void;
  setTimelineDate: (date: string) => void;
  setIsMuted: (muted: boolean) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  toggleLayer: (layer: keyof LayerToggles) => void;
}

export const useFireStore = create<FireStore>((set) => ({
  fireData: { type: 'FeatureCollection', features: [] },
  loading: false,
  error: null,
  lastUpdated: null,

  filters: {
    minFRP: 0,
    confidence: ['low', 'nominal', 'high'],
    facilityOnly: false,
    region: 'all',
    daynight: 'all'
  },

  mapState: {
    center: [47.5, 29.0],
    zoom: 5,
    selectedFire: null
  },

  layers: {
    heatmap: true,
    markers: true,
    facilities: true
  },

  selectedFacility: null,
  timelineDate: (typeof window !== 'undefined' && localStorage.getItem('obt-timeline-date')) || new Date().toISOString().slice(0, 10),
  isMuted: true,

  setFireData: (data) => set({ fireData: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastUpdated: (date) => set({ lastUpdated: date }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),

  setSelectedFire: (fire) =>
    set((state) => ({
      mapState: { ...state.mapState, selectedFire: fire }
    })),

  setSelectedFacility: (facility) => set({ selectedFacility: facility }),
  setTimelineDate: (date) => {
    try { localStorage.setItem('obt-timeline-date', date); } catch {}
    set({ timelineDate: date });
  },
  setIsMuted: (muted) => set({ isMuted: muted }),

  setMapCenter: (center) =>
    set((state) => ({
      mapState: { ...state.mapState, center }
    })),

  setMapZoom: (zoom) =>
    set((state) => ({
      mapState: { ...state.mapState, zoom }
    })),

  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] }
    }))
}));
