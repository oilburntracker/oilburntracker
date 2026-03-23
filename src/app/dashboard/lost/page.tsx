'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { livesLost, CATEGORY_ICONS } from '@/features/memorial/data/lives-lost';
import { generateEntry, REGION_NAMES } from '@/features/memorial/lib/memorial-templates';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';
import { IconHeart } from '@tabler/icons-react';
import SubmitDialog from '@/features/memorial/components/submit-dialog';

/* ── Types ── */
interface MemorialRecord { age: number; sex: number; region: number; date: string }
interface MemorialData { count: number; regions: string[]; records: [number, number, number, string][] }

const STORAGE_KEY = 'memorial-scroll-index';

/* ── Data loader ── */
function useMemorialData() {
  const [data, setData] = useState<MemorialRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/memorial-data.json')
      .then(r => r.json())
      .then((d: MemorialData) => {
        setData(d.records.map(([age, sex, region, date]) => ({ age, sex, region, date })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}

/* ── Saved position ── */
function getSavedIndex(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? parseInt(v, 10) : 0;
  } catch { return 0; }
}

function saveIndex(index: number) {
  try { localStorage.setItem(STORAGE_KEY, String(index)); } catch {}
}

function formatDate(d: string): string {
  if (!d) return '';
  try {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

/* ── Featured entry (hand-crafted, sourced) ── */
function FeaturedEntry({ entry, number }: { entry: typeof livesLost[0]; number: number }) {
  return (
    <div className='py-5 border-b border-zinc-900/80'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0 w-16 md:w-20 pt-0.5 text-right'>
          <span className='font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-normal text-zinc-400 tabular-nums tracking-tight'>
            {number.toLocaleString()}
          </span>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-start gap-2'>
            <span className='text-base mt-0.5 opacity-20 shrink-0' aria-hidden>
              {CATEGORY_ICONS[entry.category]}
            </span>
            <div>
              <div className='text-xl md:text-2xl font-bold text-white leading-snug'>
                {entry.humanity}
              </div>
              {false && entry.sourceUrl && (
                <div className='mt-1.5 text-base md:text-lg text-zinc-400 leading-relaxed'>
                  {entry.lost}
                </div>
              )}
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
function DataEntry({ index, record, number, onRemember }: { index: number; record: MemorialRecord; number: number; onRemember: (n: number) => void }) {
  const entry = useMemo(
    () => generateEntry(index, record.age, record.sex, record.region),
    [index, record.age, record.sex, record.region]
  );
  const dateStr = formatDate(record.date);
  const regionName = REGION_NAMES[record.region] || 'Gaza';

  return (
    <div className='py-4 border-b border-zinc-900/60'>
      <div className='flex items-start gap-4'>
        <div className='shrink-0 w-16 md:w-20 pt-0.5 text-right'>
          <span className='font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-normal text-zinc-500 tabular-nums'>
            {number.toLocaleString()}
          </span>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='text-xl md:text-2xl text-zinc-300 leading-snug'>
            {entry.humanity}
          </div>
          <div className='mt-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-700 tabular-nums'>
            <span>
              {record.age === 0 ? 'Newborn' : record.age === 1 ? '1 year old' : `Age ${record.age}`}
            </span>
            <span className='text-zinc-800'>·</span>
            <span>{regionName}</span>
            {dateStr && (
              <>
                <span className='text-zinc-800'>·</span>
                <span>{dateStr}</span>
              </>
            )}
            <span className='text-zinc-800'>·</span>
            <button
              onClick={() => onRemember(number)}
              className='text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer'
            >
              remember them
            </button>
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
  const [restored, setRestored] = useState(false);

  const featuredCount = livesLost.length;
  const datasetCount = records?.length ?? 0;
  const totalEntries = featuredCount + datasetCount;

  const virtualizer = useVirtualizer({
    count: totalEntries,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => i < featuredCount ? 130 : 95,
    overscan: 40,
  });

  // Track furthest read position
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitEntry, setSubmitEntry] = useState<number | undefined>();

  const handleRemember = useCallback((n: number) => {
    setSubmitEntry(n);
    setSubmitOpen(true);
  }, []);
  useEffect(() => {
    const range = virtualizer.range;
    if (range) {
      const last = range.endIndex + 1;
      setCurrentIndex(last);
      const saved = getSavedIndex();
      if (last > saved) saveIndex(last);
    }
  });

  // Restore scroll position on load
  useEffect(() => {
    if (loading || restored || !records) return;
    const saved = getSavedIndex();
    if (saved > 10) {
      setTimeout(() => {
        virtualizer.scrollToIndex(saved - 5, { align: 'start' });
      }, 100);
    }
    setRestored(true);
  }, [loading, restored, records, virtualizer]);

  return (
    <div className='h-[calc(100dvh-64px)] w-full bg-black relative'>
      <div className='h-full overflow-y-auto' ref={scrollRef}>

        {/* ── Sticky counter ── */}
        <div className='sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-zinc-900/50'>
          <div className='max-w-4xl mx-auto px-6 md:px-12 py-1.5 flex items-center justify-between'>
            <button
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })}
              className='font-mono text-sm text-zinc-400 tabular-nums hover:text-zinc-200 transition-colors cursor-pointer'
            >
              {Math.min(currentIndex, totalEntries).toLocaleString()} of {totalEntries.toLocaleString()}
            </button>
            {getSavedIndex() > 10 && currentIndex < totalEntries - 100 && (
              <span className='text-xs text-zinc-700'>
                progress saved
              </span>
            )}
          </div>
        </div>

        {/* ── Virtualized list ── */}
        <div className='max-w-4xl mx-auto px-6 md:px-12'>
          {loading ? (
            <div className='py-20 text-center text-zinc-700 font-mono text-sm'>
              {total.toLocaleString()} people
            </div>
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
                      <DataEntry
                        index={idx - featuredCount}
                        record={records[idx - featuredCount]}
                        number={number}
                        onRemember={handleRemember}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── End ── */}
        <div className='max-w-4xl mx-auto px-6 md:px-12 py-16'>
          <div className='border-t border-zinc-800 pt-12'>
            <div className='font-[family-name:var(--font-playfair)] text-6xl md:text-8xl font-normal text-white tabular-nums'>
              {totalEntries.toLocaleString()}
            </div>
            <p className='text-lg text-zinc-500 mt-6 leading-relaxed'>
              You just scrolled past every one of them.
            </p>

            <div className='mt-10 pt-6 border-t border-zinc-900 space-y-2 text-sm text-zinc-700'>
              <div className='font-bold text-zinc-600'>Sources</div>
              <div>
                <a href='https://data.techforpalestine.org/docs/killed-in-gaza/' target='_blank' rel='noopener noreferrer' className='text-zinc-600 hover:text-zinc-300 underline underline-offset-2'>Tech for Palestine — 60,199 identified victims (Gaza)</a>
              </div>
              <div>
                <a href='https://data.techforpalestine.org/docs/datasets/' target='_blank' rel='noopener noreferrer' className='text-zinc-600 hover:text-zinc-300 underline underline-offset-2'>Tech for Palestine — West Bank daily casualties</a>
              </div>
              <div>
                <a href='https://airwars.org/moh-list/' target='_blank' rel='noopener noreferrer' className='text-zinc-600 hover:text-zinc-300 underline underline-offset-2'>Airwars — MoH identified victim list</a>
              </div>
              <div>
                <a href='https://www.doctorswithoutborders.org/latest/remembering-our-colleagues-killed-gaza' target='_blank' rel='noopener noreferrer' className='text-zinc-600 hover:text-zinc-300 underline underline-offset-2'>MSF — Staff killed in Gaza</a>
              </div>
              <div>
                <a href='https://cpj.org/2024/05/journalist-casualties-in-the-israel-gaza-conflict/' target='_blank' rel='noopener noreferrer' className='text-zinc-600 hover:text-zinc-300 underline underline-offset-2'>CPJ — Journalist casualties</a>
              </div>
              <div>
                <a href='https://www.unrwa.org/resources/reports/unrwa-situation-report' target='_blank' rel='noopener noreferrer' className='text-zinc-600 hover:text-zinc-300 underline underline-offset-2'>UNRWA — Staff and teacher casualties</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit memory FAB */}
      <button
        onClick={() => { setSubmitEntry(undefined); setSubmitOpen(true); }}
        className='absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-zinc-700 px-4 py-2.5 shadow-lg transition-colors cursor-pointer'
        aria-label='Submit a memory'
      >
        <IconHeart className='h-4 w-4 text-zinc-300' />
        <span className='text-sm text-zinc-300 font-medium'>Remember someone</span>
      </button>

      <SubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} entryNumber={submitEntry} />
    </div>
  );
}
