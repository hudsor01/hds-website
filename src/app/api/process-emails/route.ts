import { env } from '@/env';
import { castError, createServerLogger } from "@/lib/logger";
import { errorResponse, successResponse } from '@/lib/api/responses';
import {
  getEmailQueueStats,
  processEmailsEndpoint,
} from "@/lib/scheduled-emails";
import { cronAuthHeaderSchema } from '@/lib/schemas/api';
import { applySecurityHeaders } from "@/lib/security-headers";
import { type NextRequest } from "next/server";

function authenticateCronRequest(request: NextRequest, logger: ReturnType<typeof createServerLogger>) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = env.CRON_SECRET;

  if (!expectedToken) {
    logger.error("CRON_SECRET environment variable is not set");
    return errorResponse("Server configuration error", 500);
  }

  const authValidation = cronAuthHeaderSchema.safeParse(authHeader);
  if (!authValidation.success) {
    logger.error('Invalid cron auth header format', {
      errors: authValidation.error.issues,
      providedAuth: authHeader ? 'Bearer ***' : 'none',
    });
    return errorResponse("Unauthorized", 401);
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    logger.warn('Unauthorized cron request');
    return errorResponse("Unauthorized", 401);
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

    const response = successResponse({
      success: result.success,
      message: `Processed ${result.processed} emails, ${result.errors} errors`,
      stats: getEmailQueueStats(),
      timestamp: new Date().toISOString(),
    });

    return applySecurityHeaders(response);
  } catch (error) {
    logger.error("Email processing API error", castError(error));

    const response = errorResponse("Failed to process emails", 500);

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

    const response = successResponse({
      stats,
      timestamp: new Date().toISOString(),
    });

    return applySecurityHeaders(response);
  } catch (error) {
    logger.error("Email stats API error", castError(error));

    const response = errorResponse("Failed to get email stats", 500);

    return applySecurityHeaders(response);
  }
}
