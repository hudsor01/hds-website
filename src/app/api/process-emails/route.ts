import { castError, createServerLogger } from "@/lib/logger";
import {
  getEmailQueueStats,
  processEmailsEndpoint,
} from "@/lib/scheduled-emails";
import { cronAuthHeaderSchema } from '@/lib/schemas';
import { applySecurityHeaders } from "@/lib/security-headers";
import { NextResponse, type NextRequest } from "next/server";

function authenticateCronRequest(request: NextRequest, logger: ReturnType<typeof createServerLogger>) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    logger.error("CRON_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const authValidation = cronAuthHeaderSchema.safeParse(authHeader);
  if (!authValidation.success) {
    logger.error('Invalid cron auth header format', {
      errors: authValidation.error.issues,
      providedAuth: authHeader ? 'Bearer ***' : 'none',
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    logger.warn('Unauthorized cron request');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function POST(request: NextRequest) {
  const logger = createServerLogger('process-emails-cron');

  try {
    logger.info('Processing emails cron job started');
    const authError = authenticateCronRequest(request, logger);
    if (authError) {
      return applySecurityHeaders(authError);
    }

    logger.info("Processing scheduled emails");

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
    const authError = authenticateCronRequest(request, logger);
    if (authError) {
      return applySecurityHeaders(authError);
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
