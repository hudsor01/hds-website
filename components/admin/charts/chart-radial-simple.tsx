'use client'

import { TrendingUp } from 'lucide-react'
import { RadialBar, RadialBarChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const description = 'A radial chart showing project completion rates'

const completionData = [
  { category: 'web_dev', completed: 85, fill: 'var(--color-web_dev)' },
  { category: 'analytics', completed: 92, fill: 'var(--color-analytics)' },
  { category: 'revops', completed: 78, fill: 'var(--color-revops)' },
  { category: 'consulting', completed: 89, fill: 'var(--color-consulting)' },
  { category: 'maintenance', completed: 95, fill: 'var(--color-maintenance)' },
]

const chartConfig = {
  completed: {
    label: 'Completion Rate (%)',
  },
  web_dev: {
    label: 'Web Development',
    color: 'var(--chart-1)',
  },
  analytics: {
    label: 'Data Analytics',
    color: 'var(--chart-2)',
  },
  revops: {
    label: 'Revenue Operations',
    color: 'var(--chart-3)',
  },
  consulting: {
    label: 'Consulting',
    color: 'var(--chart-4)',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

export function ChartRadialSimple() {
  const averageCompletion = Math.round(
    completionData.reduce((acc, curr) => acc + curr.completed, 0) / completionData.length,
  )

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Project Completion Rates</CardTitle>
        <CardDescription>Q4 2024 Service Performance</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <RadialBarChart data={completionData} innerRadius={30} outerRadius={110}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey='category' formatter={(value) => [`${value}%`, 'Completion']} />}
            />
            <RadialBar dataKey='completed' background />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          Average completion rate: {averageCompletion}% <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Showing project completion rates across all services
        </div>
      </CardFooter>
    </Card>
  )
}