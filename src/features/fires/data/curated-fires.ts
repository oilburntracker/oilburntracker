export type FacilityType = 'refinery' | 'lng_terminal' | 'pipeline' | 'storage' | 'oil_field' | 'port';
export type FacilityStatus = 'active_fire' | 'damaged' | 'monitoring' | 'offline' | 'operational';

export interface CuratedFire {
  id: string;
  name: string;
  facilityType: FacilityType;
  lat: number;
  lng: number;
  matchRadius: number; // km
  country: string;
  capacityBPD: number;
  status: FacilityStatus;
  newsSourceUrl?: string;
  description: string;
  percentGlobalCapacity: number;
}

export const curatedFires: CuratedFire[] = [
  {
    id: 'abqaiq',
    name: 'Abqaiq Processing Facility',
    facilityType: 'refinery',
    lat: 25.9386,
    lng: 49.6811,
    matchRadius: 8,
    country: 'Saudi Arabia',
    capacityBPD: 7000000,
    status: 'monitoring',
    description: 'World\'s largest oil processing facility. Processes ~70% of Saudi crude.',
    percentGlobalCapacity: 7.0
  },
  {
    id: 'ras-tanura',
    name: 'Ras Tanura Refinery & Terminal',
    facilityType: 'refinery',
    lat: 26.6427,
    lng: 50.1546,
    matchRadius: 6,
    country: 'Saudi Arabia',
    capacityBPD: 550000,
    status: 'monitoring',
    description: 'Saudi Arabia\'s largest refinery complex and export terminal.',
    percentGlobalCapacity: 0.55
  },
  {
    id: 'kharg-island',
    name: 'Kharg Island Terminal',
    facilityType: 'port',
    lat: 29.2333,
    lng: 50.3167,
    matchRadius: 5,
    country: 'Iran',
    capacityBPD: 5000000,
    status: 'monitoring',
    description: 'Iran\'s primary oil export terminal. Handles ~90% of Iran\'s crude exports.',
    percentGlobalCapacity: 5.0
  },
  {
    id: 'banias',
    name: 'Banias Refinery',
    facilityType: 'refinery',
    lat: 35.1833,
    lng: 35.9500,
    matchRadius: 4,
    country: 'Syria',
    capacityBPD: 133000,
    status: 'damaged',
    description: 'Syria\'s main Mediterranean refinery. Repeatedly targeted in conflict.',
    percentGlobalCapacity: 0.13
  },
  {
    id: 'homs-refinery',
    name: 'Homs Refinery',
    facilityType: 'refinery',
    lat: 34.7500,
    lng: 36.7167,
    matchRadius: 4,
    country: 'Syria',
    capacityBPD: 107000,
    status: 'damaged',
    description: 'Syria\'s largest inland refinery.',
    percentGlobalCapacity: 0.11
  },
  {
    id: 'baiji',
    name: 'Baiji Refinery',
    facilityType: 'refinery',
    lat: 34.9333,
    lng: 43.4833,
    matchRadius: 5,
    country: 'Iraq',
    capacityBPD: 310000,
    status: 'damaged',
    description: 'Iraq\'s largest refinery. Severely damaged in conflict, partially rebuilt.',
    percentGlobalCapacity: 0.31
  },
  {
    id: 'kirkuk-oil-field',
    name: 'Kirkuk Oil Field',
    facilityType: 'oil_field',
    lat: 35.4681,
    lng: 44.3917,
    matchRadius: 10,
    country: 'Iraq',
    capacityBPD: 450000,
    status: 'monitoring',
    description: 'One of the world\'s largest oil fields. Production frequently disrupted.',
    percentGlobalCapacity: 0.45
  },
  {
    id: 'rumaila',
    name: 'Rumaila Oil Field',
    facilityType: 'oil_field',
    lat: 30.5833,
    lng: 47.2833,
    matchRadius: 15,
    country: 'Iraq',
    capacityBPD: 1500000,
    status: 'operational',
    description: 'Iraq\'s largest oil field. Located in southern Basra governorate.',
    percentGlobalCapacity: 1.5
  },
  {
    id: 'ras-laffan',
    name: 'Ras Laffan Industrial City',
    facilityType: 'lng_terminal',
    lat: 25.9000,
    lng: 51.5333,
    matchRadius: 8,
    country: 'Qatar',
    capacityBPD: 1400000,
    status: 'operational',
    description: 'World\'s largest LNG export facility. Handles ~30% of global LNG.',
    percentGlobalCapacity: 1.4
  },
  {
    id: 'jebel-ali',
    name: 'Jebel Ali Refinery',
    facilityType: 'refinery',
    lat: 24.9833,
    lng: 55.0333,
    matchRadius: 5,
    country: 'UAE',
    capacityBPD: 140000,
    status: 'operational',
    description: 'UAE refinery adjacent to Jebel Ali port, the region\'s largest port.',
    percentGlobalCapacity: 0.14
  },
  {
    id: 'mina-al-ahmadi',
    name: 'Mina al-Ahmadi Refinery',
    facilityType: 'refinery',
    lat: 29.0667,
    lng: 48.1667,
    matchRadius: 5,
    country: 'Kuwait',
    capacityBPD: 466000,
    status: 'operational',
    description: 'Kuwait\'s largest refinery and export terminal.',
    percentGlobalCapacity: 0.47
  },
  {
    id: 'yanbu',
    name: 'Yanbu Refinery Complex',
    facilityType: 'refinery',
    lat: 24.0000,
    lng: 38.0500,
    matchRadius: 6,
    country: 'Saudi Arabia',
    capacityBPD: 400000,
    status: 'operational',
    description: 'Saudi Red Sea refinery complex. Strategic alternative to Gulf exports.',
    percentGlobalCapacity: 0.4
  },
  {
    id: 'haifa-refinery',
    name: 'Haifa Oil Refineries',
    facilityType: 'refinery',
    lat: 32.8000,
    lng: 35.0167,
    matchRadius: 3,
    country: 'Israel',
    capacityBPD: 197000,
    status: 'monitoring',
    description: 'Israel\'s primary refinery complex in Haifa Bay.',
    percentGlobalCapacity: 0.2
  },
  {
    id: 'ashkelon-pipeline',
    name: 'Eilat-Ashkelon Pipeline Terminal',
    facilityType: 'pipeline',
    lat: 31.6667,
    lng: 34.5667,
    matchRadius: 4,
    country: 'Israel',
    capacityBPD: 600000,
    status: 'monitoring',
    description: 'Trans-Israel pipeline terminal. Key Red Sea to Mediterranean route.',
    percentGlobalCapacity: 0.6
  },
  {
    id: 'aden-refinery',
    name: 'Aden Refinery',
    facilityType: 'refinery',
    lat: 12.8000,
    lng: 45.0167,
    matchRadius: 4,
    country: 'Yemen',
    capacityBPD: 150000,
    status: 'damaged',
    description: 'Yemen\'s main refinery. Repeatedly targeted in civil war.',
    percentGlobalCapacity: 0.15
  }
];

/**
 * Haversine distance in km between two coordinates
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find matching curated facility within matchRadius of given coordinates
 */
export function matchFacility(lat: number, lng: number): CuratedFire | null {
  for (const facility of curatedFires) {
    const dist = haversineKm(lat, lng, facility.lat, facility.lng);
    if (dist <= facility.matchRadius) {
      return facility;
    }
  }
  return null;
}
