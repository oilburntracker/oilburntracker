export type EventCategory =
  | 'military_strike'
  | 'facility_damage'
  | 'chokepoint'
  | 'diplomatic'
  | 'escalation'
  | 'retaliation';

export interface ConflictEvent {
  id: string;
  date: string;                    // ISO date
  title: string;
  category: EventCategory;
  description: string;
  facilityId?: string;             // links to curated-fires.ts
  lat?: number;
  lng?: number;
  zoom?: number;
  sourceUrl?: string;
  mediaUrls?: {                    // embedded video/images
    type: 'youtube' | 'twitter' | 'news';
    url: string;
    label?: string;
  }[];
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  military_strike: 'Military Strike',
  facility_damage: 'Facility Damage',
  chokepoint: 'Chokepoint Threat',
  diplomatic: 'Diplomatic',
  escalation: 'Escalation',
  retaliation: 'Retaliation'
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  military_strike: '#ef4444',
  facility_damage: '#f97316',
  chokepoint: '#eab308',
  diplomatic: '#3b82f6',
  escalation: '#a855f7',
  retaliation: '#ec4899'
};

export { CATEGORY_LABELS, CATEGORY_COLORS };

// ═══ CONFLICT TIMELINE: Oct 2023 → Present ═══
// Each event sourced from major outlets. Submit PRs to add events.

