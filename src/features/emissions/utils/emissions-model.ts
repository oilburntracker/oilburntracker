import type { FacilityType } from '@/features/fires/data/curated-fires';

// Tons CO2 per MW-day by facility type
const FACILITY_MULTIPLIERS: Record<FacilityType | 'unknown', number> = {
  refinery: 86.4,
  lng_terminal: 72.0,
  pipeline: 50.4,
  storage: 64.8,
  oil_field: 79.2,
  gas_field: 72.0,
  port: 72.0,
  unknown: 60.0
};

/**
 * Estimate CO2 emissions in tons/day from FRP (in MW) and facility type
 */
export function estimateCO2(frpMW: number, facilityType?: FacilityType | null): number {
  const type = facilityType || 'unknown';
  const multiplier = FACILITY_MULTIPLIERS[type] || FACILITY_MULTIPLIERS.unknown;
  return frpMW * multiplier;
}

/**
 * Convert tons/day to human-relatable equivalents
 */
export function co2Equivalents(tonsPerDay: number) {
  return {
    carsPerYear: Math.round((tonsPerDay * 365) / 4.6), // avg car = 4.6 tons/year
    homesPerYear: Math.round((tonsPerDay * 365) / 7.5), // avg home = 7.5 tons/year
    percentGlobalDaily: ((tonsPerDay / 100000000) * 100).toFixed(4) // ~100M tons CO2/day globally
  };
}

/**
 * Format CO2 tons for display
 */
export function formatCO2(tons: number): string {
  if (tons >= 1000000) return `${(tons / 1000000).toFixed(1)}M`;
  if (tons >= 1000) return `${(tons / 1000).toFixed(1)}K`;
  return `${Math.round(tons)}`;
}
