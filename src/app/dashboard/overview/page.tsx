'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import MapControls from '@/features/map/components/map-controls';
import FacilityDrawer from '@/features/fires/components/facility-drawer';
import TimelineScrubber from '@/features/timeline/components/timeline-scrubber';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires, getCurrentDisruptionLevel } from '@/features/fires/data/curated-fires';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';
import { IconFlame, IconBuildingFactory, IconWorld, IconAlertTriangle, IconHeart, IconUsers, IconSkull } from '@tabler/icons-react';
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
  normal: 'border-green-500/30 text-green-400',
  mild: 'border-yellow-500/40 text-yellow-400',
  severe: 'border-orange-500/50 text-orange-400',
  crisis: 'border-red-500/50 text-red-400',
  catastrophe: 'border-red-600/70 text-red-500 animate-pulse'
};

function CompactStats() {
  const fireData = useFireStore((s) => s.fireData);
  const loading = useFireStore((s) => s.loading);
  const timelineDate = useFireStore((s) => s.timelineDate);

  const activeFires = fireData.features.length;

  const activeStrikeCount = curatedFires.filter(
    (f) => f.status === 'active_fire' || f.status === 'damaged'
  ).length;

  const disruption = getCurrentDisruptionLevel();
  const disruptionColor = DISRUPTION_COLORS[disruption.level] || DISRUPTION_COLORS.normal;

  // Running total synced to timeline scrubber position
  const casualties = getCasualtiesUpTo(timelineDate);

  return (
    <div className='absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5'>
      {/* DEATH TOLL — most prominent */}
      <div className='rounded-lg border border-red-500/40 bg-red-950/80 backdrop-blur-md px-3 py-1.5 shadow-lg'>
        <div className='flex items-center gap-2'>
          <IconSkull className='h-4 w-4 text-red-400' />
          <span className='text-sm font-black text-red-400 tabular-nums'>
            {casualties.totalKilled.toLocaleString()}+ killed
          </span>
        </div>
        <div className='flex items-center gap-3 mt-0.5'>
          {casualties.totalDisplaced > 0 && (
            <span className='text-[10px] font-bold text-amber-400'>
              {(casualties.totalDisplaced / 1000000).toFixed(1)}M displaced
            </span>
          )}
          {casualties.totalChildren > 0 && (
            <span className='text-[10px] text-red-300'>
              {casualties.totalChildren.toLocaleString()}+ children
            </span>
          )}
        </div>
      </div>

      {/* Disruption level badge */}
      <div className={`rounded-full border ${disruptionColor} bg-background/85 backdrop-blur-md px-3 py-1 shadow-lg`}>
        <div className='flex items-center gap-1.5 text-xs font-bold'>
          <IconAlertTriangle className='h-3.5 w-3.5' />
          <span>{disruption.label}</span>
        </div>
      </div>

      {/* Compact stats — links to fires page */}
      <Link href='/dashboard/fires' className='flex items-center gap-1.5 rounded-full border bg-background/80 backdrop-blur-md px-3 py-1.5 shadow-lg text-xs hover:bg-accent/80 transition-colors cursor-pointer'>
        <div className='flex items-center gap-1' title='Facilities struck/damaged'>
          <IconBuildingFactory className='h-3.5 w-3.5 text-red-400' />
          <span className='font-semibold tabular-nums'>{activeStrikeCount} hit</span>
        </div>
        <span className='text-muted-foreground'>|</span>
        <div className='flex items-center gap-1' title='FIRMS satellite detections'>
          <IconFlame className='h-3.5 w-3.5 text-orange-500' />
          <span className='font-semibold tabular-nums'>{loading ? '...' : activeFires} fires</span>
        </div>
        <span className='text-muted-foreground'>|</span>
        <div className='flex items-center gap-1' title='Total facilities tracked'>
          <IconWorld className='h-3.5 w-3.5 text-yellow-400' />
          <span className='font-semibold tabular-nums'>{curatedFires.length} tracked</span>
        </div>
      </Link>

      {/* Donate button */}
      <a
        href='https://buymeacoffee.com/oilburntracker'
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-1.5 rounded-full border bg-background/80 backdrop-blur-md px-3 py-1.5 shadow-lg text-xs text-muted-foreground hover:text-foreground transition-colors'
      >
        <IconHeart className='h-3.5 w-3.5 text-pink-500' />
        <span>Support this project</span>
      </a>
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
