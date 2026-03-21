'use client';

import { useMemo, useRef, useEffect, useCallback } from 'react';
import { useFireStore } from '@/stores/fire-store';
import {
  getEventsUpTo,
  getCasualtiesUpTo,
  getVisibleFacilityIds,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ConflictEvent
} from '../data/conflict-events';
import { getSupplyDisruptionUpTo } from '@/features/fires/data/curated-fires';
import { getConsumerImpactUpTo } from '@/features/impact/data/consumer-impact';
import {
  IconExternalLink, IconSkull, IconMapPin, IconFlame,
  IconDroplet, IconReceipt, IconAlertTriangle, IconPlayerPlay
} from '@tabler/icons-react';

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

// Compute cumulative impact stats at a given date
function getImpactAt(date: string) {
  const casualties = getCasualtiesUpTo(date);
  const facilityIds = getVisibleFacilityIds(date);
  const supply = getSupplyDisruptionUpTo(facilityIds, date);
  const impact = getConsumerImpactUpTo(date);
  return { casualties, supply, impact };
}

interface EventFeedProps {
  onFlyTo?: (lat: number, lng: number, zoom: number) => void;
  fullPage?: boolean;
}

export default function EventFeed({ onFlyTo, fullPage = false }: EventFeedProps) {
  const timelineDate = useFireStore((s) => s.timelineDate);
  const setTimelineDate = useFireStore((s) => s.setTimelineDate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ratiosRef = useRef<Map<string, number>>(new Map());
  const eventMapRef = useRef<Map<string, ConflictEvent>>(new Map());

  const events = useMemo(() => {
    return getEventsUpTo(timelineDate).reverse();
  }, [timelineDate]);

  const eventCount = useMemo(() => {
    const m = new Map<string, ConflictEvent>();
    events.forEach((e) => m.set(e.id, e));
    eventMapRef.current = m;
    return events.length;
  }, [events]);

  // Precompute impact stats for each unique date in visible events
  const impactByDate = useMemo(() => {
    const dates = new Set(events.map((e) => e.date));
    const map = new Map<string, ReturnType<typeof getImpactAt>>();
    dates.forEach((d) => map.set(d, getImpactAt(d)));
    return map;
  }, [events]);

  // IntersectionObserver: scrolling syncs timeline date
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
        }
      },
      {
        root: container,
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
      }
    );

    const timer = setTimeout(() => {
      const elements = container.querySelectorAll('[data-event-id]');
      elements.forEach((el) => observer.observe(el));
    }, 150);

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
    <div className={fullPage ? 'h-full' : 'w-[360px] max-h-[calc(100dvh-180px)] rounded-xl border border-gray-300 dark:border-zinc-700/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col'}>
      <div
        ref={scrollRef}
        className={fullPage ? 'h-full overflow-y-auto px-3 py-3 space-y-3' : 'overflow-y-auto flex-1 px-3 py-3 space-y-3'}
      >
        {events.map((event) => {
          const ytMedia = event.mediaUrls?.find((m) => m.type === 'youtube');
          const videoId = ytMedia ? getYouTubeId(ytMedia.url) : null;
          const catColor = CATEGORY_COLORS[event.category];
          const stats = impactByDate.get(event.date);

          return (
            <div
              key={event.id}
              data-event-id={event.id}
              className='rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black/60 shadow-sm overflow-hidden'
            >
              {/* Impact pills — cumulative damage at this date */}
              {stats && (
                <div className='flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-zinc-900/60 border-b border-gray-100 dark:border-zinc-800/50 overflow-x-auto'>
                  <span className='flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 whitespace-nowrap'>
                    <IconSkull className='h-3 w-3' />
                    {stats.casualties.totalKilled.toLocaleString()}
                  </span>
                  <span className='text-gray-300 dark:text-zinc-700'>|</span>
                  <span className='flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap'>
                    <IconDroplet className='h-3 w-3' />
                    {stats.supply.productionPct.toFixed(1)}% offline
                  </span>
                  <span className='text-gray-300 dark:text-zinc-700'>|</span>
                  <span className='flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 whitespace-nowrap'>
                    <IconReceipt className='h-3 w-3' />
                    +${stats.impact.totalMonthlyExtra}/mo
                  </span>
                  {stats.supply.level !== 'normal' && (
                    <>
                      <span className='text-gray-300 dark:text-zinc-700'>|</span>
                      <span className={`text-[10px] font-black uppercase whitespace-nowrap ${
                        stats.supply.level === 'catastrophe' ? 'text-orange-700 dark:text-orange-400' :
                        stats.supply.level === 'crisis' ? 'text-orange-600 dark:text-orange-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`}>
                        <IconAlertTriangle className='h-3 w-3 inline' /> {stats.supply.level}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Card header */}
              <div className='px-3 pt-2.5 pb-2'>
                <div className='flex items-center justify-between mb-1.5'>
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
                    <span className='text-[10px] text-gray-500 dark:text-zinc-500 font-mono'>
                      {formatDate(event.date)}
                    </span>
                    <span className='text-[10px] text-gray-400 dark:text-zinc-600'>
                      {timeAgo(event.date)}
                    </span>
                  </div>
                </div>
                <h3 className='text-sm font-black text-gray-900 dark:text-zinc-100 leading-snug'>
                  {event.title}
                </h3>
              </div>

              {/* YouTube thumbnail — always visible, click to watch */}
              {videoId && (
                <a
                  href={ytMedia!.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='relative block w-full bg-gray-100 dark:bg-black group'
                  style={{ paddingBottom: '56.25%' }}
                >
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={event.title}
                    className='absolute inset-0 w-full h-full object-cover'
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/default.jpg`; }}
                  />
                  {/* Play button overlay */}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='w-12 h-12 rounded-full bg-black/60 group-hover:bg-red-600 transition-colors flex items-center justify-center'>
                      <IconPlayerPlay className='h-6 w-6 text-white ml-0.5' />
                    </div>
                  </div>
                  {ytMedia?.label && (
                    <div className='absolute bottom-2 left-2 text-[10px] bg-black/80 text-white px-2 py-0.5 rounded font-medium backdrop-blur-sm'>
                      {ytMedia.label}
                    </div>
                  )}
                </a>
              )}

              {/* Body */}
              <div className='px-3 py-2.5 space-y-2'>
                <p className='text-[11px] text-gray-600 dark:text-zinc-400 leading-relaxed'>
                  {event.description}
                </p>

                {/* Casualties from this event */}
                {event.casualties &&
                  (event.casualties.killed || event.casualties.displaced) && (
                    <div className='flex flex-wrap items-center gap-2 py-1.5 px-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20'>
                      {event.casualties.killed != null &&
                        event.casualties.killed > 0 && (
                          <span className='flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400'>
                            <IconSkull className='h-3 w-3' />
                            {event.casualties.killed.toLocaleString()}+ killed
                          </span>
                        )}
                      {event.casualties.displaced != null &&
                        event.casualties.displaced > 0 && (
                          <span className='text-[11px] font-bold text-amber-600 dark:text-amber-400'>
                            {event.casualties.displaced.toLocaleString()} displaced
                          </span>
                        )}
                      {event.casualties.children != null &&
                        event.casualties.children > 0 && (
                          <span className='text-[11px] font-bold text-red-500 dark:text-red-300'>
                            {event.casualties.children.toLocaleString()} children
                          </span>
                        )}
                    </div>
                  )}

                {/* Action row */}
                <div className='flex items-center justify-between pt-1 border-t border-gray-200 dark:border-zinc-800/50'>
                  <div className='flex flex-wrap gap-2'>
                    {event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors'
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
                          className='inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors'
                        >
                          <IconExternalLink className='h-3 w-3' />
                          {media.label || media.type}
                        </a>
                      ))}
                  </div>
                  {event.lat && event.lng && (
                    <button
                      onClick={() => handleFlyTo(event)}
                      className='inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 font-medium px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer'
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
