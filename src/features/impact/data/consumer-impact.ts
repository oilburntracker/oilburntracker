// ═══ CONSUMER IMPACT — Progressive Cost-of-Living Data ═══
// Translates geopolitical disruption into household-level impact.
// Syncs to the timeline scrubber just like casualties & war costs.
//
// SOURCING:
//   Oil prices: EIA Short-Term Energy Outlook, IEA Oil Market Reports
//   Gas prices: AAA Gas Prices (gasprices.aaa.com), EIA weekly retail
//   Grocery inflation: BLS CPI Food Index, USDA Food Price Outlook
//   Natural gas: EIA Henry Hub spot price
//   Shipping: Drewry World Container Index, UNCTAD
//   Household totals: [OBT model] derived from above sources
//
// Baseline: US avg pre-crisis (Sep 2023)
//   Oil $75/bbl — EIA STEO Sep 2023
//   Gas $3.20/gal — AAA national avg Sep 2023
//   NatGas $2.80/MMBtu — EIA Henry Hub Sep 2023
//   Groceries $1,000/mo — BLS CPI avg family of 4
//   Utilities ~$120/mo — EIA RECS 2022

export interface ConsumerImpact {
  date: string;
  oilPriceBbl: number;           // Brent $/barrel
  gasPriceGallon: number;        // US avg $/gallon
  groceryInflationPct: number;   // % increase from baseline
  monthlyGroceryExtra: number;   // $ extra/month (family of 4)
  natGasMMBtu: number;           // $/MMBtu
  monthlyUtilityExtra: number;   // $ extra/month
  shippingSurchargePct: number;  // % surcharge on containers
  deliveryDelayDays: number;     // extra days on avg package
  totalMonthlyExtra: number;     // aggregate $/month per household
  headline: string;              // one-liner for this date
  source?: string;               // primary data source for this snapshot
}

// Pre-war baseline constants
export const BASELINE = {
  oilPriceBbl: 75,               // EIA STEO Sep 2023
  gasPriceGallon: 3.20,          // AAA national avg Sep 2023
  natGasMMBtu: 2.80,             // EIA Henry Hub Sep 2023
  monthlyGasGallons: 40,         // EIA avg household
  monthlyGroceryBaseline: 1000,  // BLS CPI avg family of 4
  monthlyUtilityBaseline: 120,   // EIA RECS 2022
} as const;

