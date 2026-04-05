#!/usr/bin/env node
/**
 * Auto-Publish Pipeline
 * Promotes credible drafts from draft-events.json → auto-events.json → git push → Cloudflare deploys
 *
 * Run: node scripts/auto-publish.js
 * Chained after headline-monitor.js in cron
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(__dirname, 'draft-events.json');
const AUTO_EVENTS_PATH = path.join(ROOT, 'src/features/timeline/data/auto-events.json');

// ═══ SOURCE FILTERING ═══

const CREDIBLE_SOURCES = new Set([
  'BBC', 'CNN', 'Reuters', 'Al Jazeera', 'AP News', 'NPR', 'PBS',
  'The Guardian', 'The Washington Post', 'The New York Times',
  'France 24', 'CNBC', 'The Economist', 'Financial Times', 'Bloomberg',
  'UN News'
]);

const BLOCKED_SOURCES = new Set([
  'Anadolu', 'Anadolu Ajansı', 'RT', 'CGTN', 'Press TV', 'Sputnik', 'TASS'
]);

// ═══ CONTENT QUALITY FILTERS ═══
// Reject opinion, commentary, political theater, live blogs
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

// Must contain at least one concrete impact indicator
const RELEVANCE_PATTERNS = [
  /killed|dead|died|casualt|wound|injur|massacre/i,
  /struck|destroy|damage|bomb|shell|missile|drone strike/i,
  /refiner|pipeline|petrochemical|oil field|storage|terminal/i,
  /nuclear|enrichment|natanz|fordow|bushehr|IAEA|radiation/i,
  /blocked|closed|disrupted|shipping|tanker|hormuz/i,
  /CO2|emission|pollution|environmental|climate/i,
  /barrel|crude|oil price|gas price|LNG|supply disruption/i,
  /hospital|school|university|civilian|humanitarian/i,
  /troop|ground.?force|deploy|battalion|brigade|infantry/i,
  /satellite|FIRMS|imagery|blackout/i,
];

function shouldRejectTitle(title) {
  return REJECT_PATTERNS.some(p => p.test(title));
}

function isRelevantTitle(title) {
  return RELEVANCE_PATTERNS.some(p => p.test(title));
}

// ═══ CATEGORY MAPPING ═══
// Draft categories from headline-monitor → valid ConflictEvent categories
const CATEGORY_MAP = {
  'military_strike': 'military_strike',
  'facility_damage': 'facility_damage',
  'chokepoint': 'chokepoint',
  'diplomatic': 'diplomatic',
  'diplomacy': 'diplomatic',
  'escalation': 'escalation',
  'retaliation': 'retaliation',
  'humanitarian': 'humanitarian',
  'nuclear': 'facility_damage',
  'shipping': 'chokepoint',
  'infrastructure': 'facility_damage',
  'economic': 'escalation',
};

// ═══ GEO ENRICHMENT ═══

const GEO_MAP = [
  { pattern: /iran|tehran/i, coords: [35.69, 51.39] },
  { pattern: /israel|tel.?aviv/i, coords: [32.07, 34.78] },
  { pattern: /hormuz|strait/i, coords: [26.56, 56.25] },
  { pattern: /gaza/i, coords: [31.42, 34.35] },
  { pattern: /lebanon|beirut/i, coords: [33.89, 35.50] },
  { pattern: /saudi|riyadh/i, coords: [24.71, 46.68] },
  { pattern: /kuwait/i, coords: [29.37, 47.97] },
  { pattern: /qatar|doha/i, coords: [25.29, 51.53] },
  { pattern: /uae|abu.?dhabi/i, coords: [24.45, 54.65] },
  { pattern: /yemen|houthi/i, coords: [15.37, 44.19] },
  { pattern: /diego.?garcia/i, coords: [-7.32, 72.42] },
  { pattern: /washington|white.?house|pentagon/i, coords: [38.90, -77.04] },
  { pattern: /london|uk\b/i, coords: [51.51, -0.13] },
];

const FALLBACK_COORDS = [30.0, 48.0]; // Generic Middle East

function enrichCoordinates(title, description) {
  const text = `${title} ${description}`;
  for (const { pattern, coords } of GEO_MAP) {
    if (pattern.test(text)) {
      return { lat: coords[0], lng: coords[1] };
    }
  }
  return { lat: FALLBACK_COORDS[0], lng: FALLBACK_COORDS[1] };
}

// ═══ DEDUPLICATION ═══

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function isSimilar(a, b) {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return true;
  // Check if one title contains 60%+ of the other's words
  const wordsA = new Set(na.split(' '));
  const wordsB = new Set(nb.split(' '));
  const overlap = [...wordsA].filter(w => wordsB.has(w) && w.length > 3).length;
  const threshold = Math.min(wordsA.size, wordsB.size) * 0.6;
  return overlap >= threshold;
}

function isDuplicate(draft, existingEvents) {
  return existingEvents.some(e =>
    e.id === draft.id || isSimilar(e.title, draft.title)
  );
}

// ═══ MAIN PIPELINE ═══

function run() {
  console.log(`[${new Date().toISOString()}] Auto-publish starting...`);

  // Read drafts
  if (!fs.existsSync(DRAFT_PATH)) {
    console.log('No draft-events.json found. Nothing to do.');
    return;
  }

  let drafts;
  try {
    drafts = JSON.parse(fs.readFileSync(DRAFT_PATH, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse draft-events.json:', err.message);
    return;
  }

  if (!Array.isArray(drafts) || drafts.length === 0) {
    console.log('No drafts to process.');
    return;
  }

  // Read existing auto-events
  let existing = [];
  if (fs.existsSync(AUTO_EVENTS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(AUTO_EVENTS_PATH, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  // Filter and promote
  const promoted = [];
  const remaining = [];

  for (const draft of drafts) {
    // Required fields check
    if (!draft.id || !draft.date || !draft.title || !draft.category) {
      remaining.push(draft);
      continue;
    }

    // Source credibility check
    const source = draft.source || '';
    if (BLOCKED_SOURCES.has(source)) {
      console.log(`  SKIP (blocked source): ${source} — ${draft.title.substring(0, 60)}`);
      // Remove blocked source drafts entirely
      continue;
    }
    if (!CREDIBLE_SOURCES.has(source)) {
      console.log(`  SKIP (unknown source): ${source} — ${draft.title.substring(0, 60)}`);
      remaining.push(draft);
      continue;
    }

    // Content quality check
    if (shouldRejectTitle(draft.title)) {
      console.log(`  SKIP (content filter): ${draft.title.substring(0, 60)}`);
      continue;
    }
    if (!isRelevantTitle(draft.title)) {
      console.log(`  SKIP (not relevant): ${draft.title.substring(0, 60)}`);
      remaining.push(draft);
      continue;
    }

    // Duplicate check
    if (isDuplicate(draft, existing)) {
      console.log(`  SKIP (duplicate): ${draft.title.substring(0, 60)}`);
      continue;
    }

    // Map category
    const mappedCategory = CATEGORY_MAP[draft.category] || 'escalation';

    // Enrich coordinates
    const geo = (draft.lat != null && draft.lng != null)
      ? { lat: draft.lat, lng: draft.lng }
      : enrichCoordinates(draft.title, draft.description || '');

    // Build ConflictEvent
    const event = {
      id: `auto-${draft.id}`,
      date: draft.date,
      title: draft.title.replace(/ - [^-]+$/, ''), // Strip " - Source" suffix
      category: mappedCategory,
      description: draft.description || `Via ${source}. Auto-published from headline monitor.`,
      lat: geo.lat,
      lng: geo.lng,
      sourceUrl: draft.sourceUrl || undefined,
      mediaUrls: (draft.mediaUrls || []).filter(m => m.url && m.url.length > 0),
    };

    // Only include mediaUrls if non-empty
    if (event.mediaUrls.length === 0) delete event.mediaUrls;

    promoted.push(event);
    console.log(`  PROMOTE: [${mappedCategory}] ${event.title.substring(0, 70)}`);
  }

  if (promoted.length === 0) {
    console.log('No new events to promote.');
    // Still clean up blocked/duplicate drafts
    if (remaining.length !== drafts.length) {
      fs.writeFileSync(DRAFT_PATH, JSON.stringify(remaining, null, 2));
      console.log(`Cleaned drafts: ${drafts.length} → ${remaining.length}`);
    }
    return;
  }

  // Merge and write auto-events.json
  const merged = [...existing, ...promoted];
  fs.writeFileSync(AUTO_EVENTS_PATH, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Wrote ${merged.length} total events to auto-events.json (+${promoted.length} new)`);

  // Update drafts — remove promoted and blocked
  fs.writeFileSync(DRAFT_PATH, JSON.stringify(remaining, null, 2));
  console.log(`Remaining drafts: ${remaining.length}`);

  // Git commit and push
  const sources = [...new Set(promoted.map(e => {
    const match = (e.description || '').match(/Via ([^.]+)\./);
    return match ? match[1] : 'unknown';
  }))].join(', ');

  try {
    execSync('git add src/features/timeline/data/auto-events.json scripts/draft-events.json', { cwd: ROOT, stdio: 'pipe' });
    const commitMsg = `Auto: ${promoted.length} new event${promoted.length > 1 ? 's' : ''} from ${sources}`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: ROOT, stdio: 'pipe' });
    console.log(`Committed: ${commitMsg}`);

    execSync('git push origin master', { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
    console.log('Pushed to origin/master — Cloudflare deploy triggered.');
  } catch (err) {
    console.error('Git operation failed:', err.message);
    if (err.stderr) console.error(err.stderr.toString());
  }

  console.log(`[${new Date().toISOString()}] Auto-publish complete.`);
}

run();
