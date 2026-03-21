'use client';

import { useMemo, useState } from 'react';
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

function formatBillions(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}T`;
  if (n >= 100) return `$${n.toFixed(0)}B`;
  return `$${n.toFixed(1)}B`;
}

/* ── Reusable data row with optional tooltip (click to expand) ── */
function Row({ label, value, valueColor, tip, sub }: {
  label: string; value: string; valueColor?: string; tip?: string; sub?: string;
}) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div>
      <div className='flex items-center justify-between py-0.5'>
        <span className='text-sm text-gray-600 dark:text-zinc-300 flex items-center gap-1'>
          {label}
          {tip && (
            <button
              onClick={() => setShowTip(!showTip)}
              className='p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer'
              aria-label='More info'
            >
              <IconInfoCircle className={`h-3.5 w-3.5 transition-colors ${showTip ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-600'}`} />
            </button>
          )}
        </span>
        <span className={`text-sm font-bold tabular-nums ${valueColor || 'text-gray-900 dark:text-white'}`}>{value}</span>
      </div>
      {showTip && tip && (
        <div className='text-xs text-gray-600 dark:text-zinc-400 bg-blue-50 dark:bg-zinc-800/60 border border-blue-100 dark:border-zinc-700/50 rounded-lg px-2.5 py-2 mb-1 leading-relaxed'>
          {tip}
        </div>
      )}
      {sub && <div className='text-xs text-gray-400 dark:text-zinc-500 -mt-0.5 mb-0.5'>{sub}</div>}
    </div>
  );
}

/* ── Info box for context/connection ── */
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className='mt-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-zinc-800/50 border border-amber-200 dark:border-zinc-700/50'>
      <div className='text-xs text-gray-700 dark:text-zinc-400 leading-relaxed'>{children}</div>
    </div>
  );
}

/* ── Progress bar ── */
function Bar({ pct, color, height }: { pct: number; color: string; height?: string }) {
  return (
    <div className={`w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden ${height || 'h-2.5'}`}>
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

/* ── Section header ── */
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className='flex items-center gap-2 mb-2'>
      {icon}
      <span className='text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-500 font-extrabold'>{title}</span>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className='rounded-xl bg-white dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700/50 p-3 shadow-sm mb-2'>
      {children}
    </div>
  );
}

