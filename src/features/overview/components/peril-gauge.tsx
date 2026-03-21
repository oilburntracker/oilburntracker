'use client';

import { useMemo } from 'react';
import { useFireStore } from '@/stores/fire-store';
import { getNuclearStatusUpTo, getVisibleFacilityIds, getRecentEventStats } from '@/features/timeline/data/conflict-events';
import { getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { computePerilScore, HISTORICAL_ANCHORS } from '@/lib/peril-score';

export default function PerilGauge() {
  const timelineDate = useFireStore((s) => s.timelineDate);

  const peril = useMemo(() => {
    const nuclear = getNuclearStatusUpTo(timelineDate);
    const facilityIds = getVisibleFacilityIds(timelineDate);
    const supply = getSupplyDisruptionUpTo(facilityIds, timelineDate);
    const stats = getRecentEventStats(timelineDate);

    return computePerilScore(
      nuclear,
      supply.productionPct,
      supply.transitBlockedPct,
      stats.eventsLast7,
      stats.severeEventsLast30,
      stats.totalEvents
    );
  }, [timelineDate]);

  return (
    <div className='px-3 md:px-4 py-2 md:py-2.5'>
      {/* Bar + score */}
      <div className='flex items-center gap-3'>
        <div className='flex-1 h-3 md:h-4 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden relative'>
          <div
            className='h-full rounded-full transition-all duration-500 ease-out'
            style={{
              width: `${peril.score}%`,
              background: `linear-gradient(90deg, #eab308 0%, #f97316 30%, #ea580c 50%, #ef4444 70%, #dc2626 100%)`,
            }}
          />
          {/* Historical anchor marks — desktop only */}
          <div className='hidden md:block'>
            {HISTORICAL_ANCHORS.map((a) => (
              <div
                key={a.label}
                className='absolute top-0 h-full w-px bg-gray-400/50 dark:bg-zinc-500/50'
                style={{ left: `${a.score}%` }}
                title={`${a.label} (${a.year})`}
              />
            ))}
          </div>
        </div>
        <div className='shrink-0 flex items-center gap-2'>
          <span
            className='text-lg md:text-xl font-black tabular-nums'
            style={{ color: peril.color }}
          >
            {peril.score}
          </span>
          <span
            className='text-xs md:text-sm font-bold uppercase tracking-wide hidden md:inline'
            style={{ color: peril.color }}
          >
            {peril.label}
          </span>
        </div>
      </div>

      {/* Historical anchors legend — desktop only */}
      <div className='hidden md:flex items-center gap-4 mt-0.5'>
        <span className='text-[10px] text-gray-400 dark:text-zinc-600 uppercase tracking-wider font-bold'>Peril</span>
        {HISTORICAL_ANCHORS.map((a) => (
          <span key={a.label} className='text-[10px] text-gray-400 dark:text-zinc-600'>
            {a.label} ({a.score})
          </span>
        ))}
      </div>
    </div>
  );
}
