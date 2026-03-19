export type FacilityType = 'refinery' | 'lng_terminal' | 'pipeline' | 'storage' | 'oil_field' | 'port' | 'gas_field';
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
  attackDate?: string;
  newsSourceUrl?: string;
  description: string;
  percentGlobalCapacity: number;
}

// ═══ CONFIRMED CONFLICT STRIKES (March 2026 Iran War) ═══
// All entries sourced from major news outlets. See newsSourceUrl for each.

export const curatedFires: CuratedFire[] = [
  // ── Confirmed Strikes ──
  {
    id: 'ras-tanura',
    name: 'Ras Tanura Refinery & Terminal',
    facilityType: 'refinery',
    lat: 26.6427,
    lng: 50.1546,
    matchRadius: 6,
    country: 'Saudi Arabia',
    capacityBPD: 550000,
    status: 'damaged',
    attackDate: '2026-03-02',
    newsSourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-02/saudi-arabia-s-ras-tanura-refinery-shuts-down-after-drone-attack',
    description: 'Iran drone strike Mar 2. Debris caused fire, refinery shut down for a week. Saudi\'s largest refinery, 550K BPD.',
    percentGlobalCapacity: 0.55
  },
  {
    id: 'bapco-sitra',
    name: 'BAPCO Sitra Refinery',
    facilityType: 'refinery',
    lat: 26.1500,
    lng: 50.6167,
    matchRadius: 4,
    country: 'Bahrain',
    capacityBPD: 267000,
    status: 'active_fire',
    attackDate: '2026-03-09',
    newsSourceUrl: 'https://www.euronews.com/business/2026/03/09/bapco-declares-force-majeure-as-iran-sets-bahrains-only-refinery-ablaze',
    description: 'Iran strike set Bahrain\'s only refinery ablaze Mar 9. Force majeure declared. 32 injuries reported.',
    percentGlobalCapacity: 0.27
  },
  {
    id: 'kharg-island',
    name: 'Kharg Island Terminal',
    facilityType: 'port',
    lat: 29.2333,
    lng: 50.3167,
    matchRadius: 8,
    country: 'Iran',
    capacityBPD: 5000000,
    status: 'damaged',
    attackDate: '2026-03-13',
    newsSourceUrl: 'https://www.washingtonpost.com/politics/2026/03/13/trump-us-iran-war-kharg-island-oil/',
    description: 'US bombed 90+ military targets on Kharg Island Mar 13. Oil infrastructure spared but exports disrupted. Handles 90% of Iran\'s crude exports.',
    percentGlobalCapacity: 5.0
  },
  {
    id: 'shah-gas-field',
    name: 'Shah Gas Field (ADNOC/Occidental)',
    facilityType: 'gas_field',
    lat: 23.4000,
    lng: 53.7000,
    matchRadius: 15,
    country: 'UAE',
    capacityBPD: 0,
    status: 'damaged',
    attackDate: '2026-03-16',
    newsSourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-16/drone-strike-sets-uae-natural-gas-field-ablaze-abu-dhabi-says',
    description: 'Iran drone strike set Shah gas field ablaze Mar 16. Operations suspended. 1.28 billion cubic feet/day capacity. 180km SW of Abu Dhabi.',
    percentGlobalCapacity: 0.3
  },
  {
    id: 'south-pars',
    name: 'South Pars Gas Field (Assaluyeh)',
    facilityType: 'gas_field',
    lat: 27.4833,
    lng: 52.6000,
    matchRadius: 15,
    country: 'Iran',
    capacityBPD: 0,
    status: 'active_fire',
    attackDate: '2026-03-18',
    newsSourceUrl: 'https://www.axios.com/2026/03/18/israel-strikes-iran-natural-gas-infrastructure',
    description: 'Israel/US drone strike hit 4 gas treatment plants at Assaluyeh Mar 18. Facilities taken offline. World\'s largest gas field (shared with Qatar).',
    percentGlobalCapacity: 2.5
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
    status: 'active_fire',
    attackDate: '2026-03-18',
    newsSourceUrl: 'https://www.aljazeera.com/news/2026/3/18/qatar-says-iran-missile-attack-sparks-fire-causes-damage-at-gas-facility',
    description: 'Iran missile strike Mar 18 in retaliation for South Pars. 4 of 5 missiles intercepted, 1 hit. Extensive damage, fire. World\'s largest LNG export facility (~20% global supply).',
    percentGlobalCapacity: 1.4
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
    status: 'active_fire',
    attackDate: '2026-03-19',
    newsSourceUrl: 'https://www.businesstoday.in/world/story/kuwait-reports-second-refinery-fire-after-drone-attack-at-mina-al-ahmadi-521391-2026-03-19',
    description: 'Iran drone strike Mar 19 (today). Second refinery fire. Kuwait\'s largest refinery. Fire contained, no injuries.',
    percentGlobalCapacity: 0.47
  },

  // ── Threatened / Monitoring ──
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
    description: 'World\'s largest oil processing facility. Processes ~70% of Saudi crude. Not yet targeted in 2026 conflict.',
    percentGlobalCapacity: 7.0
  },
  {
    id: 'samref-yanbu',
    name: 'SAMREF Refinery (Yanbu)',
    facilityType: 'refinery',
    lat: 24.0500,
    lng: 38.0667,
    matchRadius: 6,
    country: 'Saudi Arabia',
    capacityBPD: 400000,
    status: 'monitoring',
    newsSourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae',
    description: 'Named as direct target by Iran on Mar 18. Ordered evacuated. Saudi Red Sea refinery complex.',
    percentGlobalCapacity: 0.4
  },
  {
    id: 'jubail-petrochem',
    name: 'Jubail Petrochemical Complex',
    facilityType: 'refinery',
    lat: 27.0000,
    lng: 49.6500,
    matchRadius: 8,
    country: 'Saudi Arabia',
    capacityBPD: 350000,
    status: 'monitoring',
    newsSourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae',
    description: 'Named as direct target by Iran on Mar 18. Ordered evacuated. Major petrochemical hub.',
    percentGlobalCapacity: 0.35
  },
  {
    id: 'al-hosn-gas',
    name: 'Al Hosn Gas Field (UAE)',
    facilityType: 'gas_field',
    lat: 23.8500,
    lng: 53.1000,
    matchRadius: 10,
    country: 'UAE',
    capacityBPD: 0,
    status: 'monitoring',
    newsSourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae',
    description: 'Named as direct target by Iran on Mar 18. One of world\'s largest sour gas fields.',
    percentGlobalCapacity: 0.2
  },
  {
    id: 'mesaieed-petrochem',
    name: 'Mesaieed Petrochemical Complex',
    facilityType: 'refinery',
    lat: 24.9833,
    lng: 51.5500,
    matchRadius: 6,
    country: 'Qatar',
    capacityBPD: 200000,
    status: 'monitoring',
    newsSourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae',
    description: 'Named as direct target by Iran on Mar 18. Major Qatar petrochemical hub.',
    percentGlobalCapacity: 0.2
  },
  {
    id: 'fujairah-oil-zone',
    name: 'Fujairah Oil Industry Zone',
    facilityType: 'storage',
    lat: 25.1333,
    lng: 56.3333,
    matchRadius: 5,
    country: 'UAE',
    capacityBPD: 0,
    status: 'damaged',
    attackDate: '2026-03-16',
    newsSourceUrl: 'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html',
    description: 'Iran drone attack caused fire at Fujairah storage zone Mar 16. Key oil storage hub outside Strait of Hormuz.',
    percentGlobalCapacity: 0.1
  },

  // ── Other Regional Facilities ──
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
