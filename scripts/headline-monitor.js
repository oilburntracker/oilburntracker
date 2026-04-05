#!/usr/bin/env node
/**
 * Headline Monitor — checks news RSS + YouTube every hour
 * Finds conflict-related headlines and matching videos,
 * saves drafts for review, and checks GitHub for issues/PRs.
 *
 * Usage: node scripts/headline-monitor.js
 * Cron:  0 * * * * cd /home/agent/repos/oilburntracker && node scripts/headline-monitor.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = __dirname;
const SEEN_FILE = join(DATA_DIR, 'seen-headlines.json');
const DRAFTS_FILE = join(DATA_DIR, 'draft-events.json');

// ── Search queries for Google News RSS ──
const NEWS_QUERIES = [
  'Israel Iran war',
  'Gaza conflict',
  'Middle East oil disruption',
  'Strait of Hormuz',
  'Yemen Houthi attacks shipping',
  'Iran nuclear facilities',
  'oil price surge conflict',
  'Israel Lebanon Hezbollah',
  'Gaza ceasefire',
  'Iran retaliation Israel',
];

// ── YouTube search queries ──
const YT_QUERIES = [
  'Israel Iran war today',
  'Gaza latest news today',
  'Middle East conflict oil',
  'Houthi shipping attack',
  'Iran nuclear news',
];

// ── Category detection ──
const CATEGORY_RULES = [
  { pattern: /nuclear|enrichment|natanz|fordow|radiation/i, category: 'nuclear' },
  { pattern: /oil|refiner|pipeline|barrel|crude|petrol|gas price|fuel/i, category: 'infrastructure' },
  { pattern: /houthi|shipping|strait|hormuz|bab.el|tanker|maritime/i, category: 'shipping' },
  { pattern: /ceasefire|peace|negotiat|diplomat|UN|united nations/i, category: 'diplomacy' },
  { pattern: /strike|bomb|attack|missile|drone|raid|offensive/i, category: 'military_strike' },
  { pattern: /retaliat|escalat|response|counter/i, category: 'retaliation' },
  { pattern: /killed|dead|casualt|massacre|civilian|hospital/i, category: 'escalation' },
  { pattern: /sanction|economic|inflation|recession/i, category: 'economic' },
];

function detectCategory(title, description = '') {
  const text = `${title} ${description}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return 'escalation';
}

// ── Load/save seen headlines ──
function loadSeen() {
  if (!existsSync(SEEN_FILE)) return new Set();
  try {
    return new Set(JSON.parse(readFileSync(SEEN_FILE, 'utf-8')));
  } catch { return new Set(); }
}

function saveSeen(seen) {
  // Keep last 2000 entries to prevent unbounded growth
  const arr = [...seen].slice(-2000);
  writeFileSync(SEEN_FILE, JSON.stringify(arr, null, 2));
}

function loadDrafts() {
  if (!existsSync(DRAFTS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DRAFTS_FILE, 'utf-8'));
  } catch { return []; }
}

function saveDrafts(drafts) {
  // Keep last 200 drafts
  writeFileSync(DRAFTS_FILE, JSON.stringify(drafts.slice(-200), null, 2));
}

// ── Fetch Google News RSS ──
async function fetchGoogleNewsRSS(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'OilBurnTracker-Monitor/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSSItems(xml);
  } catch (e) {
    console.error(`  RSS fetch failed for "${query}": ${e.message}`);
    return [];
  }
}

function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const source = extractTag(block, 'source');
    if (title && link) {
      items.push({
        title: decodeHTMLEntities(title),
        link,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: source ? decodeHTMLEntities(source) : '',
      });
    }
  }
  return items;
}

function extractTag(xml, tag) {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function decodeHTMLEntities(text) {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"');
}

// ── Search YouTube via RSS (no API key needed) ──
async function searchYouTube(query) {
  // Use YouTube's search page and extract video IDs from the HTML
  // This is a lightweight approach that doesn't need an API key
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAI%253D`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Extract video IDs from the page
    const videoIds = [];
    const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    let m;
    const seen = new Set();
    while ((m = idRegex.exec(html)) !== null) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        videoIds.push(m[1]);
      }
      if (videoIds.length >= 5) break;
    }

    // Extract titles
    const results = [];
    for (const vid of videoIds) {
      const titleRegex = new RegExp(`"videoId":"${vid}"[^}]*?"title":\\{"runs":\\[\\{"text":"([^"]+)"`, 's');
      const tm = html.match(titleRegex);
      results.push({
        videoId: vid,
        title: tm ? decodeHTMLEntities(tm[1]) : '',
        url: `https://www.youtube.com/watch?v=${vid}`,
      });
    }
    return results;
  } catch (e) {
    console.error(`  YouTube search failed for "${query}": ${e.message}`);
    return [];
  }
}

// ── Find best YouTube match for a headline ──
async function findVideoForHeadline(headline) {
  // Simplify headline for search
  const searchQuery = headline
    .replace(/\b(the|a|an|in|on|at|to|for|of|and|or|but|is|are|was|were|has|have|had|with)\b/gi, '')
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');

  const results = await searchYouTube(searchQuery);
  if (results.length > 0) return results[0];
  return null;
}

// ── Generate event ID from title ──
function generateEventId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join('-');
}

// ── Main ──
async function main() {
  console.log(`[${new Date().toISOString()}] Headline Monitor starting...`);

  const seen = loadSeen();
  const drafts = loadDrafts();
  const newHeadlines = [];
  const today = new Date().toISOString().slice(0, 10);

  // 1. Fetch news from all queries
  console.log('  Fetching news RSS feeds...');
  const allItems = [];
  for (const query of NEWS_QUERIES) {
    const items = await fetchGoogleNewsRSS(query);
    allItems.push(...items);
    // Small delay to be respectful
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`  Found ${allItems.length} total items across ${NEWS_QUERIES.length} queries`);

  // 2. Deduplicate and filter new ones
  const uniqueNew = [];
  for (const item of allItems) {
    const key = item.title.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueNew.push(item);
    }
  }

  console.log(`  ${uniqueNew.length} new headlines after dedup`);

  // 3. For each new headline, find a YouTube video and create a draft event
  for (const item of uniqueNew.slice(0, 15)) { // Cap at 15 per run
    console.log(`  Processing: ${item.title.slice(0, 60)}...`);

    const video = await findVideoForHeadline(item.title);
    const category = detectCategory(item.title);

    const draft = {
      id: generateEventId(item.title),
      date: item.pubDate.slice(0, 10),
      title: item.title,
      description: `Via ${item.source || 'news'}. Auto-detected by headline monitor.`,
      category,
      sourceUrl: item.link,
      source: item.source,
      fetchedAt: new Date().toISOString(),
      mediaUrls: video ? [{ type: 'youtube', url: video.url, label: video.title }] : [],
      videoMatch: video ? { videoId: video.videoId, title: video.title, confidence: 'auto' } : null,
      // Placeholder fields for manual review
      lat: null,
      lng: null,
      zoom: null,
      casualties: null,
      status: 'draft', // needs human review before adding to conflict-events.ts
    };

    drafts.push(draft);
    newHeadlines.push({ ...item, video, category });

    // Rate limit YouTube requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // 4. Save state
  saveSeen(seen);
  saveDrafts(drafts);

  // 5. Also fetch latest YouTube videos from key channels
  console.log('  Searching YouTube for latest conflict videos...');
  const ytResults = [];
  for (const query of YT_QUERIES) {
    const videos = await searchYouTube(query);
    ytResults.push(...videos);
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save YouTube results separately
  const ytFile = join(DATA_DIR, 'youtube-latest.json');
  const ytUnique = [];
  const ytSeen = new Set();
  for (const v of ytResults) {
    if (!ytSeen.has(v.videoId)) {
      ytSeen.add(v.videoId);
      ytUnique.push({ ...v, fetchedAt: new Date().toISOString() });
    }
  }
  writeFileSync(ytFile, JSON.stringify(ytUnique.slice(0, 30), null, 2));
  console.log(`  Saved ${ytUnique.length} unique YouTube videos`);

  if (newHeadlines.length > 0) {
    console.log(`\n  NEW HEADLINES:`);
    newHeadlines.forEach((h, i) => {
      console.log(`  ${i + 1}. [${h.category}] ${h.title}`);
      if (h.video) console.log(`     Video: ${h.video.url}`);
    });
  } else {
    console.log('  No new headlines this run');
  }

  console.log(`[${new Date().toISOString()}] Done. ${newHeadlines.length} new, ${drafts.length} total drafts.`);
}

main().catch(console.error);
