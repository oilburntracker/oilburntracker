# OilBurnTracker

Real-time tracking of conflict-affected energy infrastructure. Open source, free data, no login required.

## The Problem

The March 2026 Iran conflict has struck 8+ major oil and gas facilities across the Persian Gulf. There is no single tool that shows:
- Which facilities have been hit
- How much energy capacity is at risk
- What the downstream impact is on global supply
- Which facilities could be next

OilBurnTracker fills that gap.

## What You See

- **Interactive 3D satellite map** with terrain — zoom, tilt, rotate
- **Facility markers scaled by impact** — bigger glow = more critical to global energy supply
- **Tap any facility** to see: capacity, storage, attack date, news source, strategic importance, and what happens if it's destroyed
- **Real-time disruption level** — normal, moderate, severe, crisis, or catastrophe based on cumulative global supply impact
- **NASA FIRMS satellite fire detections** overlaid as heatmap + pulsing markers
- **20+ curated facilities** including chokepoints (Strait of Hormuz, Bab el-Mandeb)

## Currently Tracked

### Confirmed Strikes
| Facility | Country | Date | Type | Global Capacity |
|----------|---------|------|------|----------------|
| Ras Tanura Refinery | Saudi Arabia | Mar 2 | Refinery | 0.55% |
| BAPCO Sitra Refinery | Bahrain | Mar 9 | Refinery | 0.27% |
| Kharg Island Terminal | Iran | Mar 13 | Export Port | 5.0% |
| Shah Gas Field | UAE | Mar 16 | Gas Field | 0.3% |
| Fujairah Storage Zone | UAE | Mar 16 | Oil Storage | 0.1% |
| South Pars Gas Field | Iran | Mar 18 | Gas Field | 2.5% |
| Ras Laffan LNG | Qatar | Mar 18 | LNG Terminal | 1.4% |
| Mina al-Ahmadi Refinery | Kuwait | Mar 19 | Refinery | 0.47% |

### Strategic Chokepoints
| Location | Daily Transit | Global Share |
|----------|--------------|-------------|
| Strait of Hormuz | 21M BPD | 21% of world oil |
| Bab el-Mandeb | 6.2M BPD | Gateway to Suez Canal |

### Iran-Threatened (Named as targets Mar 18)
Abqaiq (7M BPD), SAMREF Yanbu, Jubail, Al Hosn, Mesaieed

## Quick Start

```bash
git clone https://github.com/oilburntracker/oilburntracker.git
cd oilburntracker
npm install
cp .env.example .env.local
```

Get a free NASA FIRMS API key (takes 30 seconds):
1. Go to https://firms.modaps.eosdis.nasa.gov/api/area/
2. Register with any email
3. Add your key to `.env.local`:

```env
FIRMS_MAP_KEY=your_key_here
```

That's it — the map uses free open-source tiles, no other API keys needed.

```bash
npm run dev
```

Open http://localhost:3000

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Next.js 16 + React 19 + TypeScript | Free |
| Map | MapLibre GL JS (open source fork of Mapbox) | Free |
| Tiles | ESRI satellite + AWS terrain DEM + CARTO labels | Free |
| Fire Data | NASA FIRMS VIIRS satellite detections | Free |
| Charts | Recharts | Free |
| State | Zustand | Free |
| Styling | Tailwind CSS 4 + shadcn/ui | Free |
| Hosting | Cloudflare Pages (static export) | Free tier |

**Total cost to run: $0**

## Architecture

```
Browser
  |
Next.js
  ├── /dashboard/overview  →  Full-screen 3D map + facility markers + bottom drawer
  ├── /dashboard/fires     →  Facility cards with status
  ├── /dashboard/timeline  →  Emissions timeline chart
  ├── /dashboard/about     →  Methodology + sources
  └── /api/firms           →  FIRMS CSV → GeoJSON (30min ISR cache)
                                  ↓
                            NASA FIRMS API (satellite data)
                                  +
                            curated-fires.ts (20+ facilities with strategic data)
```

## Data Sources

| Source | What | Frequency | License |
|--------|------|-----------|---------|
| NASA FIRMS | VIIRS satellite fire detections | ~3 hours | Public domain (US Gov) |
| ESRI World Imagery | Satellite basemap tiles | Continuous | Free for non-commercial |
| AWS Terrain Tiles | Elevation/DEM for 3D terrain | Continuous | Public domain |
| CARTO | Map label tiles | Continuous | BSD |
| Curated Database | Facility data, attack dates, strategic analysis | Manual updates | MIT (this repo) |
| News Sources | Attack confirmations, damage reports | As reported | Linked, not reproduced |

## Legal & Disclaimers

### License

This software is released under the **MIT License**. See [LICENSE](LICENSE).

### Data Accuracy

- Facility data is compiled from **publicly available news reports** and **open-source intelligence**. Each confirmed strike includes a link to its source.
- Satellite fire detections come from NASA FIRMS, a US government public domain dataset.
- CO2 emissions estimates use rough FRP-to-CO2 multipliers and are **for awareness only, not scientific measurements**.
- Facility capacities and storage figures are sourced from public corporate disclosures, EIA data, and news reports.
- This tool does **not** contain classified, proprietary, or restricted information.

### Fair Use & News Sources

- News source URLs are linked (not copied) for attribution and verification.
- No copyrighted article text is reproduced in this project.
- Facility descriptions are original summaries written for this project.
- This constitutes fair use for purposes of public interest reporting and analysis.

### Not Affiliated

OilBurnTracker is **not affiliated** with NASA, any government agency, energy company, or news organization. It is an independent open-source project.

### Limitation of Liability

This tool is provided for **informational and educational purposes only**. It should not be used as the sole basis for investment, military, or policy decisions. The authors make no warranty about the accuracy, completeness, or timeliness of any data presented.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The most impactful contributions:

1. **Add/update facility data** — new strikes, corrected figures, additional facilities
2. **Improve strategic analysis** — better cascade impact descriptions, supply chain data
3. **Better emissions model** — if you have domain expertise in FRP→CO2 conversion
4. **UI/UX improvements** — mobile experience, accessibility, new visualizations
5. **Deploy & share** — host your own instance, embed in articles

## Deploying to Cloudflare Pages

Static export — no SSR, no wrangler deploy, just serve the `out/` folder.

### Cloudflare Pages Settings

Go to **dash.cloudflare.com → Workers & Pages → oilburntracker → Settings → Build & Deployments → Edit**:

| Setting | Value |
|---------|-------|
| **Framework preset** | `None` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Deploy command** | *(leave empty — do NOT set this)* |

### Environment Variables

Set in **Settings → Environment variables**:

| Variable | Value |
|----------|-------|
| `FIRMS_MAP_KEY` | Your NASA FIRMS API key |

### Common Deploy Failures

| Symptom | Fix |
|---------|-----|
| `@opennextjs/cloudflare` error | Set framework preset to `None`, not "Next.js" |
| `npx wrangler deploy` fails | Clear the deploy command field — it must be EMPTY |
| Build succeeds, deploy fails | Same as above — Cloudflare auto-adds `npx wrangler deploy` if preset is wrong |

### Self-hosted

```bash
npm run build    # outputs to out/
npx serve out    # or any static file server
```

## Credits

Built with data from NASA FIRMS, ESRI, AWS Open Data, and CARTO. News sourced from Bloomberg, Reuters, Al Jazeera, Washington Post, CNBC, Axios, Euronews, Business Today, and Middle East Eye.
