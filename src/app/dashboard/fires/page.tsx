'use client';

import { useFireData } from '@/features/map/hooks/use-fire-data';
import { curatedFires, type FacilityStatus } from '@/features/fires/data/curated-fires';
import { useFireStore } from '@/stores/fire-store';
import { formatCO2 } from '@/features/emissions/utils/emissions-model';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconFlame, IconAlertTriangle, IconEye, IconCircleCheck, IconCircleOff, IconExternalLink, IconMapPin, IconCalendar } from '@tabler/icons-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<FacilityStatus, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline'; icon: React.ComponentType<any> }> = {
  active_fire: { label: 'Active Fire', variant: 'destructive', icon: IconFlame },
  damaged: { label: 'Damaged', variant: 'default', icon: IconAlertTriangle },
  monitoring: { label: 'Monitoring', variant: 'secondary', icon: IconEye },
  offline: { label: 'Offline', variant: 'outline', icon: IconCircleOff },
  operational: { label: 'Operational', variant: 'outline', icon: IconCircleCheck }
};

export default function FiresPage() {
  useFireData();
  const fireData = useFireStore((s) => s.fireData);

  const facilityData = curatedFires.map((facility) => {
    const nearby = fireData.features.filter(
      (f) => f.properties.matchedFacility?.id === facility.id
    );
    const maxFRP = nearby.reduce((max, f) => Math.max(max, f.properties.frp), 0);
    const totalCO2 = nearby.reduce((sum, f) => sum + f.properties.estimatedCO2TonsDay, 0);
    const liveStatus: FacilityStatus = nearby.length > 0
      ? maxFRP > 50 ? 'active_fire' : 'monitoring'
      : facility.status;

    return { ...facility, liveStatus, fireCount: nearby.length, maxFRP, totalCO2 };
  }).sort((a, b) => {
    const order: Record<FacilityStatus, number> = { active_fire: 0, damaged: 1, monitoring: 2, offline: 3, operational: 4 };
    return (order[a.liveStatus] || 4) - (order[b.liveStatus] || 4);
  });

  return (
    <PageContainer>
      <div className='space-y-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Fire & Facility List</h1>
          <p className='text-muted-foreground text-sm'>
            All {curatedFires.length} monitored facilities with live satellite fire detection status.
          </p>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {facilityData.map((f) => {
            const config = STATUS_CONFIG[f.liveStatus];
            const StatusIcon = config.icon;
            return (
              <Card key={f.id} className='flex flex-col'>
                <CardHeader className='pb-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <CardTitle className='text-base'>{f.name}</CardTitle>
                      <CardDescription>{f.country} &middot; {f.facilityType.replace('_', ' ')}</CardDescription>
                    </div>
                    <Badge variant={config.variant} className='shrink-0'>
                      <StatusIcon className='mr-1 h-3 w-3' />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2 flex-1'>
                  <p>{f.description}</p>

                  {/* Attack date */}
                  {f.attackDate && (
                    <div className='flex items-center gap-1.5 text-xs'>
                      <IconCalendar className='h-3.5 w-3.5 text-red-400' />
                      <span className='font-semibold text-red-400'>
                        Struck: {new Date(f.attackDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Strategic info */}
                  <p className='text-[11px] text-muted-foreground/80'>{f.whyItMatters}</p>

                  <div className='flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs'>
                    <span>Capacity: {(f.capacityBPD / 1000).toFixed(0)}K BPD</span>
                    <span>Global: {f.percentGlobalCapacity}%</span>
                    {f.fireCount > 0 && (
                      <>
                        <span className='text-orange-400'>FRP: {f.maxFRP.toFixed(1)} MW</span>
                        <span className='text-red-400'>CO2: {formatCO2(f.totalCO2)} t/day</span>
                      </>
                    )}
                  </div>

                  {/* Action links */}
                  <div className='flex flex-wrap gap-2 pt-2 border-t'>
                    {f.newsSourceUrl && (
                      <a
                        href={f.newsSourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[10px] font-medium hover:bg-accent transition-colors'
                      >
                        <IconExternalLink className='h-3 w-3 text-blue-400' />
                        {(() => { try { return new URL(f.newsSourceUrl).hostname.replace('www.', ''); } catch { return 'News source'; } })()}
                      </a>
                    )}
                    <Link
                      href={`/dashboard/overview`}
                      className='inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[10px] font-medium hover:bg-accent transition-colors'
                    >
                      <IconMapPin className='h-3 w-3 text-green-400' />
                      View on map
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
