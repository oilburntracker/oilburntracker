# Contributing to OilBurnTracker

Thanks for your interest. This project tracks conflict-affected energy infrastructure using public data.

## Quick Start

```bash
git clone https://github.com/oilburntracker/oilburntracker.git
cd oilburntracker
npm install
cp .env.example .env.local
# Add your FIRMS API key to .env.local (free: https://firms.modaps.eosdis.nasa.gov/api/area/)
npm run dev
```

## How to Contribute

### 1. Add or Update Facility Data (Most Impactful)

Edit `src/features/fires/data/curated-fires.ts`:

```typescript
{
  id: 'facility-id',
  name: 'Facility Name',
  facilityType: 'refinery',           // refinery | lng_terminal | gas_field | oil_field | storage | port | pipeline
  lat: 26.0000,
  lng: 50.0000,
  matchRadius: 5,                     // km — for matching satellite fire detections
  country: 'Country',
  capacityBPD: 500000,                // barrels per day (0 for gas-only)
  storageMBBL: 10,                    // million barrels storage (optional)
  gasCapacityBCFD: 1.5,              // billion cubic feet/day (optional)
  lngMTPA: 50,                       // million tons/year LNG (optional)
  status: 'damaged',                  // active_fire | damaged | monitoring | offline | operational
  attackDate: '2026-03-15',           // ISO date (optional)
  newsSourceUrl: 'https://...',       // REQUIRED for confirmed strikes
  description: 'Brief factual description of what happened.',
  percentGlobalCapacity: 0.5,         // % of global oil/gas this represents
  threatLevel: 'high',                // critical | high | elevated | moderate | low
  whyItMatters: 'Why this facility is strategically important.',
  ifDestroyed: 'What happens to global supply if this goes offline.',
  supplyChainRole: 'What flows through it and where it goes.'
}
```

**Rules for facility data:**
- Every confirmed strike MUST have a `newsSourceUrl` from a major outlet
- Capacity figures should come from public corporate disclosures, EIA, or IEA data
- Descriptions must be factual summaries, not copied article text
- `percentGlobalCapacity` should be calculated against ~100M BPD global oil production

### 2. Improve Strategic Analysis

The `whyItMatters`, `ifDestroyed`, and `supplyChainRole` fields tell the real story. Better analysis from people with energy sector expertise makes the tool more valuable.

### 3. Improve the Emissions Model

`src/features/emissions/utils/emissions-model.ts` uses rough FRP-to-CO2 multipliers. If you have domain expertise:
- Suggest better facility-type-specific conversion factors
- Add fuel composition adjustments
- Cite academic sources

### 4. UI/UX Improvements

- Mobile experience
- Accessibility (screen readers, keyboard nav)
- New visualizations (animated timeline, smoke plume modeling, etc.)

## Code Guidelines

- TypeScript strict mode
- Tailwind CSS 4 + shadcn/ui components
- Test that `npm run build` passes before submitting
- No API keys in commits
- Keep PRs focused — one feature or fix per PR
- Factual, neutral language in all user-facing text

## Project Structure

```
src/
├── app/                         # Next.js app router
│   ├── api/firms/               # FIRMS proxy + CSV→GeoJSON
│   └── dashboard/               # App pages (overview, fires, timeline, about)
├── features/
│   ├── map/                     # Map component, hooks, pulsing dots, GeoJSON utils
│   ├── fires/                   # Curated facility data, facility drawer, fire list
│   ├── emissions/               # CO2 model, timeline chart
│   └── stats/                   # Stats components
├── stores/                      # Zustand state (fire-store.ts)
└── components/                  # Shared UI (shadcn/ui)
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
