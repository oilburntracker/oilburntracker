'use client';

import { useFireStore } from '@/stores/fire-store';
import { curatedFires } from '@/features/fires/data/curated-fires';
import { formatCO2 } from '@/features/emissions/utils/emissions-model';
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

  const facilityFires = fireData.features.filter(f => f.properties.matchedFacility);
  const activeFires = facilityFires.length;
  const totalDetections = fireData.features.length;
  const totalCO2 = facilityFires.reduce(
    (sum, f) => sum + (f.properties.estimatedCO2TonsDay || 0),
    0
  );

  const matchedFacilityIds = new Set(
    fireData.features
      .filter((f) => f.properties.matchedFacility)
      .map((f) => f.properties.matchedFacility!.id)
  );
  const facilitiesAffected = matchedFacilityIds.size;

  const globalEnergyAtRisk = Array.from(matchedFacilityIds).reduce((sum, id) => {
    const facility = curatedFires.find((f) => f.id === id);
    return sum + (facility?.percentGlobalCapacity || 0);
  }, 0);

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardDescription>Facility Fires</CardDescription>
            <IconFlame className='text-orange-500 h-4 w-4' />
          </div>
          <CardTitle className='text-2xl tabular-nums'>
            {loading ? '...' : activeFires.toLocaleString()}
          </CardTitle>
          <p className='text-xs text-muted-foreground'>
            {loading ? '' : `of ${totalDetections} satellite detections`}
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
