'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  conflictEvents,
  getEventsUpTo,
  getCasualtiesUpTo,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ConflictEvent
} from '../data/conflict-events';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires } from '@/features/fires/data/curated-fires';
import { Button } from '@/components/ui/button';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconChevronUp,
  IconChevronDown,
  IconExternalLink,
  IconBuildingFactory,
  IconBolt,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconUsers,
  IconCloud,
  IconVolume,
  IconVolumeOff
} from '@tabler/icons-react';
import { formatCO2 } from '@/features/emissions/utils/emissions-model';

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

// Dates that have events (for tick marks and skip-to)
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

// ── Cumulative stats at a given date ──
function getStatsAtDate(date: string) {
  const events = getEventsUpTo(date);
  const facilityHits = events.filter((e) => e.facilityId && (e.category === 'facility_damage' || e.category === 'military_strike'));
  const uniqueFacilities = new Set(facilityHits.map((e) => e.facilityId).filter(Boolean));

  let pctGlobal = 0;
  uniqueFacilities.forEach((id) => {
    const f = curatedFires.find((c) => c.id === id);
    if (f) pctGlobal += f.percentGlobalCapacity;
  });

  return {
    totalEvents: events.length,
    facilitiesHit: uniqueFacilities.size,
    pctGlobal: pctGlobal,
    dayNumber: daysSince('2023-10-07', date)
  };
}

