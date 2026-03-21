'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFireStore } from '@/stores/fire-store';
import {
  getEventsUpTo,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ConflictEvent
} from '../data/conflict-events';
import { IconExternalLink, IconSkull, IconMapPin } from '@tabler/icons-react';

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

  const events = useMemo(() => {
    return getEventsUpTo(timelineDate).reverse();
  }, [timelineDate]);

  // Keep refs for observer callback so it uses latest data without re-creating
  const eventMapRef = useRef<Map<string, ConflictEvent>>(new Map());
  const videoEventIdsRef = useRef<Set<string>>(new Set());

  const eventCount = useMemo(() => {
    const m = new Map<string, ConflictEvent>();
    const vids = new Set<string>();
    events.forEach((e) => {
      m.set(e.id, e);
      const yt = e.mediaUrls?.find((med) => med.type === 'youtube');
      if (yt && getYouTubeId(yt.url)) vids.add(e.id);
    });
    eventMapRef.current = m;
    videoEventIdsRef.current = vids;
    return events.length;
  }, [events]);

  // IntersectionObserver: scrolling = scrubbing time + video autoplay
  // Only re-create when event count changes (not on every date tick)
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

        let bestId: string | null = null;
        let bestRatio = 0;
        ratiosRef.current.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestId && bestRatio > 0.3) {
          const event = eventMapRef.current.get(bestId);
          if (event && fullPage) {
            setTimelineDate(event.date);
          }
          if (videoEventIdsRef.current.has(bestId)) {
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

    const timer = setTimeout(() => {
      container
        .querySelectorAll('[data-event-id]')
        .forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [eventCount, fullPage, setTimelineDate]);

  const handleFlyTo = useCallback(
    (event: ConflictEvent) => {
      if (event.lat && event.lng && onFlyTo) {
        onFlyTo(event.lat, event.lng, event.zoom || 8);
      }
    },
    [onFlyTo]
  );

  return (
    <div className={fullPage ? 'h-full' : 'w-[360px] max-h-[calc(100dvh-180px)] rounded-xl border border-zinc-700/80 bg-zinc-950/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col'}>
      <div
        ref={scrollRef}
        className={fullPage ? 'h-full overflow-y-auto px-3 py-3 space-y-3' : 'overflow-y-auto flex-1 px-3 py-3 space-y-3'}
      >
        {events.map((event) => {
          const ytMedia = event.mediaUrls?.find((m) => m.type === 'youtube');
          const videoId = ytMedia ? getYouTubeId(ytMedia.url) : null;
          const isPlaying = videoId && activeVideoId === event.id;
          const catColor = CATEGORY_COLORS[event.category];

          return (
            <div
              key={event.id}
              data-event-id={event.id}
              className='rounded-xl border border-zinc-800 bg-black/60 overflow-hidden'
            >
              {/* Card header */}
              <div className='px-3 pt-3 pb-2'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-2.5 w-2.5 rounded-full'
                      style={{ backgroundColor: catColor }}
                    />
                    <span
                      className='text-[10px] uppercase tracking-widest font-bold'
                      style={{ color: catColor }}
                    >
                      {CATEGORY_LABELS[event.category]}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-[10px] text-zinc-500 font-mono'>
                      {formatDate(event.date)}
                    </span>
                    <span className='text-[10px] text-zinc-600'>
                      {timeAgo(event.date)}
                    </span>
                  </div>
                </div>
                <h3 className='text-sm font-black text-zinc-100 leading-snug'>
                  {event.title}
                </h3>
              </div>

              {/* Video — full width, big, autoplay muted on scroll */}
              {videoId && (
                <div className='relative w-full bg-black' style={{ paddingBottom: '56.25%' }}>
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&mute=1&enablejsapi=1&playsinline=1`}
                      className='absolute inset-0 w-full h-full border-0'
                      allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture'
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt=''
                      className='absolute inset-0 w-full h-full object-cover opacity-70'
                    />
                  )}
                  {ytMedia?.label && (
                    <div className='absolute bottom-2 left-2 text-[10px] bg-black/80 text-zinc-300 px-2 py-0.5 rounded font-medium backdrop-blur-sm'>
                      {ytMedia.label}
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              <div className='px-3 py-2.5 space-y-2'>
                <p className='text-[11px] text-zinc-400 leading-relaxed'>
                  {event.description}
                </p>

                {/* Casualties bar */}
                {event.casualties &&
                  (event.casualties.killed || event.casualties.displaced) && (
                    <div className='flex items-center gap-3 py-1.5 px-2.5 rounded-lg bg-red-950/30 border border-red-500/20'>
                      {event.casualties.killed != null &&
                        event.casualties.killed > 0 && (
                          <span className='flex items-center gap-1 text-[11px] font-bold text-red-400'>
                            <IconSkull className='h-3 w-3' />
                            {event.casualties.killed.toLocaleString()}+ killed
                          </span>
                        )}
                      {event.casualties.displaced != null &&
                        event.casualties.displaced > 0 && (
                          <span className='text-[11px] font-bold text-amber-400'>
                            {event.casualties.displaced.toLocaleString()} displaced
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

                {/* Action row */}
                <div className='flex items-center justify-between pt-1 border-t border-zinc-800/50'>
                  <div className='flex flex-wrap gap-2'>
                    {event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-md hover:bg-zinc-800/50 transition-colors'
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
                          className='inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-md hover:bg-zinc-800/50 transition-colors'
                        >
                          <IconExternalLink className='h-3 w-3' />
                          {media.label || media.type}
                        </a>
                      ))}
                  </div>
                  {event.lat && event.lng && (
                    <button
                      onClick={() => handleFlyTo(event)}
                      className='inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 font-medium px-2 py-1 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer'
                    >
                      <IconMapPin className='h-3 w-3' />
                      Map
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
