'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { livesLost, CATEGORY_ICONS } from '@/features/memorial/data/lives-lost';
import { generateEntry } from '@/features/memorial/lib/memorial-templates';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';

/* ── Types ── */
interface MemorialRecord {
  age: number;
  sex: number; // 0=m, 1=f
}

interface MemorialData {
  count: number;
  source: string;
  sourceUrl: string;
  records: [number, number][];
}

/* ── Data loader ── */
function useMemorialData() {
  const [data, setData] = useState<MemorialRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/memorial-data.json')
      .then(r => r.json())
      .then((d: MemorialData) => {
        setData(d.records.map(([age, sex]) => ({ age, sex })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}

/* ── Featured entry (hand-crafted, sourced) ── */
function FeaturedEntry({ entry, number }: { entry: typeof livesLost[0]; number: number }) {
  return (
    <div className='py-5 border-b border-zinc-900/80'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0 w-14 md:w-18 pt-0.5 text-right'>
          <span className='font-mono text-2xl md:text-3xl font-light text-zinc-700 tabular-nums'>
            {number.toLocaleString()}
          </span>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-start gap-2'>
            <span className='text-base mt-0.5 opacity-20 shrink-0' aria-hidden>
              {CATEGORY_ICONS[entry.category]}
            </span>
            <div>
              <div className='text-lg md:text-xl font-bold text-white leading-snug'>
                {entry.humanity}
              </div>
              <div className='mt-1.5 text-base md:text-lg text-zinc-400 leading-relaxed'>
                {entry.lost}
              </div>
            </div>
          </div>
          <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 ml-7'>
            {entry.age !== undefined && (
              <span className='tabular-nums'>
                {entry.age === 0 ? 'Newborn' : entry.age === 1 ? '1 year old' : `Age ${entry.age}`}
              </span>
            )}
            <span>{entry.region}</span>
            {entry.source && (
              <>
                <span className='text-zinc-800'>·</span>
                {entry.sourceUrl ? (
                  <a
                    href={entry.sourceUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors'
                  >
                    {entry.source}
                  </a>
                ) : (
                  <span className='text-zinc-600'>{entry.source}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Generated entry (from dataset demographics) ── */
function GeneratedEntry({ index, age, sex, number }: { index: number; age: number; sex: number; number: number }) {
  const entry = useMemo(() => generateEntry(index, age, sex), [index, age, sex]);

  return (
    <div className='py-4 border-b border-zinc-900/60'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0 w-14 md:w-18 pt-0.5 text-right'>
          <span className='font-mono text-lg md:text-xl font-light text-zinc-800 tabular-nums'>
            {number.toLocaleString()}
          </span>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='text-base md:text-lg text-zinc-300 leading-snug'>
            {entry.humanity}
          </div>
          <div className='mt-1 text-sm md:text-base text-zinc-600 leading-relaxed'>
            {entry.lost}
          </div>
          <div className='mt-1 text-xs text-zinc-700 tabular-nums'>
            {age === 0 ? 'Newborn' : age === 1 ? '1 year old' : `Age ${age}`}
            <span className='mx-2 text-zinc-800'>·</span>
            Gaza
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function WhatWeLostPage() {
  const casualties = getCasualtiesUpTo(new Date().toISOString().slice(0, 10));
  const total = casualties.totalKilled;
  const { data: records, loading } = useMemorialData();
  const scrollRef = useRef<HTMLDivElement>(null);

  const featuredCount = livesLost.length;
  const datasetCount = records?.length ?? 0;
  const totalEntries = featuredCount + datasetCount;

  // Header + separator + footer are outside the virtualizer
  // Only the entries list is virtualized
  const virtualizer = useVirtualizer({
    count: totalEntries,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => i < featuredCount ? 140 : 100,
    overscan: 20,
  });

  // Current scroll position for the counter
  const [visibleIndex, setVisibleIndex] = useState(0);
  useEffect(() => {
    const items = virtualizer.getVirtualItems();
    if (items.length > 0) {
      setVisibleIndex(items[items.length - 1].index + 1);
    }
  });

  return (
    <div className='h-[calc(100dvh-64px)] w-full bg-black relative'>
      <div className='h-full overflow-y-auto' ref={scrollRef}>

        {/* ── Header ── */}
        <div className='px-6 md:px-12 pt-16 pb-12 max-w-4xl mx-auto'>
          <div className='text-5xl md:text-7xl font-black text-white tabular-nums leading-none'>
            {total.toLocaleString()}+
          </div>
          <div className='text-lg text-zinc-500 font-bold mt-3'>
            people killed since October 7, 2023
          </div>

          <div className='mt-8 space-y-4 text-zinc-400 text-lg leading-relaxed'>
            <p>
              You can&apos;t feel that number. Nobody can. So we&apos;re not going to try to make you feel all of it.
            </p>
            <p>
              Below are {featuredCount.toLocaleString()} people we could tell you about — drawn from verified reporting.
              Below those, {datasetCount.toLocaleString()} more from the Gaza Ministry of Health&apos;s identified victim list.
              Not names. What they were.
            </p>
            <p className='text-zinc-300'>
              Every number is a real person. Scroll.
            </p>
          </div>

          <div className='mt-6 flex items-center gap-4 text-sm text-zinc-600'>
            <span>{totalEntries.toLocaleString()} identified</span>
            <span className='text-zinc-800'>·</span>
            <span>{(total - totalEntries).toLocaleString()} unidentified</span>
            <span className='text-zinc-800'>·</span>
            <span>All sides</span>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className='max-w-4xl mx-auto px-6 md:px-12'>
          <div className='border-t border-zinc-800' />
        </div>

        {/* ── Floating counter ── */}
        <div className='sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-zinc-900'>
          <div className='max-w-4xl mx-auto px-6 md:px-12 py-2 flex items-center justify-between'>
            <span className='font-mono text-sm text-zinc-600 tabular-nums'>
              {Math.min(visibleIndex, totalEntries).toLocaleString()} of {totalEntries.toLocaleString()}
            </span>
            <span className='text-xs text-zinc-700'>
              {visibleIndex <= featuredCount ? 'Verified stories' : 'Identified victims'}
            </span>
          </div>
        </div>

        {/* ── Virtualized list ── */}
        <div className='max-w-4xl mx-auto px-6 md:px-12'>
          {loading ? (
            <div className='py-20 text-center text-zinc-600'>Loading {total.toLocaleString()} lives...</div>
          ) : (
            <div
              style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const idx = virtualRow.index;
                const number = idx + 1;

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {idx < featuredCount ? (
                      <FeaturedEntry entry={livesLost[idx]} number={number} />
                    ) : records ? (
                      <GeneratedEntry
                        index={idx - featuredCount}
                        age={records[idx - featuredCount].age}
                        sex={records[idx - featuredCount].sex}
                        number={number}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Transition between featured and dataset ── */}
          {!loading && records && visibleIndex > featuredCount - 5 && visibleIndex < featuredCount + 5 && (
            <div className='fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur px-4 py-2 rounded-lg text-sm text-zinc-400 z-20'>
              Those were the ones we could tell you about. Here are {datasetCount.toLocaleString()} more.
            </div>
          )}
        </div>

        {/* ── End ── */}
        <div className='max-w-4xl mx-auto px-6 md:px-12 py-16'>
          <div className='border-t border-zinc-800 pt-12'>
            <div className='text-4xl md:text-5xl font-black text-white tabular-nums'>
              {totalEntries.toLocaleString()}
            </div>
            <p className='text-xl text-zinc-400 mt-4 leading-relaxed'>
              identified. {(total - totalEntries).toLocaleString()} more were never identified.
            </p>
            <p className='text-lg text-zinc-500 mt-4 leading-relaxed'>
              Every single one of them woke up that morning with something to do, someone who needed them,
              some reason to be alive. We didn&apos;t list their names because getting a name wrong is worse
              than not listing it. But they had names. They had plans. They had people waiting for them to come home.
            </p>

            <div className='mt-8 pt-6 border-t border-zinc-900 space-y-2 text-sm text-zinc-700'>
              <div className='font-bold text-zinc-500'>Sources</div>
              <div>
                <a href='https://data.techforpalestine.org/docs/killed-in-gaza/' target='_blank' rel='noopener noreferrer' className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2'>Tech for Palestine — Killed in Gaza dataset (60,199 identified)</a>
              </div>
              <div>
                <a href='https://airwars.org/moh-list/' target='_blank' rel='noopener noreferrer' className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2'>Airwars — Gaza MoH identified victim list</a>
              </div>
              <div>
                <a href='https://www.doctorswithoutborders.org/latest/remembering-our-colleagues-killed-gaza' target='_blank' rel='noopener noreferrer' className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2'>MSF — Staff killed in Gaza</a>
              </div>
              <div>
                <a href='https://cpj.org/2024/05/journalist-casualties-in-the-israel-gaza-conflict/' target='_blank' rel='noopener noreferrer' className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2'>CPJ — Journalist casualties</a>
              </div>
              <div>
                <a href='https://www.unrwa.org/resources/reports/unrwa-situation-report' target='_blank' rel='noopener noreferrer' className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2'>UNRWA — Staff and teacher casualties</a>
              </div>
              <div>
                <a href='https://until.radicaldata.org/en/database' target='_blank' rel='noopener noreferrer' className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2'>Until — Preserving human stories from Gaza</a>
              </div>
            </div>

            <div className='mt-10 flex flex-wrap gap-4'>
              <button
                onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className='px-6 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 font-bold hover:border-zinc-600 hover:text-zinc-200 transition-colors cursor-pointer'
              >
                Back to top
              </button>
              <a
                href='/dashboard/overview'
                className='px-6 py-2.5 rounded-lg bg-zinc-900 text-zinc-300 font-bold hover:bg-zinc-800 transition-colors'
              >
                See the numbers
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
