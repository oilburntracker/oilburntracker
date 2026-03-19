# OilBurnTracker

Real-time satellite fire detection + facility identification + emissions estimates for conflict-affected oil & gas infrastructure. Open source. Free data.

## What It Does

No existing tool combines satellite fire detection, facility identification, and emissions estimates in one dashboard. OilBurnTracker changes that by integrating:

- **NASA FIRMS** satellite fire detections (VIIRS, updated every ~3 hours)
- **15 curated Middle East facilities** with capacity data and conflict status
- **FRP-to-CO2 emissions model** with facility-type-specific multipliers
- **Interactive satellite map** with heatmap, pulsing fire markers, and facility overlays

## Features

- 3D satellite fire map (MapLibre GL JS — fully open source, no API key)
- Real terrain elevation with pitch/rotation controls
- Animated pulsing dots color-coded by fire intensity
- Heatmap layer weighted by Fire Radiative Power (FRP)
- Automatic facility matching via haversine proximity
- Real-time stats: active fires, CO2/day, facilities affected, global energy at risk
- Emissions timeline chart (Recharts, stacked by facility type)
- Facility status cards with live satellite detection data
- Dark mode default, fully responsive
- 30-minute auto-refresh with ISR caching

## Quick Start

```bash
git clone https://github.com/gabeflowers/oilburntracker.git
cd oilburntracker
npm install
cp .env.example .env.local
```

Add your FIRMS API key to `.env.local`:

```env
FIRMS_MAP_KEY=xxx   # Free: https://firms.modaps.eosdis.nasa.gov/api/area/
```

That's it — one key. The map uses free open-source tiles (no Mapbox account needed).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Map:** MapLibre GL JS (open source) + ESRI satellite tiles + AWS terrain
- **Charts:** Recharts
- **State:** Zustand
- **Data:** NASA FIRMS API (free, real-time satellite fire detections)

## Architecture

```
Browser
  ↓
Next.js (Vercel)
  ├── /dashboard/overview  →  Map + Stats + Fire List
  ├── /dashboard/fires     →  Facility cards with live status
  ├── /dashboard/timeline  →  Emissions charts
  ├── /dashboard/about     →  Methodology + data sources
  └── /api/firms           →  FIRMS CSV → GeoJSON (30min cache)
                                  ↓
                            NASA FIRMS API
                                  +
                            curated-fires.ts (15 facilities)
```

## Data Sources

| Source | What | Update Frequency | Cost |
|--------|------|-----------------|------|
| NASA FIRMS | Satellite fire detections (VIIRS) | ~3 hours | Free |
| ESRI/AWS | Satellite tiles + 3D terrain | Continuous | Free (open) |
| Curated DB | Facility coordinates, capacity, status | Manual | N/A |

## Emissions Methodology

Fire Radiative Power (FRP) from satellite measurements is converted to estimated CO2 using facility-type-specific multipliers (tons CO2 per MW-day):

| Facility Type | Multiplier |
|---------------|-----------|
| Refinery | 86.4 |
| LNG Terminal | 72.0 |
| Oil Field | 79.2 |
| Storage | 64.8 |
| Pipeline | 50.4 |
| Unknown | 60.0 |

**These are rough estimates for awareness, not precise measurements.**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The most impactful contribution is adding curated facilities to expand coverage.

## License

MIT License. See [LICENSE](LICENSE).
