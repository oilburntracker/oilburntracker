'use client';

import { useMemo, useState } from 'react';
import { useFireStore } from '@/stores/fire-store';
import { getConsumerImpactUpTo, BASELINE } from '@/features/impact/data/consumer-impact';
import { getCasualtiesUpTo, getNuclearStatusUpTo, getVisibleFacilityIds, getEventsUpTo, getRecentEventStats } from '@/features/timeline/data/conflict-events';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { getSupplyDisruptionUpTo, getInfrastructureDamageByCountry } from '@/features/fires/data/curated-fires';
import { curatedFires } from '@/features/fires/data/curated-fires';
import type { CountryDamageEntry, DamageClassification } from '@/features/fires/data/curated-fires';
import { formatCO2, co2Equivalents, FACILITY_PARAMS, estimateCO2FromCapacity, capacityBreakdown } from '@/features/emissions/utils/emissions-model';
import type { FacilityType } from '@/features/fires/data/curated-fires';
import { computePerilScore, HISTORICAL_ANCHORS } from '@/lib/peril-score';
import {
  IconGasStation, IconShoppingCart, IconBolt, IconPackage,
  IconRadioactive, IconBomb, IconCloud, IconAlertTriangle,
  IconSkull, IconFlame, IconWorld, IconBuildingSkyscraper,
  IconTrendingUp, IconReceipt, IconShip, IconClock, IconUsers, IconHome,
  IconInfoCircle, IconHeart, IconStethoscope, IconBook, IconCamera, IconSchool, IconFriends
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
      <div className='flex items-center justify-between py-1'>
        <span className='text-base text-gray-600 dark:text-zinc-300 flex items-center gap-1'>
          {label}
          {tip && (
            <button
              onClick={() => setShowTip(!showTip)}
              className='p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer'
              aria-label='More info'
            >
              <IconInfoCircle className={`h-4 w-4 transition-colors ${showTip ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-600'}`} />
            </button>
          )}
        </span>
        <span className={`text-base font-bold tabular-nums ${valueColor || 'text-gray-900 dark:text-white'}`}>{value}</span>
      </div>
      {showTip && tip && (
        <div className='text-sm text-gray-600 dark:text-zinc-400 bg-blue-50 dark:bg-zinc-800/60 border border-blue-100 dark:border-zinc-700/50 rounded-lg px-3 py-2.5 mb-1.5 leading-relaxed'>
          {tip}
        </div>
      )}
      {sub && <div className='text-sm text-gray-400 dark:text-zinc-500 -mt-0.5 mb-0.5'>{sub}</div>}
    </div>
  );
}

/* ── Info box for context/connection ── */
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className='mt-3 px-3 py-3 rounded-lg bg-amber-50 dark:bg-zinc-800/50 border border-amber-200 dark:border-zinc-700/50'>
      <div className='text-sm text-gray-700 dark:text-zinc-400 leading-relaxed'>{children}</div>
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

/* ── Collapsible sources/methodology dropdown ── */
function SourcesDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className='mt-2'>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors cursor-pointer'
      >
        <IconInfoCircle className='h-3.5 w-3.5' />
        <span>Sources &amp; methodology</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>&#9662;</span>
      </button>
      {open && (
        <div className='mt-1.5 px-1 space-y-1 text-xs text-gray-400 dark:text-zinc-600'>
          <div>Fire detection: <a href='https://firms.modaps.eosdis.nasa.gov/' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>NASA FIRMS VIIRS</a> (375m resolution, updated every 30 min)</div>
          <div>CO₂ factors: <a href='https://www.ipcc-nggip.iges.or.jp/public/2006gl/' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>IPCC 2006 Guidelines</a> Vol 2 · Crude oil NCV 42.3 GJ/t, EF 73,300 kg CO₂/TJ</div>
          <div>FRP method: Wooster et al. (2005) <a href='https://doi.org/10.1029/2005JD006318' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>doi:10.1029/2005JD006318</a></div>
          <div>Petroleum correction: Elvidge et al. (2020) <a href='https://doi.org/10.3390/rs12020238' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>doi:10.3390/rs12020238</a> — FRP underestimates petroleum fires ~2x</div>
          <div>EPA factors: <a href='https://www.epa.gov/ghgemissions/emission-factors-hub' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>EPA GHG Emission Factors Hub (2024)</a></div>
          <div>Equivalents: 4.6 t CO₂/car/yr (<a href='https://www.epa.gov/greenvehicles' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>EPA</a>) · 7.5 t CO₂/home/yr (<a href='https://www.eia.gov/consumption/residential/' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>EIA RECS</a>)</div>
          <div className='pt-1 text-gray-500 dark:text-zinc-500'>Formula: CO₂ (t/day) = FRP(MW) × 86400 / (f_rad × H_c) × EF / 1000. Hover any row above for the full calculation.</div>
          <div>Only fires geo-matched within facility radius are counted. These are order-of-magnitude estimates.</div>
        </div>
      )}
    </div>
  );
}

/* ── Section header ── */
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className='flex items-center gap-2 mb-2'>
      {icon}
      <span className='text-sm uppercase tracking-widest text-gray-500 dark:text-zinc-500 font-extrabold'>{title}</span>
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

