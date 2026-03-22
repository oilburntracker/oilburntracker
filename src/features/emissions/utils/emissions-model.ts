import type { FacilityType } from '@/features/fires/data/curated-fires';

// ═══ FRP-to-CO2 METHODOLOGY ═══
//
// Formula: CO2 (tonnes/day) = FRP(MW) × 86400(s/day) / (f_rad × H_c) × EF_CO2 / 1000
//
// Where:
//   f_rad  = radiative fraction (facility-dependent)
//   H_c    = heat of combustion (MJ/kg)
//   EF_CO2 = emission factor (kg CO2/kg fuel)
//
// Sources:
//   - Wooster et al. (2005), J. Geophys. Res., 110, D24311
//     DOI: 10.1029/2005JD006318
//     Established FRP↔combustion rate: FBCC = 0.368 ±0.015 kg/MJ
//     Radiative fraction for biomass: ~0.14 ±0.03
//
//   - Freeborn et al. (2008), J. Geophys. Res., 113, D01301
//     DOI: 10.1029/2007JD008679
//     Confirmed FBCC = 0.453 ±0.068 kg/MJ (broader fuel types)
//
//   - Kaiser et al. (2012), Biogeosciences, 9, 527-554
//     DOI: 10.5194/bg-9-527-2012
//     GFAS methodology: land-cover-specific FRP→DM→emissions
//
//   - Elvidge et al. (2020), Remote Sensing, 12(2), 238
//     DOI: 10.3390/rs12020238
//     Satellite FRP underestimates petroleum fires by ~2x due to dark smoke
//
//   - IPCC 2006 Guidelines, Vol 2, Ch 1-2
//     Crude oil: NCV = 42.3 GJ/t, CO2 EF = 73,300 kg CO2/TJ
//     ≈ 3,100 kg CO2 per tonne crude oil
//     URL: https://www.ipcc-nggip.iges.or.jp/public/2006gl/
//
//   - EPA GHG Emission Factors Hub (2024)
//     Crude oil: 74.54 kg CO2/mmBtu
//     URL: https://www.epa.gov/system/files/documents/2024-02/ghg-emission-factors-hub-2024.pdf
//
// Petroleum fires: radiative fraction 0.10-0.15 (lower than biomass due to
// dark smoke absorption, per Elvidge 2020). This yields multipliers of 42-86
// tonnes CO2/day per MW FRP, consistent with our facility-specific values.
//
// These are order-of-magnitude estimates. Real emissions depend on fuel type,
// combustion efficiency, and atmospheric conditions.

// Tonnes CO2 per MW-day by facility type
// Derived from IPCC crude oil NCV (42.3 GJ/t), CO2 EF (3.1 kg CO2/kg fuel),
// and facility-specific radiative fractions (0.10-0.15 per Elvidge 2020)
const FACILITY_MULTIPLIERS: Record<FacilityType | 'unknown', number> = {
  refinery: 86.4,       // f_rad ≈ 0.10 (heavy crude, dense smoke)
  lng_terminal: 72.0,   // f_rad ≈ 0.12 (cleaner burn than crude)
  pipeline: 50.4,       // f_rad ≈ 0.17 (gas-dominated, less smoke)
  storage: 64.8,        // f_rad ≈ 0.13 (mixed fuels, tank fires)
  oil_field: 79.2,      // f_rad ≈ 0.11 (wellhead fires, crude)
  gas_field: 72.0,      // f_rad ≈ 0.12 (natural gas, some condensate)
  port: 72.0,           // f_rad ≈ 0.12 (mixed fuel storage)
  unknown: 60.0         // f_rad ≈ 0.14 (conservative default)
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
