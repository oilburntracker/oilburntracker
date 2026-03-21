'use client';

import { useMemo } from 'react';
import { useFireStore } from '@/stores/fire-store';
import { getConsumerImpactUpTo, BASELINE } from '@/features/impact/data/consumer-impact';
import { getCasualtiesUpTo, getNuclearStatusUpTo, getVisibleFacilityIds, getEventsUpTo, getRecentEventStats } from '@/features/timeline/data/conflict-events';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { curatedFires } from '@/features/fires/data/curated-fires';
import { formatCO2, co2Equivalents } from '@/features/emissions/utils/emissions-model';
import { computePerilScore, HISTORICAL_ANCHORS } from '@/lib/peril-score';
import {
  IconGasStation, IconShoppingCart, IconBolt, IconPackage,
  IconRadioactive, IconBomb, IconCloud, IconAlertTriangle,
  IconSkull, IconFlame, IconWorld, IconBuildingSkyscraper,
  IconTrendingUp, IconReceipt, IconShip, IconClock, IconUsers, IconHome
} from '@tabler/icons-react';
import Link from 'next/link';

function formatBillions(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}T`;
  if (n >= 100) return `$${n.toFixed(0)}B`;
  return `$${n.toFixed(1)}B`;
}

const DISRUPTION_COLORS: Record<string, string> = {
  normal: 'text-green-400',
  mild: 'text-yellow-400',
  severe: 'text-orange-400',
  crisis: 'text-red-400',
  catastrophe: 'text-red-500 animate-pulse',
};

const DISRUPTION_BG: Record<string, string> = {
  normal: 'bg-green-500/10 border-green-500/20 text-green-400',
  mild: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  severe: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  crisis: 'bg-red-500/10 border-red-500/20 text-red-400',
  catastrophe: 'bg-red-600/15 border-red-500/30 text-red-500',
};

export default function DeepDivePanel() {
  const fireData = useFireStore((s) => s.fireData);
  const loading = useFireStore((s) => s.loading);
  const timelineDate = useFireStore((s) => s.timelineDate);

  const data = useMemo(() => {
    const impact = getConsumerImpactUpTo(timelineDate);
    const casualties = getCasualtiesUpTo(timelineDate);
    const nuclear = getNuclearStatusUpTo(timelineDate);
    const cost = getWarCostUpTo(timelineDate);
    const facilityIds = getVisibleFacilityIds(timelineDate);
    const supply = getSupplyDisruptionUpTo(facilityIds, timelineDate);
    const events = getEventsUpTo(timelineDate);
    const stats = getRecentEventStats(timelineDate);
    const peril = computePerilScore(
      nuclear,
      supply.productionPct,
      supply.transitBlockedPct,
      stats.eventsLast7,
      stats.severeEventsLast30,
      stats.totalEvents
    );

    const gasExtra = Math.max(0, (impact.gasPriceGallon - BASELINE.gasPriceGallon) * BASELINE.monthlyGasGallons);
    const oilDelta = impact.oilPriceBbl - BASELINE.oilPriceBbl;
    const perTaxpayer = Math.round((cost.totalBillions * 1e9) / 330_000_000);

    // War duration
    const warStart = new Date('2023-10-07');
    const current = new Date(timelineDate);
    const warDays = Math.max(1, Math.round((current.getTime() - warStart.getTime()) / 86400000));

    return { impact, casualties, nuclear, cost, supply, events, stats, peril, gasExtra, oilDelta, perTaxpayer, warDays };
  }, [timelineDate]);

  const { impact, casualties, nuclear, cost, supply, stats, peril, gasExtra, oilDelta, perTaxpayer, warDays } = data;

  const totalCO2 = fireData.features.reduce((s, f) => s + f.properties.estimatedCO2TonsDay, 0);
  const equiv = co2Equivalents(totalCO2);
  const activeFires = fireData.features.length;
  const disruptionColor = DISRUPTION_COLORS[supply.level] || DISRUPTION_COLORS.normal;
  const disruptionBg = DISRUPTION_BG[supply.level] || DISRUPTION_BG.normal;

  return (
    <div className='h-full overflow-y-auto'>

      {/* ── WAR DURATION BANNER ── */}
      <div className='px-3 pt-3 pb-2 border-b border-zinc-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconClock className='h-4 w-4 text-zinc-400' />
            <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Conflict Duration</span>
          </div>
          <span className='text-sm font-black text-zinc-200 tabular-nums'>Day {warDays.toLocaleString()}</span>
        </div>
        <div className='flex items-center gap-3 mt-1 text-[11px]'>
          <span className='text-zinc-400'>{stats.totalEvents} events tracked</span>
          <span className='text-zinc-600'>|</span>
          <span className='text-orange-400 font-bold'>{stats.eventsLast7} this week</span>
          <span className='text-zinc-600'>|</span>
          <span className='text-red-400 font-bold'>{stats.severeEventsLast30} severe (30d)</span>
        </div>
      </div>

      {/* ── HUMAN COST ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconSkull className='h-5 w-5 text-red-500' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Human Cost</span>
        </div>
        <div className='text-2xl font-black text-red-500 tabular-nums leading-tight'>
          {casualties.totalKilled.toLocaleString()}+ <span className='text-sm font-bold'>killed</span>
        </div>
        <div className='space-y-0.5 mt-1'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Injured</span>
            <span className='font-bold text-orange-400 tabular-nums'>{casualties.totalInjured.toLocaleString()}+</span>
          </div>
          {casualties.totalChildren > 0 && (
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Children killed</span>
              <span className='font-bold text-red-300 tabular-nums'>{casualties.totalChildren.toLocaleString()}+</span>
            </div>
          )}
          {casualties.totalDisplaced > 0 && (
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Displaced</span>
              <span className='font-bold text-amber-400 tabular-nums'>{(casualties.totalDisplaced / 1000000).toFixed(1)}M</span>
            </div>
          )}
        </div>
        {/* By region */}
        {Object.keys(casualties.byRegion).length > 0 && (
          <div className='mt-1.5 pt-1.5 border-t border-zinc-800/50 space-y-0.5'>
            <div className='text-[9px] text-zinc-600 uppercase tracking-wider font-bold'>By Region</div>
            {Object.entries(casualties.byRegion)
              .sort((a, b) => b[1].killed - a[1].killed)
              .map(([region, data]) => (
                <div key={region} className='flex items-center justify-between text-[11px]'>
                  <span className='text-zinc-400'>{region}</span>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-red-400 tabular-nums'>{data.killed.toLocaleString()}</span>
                    {data.injured > 0 && (
                      <span className='text-[10px] text-zinc-600 tabular-nums'>({data.injured.toLocaleString()} inj)</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── YOUR MONTHLY COST ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconReceipt className='h-4 w-4 text-orange-400' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Cost to Your Household</span>
        </div>
        <div className='text-2xl font-black text-orange-400 tabular-nums leading-tight'>
          +${impact.totalMonthlyExtra}<span className='text-sm font-bold text-zinc-400'>/mo</span>
        </div>
        <div className='text-[10px] text-zinc-500 mb-1.5'>Extra per month vs pre-war baseline</div>

        {/* Gas */}
        <div className='space-y-1.5'>
          <div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='flex items-center gap-1.5 text-zinc-400'>
                <IconGasStation className='h-3.5 w-3.5 text-orange-400' />
                Gas Price
              </span>
              <span className='font-black text-orange-400 tabular-nums'>${impact.gasPriceGallon.toFixed(2)}/gal</span>
            </div>
            <div className='flex items-center justify-between text-[10px] pl-5'>
              <span className='text-zinc-600'>Pre-war: ${BASELINE.gasPriceGallon.toFixed(2)}/gal</span>
              <span className='text-orange-300 font-bold'>+${gasExtra.toFixed(0)}/mo</span>
            </div>
            <div className='h-1.5 w-full rounded-full bg-zinc-800 mt-0.5 overflow-hidden'>
              <div className='h-full rounded-full bg-orange-400' style={{ width: `${Math.min(100, (impact.gasPriceGallon / 8) * 100)}%` }} />
            </div>
            <div className='text-[9px] text-zinc-600 mt-0.5'>2008 peak: $4.11/gal</div>
          </div>

          {/* Groceries */}
          <div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='flex items-center gap-1.5 text-zinc-400'>
                <IconShoppingCart className='h-3.5 w-3.5 text-amber-400' />
                Groceries
              </span>
              <span className='font-black text-amber-400 tabular-nums'>+{impact.groceryInflationPct}%</span>
            </div>
            <div className='flex items-center justify-between text-[10px] pl-5'>
              <span className='text-zinc-600'>Family of 4 baseline: $1,000/mo</span>
              <span className='text-amber-300 font-bold'>+${impact.monthlyGroceryExtra}/mo</span>
            </div>
            <div className='h-1.5 w-full rounded-full bg-zinc-800 mt-0.5 overflow-hidden'>
              <div className='h-full rounded-full bg-amber-400' style={{ width: `${Math.min(100, impact.groceryInflationPct * 3)}%` }} />
            </div>
          </div>

          {/* Utilities */}
          <div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='flex items-center gap-1.5 text-zinc-400'>
                <IconBolt className='h-3.5 w-3.5 text-yellow-400' />
                Home Energy
              </span>
              <span className='font-black text-yellow-400 tabular-nums'>+${impact.monthlyUtilityExtra}/mo</span>
            </div>
            <div className='flex items-center justify-between text-[10px] pl-5'>
              <span className='text-zinc-600'>Nat Gas: ${impact.natGasMMBtu.toFixed(1)}/MMBtu</span>
              <span className='text-zinc-600'>Pre-war: ${BASELINE.natGasMMBtu.toFixed(1)}</span>
            </div>
            <div className='h-1.5 w-full rounded-full bg-zinc-800 mt-0.5 overflow-hidden'>
              <div className='h-full rounded-full bg-yellow-400' style={{ width: `${Math.min(100, (impact.natGasMMBtu / 25) * 100)}%` }} />
            </div>
            {impact.natGasMMBtu > 12 && (
              <div className='text-[9px] text-red-400 mt-0.5'>Ras Laffan LNG destroyed — 17% global capacity gone</div>
            )}
          </div>

          {/* Shipping */}
          <div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='flex items-center gap-1.5 text-zinc-400'>
                <IconPackage className='h-3.5 w-3.5 text-red-400' />
                Shipping Surcharge
              </span>
              <span className='font-black text-red-400 tabular-nums'>+{impact.shippingSurchargePct}%</span>
            </div>
            <div className='flex items-center justify-between text-[10px] pl-5'>
              <span className='text-zinc-600'>Delivery delays</span>
              <span className='text-red-300 font-bold'>+{impact.deliveryDelayDays} days</span>
            </div>
            <div className='h-1.5 w-full rounded-full bg-zinc-800 mt-0.5 overflow-hidden'>
              <div className='h-full rounded-full bg-red-400' style={{ width: `${Math.min(100, impact.shippingSurchargePct)}%` }} />
            </div>
          </div>
        </div>

        {/* Oil price */}
        <div className='mt-2 pt-1.5 border-t border-zinc-800/50'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Oil (Brent crude)</span>
            <span className='font-black text-white tabular-nums'>${impact.oilPriceBbl}/bbl</span>
          </div>
          <div className='flex items-center justify-between text-[10px]'>
            <span className='text-zinc-600'>Pre-war: ${BASELINE.oilPriceBbl}/bbl</span>
            <span className='text-orange-400 font-bold'>+${oilDelta > 0 ? oilDelta.toFixed(0) : '0'}/bbl</span>
          </div>
          <div className='text-[9px] text-zinc-600 mt-0.5'>Every $10/bbl adds ~$0.25/gal at the pump</div>
        </div>

        <div className='text-[10px] text-zinc-500 mt-1.5 italic leading-relaxed'>
          {impact.headline}
        </div>
      </div>

      {/* ── COST OF WAR ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconBomb className='h-4 w-4 text-white' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Cost of War</span>
        </div>
        <div className='text-2xl font-black text-white tabular-nums leading-tight'>
          {formatBillions(cost.totalBillions)}
        </div>
        <div className='space-y-0.5 mt-1'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconBomb className='h-3 w-3 text-red-400' />
              Weapons & military
            </span>
            <span className='font-bold text-red-400 tabular-nums'>{formatBillions(cost.weaponsBillions)}</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconBuildingSkyscraper className='h-3 w-3 text-orange-400' />
              Infrastructure destroyed
            </span>
            <span className='font-bold text-orange-400 tabular-nums'>{formatBillions(cost.resourcesBillions)}</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconTrendingUp className='h-3 w-3 text-yellow-400' />
              Economic / inflation
            </span>
            <span className='font-bold text-yellow-400 tabular-nums'>{formatBillions(cost.economicBillions)}</span>
          </div>
        </div>
        <div className='mt-1.5 pt-1.5 border-t border-zinc-800/50'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconUsers className='h-3 w-3 text-white' />
              Per US taxpayer
            </span>
            <span className='font-black text-white tabular-nums text-sm'>${perTaxpayer.toLocaleString()}</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconHome className='h-3 w-3 text-zinc-400' />
              Per household (2.5 people)
            </span>
            <span className='font-bold text-zinc-200 tabular-nums'>${(perTaxpayer * 2.5).toLocaleString()}</span>
          </div>
        </div>
        <div className='text-[10px] text-zinc-500 mt-1 leading-relaxed'>
          {cost.totalBillions >= 1000
            ? `$${(cost.totalBillions / 1000).toFixed(1)}T — exceeds the entire US education budget. ~$${Math.round(cost.totalBillions * 1e9 / 365 / 1_000_000).toLocaleString()}M/day.`
            : `$${cost.totalBillions.toFixed(0)}B and climbing. ~$1B/day in direct military spending.`}
        </div>
      </div>

      {/* ── NUCLEAR THREAT ── */}
      {nuclear && (
        <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
          <div className='flex items-center gap-2 mb-1'>
            <IconRadioactive className='h-4 w-4 text-green-400' />
            <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Nuclear Threat</span>
          </div>
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Facilities targeted</span>
              <span className='font-bold text-zinc-200 tabular-nums'>{nuclear.facilitiesTargeted}/6</span>
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Facilities destroyed</span>
              <span className='font-bold text-red-400 tabular-nums'>{nuclear.facilitiesDestroyed}/6</span>
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Enrichment remaining</span>
              <span className={`font-bold tabular-nums ${nuclear.enrichmentPct > 50 ? 'text-green-400' : nuclear.enrichmentPct > 20 ? 'text-orange-400' : 'text-red-400'}`}>
                {nuclear.enrichmentPct}%
              </span>
            </div>
            {/* Enrichment bar */}
            <div className='h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden'>
              <div className={`h-full rounded-full ${nuclear.enrichmentPct < 30 ? 'bg-red-400' : nuclear.enrichmentPct < 60 ? 'bg-orange-400' : 'bg-green-400'}`} style={{ width: `${nuclear.enrichmentPct}%` }} />
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Radiation risk</span>
              <span className={`font-bold tabular-nums ${nuclear.radiationRisk === 'high' ? 'text-red-500 animate-pulse' : nuclear.radiationRisk === 'elevated' ? 'text-orange-400' : nuclear.radiationRisk === 'low' ? 'text-yellow-400' : 'text-green-400'}`}>
                {nuclear.radiationRisk.toUpperCase()}
              </span>
            </div>
          </div>
          <div className='text-[10px] text-zinc-500 mt-1 italic'>{nuclear.label}</div>

          {/* Historical comparison */}
          <div className='mt-2 pt-1.5 border-t border-zinc-800/50 space-y-1'>
            <div className='text-[9px] text-zinc-600 uppercase tracking-wider font-bold'>vs Historical Nuclear Events</div>
            {[
              { label: 'Three Mile Island', score: 25, color: 'bg-yellow-400' },
              { label: 'Fukushima', score: 55, color: 'bg-orange-400' },
              { label: 'Chernobyl', score: 75, color: 'bg-red-400' },
              { label: 'Cuban Missile Crisis', score: 92, color: 'bg-red-600' },
              { label: 'Current', score: peril.nuclearScore, color: 'bg-green-400' },
            ].map((h) => (
              <div key={h.label} className='flex items-center gap-2'>
                <span className={`text-[10px] w-28 shrink-0 ${h.label === 'Current' ? 'text-white font-bold' : 'text-zinc-500'}`}>{h.label}</span>
                <div className='flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden'>
                  <div className={`h-full rounded-full ${h.color}`} style={{ width: `${h.score}%` }} />
                </div>
                <span className={`text-[10px] tabular-nums w-6 text-right ${h.label === 'Current' ? 'text-white font-bold' : 'text-zinc-600'}`}>{h.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PERIL INDEX ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconAlertTriangle className='h-4 w-4' style={{ color: peril.color }} />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Peril Index</span>
          <span className='text-sm font-black tabular-nums ml-auto' style={{ color: peril.color }}>{peril.score}/100</span>
        </div>
        <div className='text-xs font-bold uppercase tracking-wide mb-1' style={{ color: peril.color }}>
          {peril.label}
        </div>
        <div className='space-y-0.5'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Nuclear component (40%)</span>
            <span className='font-bold text-zinc-200 tabular-nums'>{peril.nuclearScore}/100</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Supply component (35%)</span>
            <span className='font-bold text-zinc-200 tabular-nums'>{peril.supplyScore}/100</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Escalation component (25%)</span>
            <span className='font-bold text-zinc-200 tabular-nums'>{peril.escalationScore}/100</span>
          </div>
        </div>
        {/* Historical comparison */}
        <div className='mt-1.5 pt-1.5 border-t border-zinc-800/50 space-y-1'>
          {HISTORICAL_ANCHORS.map((a) => (
            <div key={a.label} className='flex items-center gap-2'>
              <span className='text-[10px] text-zinc-500 w-28 shrink-0'>{a.label} ({a.year})</span>
              <div className='flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden'>
                <div className='h-full rounded-full bg-zinc-500' style={{ width: `${a.score}%` }} />
              </div>
              <span className='text-[10px] text-zinc-600 tabular-nums w-6 text-right'>{a.score}</span>
            </div>
          ))}
          <div className='flex items-center gap-2'>
            <span className='text-[10px] text-white font-bold w-28 shrink-0'>Current</span>
            <div className='flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden'>
              <div className='h-full rounded-full' style={{ width: `${peril.score}%`, backgroundColor: peril.color }} />
            </div>
            <span className='text-[10px] text-white font-bold tabular-nums w-6 text-right'>{peril.score}</span>
          </div>
        </div>
      </div>

      {/* ── SUPPLY DISRUPTION ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconAlertTriangle className='h-4 w-4 text-red-400' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Global Oil Supply</span>
        </div>
        {/* Disruption level badge */}
        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border mb-1.5 ${disruptionBg}`}>
          {supply.level}
        </div>
        <div className='space-y-0.5'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Production offline</span>
            <span className={`font-black tabular-nums ${disruptionColor}`}>{supply.productionPct.toFixed(1)}%</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Barrels/day offline</span>
            <span className='font-bold text-zinc-200 tabular-nums'>{(supply.productionBPDOffline / 1_000_000).toFixed(1)}M BPD</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Facilities hit</span>
            <span className='font-bold text-zinc-200 tabular-nums'>{supply.facilitiesHit}</span>
          </div>
          <div className='h-1.5 w-full rounded-full bg-zinc-800 mt-0.5 overflow-hidden'>
            <div className={`h-full rounded-full ${supply.level === 'catastrophe' ? 'bg-red-500' : supply.level === 'crisis' ? 'bg-red-400' : 'bg-orange-400'}`} style={{ width: `${Math.min(100, supply.productionPct * 4)}%` }} />
          </div>
        </div>

        {/* Chokepoints */}
        {supply.chokepoints.length > 0 && (
          <div className='mt-2 pt-1.5 border-t border-zinc-800/50 space-y-0.5'>
            <div className='text-[9px] text-zinc-600 uppercase tracking-wider font-bold flex items-center gap-1'>
              <IconShip className='h-3 w-3' />
              Chokepoints
            </div>
            {supply.chokepoints.map((cp) => (
              <div key={cp.id}>
                <div className='flex items-center justify-between text-[11px]'>
                  <span className='text-zinc-400'>
                    {cp.id === 'strait-of-hormuz' ? 'Strait of Hormuz' : 'Bab el-Mandeb'}
                  </span>
                  <span className={`font-bold tabular-nums ${cp.blockedPct >= 60 ? 'text-red-400' : cp.blockedPct >= 30 ? 'text-orange-400' : 'text-amber-400'}`}>
                    {cp.blockedPct}% blocked
                  </span>
                </div>
                <div className='h-1 w-full rounded-full bg-zinc-800 overflow-hidden'>
                  <div className={`h-full rounded-full ${cp.blockedPct >= 60 ? 'bg-red-400' : cp.blockedPct >= 30 ? 'bg-orange-400' : 'bg-amber-400'}`} style={{ width: `${cp.blockedPct}%` }} />
                </div>
                <div className='text-[9px] text-zinc-600'>{(cp.capacityBPD / 1_000_000).toFixed(1)}M BPD capacity — {(cp.blockedBPD / 1_000_000).toFixed(1)}M blocked</div>
              </div>
            ))}
            <div className='flex items-center justify-between text-[11px] pt-1'>
              <span className='text-zinc-400'>Global transit disrupted</span>
              <span className='font-black text-red-400 tabular-nums'>{supply.transitBlockedPct.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* ── EMISSIONS ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconCloud className='h-4 w-4 text-orange-400' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Emissions</span>
        </div>
        {totalCO2 > 0 ? (
          <div className='text-xl font-black text-orange-400 tabular-nums leading-tight'>
            {formatCO2(totalCO2)} <span className='text-sm font-bold'>tons/day CO2</span>
          </div>
        ) : (
          <div className='text-base font-black text-zinc-600 leading-tight'>
            {loading ? '...' : '—'}
          </div>
        )}
        {totalCO2 > 0 && (
          <div className='space-y-0.5 mt-1'>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>= cars running for a year</span>
              <span className='font-bold text-zinc-200 tabular-nums'>{equiv.carsPerYear.toLocaleString()}</span>
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>= homes powered for a year</span>
              <span className='font-bold text-zinc-200 tabular-nums'>{equiv.homesPerYear.toLocaleString()}</span>
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>% of global daily emissions</span>
              <span className='font-bold text-zinc-200 tabular-nums'>{equiv.percentGlobalDaily}%</span>
            </div>
          </div>
        )}
        <div className='mt-1.5 pt-1.5 border-t border-zinc-800/50'>
          <Link href='/dashboard/fires' className='flex items-center justify-between hover:bg-zinc-900/50 rounded transition-colors -mx-1 px-1 py-0.5'>
            <div className='flex items-center gap-3 text-[11px]'>
              <span className='flex items-center gap-1 text-orange-500'>
                <IconFlame className='h-3 w-3' />
                <span className='font-bold tabular-nums'>{loading ? '...' : activeFires} active fires</span>
              </span>
              <span className='flex items-center gap-1 text-yellow-400'>
                <IconWorld className='h-3 w-3' />
                <span className='font-bold tabular-nums'>{curatedFires.length} tracked facilities</span>
              </span>
            </div>
            <span className='text-[10px] text-blue-400'>map →</span>
          </Link>
        </div>
      </div>

      {/* bottom spacer */}
      <div className='h-4' />

    </div>
  );
}
