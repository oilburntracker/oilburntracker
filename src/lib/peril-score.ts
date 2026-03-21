import type { NuclearStatus } from '@/features/timeline/data/conflict-events';

export interface PerilResult {
  score: number;         // 0-100 composite
  nuclearScore: number;
  supplyScore: number;
  escalationScore: number;
  level: PerilLevel;
  label: string;
  color: string;
}

export type PerilLevel = 'elevated' | 'high' | 'severe' | 'critical' | 'extreme';

const LEVELS: { max: number; level: PerilLevel; label: string; color: string }[] = [
  { max: 20, level: 'elevated', label: 'Elevated', color: '#eab308' },
  { max: 40, level: 'high', label: 'High', color: '#f97316' },
  { max: 60, level: 'severe', label: 'Severe', color: '#ea580c' },
  { max: 80, level: 'critical', label: 'Critical', color: '#ef4444' },
  { max: 101, level: 'extreme', label: 'Extreme', color: '#dc2626' },
];

// Historical anchors for comparison
export const HISTORICAL_ANCHORS = [
  { label: 'Fukushima', score: 55, year: 2011 },
  { label: 'Chernobyl', score: 75, year: 1986 },
  { label: 'Cuban Missile Crisis', score: 92, year: 1962 },
];

function computeNuclearScore(nuclear: NuclearStatus | null): number {
  if (!nuclear) return 0;
  const facilitiesScore = (nuclear.facilitiesDestroyed / 6) * 25;
  const enrichmentDestroyed = (100 - nuclear.enrichmentPct) / 100;
  const enrichmentScore = enrichmentDestroyed * 20;
  // "high" = contamination risk from bombed facilities, NOT a meltdown
  // Only "meltdown" would rival Chernobyl (75) or exceed it
  const radiationMap: Record<string, number> = {
    none: 0, low: 5, elevated: 15, high: 25, meltdown: 55,
  };
  const radiationScore = radiationMap[nuclear.radiationRisk] ?? 0;
  return Math.min(100, facilitiesScore + enrichmentScore + radiationScore);
}

function computeSupplyScore(productionPct: number, transitBlockedPct: number): number {
  const combined = productionPct + transitBlockedPct;
  if (combined >= 20) return 80 + Math.min(20, (combined - 20) * 0.67);
  if (combined >= 10) return 60 + ((combined - 10) / 10) * 20;
  if (combined >= 5) return 40 + ((combined - 5) / 5) * 20;
  if (combined >= 2) return 15 + ((combined - 2) / 3) * 25;
  return (combined / 2) * 15;
}

function computeEscalationScore(
  eventsLast7: number,
  severeEventsLast30: number,
  totalEvents: number
): number {
  const tempoScore = Math.min(40, (eventsLast7 / 50) * 40);
  const severityScore = Math.min(35, (severeEventsLast30 / 30) * 35);
  const scaleScore = Math.min(25, (totalEvents / 100) * 25);
  return Math.min(100, tempoScore + severityScore + scaleScore);
}

export function computePerilScore(
  nuclear: NuclearStatus | null,
  productionPct: number,
  transitBlockedPct: number,
  eventsLast7: number,
  severeEventsLast30: number,
  totalEvents: number
): PerilResult {
  const nuclearScore = computeNuclearScore(nuclear);
  const supplyScore = computeSupplyScore(productionPct, transitBlockedPct);
  const escalationScore = computeEscalationScore(eventsLast7, severeEventsLast30, totalEvents);

  const score = Math.round(
    nuclearScore * 0.4 + supplyScore * 0.35 + escalationScore * 0.25
  );

  const lvl = LEVELS.find((l) => score < l.max) || LEVELS[LEVELS.length - 1];

  return {
    score,
    nuclearScore: Math.round(nuclearScore),
    supplyScore: Math.round(supplyScore),
    escalationScore: Math.round(escalationScore),
    level: lvl.level,
    label: lvl.label,
    color: lvl.color,
  };
}
