# Contributing to OilBurnTracker

Thanks for your interest in contributing! This project aims to make conflict-related fire and emissions data accessible to everyone.

## Quick Start

```bash
git clone https://github.com/gabeflowers/oilburntracker.git
cd oilburntracker
npm install
cp .env.example .env.local
# Add your Mapbox + FIRMS keys to .env.local
npm run dev
```

## How to Contribute

### Add a Curated Facility

The most impactful contribution is expanding our facility database:

1. Edit `src/features/fires/data/curated-fires.ts`
2. Add a new `CuratedFire` object with:
   - Accurate lat/lng coordinates
   - Appropriate `matchRadius` (km) — larger for oil fields, smaller for refineries
   - Verified `capacityBPD` from public sources
   - A `newsSourceUrl` linking to reporting about the facility
3. Test that `matchFacility()` correctly matches nearby FIRMS detections

### Improve the Emissions Model

The FRP-to-CO2 conversion in `src/features/emissions/utils/emissions-model.ts` uses rough multipliers. If you have domain expertise:

- Suggest better facility-type-specific conversion factors
- Add fuel composition adjustments
- Cite academic sources for your numbers

### General Guidelines

- Keep PRs focused — one feature or fix per PR
- Follow the existing code patterns (TypeScript, Tailwind, shadcn/ui)
- Test that `npm run build` passes before submitting
- No API keys in commits

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/firms/          # FIRMS data proxy + CSV→GeoJSON
│   └── dashboard/          # Main app pages
├── features/
│   ├── map/                # Map component, hooks, utilities
│   ├── fires/              # Curated facility data, fire list
│   ├── emissions/          # CO2 model, timeline chart
│   └── stats/              # Stats bar component
├── stores/                 # Zustand state management
└── components/             # Shared UI components (shadcn/ui)
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
