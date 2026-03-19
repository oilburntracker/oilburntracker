'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  conflictEvents,
  getTimelineDates,
  getEventsUpTo,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ConflictEvent
} from '../data/conflict-events';
import { useFireStore } from '@/stores/fire-store';
import { curatedFires } from '@/features/fires/data/curated-fires';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconPlayerPlay, IconPlayerPause, IconChevronUp, IconChevronDown, IconExternalLink } from '@tabler/icons-react';

// Key date positions for the scrubber
const ALL_DATES = getTimelineDates();
const MIN_DATE = ALL_DATES[0];
const MAX_DATE = ALL_DATES[ALL_DATES.length - 1];

// Format date for display
function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Short format
function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

interface TimelineScrubberProps {
  onFlyTo?: (lat: number, lng: number, zoom: number) => void;
}

export default function TimelineScrubber({ onFlyTo }: TimelineScrubberProps) {
  const [currentIndex, setCurrentIndex] = useState(ALL_DATES.length - 1); // Start at latest
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);
  const playRef = useRef<NodeJS.Timeout | null>(null);
  const setSelectedFacility = useFireStore((s) => s.setSelectedFacility);

  const currentDate = ALL_DATES[currentIndex];
  const visibleEvents = getEventsUpTo(currentDate);

  // Auto-play through timeline
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= ALL_DATES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per date
    }
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [isPlaying]);

  // When scrubber moves, fly to the latest event's location
  useEffect(() => {
    const eventsAtDate = conflictEvents.filter((e) => e.date === currentDate);
    if (eventsAtDate.length > 0) {
      const latest = eventsAtDate[eventsAtDate.length - 1];
      if (latest.lat && latest.lng && onFlyTo) {
        onFlyTo(latest.lat, latest.lng, latest.zoom || 8);
      }
      setSelectedEvent(latest);
    }
  }, [currentIndex]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentIndex(Number(e.target.value));
  }, []);

  const togglePlay = useCallback(() => {
    if (currentIndex >= ALL_DATES.length - 1) {
      setCurrentIndex(0); // Reset to beginning
    }
    setIsPlaying((p) => !p);
  }, [currentIndex]);

  const handleEventClick = useCallback((event: ConflictEvent) => {
    setSelectedEvent(event);
    if (event.lat && event.lng && onFlyTo) {
      onFlyTo(event.lat, event.lng, event.zoom || 10);
    }
    if (event.facilityId) {
      const facility = curatedFires.find((f) => f.id === event.facilityId);
      if (facility) setSelectedFacility(facility);
    }
  }, [onFlyTo, setSelectedFacility]);

  return (
    <div className='absolute bottom-0 left-0 right-0 z-10'>
      {/* Expanded event list */}
      {expanded && (
        <div className='mx-3 mb-1 max-h-[40vh] overflow-y-auto rounded-t-lg border border-b-0 bg-background/95 backdrop-blur-md'>
          <div className='p-3 space-y-1.5'>
            {visibleEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`w-full text-left rounded-lg p-2.5 transition-colors hover:bg-accent ${
                  selectedEvent?.id === event.id ? 'bg-accent ring-1 ring-primary' : ''
                }`}
              >
                <div className='flex items-start gap-2'>
                  <div
                    className='mt-1 h-2.5 w-2.5 rounded-full shrink-0'
                    style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                  />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-xs text-muted-foreground font-mono'>{formatDate(event.date)}</span>
                      <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
                        {CATEGORY_LABELS[event.category]}
                      </Badge>
                    </div>
                    <p className='text-sm font-medium mt-0.5 leading-tight'>{event.title}</p>
                    {selectedEvent?.id === event.id && (
                      <div className='mt-2 space-y-2'>
                        <p className='text-xs text-muted-foreground leading-relaxed'>
                          {event.description}
                        </p>
                        {event.sourceUrl && (
                          <a
                            href={event.sourceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-xs text-primary hover:underline'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconExternalLink className='h-3 w-3' />
                            Source
                          </a>
                        )}
                        {event.mediaUrls?.map((media, i) => (
                          <a
                            key={i}
                            href={media.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-xs text-primary hover:underline ml-3'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconExternalLink className='h-3 w-3' />
                            {media.label || media.type}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrubber bar */}
      <div className='border-t bg-background/90 backdrop-blur-md px-3 py-2'>
        {/* Current event title */}
        {selectedEvent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className='w-full flex items-center gap-2 mb-2 text-left'
          >
            <div
              className='h-2 w-2 rounded-full shrink-0'
              style={{ backgroundColor: CATEGORY_COLORS[selectedEvent.category] }}
            />
            <span className='text-xs font-medium truncate flex-1'>
              {selectedEvent.title}
            </span>
            {expanded
              ? <IconChevronDown className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
              : <IconChevronUp className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
            }
          </button>
        )}

        {/* Controls row */}
        <div className='flex items-center gap-3'>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 shrink-0'
            onClick={togglePlay}
          >
            {isPlaying
              ? <IconPlayerPause className='h-4 w-4' />
              : <IconPlayerPlay className='h-4 w-4' />
            }
          </Button>

          <span className='text-xs text-muted-foreground font-mono w-20 shrink-0'>
            {formatDate(currentDate)}
          </span>

          <input
            type='range'
            min={0}
            max={ALL_DATES.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className='flex-1 h-1.5 accent-primary cursor-pointer'
          />

          <span className='text-xs text-muted-foreground tabular-nums shrink-0'>
            {visibleEvents.length}/{conflictEvents.length}
          </span>
        </div>

        {/* Date tick marks */}
        <div className='flex justify-between mt-1 px-11'>
          {ALL_DATES.filter((_, i) => i % Math.max(1, Math.floor(ALL_DATES.length / 5)) === 0 || i === ALL_DATES.length - 1).map((date) => (
            <span key={date} className='text-[9px] text-muted-foreground/60'>
              {shortDate(date)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
