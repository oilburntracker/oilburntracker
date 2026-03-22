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
    oilPriceBbl: 100,
    gasPriceGallon: 4.10,
    groceryInflationPct: 6,
    monthlyGroceryExtra: 60,
    natGasMMBtu: 5.5,
    monthlyUtilityExtra: 45,
    shippingSurchargePct: 40,
    deliveryDelayDays: 7,
    totalMonthlyExtra: 145,
    headline: 'US strikes Iran. Oil jumps to $100. Panic buying starts at gas stations.',
    source: 'IEA Oil Market Report Mar 2026, AAA',
  },
  {
    date: '2026-03-06',
    oilPriceBbl: 115,
    gasPriceGallon: 4.50,
    groceryInflationPct: 8,
    monthlyGroceryExtra: 80,
    natGasMMBtu: 7.0,
    monthlyUtilityExtra: 70,
    shippingSurchargePct: 55,
    deliveryDelayDays: 10,
    totalMonthlyExtra: 210,
    headline: 'Deep strikes on Iran nuclear sites. Oil at $115. Some stations limit purchases.',
    source: 'IEA, J.P. Morgan commodities',
  },
  {
    date: '2026-03-08',
    oilPriceBbl: 125,
    gasPriceGallon: 4.85,
    groceryInflationPct: 10,
    monthlyGroceryExtra: 100,
    natGasMMBtu: 9.5,
    monthlyUtilityExtra: 110,
    shippingSurchargePct: 65,
    deliveryDelayDays: 12,
    totalMonthlyExtra: 290,
    headline: 'South Pars gas field destroyed — 14% of global gas gone. Europe panics.',
    source: 'IEA emergency report, Chatham House',
  },
  {
    date: '2026-03-09',
    oilPriceBbl: 135,
    gasPriceGallon: 5.10,
    groceryInflationPct: 12,
    monthlyGroceryExtra: 120,
    natGasMMBtu: 11,
    monthlyUtilityExtra: 135,
    shippingSurchargePct: 80,
    deliveryDelayDays: 14,
    totalMonthlyExtra: 370,
    headline: 'Strait of Hormuz blocked. 21% of world oil choked off. $5+ gas is here.',
    source: 'CNBC, Dallas Fed, IEA 400M bbl SPR release',
  },
  {
    date: '2026-03-10',
    oilPriceBbl: 130,
    gasPriceGallon: 4.95,
    groceryInflationPct: 11,
    monthlyGroceryExtra: 110,
    natGasMMBtu: 10,
    monthlyUtilityExtra: 120,
    shippingSurchargePct: 70,
    deliveryDelayDays: 13,
    totalMonthlyExtra: 330,
    headline: 'Shipping insurers refuse Gulf coverage. Amazon warns of 2-3 week delays.',
    source: 'PropertyCasualty360: war risk premiums +$1.5M/voyage',
  },
  {
    date: '2026-03-14',
    oilPriceBbl: 148,
    gasPriceGallon: 5.45,
    groceryInflationPct: 15,
    monthlyGroceryExtra: 150,
    natGasMMBtu: 14,
    monthlyUtilityExtra: 185,
    shippingSurchargePct: 100,
    deliveryDelayDays: 18,
    totalMonthlyExtra: 490,
    headline: 'Saudi Ghawar & Abqaiq hit. Global oil supply catastrophe. Gas lines forming.',
    source: 'IEA, Oxford Economics: $140 = global recession trigger',
  },
  {
    date: '2026-03-15',
    oilPriceBbl: 152,
    gasPriceGallon: 5.55,
    groceryInflationPct: 16,
    monthlyGroceryExtra: 160,
    natGasMMBtu: 15,
    monthlyUtilityExtra: 200,
    shippingSurchargePct: 110,
    deliveryDelayDays: 20,
    totalMonthlyExtra: 530,
    headline: 'Bahrain\'s only refinery destroyed. Island nations face fuel shortages.',
    source: 'IEA, WEF global price tag analysis',
  },
  {
    date: '2026-03-18',
    oilPriceBbl: 158,
    gasPriceGallon: 5.75,
    groceryInflationPct: 18,
    monthlyGroceryExtra: 180,
    natGasMMBtu: 19,
    monthlyUtilityExtra: 265,
    shippingSurchargePct: 120,
    deliveryDelayDays: 22,
    totalMonthlyExtra: 620,
    headline: 'Ras Laffan LNG destroyed — 17% of global LNG gone. Winter heating bills will triple.',
    source: 'IEA, WEF: EU inflation >4%, US >3%',
  },
  {
    date: '2026-03-19',
    oilPriceBbl: 162,
    gasPriceGallon: 5.85,
    groceryInflationPct: 20,
    monthlyGroceryExtra: 200,
    natGasMMBtu: 21,
    monthlyUtilityExtra: 300,
    shippingSurchargePct: 130,
    deliveryDelayDays: 24,
    totalMonthlyExtra: 680,
    headline: 'Haifa, SAMREF, Habshan hit. Multiple fuel types disrupted simultaneously.',
    source: 'IEA, Axios, Chatham House',
  },
  {
    date: '2026-03-20',
    oilPriceBbl: 160,
    gasPriceGallon: 5.80,
    groceryInflationPct: 21,
    monthlyGroceryExtra: 210,
    natGasMMBtu: 20,
    monthlyUtilityExtra: 285,
    shippingSurchargePct: 125,
    deliveryDelayDays: 23,
    totalMonthlyExtra: 665,
    headline: 'Kuwait hit again. SPR release fails to calm markets. Rationing discussed.',
    source: 'Dallas Fed: GDP hit 2.9pp if Hormuz stays closed',
  },
  {
    date: '2026-03-21',
    oilPriceBbl: 165,
    gasPriceGallon: 5.95,
    groceryInflationPct: 22,
    monthlyGroceryExtra: 220,
    natGasMMBtu: 22,
    monthlyUtilityExtra: 315,
    shippingSurchargePct: 140,
    deliveryDelayDays: 26,
    totalMonthlyExtra: 730,
    headline: 'Day 22: [OBT model] Avg US household paying ~$730/mo extra across gas, food, and energy.',
    source: 'OBT model from IEA/EIA/BLS data. Goldman: 25% recession odds.',
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
