/**
 * Test Notifications API
 * Allows admins to test Slack and Discord webhook integrations
 */

import { type NextRequest, NextResponse } from 'next/server';
import { testNotifications } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    // Simple authentication check (in production, use proper auth)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.ADMIN_API_KEY;

    if (!expectedAuth || authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = await testNotifications();

    return NextResponse.json({
      success: true,
      results: {
        slack: {
          configured: !!process.env.SLACK_WEBHOOK_URL,
          working: results.slack,
        },
        discord: {
          configured: !!process.env.DISCORD_WEBHOOK_URL,
          working: results.discord,
        },
      },
      message: 'Test notifications sent. Check your Slack/Discord channels.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to send test notifications',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
