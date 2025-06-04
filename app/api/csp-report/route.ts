/**
 * CSP Violation Reporting Endpoint
 * 
 * Handles Content Security Policy violation reports as per Next.js documentation.
 * Provides monitoring, logging, and analysis of CSP violations for security improvement.
 */

import { NextRequest, NextResponse } from 'next/server'

interface CSPViolation {
  'csp-report': {
    'document-uri': string
    'referrer': string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    'blocked-uri': string
    'line-number': number
    'column-number': number
    'source-file': string
  }
}

interface ParsedCSPViolation {
  documentUri: string
  referrer: string
  violatedDirective: string
  effectiveDirective: string
  originalPolicy: string
  blockedUri: string
  lineNumber: number
  columnNumber: number
  sourceFile: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface CSPViolationLog {
  id: string
  timestamp: string
  violation: ParsedCSPViolation
  userAgent: string
  ip: string
  referer?: string
  requestId?: string
}

// In-memory storage for development/testing
// In production, you'd want to use a proper database or logging service
const violationLogs: CSPViolationLog[] = []

/**
 * Parse and enrich CSP violation data
 */
function parseCSPViolation(violation: CSPViolation): ParsedCSPViolation {
  const report = violation['csp-report']
  
  // Determine severity based on violation type
  let severity: ParsedCSPViolation['severity'] = 'medium'
  
  if (report['violated-directive'].includes('script-src')) {
    severity = 'high' // Script violations are serious
  } else if (report['violated-directive'].includes('object-src') || 
             report['violated-directive'].includes('base-uri')) {
    severity = 'critical' // These can be very dangerous
  } else if (report['violated-directive'].includes('img-src') || 
             report['violated-directive'].includes('style-src')) {
    severity = 'low' // Usually cosmetic issues
  }
  
  return {
    documentUri: report['document-uri'],
    referrer: report['referrer'],
    violatedDirective: report['violated-directive'],
    effectiveDirective: report['effective-directive'],
    originalPolicy: report['original-policy'],
    blockedUri: report['blocked-uri'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
    sourceFile: report['source-file'],
    severity,
  }
}

/**
 * Handle CSP violation reports
 * POST /api/csp-report
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the violation report
    const violation: CSPViolation = await request.json()
    
    // Extract request metadata
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const referer = request.headers.get('referer')
    const requestId = request.headers.get('x-request-id')

    // Parse and enrich violation data
    const parsedViolation = parseCSPViolation(violation)
    
    // Create log entry
    const logEntry: CSPViolationLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      violation: parsedViolation,
      userAgent,
      ip,
      referer: referer || undefined,
      requestId: requestId || undefined,
    }

    // Store violation (in production, send to monitoring service)
    violationLogs.push(logEntry)
    
    // Keep only last 1000 violations in memory
    if (violationLogs.length > 1000) {
      violationLogs.splice(0, violationLogs.length - 1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 CSP Violation:', {
        directive: parsedViolation.violatedDirective,
        blockedUri: parsedViolation.blockedUri,
        documentUri: parsedViolation.documentUri,
        severity: parsedViolation.severity,
      })
    }

    // In production, you might want to:
    // 1. Send to monitoring service (DataDog, New Relic, etc.)
    // 2. Store in database for analysis
    // 3. Alert on critical violations
    // 4. Rate limit to prevent spam
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external monitoring
      await sendToMonitoring(logEntry)
      
      // Example: Alert on critical violations
      if (parsedViolation.severity === 'critical') {
        await alertOnCriticalViolation(logEntry)
      }
    }

    return NextResponse.json(
      { 
        message: 'Violation report received',
        id: logEntry.id,
        severity: parsedViolation.severity,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error processing CSP violation report:', error)
    
    return NextResponse.json(
      { error: 'Failed to process violation report' },
      { status: 400 },
    )
  }
}

/**
 * Get CSP violation statistics (for admin/monitoring)
 * GET /api/csp-report
 */
export async function GET(request: NextRequest) {
  try {
    // Check authorization (implement your auth logic)
    const authHeader = request.headers.get('authorization')
    if (!isAuthorized(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const severity = url.searchParams.get('severity')
    const directive = url.searchParams.get('directive')

    // Filter violations based on query parameters
    let filteredViolations = [...violationLogs]

    if (severity) {
      filteredViolations = filteredViolations.filter(
        log => log.violation.severity === severity,
      )
    }

    if (directive) {
      filteredViolations = filteredViolations.filter(
        log => log.violation.violatedDirective.includes(directive),
      )
    }

    // Sort by timestamp (newest first) and limit results
    const violations = filteredViolations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    // Generate statistics
    const stats = generateViolationStats(violationLogs)

    return NextResponse.json({
      violations,
      stats,
      total: filteredViolations.length,
      showing: violations.length,
    })
  } catch (error) {
    console.error('Error fetching CSP violations:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch violations' },
      { status: 500 },
    )
  }
}

/**
 * Generate statistics from violation logs
 */
function generateViolationStats(logs: CSPViolationLog[]) {
  const now = Date.now()
  const last24h = logs.filter(log => 
    now - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000,
  )
  const last7d = logs.filter(log => 
    now - new Date(log.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000,
  )

  // Count by severity
  const severityCounts = logs.reduce((acc, log) => {
    acc[log.violation.severity] = (acc[log.violation.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Count by directive
  const directiveCounts = logs.reduce((acc, log) => {
    const directive = log.violation.violatedDirective.split(' ')[0]
    acc[directive] = (acc[directive] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Top blocked URIs
  const blockedUriCounts = logs.reduce((acc, log) => {
    const uri = log.violation.blockedUri
    acc[uri] = (acc[uri] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topBlockedUris = Object.entries(blockedUriCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([uri, count]) => ({ uri, count }))

  return {
    total: logs.length,
    last24h: last24h.length,
    last7d: last7d.length,
    bySeverity: severityCounts,
    byDirective: directiveCounts,
    topBlockedUris,
    trends: {
      daily: generateDailyTrends(logs),
      hourly: generateHourlyTrends(last24h),
    },
  }
}

/**
 * Generate daily trends for the last 30 days
 */
function generateDailyTrends(logs: CSPViolationLog[]) {
  const trends: Record<string, number> = {}
  const now = new Date()
  
  // Initialize last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    trends[dateKey] = 0
  }
  
  // Count violations by day
  logs.forEach(log => {
    const dateKey = log.timestamp.split('T')[0]
    if (Object.prototype.hasOwnProperty.call(trends, dateKey)) {
      trends[dateKey]++
    }
  })
  
  return Object.entries(trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

/**
 * Generate hourly trends for the last 24 hours
 */
function generateHourlyTrends(logs: CSPViolationLog[]) {
  const trends: Record<string, number> = {}
  const now = new Date()
  
  // Initialize last 24 hours
  for (let i = 0; i < 24; i++) {
    const hour = new Date(now)
    hour.setHours(hour.getHours() - i, 0, 0, 0)
    const hourKey = hour.getHours().toString().padStart(2, '0')
    trends[hourKey] = 0
  }
  
  // Count violations by hour
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours().toString().padStart(2, '0')
    if (Object.prototype.hasOwnProperty.call(trends, hour)) {
      trends[hour]++
    }
  })
  
  return Object.entries(trends)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([hour, count]) => ({ hour, count }))
}

/**
 * Check if request is authorized to view violation reports
 * Implement your authorization logic here
 */
function isAuthorized(authHeader: string | null): boolean {
  // Example: Check for admin token
  if (process.env.NODE_ENV === 'development') {
    return true // Allow in development
  }
  
  if (!authHeader) {
    return false
  }
  
  // Example: Bearer token validation
  const token = authHeader.replace('Bearer ', '')
  return token === process.env.ADMIN_API_TOKEN
}

/**
 * Send violation to external monitoring service
 */
async function sendToMonitoring(violation: CSPViolationLog) {
  try {
    // Example: Send to DataDog, New Relic, or custom monitoring
    // await fetch('https://monitoring-service.com/api/violations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(violation)
    // })
    
    console.log('📊 Violation sent to monitoring:', violation.id)
  } catch (error) {
    console.error('Failed to send violation to monitoring:', error)
  }
}

/**
 * Alert on critical CSP violations
 */
async function alertOnCriticalViolation(violation: CSPViolationLog) {
  try {
    // Example: Send alert to Slack, email, or incident management
    // await sendSlackAlert({
    //   text: `🚨 Critical CSP Violation: ${violation.violation.violatedDirective}`,
    //   details: violation
    // })
    
    console.error('🚨 CRITICAL CSP Violation:', violation.violation)
  } catch (error) {
    console.error('Failed to send critical violation alert:', error)
  }
}