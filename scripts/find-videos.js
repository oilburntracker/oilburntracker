#!/usr/bin/env node
/**
 * Video Finder — daily script to find YouTube videos for events without them.
 * Checks RSS feeds from trusted news channels, matches videos to events by keyword.
 *
 * Usage: node scripts/find-videos.js
 * Cron:  0 9 * * * (daily at 9 AM UTC)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const AUTO_EVENTS_PATH = path.join(ROOT, 'src/features/timeline/data/auto-events.json');
const LOG_FILE = path.join(__dirname, 'video-finder.log');

// Trusted YouTube channels with RSS feeds (no API key needed)
const CHANNELS = [
  { name: 'Al Jazeera English', id: 'UCNye-wNBqNL5ZzHSJj3l8Bg' },
  { name: 'CNN', id: 'UCupvZG-5ko_eiXAupbDfxWw' },
  { name: 'BBC News', id: 'UC16niRr50-MSBwiO3YDb3RA' },
  { name: 'Reuters', id: 'UChqUTb7kYRX8-EiaN3XFrSQ' },
  { name: 'CNBC', id: 'UCvJJ_dzjViJCoLf5uKUTwoA' },
  { name: 'CBS News', id: 'UC8p1vwvWtl6T73JiExfWs1g' },
  { name: 'PBS NewsHour', id: 'UC6ZFN9Tx6xh-skXCuRHCDpQ' },
  { name: 'France 24', id: 'UCQfwfsi5VrQ8yKZ-UWmAEFg' },
  { name: 'DW News', id: 'UCknLrEdhRCp1aegoMqRaCZg' },
  { name: 'Sky News', id: 'UCoMdktPbSTixAyNGwb-UYkQ' },
  { name: 'The Guardian', id: 'UCIRYBXDze5krPDzAEOxFGVA' },
  { name: 'NPR', id: 'UC15gdgl2mhBCBj2CiNjqOcg' },
];

// Conflict-related keywords — video must match at least one
const CONFLICT_KEYWORDS = [
  'iran', 'tehran', 'hormuz', 'nuclear', 'bushehr', 'refinery', 'oil',
  'missile', 'strike', 'bomb', 'attack', 'war', 'conflict', 'military',
  'houthi', 'yemen', 'lebanon', 'hezbollah', 'gaza', 'israel',
  'casualties', 'killed', 'civilian', 'humanitarian', 'displaced',
  'shipping', 'tanker', 'pipeline', 'petrochemical', 'lng',
  'emissions', 'pollution', 'environmental', 'climate',
  'sanctions', 'oil price', 'energy', 'gulf', 'middle east',
  'data center', 'aws', 'infrastructure', 'troops', 'pentagon',
];

// Stop words to exclude from matching
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or',
  'but', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'with', 'as',
  'by', 'from', 'its', 'that', 'this', 'than', 'says', 'said', 'after',
  'about', 'into', 'over', 'been', 'also', 'more', 'new', 'will', 'can',
]);

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// Fetch YouTube channel RSS feed
async function fetchChannelVideos(channel) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'OilBurnTracker-VideoFinder/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseAtomFeed(xml, channel.name);
  } catch (e) {
    log(`  RSS fetch failed for ${channel.name}: ${e.message}`);
    return [];
  }
}

function parseAtomFeed(xml, channelName) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, 'title');
    const videoId = extractAttr(block, 'yt:videoId');
    const published = extractTag(block, 'published');
    if (title && videoId) {
      entries.push({
        title: decodeHTMLEntities(title),
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        published: published || '',
        channel: channelName,
      });
    }
  }
  return entries;
}

function extractTag(xml, tag) {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function extractAttr(xml, tag) {
  const regex = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function decodeHTMLEntities(text) {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '\u201C').replace(/&#8221;/g, '\u201D');
}

// Check if a video title is conflict-related
function isConflictRelated(title) {
  const lower = title.toLowerCase();
  return CONFLICT_KEYWORDS.some(kw => lower.includes(kw));
}

// Extract significant words from a title
function getKeywords(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

// Score how well a video matches an event (0 = no match, higher = better)
function matchScore(eventTitle, videoTitle) {
  const eventWords = getKeywords(eventTitle);
  const videoWords = new Set(getKeywords(videoTitle));
  if (eventWords.length === 0) return 0;

  const matches = eventWords.filter(w => videoWords.has(w)).length;
  const score = matches / Math.max(eventWords.length, 1);

  // Require at least 3 matching words and 30% overlap
  if (matches < 3 || score < 0.3) return 0;
  return score;
}

// Search YouTube directly for a specific query (fallback for unmatched events)
async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAI%253D`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const titleRegex = /"title":\{"runs":\[\{"text":"([^"]+)"/g;
    const ids = [];
    const seen = new Set();
    let m;
    while ((m = idRegex.exec(html)) !== null) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        ids.push(m[1]);
      }
      if (ids.length >= 3) break;
    }

    if (ids.length === 0) return null;

    // Try to get title for first result
    const tm = html.match(new RegExp(`"videoId":"${ids[0]}"[^}]*?"title":\\{"runs":\\[\\{"text":"([^"]+)"`, 's'));
    return {
      videoId: ids[0],
      url: `https://www.youtube.com/watch?v=${ids[0]}`,
      title: tm ? decodeHTMLEntities(tm[1]) : query,
      channel: 'YouTube Search',
    };
  } catch (e) {
    return null;
  }
}

async function main() {
  log('Video Finder starting...');

  // Load events
  const events = JSON.parse(fs.readFileSync(AUTO_EVENTS_PATH, 'utf-8'));
  const needVideo = events.filter(e => !e.mediaUrls || e.mediaUrls.length === 0);
  log(`${events.length} total events, ${needVideo.length} need videos`);

  if (needVideo.length === 0) {
    log('All events have videos. Done.');
    return;
  }

  // 1. Fetch recent videos from all trusted channels
  log('Fetching YouTube channel feeds...');
  const allVideos = [];
  for (const channel of CHANNELS) {
    const videos = await fetchChannelVideos(channel);
    const relevant = videos.filter(v => isConflictRelated(v.title));
    allVideos.push(...relevant);
    log(`  ${channel.name}: ${videos.length} total, ${relevant.length} conflict-related`);
    await new Promise(r => setTimeout(r, 300));
  }

  log(`${allVideos.length} total conflict-related videos from channel feeds`);

  // 2. Match videos to events
  let matched = 0;
  const unmatched = [];

  for (const event of needVideo) {
    let bestVideo = null;
    let bestScore = 0;

    for (const video of allVideos) {
      const score = matchScore(event.title, video.title);
      if (score > bestScore) {
        bestScore = score;
        bestVideo = video;
      }
    }

    if (bestVideo && bestScore >= 0.3) {
      event.mediaUrls = [{
        type: 'youtube',
        url: bestVideo.url,
        label: `${bestVideo.title} | ${bestVideo.channel}`,
      }];
      matched++;
      log(`  MATCH (${bestScore.toFixed(2)}): "${event.title.substring(0, 50)}" → "${bestVideo.title.substring(0, 50)}"`);
    } else {
      unmatched.push(event);
    }
  }

  log(`Matched ${matched} events from channel feeds. ${unmatched.length} still need videos.`);

  // 3. For remaining unmatched events (recent ones only), try direct YouTube search
  const recentUnmatched = unmatched.filter(e => {
    const age = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return age <= 14; // Only search for events from last 2 weeks
  });

  if (recentUnmatched.length > 0) {
    log(`Searching YouTube directly for ${recentUnmatched.length} recent unmatched events...`);

    for (const event of recentUnmatched) {
      // Build a search query from the event title
      const searchTerms = getKeywords(event.title).slice(0, 5).join(' ');
      if (searchTerms.length < 8) continue;

      const result = await searchYouTube(searchTerms + ' news');
      if (result && isConflictRelated(result.title)) {
        event.mediaUrls = [{
          type: 'youtube',
          url: result.url,
          label: `${result.title} | ${result.channel}`,
        }];
        matched++;
        log(`  SEARCH MATCH: "${event.title.substring(0, 50)}" → "${result.title.substring(0, 50)}"`);
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // 4. Write updated events
  if (matched > 0) {
    fs.writeFileSync(AUTO_EVENTS_PATH, JSON.stringify(events, null, 2) + '\n');
    log(`Updated ${matched} events with videos. Writing to auto-events.json.`);

    // Git commit and push
    try {
      execSync('git add src/features/timeline/data/auto-events.json', { cwd: ROOT, stdio: 'pipe' });
      execSync(`git commit -m "Auto: Add videos to ${matched} events"`, { cwd: ROOT, stdio: 'pipe' });
      log('Committed video updates.');
      execSync('git push origin master', { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
      log('Pushed to origin/master.');
    } catch (err) {
      log(`Git operation failed: ${err.message}`);
    }
  } else {
    log('No new video matches found.');
  }

  const remaining = events.filter(e => !e.mediaUrls || e.mediaUrls.length === 0);
  log(`Done. ${matched} videos added. ${remaining.length} events still without videos.`);
}

main().catch(e => log(`FATAL: ${e.message}`));
