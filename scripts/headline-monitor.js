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
// Focused on concrete conflict impacts: casualties, infrastructure, energy, nuclear, shipping
const NEWS_QUERIES = [
  'Iran oil refinery strike damage',
  'Iran nuclear facility attack IAEA',
  'Strait of Hormuz shipping blocked tanker',
  'Iran war casualties killed civilians',
  'Middle East oil supply disruption barrel',
  'Gaza casualties killed hospital',
  'Houthi shipping attack tanker',
  'Iran war infrastructure damage pipeline',
  'Lebanon Israel airstrike casualties',
  'Iran CO2 emissions pollution war environmental',
];

// ── YouTube search queries ──
const YT_QUERIES = [
  'Iran oil infrastructure damage satellite',
  'Iran nuclear facility IAEA',
  'Strait Hormuz shipping disruption',
  'Iran war civilian casualties',
  'Middle East war environmental damage',
];

// ═══ CONTENT QUALITY FILTERS ═══

// REJECT: opinion, commentary, political theater, live blogs, analysis
const REJECT_PATTERNS = [
  /\b(opinion|editorial|letters?\s+to|column|blog|viewpoint|perspective)\b/i,
  /\blive\s+(updates?|coverage|blog|news)\b/i,
  /\b(middle east|iran war|iran|gaza)\s+(crisis\s+)?live:/i,
  /here'?s what happened/i,
  /what.{0,20}(winning|happened|to know|to understand|can tell us)/i,
  /how (trump|our|young|will|the us)/i,
  /trump\s+(says|claims|threatens|warns|tells|wants|demands|pushes|can|is\s+(losing|waging|fighting))/i,
  /\b(pope|evangelical|god'?s name|divine|moral world order)\b/i,
  /\b(voices from|as it happened|the latest:|latest developments)\b/i,
  /\bstripped?\b.{0,30}\b(residency|citizenship|visa)\b/i,
  /how\s+(do|does|will|are|is|can|our|young)\b/i,
  /\b(fallout from|deal with the|pushing back|comes under strain)\b/i,
  /flip-flopping|boxed himself|four bad options|finish the job/i,
  /\b(reporter covers|without being in it)\b/i,
  /day \d+ of (us|u\.s\.|american|israeli)/i,
  /what is happening on day/i,
];

// REQUIRE: at least one concrete conflict-impact indicator
const RELEVANCE_PATTERNS = [
  /killed|dead|died|casualt|wound|injur|massacre/i,         // casualties
  /struck|destroy|damage|bomb|shell|missile|drone strike/i,  // military action with damage
  /refiner|pipeline|petrochemical|oil field|storage|terminal/i, // energy infrastructure
  /nuclear|enrichment|natanz|fordow|bushehr|IAEA|radiation/i,  // nuclear
  /blocked|closed|disrupted|shipping|tanker|hormuz/i,         // chokepoint/shipping
  /CO2|emission|pollution|environmental|climate/i,            // environmental
  /barrel|crude|oil price|gas price|LNG|supply disruption/i,  // energy markets
  /hospital|school|university|civilian|humanitarian/i,        // humanitarian targets
  /troop|ground.?force|deploy|battalion|brigade|infantry/i,   // ground operations
  /satellite|FIRMS|imagery|blackout/i,                        // intelligence/monitoring
];

function shouldReject(title) {
  return REJECT_PATTERNS.some(p => p.test(title));
}

function isRelevant(title, description = '') {
  const text = `${title} ${description}`;
  return RELEVANCE_PATTERNS.some(p => p.test(text));
}

// ── Category detection ──
const CATEGORY_RULES = [
  { pattern: /nuclear|enrichment|natanz|fordow|bushehr|radiation|IAEA/i, category: 'nuclear' },
  { pattern: /refiner|pipeline|petrochemical|oil field|barrel|crude|petrol|fuel|LNG/i, category: 'infrastructure' },
  { pattern: /houthi|shipping|strait|hormuz|bab.el|tanker|maritime|blocked/i, category: 'shipping' },
  { pattern: /killed|dead|casualt|massacre|civilian|hospital|wounded/i, category: 'humanitarian' },
  { pattern: /strike|bomb|attack|missile|drone|raid|offensive|shell/i, category: 'military_strike' },
  { pattern: /CO2|emission|pollution|environmental|climate/i, category: 'environmental' },
  { pattern: /troop|ground.?force|deploy|battalion|infantry/i, category: 'military_strike' },
  { pattern: /ceasefire|peace|negotiat|diplomat|UN|united nations/i, category: 'diplomacy' },
  { pattern: /retaliat|escalat|response|counter/i, category: 'retaliation' },
  { pattern: /sanction|economic|inflation|recession/i, category: 'economic' },
];

function detectCategory(title, description = '') {
  const text = `${title} ${description}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return null; // No category = don't publish
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

  // 3. For each new headline, apply quality filters, then create draft events
  for (const item of uniqueNew.slice(0, 20)) { // Cap at 20 per run
    // Quality gate: reject opinion/commentary/political theater
    if (shouldReject(item.title)) {
      console.log(`  REJECT (content filter): ${item.title.slice(0, 70)}`);
      continue;
    }

    // Relevance gate: must mention concrete conflict impact
    const category = detectCategory(item.title);
    if (!category && !isRelevant(item.title)) {
      console.log(`  SKIP (not relevant): ${item.title.slice(0, 70)}`);
      continue;
    }

    console.log(`  Processing: ${item.title.slice(0, 60)}...`);

    const video = await findVideoForHeadline(item.title);

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
