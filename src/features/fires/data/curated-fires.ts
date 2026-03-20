export type FacilityType = 'refinery' | 'lng_terminal' | 'pipeline' | 'storage' | 'oil_field' | 'port' | 'gas_field';
export type FacilityStatus = 'active_fire' | 'damaged' | 'monitoring' | 'offline' | 'operational';
export type ThreatLevel = 'critical' | 'high' | 'elevated' | 'moderate' | 'low';

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

  // Energy content
  storageMBBL?: number;        // million barrels oil storage
  gasCapacityBCFD?: number;    // billion cubic feet/day gas
  lngMTPA?: number;            // million tons per annum LNG

  // Strategic risk
  threatLevel: ThreatLevel;
  whyItMatters: string;        // 1-liner on strategic importance
  ifDestroyed: string;         // cascade impact if taken offline
  supplyChainRole?: string;    // what flows through it
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
    storageMBBL: 33,
    status: 'damaged',
    attackDate: '2026-03-02',
    newsSourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-02/saudi-arabia-s-ras-tanura-refinery-shuts-down-after-drone-attack',
    description: 'Iran drone strike Mar 2. Debris caused fire, refinery shut down for a week. Saudi\'s largest refinery, 550K BPD.',
    percentGlobalCapacity: 0.55,
    threatLevel: 'high',
    whyItMatters: 'Saudi\'s largest refinery + largest oil export terminal. 33M barrel tank farm adjacent.',
    ifDestroyed: 'Removes 550K BPD refining + disrupts Saudi eastern export terminal. ~6M barrels/day of exports route through Ras Tanura. Oil price spike $10-15/barrel.',
    supplyChainRole: 'Refines Saudi crude → exports via tanker to Asia/Europe. Connected to Ghawar field pipeline network.'
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
    storageMBBL: 4,
    status: 'active_fire',
    attackDate: '2026-03-09',
    newsSourceUrl: 'https://www.euronews.com/business/2026/03/09/bapco-declares-force-majeure-as-iran-sets-bahrains-only-refinery-ablaze',
    description: 'Iran strike set Bahrain\'s only refinery ablaze Mar 9. Force majeure declared. 32 injuries reported.',
    percentGlobalCapacity: 0.27,
    threatLevel: 'critical',
    whyItMatters: 'Bahrain\'s ONLY refinery — entire country depends on this single facility for fuel.',
    ifDestroyed: 'Bahrain loses 100% domestic refining. Total dependency on imports. Civilian fuel crisis within days. US 5th Fleet base at risk of fuel shortage.',
    supplyChainRole: 'Processes Abu Safah crude from Saudi/Bahrain shared field. Sole fuel supplier to Bahrain including US Naval Support Activity.'
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
    storageMBBL: 20.2,
    status: 'damaged',
    attackDate: '2026-03-13',
    newsSourceUrl: 'https://www.washingtonpost.com/politics/2026/03/13/trump-us-iran-war-kharg-island-oil/',
    description: 'US bombed 90+ military targets on Kharg Island Mar 13. Oil infrastructure spared but exports disrupted. Handles 90% of Iran\'s crude exports.',
    percentGlobalCapacity: 5.0,
    threatLevel: 'critical',
    whyItMatters: 'Handles 90% of Iran\'s crude exports. 20.2M barrel storage. 5M BPD throughput capacity.',
    ifDestroyed: 'Iran loses ability to export oil entirely. ~1.5M BPD removed from global market. Oil spikes $20-30/barrel. Massive environmental disaster from 20M barrel storage.',
    supplyChainRole: 'Pipeline terminus from Iran\'s interior oil fields → loaded onto tankers for China, India, Turkey. T-shaped jetty handles VLCCs.'
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
    gasCapacityBCFD: 1.28,
    status: 'damaged',
    attackDate: '2026-03-16',
    newsSourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-16/drone-strike-sets-uae-natural-gas-field-ablaze-abu-dhabi-says',
    description: 'Iran drone strike set Shah gas field ablaze Mar 16. Operations suspended. 1.28 billion cubic feet/day capacity. 180km SW of Abu Dhabi.',
    percentGlobalCapacity: 0.3,
    threatLevel: 'high',
    whyItMatters: 'World\'s largest sour gas development. 1.28 BCF/day. Also produces 50K BPD condensate + 4,400 tons/day sulfur.',
    ifDestroyed: 'UAE loses ~15% of gas production. Power grid strain in Abu Dhabi. Sulfur supply disruption (key for fertilizer). H2S contamination risk if wells damaged improperly.',
    supplyChainRole: 'Processes ultra-sour gas (23% H2S) → pipeline to Abu Dhabi industrial grid → electricity, desalination plants, industry.'
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
    gasCapacityBCFD: 14.0,
    status: 'active_fire',
    attackDate: '2026-03-18',
    newsSourceUrl: 'https://www.axios.com/2026/03/18/israel-strikes-iran-natural-gas-infrastructure',
    description: 'Israel/US drone strike hit 4 gas treatment plants at Assaluyeh Mar 18. Facilities taken offline. World\'s largest gas field (shared with Qatar).',
    percentGlobalCapacity: 2.5,
    threatLevel: 'critical',
    whyItMatters: 'WORLD\'S LARGEST GAS FIELD. 14 BCF/day. Shared reservoir with Qatar\'s North Field. Iran\'s primary gas source (>60% domestic supply).',
    ifDestroyed: 'Iran loses 60%+ of domestic gas supply. Nationwide heating/electricity crisis. ~40M Iranians lose heat in winter. Regional environmental catastrophe from uncontrolled gas release.',
    supplyChainRole: '24 processing phases at Assaluyeh → feeds Iran\'s national gas grid, petrochemical complexes, and re-injection into aging oil fields to maintain pressure.'
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
    gasCapacityBCFD: 7.0,
    lngMTPA: 77,
    storageMBBL: 2.5,
    status: 'active_fire',
    attackDate: '2026-03-18',
    newsSourceUrl: 'https://www.aljazeera.com/news/2026/3/18/qatar-says-iran-missile-attack-sparks-fire-causes-damage-at-gas-facility',
    description: 'Iran missile strike Mar 18 in retaliation for South Pars. 4 of 5 missiles intercepted, 1 hit. Extensive damage, fire. World\'s largest LNG export facility (~20% global supply).',
    percentGlobalCapacity: 1.4,
    threatLevel: 'critical',
    whyItMatters: 'WORLD\'S LARGEST LNG FACILITY. 77M tons/year = ~20% of all global LNG trade. Qatar\'s entire economy depends on this site.',
    ifDestroyed: 'Global LNG catastrophe. Europe loses major gas source, prices 3-5x. Asian LNG markets collapse. Qatar GDP drops 40%+. Winter energy crisis across EU/Japan/Korea.',
    supplyChainRole: 'North Field gas → 14 LNG trains at Ras Laffan → LNG tankers → Europe, Japan, Korea, China. Also produces 1.4M BPD condensate/NGL.'
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
    storageMBBL: 6.5,
    status: 'active_fire',
    attackDate: '2026-03-19',
    newsSourceUrl: 'https://www.businesstoday.in/world/story/kuwait-reports-second-refinery-fire-after-drone-attack-at-mina-al-ahmadi-521391-2026-03-19',
    description: 'Iran drone strike Mar 19 (today). Second refinery fire. Kuwait\'s largest refinery. Fire contained, no injuries.',
    percentGlobalCapacity: 0.47,
    threatLevel: 'high',
    whyItMatters: 'Kuwait\'s largest refinery, part of 3-refinery complex totaling 800K+ BPD. Adjacent to country\'s main export terminal.',
    ifDestroyed: 'Kuwait loses 55% of refining capacity. Regional jet fuel/diesel shortage. Mina al-Ahmadi port (2M BPD export capacity) disrupted.',
    supplyChainRole: 'Refines Kuwaiti crude → jet fuel, diesel, gasoline for Kuwait + export. Connected to Mina al-Ahmadi export port and Mina Abdullah refinery.'
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
    storageMBBL: 42,
    status: 'damaged',
    attackDate: '2026-03-16',
    newsSourceUrl: 'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html',
    description: 'Iran drone attack caused fire at Fujairah storage zone Mar 16. Key oil storage hub outside Strait of Hormuz.',
    percentGlobalCapacity: 0.1,
    threatLevel: 'critical',
    whyItMatters: 'World\'s 3rd largest bunkering hub. 42M barrel storage. ONLY major Gulf storage OUTSIDE the Strait of Hormuz chokepoint.',
    ifDestroyed: 'Eliminates the Hormuz bypass. All Gulf oil must transit Hormuz with no buffer. Shipping insurance rates spike. Emergency reserves for regional navies lost.',
    supplyChainRole: 'ADNOC pipeline bypasses Hormuz → Fujairah → tankers load for Asia. Emergency buffer if Hormuz is mined/blocked. Bunkering fuel for global shipping.'
  },

  // ── Iran-Threatened / Monitoring ──
  {
    id: 'abqaiq',
    name: 'Abqaiq Processing Facility',
    facilityType: 'refinery',
    lat: 25.9386,
    lng: 49.6811,
    matchRadius: 8,
    country: 'Saudi Arabia',
    capacityBPD: 7000000,
    storageMBBL: 8,
    status: 'monitoring',
    description: 'World\'s largest oil processing facility. Processes ~70% of Saudi crude. Not yet targeted in 2026 conflict.',
    percentGlobalCapacity: 7.0,
    threatLevel: 'critical',
    whyItMatters: 'THE MOST CRITICAL OIL FACILITY ON EARTH. Processes 7M BPD — 70% of all Saudi crude passes through here. No replacement exists.',
    ifDestroyed: 'REGIONAL CATASTROPHE. 7M BPD offline = 7% of global supply gone instantly. Oil to $200+/barrel. Global recession within weeks. 2019 drone attack took out 5.7M BPD for weeks — full destruction would be 10x worse.',
    supplyChainRole: 'All Saudi eastern province crude → Abqaiq stabilization → pipelines to Ras Tanura, Yanbu, Jubail. Single point of failure for Saudi oil industry.'
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
    storageMBBL: 12,
    status: 'damaged',
    newsSourceUrl: 'https://www.pbs.org/newshour/world/iran-intensifies-attacks-on-gulf-energy-sites-after-israel-struck-its-key-gas-field',
    description: 'Iranian drone strike Mar 19. Ballistic missile at port intercepted. Saudi\'s last Hormuz bypass route threatened.',
    percentGlobalCapacity: 0.4,
    threatLevel: 'high',
    whyItMatters: 'Saudi\'s Red Sea refining hub. Processes crude from East-West pipeline (Petroline). Strategic because it bypasses Hormuz entirely.',
    ifDestroyed: 'Saudi loses Red Sea export capacity. Hormuz bypass route crippled. 400K BPD refining offline. Red Sea shipping disrupted.',
    supplyChainRole: 'Crude arrives via 1,200km East-West pipeline from Abqaiq → refined at Yanbu → exported via Red Sea to Europe/Mediterranean.'
  },
  {
    id: 'jubail-petrochem',
    name: 'Jubail Industrial City',
    facilityType: 'refinery',
    lat: 27.0000,
    lng: 49.6500,
    matchRadius: 8,
    country: 'Saudi Arabia',
    capacityBPD: 350000,
    storageMBBL: 5,
    status: 'monitoring',
    newsSourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae',
    description: 'Named as direct target by Iran on Mar 18. Ordered evacuated. World\'s largest industrial city.',
    percentGlobalCapacity: 0.35,
    threatLevel: 'high',
    whyItMatters: 'World\'s largest industrial city. 350K BPD refining + ~70% of Saudi petrochemical output. SABIC and Saudi Aramco facilities.',
    ifDestroyed: 'Global plastics/chemical shortage. 8% of global petrochemical production offline. Cascades into automotive, packaging, construction, medical supply chains.',
    supplyChainRole: 'Crude/NGL feedstock → refineries + crackers → polyethylene, polypropylene, methanol, fertilizer → shipped globally from Jubail port.'
  },
  {
    id: 'al-hosn-gas',
    name: 'Al Hosn Gas Plant (ADNOC)',
    facilityType: 'gas_field',
    lat: 23.8500,
    lng: 53.1000,
    matchRadius: 10,
    country: 'UAE',
    capacityBPD: 0,
    gasCapacityBCFD: 1.45,
    status: 'offline',
    newsSourceUrl: 'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html',
    description: 'Shut down Mar 19 after Iranian missile debris. Habshan/Bab complex offline. 17% of UAE gas supply cut.',
    percentGlobalCapacity: 0.2,
    threatLevel: 'high',
    whyItMatters: 'World\'s largest sour gas processing plant. 1.45 BCF/day. Processes gas with 5% H2S content — lethal in uncontrolled release.',
    ifDestroyed: 'UAE loses ~17% of gas supply. H2S release risk — 5% concentration is lethal, plant is 210km from Abu Dhabi. Power/water crisis in UAE from desalination plant fuel loss.',
    supplyChainRole: 'Shah Deniz sour gas reservoir → Al Hosn processing → clean gas to UAE national grid → electricity + desalination + industry.'
  },
  {
    id: 'mesaieed-petrochem',
    name: 'Mesaieed Industrial City',
    facilityType: 'refinery',
    lat: 24.9833,
    lng: 51.5500,
    matchRadius: 6,
    country: 'Qatar',
    capacityBPD: 200000,
    storageMBBL: 3,
    status: 'monitoring',
    newsSourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae',
    description: 'Named as direct target by Iran on Mar 18. Major Qatar petrochemical hub.',
    percentGlobalCapacity: 0.2,
    threatLevel: 'elevated',
    whyItMatters: 'Qatar\'s secondary industrial hub. Refining + petrochemicals + fertilizer. Processes condensate from North Field.',
    ifDestroyed: 'Qatar loses refining capacity. Fertilizer exports disrupted (QAFCO is world\'s largest single-site urea producer). Regional food production hit.',
    supplyChainRole: 'North Field condensate + imported crude → refining + QAFCO fertilizer + QAPCO polyethylene → export via Mesaieed port.'
  },

  // ── Strategic Chokepoints & Other Critical Facilities ──
  {
    id: 'strait-of-hormuz',
    name: 'Strait of Hormuz',
    facilityType: 'port',
    lat: 26.5667,
    lng: 56.2500,
    matchRadius: 30,
    country: 'International Waters',
    capacityBPD: 21000000,
    status: 'monitoring',
    description: 'World\'s most critical oil chokepoint. 21M BPD transit daily — 21% of global petroleum consumption. Iran has repeatedly threatened closure.',
    percentGlobalCapacity: 21.0,
    threatLevel: 'critical',
    whyItMatters: 'THE CHOKEPOINT. 21M BPD = 21% of world oil passes through this 33km-wide strait. Iran controls the northern shore. No alternative for most Gulf exports.',
    ifDestroyed: 'GLOBAL CATASTROPHE. 21% of world oil supply halted. Oil to $300+/barrel. Global recession/depression. Only partial alternatives: Yanbu pipeline (5M BPD max), Fujairah pipeline (1.8M BPD), Iraq-Turkey pipeline (damaged).',
    supplyChainRole: 'Saudi, Kuwait, Iraq, UAE, Qatar oil/LNG tankers all transit Hormuz → Indian Ocean → Asia, Europe, Americas. 30% of global LNG also transits here.'
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
    storageMBBL: 2,
    status: 'monitoring',
    description: 'One of the world\'s largest oil fields. Production frequently disrupted by conflict. Kirkuk-Ceyhan pipeline to Turkey is offline.',
    percentGlobalCapacity: 0.45,
    threatLevel: 'elevated',
    whyItMatters: 'Iraqi Kurdistan\'s key oil field. 450K BPD capacity. Kirkuk-Ceyhan pipeline (to Turkey/Mediterranean) has been offline, stranding production.',
    ifDestroyed: 'Iraq loses northern oil production. Kurdish region economic collapse. Eliminates future pipeline restart to Mediterranean.',
    supplyChainRole: 'Produces heavy/light crude → when pipeline works, flows to Ceyhan, Turkey for Mediterranean export. Currently trucking limited volumes.'
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
    storageMBBL: 3,
    status: 'operational',
    description: 'Iraq\'s largest oil field. Located in southern Basra governorate. Operated by BP.',
    percentGlobalCapacity: 1.5,
    threatLevel: 'elevated',
    whyItMatters: 'Iraq\'s largest field. 1.5M BPD = ~30% of Iraq\'s total production. BP-operated. Close to Kuwait/Iran borders.',
    ifDestroyed: 'Iraq loses 30% of oil production. OPEC supply shock. 1.5M BPD = significant global impact. Basra export terminal at Umm Qasr also disrupted.',
    supplyChainRole: 'Crude → pipeline to Basra Oil Terminal (offshore) → tankers → Asia. Iraq\'s southern export system handles ~3.3M BPD total.'
  },
  {
    id: 'haifa-refinery',
    name: 'Haifa Oil Refineries (Bazan)',
    facilityType: 'refinery',
    lat: 32.8000,
    lng: 35.0167,
    matchRadius: 3,
    country: 'Israel',
    capacityBPD: 197000,
    storageMBBL: 2.8,
    status: 'damaged',
    newsSourceUrl: 'https://www.aljazeera.com/news/2026/3/19/israel-says-oil-refinery-hit-in-iranian-missile-attack-no-major-damage',
    description: 'Iranian missile strike Mar 19. Israel\'s largest refinery — half of domestic fuel. Additional damage found overnight. 4 injured.',
    percentGlobalCapacity: 0.2,
    threatLevel: 'high',
    whyItMatters: 'Israel\'s main refinery in densely populated Haifa Bay. Sits next to chemical plants with ammonia storage. Long-standing Hezbollah target.',
    ifDestroyed: 'Israel loses primary refining. Ammonia tank rupture could kill thousands in Haifa. Ecological disaster in Mediterranean. Israel fully dependent on fuel imports.',
    supplyChainRole: 'Crude (imported by tanker from Azerbaijan, Kazakhstan, Africa) → refined at Haifa → Israel domestic fuel market. No pipeline imports since Iraq pipeline destroyed decades ago.'
  },
  {
    id: 'ghawar',
    name: 'Ghawar Oil Field',
    facilityType: 'oil_field',
    lat: 25.4000,
    lng: 49.2000,
    matchRadius: 30,
    country: 'Saudi Arabia',
    capacityBPD: 3800000,
    storageMBBL: 0,
    status: 'operational',
    description: 'World\'s largest oil field. Produces ~3.8M BPD — nearly 4% of global oil. All crude flows to Abqaiq for processing.',
    percentGlobalCapacity: 3.8,
    threatLevel: 'critical',
    whyItMatters: 'WORLD\'S LARGEST OIL FIELD. 280km long. 3.8M BPD. Contains estimated 48-88 billion barrels remaining. Saudi Arabia\'s crown jewel.',
    ifDestroyed: 'Near-impossible to fully destroy (massive underground reservoir, 280km long), but surface infrastructure (GOSPs, pipelines) is vulnerable. Disabling 3-4 Gas Oil Separation Plants could remove 2M+ BPD.',
    supplyChainRole: 'Crude extracted at ~12 GOSPs → pipeline to Abqaiq processing → onward to Ras Tanura, Yanbu, Jubail for refining/export.'
  },
  {
    id: 'bab-el-mandeb',
    name: 'Bab el-Mandeb Strait',
    facilityType: 'port',
    lat: 12.5833,
    lng: 43.3333,
    matchRadius: 20,
    country: 'International Waters',
    capacityBPD: 6200000,
    status: 'monitoring',
    description: 'Red Sea chokepoint between Yemen and Djibouti. 6.2M BPD transit. Houthi attacks already disrupting shipping since 2024.',
    percentGlobalCapacity: 6.2,
    threatLevel: 'high',
    whyItMatters: 'Red Sea chokepoint. 6.2M BPD + 8% of global LNG transits here. Houthis (Iran proxy) have been attacking ships since 2024. Gateway to Suez Canal.',
    ifDestroyed: 'Red Sea route closed. Ships reroute around Africa (adds 10-14 days, $1M+ per voyage). European energy prices spike. Suez Canal revenue collapses.',
    supplyChainRole: 'Gulf oil/LNG → Red Sea → Bab el-Mandeb → Gulf of Aden → Suez Canal → Mediterranean → Europe. Also reverse flow for imports.'
  }
];

