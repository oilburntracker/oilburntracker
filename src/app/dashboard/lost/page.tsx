'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { livesLost, CATEGORY_ICONS } from '@/features/memorial/data/lives-lost';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';

/* ── Number Cascade ──
   After the sourced entries end, numbers keep counting.
   Starts slow, accelerates, until all ~65K scroll past.
   You feel the scale. */

function NumberCascade({ start, end }: { start: number; end: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(start);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  // Start when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Animate the count
  useEffect(() => {
    if (!started || done) return;

    const totalNumbers = end - start;
    // Total duration: ~18 seconds
    const totalDuration = 18000;
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Ease-in curve: starts slow, accelerates
      // Using cubic ease-in for dramatic acceleration
      const easedProgress = progress * progress * progress;

      const nextNum = Math.min(start + Math.floor(easedProgress * totalNumbers), end);
      setCurrent(nextNum);

      if (nextNum >= end) {
        setDone(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, done, start, end]);

  // Reset on click
  const replay = useCallback(() => {
    setCurrent(start);
    setDone(false);
    setStarted(true);
    startTimeRef.current = performance.now();
  }, [start]);

  return (
    <div ref={containerRef} className='max-w-3xl mx-auto px-6 md:px-12 py-12'>
      {/* Transition text */}
      <div className='text-center mb-10'>
        <p className='text-zinc-600 text-lg'>
          Those were {start - 1} people we could tell you about.
        </p>
        <p className='text-zinc-500 text-lg mt-2'>
          Here are the rest.
        </p>
      </div>

      {/* The counter */}
      <div className='text-center'>
        <div
          className='font-mono text-6xl md:text-8xl font-black tabular-nums leading-none transition-colors duration-300'
          style={{
            color: done
              ? '#ffffff'
              : `rgba(255, 255, 255, ${0.15 + 0.85 * Math.min((current - start) / (end - start), 1)})`,
          }}
        >
          {current.toLocaleString()}
        </div>

        {/* Speed indicator — shows how fast we're counting */}
        {started && !done && (
          <div className='mt-4 text-zinc-700 text-sm font-mono tabular-nums'>
            {current <= start + 100 && 'counting...'}
            {current > start + 100 && current <= start + 1000 && 'faster...'}
            {current > start + 1000 && current <= start + 10000 && 'faster...'}
            {current > start + 10000 && current <= start + 30000 && '...'}
            {current > start + 30000 && ''}
          </div>
        )}

        {/* Landing message */}
        {done && (
          <div className='mt-8 space-y-3 animate-in fade-in duration-1000'>
            <p className='text-zinc-400 text-xl'>
              Every one of those numbers was a person.
            </p>
            <button
              onClick={replay}
              className='mt-4 text-zinc-700 text-sm hover:text-zinc-400 transition-colors cursor-pointer'
            >
              Watch again
            </button>
          </div>
        )}
      </div>

      {/* Number trail — shows recent numbers fading out */}
      {started && !done && (
        <div className='mt-8 flex flex-wrap justify-center gap-x-3 gap-y-1 max-h-32 overflow-hidden'>
          {Array.from({ length: Math.min(40, current - start) }, (_, i) => {
            const num = current - i;
            const opacity = Math.max(0.05, 1 - i * 0.025);
            return (
              <span
                key={num}
                className='font-mono text-sm tabular-nums'
                style={{ color: `rgba(113, 113, 122, ${opacity})` }}
              >
                {num.toLocaleString()}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Page ── */

export default function WhatWeLostPage() {
  const casualties = getCasualtiesUpTo(new Date().toISOString().slice(0, 10));
  const total = casualties.totalKilled;
  const entryCount = livesLost.length;

  return (
    <div className='h-[calc(100dvh-64px)] w-full bg-black relative'>
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
            <span>{entryCount} stories shown</span>
            <span className='text-zinc-800'>·</span>
            <span>{(total - entryCount).toLocaleString()} unnamed</span>
            <span className='text-zinc-800'>·</span>
            <span>All regions, all sides</span>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className='max-w-3xl mx-auto px-6 md:px-12'>
          <div className='border-t border-zinc-800' />
        </div>

        {/* ── Lives ── */}
        <div className='max-w-3xl mx-auto px-6 md:px-12 py-8'>
          <div className='space-y-0'>
            {livesLost.map((entry, i) => (
              <div
                key={i}
                className='py-5 border-b border-zinc-900/80'
              >
                <div className='flex items-start gap-4'>
                  {/* Number */}
                  <div className='shrink-0 w-12 md:w-16 pt-0.5'>
                    <span className='font-mono text-2xl md:text-3xl font-light text-zinc-800 tabular-nums'>
                      {i + 1}
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
            ))}
          </div>
        </div>

        {/* ── Number Cascade ── */}
        <div className='border-t border-zinc-800'>
          <NumberCascade start={entryCount + 1} end={total} />
        </div>

        {/* ── End ── */}
        <div className='max-w-3xl mx-auto px-6 md:px-12 py-16'>
          <div className='border-t border-zinc-800 pt-12'>
            <div className='text-4xl md:text-5xl font-black text-white tabular-nums'>
              {total.toLocaleString()}+
            </div>
            <p className='text-xl text-zinc-400 mt-4 leading-relaxed'>
              You just read about {entryCount}. You just watched {(total - entryCount).toLocaleString()} more count past.
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
