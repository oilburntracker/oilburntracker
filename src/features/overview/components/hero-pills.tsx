'use client';

import { useFireStore } from '@/stores/fire-store';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';
import { getConsumerImpactUpTo } from '@/features/impact/data/consumer-impact';
import { formatCO2 } from '@/features/emissions/utils/emissions-model';
import { IconFlame, IconReceipt, IconSkull } from '@tabler/icons-react';

export default function HeroPills() {
  const fireData = useFireStore((s) => s.fireData);
  const timelineDate = useFireStore((s) => s.timelineDate);

  const totalCO2 = fireData.features.reduce((s, f) => s + f.properties.estimatedCO2TonsDay, 0);
  const casualties = getCasualtiesUpTo(timelineDate);
  const impact = getConsumerImpactUpTo(timelineDate);

  return (
    <div className='flex items-center gap-3 md:gap-4 flex-1 min-w-0'>
      {/* CO2 */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconFlame className='h-5 w-5 text-orange-600 shrink-0' />
        <div className='min-w-0'>
          <div className='text-base md:text-lg font-black text-orange-700 dark:text-orange-500 tabular-nums leading-none'>
            {totalCO2 > 0 ? formatCO2(totalCO2) : '—'}
          </div>
          <div className='text-[10px] text-gray-500 leading-none mt-0.5 hidden md:block'>t/day CO2</div>
        </div>
      </div>

      <div className='w-px h-7 bg-gray-300 dark:bg-zinc-800 shrink-0' />

      {/* Energy cost */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconReceipt className='h-5 w-5 text-amber-600 shrink-0' />
        <div className='min-w-0'>
          <div className='text-base md:text-lg font-black text-amber-700 dark:text-amber-400 tabular-nums leading-none'>
            +${impact.totalMonthlyExtra}
          </div>
          <div className='text-[10px] text-gray-500 leading-none mt-0.5 hidden md:block'>/mo per household</div>
        </div>
      </div>

      <div className='w-px h-7 bg-gray-300 dark:bg-zinc-800 shrink-0' />

      {/* Human cost */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconSkull className='h-5 w-5 text-red-600 shrink-0' />
        <div className='min-w-0'>
          <div className='text-base md:text-lg font-black text-red-700 dark:text-red-500 tabular-nums leading-none'>
            {casualties.totalKilled.toLocaleString()}+
          </div>
          <div className='text-[10px] text-gray-500 leading-none mt-0.5 hidden md:block'>killed</div>
        </div>
      </div>
    </div>
  );
}