export const conflictEvents: ConflictEvent[] = [
  // ── 2023: October War ──
  {
    id: 'oct7-attack',
    date: '2023-10-07',
    title: 'Hamas attacks Israel — October 7 massacre',
    category: 'escalation',
    description: 'Hamas-led assault on southern Israel. 1,200+ killed, 250+ taken hostage. Music festival and kibbutzim targeted. Triggers Israeli ground invasion of Gaza.',
    lat: 31.3547,
    lng: 34.3088,
    zoom: 9,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67039975'
  },
  {
    id: 'israel-gaza-invasion',
    date: '2023-10-27',
    title: 'Israel launches ground invasion of Gaza',
    category: 'escalation',
    description: 'IDF begins ground operations in northern Gaza. Massive aerial bombardment campaign. Gaza infrastructure systematically destroyed over following months.',
    lat: 31.5,
    lng: 34.47,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2023/10/28/israel-announces-expansion-of-ground-operations-in-gaza'
  },

  // ── 2024: Regional Escalation ──
  {
    id: 'houthi-shipping-attacks',
    date: '2024-01-12',
    title: 'US/UK strike Houthi targets in Yemen after Red Sea shipping attacks',
    category: 'chokepoint',
    description: 'Houthis have been attacking commercial shipping in Red Sea since Nov 2023 in solidarity with Gaza. US/UK launch strikes on Houthi positions. Bab el-Mandeb transit disrupted — major shipping reroutes around Africa.',
    facilityId: 'bab-el-mandeb',
    lat: 12.58,
    lng: 43.33,
    zoom: 7,
    sourceUrl: 'https://www.reuters.com/world/middle-east/us-launches-strikes-against-houthi-targets-yemen-officials-say-2024-01-12/'
  },
  {
    id: 'iran-israel-april-drones',
    date: '2024-04-13',
    title: 'Iran launches 300+ drones and missiles at Israel',
    category: 'retaliation',
    description: 'Iran\'s first direct attack on Israel in retaliation for Damascus consulate strike. 170 drones, 30 cruise missiles, 120 ballistic missiles. Nearly all intercepted by Israel, US, UK, Jordan, Saudi air defenses.',
    lat: 31.77,
    lng: 35.21,
    zoom: 7,
    sourceUrl: 'https://www.nytimes.com/2024/04/13/world/middleeast/iran-attacks-israel.html'
  },
  {
    id: 'israel-strikes-isfahan',
    date: '2024-04-19',
    title: 'Israel strikes Isfahan — near Iranian nuclear facilities',
    category: 'military_strike',
    description: 'Israel retaliates with limited strike near Isfahan nuclear complex. Calculated to demonstrate reach without triggering full war. Iran downplays damage.',
    lat: 32.65,
    lng: 51.68,
    zoom: 8,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-68852804'
  },
  {
    id: 'hezbollah-escalation',
    date: '2024-09-17',
    title: 'Pager and walkie-talkie attacks on Hezbollah',
    category: 'escalation',
    description: 'Israel detonates thousands of pagers and walkie-talkies used by Hezbollah in Lebanon. Thousands injured. Attributed to years-long infiltration operation.',
    lat: 33.89,
    lng: 35.5,
    zoom: 8,
    sourceUrl: 'https://www.reuters.com/world/middle-east/hezbollah-members-wounded-when-pagers-exploded-lebanon-sources-2024-09-17/'
  },
  {
    id: 'nasrallah-killed',
    date: '2024-09-27',
    title: 'Israel kills Hezbollah leader Hassan Nasrallah',
    category: 'military_strike',
    description: 'Israeli airstrike on Hezbollah headquarters in Dahieh, Beirut kills Secretary-General Hassan Nasrallah. Massive escalation. Iran vows revenge.',
    lat: 33.84,
    lng: 35.49,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2024/9/28/hezbollah-leader-hassan-nasrallah-killed-in-israeli-air-strike'
  },
  {
    id: 'iran-october-missiles',
    date: '2024-10-01',
    title: 'Iran launches 180+ ballistic missiles at Israel',
    category: 'retaliation',
    description: 'Iran\'s largest ever missile barrage at Israel. Some missiles hit Nevatim and Tel Nof airbases. Iran warns of "crushing response" if Israel retaliates. Oil prices spike.',
    lat: 31.77,
    lng: 35.21,
    zoom: 7,
    sourceUrl: 'https://www.bbc.com/news/articles/c5y5z50ly28o'
  },
  {
    id: 'israel-strikes-iran-oct',
    date: '2024-10-26',
    title: 'Israel strikes Iranian air defenses and missile production',
    category: 'military_strike',
    description: 'Israel retaliates against Iran — strikes radar, air defense systems, and missile production facilities across 3 provinces. Avoids nuclear and oil sites. Iran signals de-escalation.',
    lat: 35.7,
    lng: 51.42,
    zoom: 6,
    sourceUrl: 'https://www.reuters.com/world/middle-east/israeli-warplanes-carry-out-strikes-iran-israeli-military-says-2024-10-26/'
  },

  // ── 2025: Toward Full War ──
  {
    id: 'trump-iran-ultimatum',
    date: '2025-01-20',
    title: 'Trump inaugurated — issues ultimatum to Iran on nuclear program',
    category: 'diplomatic',
    description: 'Trump takes office, immediately issues "maximum pressure 2.0" sanctions on Iran. Demands complete halt to uranium enrichment. Sets 90-day deadline.',
    lat: 38.9,
    lng: -77.04,
    zoom: 5,
    sourceUrl: 'https://www.reuters.com/world/trumps-maximum-pressure-iran-2025-01-20/'
  },
  {
    id: 'iran-90pct-enrichment',
    date: '2025-06-15',
    title: 'Iran crosses 90% uranium enrichment threshold',
    category: 'escalation',
    description: 'IAEA confirms Iran has enriched uranium to 90% — weapons grade. Crosses red line for Israel and US. Regional tensions at breaking point.',
    lat: 33.72,
    lng: 51.43,
    zoom: 8,
    sourceUrl: 'https://www.reuters.com/world/iran-enriches-uranium-90-percent-iaea-2025-06-15/'
  },
  {
    id: 'hormuz-mining-threat',
    date: '2025-12-01',
    title: 'Iran threatens to mine Strait of Hormuz',
    category: 'chokepoint',
    description: 'IRGC Navy announces "defensive mining operations" in Strait of Hormuz if sanctions continue. 21M BPD of oil transit at risk. Insurance rates for Gulf shipping double.',
    facilityId: 'strait-of-hormuz',
    lat: 26.57,
    lng: 56.25,
    zoom: 8,
    sourceUrl: 'https://www.aljazeera.com/news/2025/12/1/iran-threatens-strait-of-hormuz-mining'
  },

  // ── 2026: The Iran War ──
  {
    id: 'us-israel-strikes-iran-nuclear',
    date: '2026-02-28',
    title: 'US and Israel launch strikes on Iranian nuclear facilities',
    category: 'military_strike',
    description: 'Joint US-Israel operation strikes Natanz, Fordow, and Isfahan nuclear sites. Bunker busters used on underground centrifuge halls. Iran declares state of war.',
    lat: 33.72,
    lng: 51.73,
    zoom: 6,
    sourceUrl: 'https://www.washingtonpost.com/national-security/2026/02/28/us-israel-iran-nuclear-strike/'
  },
  {
    id: 'ras-tanura-strike',
    date: '2026-03-02',
    title: 'Iran drone strike hits Ras Tanura — Saudi\'s largest refinery',
    category: 'facility_damage',
    description: 'Iran retaliates against Gulf states. Drone debris causes fire at Ras Tanura refinery (550K BPD). Saudi\'s largest refinery shuts down for a week. First energy infrastructure hit of the war.',
    facilityId: 'ras-tanura',
    lat: 26.6427,
    lng: 50.1546,
    zoom: 10,
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-02/saudi-arabia-s-ras-tanura-refinery-shuts-down-after-drone-attack'
  },
  {
    id: 'bapco-strike',
    date: '2026-03-09',
    title: 'Iran sets Bahrain\'s ONLY refinery ablaze',
    category: 'facility_damage',
    description: 'BAPCO Sitra refinery hit by Iranian strike. Force majeure declared. 32 injuries. Bahrain has zero refining capacity — entire country dependent on fuel imports.',
    facilityId: 'bapco-sitra',
    lat: 26.15,
    lng: 50.6167,
    zoom: 11,
    sourceUrl: 'https://www.euronews.com/business/2026/03/09/bapco-declares-force-majeure-as-iran-sets-bahrains-only-refinery-ablaze'
  },
  {
    id: 'kharg-island-strike',
    date: '2026-03-13',
    title: 'US bombs 90+ targets on Kharg Island',
    category: 'military_strike',
    description: 'US strikes Iranian military positions on Kharg Island. Oil infrastructure officially spared but exports disrupted. Kharg handles 90% of Iran\'s crude exports (5M BPD capacity).',
    facilityId: 'kharg-island',
    lat: 29.2333,
    lng: 50.3167,
    zoom: 10,
    sourceUrl: 'https://www.washingtonpost.com/politics/2026/03/13/trump-us-iran-war-kharg-island-oil/'
  },
  {
    id: 'shah-fujairah-strikes',
    date: '2026-03-16',
    title: 'Iran hits UAE — Shah Gas Field and Fujairah storage ablaze',
    category: 'facility_damage',
    description: 'Iran drone strikes hit Shah Gas Field (1.28 BCF/day) and Fujairah Oil Industry Zone (42M barrel storage). Two simultaneous attacks on UAE energy infrastructure. Operations suspended at both.',
    facilityId: 'shah-gas-field',
    lat: 23.4,
    lng: 53.7,
    zoom: 7,
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-16/drone-strike-sets-uae-natural-gas-field-ablaze-abu-dhabi-says',
    mediaUrls: [
      { type: 'news', url: 'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html', label: 'CNBC: Fujairah attack' }
    ]
  },
  {
    id: 'south-pars-strike',
    date: '2026-03-18',
    title: 'Israel/US hit South Pars — world\'s largest gas field',
    category: 'military_strike',
    description: 'Drone strikes hit 4 gas treatment plants at Assaluyeh. South Pars is the world\'s largest gas field (14 BCF/day). Iran loses 60%+ of domestic gas supply. Facilities taken offline.',
    facilityId: 'south-pars',
    lat: 27.4833,
    lng: 52.6,
    zoom: 9,
    sourceUrl: 'https://www.axios.com/2026/03/18/israel-strikes-iran-natural-gas-infrastructure'
  },
  {
    id: 'ras-laffan-retaliation',
    date: '2026-03-18',
    title: 'Iran retaliates — missile hits Ras Laffan, world\'s largest LNG facility',
    category: 'retaliation',
    description: 'Hours after South Pars strike, Iran fires 5 missiles at Ras Laffan, Qatar. 4 intercepted, 1 hits. Fire and extensive damage at facility producing 20% of global LNG. Qatar condemns attack.',
    facilityId: 'ras-laffan',
    lat: 25.9,
    lng: 51.5333,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/18/qatar-says-iran-missile-attack-sparks-fire-causes-damage-at-gas-facility'
  },
  {
    id: 'iran-threatens-targets',
    date: '2026-03-18',
    title: 'Iran names 6 Gulf facilities as direct targets — orders evacuations',
    category: 'escalation',
    description: 'Iran publicly names SAMREF Yanbu, Jubail, Al Hosn, Mesaieed, and other facilities as imminent targets. Orders civilian evacuations. Gulf states on highest alert.',
    lat: 25.0,
    lng: 50.0,
    zoom: 6,
    sourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae'
  },
  {
    id: 'mina-al-ahmadi-strike',
    date: '2026-03-19',
    title: 'Iran drone strike hits Kuwait\'s largest refinery',
    category: 'facility_damage',
    description: 'Mina al-Ahmadi refinery (466K BPD) hit by Iranian drone. Kuwait\'s largest refinery. Fire contained, no injuries. Second fire at this complex. Conflict spreading to previously uninvolved Gulf states.',
    facilityId: 'mina-al-ahmadi',
    lat: 29.0667,
    lng: 48.1667,
    zoom: 10,
    sourceUrl: 'https://www.businesstoday.in/world/story/kuwait-reports-second-refinery-fire-after-drone-attack-at-mina-al-ahmadi-521391-2026-03-19'
  }
];

/**
 * Get events up to a given date (for scrubber filtering)
 */
export function getEventsUpTo(date: string): ConflictEvent[] {
  return conflictEvents.filter((e) => e.date <= date);
}

/**
 * Get facility IDs that should be visible at a given date
 */
export function getVisibleFacilityIds(date: string): Set<string> {
  const ids = new Set<string>();
  for (const event of conflictEvents) {
    if (event.date <= date && event.facilityId) {
      ids.add(event.facilityId);
    }
  }
  return ids;
}

/**
 * Get unique dates for scrubber tick marks
 */
export function getTimelineDates(): string[] {
  const dates = Array.from(new Set(conflictEvents.map((e) => e.date)));
  return dates.sort();
}