export default function DeepDivePanel({ onMapMode }: { onMapMode?: () => void } = {}) {
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

    // Recession probability — composite from oil price spike, supply disruption, inflation, war cost
    const oilSpikePct = Math.min(100, ((impact.oilPriceBbl - 75) / 75) * 100); // baseline $75
    const supplyRisk = Math.min(100, supply.productionPct * 5);
    const inflationPressure = Math.min(100, impact.groceryInflationPct * 4);
    const warCostDrag = Math.min(100, (cost.totalBillions / 2000) * 100);
    const shippingStress = Math.min(100, impact.shippingSurchargePct);
    const recessionScore = Math.round(
      oilSpikePct * 0.30 + supplyRisk * 0.25 + inflationPressure * 0.20 + warCostDrag * 0.15 + shippingStress * 0.10
    );
    const recession = {
      score: Math.min(99, Math.max(0, recessionScore)),
      oilSpikePct: Math.round(oilSpikePct),
      supplyRisk: Math.round(supplyRisk),
      inflationPressure: Math.round(inflationPressure),
      warCostDrag: Math.round(warCostDrag),
      shippingStress: Math.round(shippingStress),
    };

    return { impact, casualties, nuclear, cost, supply, events, stats, peril, gasExtra, oilDelta, perTaxpayer, warDays, recession };
  }, [timelineDate]);

  const { impact, casualties, nuclear, cost, supply, stats, peril, gasExtra, oilDelta, perTaxpayer, warDays, recession } = data;
  const totalCO2 = fireData.features.reduce((s, f) => s + f.properties.estimatedCO2TonsDay, 0);
  const equiv = co2Equivalents(totalCO2);
  const activeFires = fireData.features.length;
  const displayDate = new Date(timelineDate + 'T00:00:00');
  const dateFormatted = displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const populationKilled = casualties.totalKilled >= 50000 ? 'a small city' : casualties.totalKilled >= 10000 ? 'a small town' : 'a neighborhood';
  const annualCostPerHousehold = impact.totalMonthlyExtra * 12;

  const disruptionLabels: Record<string, string> = {
    normal: 'NORMAL', mild: 'MILD', severe: 'SEVERE', crisis: 'CRISIS', catastrophe: 'CATASTROPHE',
  };
  const disruptionBadge: Record<string, string> = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    mild: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    severe: 'bg-orange-100 text-orange-800 border-orange-200',
    crisis: 'bg-orange-200 text-orange-900 border-orange-300',
    catastrophe: 'bg-orange-300 text-orange-950 border-orange-400 animate-pulse',
  };

  return (
    <div className='h-full overflow-y-auto bg-gray-50 dark:bg-zinc-950 pb-20'>

      {/* ── DATE HEADER ── */}
      <div className='px-4 pt-4 pb-3 bg-white dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-700'>
        <div className='text-xl font-black text-gray-900 dark:text-white leading-tight'>
          {dateFormatted}
        </div>
        <div className='flex items-center gap-3 mt-1.5'>
          <div className='flex items-center gap-1.5'>
            <IconClock className='h-4 w-4 text-gray-400 dark:text-zinc-500' />
            <span className='text-base font-extrabold text-gray-800 dark:text-zinc-200 tabular-nums'>Day {warDays.toLocaleString()}</span>
          </div>
          <span className='text-gray-300 dark:text-zinc-700'>|</span>
          <span className='text-sm text-gray-500'>{stats.totalEvents} events</span>
          <span className='text-gray-300 dark:text-zinc-700'>|</span>
          <span className='text-sm text-blue-600 dark:text-blue-400 font-bold'>{stats.eventsLast7} this week</span>
        </div>
      </div>

      {/* ── HUMAN COST ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconSkull className='h-5 w-5 text-red-600' />} title='Human Cost' />
        <div className='text-4xl font-black text-red-600 dark:text-red-500 tabular-nums leading-none'>
          {casualties.totalKilled.toLocaleString()}+
        </div>
        <div className='text-base text-red-500 dark:text-red-400 font-bold mt-1 mb-3'>people killed</div>

        <div className='space-y-1'>
          <Row label='Injured' value={`${casualties.totalInjured.toLocaleString()}+`} valueColor='text-orange-600 dark:text-orange-400'
            tip='Includes military and civilian injuries reported by all sides' />
          {casualties.totalChildren > 0 && (
            <Row label='Children killed' value={`${casualties.totalChildren.toLocaleString()}+`} valueColor='text-red-500 dark:text-red-300'
              tip='Children under 18 confirmed killed — likely undercounted' />
          )}
          {casualties.totalDisplaced > 0 && (
            <Row label='Displaced from homes' value={`${(casualties.totalDisplaced / 1_000_000).toFixed(1)}M`} valueColor='text-blue-600 dark:text-blue-400'
              tip='People forced to leave their homes, many multiple times' />
          )}
        </div>

        {Object.keys(casualties.byParty).length > 0 && (
          <div className='mt-3 pt-2 border-t border-gray-200 dark:border-zinc-800/50 space-y-1.5'>
            <div className='text-xs text-gray-500 uppercase tracking-wider font-extrabold mb-1'>Casualties Attributed to Military Operations</div>
            {Object.entries(casualties.byParty)
              .sort((a, b) => b[1].killed - a[1].killed)
              .map(([party, d]) => {
                const pct = casualties.totalKilled > 0 ? ((d.killed / casualties.totalKilled) * 100).toFixed(1) : '0';
                return (
                  <div key={party}>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-700 dark:text-zinc-300'>{party}</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-gray-900 dark:text-zinc-100 tabular-nums'>{d.killed.toLocaleString()}</span>
                        <span className='text-[10px] text-gray-400 tabular-nums w-10 text-right'>({pct}%)</span>
                      </div>
                    </div>
                    {d.injured > 0 && (
                      <div className='text-xs text-gray-400 tabular-nums ml-0.5'>{d.injured.toLocaleString()} injured · {d.displaced > 0 ? `${(d.displaced / 1_000_000).toFixed(1)}M displaced` : ''}</div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <InfoBox>
          That&apos;s the population of {populationKilled}. Every number is someone&apos;s parent, child, or neighbor.
          {casualties.totalDisplaced > 0 && ` ${(casualties.totalDisplaced / 1_000_000).toFixed(1)} million people have nowhere to go home to.`}
        </InfoBox>
      </div>

      {/* ── YOUR HOUSEHOLD COST ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconReceipt className='h-5 w-5 text-green-700 dark:text-green-500' />} title='Cost to Your Household' />
        <div className='text-4xl font-black text-green-800 dark:text-green-400 tabular-nums leading-none'>
          +${impact.totalMonthlyExtra}
        </div>
        <div className='text-base text-green-700 dark:text-green-300 font-bold mt-1'>extra per month</div>
        <div className='text-sm text-gray-500 mb-3'>That&apos;s <strong className='text-green-800 dark:text-green-200'>${annualCostPerHousehold.toLocaleString()}/year</strong> more than before the war</div>

        {/* Gas */}
        <StatCard>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='flex items-center gap-2 text-base font-bold text-gray-800 dark:text-zinc-200'>
              <IconGasStation className='h-5 w-5 text-orange-600' />
              Gas Price
            </span>
            <span className='text-2xl font-black text-orange-700 dark:text-orange-400 tabular-nums'>${impact.gasPriceGallon.toFixed(2)}</span>
          </div>
          <div className='text-xs text-gray-500 mb-1'>per gallon</div>
          <Bar pct={(impact.gasPriceGallon / 8) * 100} color='bg-orange-500' />
          <div className='flex items-center justify-between mt-1.5 text-sm'>
            <span className='text-gray-500'>Before war: ${BASELINE.gasPriceGallon.toFixed(2)}</span>
            <span className='text-gray-500'>2008 peak: $4.11</span>
          </div>
          <div className='text-sm text-orange-700 dark:text-orange-300 font-bold mt-1'>
            That&apos;s +${gasExtra.toFixed(0)}/month extra at the pump
          </div>
        </StatCard>

        {/* Groceries */}
        <StatCard>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='flex items-center gap-2 text-base font-bold text-gray-800 dark:text-zinc-200'>
              <IconShoppingCart className='h-5 w-5 text-amber-600' />
              Groceries
            </span>
            <span className='text-2xl font-black text-amber-700 dark:text-amber-400 tabular-nums'>+{impact.groceryInflationPct}%</span>
          </div>
          <Bar pct={impact.groceryInflationPct * 3} color='bg-amber-500' />
          <div className='text-sm text-gray-600 dark:text-zinc-400 mt-1.5'>
            <strong className='text-amber-700 dark:text-amber-300'>+${impact.monthlyGroceryExtra}/mo</strong> extra for a family of 4
          </div>
          <div className='text-xs text-gray-500 mt-0.5'>
            Oil up → fertilizer up → trucking up → your eggs, milk, and bread cost more
          </div>
        </StatCard>

        {/* Home Energy */}
        <StatCard>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='flex items-center gap-2 text-base font-bold text-gray-800 dark:text-zinc-200'>
              <IconBolt className='h-5 w-5 text-yellow-600' />
              Home Energy
            </span>
            <span className='text-2xl font-black text-yellow-700 dark:text-yellow-400 tabular-nums'>+${impact.monthlyUtilityExtra}</span>
          </div>
          <div className='text-xs text-gray-500 mb-1'>extra per month</div>
          <Bar pct={(impact.natGasMMBtu / 25) * 100} color='bg-yellow-500' />
          <div className='text-sm text-gray-600 dark:text-zinc-400 mt-1.5'>
            Natural gas: <strong>${impact.natGasMMBtu.toFixed(1)}/MMBtu</strong> (was ${BASELINE.natGasMMBtu.toFixed(1)})
          </div>
          {impact.natGasMMBtu > 12 && (
            <div className='text-sm text-green-800 dark:text-green-300 font-bold mt-1'>
              Qatar&apos;s Ras Laffan destroyed — 17% of global LNG gone
            </div>
          )}
        </StatCard>

        {/* Shipping */}
        <StatCard>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='flex items-center gap-2 text-base font-bold text-gray-800 dark:text-zinc-200'>
              <IconPackage className='h-5 w-5 text-blue-600' />
              Shipping &amp; Delivery
            </span>
            <span className='text-2xl font-black text-blue-700 dark:text-blue-400 tabular-nums'>+{impact.shippingSurchargePct}%</span>
          </div>
          <Bar pct={impact.shippingSurchargePct} color='bg-blue-500' />
          <div className='text-sm text-gray-600 dark:text-zinc-400 mt-1.5'>
            Your packages take <strong className='text-blue-700 dark:text-blue-300'>+{impact.deliveryDelayDays} days</strong> longer
          </div>
          <div className='text-xs text-gray-500 mt-0.5'>
            Ships reroute around Africa instead of through Suez/Hormuz — adds weeks
          </div>
        </StatCard>

        {/* Oil price */}
        <StatCard>
          <div className='flex items-center justify-between'>
            <span className='text-base font-bold text-gray-800 dark:text-zinc-200'>Oil (Brent crude)</span>
            <span className='text-2xl font-black text-gray-900 dark:text-white tabular-nums'>${impact.oilPriceBbl}/bbl</span>
          </div>
          <div className='flex items-center justify-between mt-1 text-sm'>
            <span className='text-gray-500'>Before: ${BASELINE.oilPriceBbl}/bbl</span>
            <span className='text-green-700 dark:text-green-400 font-bold'>+${oilDelta > 0 ? oilDelta.toFixed(0) : '0'}/barrel</span>
          </div>
        </StatCard>

        <InfoBox>{impact.headline}</InfoBox>
      </div>

      {/* ── COST OF WAR ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconBomb className='h-5 w-5 text-gray-700 dark:text-white' />} title='Cost of War' />
        <div className='text-4xl font-black text-gray-900 dark:text-white tabular-nums leading-none'>
          {formatBillions(cost.totalBillions)}
        </div>
        <div className='text-base text-gray-600 font-bold mt-1 mb-3'>total economic cost</div>

        <div className='space-y-1'>
          <Row label='Weapons & military' value={formatBillions(cost.weaponsBillions)} valueColor='text-gray-900 dark:text-zinc-100'
            tip='Missiles, carriers, military aid, Iron Dome — your tax dollars' />
          <Row label='Infrastructure destroyed' value={formatBillions(cost.resourcesBillions)} valueColor='text-blue-700 dark:text-blue-400'
            tip='Oil fields, gas plants, nuclear sites, refineries — gone forever' />
          <Row label='Economic / inflation' value={formatBillions(cost.economicBillions)} valueColor='text-yellow-700 dark:text-yellow-400'
            tip='Higher prices on everything — oil, shipping, insurance, food' />
        </div>

        <StatCard>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-2 text-base text-gray-700 dark:text-zinc-200'>
              <IconUsers className='h-5 w-5 text-gray-600' />
              Your share (per taxpayer)
            </span>
            <span className='text-2xl font-black text-gray-900 dark:text-white tabular-nums'>${perTaxpayer.toLocaleString()}</span>
          </div>
          <div className='flex items-center justify-between mt-1'>
            <span className='flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300'>
              <IconHome className='h-4 w-4 text-gray-500' />
              Per household
            </span>
            <span className='text-lg font-bold text-gray-800 dark:text-zinc-200 tabular-nums'>${Math.round(perTaxpayer * 2.5).toLocaleString()}</span>
          </div>
        </StatCard>

        <InfoBox>
          {cost.totalBillions >= 1000
            ? `$${(cost.totalBillions / 1000).toFixed(1)} trillion — that's more than the entire US education budget. About $${Math.round(cost.totalBillions * 1e9 / 365 / 1_000_000).toLocaleString()}M every single day.`
            : `$${cost.totalBillions.toFixed(0)}B and climbing. About $1 billion per day. That could pay 50,000 teachers instead.`}
        </InfoBox>
      </div>

      {/* ── NUCLEAR THREAT ── */}
      {nuclear && (
        <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
          <SectionTitle icon={<IconRadioactive className='h-5 w-5 text-green-600' />} title='Nuclear Threat' />

          <div className='space-y-1'>
            <Row label='Facilities targeted' value={`${nuclear.facilitiesTargeted} of 6`}
              tip='Natanz, Fordow, Isfahan, Arak, Bushehr, Tehran Research Reactor' />
            <Row label='Facilities destroyed' value={`${nuclear.facilitiesDestroyed} of 6`} valueColor='text-orange-700 dark:text-orange-400' />
            <Row label='Enrichment remaining' value={`${nuclear.enrichmentPct}%`}
              valueColor={nuclear.enrichmentPct > 50 ? 'text-green-700 dark:text-green-400' : nuclear.enrichmentPct > 20 ? 'text-orange-700 dark:text-orange-400' : 'text-orange-800 dark:text-orange-300'}
              tip="Iran's ability to enrich uranium. Lower = more destroyed." />
          </div>
          <div className='mt-1.5'>
            <Bar pct={nuclear.enrichmentPct} color={nuclear.enrichmentPct < 30 ? 'bg-orange-600' : nuclear.enrichmentPct < 60 ? 'bg-orange-500' : 'bg-green-500'} />
          </div>

          <Row label='Radiation risk' value={nuclear.radiationRisk.toUpperCase()}
            valueColor={nuclear.radiationRisk === 'high' ? 'text-orange-800 dark:text-orange-400' : nuclear.radiationRisk === 'elevated' ? 'text-orange-700 dark:text-orange-400' : 'text-yellow-700 dark:text-yellow-400'}
            tip='Risk of radioactive contamination to nearby populations' />

          <div className='text-sm text-gray-500 dark:text-zinc-400 mt-1 italic'>{nuclear.label}</div>

          <div className='mt-3 pt-2 border-t border-gray-200 dark:border-zinc-800/50 space-y-2'>
            <div className='text-xs text-gray-500 uppercase tracking-wider font-extrabold mb-1'>How does this compare?</div>
            {[
              { label: 'Three Mile Island (1979)', score: 25, color: 'bg-yellow-400' },
              { label: 'Fukushima (2011)', score: 55, color: 'bg-orange-400' },
              { label: 'Chernobyl (1986)', score: 75, color: 'bg-red-400' },
              { label: 'Cuban Missile Crisis (1962)', score: 92, color: 'bg-red-600' },
              { label: 'RIGHT NOW', score: peril.nuclearScore, color: 'bg-green-500' },
            ].map((h) => (
              <div key={h.label}>
                <div className='flex items-center justify-between text-sm mb-0.5'>
                  <span className={h.label === 'RIGHT NOW' ? 'text-gray-900 dark:text-white font-black' : 'text-gray-600 dark:text-zinc-400'}>{h.label}</span>
                  <span className={`tabular-nums ${h.label === 'RIGHT NOW' ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400'}`}>{h.score}</span>
                </div>
                <Bar pct={h.score} color={h.color} height='h-2' />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECESSION & ECONOMIC RISK INDEX ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconTrendingUp className='h-5 w-5 text-blue-600' />} title='Recession Probability Index' />
        <div className='flex items-baseline gap-2'>
          <span className={`text-4xl font-black tabular-nums ${recession.score >= 70 ? 'text-red-600' : recession.score >= 40 ? 'text-orange-600' : 'text-blue-600'}`}>
            {recession.score}%
          </span>
          <span className={`text-lg font-black uppercase tracking-wide ${
            recession.score >= 70 ? 'text-red-500' : recession.score >= 40 ? 'text-orange-500' : 'text-blue-500'
          }`}>
            {recession.score >= 80 ? 'DEPRESSION RISK' : recession.score >= 60 ? 'HIGH RISK' : recession.score >= 40 ? 'ELEVATED' : recession.score >= 20 ? 'MODERATE' : 'LOW'}
          </span>
        </div>
        <div className='text-sm text-gray-500 mt-1 mb-3'>Likelihood of US recession within 12 months based on conflict-driven economic stress</div>

        <div className='space-y-1'>
          <Row label='Oil price shock' value={`${recession.oilSpikePct}/100`} sub='30% weight'
            tip='How far oil has spiked above $75/bbl baseline. Every $10 increase historically adds 0.3% to recession odds.' />
          <Row label='Supply chain stress' value={`${recession.supplyRisk}/100`} sub='25% weight'
            tip='Oil production offline and chokepoint disruptions. When >10% of global supply is disrupted, recessions follow within 6-12 months.' />
          <Row label='Inflationary pressure' value={`${recession.inflationPressure}/100`} sub='20% weight'
            tip='Grocery and consumer price inflation driven by energy costs. Rising food prices erode consumer spending — the engine of 70% of GDP.' />
          <Row label='War spending drag' value={`${recession.warCostDrag}/100`} sub='15% weight'
            tip='Military spending diverted from productive economy. Each $100B in war cost = ~0.5% GDP drag.' />
          <Row label='Shipping disruption' value={`${recession.shippingStress}/100`} sub='10% weight'
            tip='Shipping surcharges and delays. Rerouting around conflict zones adds weeks and billions in logistics costs.' />
        </div>

        <div className='mt-2'>
          <Bar pct={recession.score} color={recession.score >= 70 ? 'bg-red-500' : recession.score >= 40 ? 'bg-orange-500' : 'bg-blue-500'} />
        </div>

        <InfoBox>
          {recession.score >= 70
            ? 'Multiple recession indicators are flashing red. The 1973 oil embargo caused a 3.2% GDP contraction — current conditions are comparable or worse.'
            : recession.score >= 40
            ? 'Economic stress is building. The combination of energy costs and supply disruption historically precedes downturns within 6-12 months.'
            : 'Economic impact is present but manageable. Consumer spending is absorbing the shocks — for now.'}
        </InfoBox>
      </div>

      {/* ── CATASTROPHE INDEX ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconAlertTriangle className='h-5 w-5' style={{ color: peril.color }} />} title='Catastrophe Index' />
        <div className='flex items-baseline gap-2'>
          <span className='text-4xl font-black tabular-nums' style={{ color: peril.color }}>{peril.score}</span>
          <span className='text-xl font-bold text-gray-400'>/100</span>
          <span className='text-lg font-black uppercase tracking-wide ml-2' style={{ color: peril.color }}>{peril.label}</span>
        </div>

        <div className='mt-3 space-y-1'>
          <Row label='Nuclear risk' value={`${peril.nuclearScore}/100`} sub='40% of score'
            tip='Facilities destroyed + enrichment gone + radiation risk' />
          <Row label='Supply disruption' value={`${peril.supplyScore}/100`} sub='35% of score'
            tip='Oil offline + shipping chokepoints blocked' />
          <Row label='Escalation tempo' value={`${peril.escalationScore}/100`} sub='25% of score'
            tip='How fast things are getting worse — event frequency and severity' />
        </div>

        <div className='mt-3 pt-2 border-t border-gray-200 dark:border-zinc-800/50 space-y-2'>
          {HISTORICAL_ANCHORS.map((a) => (
            <div key={a.label}>
              <div className='flex items-center justify-between text-sm mb-0.5'>
                <span className='text-gray-600 dark:text-zinc-400'>{a.label} ({a.year})</span>
                <span className='text-gray-400 tabular-nums'>{a.score}</span>
              </div>
              <Bar pct={a.score} color='bg-gray-400 dark:bg-zinc-600' height='h-2' />
            </div>
          ))}
          <div>
            <div className='flex items-center justify-between text-sm mb-0.5'>
              <span className='text-gray-900 dark:text-white font-black'>RIGHT NOW</span>
              <span className='font-black tabular-nums' style={{ color: peril.color }}>{peril.score}</span>
            </div>
            <Bar pct={peril.score} color='bg-orange-500' height='h-2' />
          </div>
        </div>
      </div>

      {/* ── SUPPLY DISRUPTION ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconAlertTriangle className='h-5 w-5 text-blue-600' />} title='Global Oil Supply' />

        <div className={`inline-block px-3 py-1 rounded-md text-sm font-black uppercase tracking-wider border mb-2 ${disruptionBadge[supply.level] || disruptionBadge.normal}`}>
          {disruptionLabels[supply.level] || 'NORMAL'}
        </div>

        <div className='space-y-1'>
          <Row label='Production offline' value={`${supply.productionPct.toFixed(1)}%`} valueColor='text-blue-700 dark:text-blue-400'
            tip='How much of the world&apos;s 100M barrels/day is offline' />
          <Row label='Barrels/day offline' value={`${(supply.productionBPDOffline / 1_000_000).toFixed(1)}M BPD`}
            tip='Millions of barrels per day no longer being produced' />
          <Row label='Facilities hit' value={String(supply.facilitiesHit)}
            tip='Number of oil/gas facilities damaged or destroyed' />
        </div>
        <div className='mt-1.5'>
          <Bar pct={supply.productionPct * 4} color={supply.level === 'catastrophe' ? 'bg-orange-700' : supply.level === 'crisis' ? 'bg-orange-600' : 'bg-orange-500'} />
        </div>

        {supply.chokepoints.length > 0 && (
          <div className='mt-3 pt-2 border-t border-gray-200 dark:border-zinc-800/50 space-y-2'>
            <div className='text-xs text-gray-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5'>
              <IconShip className='h-4 w-4' />
              Shipping Chokepoints
            </div>
            {supply.chokepoints.map((cp) => (
              <StatCard key={cp.id}>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-base font-bold text-gray-800 dark:text-zinc-200'>
                    {cp.id === 'strait-of-hormuz' ? 'Strait of Hormuz' : 'Bab el-Mandeb'}
                  </span>
                  <span className={`text-lg font-black tabular-nums ${cp.blockedPct >= 60 ? 'text-orange-800 dark:text-orange-400' : cp.blockedPct >= 30 ? 'text-orange-700 dark:text-orange-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {cp.blockedPct}%
                  </span>
                </div>
                <Bar pct={cp.blockedPct} color={cp.blockedPct >= 60 ? 'bg-orange-600' : cp.blockedPct >= 30 ? 'bg-orange-500' : 'bg-amber-500'} height='h-2' />
                <div className='text-xs text-gray-500 mt-1'>
                  {(cp.capacityBPD / 1_000_000).toFixed(1)}M BPD capacity — {(cp.blockedBPD / 1_000_000).toFixed(1)}M blocked
                </div>
              </StatCard>
            ))}
            <Row label='Global transit disrupted' value={`${supply.transitBlockedPct.toFixed(1)}%`} valueColor='text-blue-700 dark:text-blue-400' />
          </div>
        )}

        <InfoBox>
          {supply.level === 'catastrophe'
            ? 'This is worse than the 1973 oil embargo. Gas stations may run dry. Rationing is being discussed.'
            : supply.level === 'crisis'
            ? 'Like the 2019 Saudi Aramco attack — but sustained across multiple countries simultaneously.'
            : 'Global oil supply under pressure. Every barrel offline means higher prices at the pump.'}
        </InfoBox>
      </div>

      {/* ── EMISSIONS ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconCloud className='h-5 w-5 text-orange-600' />} title='Emissions' />
        {totalCO2 > 0 ? (
          <div className='text-3xl font-black text-orange-700 dark:text-orange-400 tabular-nums leading-none'>
            {formatCO2(totalCO2)} <span className='text-lg font-bold'>tons/day</span>
          </div>
        ) : (
          <div className='text-lg font-black text-gray-400'>{loading ? '...' : '—'}</div>
        )}

        {totalCO2 > 0 && (
          <div className='mt-2 space-y-1'>
            <Row label='Same CO2 as this many cars (yearly)' value={equiv.carsPerYear.toLocaleString()}
              tip='Each car emits ~4.6 tons CO2/year' />
            <Row label='Same as this many homes (yearly)' value={equiv.homesPerYear.toLocaleString()}
              tip='Average US home: ~7.5 tons CO2/year' />
            <Row label='% of global daily emissions' value={`${equiv.percentGlobalDaily}%`}
              tip='The world emits ~100 million tons of CO2 per day' />
          </div>
        )}

        <div className='mt-3 pt-2 border-t border-gray-200 dark:border-zinc-800/50'>
          <button
            onClick={onMapMode}
            className='w-full flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700/50 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
          >
            <div className='flex items-center gap-4 text-sm'>
              <span className='flex items-center gap-1.5 text-orange-600'>
                <IconFlame className='h-4 w-4' />
                <span className='font-bold tabular-nums'>{loading ? '...' : activeFires} active</span>
              </span>
              <span className='flex items-center gap-1.5 text-teal-600 dark:text-teal-400'>
                <IconWorld className='h-4 w-4' />
                <span className='font-bold tabular-nums'>{curatedFires.length} tracked</span>
              </span>
            </div>
            <span className='text-sm text-blue-600 dark:text-blue-400 font-bold'>View map →</span>
          </button>
        </div>
      </div>

      <div className='h-8' />
    </div>
  );
}
