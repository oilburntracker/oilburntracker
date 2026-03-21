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
    <div className='flex items-center gap-2 md:gap-3 flex-1 min-w-0'>
      {/* CO2 */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconFlame className='h-4 w-4 text-orange-500 shrink-0' />
        <div className='min-w-0'>
          <div className='text-sm md:text-base font-black text-orange-500 tabular-nums leading-none'>
            {totalCO2 > 0 ? formatCO2(totalCO2) : '—'}
          </div>
          <div className='text-[9px] text-zinc-500 leading-none mt-0.5 hidden md:block'>t/day CO2</div>
        </div>
      </div>

      <div className='w-px h-6 bg-zinc-800 shrink-0' />

      {/* Energy cost */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconReceipt className='h-4 w-4 text-amber-400 shrink-0' />
        <div className='min-w-0'>
          <div className='text-sm md:text-base font-black text-amber-400 tabular-nums leading-none'>
            +${impact.totalMonthlyExtra}
          </div>
          <div className='text-[9px] text-zinc-500 leading-none mt-0.5 hidden md:block'>/mo per household</div>
        </div>
      </div>

      <div className='w-px h-6 bg-zinc-800 shrink-0' />

      {/* Human cost */}
      <div className='flex items-center gap-1.5 min-w-0'>
        <IconSkull className='h-4 w-4 text-red-500 shrink-0' />
        <div className='min-w-0'>
          <div className='text-sm md:text-base font-black text-red-500 tabular-nums leading-none'>
            {casualties.totalKilled.toLocaleString()}+
          </div>
          <div className='text-[9px] text-zinc-500 leading-none mt-0.5 hidden md:block'>killed</div>
        </div>
      </div>
    </div>
  );
}
