'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  conflictEvents,
  getEventsUpTo,
  CATEGORY_COLORS,
  type ConflictEvent
} from '../data/conflict-events';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires } from '@/features/fires/data/curated-fires';

// ── Build day-by-day date array from first event to today ──
function buildDayArray(): string[] {
  const start = new Date('2023-10-07T00:00:00');
  const end = new Date('2026-03-21T00:00:00');
  const days: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const ALL_DAYS = buildDayArray();

// Build a lookup: date → events on that date
const EVENTS_BY_DATE = new Map<string, ConflictEvent[]>();
for (const event of conflictEvents) {
  const existing = EVENTS_BY_DATE.get(event.date) || [];
  existing.push(event);
  EVENTS_BY_DATE.set(event.date, existing);
}

// Dates that have events (for tick marks)
const EVENT_DATES = Array.from(EVENTS_BY_DATE.keys()).sort();

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysSince(from: string, to: string): number {
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}

interface TimelineScrubberProps {
  onFlyTo?: (lat: number, lng: number, zoom: number) => void;
}

export default function TimelineScrubber({ onFlyTo }: TimelineScrubberProps) {
  const [currentIndex, setCurrentIndex] = useState(ALL_DAYS.length - 1);
  const setTimelineDate = useFireStore((s) => s.setTimelineDate);
  const setSelectedFacility = useFireStore((s) => s.setSelectedFacility);

  const currentDate = ALL_DAYS[currentIndex];
  const todayEvents = EVENTS_BY_DATE.get(currentDate) || [];
  const dayNumber = daysSince('2023-10-07', currentDate);

  // ── Sync timeline date to global store ──
  useEffect(() => {
    setTimelineDate(currentDate);
  }, [currentDate, setTimelineDate]);

  // ── Sync scrubber when user clicks a pin on the map ──
  useEffect(() => {
    const handler = (e: Event) => {
      const { eventId } = (e as CustomEvent).detail;
      const ev = conflictEvents.find(c => c.id === eventId);
      if (!ev) return;
      const idx = ALL_DAYS.indexOf(ev.date);
      if (idx >= 0) setCurrentIndex(idx);
    };
    window.addEventListener('timeline-sync', handler);
    return () => window.removeEventListener('timeline-sync', handler);
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
  }, []);

  // Event tick positions on the slider
  const eventTicks = useMemo(() => {
    return EVENT_DATES.map((date) => {
      const idx = ALL_DAYS.indexOf(date);
      const pct = (idx / (ALL_DAYS.length - 1)) * 100;
      const events = EVENTS_BY_DATE.get(date) || [];
      const color = events.length > 0 ? CATEGORY_COLORS[events[events.length - 1].category] : '#666';
      return { date, pct, color };
    });
  }, []);

  // Tooltip for today's event
  const eventSummary = todayEvents.length > 0
    ? todayEvents.map(e => e.title).join(' | ')
    : null;

  return (
    <div className='shrink-0 border-t border-zinc-700 bg-zinc-900/95 backdrop-blur-md px-4 py-3'>
      {/* Date + day counter */}
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-bold text-white'>
          {formatDate(currentDate)}
        </span>
        <span className='text-sm font-bold text-zinc-400 tabular-nums'>
          Day {dayNumber}
        </span>
      </div>

      {/* Event summary for this date */}
      {eventSummary && (
        <div className='text-xs text-orange-400 font-medium mb-2 truncate' title={eventSummary}>
          {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''}: {eventSummary}
        </div>
      )}

      {/* Wide slider with event ticks */}
      <div className='relative'>
        <input
          type='range'
          min={0}
          max={ALL_DAYS.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className='w-full h-3 accent-orange-500 cursor-pointer relative z-10 rounded-full'
          style={{ background: 'transparent' }}
        />
        {/* Track background */}
        <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-zinc-800 pointer-events-none'>
          {/* Progress fill */}
          <div
            className='h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500'
            style={{ width: `${(currentIndex / (ALL_DAYS.length - 1)) * 100}%` }}
          />
        </div>
        {/* Event tick marks */}
        <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 pointer-events-none'>
          {eventTicks.map((tick) => (
            <div
              key={tick.date}
              className='absolute w-0.5 h-4 -mt-1 rounded-full'
              style={{
                left: `${tick.pct}%`,
                backgroundColor: tick.color,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>

      {/* Year labels */}
      <div className='flex justify-between mt-1.5'>
        <span className='text-xs text-zinc-500'>Oct 2023</span>
        <span className='text-xs text-zinc-500'>2024</span>
        <span className='text-xs text-zinc-500'>2025</span>
        <span className='text-xs text-zinc-500'>Mar 2026</span>
      </div>
    </div>
  );
}
