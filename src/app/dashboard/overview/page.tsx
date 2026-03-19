'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import StatsBar from '@/features/stats/components/stats-bar';
import FireList from '@/features/fires/components/fire-list';
import MapControls from '@/features/map/components/map-controls';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import { useFireStore } from '@/stores/fire-store';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const FireMap = dynamic(() => import('@/features/map/components/fire-map'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full items-center justify-center bg-black/50'>
      <p className='text-muted-foreground animate-pulse'>Loading map...</p>
    </div>
  )
});

export default function OverviewPage() {
  useFireData();
  const lastUpdated = useFireStore((s) => s.lastUpdated);
  const loading = useFireStore((s) => s.loading);

  const handleFlyTo = useCallback((lat: number, lng: number, zoom?: number) => {
    window.dispatchEvent(
      new CustomEvent('map-flyto', { detail: { lng, lat, zoom: zoom || 10 } })
    );
  }, []);

  return (
    <div className='flex h-[calc(100dvh-64px)] flex-col'>
      {/* Stats */}
      <div className='shrink-0 p-3 pb-0'>
        <div className='flex items-center justify-between mb-3'>
          <h1 className='text-lg font-bold'>OilBurnTracker</h1>
          <div className='flex items-center gap-2'>
            {loading && (
              <Badge variant='outline' className='animate-pulse text-xs'>
                Updating...
              </Badge>
            )}
            {lastUpdated && (
              <span className='text-xs text-muted-foreground'>
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        <StatsBar />
      </div>

      {/* Map + Sidebar */}
      <div className='flex flex-1 min-h-0 mt-3'>
        {/* Map */}
        <div className='relative flex-1'>
          <MapControls onFlyTo={handleFlyTo} />
          <FireMap />
        </div>

        {/* Fire List Sidebar (hidden on mobile) */}
        <div className='hidden w-80 border-l lg:block'>
          <FireList onFlyTo={(lat, lng) => handleFlyTo(lat, lng, 10)} />
        </div>
      </div>
    </div>
  );
}