export default function TimelineScrubber({ onFlyTo }: TimelineScrubberProps) {
  const [currentIndex, setCurrentIndex] = useState(ALL_DAYS.length - 1); // default to current day
  const [isPlaying, setIsPlaying] = useState(false); // paused on load — user hits play to start from beginning
  const [expanded, setExpanded] = useState(false);
  const [activeEvent, setActiveEvent] = useState<ConflictEvent | null>(null);
  const [eventSubIndex, setEventSubIndex] = useState(0); // which event within the day
  const playRef = useRef<NodeJS.Timeout | null>(null);
  const eventListRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const fireData = useFireStore((s) => s.fireData);
  const setSelectedFacility = useFireStore((s) => s.setSelectedFacility);
  const setTimelineDate = useFireStore((s) => s.setTimelineDate);
  const isMuted = useFireStore((s) => s.isMuted);
  const setIsMuted = useFireStore((s) => s.setIsMuted);

  // Live CO2 from satellite detections
  const totalCO2 = fireData.features.reduce((sum, f) => sum + f.properties.estimatedCO2TonsDay, 0);

  const currentDate = ALL_DAYS[currentIndex];
  const todayEvents = EVENTS_BY_DATE.get(currentDate) || [];
  const visibleEvents = useMemo(() => getEventsUpTo(currentDate), [currentDate]);
  const stats = useMemo(() => getStatsAtDate(currentDate), [currentDate]);
  const casualties = useMemo(() => getCasualtiesUpTo(currentDate), [currentDate]);
  const hasEvent = todayEvents.length > 0;

  // ── Playback: step through events ONE AT A TIME, fly map to each ──
  useEffect(() => {
    if (!isPlaying) return;

    const advanceDay = () => {
      setEventSubIndex(0);
      setCurrentIndex((prev) => {
        if (prev >= ALL_DAYS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    };

    const advanceToNext = () => {
      if (eventSubIndex < todayEvents.length - 1) {
        setEventSubIndex((prev) => prev + 1);
      } else {
        advanceDay();
      }
    };

    if (hasEvent) {
      const event = todayEvents[eventSubIndex] || todayEvents[0];
      const hasVideo = event?.mediaUrls?.some(m => m.type === 'youtube');

      // Focus this specific event: fly to it, set active, tell map to show popup
      if (event) {
        setActiveEvent(event);
        if (event.lat && event.lng && onFlyTo) {
          onFlyTo(event.lat, event.lng, event.zoom || 8);
        }
        window.dispatchEvent(
          new CustomEvent('map-show-event', { detail: { eventId: event.id } })
        );
      }

      if (hasVideo) {
        // Listen for YouTube video ended (state 0) via postMessage
        const onMessage = (e: MessageEvent) => {
          if (typeof e.data !== 'string') return;
          try {
            const msg = JSON.parse(e.data);
            // YouTube sends onStateChange with info.playerState = 0 when ended
            if (msg.event === 'onStateChange' && msg.info === 0) {
              advanceToNext();
            }
          } catch {}
        };
        window.addEventListener('message', onMessage);
        // Fallback: max 5 min per video in case postMessage doesn't fire
        playRef.current = setTimeout(advanceToNext, 300000);
        return () => {
          window.removeEventListener('message', onMessage);
          if (playRef.current) clearTimeout(playRef.current);
        };
      } else {
        // Non-video events: 8s display
        playRef.current = setTimeout(advanceToNext, 8000);
      }
    } else {
      // Quiet days: advance fast
      playRef.current = setTimeout(advanceDay, 50);
    }

    return () => {
      if (playRef.current) clearTimeout(playRef.current);
    };
  }, [isPlaying, currentIndex, eventSubIndex, hasEvent, todayEvents, onFlyTo]);

  // ── Sync timeline date to global store for header death toll ──
  useEffect(() => {
    setTimelineDate(currentDate);
  }, [currentDate, setTimelineDate]);

  // ── When landing on a new date, reset sub-index ──
  useEffect(() => {
    setEventSubIndex(0);
    if (todayEvents.length > 0 && !isPlaying) {
      setActiveEvent(todayEvents[0]);
    }
  }, [currentDate]);

  // ── Sync scrubber when user clicks a pin on the map ──
  useEffect(() => {
    const handler = (e: Event) => {
      const { eventId } = (e as CustomEvent).detail;
      const ev = conflictEvents.find(c => c.id === eventId);
      if (!ev) return;
      const idx = ALL_DAYS.indexOf(ev.date);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setActiveEvent(ev);
        setIsPlaying(true);
      }
    };
    window.addEventListener('timeline-sync', handler);
    return () => window.removeEventListener('timeline-sync', handler);
  }, []);

  // Scroll event list to bottom when expanded
  useEffect(() => {
    if (expanded && eventListRef.current) {
      eventListRef.current.scrollTop = eventListRef.current.scrollHeight;
    }
  }, [expanded, visibleEvents.length]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentIndex(Number(e.target.value));
  }, []);

  const togglePlay = useCallback(() => {
    if (currentIndex >= ALL_DAYS.length - 1) {
      setCurrentIndex(0);
      setActiveEvent(null);
    }
    setIsPlaying((p) => {
      if (!p) setIsMuted(false); // unmute when user hits play
      return !p;
    });
  }, [currentIndex]);

  // Skip forward/back — step through events within a day first, then jump to next date
  const skipToEvent = useCallback((direction: 1 | -1) => {
    const currentDateStr = ALL_DAYS[currentIndex];
    const dayEvents = EVENTS_BY_DATE.get(currentDateStr) || [];

    // Try stepping within the current day first
    if (direction === 1 && eventSubIndex < dayEvents.length - 1) {
      const nextIdx = eventSubIndex + 1;
      setEventSubIndex(nextIdx);
      const ev = dayEvents[nextIdx];
      if (ev) {
        setActiveEvent(ev);
        if (ev.lat && ev.lng && onFlyTo) onFlyTo(ev.lat, ev.lng, ev.zoom || 8);
        window.dispatchEvent(new CustomEvent('map-show-event', { detail: { eventId: ev.id } }));
      }
      return;
    }
    if (direction === -1 && eventSubIndex > 0) {
      const prevIdx = eventSubIndex - 1;
      setEventSubIndex(prevIdx);
      const ev = dayEvents[prevIdx];
      if (ev) {
        setActiveEvent(ev);
        if (ev.lat && ev.lng && onFlyTo) onFlyTo(ev.lat, ev.lng, ev.zoom || 8);
        window.dispatchEvent(new CustomEvent('map-show-event', { detail: { eventId: ev.id } }));
      }
      return;
    }

    // Otherwise jump to next/prev date with events
    let target: string | null = null;
    if (direction === 1) {
      target = EVENT_DATES.find((d) => d > currentDateStr) || null;
    } else {
      for (let i = EVENT_DATES.length - 1; i >= 0; i--) {
        if (EVENT_DATES[i] < currentDateStr) { target = EVENT_DATES[i]; break; }
      }
    }
    if (target) {
      const idx = ALL_DAYS.indexOf(target);
      if (idx >= 0) {
        const targetEvents = EVENTS_BY_DATE.get(target) || [];
        // Forward: start at first event. Backward: start at last event.
        const subIdx = direction === -1 ? Math.max(0, targetEvents.length - 1) : 0;
        setEventSubIndex(subIdx);
        setCurrentIndex(idx);
        setIsMuted(false);
        const ev = targetEvents[subIdx];
        if (ev) {
          setActiveEvent(ev);
          if (ev.lat && ev.lng && onFlyTo) onFlyTo(ev.lat, ev.lng, ev.zoom || 8);
          window.dispatchEvent(new CustomEvent('map-show-event', { detail: { eventId: ev.id } }));
        }
      }
    }
  }, [currentIndex, eventSubIndex, onFlyTo]);

  const handleEventClick = useCallback((event: ConflictEvent) => {
    setActiveEvent(event);
    // Jump scrubber to this event's date
    const idx = ALL_DAYS.indexOf(event.date);
    if (idx >= 0) setCurrentIndex(idx);
    if (event.lat && event.lng && onFlyTo) {
      onFlyTo(event.lat, event.lng, event.zoom || 10);
    }
    if (event.facilityId) {
      const facility = curatedFires.find((f) => f.id === event.facilityId);
      if (facility) setSelectedFacility(facility);
    }
  }, [onFlyTo, setSelectedFacility]);

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

  return (
    <div ref={scrubberRef} className='absolute bottom-0 left-0 right-0 z-10'>

      {/* Feed removed — stats panel + map pin popups are the primary UI now */}

      {/* ── Expanded full event list ── */}
      {expanded && (
        <div ref={eventListRef} className='mx-3 mb-1 max-h-[45vh] overflow-y-auto rounded-t-lg border border-b-0 bg-background/95 backdrop-blur-md'>
          <div className='p-3 space-y-1'>
            {visibleEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`w-full text-left rounded-lg p-2 transition-colors hover:bg-accent ${
                  activeEvent?.id === event.id ? 'bg-accent ring-1 ring-primary' : ''
                }`}
              >
                <div className='flex items-start gap-2'>
                  <div
                    className='mt-1.5 h-2 w-2 rounded-full shrink-0'
                    style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                  />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-[10px] text-muted-foreground font-mono'>{formatDate(event.date)}</span>
                      <span className='text-[10px] px-1.5 py-0 rounded-full' style={{ backgroundColor: CATEGORY_COLORS[event.category] + '20', color: CATEGORY_COLORS[event.category] }}>
                        {CATEGORY_LABELS[event.category]}
                      </span>
                    </div>
                    <p className='text-xs font-medium mt-0.5 leading-tight'>{event.title}</p>
                    {activeEvent?.id === event.id && (
                      <div className='mt-1.5'>
                        <p className='text-[11px] text-muted-foreground leading-relaxed'>
                          {event.description}
                        </p>
                        <div className='flex flex-wrap gap-1.5 mt-1.5'>
                          {event.sourceUrl && (
                            <a href={event.sourceUrl} target='_blank' rel='noopener noreferrer'
                              className='inline-flex items-center gap-1 text-[10px] text-primary hover:underline'
                              onClick={(e) => e.stopPropagation()}>
                              <IconExternalLink className='h-2.5 w-2.5' /> Source
                            </a>
                          )}
                          {event.mediaUrls?.map((media, i) => (
                              <a key={i} href={media.url} target='_blank' rel='noopener noreferrer'
                                className='inline-flex items-center gap-1 text-[10px] text-primary hover:underline'
                                onClick={(e) => e.stopPropagation()}>
                                <IconExternalLink className='h-2.5 w-2.5' /> {media.label || media.type}
                              </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Scrubber control bar ── */}
      <div className='border-t bg-background/90 backdrop-blur-md px-3 py-2'>
        {/* Toggle event list */}
        <button
          onClick={() => setExpanded(!expanded)}
          className='w-full flex items-center justify-center gap-1 mb-1.5 text-muted-foreground hover:text-foreground transition-colors'
        >
          <span className='text-[10px] font-medium'>
            {expanded ? 'Hide' : 'Show'} all {visibleEvents.length} events
          </span>
          {expanded
            ? <IconChevronDown className='h-3 w-3' />
            : <IconChevronUp className='h-3 w-3' />
          }
        </button>

        {/* Controls + slider */}
        <div className='flex items-center gap-2'>
          {/* Skip back */}
          <Button size='icon' variant='ghost' className='h-7 w-7 shrink-0' onClick={() => skipToEvent(-1)}>
            <IconPlayerSkipBack className='h-3.5 w-3.5' />
          </Button>

          {/* Play/pause */}
          <Button size='icon' variant='ghost' className='h-8 w-8 shrink-0' onClick={togglePlay}>
            {isPlaying
              ? <IconPlayerPause className='h-4 w-4' />
              : <IconPlayerPlay className='h-4 w-4' />
            }
          </Button>

          {/* Skip forward */}
          <Button size='icon' variant='ghost' className='h-7 w-7 shrink-0' onClick={() => skipToEvent(1)}>
            <IconPlayerSkipForward className='h-3.5 w-3.5' />
          </Button>

          {/* Audio toggle */}
          <Button
            size='icon'
            variant='ghost'
            className={`h-7 w-7 shrink-0 ${!isMuted ? 'text-orange-400' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute videos' : 'Mute videos'}
          >
            {isMuted
              ? <IconVolumeOff className='h-3.5 w-3.5' />
              : <IconVolume className='h-3.5 w-3.5' />
            }
          </Button>

          {/* Date display + event counter */}
          <div className='shrink-0 text-center w-[105px]'>
            <span className='text-xs font-mono font-semibold'>
              {formatDate(currentDate)}
            </span>
            {todayEvents.length > 1 && (
              <div className='text-[9px] text-orange-400 font-bold tabular-nums -mt-0.5'>
                {eventSubIndex + 1}/{todayEvents.length} events
              </div>
            )}
          </div>

          {/* Slider with event ticks */}
          <div className='flex-1 relative'>
            <input
              type='range'
              min={0}
              max={ALL_DAYS.length - 1}
              value={currentIndex}
              onChange={handleSliderChange}
              className='w-full h-1.5 accent-primary cursor-pointer relative z-10'
            />
            {/* Event tick marks on the slider */}
            <div className='absolute top-0 left-0 right-0 h-1.5 pointer-events-none'>
              {eventTicks.map((tick) => (
                <div
                  key={tick.date}
                  className='absolute top-0 w-0.5 h-3 -mt-[3px] rounded-full'
                  style={{
                    left: `${tick.pct}%`,
                    backgroundColor: tick.color,
                    opacity: 0.7
                  }}
                />
              ))}
            </div>
          </div>

          {/* Day counter */}
          <span className='text-[10px] text-muted-foreground tabular-nums shrink-0 w-16 text-right'>
            Day {stats.dayNumber}
          </span>
        </div>

        {/* Year labels */}
        <div className='flex justify-between mt-0.5 px-[120px]'>
          <span className='text-[9px] text-muted-foreground/50'>Oct &apos;23</span>
          <span className='text-[9px] text-muted-foreground/50'>2024</span>
          <span className='text-[9px] text-muted-foreground/50'>2025</span>
          <span className='text-[9px] text-muted-foreground/50'>Mar &apos;26</span>
        </div>
      </div>
    </div>
  );
}
