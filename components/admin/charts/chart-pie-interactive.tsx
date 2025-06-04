'use client';

import * as React from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const description = 'An interactive pie chart showing client acquisition channels';

const clientData = [
  { channel: 'referrals', clients: 186, fill: 'var(--color-referrals)' },
  { channel: 'website', clients: 305, fill: 'var(--color-website)' },
  { channel: 'social', clients: 237, fill: 'var(--color-social)' },
  { channel: 'email', clients: 173, fill: 'var(--color-email)' },
  { channel: 'direct', clients: 209, fill: 'var(--color-direct)' },
];

const chartConfig = {
  clients: {
    label: 'Clients',
  },
  referrals: {
    label: 'Referrals',
    color: 'var(--chart-1)',
  },
  website: {
    label: 'Website',
    color: 'var(--chart-2)',
  },
  social: {
    label: 'Social Media',
    color: 'var(--chart-3)',
  },
  email: {
    label: 'Email Marketing',
    color: 'var(--chart-4)',
  },
  direct: {
    label: 'Direct Contact',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

export function ChartPieInteractive() {
  const id = 'pie-interactive';
  const [activeChannel, setActiveChannel] = React.useState(
    clientData[0]?.channel ?? '',
  );

  const activeIndex = React.useMemo(
    () => clientData.findIndex((item) => item.channel === activeChannel),
    [activeChannel],
  );
  const channels = React.useMemo(() => clientData.map((item) => item.channel), []);

  return (
    <Card data-chart={id} className='flex flex-col'>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className='flex-row items-start space-y-0 pb-0'>
        <div className='grid gap-1'>
          <CardTitle>Client Acquisition Channels</CardTitle>
          <CardDescription>Q4 2024 Client Sources</CardDescription>
        </div>
        <Select value={activeChannel} onValueChange={setActiveChannel}>
          <SelectTrigger
            className='ml-auto h-7 w-[130px] rounded-lg pl-2.5'
            aria-label='Select a value'
          >
            <SelectValue placeholder='Select channel' />
          </SelectTrigger>
          <SelectContent align='end' className='rounded-xl'>
            {channels.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className='rounded-lg [&_span]:flex'
                >
                  <div className='flex items-center gap-2 text-xs'>
                    <span
                      className='flex h-3 w-3 shrink-0 rounded-xs'
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='flex flex-1 justify-center pb-0'>
        <ChartContainer
          id={id}
          config={chartConfig}
          className='mx-auto aspect-square w-full max-w-[300px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={clientData}
              dataKey='clients'
              nameKey='channel'
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {(clientData[activeIndex]?.clients ?? 0).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Clients
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}