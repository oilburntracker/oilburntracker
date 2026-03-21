'use client';

import { useFireStore } from '@/stores/fire-store';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { getConsumerImpactUpTo, BASELINE } from '@/features/impact/data/consumer-impact';
import { getCasualtiesUpTo, getNuclearStatusUpTo, getVisibleFacilityIds } from '@/features/timeline/data/conflict-events';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { formatCO2, co2Equivalents } from '@/features/emissions/utils/emissions-model';
import {
  IconGasStation, IconShoppingCart, IconBolt, IconPackage,
  IconRadioactive, IconBomb, IconCloud, IconAlertTriangle
} from '@tabler/icons-react';
import Link from 'next/link';

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className='h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden'>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className='flex items-center justify-between text-[11px]'>
      <span className='text-zinc-400'>{label}</span>
      <div className='text-right'>
        <span className='font-bold text-zinc-200 tabular-nums'>{value}</span>
        {sub && <span className='text-zinc-600 ml-1'>{sub}</span>}
      </div>
    </div>
  );
}

function formatBillions(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}T`;
  if (n >= 100) return `$${n.toFixed(0)}B`;
  return `$${n.toFixed(1)}B`;
}

function SectionHeader({ icon, label, value, valueColor }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-2'>
        {icon}
        <span className='text-xs font-bold text-zinc-300'>{label}</span>
      </div>
      <span className={`text-xs font-black tabular-nums mr-2 ${valueColor || 'text-zinc-200'}`}>{value}</span>
    </div>
  );
}

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

  const gasExtra = Math.max(0, (impact.gasPriceGallon - BASELINE.gasPriceGallon) * BASELINE.monthlyGasGallons);
  const oilDelta = impact.oilPriceBbl - BASELINE.oilPriceBbl;
  const perTaxpayer = Math.round((cost.totalBillions * 1e9) / 330_000_000);

  const disruptionColors: Record<string, string> = {
    normal: 'text-green-400', mild: 'text-yellow-400', severe: 'text-orange-400',
    crisis: 'text-red-400', catastrophe: 'text-red-500',
  };

  return (
    <div className='h-full overflow-y-auto'>
      <Accordion type='multiple' className='px-3'>

        {/* ── AT THE PUMP ── */}
        <AccordionItem value='pump' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconGasStation className='h-4 w-4 text-orange-400' />}
              label='At The Pump'
              value={`$${impact.gasPriceGallon.toFixed(2)}/gal`}
              valueColor='text-orange-400'
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            <Row label='Pre-war baseline' value={`$${BASELINE.gasPriceGallon.toFixed(2)}/gal`} />
            <Row label='Monthly extra' value={`+$${gasExtra.toFixed(0)}/mo`} sub='(~40 gal/mo)' />
            <Row label='Oil price' value={`$${impact.oilPriceBbl}/bbl`} sub={`(${oilDelta > 0 ? '+' : ''}${oilDelta.toFixed(0)} from pre-war)`} />
            <Bar pct={(impact.gasPriceGallon / 8) * 100} color='bg-orange-400' />
            <p className='text-[10px] text-zinc-500 leading-relaxed'>
              Every $10/bbl increase in crude adds ~$0.25/gal at the pump.
              Refinery damage + Hormuz closure compound the effect.
              2008 peak was $4.11/gal. Current: ${impact.gasPriceGallon.toFixed(2)}.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* ── GROCERY BILL ── */}
        <AccordionItem value='grocery' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconShoppingCart className='h-4 w-4 text-amber-400' />}
              label='Grocery Bill'
              value={`+${impact.groceryInflationPct}%`}
              valueColor='text-amber-400'
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            <Row label='Extra per month' value={`+$${impact.monthlyGroceryExtra}/mo`} sub='(family of 4)' />
            <Row label='Baseline' value='$1,000/mo' />
            <Bar pct={impact.groceryInflationPct * 2} color='bg-amber-400' />
            <p className='text-[10px] text-zinc-500 leading-relaxed'>
              Oil up → fertilizer costs up (QAFCO offline) → diesel trucking costs up → food prices up.
              Milk, eggs, bread, meat all affected. Shipping delays compound shortages.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* ── HOME ENERGY ── */}
        <AccordionItem value='energy' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconBolt className='h-4 w-4 text-yellow-400' />}
              label='Home Energy'
              value={`+$${impact.monthlyUtilityExtra}/mo`}
              valueColor='text-yellow-400'
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            <Row label='Nat Gas price' value={`$${impact.natGasMMBtu.toFixed(1)}/MMBtu`} sub={`(from $${BASELINE.natGasMMBtu.toFixed(1)})`} />
            <Bar pct={(impact.natGasMMBtu / 25) * 100} color='bg-yellow-400' />
            <p className='text-[10px] text-zinc-500 leading-relaxed'>
              {impact.natGasMMBtu > 12
                ? 'Ras Laffan LNG destroyed — 17% of global capacity gone. Northeast US & Europe hit hardest.'
                : impact.natGasMMBtu > 6
                ? 'South Pars destruction rippling through global gas markets.'
                : 'Regional variation: Northeast US and Europe most exposed to gas price spikes.'}
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* ── SHIPPING ── */}
        <AccordionItem value='shipping' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconPackage className='h-4 w-4 text-red-400' />}
              label='Shipping'
              value={`+${impact.shippingSurchargePct}%`}
              valueColor='text-red-400'
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            <Row label='Extra delivery time' value={`+${impact.deliveryDelayDays} days`} />
            <Bar pct={impact.shippingSurchargePct} color='bg-red-400' />
            <p className='text-[10px] text-zinc-500 leading-relaxed'>
              {impact.shippingSurchargePct >= 80
                ? 'Hormuz 70%+ blocked, Bab el-Mandeb 75%. Cape of Good Hope rerouting adds weeks.'
                : impact.shippingSurchargePct >= 30
                ? 'Your Amazon package costs more and arrives later. Gulf shipping routes disrupted.'
                : 'Red Sea rerouting via Cape of Good Hope adding transit time and fuel costs.'}
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* ── NUCLEAR RISK ── */}
        <AccordionItem value='nuclear' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconRadioactive className='h-4 w-4 text-green-400' />}
              label='Nuclear Risk'
              value={nuclear ? `${nuclear.facilitiesDestroyed}/6 destroyed` : 'None'}
              valueColor={nuclear?.radiationRisk === 'high' ? 'text-red-400' : nuclear?.radiationRisk === 'elevated' ? 'text-orange-400' : 'text-green-400'}
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            {nuclear && (
              <>
                <Row label='Enrichment remaining' value={`${nuclear.enrichmentPct}%`} />
                <Bar pct={100 - nuclear.enrichmentPct} color={nuclear.enrichmentPct < 30 ? 'bg-red-400' : 'bg-orange-400'} />
                <Row label='Radiation risk' value={nuclear.radiationRisk.toUpperCase()} />
                <p className='text-[10px] text-zinc-600 italic'>{nuclear.label}</p>

                {/* Historical comparison */}
                <div className='pt-2 border-t border-zinc-800/50 space-y-1'>
                  <div className='text-[10px] text-zinc-500 font-bold uppercase tracking-wider'>vs Historical Events</div>
                  {[
                    { label: 'Three Mile Island', score: 25, color: 'bg-yellow-400' },
                    { label: 'Fukushima', score: 55, color: 'bg-orange-400' },
                    { label: 'Chernobyl', score: 75, color: 'bg-red-400' },
                    { label: 'Cuban Missile Crisis', score: 92, color: 'bg-red-600' },
                  ].map((h) => (
                    <div key={h.label} className='flex items-center gap-2'>
                      <span className='text-[10px] text-zinc-500 w-28 shrink-0'>{h.label}</span>
                      <div className='flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden'>
                        <div className={`h-full rounded-full ${h.color}`} style={{ width: `${h.score}%` }} />
                      </div>
                      <span className='text-[10px] text-zinc-600 tabular-nums w-6 text-right'>{h.score}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── WAR COST ── */}
        <AccordionItem value='warcost' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconBomb className='h-4 w-4 text-white' />}
              label='War Cost'
              value={formatBillions(cost.totalBillions)}
              valueColor='text-white'
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            <Row label='Weapons & military' value={formatBillions(cost.weaponsBillions)} />
            <Row label='Infrastructure destroyed' value={formatBillions(cost.resourcesBillions)} />
            <Row label='Economic / inflation' value={formatBillions(cost.economicBillions)} />
            <div className='pt-2 border-t border-zinc-800/50'>
              <Row label='Per US taxpayer' value={`$${perTaxpayer.toLocaleString()}`} />
            </div>
            <p className='text-[10px] text-zinc-500 leading-relaxed'>
              {cost.totalBillions >= 1000
                ? `$${(cost.totalBillions / 1000).toFixed(1)}T is more than the entire US education budget. Every American household is paying $${Math.round(perTaxpayer / 1).toLocaleString()} of this war.`
                : `$${cost.totalBillions.toFixed(0)}B and climbing. Each day of war costs ~$1B in direct military spending alone.`}
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* ── EMISSIONS ── */}
        <AccordionItem value='emissions' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconCloud className='h-4 w-4 text-orange-400' />}
              label='Emissions'
              value={totalCO2 > 0 ? `${formatCO2(totalCO2)} t/d` : loading ? '...' : '—'}
              valueColor='text-orange-400'
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            {totalCO2 > 0 && (
              <>
                <Row label='Equivalent cars/year' value={equiv.carsPerYear.toLocaleString()} />
                <Row label='Equivalent homes/year' value={equiv.homesPerYear.toLocaleString()} />
                <Row label='% of global daily' value={`${equiv.percentGlobalDaily}%`} />
              </>
            )}
            <Row label='Active fires' value={loading ? '...' : String(fireData.features.length)} />
            <Link href='/dashboard/fires' className='text-[10px] text-blue-400 hover:text-blue-300 font-medium'>
              View fire map →
            </Link>
          </AccordionContent>
        </AccordionItem>

        {/* ── SUPPLY DISRUPTION ── */}
        <AccordionItem value='supply' className='border-zinc-800'>
          <AccordionTrigger className='py-2.5 hover:no-underline'>
            <SectionHeader
              icon={<IconAlertTriangle className='h-4 w-4 text-red-400' />}
              label='Supply'
              value={`${supply.productionPct.toFixed(1)}% offline`}
              valueColor={disruptionColors[supply.level] || 'text-green-400'}
            />
          </AccordionTrigger>
          <AccordionContent className='space-y-2 px-1'>
            <Row label='Production offline' value={`${(supply.productionBPDOffline / 1_000_000).toFixed(1)}M BPD`} />
            <Row label='Facilities hit' value={String(supply.facilitiesHit)} />
            <Bar pct={supply.productionPct * 5} color={supply.level === 'catastrophe' ? 'bg-red-500' : 'bg-orange-400'} />
            {supply.chokepoints.length > 0 && (
              <div className='pt-2 border-t border-zinc-800/50 space-y-1'>
                <div className='text-[10px] text-zinc-500 font-bold uppercase tracking-wider'>Chokepoints</div>
                {supply.chokepoints.map((cp) => (
                  <div key={cp.id} className='flex items-center justify-between text-[11px]'>
                    <span className='text-zinc-400'>
                      {cp.id === 'strait-of-hormuz' ? 'Strait of Hormuz' : 'Bab el-Mandeb'}
                    </span>
                    <span className={`font-bold tabular-nums ${cp.blockedPct >= 60 ? 'text-red-400' : cp.blockedPct >= 30 ? 'text-orange-400' : 'text-amber-400'}`}>
                      {cp.blockedPct}% blocked
                    </span>
                  </div>
                ))}
                <Row label='Global transit disrupted' value={`${supply.transitBlockedPct.toFixed(1)}%`} />
              </div>
            )}
            <p className='text-[10px] text-zinc-500 leading-relaxed'>
              {supply.level === 'catastrophe' ? 'CATASTROPHE — Multiple major facilities destroyed and chokepoints blocked.'
                : supply.level === 'crisis' ? 'CRISIS — Significant infrastructure offline, global supply strained.'
                : 'Global oil supply under pressure from facility damage and chokepoint disruption.'}
            </p>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
