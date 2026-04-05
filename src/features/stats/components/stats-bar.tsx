'use client';

import { useMemo } from 'react';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires } from '@/features/fires/data/curated-fires';
import { formatCO2, estimateCO2FromCapacity } from '@/features/emissions/utils/emissions-model';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { IconFlame, IconCloud, IconBuildingFactory, IconWorld } from '@tabler/icons-react';

export default function StatsBar() {
  const fireData = useFireStore((s) => s.fireData);
  const loading = useFireStore((s) => s.loading);
  const timelineDate = useFireStore((s) => s.timelineDate);

  // Only show satellite fires when scrubber is at today
  const isToday = timelineDate >= new Date().toISOString().slice(0, 10);
  const facilityFires = isToday
    ? fireData.features.filter(f => f.properties.matchedFacility)
    : [];
  const activeFires = facilityFires.length;
  const totalDetections = fireData.features.length;
  const satelliteCO2 = facilityFires.reduce(
    (sum, f) => sum + (f.properties.estimatedCO2TonsDay || 0),
    0
  );

  // Capacity-based fallback — only for facilities attacked by scrubber date
  const capacityCO2 = useMemo(() => {
    const matchedIds = new Set(
      facilityFires
        .filter(f => f.properties.matchedFacility)
        .map(f => f.properties.matchedFacility!.id)
    );
    return curatedFires
      .filter(f => {
        if (f.status !== 'active_fire' && f.status !== 'damaged') return false;
        if (matchedIds.has(f.id)) return false;
        if (f.attackDate && f.attackDate > timelineDate) return false;
        return true;
      })
      .reduce((sum, f) => sum + estimateCO2FromCapacity(f.facilityType, f.status, f.capacityBPD, f.gasCapacityBCFD, f.storageMBBL), 0);
  }, [facilityFires, timelineDate]);

  const totalCO2 = satelliteCO2 + capacityCO2;

  // Facilities affected — use curated data filtered by scrubber date
  const facilitiesAffected = useMemo(() => {
    return curatedFires.filter(f =>
      (f.status === 'active_fire' || f.status === 'damaged' || f.status === 'offline') &&
      f.attackDate && f.attackDate <= timelineDate
    ).length;
  }, [timelineDate]);

  const globalEnergyAtRisk = useMemo(() => {
    return curatedFires
      .filter(f =>
        (f.status === 'active_fire' || f.status === 'damaged' || f.status === 'offline') &&
        f.attackDate && f.attackDate <= timelineDate
      )
      .reduce((sum, f) => sum + (f.percentGlobalCapacity || 0), 0);
  }, [timelineDate]);

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardDescription>Facility Fires</CardDescription>
            <IconFlame className='text-orange-500 h-4 w-4' />
          </div>
          <CardTitle className='text-2xl tabular-nums'>
            {loading ? '...' : isToday ? activeFires.toLocaleString() : facilitiesAffected.toLocaleString()}
          </CardTitle>
          <p className='text-xs text-muted-foreground'>
            {loading ? '' : isToday ? `of ${totalDetections} satellite detections` : 'confirmed hit by this date'}
          </p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardDescription>Est. CO₂/day</CardDescription>
            <IconCloud className='text-red-400 h-4 w-4' />
          </div>
          <CardTitle className='text-2xl tabular-nums'>
            {loading ? '...' : `${formatCO2(totalCO2)} tons`}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardDescription>Facilities Hit</CardDescription>
            <IconBuildingFactory className='text-yellow-500 h-4 w-4' />
          </div>
          <CardTitle className='text-2xl tabular-nums'>
            {loading ? '...' : facilitiesAffected}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardDescription>Global Energy at Risk</CardDescription>
            <IconWorld className='text-cyan-400 h-4 w-4' />
          </div>
          <CardTitle className='text-2xl tabular-nums'>
            {loading ? '...' : `${globalEnergyAtRisk.toFixed(1)}%`}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
