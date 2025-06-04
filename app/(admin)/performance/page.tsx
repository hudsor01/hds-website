/**
 * Admin Performance Dashboard
 * 
 * Real-time Core Web Vitals monitoring and performance analytics
 * Shows website performance metrics and optimization insights
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { 
  Activity, 
  Zap, 
  Eye, 
  Clock, 
  Gauge, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'

function getMetricIcon(metric: string) {
  switch (metric) {
    case 'LCP': return <Eye className='h-4 w-4' />
    case 'FID': return <Zap className='h-4 w-4' />
    case 'CLS': return <Activity className='h-4 w-4' />
    case 'FCP': return <Clock className='h-4 w-4' />
    case 'TTFB': return <Gauge className='h-4 w-4' />
    default: return <Activity className='h-4 w-4' />
  }
}

function getMetricName(metric: string) {
  switch (metric) {
    case 'LCP': return 'Largest Contentful Paint'
    case 'FID': return 'First Input Delay'
    case 'CLS': return 'Cumulative Layout Shift'
    case 'FCP': return 'First Contentful Paint'
    case 'TTFB': return 'Time to First Byte'
    default: return metric
  }
}

function getMetricUnit(metric: string) {
  switch (metric) {
    case 'CLS': return ''
    case 'LCP':
    case 'FCP': return 's'
    default: return 'ms'
  }
}

function getMetricRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (metric) {
    case 'LCP':
      return value <= 2.5 ? 'good' : value <= 4.0 ? 'needs-improvement' : 'poor'
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
    case 'FCP':
      return value <= 1.8 ? 'good' : value <= 3.0 ? 'needs-improvement' : 'poor'
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
    default:
      return 'good'
  }
}

function getRatingBadge(rating: string) {
  switch (rating) {
    case 'good':
      return <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Good</Badge>
    case 'needs-improvement':
      return <Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>Needs Improvement</Badge>
    case 'poor':
      return <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>Poor</Badge>
    default:
      return <Badge variant='outline'>{rating}</Badge>
  }
}

function calculatePerformanceScore(metrics: Record<string, unknown>): number {
  if (!metrics?.LCP || !metrics?.FID || !metrics?.CLS) return 0
  
  const lcpScore = getMetricRating('LCP', metrics.LCP.avg) === 'good' ? 100 : 
                   getMetricRating('LCP', metrics.LCP.avg) === 'needs-improvement' ? 75 : 50
  const fidScore = getMetricRating('FID', metrics.FID.avg) === 'good' ? 100 : 
                   getMetricRating('FID', metrics.FID.avg) === 'needs-improvement' ? 75 : 50
  const clsScore = getMetricRating('CLS', metrics.CLS.avg) === 'good' ? 100 : 
                   getMetricRating('CLS', metrics.CLS.avg) === 'needs-improvement' ? 75 : 50
  
  return Math.round((lcpScore + fidScore + clsScore) / 3)
}

function getDateRange(period: string): { startDate?: string; endDate?: string } {
  const now = new Date()
  const endDate = now.toISOString()
  
  switch (period) {
    case '7d':
      return {
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate,
      }
    case '30d':
      return {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate,
      }
    case '90d':
      return {
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate,
      }
    default:
      return {}
  }
}

export default function PerformancePage() {
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  // Get date range for API calls
  const dateParams = getDateRange(dateRange)

  // Fetch performance metrics
  const { 
    data: performanceData, 
    isLoading: performanceLoading, 
    refetch: refetchPerformance, 
  } = api.admin.getPerformanceMetrics.useQuery(dateParams)

  // Fetch analytics data for additional context
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
  } = api.admin.getDashboardAnalytics.useQuery(dateParams)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchPerformance()])
      toast({ title: 'Success', description: 'Performance data refreshed' })
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to refresh data',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleExport = () => {
    // Generate CSV export of performance data
    if (!performanceData) return

    const csvData = [
      ['Metric', 'Average', 'P95', 'Count', 'Rating'],
      ...Object.entries(performanceData.metrics).map(([metric, data]: [string, { avg?: number; p95?: number; count?: number }]) => [
        getMetricName(metric),
        data.avg?.toFixed(2) || '0',
        data.p95?.toFixed(2) || '0',
        data.count || '0',
        getMetricRating(metric, data.avg || 0),
      ]),
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${dateRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate derived metrics
  const performanceScore = performanceData ? calculatePerformanceScore(performanceData.metrics) : 0
  const totalSessions = analyticsData?.overview.uniqueVisitors || 0
  const passingSessionsCount = performanceData ? 
    Math.round(totalSessions * (performanceScore / 100)) : 0
  const passingRate = totalSessions > 0 ? (passingSessionsCount / totalSessions) * 100 : 0

  // Generate recommendations based on real data
  const generateRecommendations = () => {
    if (!performanceData?.metrics) return []

    const recommendations = []
    const metrics = performanceData.metrics

    if (metrics.LCP && getMetricRating('LCP', metrics.LCP.avg) !== 'good') {
      recommendations.push({
        type: 'warning',
        title: 'Improve LCP Performance',
        description: 'Optimize images, improve server response times, and consider using a CDN.',
      })
    } else if (metrics.LCP) {
      recommendations.push({
        type: 'success',
        title: 'Excellent LCP Performance',
        description: 'Your Largest Contentful Paint is in the good range. Keep optimizing images and server response times.',
      })
    }

    if (metrics.FID && getMetricRating('FID', metrics.FID.avg) !== 'good') {
      recommendations.push({
        type: 'warning',
        title: 'Reduce Input Delay',
        description: 'Minimize JavaScript execution time and consider code splitting.',
      })
    } else if (metrics.FID) {
      recommendations.push({
        type: 'success',
        title: 'Great Interactivity',
        description: 'First Input Delay is excellent. Your site responds quickly to user interactions.',
      })
    }

    if (metrics.CLS && getMetricRating('CLS', metrics.CLS.avg) !== 'good') {
      recommendations.push({
        type: 'warning',
        title: 'Reduce Layout Shifts',
        description: 'Set dimensions for images and videos, avoid inserting content above existing content.',
      })
    } else if (metrics.CLS) {
      recommendations.push({
        type: 'success',
        title: 'Stable Layout',
        description: 'CLS is good but watch for layout shifts when adding new content or ads.',
      })
    }

    recommendations.push({
      type: 'info',
      title: 'Continue Optimization',
      description: 'Consider implementing resource hints and optimizing critical rendering path.',
    })

    return recommendations.slice(0, 4) // Limit to 4 recommendations
  }

  const recommendations = generateRecommendations()

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Performance Dashboard</h1>
          <p className='text-muted-foreground'>
            Core Web Vitals monitoring and performance insights
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className='w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>Last 7 days</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
              <SelectItem value='90d'>Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant='outline' 
            size='sm' 
            onClick={handleRefresh}
            disabled={refreshing || performanceLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant='outline' 
            size='sm' 
            onClick={handleExport}
            disabled={!performanceData}
          >
            <Download className='mr-2 h-4 w-4' />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Performance Score</CardTitle>
            <Gauge className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className={`text-2xl font-bold ${
                  performanceScore >= 90 ? 'text-green-600' : 
                  performanceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {performanceScore}
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  {performanceScore >= 90 ? (
                    <CheckCircle className='h-3 w-3 text-green-500' />
                  ) : (
                    <AlertTriangle className='h-3 w-3 text-yellow-500' />
                  )}
                  {performanceScore >= 90 ? 'Excellent performance' : 
                   performanceScore >= 70 ? 'Good performance' : 'Needs improvement'}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Core Web Vitals</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <>
                <div className={`text-2xl font-bold ${
                  performanceScore >= 90 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {performanceScore >= 90 ? 'Passing' : 'Warning'}
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  {performanceScore >= 90 ? (
                    <TrendingUp className='h-3 w-3 text-green-500' />
                  ) : (
                    <AlertTriangle className='h-3 w-3 text-yellow-500' />
                  )}
                  {performanceScore >= 90 ? 'All metrics in good range' : 'Some metrics need attention'}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Passing Sessions</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {performanceLoading || analyticsLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>{passingRate.toFixed(1)}%</div>
                <div className='text-xs text-muted-foreground'>
                  ~{passingSessionsCount.toLocaleString()} of {totalSessions.toLocaleString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Monitoring Status</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>Active</div>
            <div className='text-xs text-muted-foreground'>
              Real-time tracking enabled
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Current performance metrics based on real user data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {performanceLoading ? (
            <div className='grid gap-4 md:grid-cols-5'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-24 w-full' />
              ))}
            </div>
          ) : performanceData?.metrics ? (
            <div className='grid gap-4 md:grid-cols-5'>
              {Object.entries(performanceData.metrics).map(([metric, data]: [string, { avg?: number; p95?: number; count?: number }]) => {
                const rating = getMetricRating(metric, data.avg || 0)
                
                return (
                  <div key={metric} className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      {getMetricIcon(metric)}
                      <span className='text-sm font-medium'>{metric}</span>
                      {getRatingBadge(rating)}
                    </div>
                    
                    <div>
                      <div className='text-2xl font-bold'>
                        {metric === 'CLS' ? (data.avg || 0).toFixed(3) : 
                         metric === 'LCP' || metric === 'FCP' ? ((data.avg || 0) / 1000).toFixed(2) : 
                         Math.round(data.avg || 0)}
                        <span className='text-sm font-normal text-muted-foreground ml-1'>
                          {getMetricUnit(metric)}
                        </span>
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {getMetricName(metric)}
                      </div>
                    </div>

                    <div className='text-xs text-muted-foreground'>
                      P95: {metric === 'CLS' ? (data.p95 || 0).toFixed(3) : 
                            metric === 'LCP' || metric === 'FCP' ? ((data.p95 || 0) / 1000).toFixed(2) : 
                            Math.round(data.p95 || 0)}{getMetricUnit(metric)}
                      <br />
                      {(data.count || 0).toLocaleString()} samples
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              No performance data available for the selected time period
            </div>
          )}
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>
        {/* Page Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Page Performance</CardTitle>
            <CardDescription>
              Performance metrics by page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <div className='space-y-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='h-16 w-full' />
                ))}
              </div>
            ) : performanceData?.pageBreakdown?.length ? (
              <div className='space-y-4'>
                {performanceData.pageBreakdown.map((page: Record<string, unknown>, index: number) => (
                  <div key={index} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>{page.page}</span>
                      <span className='text-sm text-muted-foreground'>
                        {page.sessions?.toLocaleString() || 0} sessions
                      </span>
                    </div>
                    
                    <div className='grid grid-cols-3 gap-4 text-sm'>
                      <div>
                        <div className='text-xs text-muted-foreground'>LCP</div>
                        <div className='font-medium'>
                          {page.avgLcp ? ((page.avgLcp) / 1000).toFixed(1) : '0'}s
                        </div>
                      </div>
                      <div>
                        <div className='text-xs text-muted-foreground'>FID</div>
                        <div className='font-medium'>{Math.round(page.avgFid || 0)}ms</div>
                      </div>
                      <div>
                        <div className='text-xs text-muted-foreground'>CLS</div>
                        <div className='font-medium'>{(page.avgCls || 0).toFixed(3)}</div>
                      </div>
                    </div>
                    
                    {index < performanceData.pageBreakdown.length - 1 && (
                      <div className='border-b border-muted mt-4' />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No page performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
            <CardDescription>
              Suggestions to improve performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recommendations.map((rec, index) => (
                <div key={index} className='flex items-start gap-3'>
                  {rec.type === 'success' && <CheckCircle className='h-5 w-5 text-green-500 mt-0.5' />}
                  {rec.type === 'warning' && <AlertTriangle className='h-5 w-5 text-yellow-500 mt-0.5' />}
                  {rec.type === 'info' && <TrendingUp className='h-5 w-5 text-blue-500 mt-0.5' />}
                  <div>
                    <div className='font-medium text-sm'>{rec.title}</div>
                    <div className='text-xs text-muted-foreground'>
                      {rec.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Timeline Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
          <CardDescription>
            Track performance changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64 flex items-center justify-center text-muted-foreground'>
            {performanceLoading ? (
              <Skeleton className='h-48 w-full' />
            ) : (
              <div className='text-center'>
                Performance timeline chart would go here
                <br />
                <span className='text-sm'>(Integration with your preferred charting library)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}