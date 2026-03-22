// ═══ COST OF WAR — Progressive Economic Data ═══
// Syncs to the timeline scrubber just like casualties.
// Categories: weapons (taxpayer military spending), resources (infrastructure destroyed),
// economic (inflation, oil price impact, shipping disruption).
//
// SOURCING POLICY: Every entry must have a source field.
// Entries marked [OBT estimate] are derived from cited methodology, not direct quotes.

export interface WarCostEntry {
  date: string;
  category: 'weapons' | 'resources' | 'economic';
  label: string;
  amountBillions: number;
  source: string;
  sourceUrl?: string;
}

export const warCosts: WarCostEntry[] = [
  // ═══════════════════════════════════════════════
  // WEAPONS & MILITARY SPENDING
  // ═══════════════════════════════════════════════

  { date: '2023-10-07', category: 'weapons', label: 'IDF mobilization & initial Gaza operations', amountBillions: 8, source: 'Bank of Israel / Arab Center DC', sourceUrl: 'https://arabcenterdc.org/resource/the-estimated-cost-of-the-gaza-war-on-the-israeli-economy/' },
  { date: '2023-10-20', category: 'weapons', label: 'US emergency military aid to Israel', amountBillions: 14.3, source: 'White House supplemental request', sourceUrl: 'https://www.whitehouse.gov/briefing-room/statements-releases/2023/10/20/fact-sheet-president-biden-sends-amended-supplemental-request-to-address-critical-national-security-needs/' },
  { date: '2023-11-01', category: 'weapons', label: 'Iron Dome & David\'s Sling replenishment', amountBillions: 5.2, source: 'CRS RL33222', sourceUrl: 'https://www.congress.gov/crs-product/RL33222' },
  { date: '2024-01-01', category: 'weapons', label: 'IDF Gaza campaign Q1 2024 (~$400M/day)', amountBillions: 15, source: 'Bank of Israel / Times of Israel', sourceUrl: 'https://www.timesofisrael.com/cabinet-approves-budget-making-cuts-to-offset-massive-wartime-defense-boost/' },
  { date: '2024-01-12', category: 'weapons', label: 'US/UK Operation Prosperity Guardian (Red Sea)', amountBillions: 2.5, source: 'CENTCOM / [OBT estimate from naval deployment costs]' },
  { date: '2024-04-14', category: 'weapons', label: 'Iran April 2024 drone/missile barrage interception', amountBillions: 1.35, source: 'Reuters', sourceUrl: 'https://www.reuters.com/world/middle-east/how-israel-allies-thwarted-irans-attack-2024-04-14/' },
  { date: '2024-04-24', category: 'weapons', label: 'US supplemental military aid package', amountBillions: 17, source: 'PL 118-50 (signed into law)', sourceUrl: 'https://www.congress.gov/bill/118th-congress/house-bill/815' },
  { date: '2024-07-01', category: 'weapons', label: 'IDF Gaza campaign H2 2024', amountBillions: 20, source: 'Brown University Costs of War ($31-34B total US spending)', sourceUrl: 'https://watson.brown.edu/costsofwar/papers/2024/USspendingIsrael' },
  { date: '2024-09-23', category: 'weapons', label: 'IDF Lebanon campaign & precision strikes', amountBillions: 4, source: 'Israel MOD / SIPRI', sourceUrl: 'https://www.macrotrends.net/global-metrics/countries/isr/israel/military-spending-defense-budget' },
  { date: '2025-01-01', category: 'weapons', label: 'Israel 2025 defense budget (NIS 160B)', amountBillions: 18, source: 'Israeli Finance Ministry / Times of Israel', sourceUrl: 'https://www.timesofisrael.com/israel-adds-billions-to-defense-spending-amid-ongoing-wars-growing-challenges/' },
  { date: '2025-06-01', category: 'weapons', label: 'IDF expanded West Bank operations', amountBillions: 3, source: '[OBT estimate from IDF operational tempo]' },
  { date: '2026-03-01', category: 'weapons', label: 'US 3 carrier groups + Tomahawk strikes on Iran', amountBillions: 8, source: '[OBT estimate: ~$500M/day carrier ops, Pentagon/NPR]', sourceUrl: 'https://www.npr.org/2026/03/05/iran-military-costs-carrier-groups' },
  { date: '2026-03-06', category: 'weapons', label: 'Israel F-35I deep strikes + bunker busters on Iran', amountBillions: 4, source: '[OBT estimate from munition/sortie costs]' },
  { date: '2026-03-09', category: 'weapons', label: 'US expanded air campaign — B-2 sorties, 500+ strikes', amountBillions: 12, source: '[OBT estimate: $1B/day per Pentagon briefing]', sourceUrl: 'https://www.npr.org/2026/03/12/us-iran-war-costs-billion-per-day' },
  { date: '2026-03-14', category: 'weapons', label: 'Iran ballistic missile campaign on Gulf states', amountBillions: 5, source: 'IISS / [OBT estimate from missile inventories]' },
  { date: '2026-03-20', category: 'weapons', label: 'Ongoing US operations ~$1B/day (days 15-21)', amountBillions: 7, source: 'Pentagon estimate / NPR', sourceUrl: 'https://www.npr.org/2026/03/20/us-iran-war-week-three-costs' },
  { date: '2026-03-20', category: 'weapons', label: '11th MEU deployment + 2 additional carrier groups', amountBillions: 3, source: '[OBT estimate from naval deployment costs]' },
  { date: '2026-03-21', category: 'weapons', label: 'Natanz nuclear facility strike (bunker busters + F-35I)', amountBillions: 2, source: '[OBT estimate from munition costs]' },
  { date: '2026-03-21', category: 'weapons', label: 'Iran 70th wave — missiles at 5 US bases + Israel', amountBillions: 3, source: 'IRGC / CGTN reporting' },
  { date: '2026-03-21', category: 'weapons', label: 'Day 22 ongoing operations ~$1B/day', amountBillions: 1, source: 'Pentagon' },

  // ═══════════════════════════════════════════════
  // RESOURCES & INFRASTRUCTURE DESTROYED
  // ═══════════════════════════════════════════════

  { date: '2023-10-07', category: 'resources', label: 'Gaza infrastructure — first month', amountBillions: 5, source: 'World Bank / UN joint assessment (Apr 2024: $18.5B total)', sourceUrl: 'https://www.worldbank.org/en/news/press-release/2024/04/02/joint-world-bank-un-report-assesses-damage-to-gaza-s-infrastructure' },
  { date: '2023-11-01', category: 'resources', label: 'Gaza infrastructure — ongoing destruction', amountBillions: 10, source: 'World Bank interim assessment', sourceUrl: 'https://www.worldbank.org/en/news/press-release/2024/04/02/joint-world-bank-un-report-assesses-damage-to-gaza-s-infrastructure' },
  { date: '2024-05-01', category: 'resources', label: 'Gaza infrastructure — cumulative ($33B)', amountBillions: 18, source: 'World Bank 2024 assessment', sourceUrl: 'https://www.worldbank.org/en/news/press-release/2024/04/02/joint-world-bank-un-report-assesses-damage-to-gaza-s-infrastructure' },
  { date: '2024-09-23', category: 'resources', label: 'Lebanon infrastructure damage', amountBillions: 8.5, source: 'World Bank Lebanon RDNA', sourceUrl: 'https://www.worldbank.org/en/country/lebanon/publication/lebanon-rapid-damage-and-needs-assessment' },
  { date: '2025-02-01', category: 'resources', label: 'Gaza reconstruction needs (updated)', amountBillions: 17, source: 'World Bank Feb 2025 IRDNA ($53B total needs)', sourceUrl: 'https://www.worldbank.org/en/news/press-release/2025/02/18/new-report-assesses-damages-losses-and-needs-in-gaza-and-the-west-bank' },
  { date: '2025-09-01', category: 'resources', label: 'West Bank infrastructure damage', amountBillions: 2, source: 'OCHA / World Bank', sourceUrl: 'https://www.worldbank.org/en/news/press-release/2025/02/18/new-report-assesses-damages-losses-and-needs-in-gaza-and-the-west-bank' },
  { date: '2025-10-01', category: 'resources', label: 'Gaza reconstruction needs (Oct update)', amountBillions: 17, source: 'UN/EU/World Bank Oct 2025 ($70B total)', sourceUrl: 'https://www.un.org/unispal/document/unog-press-briefing-14oct25/' },
  { date: '2026-03-02', category: 'resources', label: 'Saudi Ras Tanura refinery damage (550K BPD)', amountBillions: 2, source: '[OBT estimate from Aramco 2019 attack costs — $2B repair]' },
  { date: '2026-03-06', category: 'resources', label: 'Isfahan & Natanz nuclear facilities destroyed', amountBillions: 20, source: '[OBT estimate — no published reconstruction cost exists per Arms Control Assn]', sourceUrl: 'https://www.armscontrol.org/issue-briefs/2026-03/us-war-iran-new-and-lingering-nuclear-risks' },
  { date: '2026-03-08', category: 'resources', label: 'Iran South Pars gas field destroyed (14% global gas)', amountBillions: 30, source: '[OBT estimate from QatarEnergy/Total investment data]' },
  { date: '2026-03-09', category: 'resources', label: 'Kharg Island oil terminal destroyed (90% Iran exports)', amountBillions: 15, source: '[OBT estimate from Reuters reporting]', sourceUrl: 'https://www.thereporteronline.com/2026/03/19/iran-energy-infrastructure/' },
  { date: '2026-03-14', category: 'resources', label: 'Saudi Ghawar & Abqaiq facilities hit', amountBillions: 8, source: '[OBT estimate — 2019 Abqaiq attack repair was $2B for less damage]' },
  { date: '2026-03-15', category: 'resources', label: 'Bahrain BAPCO refinery hit (only refinery)', amountBillions: 1.5, source: '[OBT estimate from BAPCO capacity data]' },
  { date: '2026-03-18', category: 'resources', label: 'Qatar Ras Laffan LNG destroyed (17% global capacity)', amountBillions: 26, source: '[OBT estimate from QatarEnergy $30B expansion investment]' },
  { date: '2026-03-19', category: 'resources', label: 'Haifa Bazan refinery + Saudi SAMREF Yanbu', amountBillions: 3.5, source: '[OBT estimate from facility replacement costs]' },
  { date: '2026-03-19', category: 'resources', label: 'UAE Habshan gas field shutdown', amountBillions: 2, source: '[OBT estimate from ADNOC investment data]' },
  { date: '2026-03-20', category: 'resources', label: 'Kuwait Mina al-Ahmadi hit again (2nd strike)', amountBillions: 1.5, source: '[OBT estimate from KPC capacity data]' },
  { date: '2026-03-21', category: 'resources', label: 'Natanz enrichment facility damage (centrifuge halls)', amountBillions: 10, source: 'Arms Control Association', sourceUrl: 'https://www.armscontrol.org/issue-briefs/2026-03/us-war-iran-new-and-lingering-nuclear-risks' },
  { date: '2026-03-21', category: 'resources', label: 'Damage across 5 US bases from 70th wave', amountBillions: 1.5, source: '[OBT estimate from Pentagon damage reports]' },

  // ═══════════════════════════════════════════════
  // ECONOMIC IMPACT — INFLATION, OIL, SHIPPING
  // ═══════════════════════════════════════════════

  { date: '2023-10-07', category: 'economic', label: 'Initial oil market risk premium (~$5/bbl)', amountBillions: 15, source: '[OBT model: $5/bbl × 100M bbl/day × 30 days]' },
  { date: '2023-11-19', category: 'economic', label: 'Red Sea shipping reroutes via Cape of Good Hope', amountBillions: 40, source: 'UNCTAD Review of Maritime Transport 2024', sourceUrl: 'https://unctad.org/system/files/official-document/rmt2024overview_en.pdf' },
  { date: '2024-01-12', category: 'economic', label: 'Shipping insurance surge — Red Sea/Gulf', amountBillions: 20, source: 'Lloyd\'s List / war risk premiums 0.05%→1.0%', sourceUrl: 'https://docshipper.com/shipping/red-sea-crisis-update-route-alternatives-cost-impacts/' },
  { date: '2024-06-01', category: 'economic', label: 'Continued Red Sea rerouting costs H1 2024', amountBillions: 40, source: 'UNCTAD / Suez Canal revenue fell 61%', sourceUrl: 'https://africa.dailynewsegypt.com/egypt-loses-7-billion-of-suez-canal-revenue-as-red-sea-tensions-disrupt-traffic/' },
  { date: '2025-01-01', category: 'economic', label: 'Global inflation premium from energy uncertainty', amountBillions: 60, source: '[OBT model from IMF/WTO global trade data]' },
  { date: '2026-03-01', category: 'economic', label: 'Oil spike $75→$100/bbl — added consumer costs', amountBillions: 150, source: '[OBT model: ~$25/bbl × 100M bbl/day × 60 days]' },
  { date: '2026-03-09', category: 'economic', label: 'Hormuz closure — oil above $130/bbl', amountBillions: 250, source: 'Dallas Fed: 2.9pp GDP hit from Hormuz closure', sourceUrl: 'https://www.dallasfed.org/research/economics/2026/0320' },
  { date: '2026-03-14', category: 'economic', label: 'Gulf shipping insurance 10x premium', amountBillions: 35, source: 'PropertyCasualty360 / +$1.5M per LNG voyage', sourceUrl: 'https://www.propertycasualty360.com/fcs/2026/03/18/maritime-war-risk-insurance-in-the-2026-iran-crisis/' },
  { date: '2026-03-18', category: 'economic', label: 'LNG price crisis — Europe/Asia energy costs 3-5x', amountBillions: 120, source: 'IEA emergency report / WEF', sourceUrl: 'https://www.weforum.org/stories/2026/03/the-global-price-tag-of-war-in-the-middle-east/' },
  { date: '2026-03-09', category: 'economic', label: 'Global supply chain disruptions & port delays', amountBillions: 60, source: 'WTO: global goods trade slowing to 1.4%', sourceUrl: 'https://www.weforum.org/stories/2026/03/the-global-price-tag-of-war-in-the-middle-east/' },
  { date: '2026-03-21', category: 'economic', label: 'Oil sustained above $100/bbl — week 4 consumer costs', amountBillions: 80, source: '[OBT model: ~$40 premium × 100M bbl/day × ~20 days]' },
  { date: '2026-03-21', category: 'economic', label: 'Goldman Sachs recession probability raised to 25%', amountBillions: 0, source: 'Goldman Sachs / Axios', sourceUrl: 'https://www.axios.com/2026/03/12/oil-prices-iran-strait-of-hormuz' },
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
