'use client';

import { useRef } from 'react';
import { livesLost, CATEGORY_ICONS } from '@/features/memorial/data/lives-lost';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';

export default function WhatWeLostPage() {
  const casualties = getCasualtiesUpTo(new Date().toISOString().slice(0, 10));
  const total = casualties.totalKilled;
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className='h-[calc(100dvh-64px)] w-full bg-black relative' ref={scrollRef}>
      <div className='h-full overflow-y-auto'>

        {/* ── Header ── */}
        <div className='px-6 md:px-12 pt-16 pb-12 max-w-3xl mx-auto'>
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
              Below are some of the people behind the count. Not their names — we don&apos;t want to get anyone&apos;s
              name wrong, and honestly, a name doesn&apos;t tell you who someone was.
            </p>
            <p className='text-zinc-300'>
              Instead: what they did, who needed them, and what the world doesn&apos;t get back.
            </p>
            <p className='text-zinc-600 text-base'>
              These are drawn from verified reporting by MSF, UNRWA, CPJ, WHO, the Gaza Ministry of Health,
              Israeli emergency services, and international press. Where we have a source, we link it.
              Where we don&apos;t, the entry is based on documented demographic patterns from casualty data.
            </p>
          </div>

          <div className='mt-6 flex items-center gap-4 text-sm text-zinc-600'>
            <span>{livesLost.length} entries shown</span>
            <span className='text-zinc-800'>·</span>
            <span>All regions, all sides</span>
            <span className='text-zinc-800'>·</span>
            <span>No names, no politics</span>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className='max-w-3xl mx-auto px-6 md:px-12'>
          <div className='border-t border-zinc-800' />
        </div>

        {/* ── Lives ── */}
        <div className='max-w-3xl mx-auto px-6 md:px-12 py-8'>
          <div className='space-y-6'>
            {livesLost.map((entry, i) => (
              <div
                key={i}
                className='py-5 border-b border-zinc-900/80'
              >
                <div className='flex items-start gap-3'>
                  <span className='text-xl mt-0.5 opacity-30 shrink-0' aria-hidden>
                    {CATEGORY_ICONS[entry.category]}
                  </span>
                  <div className='min-w-0'>
                    <div className='text-lg md:text-xl font-bold text-white leading-snug'>
                      {entry.humanity}
                    </div>
                    <div className='mt-2 text-base md:text-lg text-zinc-400 leading-relaxed'>
                      {entry.lost}
                    </div>
                    <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600'>
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
            ))}
          </div>
        </div>

        {/* ── End ── */}
        <div className='max-w-3xl mx-auto px-6 md:px-12 py-16'>
          <div className='border-t border-zinc-800 pt-12'>
            <div className='text-4xl md:text-5xl font-black text-white tabular-nums'>
              {total.toLocaleString()}+
            </div>
            <p className='text-xl text-zinc-400 mt-4 leading-relaxed'>
              You just scrolled past {livesLost.length}. There are {(total - livesLost.length).toLocaleString()} more.
            </p>
            <p className='text-lg text-zinc-500 mt-4 leading-relaxed'>
              Every single one of them woke up that morning with something to do, someone who needed them,
              some reason to be alive. We didn&apos;t list their names because getting a name wrong is worse
              than not listing it. But they had names. They had plans. They had people waiting for them to come home.
            </p>
            <p className='text-base text-zinc-600 mt-4'>
              This page will keep growing as the war continues. Every new number is a new person.
            </p>

            <div className='mt-8 pt-6 border-t border-zinc-900 space-y-2 text-sm text-zinc-700'>
              <div className='font-bold text-zinc-500'>Sources</div>
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
              <div>
                <a href='https://data.techforpalestine.org/docs/killed-in-gaza/' target='_blank' rel='noopener noreferrer' className='text-zinc-500 hover:text-zinc-300 underline underline-offset-2'>Palestine Datasets — Killed in Gaza</a>
              </div>
            </div>

            <div className='mt-10 flex flex-wrap gap-4'>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
