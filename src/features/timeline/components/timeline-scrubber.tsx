'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  allEvents,
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
  const end = new Date();
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
for (const event of allEvents) {
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
  const storedDate = useFireStore((s) => s.timelineDate);
  const setTimelineDate = useFireStore((s) => s.setTimelineDate);
  const foundIndex = ALL_DAYS.indexOf(storedDate);
  const [currentIndex, setCurrentIndex] = useState(foundIndex >= 0 ? foundIndex : ALL_DAYS.length - 1);

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
      const color = events.length > 0 ? CATEGORY_COLORS[events[events.length - 1].category] : '#999';
      return { date, pct, color };
    });
  }, []);

  const eventSummary = todayEvents.length > 0
    ? todayEvents.map(e => e.title).join(' | ')
    : null;

  return (
    <div className='shrink-0 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/95 px-4 py-2'>
      {/* Custom slider thumb styles */}
      <style>{`
        .timeline-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: grab;
          position: relative;
          z-index: 10;
        }
        .timeline-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.15);
          background: #1d4ed8;
        }
        .timeline-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: grab;
        }
        .timeline-slider::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.15);
          background: #1d4ed8;
        }
        @media (prefers-color-scheme: dark) {
          .timeline-slider::-webkit-slider-thumb {
            background: #f97316;
            border-color: #27272a;
          }
          .timeline-slider::-moz-range-thumb {
            background: #f97316;
            border-color: #27272a;
          }
        }
        .dark .timeline-slider::-webkit-slider-thumb {
          background: #f97316;
          border-color: #27272a;
        }
        .dark .timeline-slider::-moz-range-thumb {
          background: #f97316;
          border-color: #27272a;
        }
      `}</style>

      {/* Date + day counter */}
      <div className='flex items-center justify-between mb-0.5'>
        <span className='text-sm font-black text-gray-900 dark:text-white'>
          {formatDate(currentDate)}
        </span>
        <span className='text-sm font-bold text-gray-500 dark:text-zinc-400 tabular-nums'>
          Day {dayNumber}
        </span>
      </div>

      {/* Event summary for this date */}
      {eventSummary && (
        <div className='text-xs text-blue-700 dark:text-orange-400 font-medium mb-1 truncate' title={eventSummary}>
          {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''}: {eventSummary}
        </div>
      )}

      {/* Wide slider with event ticks */}
      <div className='relative py-2'>
        <input
          type='range'
          min={0}
          max={ALL_DAYS.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className='timeline-slider w-full h-5 relative z-10'
        />
        {/* Track background */}
        <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-gray-200 dark:bg-zinc-800 pointer-events-none'>
          {/* Progress fill */}
          <div
            className='h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 dark:from-yellow-500 dark:via-orange-500 dark:to-red-600'
            style={{ width: `${(currentIndex / (ALL_DAYS.length - 1)) * 100}%` }}
          />
        </div>
        {/* Event tick marks */}
        <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 pointer-events-none'>
          {eventTicks.map((tick) => (
            <div
              key={tick.date}
              className='absolute w-0.5 h-3 -mt-0.5 rounded-full'
              style={{
                left: `${tick.pct}%`,
                backgroundColor: tick.color,
                opacity: 0.5
              }}
            />
          ))}
        </div>
      </div>

      {/* Year labels */}
      <div className='flex justify-between mt-0.5'>
        <span className='text-xs text-gray-400 dark:text-zinc-500 font-medium'>Oct 2023</span>
        <span className='text-xs text-gray-400 dark:text-zinc-500 font-medium'>2024</span>
        <span className='text-xs text-gray-400 dark:text-zinc-500 font-medium'>2025</span>
        <span className='text-xs text-gray-400 dark:text-zinc-500 font-medium'>2026</span>
      </div>
    </div>
  );
}
