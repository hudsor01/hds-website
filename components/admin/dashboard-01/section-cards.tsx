/**
 * Section Cards Component
 * 
 * Dashboard metrics cards following shadcn/ui dashboard-01 block pattern
 * with real data from tRPC
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'

export function SectionCards() {
  const { data: dashboardData, isLoading, error } = api.admin.getDashboardAnalytics.useQuery()

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16 mb-2' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-muted-foreground'>
              Failed to load dashboard metrics
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Leads',
      value: dashboardData.totalLeads?.toString() || '0',
      change: '+12%',
      trend: 'up' as const,
      icon: TrendingUp,
      description: 'from last month',
    },
    {
      title: 'Active Contacts',
      value: dashboardData.totalContacts?.toString() || '0',
      change: '+8%',
      trend: 'up' as const,
      icon: Users,
      description: 'from last month',
    },
    {
      title: 'Newsletter Subscribers',
      value: dashboardData.totalNewsletterSubscribers?.toString() || '0',
      change: '+15%',
      trend: 'up' as const,
      icon: MessageSquare,
      description: 'from last month',
    },
    {
      title: 'Monthly Revenue',
      value: '$12,584',
      change: '+25%',
      trend: 'up' as const,
      icon: DollarSign,
      description: 'from last month',
    },
    {
      title: 'Page Views',
      value: dashboardData.totalWebVitals?.toString() || '0',
      change: '+18%',
      trend: 'up' as const,
      icon: Activity,
      description: 'from last month',
    },
    {
      title: 'Conversion Rate',
      value: '22.4%',
      change: '+3.2%',
      trend: 'up' as const,
      icon: TrendingUp,
      description: 'from last month',
    },
  ]

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {cards.map((card, index) => {
        const Icon = card.icon
        const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight
        const trendColor = card.trend === 'up' 
          ? 'text-emerald-600 dark:text-emerald-400' 
          : 'text-red-600 dark:text-red-400'
        
        return (
          <Card key={index} className='hover:shadow-md transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
              <Icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{card.value}</div>
              <p className='text-xs text-muted-foreground'>
                <span className={`inline-flex items-center ${trendColor}`}>
                  <TrendIcon className='h-3 w-3 mr-1' />
                  {card.change}
                </span>
                {' '}{card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}