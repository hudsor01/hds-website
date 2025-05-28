import { NextRequest, NextResponse } from 'next/server'
import { processEmailSequences } from '@/lib/email/sequences/engine'

export async function GET(request: NextRequest) {
  // Verify the request is authorized (typically from a cron service)
  const authHeader = request.headers.get('Authorization')
  const expectedToken = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Process all active email sequences
    await processEmailSequences()

    return NextResponse.json({
      success: true,
      message: 'Email sequences processed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error processing email sequences:', error)
    return NextResponse.json(
      { error: 'Failed to process email sequences' },
      { status: 500 },
    )
  }
}
