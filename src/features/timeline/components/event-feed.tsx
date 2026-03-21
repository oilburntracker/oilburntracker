'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFireStore } from '@/stores/fire-store';
import {
  getEventsUpTo,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ConflictEvent
} from '../data/conflict-events';
import {
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconPlayerPlay,
  IconX,
  IconList
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

interface EventFeedProps {
  onFlyTo?: (lat: number, lng: number, zoom: number) => void;
}

export default function EventFeed({ onFlyTo }: EventFeedProps) {
  const timelineDate = useFireStore((s) => s.timelineDate);
  const [open, setOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Events in reverse chronological order (scroll down = back in time)
  const events = useMemo(() => {
    return getEventsUpTo(timelineDate).reverse();
  }, [timelineDate]);

  // Reset playing video when feed closes
  useEffect(() => {
    if (!open) setPlayingVideo(null);
  }, [open]);

  const handleEventClick = useCallback(
    (event: ConflictEvent) => {
      setExpandedEvent((prev) => (prev === event.id ? null : event.id));
      if (event.lat && event.lng && onFlyTo) {
        onFlyTo(event.lat, event.lng, event.zoom || 8);
      }
      // Show pin popup on map
      window.dispatchEvent(
        new CustomEvent('map-show-event', { detail: { eventId: event.id } })
      );
    },
    [onFlyTo]
  );

  if (!open) {
    return (
      <div className='absolute top-3 left-14 z-10'>
        <button
          onClick={() => setOpen(true)}
          className='rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md px-3 py-2 shadow-2xl cursor-pointer flex items-center gap-2 hover:bg-zinc-900 transition-colors'
        >
          <IconList className='h-4 w-4 text-zinc-400' />
          <span className='text-xs font-bold text-zinc-300'>
            {events.length} Events
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className='absolute top-3 left-14 z-10 w-[320px] max-h-[calc(100dvh-180px)] rounded-xl border border-zinc-700/80 bg-black/90 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-3 py-2 border-b border-zinc-800 shrink-0'>
        <span className='text-xs font-bold text-zinc-300'>
          {events.length} Events — {formatDate(timelineDate)}
        </span>
        <button
          onClick={() => setOpen(false)}
          className='rounded-full p-0.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer'
        >
          <IconX className='h-3.5 w-3.5' />
        </button>
      </div>

      {/* Scrollable event list — reverse chronological */}
      <div ref={scrollRef} className='overflow-y-auto flex-1'>
        <div className='divide-y divide-zinc-800/50'>
          {events.map((event) => {
            const isExpanded = expandedEvent === event.id;
            const ytMedia = event.mediaUrls?.find(
              (m) => m.type === 'youtube'
            );
            const videoId = ytMedia ? getYouTubeId(ytMedia.url) : null;
            const isVideoPlaying = playingVideo === event.id;

            return (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`w-full text-left px-3 py-2 transition-colors hover:bg-zinc-900/60 ${
                  isExpanded ? 'bg-zinc-900/40' : ''
                }`}
              >
                {/* Header row */}
                <div className='flex items-center gap-2 mb-0.5'>
                  <div
                    className='h-2 w-2 rounded-full shrink-0'
                    style={{
                      backgroundColor: CATEGORY_COLORS[event.category]
                    }}
                  />
                  <span className='text-[10px] text-zinc-500 font-mono'>
                    {formatDate(event.date)}
                  </span>
                  <span
                    className='text-[9px] px-1 py-0 rounded-full font-bold uppercase'
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[event.category] + '20',
                      color: CATEGORY_COLORS[event.category]
                    }}
                  >
                    {CATEGORY_LABELS[event.category]}
                  </span>
                </div>

                {/* Title */}
                <p className='text-xs font-semibold text-zinc-200 leading-tight'>
                  {event.title}
                </p>

                {/* Casualties inline */}
                {event.casualties?.killed && event.casualties.killed > 0 && (
                  <span className='text-[10px] font-bold text-red-400'>
                    {event.casualties.killed.toLocaleString()}+ killed
                  </span>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    className='mt-2 space-y-2'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Description */}
                    <p className='text-[11px] text-zinc-400 leading-relaxed'>
                      {event.description}
                    </p>

                    {/* Video thumbnail or player */}
                    {videoId && !isVideoPlaying && (
                      <button
                        onClick={() => setPlayingVideo(event.id)}
                        className='relative w-full rounded-md overflow-hidden bg-black cursor-pointer group'
                      >
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt=''
                          className='w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity'
                        />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='rounded-full bg-red-600 p-2.5 shadow-lg group-hover:bg-red-500 transition-colors'>
                            <IconPlayerPlay className='h-5 w-5 text-white fill-white' />
                          </div>
                        </div>
                        {ytMedia?.label && (
                          <div className='absolute bottom-1 left-1 text-[9px] bg-black/70 text-zinc-300 px-1.5 py-0.5 rounded font-medium'>
                            {ytMedia.label}
                          </div>
                        )}
                      </button>
                    )}

                    {/* Active video player */}
                    {videoId && isVideoPlaying && (
                      <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1&mute=0&enablejsapi=1`}
                          className='absolute inset-0 w-full h-full rounded-md border-0'
                          allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture'
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Links */}
                    <div className='flex flex-wrap gap-2'>
                      {event.sourceUrl && (
                        <a
                          href={event.sourceUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-medium'
                        >
                          <IconExternalLink className='h-2.5 w-2.5' />
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
                            className='inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-medium'
                          >
                            <IconExternalLink className='h-2.5 w-2.5' />
                            {media.label || media.type}
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
