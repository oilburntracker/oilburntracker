// ═══ COST OF WAR — Progressive Economic Data ═══
// Syncs to the timeline scrubber just like casualties.
// Categories: weapons (taxpayer military spending), resources (infrastructure destroyed),
// economic (inflation, oil price impact, shipping disruption).
// Sources cited where available. Figures are conservative estimates for uncited entries.

export interface WarCostEntry {
  date: string;
  category: 'weapons' | 'resources' | 'economic';
  label: string;
  amountBillions: number;
  source?: string;
}

export const warCosts: WarCostEntry[] = [
  // ═══════════════════════════════════════════════
  // WEAPONS & MILITARY SPENDING
  // (Taxpayer money on weapons, operations, military aid)
  // ═══════════════════════════════════════════════

  // Israel's own Gaza campaign costs
  { date: '2023-10-07', category: 'weapons', label: 'IDF mobilization & initial Gaza operations', amountBillions: 8, source: 'Israel MOD' },
  { date: '2023-10-20', category: 'weapons', label: 'US emergency military aid to Israel', amountBillions: 14.3, source: 'White House supplemental request' },
  { date: '2023-11-01', category: 'weapons', label: 'Iron Dome & David\'s Sling replenishment', amountBillions: 4, source: 'US DOD' },
  { date: '2024-01-01', category: 'weapons', label: 'IDF Gaza campaign Q1 2024', amountBillions: 15, source: 'Brown University Costs of War' },
  { date: '2024-01-12', category: 'weapons', label: 'US/UK Operation Prosperity Guardian (Red Sea)', amountBillions: 2.5, source: 'CENTCOM estimates' },
  { date: '2024-04-14', category: 'weapons', label: 'Iran April 2024 drone/missile barrage & interception', amountBillions: 1.3, source: 'Reuters (interception costs alone ~$1.35B)' },
  { date: '2024-04-24', category: 'weapons', label: 'US supplemental military aid package', amountBillions: 17, source: 'PL 118-50' },
  { date: '2024-07-01', category: 'weapons', label: 'IDF Gaza campaign H2 2024', amountBillions: 20, source: 'Brown University Costs of War' },
  { date: '2024-09-23', category: 'weapons', label: 'IDF Lebanon campaign & precision strikes', amountBillions: 4, source: 'Israel MOD estimates' },
  { date: '2025-01-01', category: 'weapons', label: 'Continued IDF operations 2025', amountBillions: 18, source: 'Brown University Costs of War' },
  { date: '2025-06-01', category: 'weapons', label: 'IDF expanded West Bank operations', amountBillions: 3 },
  { date: '2026-03-01', category: 'weapons', label: 'US 3 carrier groups + Tomahawk strikes on Iran', amountBillions: 8 },
  { date: '2026-03-06', category: 'weapons', label: 'Israel F-35I deep strikes + bunker busters on Iran', amountBillions: 4 },
  { date: '2026-03-09', category: 'weapons', label: 'US expanded air campaign — B-2 sorties, 500+ strikes', amountBillions: 12 },
  { date: '2026-03-14', category: 'weapons', label: 'Iran ballistic missile campaign on Gulf states', amountBillions: 5, source: 'IISS estimates' },
  { date: '2026-03-20', category: 'weapons', label: 'Ongoing US operations ~$1B/day (days 15-21)', amountBillions: 7, source: 'Pentagon estimate / NPR' },
  { date: '2026-03-20', category: 'weapons', label: '11th MEU deployment + 2 additional carrier groups', amountBillions: 3 },
  { date: '2026-03-21', category: 'weapons', label: 'Natanz nuclear facility strike (bunker busters + F-35I)', amountBillions: 2 },
  { date: '2026-03-21', category: 'weapons', label: 'Iran 70th wave — missiles at 5 US bases + Israel', amountBillions: 3, source: 'IRGC / CGTN' },
  { date: '2026-03-21', category: 'weapons', label: 'Day 22 ongoing operations ~$1B/day', amountBillions: 1, source: 'Pentagon' },

  // ═══════════════════════════════════════════════
  // RESOURCES & INFRASTRUCTURE DESTROYED
  // (Physical infrastructure, facilities, capacity permanently lost)
  // ═══════════════════════════════════════════════

  { date: '2023-10-07', category: 'resources', label: 'Gaza infrastructure — first month', amountBillions: 5 },
  { date: '2023-11-01', category: 'resources', label: 'Gaza infrastructure — ongoing destruction', amountBillions: 10, source: 'World Bank interim' },
  { date: '2024-05-01', category: 'resources', label: 'Gaza infrastructure — cumulative destruction', amountBillions: 18, source: 'World Bank 2024 assessment: $33B total' },
  { date: '2024-09-23', category: 'resources', label: 'Lebanon infrastructure damage', amountBillions: 8.5, source: 'World Bank' },
  { date: '2025-09-01', category: 'resources', label: 'West Bank infrastructure damage', amountBillions: 2, source: 'OCHA' },
  { date: '2026-03-02', category: 'resources', label: 'Saudi Ras Tanura refinery damage (550K BPD)', amountBillions: 2 },
  { date: '2026-03-06', category: 'resources', label: 'Isfahan & Natanz nuclear facilities destroyed', amountBillions: 20 },
  { date: '2026-03-08', category: 'resources', label: 'Iran South Pars gas field destroyed (14% global gas)', amountBillions: 30, source: 'Energy industry estimates' },
  { date: '2026-03-09', category: 'resources', label: 'Kharg Island oil terminal destroyed (90% Iran exports)', amountBillions: 15 },
  { date: '2026-03-14', category: 'resources', label: 'Saudi Ghawar & Abqaiq facilities hit', amountBillions: 8 },
  { date: '2026-03-15', category: 'resources', label: 'Bahrain BAPCO refinery hit (only refinery)', amountBillions: 1.5 },
  { date: '2026-03-18', category: 'resources', label: 'Qatar Ras Laffan LNG destroyed (17% capacity)', amountBillions: 26, source: 'QatarEnergy' },
  { date: '2026-03-19', category: 'resources', label: 'Haifa Bazan refinery + Saudi SAMREF Yanbu', amountBillions: 3.5 },
  { date: '2026-03-19', category: 'resources', label: 'UAE Habshan gas field shutdown', amountBillions: 2 },
  { date: '2026-03-20', category: 'resources', label: 'Kuwait Mina al-Ahmadi hit again (2nd strike)', amountBillions: 1.5 },
  { date: '2026-03-21', category: 'resources', label: 'Natanz enrichment facility damage (centrifuge halls)', amountBillions: 10, source: 'Arms Control Association' },
  { date: '2026-03-21', category: 'resources', label: 'Damage across 5 US bases from 70th wave', amountBillions: 1.5 },

  // ═══════════════════════════════════════════════
  // ECONOMIC IMPACT — INFLATION, OIL, SHIPPING
  // (Consumer costs, oil price spikes, trade disruption)
  // ═══════════════════════════════════════════════

  { date: '2023-10-07', category: 'economic', label: 'Initial oil market risk premium (~$5/bbl)', amountBillions: 15 },
  { date: '2023-11-19', category: 'economic', label: 'Red Sea shipping reroutes via Cape of Good Hope', amountBillions: 40, source: 'UNCTAD' },
  { date: '2024-01-12', category: 'economic', label: 'Shipping insurance surge — Red Sea/Gulf', amountBillions: 20 },
  { date: '2024-06-01', category: 'economic', label: 'Continued Red Sea rerouting costs H1 2024', amountBillions: 40, source: 'Lloyd\'s List' },
  { date: '2025-01-01', category: 'economic', label: 'Global inflation premium from energy uncertainty', amountBillions: 60 },
  { date: '2026-03-01', category: 'economic', label: 'Oil spike $75→$100/bbl — added consumer costs', amountBillions: 150, source: '~$25/bbl × 100M bbl/day × 60 days' },
  { date: '2026-03-09', category: 'economic', label: 'Hormuz closure — oil above $130/bbl', amountBillions: 250, source: '~$55/bbl increase × 100M bbl/day × ~45 days' },
  { date: '2026-03-14', category: 'economic', label: 'Gulf shipping insurance 10x premium', amountBillions: 35 },
  { date: '2026-03-18', category: 'economic', label: 'LNG price crisis — Europe/Asia energy costs 3-5x', amountBillions: 120, source: 'IEA emergency report' },
  { date: '2026-03-09', category: 'economic', label: 'Global supply chain disruptions & port delays', amountBillions: 60 },
  { date: '2026-03-21', category: 'economic', label: 'Oil sustained above $100/bbl — week 4 consumer costs', amountBillions: 80, source: '~$40 premium × 100M bbl/day × ~20 days' },
  { date: '2026-03-21', category: 'economic', label: 'Iran sanctions waiver — 140M bbls at inflated prices', amountBillions: 8, source: '140M × ~$55 premium' },
  { date: '2026-03-21', category: 'economic', label: 'Global tourism industry losses from Iran threats', amountBillions: 15 },
];

export interface WarCostSummary {
  totalBillions: number;
  weaponsBillions: number;
  resourcesBillions: number;
  economicBillions: number;
}

export function getWarCostUpTo(date: string): WarCostSummary {
  let weapons = 0;
  let resources = 0;
  let economic = 0;

  for (const entry of warCosts) {
    if (entry.date > date) continue;
    switch (entry.category) {
      case 'weapons': weapons += entry.amountBillions; break;
      case 'resources': resources += entry.amountBillions; break;
      case 'economic': economic += entry.amountBillions; break;
    }
  }

  return {
    totalBillions: weapons + resources + economic,
    weaponsBillions: weapons,
    resourcesBillions: resources,
    economicBillions: economic,
  };
}
