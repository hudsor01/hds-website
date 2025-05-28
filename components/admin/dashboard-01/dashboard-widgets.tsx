/**
 * Dashboard Widgets Component
 * 
 * Collection of dashboard widgets following shadcn/ui dashboard-01 block patterns
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
  CalendarDays,
  Clock,
  TrendingUp,
  Target,
  Star,
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'

export function RecentActivity() {
  const { data: recentActivity } = api.admin.getRecentActivity.useQuery()

  const activities = recentActivity || [
    {
      id: '1',
      type: 'lead',
      title: 'New lead submission',
      description: 'John Doe submitted a contact form',
      time: '2 hours ago',
      icon: Users,
    },
    {
      id: '2', 
      type: 'contact',
      title: 'Contact form submission',
      description: 'Sarah Johnson inquired about web development',
      time: '4 hours ago',
      icon: MessageSquare,
    },
    {
      id: '3',
      type: 'newsletter',
      title: 'Newsletter subscription',
      description: 'Mike Chen subscribed to the newsletter',
      time: '6 hours ago',
      icon: Mail,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions on your website</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className='flex items-center gap-4'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-accent'>
                  <Icon className='h-4 w-4 text-accent-foreground' />
                </div>
                <div className='flex-1 space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {activity.title}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {activity.description}
                  </p>
                </div>
                <div className='text-sm text-muted-foreground'>
                  {activity.time}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function TeamPerformance() {
  const teamMembers = [
    {
      name: 'Admin User',
      email: 'admin@hudsondigital.com',
      avatar: '/avatars/01.png',
      role: 'Administrator',
      leadsHandled: 42,
      conversionRate: 85,
      status: 'active',
    },
    {
      name: 'System',
      email: 'system@hudsondigital.com', 
      avatar: '/avatars/02.png',
      role: 'Automation',
      leadsHandled: 28,
      conversionRate: 92,
      status: 'active',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Lead handling and conversion metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {teamMembers.map((member) => (
            <div key={member.email} className='flex items-center gap-4'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-medium leading-none'>{member.name}</p>
                  <Badge variant='secondary' className='text-xs'>
                    {member.role}
                  </Badge>
                </div>
                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  <span>{member.leadsHandled} leads</span>
                  <span>{member.conversionRate}% conversion</span>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-sm font-medium'>{member.conversionRate}%</div>
                <Progress value={member.conversionRate} className='w-16' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActions() {
  const actions = [
    {
      title: 'New Lead',
      description: 'Create a new lead manually',
      icon: Users,
      action: () => console.log('Create new lead'),
    },
    {
      title: 'Export Data',
      description: 'Download leads and contacts',
      icon: Activity,
      action: () => console.log('Export data'),
    },
    {
      title: 'Send Newsletter',
      description: 'Send to all subscribers',
      icon: Mail,
      action: () => console.log('Send newsletter'),
    },
    {
      title: 'Generate Report',
      description: 'Create analytics report',
      icon: TrendingUp,
      action: () => console.log('Generate report'),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3'>
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant='outline'
                className='h-auto justify-start p-4'
                onClick={action.action}
              >
                <Icon className='mr-3 h-4 w-4' />
                <div className='text-left'>
                  <div className='font-medium'>{action.title}</div>
                  <div className='text-sm text-muted-foreground'>
                    {action.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function MonthlyGoals() {
  const { data: analytics } = api.admin.getDashboardAnalytics.useQuery()

  const goals = [
    {
      title: 'Monthly Leads',
      current: analytics?.totalLeads || 0,
      target: 100,
      unit: 'leads',
      color: 'bg-blue-500',
    },
    {
      title: 'Revenue Goal',
      current: 45230,
      target: 60000,
      unit: '$',
      color: 'bg-green-500',
    },
    {
      title: 'Conversion Rate',
      current: 22.4,
      target: 25,
      unit: '%',
      color: 'bg-purple-500',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Goals</CardTitle>
        <CardDescription>Track progress towards monthly targets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {goals.map((goal, index) => {
            const progress = (goal.current / goal.target) * 100
            const isOnTrack = progress >= 75
            
            return (
              <div key={index} className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>{goal.title}</span>
                  <div className='flex items-center gap-1'>
                    {isOnTrack && <TrendingUp className='h-3 w-3 text-green-500' />}
                    <span className='text-muted-foreground'>
                      {goal.unit === '$' ? '$' : ''}{goal.current.toLocaleString()}
                      {goal.unit !== '$' && goal.unit !== '' ? ` ${goal.unit}` : ''}
                      {' / '}
                      {goal.unit === '$' ? '$' : ''}{goal.target.toLocaleString()}
                      {goal.unit !== '$' && goal.unit !== '' ? ` ${goal.unit}` : ''}
                    </span>
                  </div>
                </div>
                <div className='space-y-1'>
                  <Progress value={Math.min(progress, 100)} className='h-2' />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>{Math.round(progress)}% complete</span>
                    <Badge variant={isOnTrack ? 'default' : 'secondary'} className='text-xs'>
                      {isOnTrack ? 'On Track' : 'Behind'}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function TopReferrers() {
  const referrers = [
    { source: 'google.com', visits: 1234, percentage: 42 },
    { source: 'linkedin.com', visits: 856, percentage: 29 },
    { source: 'direct', visits: 623, percentage: 21 },
    { source: 'twitter.com', visits: 234, percentage: 8 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Referrers</CardTitle>
        <CardDescription>Traffic sources this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {referrers.map((referrer, index) => (
            <div key={index} className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-primary' />
                <div>
                  <p className='text-sm font-medium'>{referrer.source}</p>
                  <p className='text-xs text-muted-foreground'>
                    {referrer.visits.toLocaleString()} visits
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-sm font-medium'>{referrer.percentage}%</div>
                <Progress value={referrer.percentage} className='w-16 h-1' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}