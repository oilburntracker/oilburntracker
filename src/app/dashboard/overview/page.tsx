'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import MapControls from '@/features/map/components/map-controls';
import FacilityDrawer from '@/features/fires/components/facility-drawer';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires, getCurrentDisruptionLevel } from '@/features/fires/data/curated-fires';
import { IconFlame, IconBuildingFactory, IconWorld, IconAlertTriangle } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

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
  const lastUpdated = useFireStore((s) => s.lastUpdated);

  const activeFires = fireData.features.length;

  const activeStrikeCount = curatedFires.filter(
    (f) => f.status === 'active_fire' || f.status === 'damaged'
  ).length;

  const disruption = getCurrentDisruptionLevel();
  const disruptionColor = DISRUPTION_COLORS[disruption.level] || DISRUPTION_COLORS.normal;

  return (
    <div className='absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5'>
      {/* Disruption level badge */}
      <div className={`rounded-full border ${disruptionColor} bg-background/85 backdrop-blur-md px-3 py-1 shadow-lg`}>
        <div className='flex items-center gap-1.5 text-xs font-bold'>
          <IconAlertTriangle className='h-3.5 w-3.5' />
          <span>{disruption.label}</span>
          <span className='text-muted-foreground font-normal'>({disruption.affectedPct.toFixed(1)}% global supply)</span>
        </div>
      </div>

      {/* Compact stats */}
      <div className='flex items-center gap-1.5 rounded-full border bg-background/80 backdrop-blur-md px-3 py-1.5 shadow-lg text-xs'>
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
        <div className='flex items-center gap-1' title='Facilities being monitored'>
          <IconWorld className='h-3.5 w-3.5 text-yellow-400' />
          <span className='font-semibold tabular-nums'>{curatedFires.length} tracked</span>
        </div>
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

      {/* Compact stats pill — top right */}
      <CompactStats />

      {/* Layer controls — top left */}
      <MapControls onFlyTo={handleFlyTo} />

      {/* Facility detail bottom drawer */}
      <FacilityDrawer />
    </div>
  );
}
