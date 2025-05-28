/**
 * Web Vitals Analytics API
 * 
 * Receives and stores Core Web Vitals metrics from the client
 * Simplified implementation without external dependencies
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

interface WebVitalPayload {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  page: string
  sessionId: string
  timestamp: number
  userAgent: string
  connectionType?: string
  deviceMemory?: number
}

// Store web vital metric
export async function POST(request: NextRequest) {
  try {
    const payload: WebVitalPayload = await request.json()

    // Validate payload
    if (!payload.name || typeof payload.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 },
      )
    }

    // Log web vitals metrics for monitoring
    logger.info('Web Vitals Metric', {
      name: payload.name,
      value: payload.value,
      rating: payload.rating,
      page: payload.page,
      sessionId: payload.sessionId,
      userAgent: payload.userAgent,
      timestamp: payload.timestamp,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Web vitals API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// Get web vitals analytics (simplified response)
export async function GET() {
  try {
    // For now, return a basic response
    // TODO: Implement database storage and retrieval
    return NextResponse.json({
      message: 'Web vitals analytics endpoint',
      note: 'Database integration pending',
    })
  } catch (error) {
    logger.error('Web vitals GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}