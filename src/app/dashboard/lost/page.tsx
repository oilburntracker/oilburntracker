'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { livesLost, CATEGORY_ICONS } from '@/features/memorial/data/lives-lost';
import { getCasualtiesUpTo } from '@/features/timeline/data/conflict-events';

function formatTotal(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)},${String(n % 1000).padStart(3, '0')}`;
  return n.toLocaleString();
}

function LifeCard({ entry, index }: { entry: (typeof livesLost)[number]; index: number }) {
  return (
    <div className='min-h-[80dvh] md:min-h-[70dvh] flex items-center justify-center px-6 md:px-12'>
      <div className='max-w-2xl w-full'>
        {/* Category icon */}
        <div className='text-4xl mb-6 opacity-40' aria-hidden>
          {CATEGORY_ICONS[entry.category]}
        </div>

        {/* What they were */}
        <h2 className='text-2xl md:text-4xl font-black text-white leading-tight tracking-tight'>
          {entry.humanity}
        </h2>

        {/* Age */}
        {entry.age !== undefined && (
          <div className='mt-4 text-lg md:text-xl text-zinc-500 font-medium tabular-nums'>
            {entry.age === 0 ? 'Newborn' : entry.age === 1 ? '1 year old' : `${entry.age} years old`}
            <span className='mx-2 text-zinc-700'>·</span>
            <span className='text-zinc-600'>{entry.region}</span>
          </div>
        )}

        {/* What we lost — the gut punch */}
        <div className='mt-6 pt-6 border-t border-zinc-800'>
          <div className='text-xs uppercase tracking-[0.2em] text-zinc-600 font-bold mb-3'>
            What the world lost
          </div>
          <p className='text-xl md:text-2xl text-zinc-300 leading-relaxed font-light italic'>
            {entry.lost}
          </p>
        </div>

        {/* Entry number — reminder of scale */}
        <div className='mt-10 text-sm text-zinc-700 tabular-nums'>
          {index + 1} of {livesLost.length} stories shown
        </div>
      </div>
    </div>
  );
}

export default function WhatWeLostPage() {
  const casualties = getCasualtiesUpTo(new Date().toISOString().slice(0, 10));
  const total = casualties.totalKilled;
  const [showIntro, setShowIntro] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track which entry is in view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('[data-life-card]');
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-life-card'));
            if (!isNaN(idx)) setCurrentIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [showIntro]);

  const handleBegin = useCallback(() => {
    setShowIntro(false);
  }, []);

  // ── Intro screen ──
  if (showIntro) {
    return (
      <div className='h-[calc(100dvh-64px)] w-full bg-black flex items-center justify-center'>
        <div className='max-w-lg mx-6 text-center'>
          <div className='text-6xl md:text-8xl font-black text-white tabular-nums leading-none'>
            {formatTotal(total)}+
          </div>
          <div className='text-xl md:text-2xl text-zinc-400 font-bold mt-4'>
            people killed
          </div>

          <div className='mt-10 space-y-3 text-zinc-500 text-lg leading-relaxed'>
            <p>That number is too large to feel.</p>
            <p>So here are some of them.</p>
            <p className='text-zinc-600'>Not their names. Not their politics.</p>
            <p className='text-zinc-400 font-medium'>What they gave to the world, and what the world will never get back.</p>
          </div>

          <button
            onClick={handleBegin}
            className='mt-12 px-8 py-3 rounded-lg bg-white text-black font-black text-lg hover:bg-zinc-200 transition-colors cursor-pointer'
          >
            Bear witness
          </button>

          <p className='mt-6 text-xs text-zinc-700'>
            Every region. Every side. No names. Just humanity.
          </p>
        </div>
      </div>
    );
  }

  // ── Memorial scroll ──
  return (
    <div className='h-[calc(100dvh-64px)] w-full bg-black relative'>
      {/* Top bar — counter */}
      <div className='absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4'>
        <div className='text-sm text-zinc-600 tabular-nums'>
          <span className='text-zinc-400 font-bold'>{currentIndex + 1}</span>
          <span className='mx-1'>/</span>
          <span>{livesLost.length}</span>
          <span className='ml-3 text-zinc-700'>of {formatTotal(total)}+ total</span>
        </div>
        <div className='text-xs text-zinc-700'>
          We can only show {livesLost.length}. The rest are silence.
        </div>
      </div>

      {/* Progress bar */}
      <div className='absolute top-0 left-0 right-0 z-20 h-[2px] bg-zinc-900'>
        <div
          className='h-full bg-zinc-600 transition-all duration-300'
          style={{ width: `${((currentIndex + 1) / livesLost.length) * 100}%` }}
        />
      </div>

      {/* Scrollable memorial */}
      <div
        ref={scrollRef}
        className='h-full overflow-y-auto scroll-smooth'
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {livesLost.map((entry, i) => (
          <div
            key={i}
            data-life-card={i}
            style={{ scrollSnapAlign: 'start' }}
          >
            <LifeCard entry={entry} index={i} />
          </div>
        ))}

        {/* Final screen */}
        <div
          className='min-h-[80dvh] flex items-center justify-center px-6'
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className='max-w-xl text-center'>
            <div className='text-5xl md:text-7xl font-black text-white tabular-nums'>
              {formatTotal(total)}+
            </div>
            <div className='text-xl text-zinc-400 mt-4 font-bold'>
              You just saw {livesLost.length}.
            </div>
            <p className='text-2xl text-zinc-300 mt-8 leading-relaxed font-light'>
              The rest don&apos;t have stories here yet.
              But they had stories.
            </p>
            <p className='text-lg text-zinc-500 mt-6 leading-relaxed'>
              Every number on this site is a person who woke up that morning
              with plans, with people who loved them, with a future
              that will now never happen.
            </p>
            <p className='text-zinc-600 mt-8 text-sm'>
              This page has no ads, no tracking, no agenda.
              Just the cost of war, measured in what we&apos;ll never get back.
            </p>
            <div className='mt-10 flex justify-center gap-4'>
              <button
                onClick={() => {
                  scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className='px-6 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 font-bold hover:border-zinc-600 hover:text-zinc-200 transition-colors cursor-pointer'
              >
                Read again
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