// ═══ CATASTROPHE THRESHOLDS ═══
// Derived from IEA emergency response triggers and historical precedent
export const CATASTROPHE_THRESHOLDS = {
  mild: { pctGlobal: 2, label: '2%+ Global Supply Affected', description: 'Strategic reserves can cover shortfall. Moderate price pressure.' },
  severe: { pctGlobal: 5, label: '5%+ Global Supply Affected', description: 'IEA emergency reserve release threshold. Significant supply gap.' },
  crisis: { pctGlobal: 10, label: '10%+ Global Supply Affected', description: '10M+ BPD offline. Exceeds global spare capacity and strategic reserves.' },
  catastrophe: { pctGlobal: 20, label: '20%+ Global Supply Affected', description: 'Hormuz-closure-level disruption. 21M BPD transit at risk.' }
};

export function getCurrentDisruptionLevel() {
  const affectedPct = curatedFires
    .filter((f) => f.status === 'active_fire' || f.status === 'damaged')
    .reduce((sum, f) => sum + f.percentGlobalCapacity, 0);

  if (affectedPct >= CATASTROPHE_THRESHOLDS.catastrophe.pctGlobal) return { level: 'catastrophe' as const, ...CATASTROPHE_THRESHOLDS.catastrophe, affectedPct };
  if (affectedPct >= CATASTROPHE_THRESHOLDS.crisis.pctGlobal) return { level: 'crisis' as const, ...CATASTROPHE_THRESHOLDS.crisis, affectedPct };
  if (affectedPct >= CATASTROPHE_THRESHOLDS.severe.pctGlobal) return { level: 'severe' as const, ...CATASTROPHE_THRESHOLDS.severe, affectedPct };
  if (affectedPct >= CATASTROPHE_THRESHOLDS.mild.pctGlobal) return { level: 'mild' as const, ...CATASTROPHE_THRESHOLDS.mild, affectedPct };
  return { level: 'normal' as const, pctGlobal: 0, label: 'Below 2% Global Supply Affected', description: 'No significant supply disruption.', affectedPct };
}

