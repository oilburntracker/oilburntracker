'use client';

import { useFireStore } from '@/stores/fire-store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IconMap, IconFlame, IconBuildingFactory } from '@tabler/icons-react';

interface MapControlsProps {
  onFlyTo?: (lat: number, lng: number, zoom: number) => void;
}

const REGIONS = [
  { label: 'Persian Gulf', lat: 27.0, lng: 50.5, zoom: 7 },
  { label: 'Red Sea', lat: 20.0, lng: 39.0, zoom: 6 },
  { label: 'Hormuz', lat: 26.5, lng: 56.3, zoom: 8 },
  { label: 'Levant', lat: 33.0, lng: 36.0, zoom: 7 }
];

export default function MapControls({ onFlyTo }: MapControlsProps) {
  const layers = useFireStore((s) => s.layers);
  const toggleLayer = useFireStore((s) => s.toggleLayer);

  return (
    <div className='absolute top-3 left-3 z-10 flex flex-col gap-2'>
      <div className='rounded-lg border bg-background/90 backdrop-blur-sm p-3 shadow-lg'>
        <p className='mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Layers</p>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Switch
              id='layer-heat'
              checked={layers.heatmap}
              onCheckedChange={() => toggleLayer('heatmap')}
            />
            <Label htmlFor='layer-heat' className='flex items-center gap-1.5 text-xs cursor-pointer'>
              <IconMap className='h-3 w-3' /> Heatmap
            </Label>
          </div>
          <div className='flex items-center gap-2'>
            <Switch
              id='layer-points'
              checked={layers.markers}
              onCheckedChange={() => toggleLayer('markers')}
            />
            <Label htmlFor='layer-points' className='flex items-center gap-1.5 text-xs cursor-pointer'>
              <IconFlame className='h-3 w-3' /> Fire Points
            </Label>
          </div>
          <div className='flex items-center gap-2'>
            <Switch
              id='layer-facilities'
              checked={layers.facilities}
              onCheckedChange={() => toggleLayer('facilities')}
            />
            <Label htmlFor='layer-facilities' className='flex items-center gap-1.5 text-xs cursor-pointer'>
              <IconBuildingFactory className='h-3 w-3' /> Facilities
            </Label>
          </div>
        </div>
      </div>
      <div className='rounded-lg border bg-background/90 backdrop-blur-sm p-3 shadow-lg'>
        <p className='mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Quick Zoom</p>
        <div className='flex flex-wrap gap-1'>
          {REGIONS.map((r) => (
            <Button
              key={r.label}
              size='sm'
              variant='outline'
              className='h-6 text-xs px-2'
              onClick={() => onFlyTo?.(r.lat, r.lng, r.zoom)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
