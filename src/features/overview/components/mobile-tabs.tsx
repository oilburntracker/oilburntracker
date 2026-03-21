'use client';

import { useState } from 'react';
import EventFeed from '@/features/timeline/components/event-feed';
import DeepDivePanel from './deep-dive-panel';
import { IconMap, IconNews, IconChartBar } from '@tabler/icons-react';

interface MobileTabsProps {
  onFlyTo: (lat: number, lng: number, zoom: number) => void;
  onMapMode: () => void;
}

export default function MobileTabs({ onFlyTo, onMapMode }: MobileTabsProps) {
  const [tab, setTab] = useState<'feed' | 'data'>('data');

  return (
    <div className='flex-1 min-h-0 flex flex-col'>
      {/* Tab bar */}
      <div className='shrink-0 flex items-center border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'>
        <button
          onClick={() => setTab('data')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
            tab === 'data' ? 'text-gray-900 dark:text-zinc-100 border-b-2 border-red-600 dark:border-orange-500' : 'text-gray-400 dark:text-zinc-500'
          }`}
        >
          <IconChartBar className='h-4 w-4' />
          Data
        </button>
        <button
          onClick={() => setTab('feed')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
            tab === 'feed' ? 'text-gray-900 dark:text-zinc-100 border-b-2 border-red-600 dark:border-orange-500' : 'text-gray-400 dark:text-zinc-500'
          }`}
        >
          <IconNews className='h-4 w-4' />
          Feed
        </button>
        <button
          onClick={onMapMode}
          className='px-3 py-2.5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 cursor-pointer'
        >
          <IconMap className='h-5 w-5' />
        </button>
      </div>

      {/* Tab content — use display:none so EventFeed observer stays mounted */}
      <div className='flex-1 min-h-0 relative'>
        <div className={`h-full ${tab === 'data' ? '' : 'hidden'}`}>
          <DeepDivePanel />
        </div>
        <div className={`h-full ${tab === 'feed' ? '' : 'hidden'}`}>
          <EventFeed onFlyTo={onFlyTo} fullPage />
        </div>
      </div>
    </div>
  );
}