/**
 * Supply disruption synced to timeline — uses visible facility IDs from conflict events
 */
export function getSupplyDisruptionUpTo(hitFacilityIds: Set<string>) {
  let totalBPDOffline = 0;
  let totalPctGlobal = 0;
  let facilitiesHit = 0;

  for (const facility of curatedFires) {
    if (hitFacilityIds.has(facility.id)) {
      totalBPDOffline += facility.capacityBPD;
      totalPctGlobal += facility.percentGlobalCapacity;
      facilitiesHit++;
    }
  }

  // Disruption level based on timeline position
  let level: 'normal' | 'mild' | 'severe' | 'crisis' | 'catastrophe' = 'normal';
  if (totalPctGlobal >= CATASTROPHE_THRESHOLDS.catastrophe.pctGlobal) level = 'catastrophe';
  else if (totalPctGlobal >= CATASTROPHE_THRESHOLDS.crisis.pctGlobal) level = 'crisis';
  else if (totalPctGlobal >= CATASTROPHE_THRESHOLDS.severe.pctGlobal) level = 'severe';
  else if (totalPctGlobal >= CATASTROPHE_THRESHOLDS.mild.pctGlobal) level = 'mild';

  return { totalBPDOffline, totalPctGlobal, facilitiesHit, level };
}

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
