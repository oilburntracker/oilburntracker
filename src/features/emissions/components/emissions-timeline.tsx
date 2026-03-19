'use client';

import { useFireStore } from '@/stores/fire-store';
import { curatedFires } from '@/features/fires/data/curated-fires';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const FACILITY_COLORS: Record<string, string> = {
  refinery: '#ef4444',
  lng_terminal: '#3b82f6',
  pipeline: '#f59e0b',
  storage: '#8b5cf6',
  oil_field: '#10b981',
  port: '#06b6d4',
  unknown: '#6b7280'
};

export default function EmissionsTimeline() {
  const fireData = useFireStore((s) => s.fireData);

  // Group fires by date and facility type
  const dateMap = new Map<string, Record<string, number>>();

  fireData.features.forEach((f) => {
    const date = f.properties.acq_date;
    if (!date) return;

    const type = f.properties.matchedFacility?.facilityType || 'unknown';
    const co2 = f.properties.estimatedCO2TonsDay || 0;

    if (!dateMap.has(date)) {
      dateMap.set(date, {});
    }
    const entry = dateMap.get(date)!;
    entry[type] = (entry[type] || 0) + co2;
  });

  const data = Array.from(dateMap.entries())
    .map(([date, types]) => ({
      date,
      ...types
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const allTypes = new Set<string>();
  data.forEach((d) => {
    Object.keys(d).forEach((k) => {
      if (k !== 'date') allTypes.add(k);
    });
  });

  if (data.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center text-muted-foreground'>
        <p>No emissions data available yet. Fire data is loading...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#333' />
        <XAxis dataKey='date' stroke='#888' fontSize={12} />
        <YAxis stroke='#888' fontSize={12} label={{ value: 'CO₂ (tons/day)', angle: -90, position: 'insideLeft', style: { fill: '#888' } }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend />
        {Array.from(allTypes).map((type) => (
          <Area
            key={type}
            type='monotone'
            dataKey={type}
            stackId='1'
            stroke={FACILITY_COLORS[type] || '#6b7280'}
            fill={FACILITY_COLORS[type] || '#6b7280'}
            fillOpacity={0.5}
            name={type.replace('_', ' ')}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
