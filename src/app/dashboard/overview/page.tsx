'use client';

import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapControls from '@/features/map/components/map-controls';
import FacilityDrawer from '@/features/fires/components/facility-drawer';
import TimelineScrubber from '@/features/timeline/components/timeline-scrubber';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires, getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { getCasualtiesUpTo, getVisibleFacilityIds, getNuclearStatusUpTo } from '@/features/timeline/data/conflict-events';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { IconFlame, IconBuildingFactory, IconWorld, IconAlertTriangle, IconSkull, IconCloud, IconX, IconBomb, IconBuildingSkyscraper, IconTrendingUp, IconChevronUp, IconRadioactive } from '@tabler/icons-react';
import { formatCO2, co2Equivalents } from '@/features/emissions/utils/emissions-model';
import Link from 'next/link';

const FireMap = dynamic(() => import('@/features/map/components/fire-map'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full items-center justify-center bg-black/50'>
      <p className='text-muted-foreground animate-pulse'>Loading map...</p>
    </div>
  )
});

const DISRUPTION_COLORS = {
  normal: 'text-green-400',
  mild: 'text-yellow-400',
  severe: 'text-orange-400',
  crisis: 'text-red-400',
  catastrophe: 'text-red-500 animate-pulse'
};

function formatBillions(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}T`;
  if (n >= 100) return `$${n.toFixed(0)}B`;
  return `$${n.toFixed(1)}B`;
}

function CompactStats() {
  const fireData = useFireStore((s) => s.fireData);
  const loading = useFireStore((s) => s.loading);
  const timelineDate = useFireStore((s) => s.timelineDate);
  const [collapsed, setCollapsed] = useState(false);

  const activeFires = fireData.features.length;

  // Live CO2 emissions from all detected fires
  const totalCO2TonsDay = fireData.features.reduce((sum, f) => sum + f.properties.estimatedCO2TonsDay, 0);

  // Facilities hit synced to timeline position
  const visibleFacilityIds = getVisibleFacilityIds(timelineDate);
  const supply = getSupplyDisruptionUpTo(visibleFacilityIds, timelineDate);
  const disruptionColor = DISRUPTION_COLORS[supply.level] || DISRUPTION_COLORS.normal;

  // Running totals synced to timeline scrubber
  const casualties = getCasualtiesUpTo(timelineDate);
  const cost = getWarCostUpTo(timelineDate);
  const nuclear = getNuclearStatusUpTo(timelineDate);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className='absolute top-3 right-3 z-10 rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md px-3 py-2 shadow-2xl cursor-pointer w-[200px]'
      >
        {/* Minimized: key numbers in a compact strip */}
        <div className='flex items-center gap-2 mb-1'>
          <IconSkull className='h-4 w-4 text-red-500' />
          <span className='text-base font-black text-red-500 tabular-nums'>
            {casualties.totalKilled.toLocaleString()}+
          </span>
          <span className='text-[10px] text-zinc-500'>killed</span>
        </div>
        <div className='flex items-center gap-2 mb-1'>
          <IconBomb className='h-3.5 w-3.5 text-white' />
          <span className='text-sm font-black text-white tabular-nums'>{formatBillions(cost.totalBillions)}</span>
          <span className='text-[10px] text-zinc-500'>war cost</span>
        </div>
        <div className='flex items-center gap-2 mb-1'>
          <IconAlertTriangle className={`h-3.5 w-3.5 ${disruptionColor}`} />
          <span className={`text-sm font-black tabular-nums ${disruptionColor}`}>{supply.productionPct.toFixed(1)}%</span>
          <span className='text-[10px] text-zinc-500'>offline</span>
        </div>
        {nuclear && (
          <div className='flex items-center gap-2'>
            <IconRadioactive className='h-3.5 w-3.5 text-green-400' />
            <span className='text-sm font-black tabular-nums text-green-400'>{nuclear.enrichmentPct}%</span>
            <span className='text-[10px] text-zinc-500'>enrichment</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className='absolute top-3 right-3 z-10 w-[220px] rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md shadow-2xl overflow-hidden'>
      {/* ── MINIMIZE BUTTON ── */}
      <button
        onClick={() => setCollapsed(true)}
        className='absolute top-1.5 right-1.5 z-20 rounded-full p-0.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer'
        title='Minimize'
      >
        <IconX className='h-3.5 w-3.5' />
      </button>

      {/* ── CASUALTIES — BIG ── */}
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
              <span className='font-bold text-green-400 tabular-nums'>{nuclear.facilitiesTargeted} targeted / {nuclear.facilitiesDestroyed} destroyed</span>
            </div>
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-400'>Enrichment capacity</span>
              <span className={`font-bold tabular-nums ${nuclear.enrichmentPct > 50 ? 'text-red-400' : nuclear.enrichmentPct > 20 ? 'text-orange-400' : 'text-green-400'}`}>
                {nuclear.enrichmentPct}% remaining
              </span>
            </div>
            {nuclear.radiationRisk !== 'none' && (
              <div className='flex items-center justify-between text-[11px] group relative'>
                <span className='text-zinc-400'>Radiation risk</span>
                <span
                  className={`font-bold tabular-nums cursor-help ${nuclear.radiationRisk === 'high' ? 'text-red-500 animate-pulse' : nuclear.radiationRisk === 'elevated' ? 'text-orange-400' : 'text-yellow-400'}`}
                  title={nuclear.radiationRisk === 'high'
                    ? 'Strikes on enrichment facilities risk releasing uranium hexafluoride and radioactive material. IAEA has warned of potential nuclear accident.'
                    : nuclear.radiationRisk === 'elevated'
                    ? 'Multiple nuclear facilities damaged. Risk of radioactive contamination from destroyed centrifuges and stored nuclear material.'
                    : 'Nuclear facilities targeted. Low but non-zero risk of radioactive release from conventional strikes on nuclear sites.'}
                >
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
        <div className='flex items-center justify-between'>
          <div>
            <div className={`text-base font-black tabular-nums leading-tight ${disruptionColor}`}>
              {supply.productionPct.toFixed(1)}% offline
            </div>
            <div className='text-[10px] text-zinc-500 tabular-nums'>
              {(supply.productionBPDOffline / 1000000).toFixed(1)}M BPD — {supply.facilitiesHit} facilities
            </div>
          </div>
        </div>
        {supply.chokepoints.length > 0 && (
          <div className='mt-1 pt-1 border-t border-zinc-800/50 space-y-1'>
            {supply.chokepoints.map((cp) => (
              <div key={cp.id} className='flex items-center justify-between text-[11px]'>
                <span className='text-zinc-400 truncate mr-2'>
                  {cp.id === 'strait-of-hormuz' ? 'Hormuz' : 'Bab el-Mandeb'}
                </span>
                <span className={`font-bold tabular-nums ${cp.blockedPct >= 60 ? 'text-red-400' : cp.blockedPct >= 30 ? 'text-orange-400' : 'text-amber-400'}`}>
                  {cp.blockedPct}% blocked
                </span>
              </div>
            ))}
            <div className='text-[10px] text-zinc-500 tabular-nums'>
              {(supply.transitBPDBlocked / 1000000).toFixed(1)}M BPD blocked of {(supply.transitBPDAtRisk / 1000000).toFixed(0)}M
            </div>
          </div>
        )}
      </div>

      {/* ── EMISSIONS + FIRES ── */}
      <Link href='/dashboard/fires' className='flex items-center justify-between px-3 py-1.5 hover:bg-zinc-900/50 transition-colors' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center gap-3 text-[11px]'>
          {totalCO2TonsDay > 0 && (
            <span className='flex items-center gap-1 text-orange-400'>
              <IconCloud className='h-3 w-3' />
              <span className='font-bold tabular-nums'>{formatCO2(totalCO2TonsDay)} t/d</span>
            </span>
          )}
          <span className='flex items-center gap-1 text-orange-500'>
            <IconFlame className='h-3 w-3' />
            <span className='font-bold tabular-nums'>{loading ? '...' : activeFires}</span>
          </span>
          <span className='flex items-center gap-1 text-yellow-400'>
            <IconWorld className='h-3 w-3' />
            <span className='font-bold tabular-nums'>{curatedFires.length}</span>
          </span>
        </div>
      </Link>

      {/* ── COLLAPSE ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(true);
        }}
        className='flex items-center justify-center gap-1 w-full px-3 py-1 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer border-t border-zinc-800'
        title='Minimize panel'
      >
        <IconChevronUp className='h-3.5 w-3.5' />
      </button>
    </div>
  );
}

function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem('obt-welcome-dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('obt-welcome-dismissed', '1');
  };

  return (
    <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm' onClick={dismiss}>
      <div className='relative max-w-md mx-4 rounded-xl border border-orange-500/30 bg-background/95 backdrop-blur-md p-6 shadow-2xl' onClick={(e) => e.stopPropagation()}>
        <button onClick={dismiss} className='absolute top-3 right-3 text-muted-foreground hover:text-foreground'>
          <IconX className='h-5 w-5' />
        </button>
        <h2 className='text-xl font-black mb-2'>OilBurnTracker</h2>
        <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
          Real-time satellite fire detection and emissions tracking for conflict-affected oil &amp; gas infrastructure. Using NASA FIRMS data to monitor facility strikes, estimate CO&#8322; emissions, and track the human cost.
        </p>
        <div className='space-y-1.5 text-xs text-muted-foreground'>
          <p><strong className='text-foreground'>Timeline:</strong> Press play or scrub through Oct 2023 &rarr; today</p>
          <p><strong className='text-foreground'>Map pins:</strong> Click colored markers for event details + video</p>
          <p><strong className='text-foreground'>Facility glow:</strong> Larger glow = bigger share of global oil supply</p>
        </div>
        <button onClick={dismiss} className='mt-4 w-full rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 text-sm transition-colors'>
          Start Exploring
        </button>
        <p className='text-[10px] text-muted-foreground/60 text-center mt-2'>
          Open source &middot; No tracking &middot; No accounts
        </p>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  useFireData();

  const handleFlyTo = useCallback((lat: number, lng: number, zoom?: number) => {
    window.dispatchEvent(
      new CustomEvent('map-flyto', { detail: { lng, lat, zoom: zoom || 10 } })
    );
  }, []);

  return (
    <div className='relative h-[calc(100dvh-64px)] w-full'>
      {/* Full-screen map */}
      <FireMap />

      {/* First-time visitor welcome */}
      <WelcomeOverlay />

      {/* Compact stats + donate — top right */}
      <CompactStats />

      {/* Layer controls — top left */}
      <MapControls onFlyTo={handleFlyTo} />

      {/* Timeline scrubber — bottom */}
      <TimelineScrubber onFlyTo={handleFlyTo} />

      {/* Facility detail bottom drawer */}
      <FacilityDrawer />
    </div>
  );
}
