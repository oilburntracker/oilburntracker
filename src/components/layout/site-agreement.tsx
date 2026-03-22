'use client';

import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

const STORAGE_KEY = 'obt-agreement-v1';

export default function SiteAgreement() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const agreed = localStorage.getItem(STORAGE_KEY);
    if (!agreed) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm'>
      <div className='relative max-w-lg mx-4 rounded-xl border border-zinc-700 bg-zinc-950 p-6 md:p-8 shadow-2xl'>
        <button
          onClick={dismiss}
          className='absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer'
          aria-label='Close and agree'
        >
          <IconX className='h-5 w-5' />
        </button>

        <h2 className='text-2xl font-black text-white'>OilBurnTracker</h2>
        <p className='text-sm text-zinc-500 mt-1'>Open source conflict impact analysis</p>

        <div className='mt-5 space-y-3 text-sm text-zinc-400 leading-relaxed'>
          <p>
            This site tracks the real-world impact of ongoing conflicts using verified, open-source data.
            Every number comes from a documented source — satellite imagery, government reports, UN agencies,
            or international press.
          </p>
          <p>
            We cover all sides. We don&apos;t pick one. The data includes casualties from Gaza, Israel,
            Lebanon, the West Bank, and Iran. Facility damage, emissions estimates, and economic impact
            are derived from publicly available datasets.
          </p>
          <p className='text-zinc-300'>
            This site contains graphic descriptions of war casualties, including children and infants.
            The memorial section documents over 60,000 identified victims by what they were to the world —
            not by name.
          </p>
        </div>

        <div className='mt-5 pt-4 border-t border-zinc-800 space-y-2 text-xs text-zinc-600'>
          <p>No accounts. No tracking. No cookies except to remember this agreement.</p>
          <p>
            All code is open source. All data sources are linked. If we got something wrong,{' '}
            <a
              href='https://github.com/oilburntracker/oilburntracker'
              target='_blank'
              rel='noopener noreferrer'
              className='text-zinc-400 hover:text-white underline underline-offset-2 transition-colors'
            >
              open an issue
            </a>.
          </p>
        </div>

        <p className='mt-4 text-[11px] text-zinc-700 text-center'>
          Close to continue
        </p>
      </div>
    </div>
  );
}
