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
  IconTrendingUp, IconReceipt, IconShip, IconClock, IconUsers, IconHome,
  IconInfoCircle
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

/* ── Reusable row with optional tooltip ── */
function Row({ label, value, valueColor, tip, sub }: {
  label: string; value: string; valueColor?: string; tip?: string; sub?: string;
}) {
  return (
    <div className='group'>
      <div className='flex items-center justify-between py-0.5'>
        <span className='text-sm text-zinc-300 flex items-center gap-1'>
          {label}
          {tip && (
            <span className='relative'>
              <IconInfoCircle className='h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors cursor-help' />
              <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 leading-relaxed shadow-xl z-50'>
                {tip}
              </span>
            </span>
          )}
        </span>
        <span className={`text-sm font-bold tabular-nums ${valueColor || 'text-white'}`}>{value}</span>
      </div>
      {sub && <div className='text-xs text-zinc-500 -mt-0.5 mb-0.5'>{sub}</div>}
    </div>
  );
}

/* ── Info box for context/explainers ── */
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className='mt-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50'>
      <div className='text-xs text-zinc-400 leading-relaxed'>{children}</div>
    </div>
  );
}

/* ── Progress bar ── */
function Bar({ pct, color, height }: { pct: number; color: string; height?: string }) {
  return (
    <div className={`w-full rounded-full bg-zinc-800 overflow-hidden ${height || 'h-2'}`}>
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

/* ── Section header ── */
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className='flex items-center gap-2 mb-2'>
      {icon}
      <span className='text-xs uppercase tracking-widest text-zinc-500 font-bold'>{title}</span>
    </div>
  );
}

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
      nuclear, supply.productionPct, supply.transitBlockedPct,
      stats.eventsLast7, stats.severeEventsLast30, stats.totalEvents
    );
    const gasExtra = Math.max(0, (impact.gasPriceGallon - BASELINE.gasPriceGallon) * BASELINE.monthlyGasGallons);
    const oilDelta = impact.oilPriceBbl - BASELINE.oilPriceBbl;
    const perTaxpayer = Math.round((cost.totalBillions * 1e9) / 330_000_000);
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

  const displayDate = new Date(timelineDate + 'T00:00:00');
  const dateFormatted = displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Population-scale comparisons
  const populationKilled = casualties.totalKilled >= 50000 ? 'a small city' : casualties.totalKilled >= 10000 ? 'a small town' : 'a neighborhood';
  const annualCostPerHousehold = impact.totalMonthlyExtra * 12;

  return (
    <div className='h-full overflow-y-auto pb-16'>

      {/* ── DATE HEADER ── */}
      <div className='px-4 pt-4 pb-3 border-b border-zinc-700 bg-zinc-900/80'>
        <div className='text-lg font-black text-white leading-tight'>
          {dateFormatted}
        </div>
        <div className='flex items-center gap-3 mt-1.5'>
          <div className='flex items-center gap-1.5'>
            <IconClock className='h-4 w-4 text-zinc-500' />
            <span className='text-sm font-bold text-zinc-200 tabular-nums'>Day {warDays.toLocaleString()}</span>
          </div>
          <span className='text-zinc-700'>|</span>
          <span className='text-sm text-zinc-400'>{stats.totalEvents} events</span>
          <span className='text-zinc-700'>|</span>
          <span className='text-sm text-orange-400 font-bold'>{stats.eventsLast7} this week</span>
        </div>
      </div>

      {/* ── HUMAN COST ── */}
      <div className='px-4 pt-3 pb-3 border-b border-zinc-700'>
        <SectionTitle icon={<IconSkull className='h-5 w-5 text-red-500' />} title='Human Cost' />
        <div className='text-3xl font-black text-red-500 tabular-nums leading-tight'>
          {casualties.totalKilled.toLocaleString()}+
        </div>
        <div className='text-sm text-red-400 font-bold mb-2'>people killed</div>

        <div className='space-y-0.5'>
          <Row label='Injured' value={`${casualties.totalInjured.toLocaleString()}+`} valueColor='text-orange-400'
            tip='Includes military and civilian injuries reported by all sides' />
          {casualties.totalChildren > 0 && (
            <Row label='Children killed' value={`${casualties.totalChildren.toLocaleString()}+`} valueColor='text-red-300'
              tip='Children under 18 confirmed killed, likely undercounted' />
          )}
          {casualties.totalDisplaced > 0 && (
            <Row label='Displaced from homes' value={`${(casualties.totalDisplaced / 1_000_000).toFixed(1)}M`} valueColor='text-amber-400'
              tip='People forced to leave their homes, many multiple times' />
          )}
        </div>

        {/* By region */}
        {Object.keys(casualties.byRegion).length > 0 && (
          <div className='mt-2 pt-2 border-t border-zinc-800/50 space-y-0.5'>
            <div className='text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1'>By Region</div>
            {Object.entries(casualties.byRegion)
              .sort((a, b) => b[1].killed - a[1].killed)
              .map(([region, d]) => (
                <div key={region} className='flex items-center justify-between text-sm'>
                  <span className='text-zinc-300'>{region}</span>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-red-400 tabular-nums'>{d.killed.toLocaleString()}</span>
                    {d.injured > 0 && (
                      <span className='text-xs text-zinc-500 tabular-nums'>({d.injured.toLocaleString()} inj)</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        <InfoBox>
          That&apos;s the population of {populationKilled}. Every number is a person — a parent, child, neighbor.
          {casualties.totalDisplaced > 0 && ` ${(casualties.totalDisplaced / 1_000_000).toFixed(1)} million people have nowhere to go home to.`}
        </InfoBox>
      </div>

      {/* ── YOUR HOUSEHOLD COST ── */}
      <div className='px-4 pt-3 pb-3 border-b border-zinc-700'>
        <SectionTitle icon={<IconReceipt className='h-5 w-5 text-orange-400' />} title='Cost to Your Household' />
        <div className='text-3xl font-black text-orange-400 tabular-nums leading-tight'>
          +${impact.totalMonthlyExtra}
        </div>
        <div className='text-sm text-orange-300 font-bold mb-1'>extra per month</div>
        <div className='text-xs text-zinc-500 mb-3'>vs pre-war baseline — that&apos;s ${annualCostPerHousehold.toLocaleString()}/year more</div>

        {/* Gas */}
        <div className='rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-3 mb-2'>
          <div className='flex items-center justify-between mb-1'>
            <span className='flex items-center gap-2 text-sm text-zinc-200'>
              <IconGasStation className='h-4 w-4 text-orange-400' />
              Gas Price
            </span>
            <span className='text-lg font-black text-orange-400 tabular-nums'>${impact.gasPriceGallon.toFixed(2)}/gal</span>
          </div>
          <Bar pct={(impact.gasPriceGallon / 8) * 100} color='bg-orange-400' />
          <div className='flex items-center justify-between mt-1'>
            <span className='text-xs text-zinc-500'>Pre-war: ${BASELINE.gasPriceGallon.toFixed(2)}</span>
            <span className='text-xs text-zinc-500'>2008 peak: $4.11</span>
          </div>
          <div className='text-xs text-orange-300 font-bold mt-1'>
            +${gasExtra.toFixed(0)}/mo extra at the pump
          </div>
          <div className='text-xs text-zinc-500 mt-0.5'>
            Based on avg 40 gallons/month. Every $10/bbl crude adds ~$0.25/gal.
          </div>
        </div>

        {/* Groceries */}
        <div className='rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-3 mb-2'>
          <div className='flex items-center justify-between mb-1'>
            <span className='flex items-center gap-2 text-sm text-zinc-200'>
              <IconShoppingCart className='h-4 w-4 text-amber-400' />
              Groceries
            </span>
            <span className='text-lg font-black text-amber-400 tabular-nums'>+{impact.groceryInflationPct}%</span>
          </div>
          <Bar pct={impact.groceryInflationPct * 3} color='bg-amber-400' />
          <Row label='Extra per month' value={`+$${impact.monthlyGroceryExtra}/mo`} valueColor='text-amber-300'
            tip='Oil up → fertilizer costs up → diesel trucking up → food prices up. Eggs, milk, bread, meat all affected.' />
          <div className='text-xs text-zinc-500'>Family of 4, baseline $1,000/mo</div>
        </div>

        {/* Home Energy */}
        <div className='rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-3 mb-2'>
          <div className='flex items-center justify-between mb-1'>
            <span className='flex items-center gap-2 text-sm text-zinc-200'>
              <IconBolt className='h-4 w-4 text-yellow-400' />
              Home Energy
            </span>
            <span className='text-lg font-black text-yellow-400 tabular-nums'>+${impact.monthlyUtilityExtra}/mo</span>
          </div>
          <Bar pct={(impact.natGasMMBtu / 25) * 100} color='bg-yellow-400' />
          <Row label='Natural gas' value={`$${impact.natGasMMBtu.toFixed(1)}/MMBtu`}
            sub={`Pre-war: $${BASELINE.natGasMMBtu.toFixed(1)}/MMBtu`}
            tip='Natural gas heats 47% of US homes. Northeast and Midwest hit hardest.' />
          {impact.natGasMMBtu > 12 && (
            <div className='text-xs text-red-400 font-bold mt-1'>
              Ras Laffan LNG destroyed — 17% of global LNG capacity gone
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className='rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-3 mb-2'>
          <div className='flex items-center justify-between mb-1'>
            <span className='flex items-center gap-2 text-sm text-zinc-200'>
              <IconPackage className='h-4 w-4 text-red-400' />
              Shipping & Delivery
            </span>
            <span className='text-lg font-black text-red-400 tabular-nums'>+{impact.shippingSurchargePct}%</span>
          </div>
          <Bar pct={impact.shippingSurchargePct} color='bg-red-400' />
          <Row label='Extra delivery time' value={`+${impact.deliveryDelayDays} days`} valueColor='text-red-300'
            tip='Your Amazon package takes longer and costs more. Ships reroute around Africa instead of through Suez/Hormuz.' />
        </div>

        {/* Oil price card */}
        <div className='rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-3'>
          <div className='flex items-center justify-between mb-1'>
            <span className='text-sm text-zinc-200'>Oil (Brent crude)</span>
            <span className='text-lg font-black text-white tabular-nums'>${impact.oilPriceBbl}/bbl</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-zinc-500'>Pre-war: ${BASELINE.oilPriceBbl}/bbl</span>
            <span className='text-sm text-orange-400 font-bold'>+${oilDelta > 0 ? oilDelta.toFixed(0) : '0'}/bbl</span>
          </div>
        </div>

        <InfoBox>
          {impact.headline}
        </InfoBox>
      </div>

      {/* ── COST OF WAR ── */}
      <div className='px-4 pt-3 pb-3 border-b border-zinc-700'>
        <SectionTitle icon={<IconBomb className='h-5 w-5 text-white' />} title='Cost of War' />
        <div className='text-3xl font-black text-white tabular-nums leading-tight'>
          {formatBillions(cost.totalBillions)}
        </div>
        <div className='text-sm text-zinc-400 font-bold mb-2'>total economic cost</div>

        <div className='space-y-0.5'>
          <Row label='Weapons & military' value={formatBillions(cost.weaponsBillions)} valueColor='text-red-400'
            tip='Taxpayer-funded: missiles, aircraft carriers, military aid packages, Iron Dome replenishment' />
          <Row label='Infrastructure destroyed' value={formatBillions(cost.resourcesBillions)} valueColor='text-orange-400'
            tip='Oil facilities, gas fields, nuclear sites, refineries, ports — permanently destroyed capacity' />
          <Row label='Economic / inflation' value={formatBillions(cost.economicBillions)} valueColor='text-yellow-400'
            tip='Higher oil prices, shipping reroutes, insurance surges, supply chain delays — costs passed to consumers worldwide' />
        </div>

        <div className='mt-3 pt-2 border-t border-zinc-800/50'>
          <div className='rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-3'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-2 text-sm text-zinc-200'>
                <IconUsers className='h-4 w-4 text-white' />
                Your share (per taxpayer)
              </span>
              <span className='text-xl font-black text-white tabular-nums'>${perTaxpayer.toLocaleString()}</span>
            </div>
            <div className='flex items-center justify-between mt-1'>
              <span className='flex items-center gap-2 text-sm text-zinc-300'>
                <IconHome className='h-4 w-4 text-zinc-400' />
                Per household
              </span>
              <span className='text-base font-bold text-zinc-200 tabular-nums'>${Math.round(perTaxpayer * 2.5).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <InfoBox>
          {cost.totalBillions >= 1000
            ? `$${(cost.totalBillions / 1000).toFixed(1)} trillion — more than the entire US education budget. That's ~$${Math.round(cost.totalBillions * 1e9 / 365 / 1_000_000).toLocaleString()}M being spent every single day.`
            : `$${cost.totalBillions.toFixed(0)}B and climbing. About $1 billion per day in direct military spending alone. That money could fund 50,000 teacher salaries instead.`}
        </InfoBox>
      </div>

      {/* ── NUCLEAR THREAT ── */}
      {nuclear && (
        <div className='px-4 pt-3 pb-3 border-b border-zinc-700'>
          <SectionTitle icon={<IconRadioactive className='h-5 w-5 text-green-400' />} title='Nuclear Threat' />

          <div className='space-y-1'>
            <Row label='Facilities targeted' value={`${nuclear.facilitiesTargeted} of 6`} valueColor='text-zinc-200'
              tip='Iran has 6 major nuclear facilities: Natanz, Fordow, Isfahan, Arak, Bushehr, Tehran Research Reactor' />
            <Row label='Facilities destroyed' value={`${nuclear.facilitiesDestroyed} of 6`} valueColor='text-red-400' />
            <Row label='Enrichment remaining' value={`${nuclear.enrichmentPct}%`}
              valueColor={nuclear.enrichmentPct > 50 ? 'text-green-400' : nuclear.enrichmentPct > 20 ? 'text-orange-400' : 'text-red-400'}
              tip='Iran&apos;s ability to enrich uranium. Lower = more facilities destroyed.' />
          </div>
          <div className='mt-1'>
            <Bar pct={nuclear.enrichmentPct} color={nuclear.enrichmentPct < 30 ? 'bg-red-400' : nuclear.enrichmentPct < 60 ? 'bg-orange-400' : 'bg-green-400'} />
          </div>

          <Row label='Radiation risk' value={nuclear.radiationRisk.toUpperCase()}
            valueColor={nuclear.radiationRisk === 'high' ? 'text-red-500' : nuclear.radiationRisk === 'elevated' ? 'text-orange-400' : nuclear.radiationRisk === 'low' ? 'text-yellow-400' : 'text-green-400'}
            tip='Risk of radioactive contamination. High = immediate danger to nearby populations.' />

          <div className='text-sm text-zinc-400 mt-1 italic'>{nuclear.label}</div>

          {/* Historical comparison */}
          <div className='mt-3 pt-2 border-t border-zinc-800/50 space-y-1.5'>
            <div className='text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1'>Compared to History</div>
            {[
              { label: 'Three Mile Island (1979)', score: 25, color: 'bg-yellow-400' },
              { label: 'Fukushima (2011)', score: 55, color: 'bg-orange-400' },
              { label: 'Chernobyl (1986)', score: 75, color: 'bg-red-400' },
              { label: 'Cuban Missile Crisis (1962)', score: 92, color: 'bg-red-600' },
              { label: 'Current situation', score: peril.nuclearScore, color: 'bg-green-400' },
            ].map((h) => (
              <div key={h.label}>
                <div className='flex items-center justify-between text-xs mb-0.5'>
                  <span className={h.label === 'Current situation' ? 'text-white font-bold' : 'text-zinc-400'}>{h.label}</span>
                  <span className={`tabular-nums ${h.label === 'Current situation' ? 'text-white font-bold' : 'text-zinc-500'}`}>{h.score}/100</span>
                </div>
                <Bar pct={h.score} color={h.color} height='h-1.5' />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PERIL INDEX ── */}
      <div className='px-4 pt-3 pb-3 border-b border-zinc-700'>
        <SectionTitle icon={<IconAlertTriangle className='h-5 w-5' style={{ color: peril.color }} />} title='Peril Index' />
        <div className='flex items-baseline gap-2'>
          <span className='text-3xl font-black tabular-nums' style={{ color: peril.color }}>{peril.score}</span>
          <span className='text-lg font-bold' style={{ color: peril.color }}>/100</span>
          <span className='text-base font-black uppercase tracking-wide ml-1' style={{ color: peril.color }}>{peril.label}</span>
        </div>

        <div className='mt-2 space-y-0.5'>
          <Row label='Nuclear risk' value={`${peril.nuclearScore}/100`} sub='40% of score'
            tip='Based on facilities destroyed, enrichment capability, and radiation risk' />
          <Row label='Supply disruption' value={`${peril.supplyScore}/100`} sub='35% of score'
            tip='Based on oil production offline + shipping chokepoints blocked' />
          <Row label='Escalation tempo' value={`${peril.escalationScore}/100`} sub='25% of score'
            tip='Based on event frequency, severity of recent events, and total conflict scale' />
        </div>

        {/* Historical anchors */}
        <div className='mt-3 pt-2 border-t border-zinc-800/50 space-y-1.5'>
          {HISTORICAL_ANCHORS.map((a) => (
            <div key={a.label}>
              <div className='flex items-center justify-between text-xs mb-0.5'>
                <span className='text-zinc-400'>{a.label} ({a.year})</span>
                <span className='text-zinc-500 tabular-nums'>{a.score}/100</span>
              </div>
              <Bar pct={a.score} color='bg-zinc-600' height='h-1.5' />
            </div>
          ))}
          <div>
            <div className='flex items-center justify-between text-xs mb-0.5'>
              <span className='text-white font-bold'>Current</span>
              <span className='text-white font-bold tabular-nums'>{peril.score}/100</span>
            </div>
            <Bar pct={peril.score} color='bg-orange-500' height='h-1.5' />
          </div>
        </div>
      </div>

      {/* ── SUPPLY DISRUPTION ── */}
      <div className='px-4 pt-3 pb-3 border-b border-zinc-700'>
        <SectionTitle icon={<IconAlertTriangle className='h-5 w-5 text-red-400' />} title='Global Oil Supply' />

        <div className={`inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border mb-2 ${disruptionBg}`}>
          {supply.level}
        </div>

        <div className='space-y-0.5'>
          <Row label='Production offline' value={`${supply.productionPct.toFixed(1)}%`} valueColor={disruptionColor}
            tip='Percentage of global oil production (100M BPD) currently offline from facility damage' />
          <Row label='Barrels/day offline' value={`${(supply.productionBPDOffline / 1_000_000).toFixed(1)}M BPD`}
            tip='Millions of barrels per day no longer being produced' />
          <Row label='Facilities hit' value={String(supply.facilitiesHit)}
            tip='Number of oil/gas facilities damaged or destroyed by strikes' />
        </div>
        <div className='mt-1'>
          <Bar pct={supply.productionPct * 4} color={supply.level === 'catastrophe' ? 'bg-red-500' : supply.level === 'crisis' ? 'bg-red-400' : 'bg-orange-400'} />
        </div>

        {/* Chokepoints */}
        {supply.chokepoints.length > 0 && (
          <div className='mt-3 pt-2 border-t border-zinc-800/50 space-y-2'>
            <div className='text-xs text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1.5'>
              <IconShip className='h-4 w-4' />
              Shipping Chokepoints
            </div>
            {supply.chokepoints.map((cp) => (
              <div key={cp.id} className='rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-2.5'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-zinc-200 font-medium'>
                    {cp.id === 'strait-of-hormuz' ? 'Strait of Hormuz' : 'Bab el-Mandeb'}
                  </span>
                  <span className={`text-sm font-black tabular-nums ${cp.blockedPct >= 60 ? 'text-red-400' : cp.blockedPct >= 30 ? 'text-orange-400' : 'text-amber-400'}`}>
                    {cp.blockedPct}% blocked
                  </span>
                </div>
                <Bar pct={cp.blockedPct} color={cp.blockedPct >= 60 ? 'bg-red-400' : cp.blockedPct >= 30 ? 'bg-orange-400' : 'bg-amber-400'} height='h-1.5' />
                <div className='text-xs text-zinc-500 mt-1'>
                  {(cp.capacityBPD / 1_000_000).toFixed(1)}M BPD capacity — {(cp.blockedBPD / 1_000_000).toFixed(1)}M blocked
                </div>
              </div>
            ))}
            <Row label='Global transit disrupted' value={`${supply.transitBlockedPct.toFixed(1)}%`} valueColor='text-red-400'
              tip='Percentage of global oil that normally flows through these straits that is now blocked' />
          </div>
        )}

        <InfoBox>
          {supply.level === 'catastrophe'
            ? 'Multiple major facilities destroyed and shipping lanes blocked. This exceeds the 1973 oil embargo. Gas stations may run dry.'
            : supply.level === 'crisis'
            ? 'Significant infrastructure offline. This is like the 2019 Saudi Aramco attack — but sustained and across multiple countries.'
            : 'Global oil supply under pressure. Prices rise as available supply shrinks.'}
        </InfoBox>
      </div>

      {/* ── EMISSIONS ── */}
      <div className='px-4 pt-3 pb-3 border-b border-zinc-700'>
        <SectionTitle icon={<IconCloud className='h-5 w-5 text-orange-400' />} title='Emissions' />
        {totalCO2 > 0 ? (
          <div className='text-2xl font-black text-orange-400 tabular-nums leading-tight'>
            {formatCO2(totalCO2)} <span className='text-base font-bold'>tons/day CO2</span>
          </div>
        ) : (
          <div className='text-lg font-black text-zinc-600'>{loading ? '...' : '—'}</div>
        )}

        {totalCO2 > 0 && (
          <div className='mt-2 space-y-0.5'>
            <Row label='Same as this many cars (yearly)' value={equiv.carsPerYear.toLocaleString()} valueColor='text-zinc-200'
              tip='Each car emits ~4.6 tons CO2/year. This is how many cars would match these daily emissions over a full year.' />
            <Row label='Same as this many homes (yearly)' value={equiv.homesPerYear.toLocaleString()} valueColor='text-zinc-200'
              tip='Average US home produces ~7.5 tons CO2/year from energy use.' />
            <Row label='% of global daily emissions' value={`${equiv.percentGlobalDaily}%`} valueColor='text-zinc-200'
              tip='The world emits ~100 million tons of CO2 per day.' />
          </div>
        )}

        <div className='mt-3 pt-2 border-t border-zinc-800/50'>
          <Link href='/dashboard/fires' className='flex items-center justify-between rounded-lg bg-zinc-800/40 border border-zinc-700/50 p-2.5 hover:bg-zinc-800 transition-colors'>
            <div className='flex items-center gap-4 text-sm'>
              <span className='flex items-center gap-1.5 text-orange-500'>
                <IconFlame className='h-4 w-4' />
                <span className='font-bold tabular-nums'>{loading ? '...' : activeFires} active</span>
              </span>
              <span className='flex items-center gap-1.5 text-yellow-400'>
                <IconWorld className='h-4 w-4' />
                <span className='font-bold tabular-nums'>{curatedFires.length} tracked</span>
              </span>
            </div>
            <span className='text-sm text-blue-400 font-medium'>View map →</span>
          </Link>
        </div>
      </div>

      {/* spacer for scrubber */}
      <div className='h-8' />
    </div>
  );
}
