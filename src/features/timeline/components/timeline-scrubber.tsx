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
  IconBrandYoutube,
  IconNews,
  IconBrandTwitter,
  IconBuildingFactory,
  IconAlertTriangle,
  IconBolt,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconUsers,
  IconCloud
} from '@tabler/icons-react';
import { formatCO2 } from '@/features/emissions/utils/emissions-model';

// ── Extract YouTube video ID from URL ──
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ── Build day-by-day date array from first event to today ──
function buildDayArray(): string[] {
  const start = new Date('2023-10-07T00:00:00');
  const end = new Date('2026-03-19T00:00:00');
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

const MEDIA_ICONS = {
  youtube: IconBrandYoutube,
  twitter: IconBrandTwitter,
  news: IconNews
};

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
  const [currentIndex, setCurrentIndex] = useState(ALL_DAYS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeEvent, setActiveEvent] = useState<ConflictEvent | null>(null);
  const [infoDismissed, setInfoDismissed] = useState(false);
  const playRef = useRef<NodeJS.Timeout | null>(null);
  const eventListRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const fireData = useFireStore((s) => s.fireData);
  const setSelectedFacility = useFireStore((s) => s.setSelectedFacility);
  const setTimelineDate = useFireStore((s) => s.setTimelineDate);

  // Live CO2 from satellite detections
  const totalCO2 = fireData.features.reduce((sum, f) => sum + f.properties.estimatedCO2TonsDay, 0);

  const currentDate = ALL_DAYS[currentIndex];
  const todayEvents = EVENTS_BY_DATE.get(currentDate) || [];
  const visibleEvents = useMemo(() => getEventsUpTo(currentDate), [currentDate]);
  const stats = useMemo(() => getStatsAtDate(currentDate), [currentDate]);
  const casualties = useMemo(() => getCasualtiesUpTo(currentDate), [currentDate]);
  const hasEvent = todayEvents.length > 0;

  // Click outside feed to dismiss — but NOT when tapping scrubber controls
  useEffect(() => {
    if (infoDismissed || todayEvents.length === 0 || expanded) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      // Don't dismiss if tapping inside the feed or anywhere in the scrubber bar
      if (feedRef.current?.contains(target)) return;
      if (scrubberRef.current?.contains(target)) return;
      setInfoDismissed(true);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [infoDismissed, todayEvents.length, expanded]);

  // ── Playback: skip quiet days, auto-scroll + pause on event days ──
  useEffect(() => {
    if (!isPlaying) return;

    const advance = () => {
      setCurrentIndex((prev) => {
        if (prev >= ALL_DAYS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    };

    // Event days: scale pause with content — more events = more time to read
    // Also auto-scroll the feed so user sees all content
    if (hasEvent) {
      const eventCount = todayEvents.length;
      const hasVideos = todayEvents.some(e => e.mediaUrls?.some(m => m.type === 'youtube'));
      // Base 4s per event, +3s if videos present
      const delay = (eventCount * 4000) + (hasVideos ? 3000 : 0);

      // Auto-scroll the feed slowly
      if (feedRef.current) {
        const el = feedRef.current;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        if (scrollHeight > 0) {
          const scrollDuration = delay - 500; // finish scrolling 500ms before advancing
          const startTime = Date.now();
          const scrollInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / scrollDuration, 1);
            // Ease-in-out scroll
            const ease = progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            el.scrollTop = ease * scrollHeight;
            if (progress >= 1) clearInterval(scrollInterval);
          }, 16);

          playRef.current = setTimeout(() => {
            clearInterval(scrollInterval);
            advance();
          }, delay);

          return () => {
            clearInterval(scrollInterval);
            if (playRef.current) clearTimeout(playRef.current);
          };
        }
      }

      playRef.current = setTimeout(advance, delay);
    } else {
      // Quiet days: advance fast
      playRef.current = setTimeout(advance, 50);
    }

    return () => {
      if (playRef.current) clearTimeout(playRef.current);
    };
  }, [isPlaying, currentIndex, hasEvent, todayEvents]);

  // ── Sync timeline date to global store for header death toll ──
  useEffect(() => {
    setTimelineDate(currentDate);
  }, [currentDate, setTimelineDate]);

  // ── When landing on an event, fly to it and show card ──
  useEffect(() => {
    setInfoDismissed(false);
    if (feedRef.current) feedRef.current.scrollTop = 0;
    if (todayEvents.length > 0) {
      const latest = todayEvents[todayEvents.length - 1];
      setActiveEvent(latest);
      if (latest.lat && latest.lng && onFlyTo) {
        onFlyTo(latest.lat, latest.lng, latest.zoom || 8);
      }
    }
  }, [currentDate]);

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
    setIsPlaying((p) => !p);
  }, [currentIndex]);

  // Skip to next/prev event
  const skipToEvent = useCallback((direction: 1 | -1) => {
    setIsPlaying(false);
    const currentDateStr = ALL_DAYS[currentIndex];
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
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [currentIndex]);

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

      {/* ── Scrolling news feed — all events for current day ── */}
      {todayEvents.length > 0 && !expanded && !infoDismissed && (
        <div ref={feedRef} className='mx-3 mb-2 max-w-lg max-h-[55vh] overflow-y-auto rounded-lg border bg-background/95 backdrop-blur-md shadow-2xl'
          onTouchStart={() => setIsPlaying(false)}
        >
          {/* Running death toll — sticky header */}
          {(casualties.totalKilled > 0 || casualties.totalDisplaced > 0) && (
            <div className='sticky top-0 z-10 px-4 py-2 bg-red-950/90 backdrop-blur-md flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-red-500/30'>
              <span className='flex items-center gap-2 text-base font-black text-red-400'>
                <IconUsers className='h-5 w-5' />
                {casualties.totalKilled.toLocaleString()}+ killed
              </span>
              {casualties.totalDisplaced > 0 && (
                <span className='text-sm font-bold text-amber-400'>
                  {(casualties.totalDisplaced / 1000000).toFixed(1)}M displaced
                </span>
              )}
              {casualties.totalChildren > 0 && (
                <span className='text-xs text-red-300'>
                  {casualties.totalChildren.toLocaleString()}+ children
                </span>
              )}
              <span className='text-xs text-red-400/50 ml-auto'>Day {stats.dayNumber}</span>
            </div>
          )}

          {/* Each event as a full card in the feed */}
          {todayEvents.map((event, eventIdx) => (
            <div key={event.id} className={eventIdx > 0 ? 'border-t-2' : ''}>
              {/* Category + time banner */}
              <div className='px-4 py-2 flex items-center gap-2' style={{ backgroundColor: CATEGORY_COLORS[event.category] + '15', borderBottom: `2px solid ${CATEGORY_COLORS[event.category]}40` }}>
                <div className='h-2.5 w-2.5 rounded-full animate-pulse' style={{ backgroundColor: CATEGORY_COLORS[event.category] }} />
                <span className='text-xs font-bold uppercase tracking-wider' style={{ color: CATEGORY_COLORS[event.category] }}>
                  {CATEGORY_LABELS[event.category]}
                </span>
                <span className='text-xs text-muted-foreground ml-auto font-mono'>
                  {event.time && (
                    <span className='font-bold text-foreground mr-1.5'>
                      {(() => {
                        const [h, m] = event.time.split(':').map(Number);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const h12 = h % 12 || 12;
                        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
                      })()}
                    </span>
                  )}
                  {formatDate(event.date)}
                </span>
              </div>

              {/* Headline + description */}
              <div className='px-4 py-3'>
                <h3 className='text-lg font-black leading-snug'>{event.title}</h3>
                <p className='text-sm text-muted-foreground mt-2 leading-relaxed'>
                  {event.description}
                </p>

                {/* Casualties for this specific event */}
                {event.casualties && (event.casualties.killed || event.casualties.displaced) && (
                  <div className='mt-3 rounded-lg bg-red-950/20 border border-red-500/20 px-3 py-2 space-y-1'>
                    <div className='flex flex-wrap gap-x-4 gap-y-1'>
                      {event.casualties.killed && (
                        <span className='text-sm font-bold text-red-400'>{event.casualties.killed.toLocaleString()}+ killed</span>
                      )}
                      {event.casualties.injured && (
                        <span className='text-sm text-orange-400'>{event.casualties.injured.toLocaleString()} injured</span>
                      )}
                      {event.casualties.displaced && (
                        <span className='text-sm text-amber-400'>{event.casualties.displaced.toLocaleString()} displaced</span>
                      )}
                      {event.casualties.children && (
                        <span className='text-xs text-red-300'>{event.casualties.children.toLocaleString()}+ children</span>
                      )}
                    </div>
                    {event.casualties.source && (
                      <p className='text-[10px] text-muted-foreground'>Source: {event.casualties.source}</p>
                    )}
                  </div>
                )}
              </div>

              {/* YouTube embeds — autoplay muted like social feeds */}
              {event.mediaUrls?.filter(m => m.type === 'youtube').map((media, i) => {
                const videoId = getYouTubeId(media.url);
                if (!videoId) return null;
                return (
                  <div key={`yt-${i}`} className='px-4 pb-3'>
                    <p className='text-xs text-muted-foreground font-medium mb-1.5'>{media.label || 'Video Coverage'}</p>
                    <div className='relative w-full aspect-video rounded-lg overflow-hidden bg-black'>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&mute=1`}
                        title={media.label || 'Video'}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                        className='absolute inset-0 w-full h-full'
                      />
                    </div>
                  </div>
                );
              })}

              {/* News feed — each source as its own post card */}
              {(event.sourceUrl || (event.mediaUrls && event.mediaUrls.filter(m => m.type !== 'youtube').length > 0)) && (
                <div className='space-y-0'>
                  {event.sourceUrl && (
                    <a
                      href={event.sourceUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block border-t px-4 py-3 hover:bg-accent/40 transition-colors group'
                    >
                      <div className='flex items-center gap-2 mb-1.5'>
                        <IconExternalLink className='h-4 w-4 text-blue-400' />
                        <span className='text-xs font-bold text-blue-400 uppercase'>
                          {(() => { try { return new URL(event.sourceUrl).hostname.replace('www.', ''); } catch { return 'Source'; } })()}
                        </span>
                      </div>
                      <p className='text-base font-bold leading-snug group-hover:text-primary transition-colors'>
                        {event.title}
                      </p>
                      <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                        {event.description.slice(0, 120)}...
                      </p>
                    </a>
                  )}
                  {event.mediaUrls?.filter(m => m.type !== 'youtube').map((media, i) => {
                    const Icon = MEDIA_ICONS[media.type] || IconExternalLink;
                    const domain = (() => { try { return new URL(media.url).hostname.replace('www.', ''); } catch { return media.type; } })();
                    return (
                      <a
                        key={i}
                        href={media.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block border-t px-4 py-3 hover:bg-accent/40 transition-colors group'
                      >
                        <div className='flex items-center gap-2 mb-1.5'>
                          <Icon className='h-4 w-4 text-blue-400' />
                          <span className='text-xs font-bold text-blue-400 uppercase'>
                            {domain}
                          </span>
                        </div>
                        <p className='text-base font-bold leading-snug group-hover:text-primary transition-colors'>
                          {media.label || event.title}
                        </p>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Stats footer */}
          <div className='sticky bottom-0 px-3 py-1.5 bg-background/90 backdrop-blur-md border-t flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <IconBolt className='h-3 w-3 text-yellow-500' />
              Day {stats.dayNumber}
            </span>
            <span className='flex items-center gap-1'>
              <IconBuildingFactory className='h-3 w-3 text-red-400' />
              {stats.facilitiesHit} facilities hit
            </span>
            {stats.pctGlobal > 0 && (
              <span className='font-semibold text-foreground'>
                {stats.pctGlobal.toFixed(1)}% global supply
              </span>
            )}
            {totalCO2 > 0 && (
              <span className='flex items-center gap-1 font-semibold text-orange-400'>
                <IconCloud className='h-3 w-3' />
                {formatCO2(totalCO2)} t CO₂/day
              </span>
            )}
            {Object.entries(casualties.byRegion)
              .sort((a, b) => b[1].killed - a[1].killed)
              .slice(0, 3)
              .map(([region, data]) => (
                <span key={region} className='text-[9px]'>
                  {region}: {data.killed.toLocaleString()}
                </span>
              ))}
          </div>
        </div>
      )}

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
                          {event.mediaUrls?.map((media, i) => {
                            const Icon = MEDIA_ICONS[media.type] || IconExternalLink;
                            return (
                              <a key={i} href={media.url} target='_blank' rel='noopener noreferrer'
                                className='inline-flex items-center gap-1 text-[10px] text-primary hover:underline'
                                onClick={(e) => e.stopPropagation()}>
                                <Icon className='h-2.5 w-2.5' /> {media.label || media.type}
                              </a>
                            );
                          })}
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

          {/* Date display */}
          <span className='text-xs font-mono font-semibold w-[105px] shrink-0 text-center'>
            {formatDate(currentDate)}
          </span>

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
