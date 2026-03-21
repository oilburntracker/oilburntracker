'use client';

import { useFireStore } from '@/stores/fire-store';
import TimelineScrubber from '@/features/timeline/components/timeline-scrubber';
import { getConsumerImpactUpTo, BASELINE } from '@/features/impact/data/consumer-impact';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  IconGasStation,
  IconShoppingCart,
  IconBolt,
  IconPackage,
  IconCalculator,
  IconArrowUpRight,
  IconArrowRight,
} from '@tabler/icons-react';

function severityColor(value: number, low: number, mid: number, high: number) {
  if (value >= high) return 'text-red-500';
  if (value >= mid) return 'text-orange-400';
  if (value >= low) return 'text-yellow-400';
  return 'text-green-400';
}

function severityBorder(value: number, low: number, mid: number, high: number) {
  if (value >= high) return 'border-red-500/40';
  if (value >= mid) return 'border-orange-400/40';
  if (value >= low) return 'border-yellow-400/40';
  return 'border-green-400/40';
}

function severityBarColor(value: number, low: number, mid: number, high: number) {
  if (value >= high) return 'bg-red-500';
  if (value >= mid) return 'bg-orange-400';
  if (value >= low) return 'bg-yellow-400';
  return 'bg-green-400';
}

function formatDelta(value: number): string {
  if (value <= 0) return '$0';
  return `+$${value.toFixed(0)}`;
}

function historicalComparison(totalExtra: number): string {
  if (totalExtra >= 500) return 'Catastrophic — 4x worse than 1973 oil crisis';
  if (totalExtra >= 300) return 'Unprecedented — exceeds any US energy crisis';
  if (totalExtra >= 150) return 'Severe — approaching 1973 oil crisis levels';
  if (totalExtra >= 50) return 'Noticeable — similar to 2008 oil shock';
  return 'Minimal — within normal fluctuation range';
}

