/**
 * GraphQL Analytics Endpoint
 * Provides GraphQL interface for querying Supabase analytics data
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createServerLogger } from '@/lib/logger'
import { supabaseAdmin, queryAnalytics } from '@/lib/supabase'
import {
  graphqlRequestSchema,
  analyticsVariablesSchema,
  timeRangeSchema,
  type TimeRange,
} from '@/lib/schemas'

const logger = createServerLogger('graphql-analytics')

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawData = await request.json()

    // Validate request data
    const validation = graphqlRequestSchema.safeParse(rawData)
    if (!validation.success) {
      logger.error('Invalid GraphQL request', {
        errors: validation.error.issues,
        rawData,
      })
      return NextResponse.json(
        {
          errors: [{
            message: 'Invalid GraphQL request',
            details: validation.error.issues,
          }],
        },
        { status: 400 }
      )
    }

    const { query, variables } = validation.data

    logger.info('GraphQL analytics query received', {
      queryLength: query.length,
      hasVariables: !!variables,
    })

    // Validate variables if present
    if (variables) {
      const variablesValidation = analyticsVariablesSchema.safeParse(variables)
      if (!variablesValidation.success) {
        logger.error('Invalid query variables', {
          errors: variablesValidation.error.issues,
          variables,
        })
        return NextResponse.json(
          {
            errors: [{
              message: 'Invalid query variables',
              details: variablesValidation.error.issues,
            }],
          },
          { status: 400 }
        )
      }
    }

    // Execute GraphQL query
    const result = await executeAnalyticsQuery(query, variables || {})

    logger.info('GraphQL query executed successfully')
    return NextResponse.json(result)

  } catch (error) {
    logger.error('GraphQL query failed', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      {
        errors: [{
          message: 'Query execution failed',
          details: error instanceof Error ? error.message : String(error),
        }],
      },
      { status: 500 }
    )
  }
}

async function executeAnalyticsQuery(query: string, variables: Record<string, unknown> = {}) {
  // Parse and execute common analytics queries

  if (query.includes('getPageViews')) {
    return await getPageViews(variables)
  } else if (query.includes('getWebVitals')) {
    return await getWebVitals(variables)
  } else if (query.includes('getLeadStats')) {
    return await getLeadStats(variables)
  } else if (query.includes('getEventStats')) {
    return await getEventStats(variables)
  } else if (query.includes('getFunnelAnalytics')) {
    return await getFunnelAnalytics(variables)
  } else {
    // Fallback to direct Supabase GraphQL if available
    return await queryAnalytics(query, variables)
  }
}

async function getPageViews(variables: Record<string, unknown>) {
  const timeRangeValidation = timeRangeSchema.safeParse(variables.timeRange || '24h')
  const timeRange = timeRangeValidation.success ? timeRangeValidation.data : '24h' as TimeRange

  const limitNum = typeof variables.limit === 'number' ? Math.min(variables.limit, 1000) : 100

  const startTime = new Date()
  switch (timeRange) {
    case '24h':
      startTime.setHours(startTime.getHours() - 24)
      break
    case '7d':
      startTime.setDate(startTime.getDate() - 7)
      break
    case '30d':
      startTime.setDate(startTime.getDate() - 30)
      break
    case '90d':
      startTime.setDate(startTime.getDate() - 90)
      break
  }

  const { data: pageViews, error } = await supabaseAdmin
    .from('page_analytics')
    .select(`
      path,
      title,
      timestamp,
      user_agent,
      referrer,
      duration_seconds,
      bounce
    `)
    .gte('timestamp', startTime.toISOString())
    .order('timestamp', { ascending: false })
    .limit(limitNum)

  if (error) {throw error}

  // Aggregate data
  const pathStats = new Map()
  let totalViews = 0
  let totalBounces = 0

  for (const view of pageViews || []) {
    totalViews++
    if (view.bounce) {totalBounces++}

    if (!pathStats.has(view.path)) {
      pathStats.set(view.path, {
        path: view.path,
        views: 0,
        uniqueViews: 0,
        avgDuration: 0,
        bounces: 0,
      })
    }

    const stats = pathStats.get(view.path)
    stats.views++
    if (view.duration_seconds) {
      stats.avgDuration = (stats.avgDuration + view.duration_seconds) / stats.views
    }
    if (view.bounce) {stats.bounces++}
  }

  return {
    data: {
      pageViews: {
        total: totalViews,
        bounceRate: totalViews > 0 ? (totalBounces / totalViews * 100).toFixed(2) : 0,
        pages: Array.from(pathStats.values())
          .sort((a, b) => b.views - a.views),
        timeRange,
      }
    }
  }
}

async function getWebVitals(variables: Record<string, unknown>) {
  const { timeRange = '24h', metric = null } = variables
  const metricStr = typeof metric === 'string' ? metric : null

  const startTime = new Date()
  if (timeRange === '24h') {
    startTime.setHours(startTime.getHours() - 24)
  } else if (timeRange === '7d') {
    startTime.setDate(startTime.getDate() - 7)
  }

  let query = supabaseAdmin
    .from('web_vitals')
    .select('*')
    .gte('timestamp', startTime.toISOString())

  if (metricStr) {
    query = query.eq('metric_type', metricStr)
  }

  const { data: vitals, error } = await query.order('timestamp', { ascending: false })

  if (error) {throw error}

  // Aggregate by metric type
  const metricStats = new Map()

  for (const vital of vitals || []) {
    if (!metricStats.has(vital.metric_type)) {
      metricStats.set(vital.metric_type, {
        metric: vital.metric_type,
        count: 0,
        averageValue: 0,
        goodCount: 0,
        needsImprovementCount: 0,
        poorCount: 0,
      })
    }

    const stats = metricStats.get(vital.metric_type)
    stats.count++
    stats.averageValue = (stats.averageValue + vital.value) / stats.count

    switch (vital.rating) {
      case 'good':
        stats.goodCount++
        break
      case 'needs-improvement':
        stats.needsImprovementCount++
        break
      case 'poor':
        stats.poorCount++
        break
    }
  }

  return {
    data: {
      webVitals: {
        metrics: Array.from(metricStats.values()),
        timeRange,
      }
    }
  }
}

async function getLeadStats(variables: Record<string, unknown>) {
  const { timeRange = '30d' } = variables

  const startTime = new Date()
  if (timeRange === '7d') {
    startTime.setDate(startTime.getDate() - 7)
  } else if (timeRange === '30d') {
    startTime.setDate(startTime.getDate() - 30)
  } else if (timeRange === '90d') {
    startTime.setDate(startTime.getDate() - 90)
  }

  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .gte('created_at', startTime.toISOString())

  if (error) {throw error}

  // Aggregate lead data
  const sourceStats = new Map()
  const statusStats = new Map()
  const totalLeads = leads?.length || 0
  let avgScore = 0

  for (const lead of leads || []) {
    avgScore += lead.lead_score || 0

    // Source stats
    const source = lead.source || 'unknown'
    sourceStats.set(source, (sourceStats.get(source) || 0) + 1)

    // Status stats
    const status = lead.status || 'new'
    statusStats.set(status, (statusStats.get(status) || 0) + 1)
  }

  if (totalLeads > 0) {
    avgScore = avgScore / totalLeads
  }

  return {
    data: {
      leads: {
        total: totalLeads,
        averageScore: Math.round(avgScore),
        bySource: Array.from(sourceStats.entries()).map(([source, count]) => ({
          source,
          count,
          percentage: ((count / totalLeads) * 100).toFixed(1),
        })),
        byStatus: Array.from(statusStats.entries()).map(([status, count]) => ({
          status,
          count,
          percentage: ((count / totalLeads) * 100).toFixed(1),
        })),
        timeRange,
      }
    }
  }
}

async function getEventStats(variables: Record<string, unknown>) {
  const { timeRange = '24h', category = null } = variables
  const categoryStr = typeof category === 'string' ? category : null

  const startTime = new Date()
  if (timeRange === '24h') {
    startTime.setHours(startTime.getHours() - 24)
  } else if (timeRange === '7d') {
    startTime.setDate(startTime.getDate() - 7)
  }

  let query = supabaseAdmin
    .from('custom_events')
    .select('*')
    .gte('timestamp', startTime.toISOString())

  if (categoryStr) {
    query = query.eq('event_category', categoryStr)
  }

  const { data: events, error } = await query

  if (error) {throw error}

  const eventStats = new Map()

  for (const event of events || []) {
    const key = event.event_name
    if (!eventStats.has(key)) {
      eventStats.set(key, {
        eventName: key,
        category: event.event_category,
        count: 0,
        uniqueUsers: new Set(),
        totalValue: 0,
      })
    }

    const stats = eventStats.get(key)
    stats.count++
    if (event.user_id) {stats.uniqueUsers.add(event.user_id)}
    if (event.value) {stats.totalValue += event.value}
  }

  // Convert to array and add unique user counts
  const eventArray = Array.from(eventStats.values()).map(stats => ({
    ...stats,
    uniqueUsers: stats.uniqueUsers.size,
  }))

  return {
    data: {
      events: {
        total: events?.length || 0,
        events: eventArray.sort((a, b) => b.count - a.count),
        timeRange,
      }
    }
  }
}

async function getFunnelAnalytics(variables: Record<string, unknown>) {
  const { funnelName, timeRange = '7d' } = variables
  const funnelNameStr = typeof funnelName === 'string' ? funnelName : null

  const startTime = new Date()
  if (timeRange === '7d') {
    startTime.setDate(startTime.getDate() - 7)
  } else if (timeRange === '30d') {
    startTime.setDate(startTime.getDate() - 30)
  }

  let query = supabaseAdmin
    .from('conversion_funnel')
    .select('*')
    .gte('timestamp', startTime.toISOString())

  if (funnelNameStr) {
    query = query.eq('funnel_name', funnelNameStr)
  }

  const { data: funnelSteps, error } = await query.order('step_order')

  if (error) {throw error}

  const funnelStats = new Map<string, Map<number, {
    stepName: string
    stepOrder: number
    total: number
    completed: number
  }>>()

  for (const step of funnelSteps || []) {
    const key = step.funnel_name
    if (!funnelStats.has(key)) {
      funnelStats.set(key, new Map())
    }

    const funnel = funnelStats.get(key)
    if (!funnel) { continue }

    if (!funnel.has(step.step_order)) {
      funnel.set(step.step_order, {
        stepName: step.step_name,
        stepOrder: step.step_order,
        total: 0,
        completed: 0,
      })
    }

    const stepStats = funnel.get(step.step_order)
    if (!stepStats) { continue }
    stepStats.total++
    if (step.completed) {stepStats.completed++}
  }

  // Convert to structured data
  const funnelData = Array.from(funnelStats.entries()).map(([name, steps]) => ({
    funnelName: name,
    steps: Array.from(steps.values()).map(step => ({
      stepName: step.stepName,
      stepOrder: step.stepOrder,
      total: step.total,
      completed: step.completed,
      conversionRate: step.total > 0 ? ((step.completed / step.total) * 100).toFixed(2) : 0,
    })),
  }))

  return {
    data: {
      funnels: funnelData,
      timeRange,
    }
  }
}