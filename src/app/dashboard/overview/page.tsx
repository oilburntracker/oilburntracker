'use client';

import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapControls from '@/features/map/components/map-controls';
import FacilityDrawer from '@/features/fires/components/facility-drawer';
import TimelineScrubber from '@/features/timeline/components/timeline-scrubber';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires, getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { getCasualtiesUpTo, getVisibleFacilityIds } from '@/features/timeline/data/conflict-events';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { IconFlame, IconBuildingFactory, IconWorld, IconAlertTriangle, IconSkull, IconCloud, IconCurrencyBitcoin, IconX, IconBomb, IconBuildingSkyscraper, IconTrendingUp } from '@tabler/icons-react';
import { formatCO2, co2Equivalents } from '@/features/emissions/utils/emissions-model';
import { toast } from 'sonner';
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
  const supply = getSupplyDisruptionUpTo(visibleFacilityIds);
  const disruptionColor = DISRUPTION_COLORS[supply.level] || DISRUPTION_COLORS.normal;

  // Running totals synced to timeline scrubber
  const casualties = getCasualtiesUpTo(timelineDate);
  const cost = getWarCostUpTo(timelineDate);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className='absolute top-3 right-3 z-10 rounded-lg border border-red-500/50 bg-black/90 backdrop-blur-md px-3 py-2 shadow-2xl cursor-pointer'
      >
        <div className='flex items-center gap-2'>
          <IconSkull className='h-5 w-5 text-red-500' />
          <span className='text-lg font-black text-red-500 tabular-nums'>
            {casualties.totalKilled.toLocaleString()}+
          </span>
          <span className='text-xs text-zinc-500 ml-2'>tap to expand</span>
        </div>
      </button>
    );
  }

  return (
    <div
      className='absolute top-3 right-3 z-10 w-[220px] rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md shadow-2xl overflow-hidden'
      onClick={() => setCollapsed(true)}
      role='button'
      tabIndex={0}
      title='Tap to collapse'
    >
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

      {/* ── SUPPLY DISRUPTION ── */}
      <div className='px-3 pt-2 pb-2 border-b border-zinc-800'>
        <div className='text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1'>Global Supply</div>
        <div className='flex items-center justify-between'>
          <div>
            <div className={`text-base font-black tabular-nums leading-tight ${disruptionColor}`}>
              {supply.totalPctGlobal.toFixed(1)}% offline
            </div>
            <div className='text-[10px] text-zinc-500 tabular-nums'>
              {(supply.totalBPDOffline / 1000000).toFixed(1)}M BPD disrupted
            </div>
          </div>
          <div className='text-right'>
            <div className='flex items-center gap-1'>
              <IconBuildingFactory className='h-3.5 w-3.5 text-red-400' />
              <span className='text-sm font-bold text-zinc-300 tabular-nums'>{supply.facilitiesHit}</span>
            </div>
            <div className='text-[10px] text-zinc-500'>hit</div>
          </div>
        </div>
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

      {/* ── BTC DONATE ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText('bc1qej9pyvhu970x4whg99sf99lau6z8c7fjhgv2mz');
          toast.success('BTC address copied to clipboard', {
            description: 'bc1qej...fjhgv2mz',
            duration: 3000
          });
        }}
        className='flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-[11px] text-zinc-500 hover:text-orange-400 transition-colors cursor-pointer border-t border-zinc-800'
        title='bc1qej9pyvhu970x4whg99sf99lau6z8c7fjhgv2mz'
      >
        <IconCurrencyBitcoin className='h-3.5 w-3.5 text-orange-400' />
        <span>Donate BTC</span>
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