/* ── Always-open prediction card — clean, credible ── */
function PredictionCard({ prediction: p }: { prediction: {
  scenario: string; probability: number; color: string;
  what: string; why: string; how: string; when: string;
  expect: { label: string; value: string; detail: string }[];
}}) {
  const barColor = p.probability >= 60 ? 'bg-red-500' : p.probability >= 35 ? 'bg-orange-500' : p.probability >= 15 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className='rounded-xl bg-white dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700/50 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='p-4'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xl font-black text-gray-900 dark:text-zinc-100 leading-tight'>{p.scenario}</span>
          <span className={`text-4xl font-black tabular-nums ${p.color} ml-3 shrink-0`}>{p.probability}%</span>
        </div>
        <Bar pct={p.probability} color={barColor} height='h-3' />
      </div>

      {/* Full analysis */}
      <div className='px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-zinc-800/50'>
        <div className='pt-3'>
          <div className='text-sm uppercase tracking-widest text-gray-400 font-extrabold mb-1.5'>What happens</div>
          <div className='text-base text-gray-700 dark:text-zinc-300 leading-relaxed'>{p.what}</div>
        </div>

        <div>
          <div className='text-sm uppercase tracking-widest text-gray-400 font-extrabold mb-1.5'>Why it&apos;s likely</div>
          <div className='text-base text-gray-700 dark:text-zinc-300 leading-relaxed'>{p.why}</div>
        </div>

        <div>
          <div className='text-sm uppercase tracking-widest text-gray-400 font-extrabold mb-1.5'>How it plays out</div>
          <div className='text-base text-gray-700 dark:text-zinc-300 leading-relaxed'>{p.how}</div>
        </div>

        <div>
          <div className='text-sm uppercase tracking-widest text-gray-400 font-extrabold mb-1.5'>Timeline</div>
          <div className='text-base text-gray-700 dark:text-zinc-300 leading-relaxed'>{p.when}</div>
        </div>

        <div>
          <div className='text-sm uppercase tracking-widest text-gray-400 font-extrabold mb-2'>What to expect</div>
          <div className='space-y-2'>
            {p.expect.map((e) => (
              <div key={e.label} className='rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800/50 px-3 py-2.5'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-bold text-gray-700 dark:text-zinc-300'>{e.label}</span>
                  <span className={`text-lg font-black tabular-nums ${p.color}`}>{e.value}</span>
                </div>
                <div className='text-sm text-gray-500 dark:text-zinc-500 mt-0.5 leading-relaxed'>{e.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Facility damage card ── */
function FacilityCard({ facility, hit }: { facility: (typeof curatedFires)[number]; hit: boolean }) {
  const [open, setOpen] = useState(false);
  const statusCfg: Record<string, { label: string; cls: string; pulse?: boolean }> = {
    active_fire: { label: 'ON FIRE', cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', pulse: true },
    damaged: { label: 'DAMAGED', cls: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
    offline: { label: 'OFFLINE', cls: 'bg-gray-200 dark:bg-zinc-700/50 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-zinc-600' },
    monitoring: { label: 'THREATENED', cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
    operational: { label: 'OK', cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
  };
  const typeLabel: Record<string, string> = {
    refinery: 'Refinery', lng_terminal: 'LNG Terminal', pipeline: 'Pipeline',
    storage: 'Storage', oil_field: 'Oil Field', port: 'Port/Terminal', gas_field: 'Gas Field',
  };
  const threatCls: Record<string, string> = {
    critical: 'text-red-600 dark:text-red-400', high: 'text-orange-600 dark:text-orange-400',
    elevated: 'text-yellow-600 dark:text-yellow-400', moderate: 'text-blue-600', low: 'text-green-600',
  };
  // Bar represents % of global supply — scaled so 1% fills ~20%, 5% fills 100%
  const barPct = Math.min(100, facility.percentGlobalCapacity * 20);
  const statusBarColor: Record<string, string> = {
    active_fire: 'bg-red-500', damaged: 'bg-orange-500', offline: 'bg-gray-500',
    monitoring: 'bg-yellow-500', operational: 'bg-green-500',
  };
  const st = statusCfg[facility.status] || statusCfg.operational;
  const cap = facility.gasCapacityBCFD
    ? `${facility.gasCapacityBCFD} BCF/d`
    : facility.capacityBPD >= 1_000_000
    ? `${(facility.capacityBPD / 1_000_000).toFixed(1)}M BPD`
    : facility.capacityBPD > 0
    ? `${(facility.capacityBPD / 1_000).toFixed(0)}K BPD`
    : facility.storageMBBL
    ? `${facility.storageMBBL}M bbl storage`
    : '';
  const pct = facility.percentGlobalCapacity;

  return (
    <div className={`rounded-xl border overflow-hidden ${hit ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10' : 'border-gray-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/40'}`}>
      <button onClick={() => setOpen(!open)} className='w-full p-3 text-left cursor-pointer'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'>
              {hit && <IconFlame className={`h-4 w-4 shrink-0 text-red-500 ${st.pulse ? 'animate-pulse' : ''}`} />}
              <span className='text-base font-black text-gray-900 dark:text-zinc-100 leading-tight'>{facility.name}</span>
            </div>
            <div className='flex items-center gap-1.5 mt-0.5 text-sm text-gray-500'>
              <span>{facility.country}</span>
              <span>·</span>
              <span>{typeLabel[facility.facilityType] || facility.facilityType}</span>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${st.cls} ${st.pulse ? 'animate-pulse' : ''}`}>
            {st.label}
          </span>
        </div>
        <div className='mt-2'>
          <div className='flex items-center justify-between text-sm mb-1'>
            <span className={`font-bold ${threatCls[facility.threatLevel] || ''}`}>{facility.threatLevel.toUpperCase()}</span>
            <span className='font-bold tabular-nums text-gray-700 dark:text-zinc-300'>{cap}</span>
          </div>
          <Bar pct={barPct} color={hit ? 'bg-red-500' : (statusBarColor[facility.status] || 'bg-gray-400')} height='h-2' />
          <div className='text-xs text-gray-400 mt-0.5 tabular-nums'>
            {pct}% of global supply{facility.attackDate && hit ? ` · Hit ${facility.attackDate}` : ''}
          </div>
        </div>
      </button>
      {open && (
        <div className='px-3 pb-3 space-y-2.5 border-t border-gray-100 dark:border-zinc-800/50 pt-2'>
          <div>
            <div className='text-xs uppercase tracking-widest text-gray-400 font-extrabold mb-1'>Strategic importance</div>
            <div className='text-sm text-gray-700 dark:text-zinc-300 leading-relaxed'>{facility.whyItMatters}</div>
          </div>
          <div>
            <div className='text-xs uppercase tracking-widest text-red-400 font-extrabold mb-1'>If destroyed</div>
            <div className='text-sm text-gray-700 dark:text-zinc-300 leading-relaxed'>{facility.ifDestroyed}</div>
          </div>
          {facility.supplyChainRole && (
            <div>
              <div className='text-xs uppercase tracking-widest text-gray-400 font-extrabold mb-1'>Supply chain</div>
              <div className='text-sm text-gray-700 dark:text-zinc-300 leading-relaxed'>{facility.supplyChainRole}</div>
            </div>
          )}
          {(facility.storageMBBL || facility.lngMTPA) && (
            <div className='flex flex-wrap gap-2 text-sm'>
              {facility.storageMBBL && <span className='px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'>Storage: <strong>{facility.storageMBBL}M bbl</strong></span>}
              {facility.lngMTPA && <span className='px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'>LNG: <strong>{facility.lngMTPA} MTPA</strong></span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Country comparison bar chart ── */
function CountryComparisonBar({ countries }: { countries: CountryDamageEntry[] }) {
  const oilCountries = countries.filter(c => c.hasOilInfra && c.pctGlobalOffline > 0);
  if (oilCountries.length === 0) return null;
  const maxPct = Math.max(...oilCountries.map(c => c.pctGlobalOffline), 1);

  return (
    <StatCard>
      <div className='text-xs uppercase tracking-widest text-gray-500 font-extrabold mb-2'>% Global Supply Offline by Country</div>
      <div className='space-y-1.5'>
        {oilCountries.map(c => (
          <div key={c.country}>
            <div className='flex items-center justify-between text-sm mb-0.5'>
              <span className='font-bold text-gray-700 dark:text-zinc-300'>{c.country}</span>
              <span className='font-bold tabular-nums text-gray-900 dark:text-zinc-100'>{c.pctGlobalOffline.toFixed(1)}%</span>
            </div>
            <Bar pct={(c.pctGlobalOffline / maxPct) * 100} color={
              c.damageClassification === 'devastated' ? 'bg-red-600' :
              c.damageClassification === 'heavy' ? 'bg-red-500' :
              c.damageClassification === 'moderate' ? 'bg-orange-500' :
              'bg-yellow-500'
            } height='h-2' />
          </div>
        ))}
      </div>
    </StatCard>
  );
}

/* ── Country damage card ── */
const DAMAGE_BADGE: Record<DamageClassification, { label: string; cls: string }> = {
  devastated: { label: 'DEVASTATED', cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
  heavy:      { label: 'HEAVY DAMAGE', cls: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  moderate:   { label: 'MODERATE', cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  light:      { label: 'LIGHT', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  threatened: { label: 'THREATENED', cls: 'bg-gray-100 dark:bg-zinc-700/50 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-zinc-600' },
  unaffected: { label: 'UNAFFECTED', cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
};

function CountryCard({ entry, hitFacilityIds }: { entry: CountryDamageEntry; hitFacilityIds: Set<string> }) {
  const [open, setOpen] = useState(false);
  const badge = DAMAGE_BADGE[entry.damageClassification];

  return (
    <div className={`rounded-xl border overflow-hidden ${
      entry.damageSeverity >= 80 ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10' :
      entry.damageSeverity >= 40 ? 'border-orange-200 dark:border-orange-900/50 bg-orange-50/20 dark:bg-orange-950/10' :
      'border-gray-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/40'
    }`}>
      <button onClick={() => setOpen(!open)} className='w-full p-3 text-left cursor-pointer'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <span className='text-base font-black text-gray-900 dark:text-zinc-100'>{entry.country}</span>
            {entry.hasOilInfra ? (
              <div className='text-sm text-gray-500 mt-0.5'>
                <strong className='text-red-600'>{entry.facilitiesHit}</strong>/{entry.facilitiesTotal} facilities hit
                {entry.capacityOfflineBPD > 0 && (
                  <> · <strong>{(entry.capacityOfflineBPD / 1_000_000).toFixed(1)}M BPD</strong> offline</>
                )}
              </div>
            ) : (
              <div className='text-sm text-gray-500 mt-0.5'>
                {entry.events} events · <strong className='text-red-600'>{entry.casualties.killed.toLocaleString()}</strong> killed
                {entry.casualties.injured > 0 && <> · {entry.casualties.injured.toLocaleString()} injured</>}
              </div>
            )}
          </div>
          <span className={`shrink-0 text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        {entry.hasOilInfra && entry.pctGlobalOffline > 0 && (
          <div className='mt-2'>
            <Bar pct={entry.pctGlobalOffline * 10} color={
              entry.damageClassification === 'devastated' ? 'bg-red-600' :
              entry.damageClassification === 'heavy' ? 'bg-red-500' :
              'bg-orange-500'
            } height='h-2' />
            <div className='text-xs text-gray-400 mt-0.5 tabular-nums'>
              {entry.pctGlobalOffline.toFixed(1)}% of global supply offline
            </div>
          </div>
        )}
        {entry.events > 0 && (
          <div className='flex items-center gap-3 mt-1.5 text-xs text-gray-400'>
            <span>{entry.events} events</span>
            {entry.casualties.killed > 0 && <span>{entry.casualties.killed.toLocaleString()} killed</span>}
            {entry.casualties.displaced > 0 && <span>{(entry.casualties.displaced / 1_000_000).toFixed(1)}M displaced</span>}
          </div>
        )}
      </button>
      {open && entry.facilities.length > 0 && (
        <div className='px-3 pb-3 space-y-2 border-t border-gray-100 dark:border-zinc-800/50 pt-2'>
          {entry.facilities.map(f => (
            <FacilityCard key={f.id} facility={f} hit={hitFacilityIds.has(f.id)} />
          ))}
        </div>
      )}
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
    // Calibrated to Goldman Sachs ~25% at current levels ($101 oil, 5% grocery, 65% shipping surcharge)
    // Full Hormuz closure / $200 oil → 80-90%. Pre-crisis baseline → ~5%.
    const oilSpikePct = Math.min(100, ((impact.oilPriceBbl - 75) / 75) * 100); // 100% at $150/bbl
    const supplyRisk = Math.min(100, supply.productionPct * 5); // 100% at 20% offline
    const inflationPressure = Math.min(100, (impact.groceryInflationPct / 15) * 100); // 100% at 15% grocery inflation
    const warCostDrag = Math.min(100, (cost.totalBillions / 2000) * 100); // 100% at $2T
    const shippingStress = Math.min(100, impact.shippingSurchargePct); // 100% at 100% surcharge
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

    // ── Scenario predictions derived from current data ──
    const hormuzBlocked = supply.chokepoints.find(c => c.id === 'strait-of-hormuz')?.blockedPct || 0;
    const nuclearDestroyed = nuclear?.facilitiesDestroyed || 0;
    const enrichmentGone = 100 - (nuclear?.enrichmentPct || 100);
    const radRisk = nuclear?.radiationRisk || 'none';
    const tempo = stats.eventsLast7;

    const predictions = [
      {
        scenario: 'Hormuz fully closed',
        probability: Math.min(95, Math.round(
          (hormuzBlocked > 50 ? 40 : hormuzBlocked > 20 ? 20 : 5) +
          (supply.productionPct > 10 ? 20 : supply.productionPct > 5 ? 10 : 0) +
          (tempo > 10 ? 15 : tempo > 5 ? 8 : 0) +
          (nuclearDestroyed >= 3 ? 15 : nuclearDestroyed >= 1 ? 5 : 0)
        )),
        color: 'text-red-600',
        what: 'Iran deploys naval mines, fast-attack boats, and anti-ship missiles to seal the Strait of Hormuz — a 21-mile-wide chokepoint carrying 21M barrels/day (21% of global oil).',
        why: `Iran has publicly threatened Hormuz closure since the 1980s as its ultimate leverage. With ${nuclearDestroyed} nuclear facilities destroyed, retaliation via oil disruption is Iran's most powerful asymmetric weapon. They can't match US/Israeli military power, but they CAN crash the global economy.`,
        how: 'Iran has 3,000+ naval mines stockpiled, Khalij Fars anti-ship ballistic missiles, hundreds of fast-attack boats in IRGC Navy, and Noor/Qader cruise missiles covering the entire strait. Even partial mining would halt tanker insurance and stop commercial traffic.',
        when: `Most likely within days of a major escalation. Current Hormuz disruption: ${hormuzBlocked}%. Iran\'s doctrine says nuclear facility destruction = economic warfare response.`,
        expect: [
          { label: 'Oil price', value: '$200-300/bbl', detail: 'Instant spike — 21% of global supply gone' },
          { label: 'Gas price', value: '$8-12/gal', detail: 'Within 2-4 weeks as reserves deplete' },
          { label: 'US Strategic Reserve', value: '~350M barrels', detail: 'Lasts ~18 days at full draw (would be rationed)' },
          { label: 'Countries affected', value: '30+', detail: 'Japan, S. Korea, India, China get 60-80% of oil through Hormuz' },
          { label: 'US military response', value: 'Minesweeping + escorts', detail: 'Could take 3-6 months to fully clear — mines are cheap, clearing is slow' },
          { label: 'Insurance rates', value: 'Tankers uninsurable', detail: 'Lloyd\'s of London would pull war-risk coverage — no insurance = no shipping' },
        ],
      },
      {
        scenario: 'Nuclear accident / meltdown',
        probability: Math.min(90, Math.round(
          (radRisk === 'high' ? 30 : radRisk === 'elevated' ? 15 : radRisk === 'low' ? 5 : 1) +
          (nuclearDestroyed >= 4 ? 25 : nuclearDestroyed >= 2 ? 12 : nuclearDestroyed >= 1 ? 5 : 0) +
          (enrichmentGone > 70 ? 15 : enrichmentGone > 40 ? 8 : 0)
        )),
        color: 'text-orange-600',
        what: 'A bombed nuclear facility suffers containment failure — radioactive material released into atmosphere and/or Persian Gulf waters. Bushehr (active reactor on the coast) is the highest risk.',
        why: `${nuclearDestroyed} facilities destroyed by airstrikes. Nuclear facilities aren\'t designed to be bombed — they\'re designed for earthquakes and accidents. Bunker busters can breach containment vessels, crack spent fuel pools, and scatter radioactive material. Radiation risk is currently "${radRisk}".`,
        how: 'Three paths to meltdown: (1) Bushehr reactor cooling disrupted by strike — fuel rods melt within hours. (2) Spent fuel pool at any facility breached — fire releases cesium-137. (3) Enrichment facility hit releases uranium hexafluoride gas — toxic and radioactive.',
        when: 'Could happen with the next strike on a nuclear facility. Bushehr is the most dangerous — it has an active core with 80+ tons of fuel. If cooling is lost, meltdown begins within 4-8 hours.',
        expect: [
          { label: 'Contamination zone', value: '50-300km radius', detail: 'Depends on wind — could reach Kuwait, Bahrain, Qatar, Saudi Arabia' },
          { label: 'Evacuations', value: '2-10 million people', detail: 'Coastal Gulf populations within fallout range' },
          { label: 'Water supply', value: 'Gulf desalination offline', detail: '90% of Gulf states\' drinking water comes from desalination — contaminated intake' },
          { label: 'Duration', value: '30+ years', detail: 'Chernobyl exclusion zone is still active 40 years later' },
          { label: 'Health impact', value: 'Cancer spike in 5-20 years', detail: 'Thyroid, leukemia, birth defects — pattern seen after every nuclear accident' },
          { label: 'Global response', value: 'Immediate ceasefire pressure', detail: 'A meltdown would likely force all parties to the table — but damage is done' },
        ],
      },
      {
        scenario: 'US ground troops in Iran',
        probability: Math.min(85, Math.round(
          (warDays > 400 ? 15 : warDays > 200 ? 8 : 2) +
          (cost.totalBillions > 800 ? 15 : cost.totalBillions > 400 ? 8 : 2) +
          (nuclearDestroyed >= 3 ? 12 : 0) +
          (tempo > 15 ? 10 : tempo > 8 ? 5 : 0)
        )),
        color: 'text-red-700',
        what: 'Air campaign fails to stop Iranian retaliation. US commits ground forces to Iran — a country of 85 million people, 4x the size of Iraq, with mountainous terrain built for guerrilla warfare.',
        why: `After ${warDays} days of war and $${cost.totalBillions >= 1000 ? (cost.totalBillions/1000).toFixed(1) + 'T' : cost.totalBillions.toFixed(0) + 'B'} spent, air power alone hasn't achieved objectives. Iran continues launching missiles from dispersed mobile launchers. Political pressure builds to "finish the job."`,
        how: 'Likely starts with "limited" objectives — securing nuclear sites or a buffer zone. Iraq 2003 started the same way. Iran\'s IRGC has 190,000 troops + 600,000 Basij militia. Terrain is mountains, not desert — Afghanistan-style grinding warfare.',
        when: 'Historically takes 6-18 months of air campaign before ground invasion pressure becomes irresistible. US currently has 45,000 troops in the region but would need 300,000-500,000 for invasion.',
        expect: [
          { label: 'Troops needed', value: '300,000-500,000', detail: 'Iran is 3.5x larger than Iraq with triple the population' },
          { label: 'Cost', value: '$2-4 trillion', detail: 'Iraq cost $2.4T over 8 years — Iran would be worse' },
          { label: 'US casualties', value: '10,000-50,000', detail: 'Iran\'s terrain and military are far more capable than Iraq\'s' },
          { label: 'Duration', value: '5-15 years', detail: 'No modern power has successfully occupied Iran — not even the Mongols held it long' },
          { label: 'Draft', value: 'Likely necessary', detail: 'Current volunteer military can\'t sustain 500K deployment + other commitments' },
          { label: 'Iran casualties', value: '100,000-500,000', detail: 'Civilian and military — urban warfare in Tehran (9M pop) would be devastating' },
        ],
      },
      {
        scenario: 'Saudi infrastructure hit',
        probability: Math.min(90, Math.round(
          (nuclearDestroyed >= 2 ? 30 : nuclearDestroyed >= 1 ? 10 : 3) +
          (supply.productionPct > 10 ? 20 : supply.productionPct > 5 ? 10 : 3) +
          (tempo > 10 ? 15 : tempo > 5 ? 8 : 0) +
          (hormuzBlocked > 30 ? 10 : 0)
        )),
        color: 'text-orange-700',
        what: 'Iran launches ballistic missiles at Saudi Aramco\'s Abqaiq processing facility and Khurais oil field — the heart of Saudi oil production. Abqaiq alone processes 7M BPD (7% of global supply).',
        why: `Iran\'s nuclear facilities are being destroyed — retaliation against US allies\' economic infrastructure is the logical asymmetric response. Iran proved it can hit Abqaiq in 2019 (drone/cruise missile attack knocked out 5.7M BPD for weeks). With ${nuclearDestroyed} facilities gone, the calculus shifts toward maximum economic damage.`,
        how: '2019 attack used 18 drones + 7 cruise missiles and evaded Saudi/US air defenses. Iran now has hypersonic Fattah missiles (Mach 13+) that current missile defense cannot intercept. Also has Houthi proxies in Yemen who can attack from the south.',
        when: 'Most likely as retaliation for nuclear facility strikes. Could come as a coordinated wave — Abqaiq + Ras Tanura (largest oil export terminal) + Khurais simultaneously.',
        expect: [
          { label: 'Supply offline', value: '7-10M BPD', detail: 'Abqaiq (7M) + Khurais (1.5M) + Ras Tanura exports' },
          { label: 'Oil price', value: '$180-250/bbl', detail: '2019 attack (5.7M BPD) caused 15% spike in ONE DAY — this would be worse' },
          { label: 'Repair time', value: '6-18 months', detail: '2019 took weeks to repair with NO military conflict — under war conditions, much longer' },
          { label: 'Gas rationing', value: 'Likely in US/Europe', detail: 'Strategic reserves buy 2-3 months — after that, rationing' },
          { label: 'Saudi response', value: 'Joins war or neutrality', detail: 'Saudi has been trying to stay neutral — a direct hit forces their hand' },
          { label: 'Global GDP', value: '-2% to -4%', detail: 'IMF models show oil above $150 sustained = global recession within 6 months' },
        ],
      },
      {
        scenario: 'Ceasefire within 90 days',
        probability: Math.max(2, Math.min(60, Math.round(
          40 -
          (nuclearDestroyed >= 3 ? 15 : nuclearDestroyed >= 1 ? 8 : 0) -
          (supply.productionPct > 15 ? 15 : supply.productionPct > 8 ? 8 : 0) -
          (tempo > 12 ? 10 : tempo > 6 ? 5 : 0) -
          (casualties.totalKilled > 60000 ? 10 : casualties.totalKilled > 30000 ? 5 : 0)
        ))),
        color: 'text-green-700',
        what: 'International pressure — especially from China (Iran\'s biggest oil customer) and US domestic politics — forces a ceasefire. Both sides claim victory, fighting stops, reconstruction begins.',
        why: `Ceasefire probability drops as destruction increases. With ${casualties.totalKilled.toLocaleString()} killed and ${supply.productionPct.toFixed(1)}% of oil offline, both sides have strong incentives to stop — but also strong incentives to "finish" what they started. The paradox: the worse it gets, the harder it is to stop.`,
        how: 'Most likely path: China threatens to cut off remaining Iranian trade + US faces election pressure + oil prices make ceasefire economically urgent. UN Security Council resolution with monitoring. Gradual de-escalation over weeks.',
        when: 'Historical pattern: wars like this burn hot for 3-6 months before exhaustion sets in. Key trigger would be a nuclear accident or oil price above $200 — something so catastrophic it forces all parties\' hands.',
        expect: [
          { label: 'Oil recovery', value: '6-12 months to $90-100', detail: 'Markets recover fast once shipping lanes reopen' },
          { label: 'Gas price', value: 'Back to $3.50-4.50', detail: '3-6 months after ceasefire for supply chain normalization' },
          { label: 'Iran nuclear', value: 'IAEA inspections resume', detail: 'New deal likely — more restrictive than JCPOA, with verification' },
          { label: 'Reconstruction', value: '$500B-1T needed', detail: 'Iran, Gaza, Lebanon infrastructure devastated — who pays?' },
          { label: 'Household savings', value: '+$500-800/mo back', detail: 'Energy and grocery costs gradually return toward pre-war levels' },
          { label: 'Political fallout', value: 'Major', detail: 'Investigations, war crimes tribunals, realignment of Middle East alliances' },
        ],
      },
      {
        scenario: 'US recession (12-month)',
        probability: recession.score,
        color: recession.score >= 60 ? 'text-red-600' : recession.score >= 40 ? 'text-orange-600' : 'text-blue-600',
        what: 'The combination of energy shock, consumer price inflation, war spending, and supply chain disruption tips the US economy into recession — GDP contracts for 2+ consecutive quarters.',
        why: `Every major oil price shock since 1973 has been followed by a recession. Current oil at $${impact.oilPriceBbl}/bbl is ${oilDelta > 0 ? `$${oilDelta.toFixed(0)} above` : 'at'} pre-war levels. Households paying +$${impact.totalMonthlyExtra}/mo extra means less consumer spending — and consumer spending is 70% of US GDP.`,
        how: 'The transmission chain: oil spike → gas/energy costs up → trucking/shipping costs up → food and goods prices up → consumers cut spending → businesses cut staff → unemployment rises → recession. This typically takes 6-12 months to fully play out.',
        when: `Based on current stress indicators: oil shock ${recession.oilSpikePct}/100, supply disruption ${recession.supplyRisk}/100, inflation ${recession.inflationPressure}/100. Historical precedent: 1973 embargo → recession in 8 months. 1979 Iranian revolution → recession in 10 months.`,
        expect: [
          { label: 'GDP contraction', value: '-1.5% to -3.5%', detail: '1973 oil crisis caused -3.2% — current conditions are comparable' },
          { label: 'Unemployment', value: '6-9%', detail: 'Currently ~4% — recession typically adds 2-5 points' },
          { label: 'Stock market', value: '-25% to -40%', detail: 'S&P 500 typically drops 30%+ in oil-shock recessions' },
          { label: 'Housing', value: '-10% to -20%', detail: 'Mortgage rates spike with inflation — fewer buyers, prices drop' },
          { label: 'Duration', value: '12-24 months', detail: 'Oil-shock recessions last longer than financial ones — structural damage' },
          { label: 'Fed response', value: 'Stagflation trap', detail: 'Can\'t cut rates (inflation) or raise rates (recession) — worst scenario for central banks' },
        ],
      },
      {
        scenario: 'Global oil embargo (OPEC)',
        probability: Math.min(80, Math.round(
          (casualties.totalKilled > 50000 ? 20 : casualties.totalKilled > 20000 ? 10 : 3) +
          (nuclearDestroyed >= 2 ? 15 : 5) +
          (supply.productionPct > 10 ? 10 : 3) +
          (tempo > 10 ? 8 : 2)
        )),
        color: 'text-red-600',
        what: 'OPEC members — especially Saudi Arabia, UAE, Kuwait — cut oil production in solidarity with Iran or under domestic political pressure from populations outraged by the destruction. 1973 Arab oil embargo repeat.',
        why: `${casualties.totalKilled.toLocaleString()} killed, nuclear facilities bombed, and a Muslim-majority country under sustained assault. Arab street pressure on Gulf monarchies is intense. In 1973, Arab nations embargoed the US over far less provocation (support for Israel in Yom Kippur War). Current situation is worse.`,
        how: 'OPEC+ controls 40% of global oil production. Even a 10% cut crashes markets. Could come as: (1) Full embargo of US/allies, (2) Production cuts "for stability," or (3) Individual countries cutting output under domestic pressure. Saudi Arabia\'s MBS has shown willingness to use oil as a weapon (2020 price war with Russia).',
        when: 'Trigger events: a nuclear accident, civilian massacre on live TV, or mosque/holy site destruction. Arab League emergency session → OPEC emergency meeting → production cuts within 48 hours.',
        expect: [
          { label: 'Oil price', value: '$250-400/bbl', detail: '1973 embargo quadrupled oil prices — same multiplier on today\'s base = $300+' },
          { label: 'Gas price', value: '$10-15/gal', detail: 'Within 4-8 weeks — stations running dry in many areas' },
          { label: 'US Strategic Reserve', value: 'Depleted in 60-90 days', detail: '~350M barrels at emergency draw rate — not enough' },
          { label: 'Rationing', value: 'Mandatory', detail: 'Federal fuel rationing — odd/even license plate days, limits per vehicle' },
          { label: 'Food prices', value: '+50-80%', detail: 'Everything moves by truck — diesel doubles, food follows' },
          { label: 'Global impact', value: 'Depression-level', detail: 'Developing nations can\'t afford oil — famines, political instability, mass migration' },
        ],
      },
      {
        scenario: 'Russia/China direct involvement',
        probability: Math.min(70, Math.round(
          (cost.totalBillions > 1000 ? 15 : cost.totalBillions > 500 ? 8 : 2) +
          (nuclearDestroyed >= 4 ? 12 : nuclearDestroyed >= 2 ? 5 : 0) +
          (supply.productionPct > 15 ? 10 : 3) +
          (warDays > 300 ? 8 : warDays > 100 ? 3 : 0)
        )),
        color: 'text-red-800',
        what: 'Russia and/or China move from diplomatic protests to direct military or economic intervention — weapons shipments, naval deployments, sanctions counter-measures, or outright military support for Iran.',
        why: `This is about the global power balance, not just Iran. If the US/Israel can destroy a nation\'s nuclear program and reshape the Middle East without consequences, it sets a precedent that threatens both Russia and China\'s security calculations. Iran is a major arms customer for Russia and China\'s #3 oil supplier. With $${cost.totalBillions >= 1000 ? (cost.totalBillions/1000).toFixed(1) + 'T' : cost.totalBillions.toFixed(0) + 'B'} in war costs, the US is weakened — and both rivals see opportunity.`,
        how: 'Escalation ladder with multiple rungs, each more dangerous than the last.',
        when: `Trigger points: (1) Nuclear facility strike (already ${nuclearDestroyed} destroyed) threatens nuclear non-proliferation norm. (2) Oil above $200 hurts China\'s economy — they have incentive to end the war OR back Iran. (3) US gets bogged down → Russia sees opportunity in Europe/Arctic.`,
        expect: [
          { label: 'China — economic', value: 'Most likely first step', detail: 'Defies sanctions openly, buys all Iranian oil, provides financial system access via CIPS (alternative to SWIFT). Already does this partially — would go all-in.' },
          { label: 'China — military', value: 'Naval escort of oil tankers', detail: 'PLA Navy deploys to Persian Gulf to escort Chinese-flagged tankers through Hormuz. Dares US to fire on Chinese warships. Precedent: China already has a base in Djibouti.' },
          { label: 'China — why they\'d act', value: 'Oil dependency + Taiwan', detail: 'China imports 72% of its oil, 45% through Hormuz. A closed Hormuz devastates China\'s economy. Also: if US is tied down in Iran, Taiwan window opens. US can\'t fight two wars.' },
          { label: 'Russia — weapons', value: 'S-400 + Kinzhal to Iran', detail: 'Advanced air defense systems would negate US/Israeli air superiority. Hypersonic missiles would threaten US carriers. Russia already sold S-300 to Iran and has discussed S-400.' },
          { label: 'Russia — military', value: 'Escalation in Europe', detail: 'With US forces concentrated in Middle East, Russia tests NATO boundaries — Baltic states, Finland, increased nuclear posturing. Not direct intervention in Iran, but exploiting US overextension.' },
          { label: 'Russia — why they\'d act', value: 'Precedent + profit', detail: 'If US can destroy nuclear programs at will, Russia\'s own deterrent logic is threatened. Plus: oil at $200+ is pure profit for Russia as the world\'s #2 producer. They benefit from chaos.' },
          { label: 'Red line — nuclear', value: 'Bushehr meltdown', detail: 'A nuclear accident contaminating the Caspian region (Russia\'s border) or threatening Chinese energy supply would force both powers to act. Environmental disaster = national security threat.' },
          { label: 'Red line — ground war', value: 'US invades Iran', detail: 'A US ground invasion of Iran puts NATO troops on Russia\'s sphere of influence and China\'s Belt & Road partner. Both have defense agreements. This is the Cuba scenario in reverse.' },
        ],
      },
    ];

    // Sort by probability descending
    predictions.sort((a, b) => b.probability - a.probability);

    // ── Facility damage map ──
    const hitFacilityList = curatedFires
      .filter(f => facilityIds.has(f.id))
      .sort((a, b) => {
        const o: Record<string, number> = { active_fire: 0, damaged: 1, offline: 2, monitoring: 3, operational: 4 };
        return (o[a.status] ?? 5) - (o[b.status] ?? 5);
      });
    const threatenedFacilityList = curatedFires
      .filter(f => !facilityIds.has(f.id))
      .sort((a, b) => {
        const o: Record<string, number> = { critical: 0, high: 1, elevated: 2, moderate: 3, low: 4 };
        return (o[a.threatLevel] ?? 5) - (o[b.threatLevel] ?? 5);
      });

    const countryDamage = getInfrastructureDamageByCountry(facilityIds, timelineDate, events);

    // ── Years of life lost: avg age in memorial data ~29, WHO life expectancy 72 → ~43 years remaining per person ──
    const yearsOfLifeLost = Math.round(casualties.totalKilled * 43);

    // ── Role-based loss counts — sourced documented numbers, scaled proportionally to timeline ──
    // Base counts are at ~85,000 total killed (current conflict total)
    const baseTotal = 85000;
    const scale = Math.min(1, casualties.totalKilled / baseTotal);
    const roleCounts = [
      { icon: 'stethoscope', label: 'Medical professionals', count: Math.round(1722 * scale), source: 'MSF / WHO' },
      { icon: 'heart', label: 'Children', count: casualties.totalChildren, source: 'UNICEF / MoH' },
      { icon: 'book', label: 'Teachers & UN staff', count: Math.round(300 * scale), source: 'UNRWA' },
      { icon: 'camera', label: 'Journalists', count: Math.round(254 * scale), source: 'CPJ' },
      { icon: 'school', label: 'University students', count: Math.round(4200 * scale), source: 'Al Jazeera / MoE' },
      { icon: 'friends', label: 'Parents', count: Math.round(casualties.totalKilled * 0.35), source: 'Demographic estimate' },
    ];

    return { impact, casualties, nuclear, cost, supply, events, stats, peril, gasExtra, oilDelta, perTaxpayer, warDays, recession, predictions, hitFacilityList, threatenedFacilityList, countryDamage, facilityIds, yearsOfLifeLost, roleCounts };
  }, [timelineDate]);

  const { impact, casualties, nuclear, cost, supply, stats, peril, gasExtra, oilDelta, perTaxpayer, warDays, recession, predictions, hitFacilityList, threatenedFacilityList, countryDamage, facilityIds, yearsOfLifeLost, roleCounts } = data;
  const facilityFires = fireData.features.filter(f => f.properties.matchedFacility);
  const satelliteCO2 = facilityFires.reduce((s, f) => s + f.properties.estimatedCO2TonsDay, 0);
  const totalDetections = fireData.features.length;
  const facilityFireCount = facilityFires.length;

  // IDs of facilities matched by satellite
  const satelliteMatchedIds = useMemo(() => new Set(
    facilityFires.map(f => f.properties.matchedFacility!.id)
  ), [facilityFires]);

  // Capacity-based CO2 for burning facilities WITHOUT satellite data
  const capacityEstimates = useMemo(() => {
    return curatedFires
      .filter(f => (f.status === 'active_fire' || f.status === 'damaged') && !satelliteMatchedIds.has(f.id))
      .map(f => ({
        facility: f,
        co2: estimateCO2FromCapacity(f.facilityType, f.status, f.capacityBPD, f.gasCapacityBCFD, f.storageMBBL),
        breakdown: capacityBreakdown(f.facilityType, f.status, f.capacityBPD, f.gasCapacityBCFD, f.storageMBBL),
      }))
      .filter(e => e.co2 > 0);
  }, [satelliteMatchedIds]);

  const capacityCO2 = capacityEstimates.reduce((sum, e) => sum + e.co2, 0);
  const totalCO2 = satelliteCO2 + capacityCO2;
  const equiv = co2Equivalents(totalCO2);

  // Per-facility-type CO2 breakdown for tooltip (satellite-based)
  const co2ByType = useMemo(() => {
    const byType: Record<string, { co2: number; frp: number; count: number }> = {};
    for (const f of facilityFires) {
      const type = f.properties.matchedFacility?.facilityType || 'unknown';
      if (!byType[type]) byType[type] = { co2: 0, frp: 0, count: 0 };
      byType[type].co2 += f.properties.estimatedCO2TonsDay || 0;
      byType[type].frp += f.properties.frp || 0;
      byType[type].count++;
    }
    return Object.entries(byType)
      .sort((a, b) => b[1].co2 - a[1].co2)
      .map(([type, d]) => {
        const p = FACILITY_PARAMS[type as FacilityType] || FACILITY_PARAMS.unknown;
        return { type, ...d, params: p };
      });
  }, [facilityFires]);

  // Build full calculation tooltip text
  const calcTooltip = useMemo(() => {
    const lines: string[] = [];
    if (co2ByType.length > 0) {
      lines.push(
        'CO\u2082 Calculation Breakdown',
        '\u2500'.repeat(40),
        'SATELLITE-BASED (FRP):',
        'Formula: CO\u2082 = FRP \u00d7 86400 / (f_rad \u00d7 H_c) \u00d7 EF / 1000',
        '',
      );
      for (const t of co2ByType) {
        const label = t.type.replace('_', ' ');
        lines.push(
          `\u25cf ${label} (${t.count} detection${t.count > 1 ? 's' : ''})`,
          `  FRP: ${t.frp.toFixed(1)} MW \u00d7 ${t.params.multiplier} t/MW/day = ${t.co2.toFixed(1)} t/day`,
          `  f_rad=${t.params.fRad}, H_c=${t.params.hc} MJ/kg (${t.params.fuel}), EF=${t.params.ef}`,
          '',
        );
      }
      lines.push(`Satellite subtotal: ${satelliteCO2.toFixed(1)} t CO\u2082/day`);
    }
    if (capacityEstimates.length > 0) {
      lines.push('', 'CAPACITY-BASED (no satellite data):');
      for (const e of capacityEstimates) {
        lines.push(`\u25cf ${e.facility.name}: ${e.co2.toFixed(0)} t/day`);
      }
      lines.push(`Capacity subtotal: ${capacityCO2.toFixed(0)} t CO\u2082/day`);
    }
    if (lines.length > 0) {
      lines.push('', `Total: ${totalCO2.toFixed(1)} t CO\u2082/day`);
      lines.push('', 'Sources: IPCC 2006, Elvidge et al. 2020, EPA 2024');
    }
    return lines.join('\n');
  }, [co2ByType, satelliteCO2, capacityEstimates, capacityCO2, totalCO2]);

  // Count facilities confirmed burning/damaged from curated data (news-sourced)
  const curatedBurningCount = curatedFires.filter(f => f.status === 'active_fire' || f.status === 'damaged').length;

  const displayDate = new Date(timelineDate + 'T00:00:00');
  const dateFormatted = displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
        <div className='text-2xl font-black text-gray-900 dark:text-white leading-tight'>
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

      {/* ── EMISSIONS ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconCloud className='h-5 w-5 text-orange-600' />} title='Emissions' />

        {/* Headline CO2 number with calculation tooltip */}
        {totalCO2 > 0 ? (
          <div>
            <div
              className='text-3xl font-black text-orange-700 dark:text-orange-400 tabular-nums leading-none cursor-help'
              title={calcTooltip}
            >
              {formatCO2(totalCO2)} <span className='text-lg font-bold'>tons/day CO₂</span>
            </div>
            {/* Source breakdown label */}
            {satelliteCO2 > 0 && capacityCO2 > 0 && (
              <div className='text-sm text-gray-500 dark:text-zinc-400 mt-1'>
                {formatCO2(satelliteCO2)} t/day satellite + {formatCO2(capacityCO2)} t/day estimated from facility capacity
              </div>
            )}
            {satelliteCO2 === 0 && capacityCO2 > 0 && (
              <div className='text-sm text-gray-500 dark:text-zinc-400 mt-1'>
                Estimated from facility capacity (no live satellite data)
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className='text-lg font-black text-gray-400'>{loading ? '...' : 'Awaiting satellite data'}</div>
            {curatedBurningCount > 0 && (
              <div className='text-sm text-gray-500 dark:text-zinc-400 mt-1'>
                {curatedBurningCount} facilities confirmed burning/damaged per news reports.
                CO₂ estimates update when NASA FIRMS detects active thermal signatures.
              </div>
            )}
          </div>
        )}

        {/* Equivalents */}
        {totalCO2 > 0 && (
          <div className='mt-2 space-y-1'>
            <Row label='Same CO₂ as this many cars (yearly)' value={equiv.carsPerYear.toLocaleString()}
              tip={`${formatCO2(totalCO2)} t/day × 365 days / 4.6 t/car/yr = ${equiv.carsPerYear.toLocaleString()} cars. Source: EPA (epa.gov/greenvehicles)`} />
            <Row label='Same as this many homes (yearly)' value={equiv.homesPerYear.toLocaleString()}
              tip={`${formatCO2(totalCO2)} t/day × 365 days / 7.5 t/home/yr = ${equiv.homesPerYear.toLocaleString()} homes. Source: EIA Residential Energy Consumption Survey`} />
            <Row label='% of global daily emissions' value={`${equiv.percentGlobalDaily}%`}
              tip={`${formatCO2(totalCO2)} t/day / 100,000,000 t/day global × 100. Source: IEA (36.8 Gt/yr ÷ 365 = ~100M t/day)`} />
          </div>
        )}

        {/* Per-facility-type breakdown with formula (satellite) */}
        {co2ByType.length > 0 && (
          <div className='mt-3 space-y-1.5'>
            {co2ByType.map(t => {
              const label = t.type.replace('_', ' ');
              return (
                <div
                  key={t.type}
                  className='flex items-center justify-between text-sm cursor-help rounded px-2 py-1 hover:bg-orange-50 dark:hover:bg-zinc-800/60 transition-colors'
                  title={[
                    `${label}: ${t.count} detection${t.count > 1 ? 's' : ''}`,
                    `Total FRP: ${t.frp.toFixed(1)} MW`,
                    `Fuel: ${t.params.fuel} (H_c = ${t.params.hc} MJ/kg, EF = ${t.params.ef} kg CO₂/kg)`,
                    `Radiative fraction: ${t.params.fRad} (${t.params.note})`,
                    ``,
                    `Multiplier = 86400 / (${t.params.fRad} × ${t.params.hc}) × ${t.params.ef} / 1000 = ${t.params.multiplier} t/MW/day`,
                    `CO₂ = ${t.frp.toFixed(1)} MW × ${t.params.multiplier} = ${t.co2.toFixed(1)} t/day`,
                  ].join('\n')}
                >
                  <span className='text-gray-600 dark:text-zinc-300 capitalize'>{label}</span>
                  <span className='font-bold tabular-nums text-orange-700 dark:text-orange-400'>
                    {formatCO2(t.co2)} t/day
                    <span className='text-gray-400 dark:text-zinc-600 font-normal ml-1 text-xs'>({t.frp.toFixed(0)} MW × {t.params.multiplier})</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Capacity-based estimates breakdown */}
        {capacityEstimates.length > 0 && (
          <div className='mt-3 space-y-1.5'>
            {satelliteCO2 > 0 && (
              <div className='text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wide font-semibold'>Capacity-based estimates</div>
            )}
            {capacityEstimates.map(e => (
              <div
                key={e.facility.id}
                className='flex items-center justify-between text-sm cursor-help rounded px-2 py-1 hover:bg-amber-50 dark:hover:bg-zinc-800/60 transition-colors'
                title={e.breakdown}
              >
                <span className='text-gray-600 dark:text-zinc-300'>{e.facility.name}</span>
                <span className='font-bold tabular-nums text-amber-700 dark:text-amber-400'>
                  {formatCO2(e.co2)} t/day
                  <span className='text-gray-400 dark:text-zinc-600 font-normal ml-1 text-xs'>(capacity est.)</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Detection match info */}
        <div className='mt-2 text-sm text-gray-500 dark:text-zinc-400'>
          {facilityFireCount > 0 ? (
            <>
              <strong className='text-orange-600'>{facilityFireCount}</strong> of {totalDetections} satellite detections matched to tracked facilities.
              Unmatched detections (agricultural, wildfire, flaring) excluded.
              {capacityEstimates.length > 0 && (
                <> + {capacityEstimates.length} facility estimates from capacity data.</>
              )}
            </>
          ) : loading ? '...' : capacityEstimates.length > 0 ? (
            <>
              {totalDetections > 0 ? `${totalDetections} satellite detections in region — none within tracked facility zones. ` : ''}
              {capacityEstimates.length} burning {capacityEstimates.length === 1 ? 'facility' : 'facilities'} estimated from capacity data (EPA factors).
            </>
          ) : totalDetections > 0 ? (
            <>
              {totalDetections} satellite detections in region — none currently within tracked facility zones.
              {curatedBurningCount > 0 && ` ${curatedBurningCount} facilities confirmed burning per news reports.`}
            </>
          ) : 'Awaiting satellite data...'}
        </div>

        {/* Map button */}
        <div className='mt-3 pt-2 border-t border-gray-200 dark:border-zinc-800/50'>
          <button
            onClick={onMapMode}
            className='w-full flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700/50 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
          >
            <div className='flex items-center gap-4 text-sm'>
              <span className='flex items-center gap-1.5 text-orange-600'>
                <IconFlame className='h-4 w-4' />
                <span className='font-bold tabular-nums'>{loading ? '...' : facilityFireCount > 0 ? `${facilityFireCount} facility fires` : `${totalDetections} detections`}</span>
              </span>
              <span className='flex items-center gap-1.5 text-teal-600 dark:text-teal-400'>
                <IconWorld className='h-4 w-4' />
                <span className='font-bold tabular-nums'>{curatedFires.length} tracked</span>
              </span>
            </div>
            <span className='text-sm text-blue-600 dark:text-blue-400 font-bold'>View map →</span>
          </button>
        </div>

        {/* Sources — collapsible dropdown */}
        <SourcesDropdown />
      </div>

      {/* ── FACILITIES DAMAGE REPORT ── (only show after facility events exist) */}
      {(hitFacilityList.length > 0 || timelineDate >= '2024-01-12') && <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconBuildingSkyscraper className='h-5 w-5 text-red-600' />} title='Facilities Damage Report' />
        <div className='text-base text-gray-500 mb-3'>
          <strong className='text-red-600'>{hitFacilityList.length}</strong> hit · <strong className='text-yellow-600'>{threatenedFacilityList.length}</strong> threatened · {curatedFires.length} total tracked
        </div>

        {/* Total damage summary bar */}
        <StatCard>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='text-base font-bold text-gray-800 dark:text-zinc-200'>Total capacity damaged/offline</span>
            <span className='text-xl font-black text-red-600 tabular-nums'>
              {(hitFacilityList.reduce((s, f) => s + f.capacityBPD, 0) / 1_000_000).toFixed(1)}M BPD
            </span>
          </div>
          <Bar
            pct={Math.min(100, (hitFacilityList.reduce((s, f) => s + f.percentGlobalCapacity, 0)) * 4)}
            color='bg-red-500'
          />
          <div className='text-sm text-gray-500 mt-1'>
            {hitFacilityList.reduce((s, f) => s + f.percentGlobalCapacity, 0).toFixed(1)}% of global capacity affected
          </div>
        </StatCard>

        {hitFacilityList.length > 0 && (
          <>
            <div className='text-xs uppercase tracking-widest text-red-500 font-extrabold mb-2 mt-4 flex items-center gap-1.5'>
              <IconFlame className='h-3.5 w-3.5' />
              Hit / Damaged ({hitFacilityList.length})
            </div>
            <div className='space-y-2 mb-4'>
              {hitFacilityList.map(f => (
                <FacilityCard key={f.id} facility={f} hit />
              ))}
            </div>
          </>
        )}

        {threatenedFacilityList.length > 0 && (
          <>
            <div className='text-xs uppercase tracking-widest text-yellow-600 font-extrabold mb-2 flex items-center gap-1.5'>
              <IconAlertTriangle className='h-3.5 w-3.5' />
              Threatened / Monitoring ({threatenedFacilityList.length})
            </div>
            <div className='space-y-2'>
              {threatenedFacilityList.map(f => (
                <FacilityCard key={f.id} facility={f} hit={false} />
              ))}
            </div>
          </>
        )}

        <InfoBox>
          Click any facility for full breakdown — strategic importance, cascade impact, and supply chain role.
        </InfoBox>
      </div>}

      {/* ── WHAT WE LOST ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconHeart className='h-5 w-5 text-red-600' />} title='What We Lost' />

        {/* Years of life lost — the unifying number */}
        <a href='/dashboard/lost' className='block hover:opacity-80 transition-opacity'>
          <div className='text-4xl font-black text-red-600 dark:text-red-500 tabular-nums leading-none'
            title={`${casualties.totalKilled.toLocaleString()} lives × 43 avg years remaining = ${(yearsOfLifeLost / 1_000_000).toFixed(1)}M years. Based on WHO global life expectancy of 72 and avg victim age of 29 from identified casualty records.`}
          >
            {(yearsOfLifeLost / 1_000_000).toFixed(1)}M years
          </div>
          <div className='text-base text-gray-500 dark:text-zinc-400 font-bold mt-1'>of human life</div>
          <div className='text-sm text-gray-400 dark:text-zinc-500 tabular-nums mt-0.5'>
            {casualties.totalKilled.toLocaleString()}+ killed · {casualties.totalInjured.toLocaleString()}+ injured · {casualties.totalDisplaced > 0 ? `${(casualties.totalDisplaced / 1_000_000).toFixed(1)}M displaced` : ''}
          </div>
        </a>

        {/* Role-based loss grid — no sides, just people */}
        <div className='mt-4 grid grid-cols-2 gap-2'>
          {roleCounts.map((role) => {
            const Icon = role.icon === 'stethoscope' ? IconStethoscope
              : role.icon === 'heart' ? IconHeart
              : role.icon === 'book' ? IconBook
              : role.icon === 'camera' ? IconCamera
              : role.icon === 'school' ? IconSchool
              : IconFriends;
            return (
              <div key={role.label} className='flex items-center gap-2.5 rounded-lg bg-gray-100 dark:bg-zinc-900 px-3 py-2' title={`Source: ${role.source}`}>
                <Icon className='h-4 w-4 text-gray-400 dark:text-zinc-500 shrink-0' />
                <div className='min-w-0'>
                  <div className='text-base font-black text-gray-900 dark:text-zinc-100 tabular-nums leading-tight'>
                    {role.count.toLocaleString()}+
                  </div>
                  <div className='text-xs text-gray-500 dark:text-zinc-400 truncate'>{role.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <a
          href='/dashboard/lost'
          className='mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors'
        >
          Scroll through every one →
        </a>
      </div>

      {/* ── YOUR HOUSEHOLD COST ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconReceipt className='h-5 w-5 text-green-700 dark:text-green-500' />} title='Cost to American Households' />
        <div className='text-4xl font-black text-green-800 dark:text-green-400 tabular-nums leading-none'>
          +${impact.totalMonthlyExtra}
        </div>
        <div className='text-base text-green-700 dark:text-green-300 font-bold mt-1'>extra per month (avg US household)</div>
        <div className='text-base text-gray-500 mb-3'>That&apos;s <strong className='text-green-800 dark:text-green-200'>${annualCostPerHousehold.toLocaleString()}/year</strong> more than before the war</div>

        {/* Gas */}
        <StatCard>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='flex items-center gap-2 text-base font-bold text-gray-800 dark:text-zinc-200'>
              <IconGasStation className='h-5 w-5 text-orange-600' />
              Gas Price
            </span>
            <span className='text-2xl font-black text-orange-700 dark:text-orange-400 tabular-nums'>${impact.gasPriceGallon.toFixed(2)}</span>
          </div>
          <div className='text-sm text-gray-500 mb-1'>per gallon</div>
          <Bar pct={(impact.gasPriceGallon / 8) * 100} color='bg-orange-500' />
          <div className='flex items-center justify-between mt-1.5 text-base'>
            <span className='text-gray-500'>Before war: ${BASELINE.gasPriceGallon.toFixed(2)}</span>
            <span className='text-gray-500'>2008 peak: $4.11</span>
          </div>
          <div className='text-base text-orange-700 dark:text-orange-300 font-bold mt-1'>
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
          <div className='text-base text-gray-600 dark:text-zinc-400 mt-1.5'>
            <strong className='text-amber-700 dark:text-amber-300'>+${impact.monthlyGroceryExtra}/mo</strong> extra for a family of 4
          </div>
          <div className='text-sm text-gray-500 mt-0.5'>
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
          <div className='text-sm text-gray-500 mb-1'>extra per month</div>
          <Bar pct={(impact.natGasMMBtu / 25) * 100} color='bg-yellow-500' />
          <div className='text-base text-gray-600 dark:text-zinc-400 mt-1.5'>
            Natural gas: <strong>${impact.natGasMMBtu.toFixed(1)}/MMBtu</strong> (was ${BASELINE.natGasMMBtu.toFixed(1)})
          </div>
          {impact.natGasMMBtu > 12 && (
            <div className='text-base text-green-800 dark:text-green-300 font-bold mt-1'>
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
          <div className='text-base text-gray-600 dark:text-zinc-400 mt-1.5'>
            Your packages take <strong className='text-blue-700 dark:text-blue-300'>+{impact.deliveryDelayDays} days</strong> longer
          </div>
          <div className='text-sm text-gray-500 mt-0.5'>
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

        <div className='mt-2 px-1 space-y-1 text-xs text-gray-400 dark:text-zinc-600'>
          <div className='font-bold text-gray-500 dark:text-zinc-500'>Sources &amp; methodology</div>
          <div>Gas prices: <a href='https://gasprices.aaa.com/' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>AAA national average</a></div>
          <div>Oil (Brent): <a href='https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>EIA / IEA spot price</a></div>
          <div>Groceries: <a href='https://www.bls.gov/cpi/' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>BLS CPI Food Index</a> · <a href='https://www.ers.usda.gov/data-products/food-price-outlook/' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>USDA Food Price Outlook</a></div>
          <div>Natural gas: <a href='https://www.eia.gov/dnav/ng/ng_pri_sum_dcu_nus_m.htm' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>EIA Henry Hub spot</a></div>
          <div>Shipping: <a href='https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry' target='_blank' rel='noopener noreferrer' className='underline hover:text-gray-600'>Drewry World Container Index</a></div>
          <div>Baseline: Sep 2023 pre-crisis averages. Monthly extra = sum of gas (+{BASELINE.monthlyGasGallons} gal/mo × price delta), grocery inflation on ${BASELINE.monthlyGroceryBaseline}/mo baseline, utility increase from nat gas spot, and shipping surcharges.</div>
        </div>
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

          <div className='text-base text-gray-500 dark:text-zinc-400 mt-1 italic'>{nuclear.label}</div>

          <div className='mt-3 pt-2 border-t border-gray-200 dark:border-zinc-800/50 space-y-2'>
            <div className='text-sm text-gray-500 uppercase tracking-wider font-extrabold mb-1.5'>How does this compare?</div>
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
        <div className='text-base text-gray-500 mt-1 mb-3'>Likelihood of US recession within 12 months based on conflict-driven economic stress</div>

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
            <div className='text-sm text-gray-500 uppercase tracking-wider font-extrabold flex items-center gap-1.5'>
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
                <div className='text-sm text-gray-500 mt-1'>
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

      {/* ── COUNTRY DAMAGE REPORT ── */}
      {countryDamage.length > 0 && (
        <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
          <SectionTitle icon={<IconWorld className='h-5 w-5 text-blue-600' />} title='Country Damage Report' />
          <div className='text-base text-gray-500 mb-3'>
            Infrastructure and conflict damage by country — sorted by severity
          </div>

          <CountryComparisonBar countries={countryDamage} />

          <div className='space-y-2 mt-3'>
            {countryDamage.map(entry => (
              <CountryCard key={entry.country} entry={entry} hitFacilityIds={facilityIds} />
            ))}
          </div>

          <InfoBox>
            Click any country to expand and see individual facility damage cards. Countries like Lebanon and Yemen appear based on conflict events even without oil infrastructure.
          </InfoBox>
        </div>
      )}

      {/* ── PREDICTIONS BY THE NUMBERS ── */}
      <div className='px-4 pt-4 pb-3 border-b border-gray-200 dark:border-zinc-700'>
        <SectionTitle icon={<IconTrendingUp className='h-5 w-5 text-gray-700 dark:text-zinc-300' />} title='Predictions by the Numbers' />
        <div className='text-sm text-gray-500 mb-3'>
          Scenario probabilities computed from current conflict data — supply disruption, nuclear status, escalation tempo, and economic indicators.
        </div>

        <div className='space-y-2.5'>
          {predictions.map((p) => (
            <PredictionCard key={p.scenario} prediction={p} />
          ))}
        </div>

        <InfoBox>
          These probabilities are derived from the same data powering this dashboard — not opinions.
          As the numbers change, the predictions update in real time.
          Scrub the timeline to see how probabilities shift with events.
        </InfoBox>
      </div>

      <div className='h-8' />
    </div>
  );
}
