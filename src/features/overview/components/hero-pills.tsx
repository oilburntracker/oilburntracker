'use client';

import { useMemo } from 'react';
import { useFireStore } from '@/stores/fire-store';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';
import { getConsumerImpactUpTo } from '@/features/impact/data/consumer-impact';
import { formatCO2, estimateCO2FromCapacity } from '@/features/emissions/utils/emissions-model';
import { curatedFires } from '@/features/fires/data/curated-fires';
import { IconFlame, IconReceipt, IconSkull } from '@tabler/icons-react';

export default function HeroPills() {
  const fireData = useFireStore((s) => s.fireData);
  const timelineDate = useFireStore((s) => s.timelineDate);

  // Only show satellite CO2 when scrubber is at today (satellite data is live)
  const isToday = timelineDate >= new Date().toISOString().slice(0, 10);
  const facilityFires = isToday
    ? fireData.features.filter(f => f.properties.matchedFacility)
    : [];
  const satelliteCO2 = facilityFires.reduce((s, f) => s + f.properties.estimatedCO2TonsDay, 0);

  // Capacity-based fallback — only for facilities attacked by scrubber date
  const capacityCO2 = useMemo(() => {
    const matchedIds = new Set(facilityFires.map(f => f.properties.matchedFacility!.id));
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
  const casualties = getCasualtiesUpTo(timelineDate);
  const impact = getConsumerImpactUpTo(timelineDate);

  const co2Label = capacityCO2 > 0 && satelliteCO2 === 0 ? 't/day CO₂ (est.)' : 't/day CO₂';

  return (
    <div className='flex items-center gap-3 md:gap-4 flex-1 min-w-0'>
      {/* CO2 */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconFlame className='h-5 w-5 text-orange-600 shrink-0' />
        <div className='min-w-0'>
          <div className='text-base md:text-lg font-black text-orange-700 dark:text-orange-500 tabular-nums leading-none'>
            {totalCO2 > 0 ? formatCO2(totalCO2) : '—'}
          </div>
          <div className='text-[10px] text-gray-500 leading-none mt-0.5 hidden md:block'>{co2Label}</div>
        </div>
      </div>

      <div className='w-px h-7 bg-gray-300 dark:bg-zinc-800 shrink-0' />

      {/* Energy cost */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconReceipt className='h-5 w-5 text-green-700 dark:text-green-500 shrink-0' />
        <div className='min-w-0'>
          <div className='text-base md:text-lg font-black text-green-800 dark:text-green-400 tabular-nums leading-none'>
            +${impact.totalMonthlyExtra}
          </div>
          <div className='text-[10px] text-gray-500 leading-none mt-0.5 hidden md:block'>/mo per household</div>
        </div>
      </div>

      <div className='w-px h-7 bg-gray-300 dark:bg-zinc-800 shrink-0' />

      {/* Human cost */}
      <a href='/dashboard/lost' className='flex items-center gap-1.5 min-w-0 group'>
        <IconSkull className='h-5 w-5 text-red-600 shrink-0 animate-pulse' />
        <span className='text-base md:text-lg font-black tabular-nums leading-none underline underline-offset-2 decoration-2 text-red-600 dark:text-red-500 decoration-red-500/60 group-hover:decoration-red-400 transition-colors'>
          {casualties.totalKilled.toLocaleString()}+ people
        </span>
      </a>
    </div>
  );
}
