'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import MapControls from '@/features/map/components/map-controls';
import FacilityDrawer from '@/features/fires/components/facility-drawer';
import TimelineScrubber from '@/features/timeline/components/timeline-scrubber';
import EventFeed from '@/features/timeline/components/event-feed';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires, getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { getCasualtiesUpTo, getVisibleFacilityIds, getNuclearStatusUpTo } from '@/features/timeline/data/conflict-events';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { IconFlame, IconWorld, IconAlertTriangle, IconSkull, IconCloud, IconX, IconBomb, IconBuildingSkyscraper, IconTrendingUp, IconChevronUp, IconRadioactive, IconReceipt, IconGasStation, IconShoppingCart, IconBolt, IconPackage, IconMap } from '@tabler/icons-react';
import { formatCO2 } from '@/features/emissions/utils/emissions-model';
import { getConsumerImpactUpTo, BASELINE } from '@/features/impact/data/consumer-impact';
import Link from 'next/link';

const FireMap = dynamic(() => import('@/features/map/components/fire-map'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full items-center justify-center bg-black/50'>
      <p className='text-muted-foreground animate-pulse'>Loading map...</p>
    </div>
  )
});

const DISRUPTION_COLORS: Record<string, string> = {
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

// ── Stats sidebar — used in feed mode (no collapse, fills parent) ──
function StatsSidebar() {
  const fireData = useFireStore((s) => s.fireData);
  const loading = useFireStore((s) => s.loading);
  const timelineDate = useFireStore((s) => s.timelineDate);

  const activeFires = fireData.features.length;
  const totalCO2TonsDay = fireData.features.reduce((sum, f) => sum + f.properties.estimatedCO2TonsDay, 0);

  const visibleFacilityIds = getVisibleFacilityIds(timelineDate);
  const supply = getSupplyDisruptionUpTo(visibleFacilityIds, timelineDate);
  const disruptionColor = DISRUPTION_COLORS[supply.level] || DISRUPTION_COLORS.normal;

  const casualties = getCasualtiesUpTo(timelineDate);
  const cost = getWarCostUpTo(timelineDate);
  const nuclear = getNuclearStatusUpTo(timelineDate);
  const impact = getConsumerImpactUpTo(timelineDate);

  return (
    <div className='h-full overflow-y-auto'>
      {/* ── CASUALTIES ── */}
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

      {/* ── CONSUMER IMPACT ── */}
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
            <span className='font-bold text-yellow-400 tabular-nums'>+${impact.monthlyUtilityExtra}</span>
          </div>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='flex items-center gap-1.5 text-zinc-400'>
              <IconPackage className='h-3 w-3 text-red-400' />
              Shipping
            </span>
            <span className='font-bold text-red-400 tabular-nums'>+{impact.shippingSurchargePct}%</span>
          </div>
        </div>
        <div className='text-[9px] text-zinc-600 mt-1 italic'>{impact.headline}</div>
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
    </div>
  );
}

// ── Mobile stats strip — compact horizontal bar for small screens ──
function MobileStats() {
  const timelineDate = useFireStore((s) => s.timelineDate);

  const visibleFacilityIds = getVisibleFacilityIds(timelineDate);
  const supply = getSupplyDisruptionUpTo(visibleFacilityIds, timelineDate);
  const casualties = getCasualtiesUpTo(timelineDate);
  const cost = getWarCostUpTo(timelineDate);
  const impact = getConsumerImpactUpTo(timelineDate);

  return (
    <div className='md:hidden shrink-0 border-b border-zinc-800 bg-black/90 px-3 py-2 overflow-x-auto'>
      <div className='flex items-center gap-4 min-w-max'>
        <div className='flex items-center gap-1.5'>
          <IconSkull className='h-3.5 w-3.5 text-red-500' />
          <span className='text-xs font-black text-red-500 tabular-nums'>{casualties.totalKilled.toLocaleString()}+</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <IconBomb className='h-3 w-3 text-white' />
          <span className='text-xs font-black text-white tabular-nums'>{formatBillions(cost.totalBillions)}</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <IconAlertTriangle className='h-3 w-3 text-red-400' />
          <span className='text-xs font-black text-red-400 tabular-nums'>{supply.productionPct.toFixed(1)}%</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <IconReceipt className='h-3 w-3 text-orange-400' />
          <span className='text-xs font-black text-orange-400 tabular-nums'>+${impact.totalMonthlyExtra}/mo</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <IconGasStation className='h-3 w-3 text-orange-400' />
          <span className='text-xs font-black text-orange-400 tabular-nums'>${impact.gasPriceGallon.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Floating stats for map mode (collapsible) ──
function FloatingStats() {
  const fireData = useFireStore((s) => s.fireData);
  const timelineDate = useFireStore((s) => s.timelineDate);
  const [collapsed, setCollapsed] = useState(false);

  const visibleFacilityIds = getVisibleFacilityIds(timelineDate);
  const supply = getSupplyDisruptionUpTo(visibleFacilityIds, timelineDate);
  const disruptionColor = DISRUPTION_COLORS[supply.level] || DISRUPTION_COLORS.normal;
  const casualties = getCasualtiesUpTo(timelineDate);
  const cost = getWarCostUpTo(timelineDate);
  const nuclear = getNuclearStatusUpTo(timelineDate);
  const impact = getConsumerImpactUpTo(timelineDate);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className='absolute top-3 right-3 z-10 rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md px-3 py-2 shadow-2xl cursor-pointer w-[200px]'
      >
        <div className='flex items-center gap-2 mb-1'>
          <IconSkull className='h-4 w-4 text-red-500' />
          <span className='text-base font-black text-red-500 tabular-nums'>{casualties.totalKilled.toLocaleString()}+</span>
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
        <div className='flex items-center gap-2'>
          <IconReceipt className='h-3.5 w-3.5 text-orange-400' />
          <span className='text-sm font-black text-orange-400 tabular-nums'>+${impact.totalMonthlyExtra}</span>
          <span className='text-[10px] text-zinc-500'>/mo</span>
        </div>
      </button>
    );
  }

  return (
    <div className='absolute top-3 right-3 z-10 w-[220px] max-h-[calc(100dvh-140px)] rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col'>
      <button
        onClick={() => setCollapsed(true)}
        className='absolute top-1.5 right-1.5 z-20 rounded-full p-0.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer'
      >
        <IconX className='h-3.5 w-3.5' />
      </button>
      <div className='overflow-y-auto flex-1'>
        <StatsSidebar />
      </div>
      <button
        onClick={() => setCollapsed(true)}
        className='flex items-center justify-center gap-1 w-full px-3 py-1 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer border-t border-zinc-800'
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
          <p><strong className='text-foreground'>Scroll the feed</strong> to travel through the conflict timeline</p>
          <p><strong className='text-foreground'>Stats sidebar</strong> updates as you scroll — casualties, costs, impact</p>
          <p><strong className='text-foreground'>Live Map</strong> button opens the satellite fire detection map</p>
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
  const [mapMode, setMapMode] = useState(false);
  useFireData();

  const handleFlyTo = useCallback((lat: number, lng: number, zoom?: number) => {
    window.dispatchEvent(
      new CustomEvent('map-flyto', { detail: { lng, lat, zoom: zoom || 10 } })
    );
  }, []);

  // ── MAP MODE ──
  if (mapMode) {
    return (
      <div className='relative h-[calc(100dvh-64px)] w-full'>
        <FireMap />

        {/* Back to feed */}
        <button
          onClick={() => setMapMode(false)}
          className='absolute top-3 left-14 z-10 rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md px-3 py-2 shadow-2xl cursor-pointer flex items-center gap-2 hover:bg-zinc-900 transition-colors'
        >
          <span className='text-xs font-bold text-zinc-300'>← Feed</span>
        </button>

        <FloatingStats />
        <MapControls onFlyTo={handleFlyTo} />
        <TimelineScrubber onFlyTo={handleFlyTo} />
        <FacilityDrawer />
      </div>
    );
  }

  // ── FEED MODE (default) ──
  return (
    <div className='relative h-[calc(100dvh-64px)] w-full flex flex-col bg-zinc-950'>
      <WelcomeOverlay />

      {/* Feed header */}
      <div className='flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 shrink-0 bg-zinc-950 z-10'>
        <span className='text-sm font-bold text-zinc-100'>Feed</span>
        <button
          onClick={() => setMapMode(true)}
          className='flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors cursor-pointer'
        >
          <IconMap className='h-3.5 w-3.5' />
          Live Map
        </button>
      </div>

      {/* Mobile stats strip — visible on small screens only */}
      <MobileStats />

      {/* Main content area */}
      <div className='flex-1 min-h-0 flex'>
        {/* Event Feed */}
        <div className='flex-1 min-w-0'>
          <EventFeed onFlyTo={handleFlyTo} fullPage />
        </div>

        {/* Stats sidebar — desktop only */}
        <div className='w-[240px] shrink-0 border-l border-zinc-800 bg-black/90 hidden md:block'>
          <StatsSidebar />
        </div>
      </div>

      {/* Timeline scrubber — bottom */}
      <TimelineScrubber />
    </div>
  );
}
