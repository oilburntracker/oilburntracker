'use client';

import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapControls from '@/features/map/components/map-controls';
import FacilityDrawer from '@/features/fires/components/facility-drawer';
import TimelineScrubber from '@/features/timeline/components/timeline-scrubber';
import EventFeed from '@/features/timeline/components/event-feed';
import HeroPills from '@/features/overview/components/hero-pills';
import DeepDivePanel from '@/features/overview/components/deep-dive-panel';
import MobileTabs from '@/features/overview/components/mobile-tabs';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import { useFireStore } from '@/stores/fire-store';
import { getCasualtiesUpTo, getVisibleFacilityIds, getNuclearStatusUpTo } from '@/features/timeline/data/conflict-events';
import { getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { getWarCostUpTo } from '@/features/timeline/data/war-costs';
import { getConsumerImpactUpTo } from '@/features/impact/data/consumer-impact';
import { IconSkull, IconBomb, IconAlertTriangle, IconReceipt, IconX, IconChevronUp, IconMap } from '@tabler/icons-react';

const FireMap = dynamic(() => import('@/features/map/components/fire-map'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full items-center justify-center bg-black/50'>
      <p className='text-muted-foreground animate-pulse'>Loading map...</p>
    </div>
  )
});

function formatBillions(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}T`;
  if (n >= 100) return `$${n.toFixed(0)}B`;
  return `$${n.toFixed(1)}B`;
}

// ── Floating stats for map mode (collapsible) ──
function FloatingStats() {
  const timelineDate = useFireStore((s) => s.timelineDate);
  const [collapsed, setCollapsed] = useState(false);

  const visibleFacilityIds = getVisibleFacilityIds(timelineDate);
  const supply = getSupplyDisruptionUpTo(visibleFacilityIds, timelineDate);
  const casualties = getCasualtiesUpTo(timelineDate);
  const cost = getWarCostUpTo(timelineDate);
  const impact = getConsumerImpactUpTo(timelineDate);

  const disruptionColors: Record<string, string> = {
    normal: 'text-green-600 dark:text-green-400', mild: 'text-yellow-600 dark:text-yellow-400', severe: 'text-orange-600 dark:text-orange-400',
    crisis: 'text-red-600 dark:text-red-400', catastrophe: 'text-red-700 dark:text-red-500',
  };
  const disruptionColor = disruptionColors[supply.level] || disruptionColors.normal;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className='absolute top-3 right-3 z-10 rounded-xl border border-gray-300 dark:border-zinc-700/80 bg-white/80 dark:bg-black/70 backdrop-blur-md px-3 py-2 shadow-2xl cursor-pointer w-[200px]'
      >
        <div className='flex items-center gap-2 mb-1'>
          <IconSkull className='h-4 w-4 text-red-600 dark:text-red-500' />
          <span className='text-base font-black text-red-600 dark:text-red-500 tabular-nums'>{casualties.totalKilled.toLocaleString()}+</span>
          <span className='text-[10px] text-gray-500 dark:text-zinc-500'>killed</span>
        </div>
        <div className='flex items-center gap-2 mb-1'>
          <IconBomb className='h-3.5 w-3.5 text-gray-900 dark:text-white' />
          <span className='text-sm font-black text-gray-900 dark:text-white tabular-nums'>{formatBillions(cost.totalBillions)}</span>
          <span className='text-[10px] text-gray-500 dark:text-zinc-500'>war cost</span>
        </div>
        <div className='flex items-center gap-2 mb-1'>
          <IconAlertTriangle className={`h-3.5 w-3.5 ${disruptionColor}`} />
          <span className={`text-sm font-black tabular-nums ${disruptionColor}`}>{supply.productionPct.toFixed(1)}%</span>
          <span className='text-[10px] text-gray-500 dark:text-zinc-500'>offline</span>
        </div>
        <div className='flex items-center gap-2'>
          <IconReceipt className='h-3.5 w-3.5 text-orange-600 dark:text-orange-400' />
          <span className='text-sm font-black text-orange-600 dark:text-orange-400 tabular-nums'>+${impact.totalMonthlyExtra}</span>
          <span className='text-[10px] text-gray-500 dark:text-zinc-500'>/mo</span>
        </div>
      </button>
    );
  }

  return (
    <div
      className='absolute top-3 right-3 z-10 w-[340px] max-h-[calc(100dvh-140px)] rounded-xl border border-gray-300 dark:border-zinc-700/80 bg-white/75 dark:bg-black/70 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col'
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('a') || target.closest('button[data-collapse]')) {
          setCollapsed(true);
        }
      }}
    >
      <button
        onClick={() => setCollapsed(true)}
        className='absolute top-1.5 right-1.5 z-20 rounded-full p-0.5 text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer'
      >
        <IconX className='h-3.5 w-3.5' />
      </button>
      <div className='overflow-y-auto flex-1'>
        <DeepDivePanel />
      </div>
      <button
        onClick={() => setCollapsed(true)}
        className='flex items-center justify-center gap-1 w-full px-3 py-1 text-[11px] text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors cursor-pointer border-t border-gray-200 dark:border-zinc-800'
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
          Real-time conflict impact analysis. Three numbers that matter: CO&#8322; emissions, energy cost to your household, and the human toll.
        </p>
        <div className='space-y-1.5 text-xs text-muted-foreground'>
          <p><strong className='text-foreground'>Scroll the feed</strong> to travel through the conflict timeline</p>
          <p><strong className='text-foreground'>Data panel</strong> breaks down how each category affects you</p>
          <p><strong className='text-foreground'>Peril gauge</strong> shows how close we are to historical crisis levels</p>
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
        <button
          onClick={() => setMapMode(false)}
          className='absolute top-3 left-14 z-10 rounded-xl border border-gray-300 dark:border-zinc-700/80 bg-white/95 dark:bg-black/90 backdrop-blur-md px-3 py-2 shadow-2xl cursor-pointer flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors'
        >
          <span className='text-xs font-bold text-gray-700 dark:text-zinc-300'>← Feed</span>
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
    <div className='relative h-[calc(100dvh-64px)] w-full flex flex-col bg-gray-50 dark:bg-zinc-950'>
      <WelcomeOverlay />

      {/* Hero row: three pillars + map button */}
      <div className='shrink-0 flex items-center px-3 py-1.5 md:py-2 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10'>
        <HeroPills />
        <button
          onClick={() => setMapMode(true)}
          className='shrink-0 ml-2 flex items-center gap-1 rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 px-2 py-1 text-[11px] font-bold text-gray-500 dark:text-zinc-400 transition-colors cursor-pointer hidden md:flex'
        >
          <IconMap className='h-3 w-3' />
          Map
        </button>
      </div>


      {/* Mobile: tabs (Feed / Data) + map icon */}
      <div className='md:hidden flex-1 min-h-0'>
        <MobileTabs onFlyTo={handleFlyTo} onMapMode={() => setMapMode(true)} />
      </div>

      {/* Desktop: data panel + feed side by side */}
      <div className='hidden md:flex flex-1 min-h-0'>
        <div className='w-[340px] shrink-0 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/90'>
          <DeepDivePanel onMapMode={() => setMapMode(true)} />
        </div>
        <div className='flex-1 min-w-0'>
          <EventFeed onFlyTo={handleFlyTo} fullPage />
        </div>
      </div>

      {/* Timeline scrubber — bottom */}
      <TimelineScrubber />
    </div>
  );
}