export default function ImpactPage() {
  const timelineDate = useFireStore((s) => s.timelineDate);
  const impact = getConsumerImpactUpTo(timelineDate);

  const gasMonthlyExtra = Math.max(0, (impact.gasPriceGallon - BASELINE.gasPriceGallon) * BASELINE.monthlyGasGallons);
  const oilDelta = impact.oilPriceBbl - BASELINE.oilPriceBbl;

  const totalSeverity = impact.totalMonthlyExtra >= 400 ? 'crisis' :
    impact.totalMonthlyExtra >= 150 ? 'severe' :
    impact.totalMonthlyExtra >= 50 ? 'elevated' : 'normal';

  const barPct = Math.min(100, (impact.totalMonthlyExtra / 800) * 100);

  return (
    <div className='relative h-[calc(100dvh-64px)] w-full'>
      <ScrollArea className='h-full'>
        <div className='p-4 md:px-6 pb-[220px] space-y-4'>
          {/* Header */}
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>How This Affects You</h1>
            <p className='text-muted-foreground text-sm'>
              Real-time consumer impact as the conflict escalates. Scrub the timeline to watch costs change.
            </p>
          </div>

          {/* Impact Cards */}
          <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>

            {/* ── 1. AT THE PUMP ── */}
            <Card className={`border ${severityBorder(gasMonthlyExtra, 20, 60, 100)}`}>
              <CardContent className='pt-5 space-y-3'>
                <div className='flex items-center gap-2'>
                  <IconGasStation className={`h-5 w-5 ${severityColor(gasMonthlyExtra, 20, 60, 100)}`} />
                  <span className='text-sm font-bold uppercase tracking-wide text-muted-foreground'>At The Pump</span>
                </div>
                <div className='flex items-baseline gap-2'>
                  <span className={`text-4xl font-black tabular-nums ${severityColor(gasMonthlyExtra, 20, 60, 100)}`}>
                    ${impact.gasPriceGallon.toFixed(2)}
                  </span>
                  <span className='text-sm text-muted-foreground'>/gal</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <IconArrowUpRight className='h-3.5 w-3.5 text-red-400' />
                  <span className='text-muted-foreground'>
                    {formatDelta(gasMonthlyExtra)}/mo extra
                  </span>
                  <span className='text-muted-foreground/60'>
                    (from ${BASELINE.gasPriceGallon.toFixed(2)})
                  </span>
                </div>
                <p className='text-xs text-muted-foreground/70'>
                  Oil at ${impact.oilPriceBbl}/bbl ({oilDelta > 0 ? '+' : ''}{oilDelta.toFixed(0)} from pre-war).
                  Every $10/bbl ≈ +$0.25/gal.
                </p>
              </CardContent>
            </Card>

            {/* ── 2. GROCERY BILL ── */}
            <Card className={`border ${severityBorder(impact.monthlyGroceryExtra, 30, 80, 150)}`}>
              <CardContent className='pt-5 space-y-3'>
                <div className='flex items-center gap-2'>
                  <IconShoppingCart className={`h-5 w-5 ${severityColor(impact.monthlyGroceryExtra, 30, 80, 150)}`} />
                  <span className='text-sm font-bold uppercase tracking-wide text-muted-foreground'>Grocery Bill</span>
                </div>
                <div className='flex items-baseline gap-2'>
                  <span className={`text-4xl font-black tabular-nums ${severityColor(impact.monthlyGroceryExtra, 30, 80, 150)}`}>
                    +{impact.groceryInflationPct}%
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <IconArrowUpRight className='h-3.5 w-3.5 text-red-400' />
                  <span className='text-muted-foreground'>
                    {formatDelta(impact.monthlyGroceryExtra)}/mo extra for family of 4
                  </span>
                </div>
                <p className='text-xs text-muted-foreground/70'>
                  Drivers: fertilizer shortages (QAFCO offline), diesel trucking costs, shipping delays.
                  Milk, eggs, bread all up.
                </p>
              </CardContent>
            </Card>

            {/* ── 3. HOME ENERGY ── */}
            <Card className={`border ${severityBorder(impact.monthlyUtilityExtra, 20, 70, 150)}`}>
              <CardContent className='pt-5 space-y-3'>
                <div className='flex items-center gap-2'>
                  <IconBolt className={`h-5 w-5 ${severityColor(impact.monthlyUtilityExtra, 20, 70, 150)}`} />
                  <span className='text-sm font-bold uppercase tracking-wide text-muted-foreground'>Home Energy</span>
                </div>
                <div className='flex items-baseline gap-2'>
                  <span className={`text-4xl font-black tabular-nums ${severityColor(impact.monthlyUtilityExtra, 20, 70, 150)}`}>
                    {formatDelta(impact.monthlyUtilityExtra)}
                  </span>
                  <span className='text-sm text-muted-foreground'>/mo</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <span className='text-muted-foreground'>
                    Nat gas ${impact.natGasMMBtu.toFixed(1)}/MMBtu
                  </span>
                  <span className='text-muted-foreground/60'>
                    (from ${BASELINE.natGasMMBtu.toFixed(1)})
                  </span>
                </div>
                <p className='text-xs text-muted-foreground/70'>
                  {impact.natGasMMBtu > 12
                    ? 'Ras Laffan LNG destroyed — 17% of global capacity gone. Northeast US & Europe hit hardest.'
                    : impact.natGasMMBtu > 6
                    ? 'South Pars destruction rippling through global gas markets. Winter heating at risk.'
                    : 'Regional variation: Northeast US and Europe most exposed to gas price spikes.'}
                </p>
              </CardContent>
            </Card>

            {/* ── 4. SHIPPING & DELIVERY ── */}
            <Card className={`border ${severityBorder(impact.shippingSurchargePct, 15, 50, 80)}`}>
              <CardContent className='pt-5 space-y-3'>
                <div className='flex items-center gap-2'>
                  <IconPackage className={`h-5 w-5 ${severityColor(impact.shippingSurchargePct, 15, 50, 80)}`} />
                  <span className='text-sm font-bold uppercase tracking-wide text-muted-foreground'>Shipping & Delivery</span>
                </div>
                <div className='flex items-baseline gap-2'>
                  <span className={`text-4xl font-black tabular-nums ${severityColor(impact.shippingSurchargePct, 15, 50, 80)}`}>
                    +{impact.shippingSurchargePct}%
                  </span>
                  <span className='text-sm text-muted-foreground'>surcharge</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <IconArrowRight className='h-3.5 w-3.5 text-orange-400' />
                  <span className='text-muted-foreground'>
                    +{impact.deliveryDelayDays} extra days on packages
                  </span>
                </div>
                <p className='text-xs text-muted-foreground/70'>
                  {impact.shippingSurchargePct >= 80
                    ? 'Hormuz 70%+ blocked, Bab el-Mandeb 75%. Cape of Good Hope rerouting adds weeks.'
                    : impact.shippingSurchargePct >= 30
                    ? 'Your Amazon package costs more and arrives later. Gulf shipping routes disrupted.'
                    : 'Red Sea rerouting via Cape of Good Hope adding transit time and fuel costs.'}
                </p>
              </CardContent>
            </Card>

            {/* ── 5. BOTTOM LINE ── */}
            <Card className={`border sm:col-span-2 lg:col-span-2 ${severityBorder(impact.totalMonthlyExtra, 50, 150, 400)}`}>
              <CardContent className='pt-5 space-y-3'>
                <div className='flex items-center gap-2'>
                  <IconCalculator className={`h-5 w-5 ${severityColor(impact.totalMonthlyExtra, 50, 150, 400)}`} />
                  <span className='text-sm font-bold uppercase tracking-wide text-muted-foreground'>Bottom Line</span>
                </div>
                <div className='flex items-baseline gap-3'>
                  <span className={`text-5xl font-black tabular-nums ${severityColor(impact.totalMonthlyExtra, 50, 150, 400)}`}>
                    {formatDelta(impact.totalMonthlyExtra)}
                  </span>
                  <span className='text-lg text-muted-foreground font-semibold'>/month per household</span>
                </div>

                {/* Severity bar */}
                <div className='space-y-1'>
                  <div className='h-3 w-full rounded-full bg-muted/50 overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${severityBarColor(impact.totalMonthlyExtra, 50, 150, 400)}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className='flex justify-between text-[10px] text-muted-foreground/50'>
                    <span>$0</span>
                    <span>$200</span>
                    <span>$400</span>
                    <span>$600</span>
                    <span>$800+</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
                  <div className='rounded-lg bg-muted/30 px-2.5 py-2'>
                    <div className='text-muted-foreground/70'>Gas</div>
                    <div className='font-bold tabular-nums'>{formatDelta(gasMonthlyExtra)}</div>
                  </div>
                  <div className='rounded-lg bg-muted/30 px-2.5 py-2'>
                    <div className='text-muted-foreground/70'>Groceries</div>
                    <div className='font-bold tabular-nums'>{formatDelta(impact.monthlyGroceryExtra)}</div>
                  </div>
                  <div className='rounded-lg bg-muted/30 px-2.5 py-2'>
                    <div className='text-muted-foreground/70'>Utilities</div>
                    <div className='font-bold tabular-nums'>{formatDelta(impact.monthlyUtilityExtra)}</div>
                  </div>
                  <div className='rounded-lg bg-muted/30 px-2.5 py-2'>
                    <div className='text-muted-foreground/70'>Shipping</div>
                    <div className='font-bold tabular-nums'>+{impact.shippingSurchargePct}%</div>
                  </div>
                </div>

                {/* Historical comparison */}
                <p className='text-xs font-semibold text-muted-foreground'>
                  {historicalComparison(impact.totalMonthlyExtra)}
                </p>

                {/* Headline */}
                <p className='text-[11px] text-muted-foreground/60 italic'>
                  {impact.headline}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Timeline scrubber — bottom */}
      <TimelineScrubber />
    </div>
  );
}
