import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { gdprService } from '@/lib/gdpr/compliance'
import { logger } from '@/lib/logger'

/**
 * GDPR data export endpoint
 * GET /api/gdpr/export?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email || !z.string().email().safeParse(email).success) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 },
      )
    }
    
    // In production, implement authentication/verification
    // For now, we'll just export the data
    const userData = await gdprService.exportUserData(email)
    
    // Return as JSON for development
    // In production, generate secure download link
    return NextResponse.json({
      success: true,
      data: userData,
      message: 'Data export generated successfully',
    })
  } catch (error) {
    logger.error('GDPR export endpoint error', { error })
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 },
    )
  }
}

/**
 * GDPR request submission endpoint
 * POST /api/gdpr/request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const result = await gdprService.processGDPRRequest(body)
    
    return NextResponse.json(result)
  } catch (error) {
    logger.error('GDPR request endpoint error', { error })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process GDPR request' },
      { status: 500 },
    )
  }
}
