import type { FacilityType } from '@/features/fires/data/curated-fires';

// ═══ FRP-to-CO2 METHODOLOGY ═══
//
// Formula: CO2 (t/day) = FRP(MW) × 86400(s/day) / (f_rad × H_c(MJ/kg)) × EF(kg CO2/kg) / 1000
//
// Where:
//   FRP    = Fire Radiative Power measured by satellite (MW = MJ/s)
//   f_rad  = apparent radiative fraction (fraction of total combustion heat
//            that the satellite observes as thermal radiation)
//   H_c    = net calorific value / heat of combustion (MJ/kg)
//   EF     = CO2 emission factor (kg CO2 per kg fuel burned)
//
// ═══ FUEL PARAMETERS (IPCC 2006 Guidelines, Vol 2, Ch 1-2) ═══
//
//   Crude oil:   H_c = 42.3 MJ/kg (NCV), EF = 3.10 kg CO2/kg
//                (73,300 kg CO2/TJ × 42.3 GJ/t ÷ 1000 = 3.101)
//
//   Natural gas: H_c = 48.0 MJ/kg (NCV), EF = 2.69 kg CO2/kg
//                (56,100 kg CO2/TJ × 48.0 GJ/t ÷ 1000 = 2.693)
//
//   URL: https://www.ipcc-nggip.iges.or.jp/public/2006gl/
//
// ═══ RADIATIVE FRACTIONS ═══
//
//   Biomass fires: f_rad ≈ 0.14 ±0.03 (Wooster et al. 2005)
//
//   Petroleum fires: f_rad ≈ 0.07-0.12 — significantly lower than biomass
//   because dark hydrocarbon smoke absorbs outgoing thermal radiation.
//   Elvidge et al. (2020) found satellite FRP underestimates petroleum fire
//   emissions by ~2× compared to biomass-calibrated models.
//
// ═══ SOURCES ═══
//
//   - Wooster et al. (2005), J. Geophys. Res., 110, D24311
//     DOI: 10.1029/2005JD006318
//     FBCC = 0.368 ±0.015 kg/MJ; f_rad(biomass) ≈ 0.14
//
//   - Freeborn et al. (2008), J. Geophys. Res., 113, D01301
//     DOI: 10.1029/2007JD008679
//     FBCC = 0.453 ±0.068 kg/MJ (broader fuel types)
//
//   - Kaiser et al. (2012), Biogeosciences, 9, 527-554
//     DOI: 10.5194/bg-9-527-2012
//     GFAS: land-cover-specific FRP→dry-matter→emissions
//
//   - Elvidge et al. (2020), Remote Sensing, 12(2), 238
//     DOI: 10.3390/rs12020238
//     Satellite FRP underestimates petroleum fires ~2× due to dark smoke
//
//   - EPA GHG Emission Factors Hub (2024)
//     Crude oil: 74.54 kg CO2/mmBtu
//     URL: https://www.epa.gov/system/files/documents/2024-02/ghg-emission-factors-hub-2024.pdf
//
// ═══ MULTIPLIER DERIVATION ═══
//
// Each multiplier below = 86400 / (f_rad × H_c) × EF / 1000
// Verify: refinery = 86400 / (0.08 × 42.3) × 3.10 / 1000 = 79.2 t/MW/day
//
// We use the LOWER end of f_rad ranges (more smoke → more hidden heat),
// giving HIGHER estimates. This is intentionally conservative — it is better
// to overestimate pollution from burning oil infrastructure than to undercount.
//
// These are order-of-magnitude estimates. Real emissions depend on fuel
// composition, combustion efficiency, wind, and atmospheric conditions.

// IPCC fuel parameters
const CRUDE_H_C = 42.3;  // MJ/kg (net calorific value)
const CRUDE_EF = 3.10;   // kg CO2/kg fuel
const GAS_H_C = 48.0;    // MJ/kg
const GAS_EF = 2.69;     // kg CO2/kg fuel

// Compute multiplier: t CO2/day per MW FRP
function mult(fRad: number, hc: number, ef: number): number {
  return Math.round((86400 / (fRad * hc) * ef / 1000) * 10) / 10;
}

// Tonnes CO2 per MW-day by facility type
const FACILITY_MULTIPLIERS: Record<FacilityType | 'unknown', number> = {
  refinery:      mult(0.08,  CRUDE_H_C, CRUDE_EF),  // 79.2 — heavy crude, dense dark smoke
  oil_field:     mult(0.09,  CRUDE_H_C, CRUDE_EF),  // 70.4 — wellhead crude fires
  storage:       mult(0.10,  CRUDE_H_C, CRUDE_EF),  // 63.3 — mixed fuels, tank fires
  port:          mult(0.10,  CRUDE_H_C, CRUDE_EF),  // 63.3 — mixed crude/product storage
  gas_field:     mult(0.12,  GAS_H_C,   GAS_EF),    // 40.4 — natural gas, some condensate
  lng_terminal:  mult(0.12,  GAS_H_C,   GAS_EF),    // 40.4 — LNG/natural gas
  pipeline:      mult(0.15,  GAS_H_C,   GAS_EF),    // 32.3 — gas-dominated, cleaner burn
  unknown:       mult(0.12,  CRUDE_H_C, CRUDE_EF),  // 52.7 — conservative middle estimate
};

/**
 * Estimate CO2 emissions in tonnes/day from FRP (in MW) and facility type.
 * Uses IPCC emission factors and satellite-calibrated radiative fractions.
 * See methodology sources above.
 */
export function estimateCO2(frpMW: number, facilityType?: FacilityType | null): number {
  const type = facilityType || 'unknown';
  const multiplier = FACILITY_MULTIPLIERS[type] || FACILITY_MULTIPLIERS.unknown;
  return frpMW * multiplier;
}

/**
 * Convert tonnes/day to human-relatable equivalents.
 * Sources:
 *   - 4.6 tonnes CO2/car/year: EPA (epa.gov/greenvehicles)
 *   - 7.5 tonnes CO2/home/year: EIA Residential Energy Consumption Survey
 *   - ~100M tonnes CO2/day globally: IEA (36.8 Gt/year ÷ 365 = ~101M t/day)
 */
export function co2Equivalents(tonsPerDay: number) {
  return {
    carsPerYear: Math.round((tonsPerDay * 365) / 4.6),
    homesPerYear: Math.round((tonsPerDay * 365) / 7.5),
    percentGlobalDaily: ((tonsPerDay / 100000000) * 100).toFixed(4)
  };
}

/**
 * Format CO2 tonnes for display
 */
export function formatCO2(tons: number): string {
  if (tons >= 1000000) return `${(tons / 1000000).toFixed(1)}M`;
  if (tons >= 1000) return `${(tons / 1000).toFixed(1)}K`;
  return `${Math.round(tons)}`;
}
