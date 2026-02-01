/**
 * Analytics Processing Cron Job
 * Processes and aggregates analytics data
 */

import { env } from '@/env';
import { createServerLogger } from '@/lib/logger';
import { cronAuthHeaderSchema } from '@/lib/schemas/api';
import { db } from '@/lib/db';
import { cronLogs, processingQueue } from '@/lib/schemas/system';
import { customEvents, conversionFunnel } from '@/lib/schemas/analytics';
import { leads } from '@/lib/schemas/leads';
import { eq, gte, isNull, and, lt, or } from 'drizzle-orm';
import { type NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api/responses';

const logger = createServerLogger('analytics-cron')

async function logCronExecution(jobName: string, status: string, error?: string) {
  try {
    await db.insert(cronLogs).values({
      jobName,
      status,
      startedAt: new Date(),
      errorMessage: error,
    });
  } catch (e) {
    // Non-critical for main job, but log for debugging
    logger.warn('Failed to log cron execution to database', {
      jobName,
      status,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

async function enqueueLogProcessing(data: Record<string, unknown>) {
  try {
    await db.insert(processingQueue).values({
      queueName: 'analytics',
      taskType: typeof data.type === 'string' ? data.type : 'unknown',
      payload: data,
    });
  } catch (e) {
    // Non-critical for main job, but log for debugging
    logger.warn('Failed to enqueue log processing', {
      dataType: data.type,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export async function POST(request: NextRequest) {
  const jobName = 'analytics-processing'

  try {
    await logCronExecution(jobName, 'started')
    logger.info('Starting analytics processing cron job')

    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')

    // Validate cron auth header format
    const authValidation = cronAuthHeaderSchema.safeParse(authHeader);
    if (!authValidation.success) {
      logger.error('Invalid cron auth header format', {
        errors: authValidation.error.issues,
        providedAuth: authHeader ? 'Bearer ***' : 'none',
      });
      return errorResponse('Unauthorized', 401);
    }

    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      logger.warn('Unauthorized cron request')
      return errorResponse('Unauthorized', 401)
    }

    // Process analytics data
    const results = await Promise.all([
      // processWebVitals(), // TODO: Create web_vitals table - disabled until table exists
      // processPageAnalytics(), // TODO: Create page_analytics table - disabled until table exists
      processCustomEvents(),
      processLeadScoring(),
      processConversionFunnels(),
    ])

    const summary = {
      eventsProcessed: results[0],
      leadsScored: results[1],
      funnelsUpdated: results[2],
      timestamp: new Date().toISOString(),
    }

    logger.info('Analytics processing completed', summary)
    await logCronExecution(jobName, 'completed')

    return successResponse({ summary })

  } catch (error) {
    logger.error('Analytics processing cron failed', error instanceof Error ? error : new Error(String(error)))
    await logCronExecution(jobName, 'failed', error instanceof Error ? error.message : String(error))

    return errorResponse('Cron job failed', 500)
  }
}

async function processCustomEvents(): Promise<number> {
  try {
    // Get custom events from the last 24 hours
    const data = await db
      .select({
        eventName: customEvents.eventName,
        category: customEvents.category,
        value: customEvents.value,
        sessionId: customEvents.sessionId,
        userId: customEvents.userId,
      })
      .from(customEvents)
      .where(gte(customEvents.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1000)));

    // Aggregate by event name and category
    const aggregated = data.reduce((acc, curr) => {
      const key = `${curr.category}-${curr.eventName}`;
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          total_value: 0,
          unique_sessions: new Set<string>(),
          unique_users: new Set<string>(),
        };
      }
      const eventData = acc[key];
      eventData.count++;
      if (curr.value) {
        eventData.total_value += Number(curr.value);
      }
      if (curr.sessionId) {
        eventData.unique_sessions.add(curr.sessionId);
      }
      if (curr.userId) {
        eventData.unique_users.add(curr.userId);
      }
      return acc;
    }, {} as Record<string, { count: number; total_value: number; unique_sessions: Set<string>; unique_users: Set<string> }>);

    // Log aggregated data
    if (Object.keys(aggregated).length > 0) {
      await enqueueLogProcessing({
        type: 'custom_events_aggregated',
        data: aggregated,
        timestamp: new Date().toISOString(),
      });
    }

    return data.length;
  } catch (error) {
    logger.error('Custom events processing failed', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
}

async function processLeadScoring(): Promise<number> {
  try {
    // Get leads that need scoring (new leads without scores or with low scores updated > 7 days ago)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const data = await db
      .select({
        id: leads.id,
        email: leads.email,
        source: leads.source,
        createdAt: leads.createdAt,
        status: leads.status,
      })
      .from(leads)
      .where(
        or(
          isNull(leads.score),
          and(lt(leads.score, 50), lt(leads.updatedAt, sevenDaysAgo))
        )
      );

    let scoredCount = 0;

    // Simple scoring algorithm based on source and status
    for (const lead of data) {
      let score = 0;

      // Base score by source
      switch (lead.source) {
        case 'calculator-form':
          score += 30;
          break;
        case 'contact-form':
          score += 25;
          break;
        case 'newsletter-form':
          score += 15;
          break;
        default:
          score += 10;
      }

      // Bonus for status
      switch (lead.status) {
        case 'qualified':
          score += 20;
          break;
        case 'contacted':
          score += 15;
          break;
        case 'converted':
          score += 25;
          break;
        default:
          score += 5;
      }

      // Update the lead score
      try {
        await db.update(leads)
          .set({ score: Math.min(score, 100) })
          .where(eq(leads.id, lead.id));
        scoredCount++;
      } catch {
        // Continue scoring other leads if one fails
      }
    }

    // Log scoring results
    if (scoredCount > 0) {
      await enqueueLogProcessing({
        type: 'leads_scored',
        data: { scored_count: scoredCount, total_leads: data.length },
        timestamp: new Date().toISOString(),
      });
    }

    return scoredCount;
  } catch (error) {
    logger.error('Lead scoring processing failed', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
}

async function processConversionFunnels(): Promise<number> {
  try {
    // Get recent funnel steps from the last 7 days
    const data = await db
      .select({
        funnelName: conversionFunnel.funnelName,
        stepName: conversionFunnel.stepName,
        stepOrder: conversionFunnel.stepOrder,
        completionTime: conversionFunnel.completionTime,
        sessionId: conversionFunnel.sessionId,
        userId: conversionFunnel.userId,
      })
      .from(conversionFunnel)
      .where(gte(conversionFunnel.completionTime, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

    if (data.length === 0) {
      logger.warn('No conversion funnel data returned');
      return 0;
    }

    // Aggregate by funnel name
    const funnels = data.reduce((acc, curr) => {
      const funnelName = curr.funnelName;
      if (!acc[funnelName]) {
        acc[funnelName] = {
          steps: {} as Record<number, { name: string; completions: number; unique_sessions: Set<string>; unique_users: Set<string>; conversion_rate?: number }>,
          total_completions: 0,
        };
      }

      const funnel = acc[funnelName];
      if (funnel) {
        const stepOrder = curr.stepOrder;
        if (!funnel.steps[stepOrder]) {
          funnel.steps[stepOrder] = {
            name: curr.stepName,
            completions: 0,
            unique_sessions: new Set<string>(),
            unique_users: new Set<string>(),
          };
        }

        const step = funnel.steps[stepOrder];
        if (step) {
          step.completions++;
          if (curr.sessionId) {
            step.unique_sessions.add(curr.sessionId);
          }
          if (curr.userId) {
            step.unique_users.add(curr.userId);
          }

          if (curr.completionTime) {
            funnel.total_completions++;
          }
        }
      }

      return acc;
    }, {} as Record<string, { steps: Record<number, { name: string; completions: number; unique_sessions: Set<string>; unique_users: Set<string>; conversion_rate?: number }>; total_completions: number }>);

    // Calculate conversion rates
    Object.keys(funnels).forEach(funnelName => {
      const funnel = funnels[funnelName];
      if (funnel) {
        const stepOrders = Object.keys(funnel.steps).map(Number).sort((a, b) => a - b);

        for (let i = 1; i < stepOrders.length; i++) {
          const prevOrder = stepOrders[i - 1];
          const currOrder = stepOrders[i];
          if (prevOrder !== undefined && currOrder !== undefined) {
            const prevStep = funnel.steps[prevOrder];
            const currStep = funnel.steps[currOrder];

            if (prevStep && currStep) {
              const conversionRate = prevStep.unique_sessions.size > 0
                ? (currStep.unique_sessions.size / prevStep.unique_sessions.size) * 100
                : 0;

              currStep.conversion_rate = conversionRate;
            }
          }
        }
      }
    });

    // Log funnel data
    if (Object.keys(funnels).length > 0) {
      await enqueueLogProcessing({
        type: 'conversion_funnels_analyzed',
        data: funnels,
        timestamp: new Date().toISOString(),
      });
    }

    return data.length;
  } catch (error) {
    logger.error('Conversion funnels processing failed', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
}
