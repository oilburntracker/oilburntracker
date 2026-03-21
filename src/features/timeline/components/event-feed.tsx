'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFireStore } from '@/stores/fire-store';
import {
  getEventsUpTo,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ConflictEvent
} from '../data/conflict-events';
import { IconExternalLink } from '@tabler/icons-react';

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function timeAgo(iso: string): string {
  const diff = Math.floor(
    (new Date('2026-03-21').getTime() - new Date(iso).getTime()) / 86400000
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d ago';
  if (diff < 30) return `${diff}d ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${(diff / 365).toFixed(1)}yr ago`;
}

interface EventFeedProps {
  onFlyTo?: (lat: number, lng: number, zoom: number) => void;
  fullPage?: boolean;
}

export default function EventFeed({ onFlyTo, fullPage = false }: EventFeedProps) {
  const timelineDate = useFireStore((s) => s.timelineDate);
  const setTimelineDate = useFireStore((s) => s.setTimelineDate);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  // Reverse chronological — most recent at top, scroll down = back in time
  const events = useMemo(() => {
    return getEventsUpTo(timelineDate).reverse();
  }, [timelineDate]);

  // Map for quick event lookup
  const eventMap = useMemo(() => {
    const m = new Map<string, ConflictEvent>();
    events.forEach((e) => m.set(e.id, e));
    return m;
  }, [events]);

  // Video event IDs
  const videoEventIds = useMemo(() => {
    const ids = new Set<string>();
    events.forEach((e) => {
      const yt = e.mediaUrls?.find((m) => m.type === 'youtube');
      if (yt && getYouTubeId(yt.url)) ids.add(e.id);
    });
    return ids;
  }, [events]);

  // IntersectionObserver: scrolling = scrubbing time + video autoplay
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    ratiosRef.current.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-event-id');
          if (id) {
            ratiosRef.current.set(
              id,
              entry.isIntersecting ? entry.intersectionRatio : 0
            );
          }
        });

        // Find the most visible event card
        let bestId: string | null = null;
        let bestRatio = 0;
        ratiosRef.current.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestId && bestRatio > 0.3) {
          // Update timeline date to match focused event
          const event = eventMap.get(bestId);
          if (event && fullPage) {
            setTimelineDate(event.date);
          }

          // Autoplay video if this event has one
          if (videoEventIds.has(bestId)) {
            setActiveVideoId(bestId);
          } else {
            setActiveVideoId(null);
          }
        }
      },
      {
        root: container,
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
      }
    );

    // Observe all event cards
    const timer = setTimeout(() => {
      container
        .querySelectorAll('[data-event-id]')
        .forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [events, eventMap, videoEventIds, fullPage, setTimelineDate]);

  const handleFlyTo = useCallback(
    (event: ConflictEvent) => {
      if (event.lat && event.lng && onFlyTo) {
        onFlyTo(event.lat, event.lng, event.zoom || 8);
      }
    },
    [onFlyTo]
  );

  const wrapperClass = fullPage
    ? 'h-full overflow-y-auto'
    : 'w-[360px] max-h-[calc(100dvh-180px)] rounded-xl border border-zinc-700/80 bg-zinc-950/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col';

  return (
    <div className={wrapperClass}>
      <div
        ref={scrollRef}
        className={fullPage ? 'h-full overflow-y-auto' : 'overflow-y-auto flex-1'}
      >
        {events.map((event) => {
          const ytMedia = event.mediaUrls?.find((m) => m.type === 'youtube');
          const videoId = ytMedia ? getYouTubeId(ytMedia.url) : null;
          const isPlaying = videoId && activeVideoId === event.id;

          return (
            <div
              key={event.id}
              data-event-id={event.id}
              className='border-b border-zinc-800/60'
            >
              {/* Post header */}
              <div className='flex items-center gap-2.5 px-4 pt-3 pb-1.5'>
                <div
                  className='h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black uppercase'
                  style={{
                    backgroundColor: CATEGORY_COLORS[event.category] + '25',
                    color: CATEGORY_COLORS[event.category]
                  }}
                >
                  {CATEGORY_LABELS[event.category].slice(0, 2)}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <span
                      className='text-xs font-bold'
                      style={{ color: CATEGORY_COLORS[event.category] }}
                    >
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    <span className='text-[10px] text-zinc-600'>·</span>
                    <span className='text-[10px] text-zinc-500'>
                      {timeAgo(event.date)}
                    </span>
                  </div>
                  <span className='text-[10px] text-zinc-600'>
                    {formatDate(event.date)}
                  </span>
                </div>
                {event.lat && event.lng && (
                  <button
                    onClick={() => handleFlyTo(event)}
                    className='text-[10px] text-zinc-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-zinc-800 cursor-pointer shrink-0'
                    title='Show on map'
                  >
                    Map ↗
                  </button>
                )}
              </div>

              {/* Title */}
              <div className='px-4 pb-2'>
                <h3 className='text-[13px] font-bold text-zinc-100 leading-snug'>
                  {event.title}
                </h3>
              </div>

              {/* Video — autoplay muted when scrolled into view */}
              {videoId && (
                <div
                  className='relative w-full bg-black'
                  style={{ paddingBottom: '56.25%' }}
                >
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&mute=1&enablejsapi=1&playsinline=1`}
                      className='absolute inset-0 w-full h-full border-0'
                      allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture'
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt=''
                      className='absolute inset-0 w-full h-full object-cover opacity-60'
                    />
                  )}
                  {ytMedia?.label && (
                    <div className='absolute bottom-2 left-2 text-[10px] bg-black/80 text-zinc-300 px-2 py-0.5 rounded font-medium'>
                      {ytMedia.label}
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              <div className='px-4 py-2.5 space-y-1.5'>
                <p className='text-xs text-zinc-400 leading-relaxed line-clamp-3'>
                  {event.description}
                </p>

                {/* Casualties */}
                {event.casualties && (
                  <div className='flex items-center gap-3'>
                    {event.casualties.killed != null &&
                      event.casualties.killed > 0 && (
                        <span className='text-[11px] font-bold text-red-400'>
                          {event.casualties.killed.toLocaleString()}+ killed
                        </span>
                      )}
                    {event.casualties.displaced != null &&
                      event.casualties.displaced > 0 && (
                        <span className='text-[11px] font-bold text-amber-400'>
                          {event.casualties.displaced.toLocaleString()}{' '}
                          displaced
                        </span>
                      )}
                    {event.casualties.children != null &&
                      event.casualties.children > 0 && (
                        <span className='text-[11px] font-bold text-red-300'>
                          {event.casualties.children.toLocaleString()} children
                        </span>
                      )}
                  </div>
                )}

                {/* Links */}
                {(event.sourceUrl ||
                  event.mediaUrls?.some((m) => m.type !== 'youtube')) && (
                  <div className='flex flex-wrap gap-2 pt-0.5'>
                    {event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium'
                      >
                        <IconExternalLink className='h-3 w-3' />
                        Source
                      </a>
                    )}
                    {event.mediaUrls
                      ?.filter((m) => m.type !== 'youtube')
                      .map((media, i) => (
                        <a
                          key={i}
                          href={media.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium'
                        >
                          <IconExternalLink className='h-3 w-3' />
                          {media.label || media.type}
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
