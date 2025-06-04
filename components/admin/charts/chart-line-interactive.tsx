'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'An interactive line chart showing revenue trends';

const revenueData = [
  { date: '2024-10-01', services: 22200, products: 15000 },
  { date: '2024-10-02', services: 19700, products: 18000 },
  { date: '2024-10-03', services: 16700, products: 12000 },
  { date: '2024-10-04', services: 24200, products: 26000 },
  { date: '2024-10-05', services: 37300, products: 29000 },
  { date: '2024-10-06', services: 30100, products: 34000 },
  { date: '2024-10-07', services: 24500, products: 18000 },
  { date: '2024-10-08', services: 40900, products: 32000 },
  { date: '2024-10-09', services: 15900, products: 11000 },
  { date: '2024-10-10', services: 26100, products: 19000 },
  { date: '2024-10-11', services: 32700, products: 35000 },
  { date: '2024-10-12', services: 29200, products: 21000 },
  { date: '2024-10-13', services: 34200, products: 38000 },
  { date: '2024-10-14', services: 23700, products: 22000 },
  { date: '2024-10-15', services: 22000, products: 17000 },
  { date: '2024-11-01', services: 23800, products: 19000 },
  { date: '2024-11-02', services: 44600, products: 36000 },
  { date: '2024-11-03', services: 36400, products: 41000 },
  { date: '2024-11-04', services: 24300, products: 18000 },
  { date: '2024-11-05', services: 18900, products: 15000 },
  { date: '2024-11-06', services: 23700, products: 20000 },
  { date: '2024-11-07', services: 22400, products: 17000 },
  { date: '2024-11-08', services: 23800, products: 23000 },
  { date: '2024-11-09', services: 38700, products: 29000 },
  { date: '2024-11-10', services: 31500, products: 25000 },
  { date: '2024-12-01', services: 47500, products: 52000 },
  { date: '2024-12-02', services: 49800, products: 42000 },
  { date: '2024-12-03', services: 38800, products: 30000 },
  { date: '2024-12-04', services: 34900, products: 21000 },
  { date: '2024-12-05', services: 44800, products: 49000 },
];

const chartConfig = {
  revenue: {
    label: 'Revenue',
  },
  services: {
    label: 'Services',
    color: 'var(--chart-1)',
  },
  products: {
    label: 'Products',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ChartLineInteractive() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('services');

  const total = React.useMemo(
    () => ({
      services: revenueData.reduce((acc, curr) => acc + curr.services, 0),
      products: revenueData.reduce((acc, curr) => acc + curr.products, 0),
    }),
    [],
  );

  return (
    <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Revenue Trends - Q4 2024</CardTitle>
          <CardDescription>
            Showing monthly revenue breakdown by category
          </CardDescription>
        </div>
        <div className='flex'>
          {['services', 'products'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  ${(total[key as keyof typeof total] / 1000).toFixed(0)}k
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <LineChart
            accessibilityLayer
            data={revenueData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='revenue'
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  formatter={(value) => [`$${(Number(value) / 1000).toFixed(1)}k`, '']}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type='monotone'
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}