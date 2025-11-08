import { NextResponse, type NextRequest } from "next/server";
import {
  processEmailsEndpoint,
  getEmailQueueStats,
} from "@/lib/scheduled-emails";
import { applySecurityHeaders } from "@/lib/security-headers";
import { createServerLogger, castError } from "@/lib/logger";
import { env } from "@/env";

// This endpoint would typically be called by a cron job or scheduled task
// In production, you'd want to secure this endpoint with authentication

export async function POST(request: NextRequest) {
  const logger = createServerLogger('process-emails-cron');

  try {
    logger.info('Processing emails cron job started');
    // In production, add authentication here
    const authHeader = request.headers.get("authorization");
    const expectedToken = env.CRON_SECRET;

    if (!expectedToken) {
      logger.error("CRON_SECRET environment variable is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Processing scheduled emails", { authHeader: authHeader ? 'Bearer ***' : 'none' });

    const result = await processEmailsEndpoint();

    const response = NextResponse.json({
      success: result.success,
      message: `Processed ${result.processed} emails, ${result.errors} errors`,
      stats: getEmailQueueStats(),
      timestamp: new Date().toISOString(),
    });

    return applySecurityHeaders(response);
  } catch (error) {
    logger.error("Email processing API error", castError(error));

    const response = NextResponse.json(
      {
        error: "Failed to process emails",
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );

    return applySecurityHeaders(response);
  }
}

export async function GET(request: NextRequest) {
  const logger = createServerLogger('email-stats');

  try {
    logger.info('Email stats requested');
    // Simple endpoint to check email queue status
    const authHeader = request.headers.get("authorization");
    const expectedToken = env.CRON_SECRET;

    if (!expectedToken) {
      logger.error("CRON_SECRET environment variable is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = getEmailQueueStats();

    const response = NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
    });

    return applySecurityHeaders(response);
  } catch (error) {
    logger.error("Email stats API error", castError(error));

    const response = NextResponse.json(
      { error: "Failed to get email stats" },
      { status: 500 }
    );

    return applySecurityHeaders(response);
  }
}
