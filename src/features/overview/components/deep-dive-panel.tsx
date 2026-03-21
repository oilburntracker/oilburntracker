'use client';

import { useFireStore } from '@/stores/fire-store';
import { getConsumerImpactUpTo, BASELINE } from '@/features/impact/data/consumer-impact';
import { getCasualtiesUpTo, getNuclearStatusUpTo, getVisibleFacilityIds } from '@/features/timeline/data/conflict-events';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { formatCO2, co2Equivalents } from '@/features/emissions/utils/emissions-model';
import { curatedFires } from '@/features/fires/data/curated-fires';
import {
  IconGasStation, IconShoppingCart, IconBolt, IconPackage,
  IconRadioactive, IconBomb, IconCloud, IconAlertTriangle,
  IconSkull, IconFlame, IconWorld, IconBuildingSkyscraper, IconTrendingUp, IconReceipt
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

export default function DeepDivePanel() {
  const fireData = useFireStore((s) => s.fireData);
  const loading = useFireStore((s) => s.loading);
  const timelineDate = useFireStore((s) => s.timelineDate);

  const impact = getConsumerImpactUpTo(timelineDate);
  const casualties = getCasualtiesUpTo(timelineDate);
  const nuclear = getNuclearStatusUpTo(timelineDate);
  const cost = getWarCostUpTo(timelineDate);
  const facilityIds = getVisibleFacilityIds(timelineDate);
  const supply = getSupplyDisruptionUpTo(facilityIds, timelineDate);
  const totalCO2 = fireData.features.reduce((s, f) => s + f.properties.estimatedCO2TonsDay, 0);
  const equiv = co2Equivalents(totalCO2);
  const activeFires = fireData.features.length;

  const gasExtra = Math.max(0, (impact.gasPriceGallon - BASELINE.gasPriceGallon) * BASELINE.monthlyGasGallons);
  const oilDelta = impact.oilPriceBbl - BASELINE.oilPriceBbl;
  const perTaxpayer = Math.round((cost.totalBillions * 1e9) / 330_000_000);
  const disruptionColor = DISRUPTION_COLORS[supply.level] || DISRUPTION_COLORS.normal;

  return (
    <div className='h-full overflow-y-auto'>

      {/* ── HUMAN COST ── */}
      <div className='px-3 pt-3 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconSkull className='h-5 w-5 text-red-500' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Human Cost</span>
        </div>
        <div className='text-2xl font-black text-red-500 tabular-nums leading-tight'>
          {casualties.totalKilled.toLocaleString()}+ <span className='text-sm font-bold'>killed</span>
        </div>
        <div className='flex items-center gap-3 mt-1'>
          {casualties.totalDisplaced > 0 && (
            <span className='text-xs font-bold text-amber-400 tabular-nums'>
              {(casualties.totalDisplaced / 1000000).toFixed(1)}M displaced
            </span>
          )}
          {casualties.totalChildren > 0 && (
            <span className='text-xs font-bold text-red-300 tabular-nums'>
              {casualties.totalChildren.toLocaleString()}+ children
            </span>
          )}
        </div>
      </div>

      {/* ── YOUR COST ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconReceipt className='h-3.5 w-3.5 text-orange-400' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Your Cost</span>
        </div>
        <div className='text-xl font-black text-orange-400 tabular-nums leading-tight mb-1.5'>
          +${impact.totalMonthlyExtra}<span className='text-sm font-bold text-zinc-400'>/mo</span>
        </div>
        <div className='space-y-0.5'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconGasStation className='h-3 w-3 text-orange-400' />
              Gas
            </span>
            <span className='font-bold text-orange-400 tabular-nums'>${impact.gasPriceGallon.toFixed(2)}/gal</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconShoppingCart className='h-3 w-3 text-amber-400' />
              Groceries
            </span>
            <span className='font-bold text-amber-400 tabular-nums'>+{impact.groceryInflationPct}%</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconBolt className='h-3 w-3 text-yellow-400' />
              Utilities
            </span>
            <span className='font-bold text-yellow-400 tabular-nums'>+${impact.monthlyUtilityExtra}/mo</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconPackage className='h-3 w-3 text-red-400' />
              Shipping
            </span>
            <span className='font-bold text-red-400 tabular-nums'>+{impact.shippingSurchargePct}%</span>
          </div>
        </div>
        <div className='text-[10px] text-zinc-500 mt-1.5 leading-relaxed'>
          Oil at ${impact.oilPriceBbl}/bbl ({oilDelta > 0 ? '+' : ''}{oilDelta.toFixed(0)} from pre-war).
          Every $10/bbl adds ~$0.25/gal at the pump.
        </div>
      </div>

      {/* ── COST OF WAR ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1'>Cost of War</div>
        <div className='text-xl font-black text-white tabular-nums leading-tight mb-1.5'>
          {formatBillions(cost.totalBillions)}
        </div>
        <div className='space-y-0.5'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconBomb className='h-3 w-3 text-red-400' />
              Weapons
            </span>
            <span className='font-bold text-red-400 tabular-nums'>{formatBillions(cost.weaponsBillions)}</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconBuildingSkyscraper className='h-3 w-3 text-orange-400' />
              Resources Lost
            </span>
            <span className='font-bold text-orange-400 tabular-nums'>{formatBillions(cost.resourcesBillions)}</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconTrendingUp className='h-3 w-3 text-yellow-400' />
              Inflation
            </span>
            <span className='font-bold text-yellow-400 tabular-nums'>{formatBillions(cost.economicBillions)}</span>
          </div>
        </div>
        <div className='mt-1.5 pt-1.5 border-t border-zinc-800/50'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-zinc-400'>Your share (per taxpayer)</span>
            <span className='font-black text-white tabular-nums'>${perTaxpayer.toLocaleString()}</span>
          </div>
        </div>
        <div className='text-[10px] text-zinc-500 mt-1 leading-relaxed'>
          {cost.totalBillions >= 1000
            ? `More than the entire US education budget.`
            : `Each day of war costs ~$1B in direct military spending alone.`}
        </div>
      </div>

      {/* ── NUCLEAR THREAT ── */}
      {nuclear && (
        <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
          <div className='flex items-center gap-2 mb-1'>
            <IconRadioactive className='h-3.5 w-3.5 text-green-400' />
            <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Nuclear</span>
          </div>
          <div className='space-y-0.5'>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Facilities hit</span>
              <span className='font-bold text-green-400 tabular-nums'>{nuclear.facilitiesTargeted}/{nuclear.facilitiesDestroyed}</span>
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Enrichment</span>
              <span className={`font-bold tabular-nums ${nuclear.enrichmentPct > 50 ? 'text-red-400' : nuclear.enrichmentPct > 20 ? 'text-orange-400' : 'text-green-400'}`}>
                {nuclear.enrichmentPct}%
              </span>
            </div>
            {nuclear.radiationRisk !== 'none' && (
              <div className='flex items-center justify-between text-[11px]'>
                <span className='text-zinc-400'>Radiation</span>
                <span className={`font-bold tabular-nums ${nuclear.radiationRisk === 'high' ? 'text-red-500 animate-pulse' : nuclear.radiationRisk === 'elevated' ? 'text-orange-400' : 'text-yellow-400'}`}>
                  {nuclear.radiationRisk.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className='text-[9px] text-zinc-600 mt-1'>{nuclear.label}</div>
        </div>
      )}

      {/* ── SUPPLY DISRUPTION ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1'>Global Oil Supply</div>
        <div className={`text-base font-black tabular-nums leading-tight ${disruptionColor}`}>
          {supply.productionPct.toFixed(1)}% offline
        </div>
        <div className='text-[10px] text-zinc-500 tabular-nums'>
          {(supply.productionBPDOffline / 1000000).toFixed(1)}M BPD — {supply.facilitiesHit} facilities
        </div>
        {supply.chokepoints.length > 0 && (
          <div className='mt-1 pt-1 border-t border-zinc-800/50 space-y-0.5'>
            {supply.chokepoints.map((cp) => (
              <div key={cp.id} className='flex items-center justify-between text-[11px]'>
                <span className='text-zinc-400 truncate mr-2'>
                  {cp.id === 'strait-of-hormuz' ? 'Hormuz' : 'Bab el-Mandeb'}
                </span>
                <span className={`font-bold tabular-nums ${cp.blockedPct >= 60 ? 'text-red-400' : cp.blockedPct >= 30 ? 'text-orange-400' : 'text-amber-400'}`}>
                  {cp.blockedPct}%
                </span>
              </div>
            ))}
            <div className='text-[10px] font-bold text-red-400 tabular-nums'>
              {supply.transitBlockedPct.toFixed(1)}% global disrupted
            </div>
          </div>
        )}
      </div>

      {/* ── EMISSIONS + FIRES ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='flex items-center gap-2 mb-1'>
          <IconCloud className='h-3.5 w-3.5 text-orange-400' />
          <span className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold'>Emissions</span>
        </div>
        {totalCO2 > 0 ? (
          <div className='text-base font-black text-orange-400 tabular-nums leading-tight mb-1'>
            {formatCO2(totalCO2)} t/day
          </div>
        ) : (
          <div className='text-base font-black text-zinc-600 leading-tight mb-1'>
            {loading ? '...' : '—'}
          </div>
        )}
        {totalCO2 > 0 && (
          <div className='space-y-0.5 mb-1'>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>= cars/year</span>
              <span className='font-bold text-zinc-200 tabular-nums'>{equiv.carsPerYear.toLocaleString()}</span>
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>= homes/year</span>
              <span className='font-bold text-zinc-200 tabular-nums'>{equiv.homesPerYear.toLocaleString()}</span>
            </div>
          </div>
        )}
        <Link href='/dashboard/fires' className='flex items-center justify-between hover:bg-zinc-900/50 rounded transition-colors -mx-1 px-1 py-0.5'>
          <div className='flex items-center gap-3 text-[11px]'>
            <span className='flex items-center gap-1 text-orange-500'>
              <IconFlame className='h-3 w-3' />
              <span className='font-bold tabular-nums'>{loading ? '...' : activeFires} active</span>
            </span>
            <span className='flex items-center gap-1 text-yellow-400'>
              <IconWorld className='h-3 w-3' />
              <span className='font-bold tabular-nums'>{curatedFires.length} tracked</span>
            </span>
          </div>
          <span className='text-[10px] text-blue-400'>map →</span>
        </Link>
      </div>

      {/* ── HEADLINE ── */}
      <div className='px-3 pt-2 pb-3'>
        <div className='text-[10px] text-zinc-600 italic leading-relaxed'>
          {impact.headline}
        </div>
      </div>

    </div>
  );
}
