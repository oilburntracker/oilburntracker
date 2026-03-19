'use client';

import { curatedFires, type FacilityStatus } from '@/features/fires/data/curated-fires';
import { useFireStore } from '@/stores/fire-store';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconFlame, IconAlertTriangle, IconEye, IconCircleOff, IconCircleCheck } from '@tabler/icons-react';

const STATUS_CONFIG: Record<FacilityStatus, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline'; icon: React.ComponentType<any> }> = {
  active_fire: { label: 'Active Fire', variant: 'destructive', icon: IconFlame },
  damaged: { label: 'Damaged', variant: 'default', icon: IconAlertTriangle },
  monitoring: { label: 'Monitoring', variant: 'secondary', icon: IconEye },
  offline: { label: 'Offline', variant: 'outline', icon: IconCircleOff },
  operational: { label: 'Operational', variant: 'outline', icon: IconCircleCheck }
};

interface FireListProps {
  onFlyTo?: (lat: number, lng: number) => void;
}

export default function FireList({ onFlyTo }: FireListProps) {
  const fireData = useFireStore((s) => s.fireData);

  // Determine live status from fire data
  const facilityStatus = curatedFires.map((facility) => {
    const nearbyFires = fireData.features.filter(
      (f) => f.properties.matchedFacility?.id === facility.id
    );
    const maxFRP = nearbyFires.reduce((max, f) => Math.max(max, f.properties.frp), 0);
    const totalCO2 = nearbyFires.reduce((sum, f) => sum + f.properties.estimatedCO2TonsDay, 0);

    const liveStatus: FacilityStatus = nearbyFires.length > 0
      ? maxFRP > 50 ? 'active_fire' : 'monitoring'
      : facility.status;

    return {
      ...facility,
      liveStatus,
      fireCount: nearbyFires.length,
      maxFRP,
      totalCO2
    };
  }).sort((a, b) => {
    const order: Record<FacilityStatus, number> = { active_fire: 0, damaged: 1, monitoring: 2, offline: 3, operational: 4 };
    return (order[a.liveStatus] || 4) - (order[b.liveStatus] || 4);
  });

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-2 p-2'>
        <h3 className='px-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
          Monitored Facilities
        </h3>
        {facilityStatus.map((facility) => {
          const config = STATUS_CONFIG[facility.liveStatus];
          const StatusIcon = config.icon;

          return (
            <button
              key={facility.id}
              onClick={() => onFlyTo?.(facility.lat, facility.lng)}
              className='w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium text-sm'>{facility.name}</p>
                  <p className='text-xs text-muted-foreground'>{facility.country} &middot; {facility.facilityType}</p>
                </div>
                <Badge variant={config.variant} className='shrink-0 text-xs'>
                  <StatusIcon className='mr-1 h-3 w-3' />
                  {config.label}
                </Badge>
              </div>
              {facility.fireCount > 0 && (
                <div className='mt-2 flex gap-3 text-xs text-muted-foreground'>
                  <span>FRP: {facility.maxFRP.toFixed(1)} MW</span>
                  <span>CO₂: ~{Math.round(facility.totalCO2)} t/day</span>
                  <span>{facility.fireCount} detection{facility.fireCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
