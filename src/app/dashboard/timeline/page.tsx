'use client';

import dynamic from 'next/dynamic';
import { useFireData } from '@/features/map/hooks/use-fire-data';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const EmissionsTimeline = dynamic(
  () => import('@/features/emissions/components/emissions-timeline'),
  { ssr: false, loading: () => <div className='h-[400px] animate-pulse bg-muted rounded-lg' /> }
);

export default function TimelinePage() {
  useFireData();

  return (
    <PageContainer>
      <div className='space-y-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Emissions Timeline</h1>
          <p className='text-muted-foreground text-sm'>
            Estimated CO₂ emissions from satellite-detected fires, broken down by facility type.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>CO₂ Emissions Over Time</CardTitle>
            <CardDescription>
              Stacked area chart showing estimated daily CO₂ output by facility type (tons/day)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmissionsTimeline />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Methodology</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground space-y-2'>
            <p>
              CO₂ estimates are derived from Fire Radiative Power (FRP) measurements captured by
              NASA&apos;s VIIRS satellite instrument. FRP indicates the rate of radiant heat output
              from detected fires, measured in megawatts (MW).
            </p>
            <p>
              We apply facility-type-specific conversion factors to translate FRP into estimated
              CO₂ emissions (tons/day). Refineries produce approximately 86.4 tons CO₂ per MW-day,
              while pipeline fires produce approximately 50.4 tons CO₂ per MW-day.
            </p>
            <p className='text-yellow-500'>
              These are rough estimates for awareness purposes, not precise measurements.
              Actual emissions depend on fuel composition, burn efficiency, and many other factors.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