export const consumerImpactData: ConsumerImpact[] = [
  {
    date: '2023-10-07',
    oilPriceBbl: 85,
    gasPriceGallon: 3.45,
    groceryInflationPct: 1,
    monthlyGroceryExtra: 10,
    natGasMMBtu: 3.1,
    monthlyUtilityExtra: 5,
    shippingSurchargePct: 5,
    deliveryDelayDays: 0,
    totalMonthlyExtra: 25,
    headline: 'War risk premium adds ~$10/bbl to oil. Barely noticeable at the pump.',
    source: 'EIA STEO Oct 2023, AAA Gas Prices',
  },
  {
    date: '2023-11-19',
    oilPriceBbl: 82,
    gasPriceGallon: 3.38,
    groceryInflationPct: 1.5,
    monthlyGroceryExtra: 15,
    natGasMMBtu: 3.0,
    monthlyUtilityExtra: 3,
    shippingSurchargePct: 15,
    deliveryDelayDays: 3,
    totalMonthlyExtra: 30,
    headline: 'Houthis attack Red Sea shipping. Container rates begin climbing.',
    source: 'EIA, Drewry World Container Index',
  },
  {
    date: '2024-01-12',
    oilPriceBbl: 78,
    gasPriceGallon: 3.28,
    groceryInflationPct: 2,
    monthlyGroceryExtra: 20,
    natGasMMBtu: 3.3,
    monthlyUtilityExtra: 8,
    shippingSurchargePct: 25,
    deliveryDelayDays: 5,
    totalMonthlyExtra: 40,
    headline: 'Prosperity Guardian launches. Ships reroute via Cape — +10-14 days.',
    source: 'UNCTAD: container rates +256% Shanghai→Europe',
  },
  {
    date: '2024-04-14',
    oilPriceBbl: 90,
    gasPriceGallon: 3.55,
    groceryInflationPct: 2.5,
    monthlyGroceryExtra: 25,
    natGasMMBtu: 3.2,
    monthlyUtilityExtra: 6,
    shippingSurchargePct: 30,
    deliveryDelayDays: 5,
    totalMonthlyExtra: 50,
    headline: 'Iran\'s 300+ drone/missile barrage spikes oil to $90. Markets jittery.',
    source: 'EIA STEO Apr 2024, AAA',
  },
  {
    date: '2024-06-01',
    oilPriceBbl: 83,
    gasPriceGallon: 3.40,
    groceryInflationPct: 3,
    monthlyGroceryExtra: 30,
    natGasMMBtu: 2.9,
    monthlyUtilityExtra: 2,
    shippingSurchargePct: 20,
    deliveryDelayDays: 4,
    totalMonthlyExtra: 45,
    headline: 'Markets stabilize somewhat. Grocery inflation creeps up from shipping costs.',
    source: 'BLS CPI Food Jun 2024, EIA',
  },
  {
    date: '2024-09-23',
    oilPriceBbl: 78,
    gasPriceGallon: 3.28,
    groceryInflationPct: 3.5,
    monthlyGroceryExtra: 35,
    natGasMMBtu: 3.5,
    monthlyUtilityExtra: 12,
    shippingSurchargePct: 18,
    deliveryDelayDays: 3,
    totalMonthlyExtra: 55,
    headline: 'Lebanon campaign starts. Oil dips but food costs sticky from supply chains.',
    source: 'EIA STEO Sep 2024, BLS CPI Food',
  },
  {
    date: '2025-01-01',
    oilPriceBbl: 76,
    gasPriceGallon: 3.22,
    groceryInflationPct: 4,
    monthlyGroceryExtra: 40,
    natGasMMBtu: 3.8,
    monthlyUtilityExtra: 15,
    shippingSurchargePct: 12,
    deliveryDelayDays: 2,
    totalMonthlyExtra: 60,
    headline: 'Oil calm but groceries never came back down. Fertilizer costs passed to consumers.',
    source: 'EIA STEO Jan 2025, USDA Food Price Outlook',
  },
  {
    date: '2025-06-01',
    oilPriceBbl: 80,
    gasPriceGallon: 3.32,
    groceryInflationPct: 4.5,
    monthlyGroceryExtra: 45,
    natGasMMBtu: 3.5,
    monthlyUtilityExtra: 12,
    shippingSurchargePct: 15,
    deliveryDelayDays: 3,
    totalMonthlyExtra: 65,
    headline: 'West Bank operations add uncertainty. Diesel costs lift trucking prices.',
    source: 'EIA, BLS CPI',
  },
  {
    date: '2025-09-01',
    oilPriceBbl: 82,
    gasPriceGallon: 3.38,
    groceryInflationPct: 4,
    monthlyGroceryExtra: 40,
    natGasMMBtu: 3.3,
    monthlyUtilityExtra: 8,
    shippingSurchargePct: 12,
    deliveryDelayDays: 2,
    totalMonthlyExtra: 55,
    headline: 'Relative calm. But baseline costs never returned to pre-2023 levels.',
    source: 'EIA STEO Sep 2025, AAA',
  },
  {
    date: '2026-03-01',
    oilPriceBbl: 78,
    gasPriceGallon: 2.94,
    groceryInflationPct: 3,
    monthlyGroceryExtra: 30,
    natGasMMBtu: 4.2,
    monthlyUtilityExtra: 22,
    shippingSurchargePct: 25,
    deliveryDelayDays: 5,
    totalMonthlyExtra: 60,
    headline: 'US strikes Iran. Oil spikes briefly then settles. Gas still near pre-war levels — the lag hasn\'t hit yet.',
    source: 'AAA: $2.94/gal national avg Feb 23. EIA: Brent ~$78/bbl.',
  },
  {
    date: '2026-03-06',
    oilPriceBbl: 85,
    gasPriceGallon: 3.15,
    groceryInflationPct: 3,
    monthlyGroceryExtra: 30,
    natGasMMBtu: 4.5,
    monthlyUtilityExtra: 28,
    shippingSurchargePct: 30,
    deliveryDelayDays: 6,
    totalMonthlyExtra: 75,
    headline: 'Iran nuclear sites hit. Oil climbing but SPR release + Saudi spare capacity absorbing shock.',
    source: 'EIA, AAA Gas Prices',
  },
  {
    date: '2026-03-09',
    oilPriceBbl: 90,
    gasPriceGallon: 3.35,
    groceryInflationPct: 3.5,
    monthlyGroceryExtra: 35,
    natGasMMBtu: 5.0,
    monthlyUtilityExtra: 35,
    shippingSurchargePct: 40,
    deliveryDelayDays: 7,
    totalMonthlyExtra: 95,
    headline: 'Hormuz disruption escalates. Iran threatens closure. Insurance rates rising. Gas up 40¢ in a week.',
    source: 'AAA, CNBC, IEA',
  },
  {
    date: '2026-03-12',
    oilPriceBbl: 95,
    gasPriceGallon: 3.58,
    groceryInflationPct: 3.5,
    monthlyGroceryExtra: 35,
    natGasMMBtu: 5.5,
    monthlyUtilityExtra: 45,
    shippingSurchargePct: 50,
    deliveryDelayDays: 8,
    totalMonthlyExtra: 115,
    headline: 'Gas jumps 35¢ in a week — fastest rise since 2022. Oil pushing toward $100.',
    source: 'AAA: $3.58 national avg Mar 11. EIA weekly retail.',
  },
  {
    date: '2026-03-16',
    oilPriceBbl: 105,
    gasPriceGallon: 3.72,
    groceryInflationPct: 4,
    monthlyGroceryExtra: 40,
    natGasMMBtu: 6.5,
    monthlyUtilityExtra: 60,
    shippingSurchargePct: 60,
    deliveryDelayDays: 10,
    totalMonthlyExtra: 140,
    headline: 'UAE facilities struck. Oil breaks $100 for first time since 2022. Gulf shipping insurance rates 5x normal.',
    source: 'AAA: $3.72 week of Mar 16. Fortune: Brent $105.',
  },
  {
    date: '2026-03-18',
    oilPriceBbl: 112,
    gasPriceGallon: 3.85,
    groceryInflationPct: 4,
    monthlyGroceryExtra: 40,
    natGasMMBtu: 7.5,
    monthlyUtilityExtra: 75,
    shippingSurchargePct: 70,
    deliveryDelayDays: 12,
    totalMonthlyExtra: 165,
    headline: 'Ras Laffan + South Pars hit same day. LNG markets in crisis. EU gas futures spike 40%.',
    source: 'Fortune: Brent peaked $112. AAA.',
  },
  {
    date: '2026-03-20',
    oilPriceBbl: 108,
    gasPriceGallon: 3.94,
    groceryInflationPct: 4.5,
    monthlyGroceryExtra: 45,
    natGasMMBtu: 7.0,
    monthlyUtilityExtra: 68,
    shippingSurchargePct: 65,
    deliveryDelayDays: 11,
    totalMonthlyExtra: 155,
    headline: 'Oil pulls back from $112 peak on SPR talk. But gas at the pump still climbing — $3.94 national avg.',
    source: 'AAA: $3.94 Mar 22. Fortune: Brent $108.',
  },
  {
    date: '2026-03-23',
    oilPriceBbl: 101,
    gasPriceGallon: 3.96,
    groceryInflationPct: 5,
    monthlyGroceryExtra: 50,
    natGasMMBtu: 6.8,
    monthlyUtilityExtra: 65,
    shippingSurchargePct: 65,
    deliveryDelayDays: 12,
    totalMonthlyExtra: 150,
    headline: 'Oil drops 13% to $101 — but gas hasn\'t followed yet. Grocery inflation building as trucking costs rise.',
    source: 'AAA: $3.96 Mar 23. Fortune: Brent $101.44. BLS CPI food +3.1% YoY Feb.',
  },
];

/**
 * Returns the latest consumer impact entry on or before the given date.
 * Falls back to the first entry if the date is before all entries.
 */
export function getConsumerImpactUpTo(date: string): ConsumerImpact {
  let latest = consumerImpactData[0];
  for (const entry of consumerImpactData) {
    if (entry.date <= date) {
      latest = entry;
    }
  }
  return latest;
}
