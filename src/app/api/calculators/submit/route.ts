/**
 * Calculator Submission API
 * Stores calculator results and triggers email sequences
 */

import { createServerLogger } from '@/lib/logger';
import { notifyHighValueLead } from '@/lib/notifications';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { getResendClient, isResendConfigured } from '@/lib/resend-client';
import { BUSINESS_INFO } from '@/lib/constants/business';
import { scheduleEmail } from '@/lib/scheduled-emails';
import { db } from '@/lib/db';
import { calculatorLeads } from '@/lib/schemas/leads';
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';

// Schema for calculator submission
const calculatorSubmitSchema = z.object({
  calculator_type: z.enum([
    'roi-calculator',
    'cost-estimator',
    'performance-calculator',
    'texas-ttl-calculator',
  ]),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  inputs: z.record(z.string(), z.unknown()),
  results: z.record(z.string(), z.unknown()).optional().default({}),
});

const logger = createServerLogger('calculator-api');

// Lead scoring based on calculator inputs
function calculateLeadScore(
  calculatorType: string,
  inputs: Record<string, unknown>
): number {
  let score = 50; // Base score

  switch (calculatorType) {
    case 'roi-calculator':
      // Higher traffic + lower conversion = higher opportunity
      const traffic = Number(inputs.monthlyTraffic) || 0;
      const conversion = Number(inputs.conversionRate) || 0;

      if (traffic > 50000) {score += 20;}
      else if (traffic > 10000) {score += 10;}

      if (conversion < 1) {score += 15;}
      else if (conversion < 2) {score += 10;}

      break;

    case 'cost-estimator':
      // Larger projects = higher score
      const pages = Number(inputs.numberOfPages) || 0;
      const features = (inputs.features as string[])?.length || 0;

      if (pages > 10) {score += 15;}
      if (features > 5) {score += 15;}

      if (inputs.timeline === 'urgent') {score += 10;}
      if (inputs.budget === 'high') {score += 10;}

      break;

    case 'performance-calculator':
      // Poor performance + high traffic = high priority
      const pageSpeed = Number(inputs.pageSpeedScore) || 100;
      const monthlyVisitors = Number(inputs.monthlyVisitors) || 0;

      if (pageSpeed < 50) {score += 20;}
      else if (pageSpeed < 70) {score += 10;}

      if (monthlyVisitors > 50000) {score += 15;}
      else if (monthlyVisitors > 10000) {score += 10;}

      break;
  }

  return Math.min(100, Math.max(0, score));
}

// Determine lead quality
function getLeadQuality(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 75) {return 'hot';}
  if (score >= 50) {return 'warm';}
  return 'cold';
}

async function handleCalculatorSubmit(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const parseResult = calculatorSubmitSchema.safeParse(body);
    if (!parseResult.success) {
      logger.warn('Invalid calculator submission', { errors: parseResult.error.issues });
      return validationErrorResponse(parseResult.error);
    }

    const { calculator_type, email, inputs, results } = parseResult.data;

    // Calculate lead score
    const leadScore = calculateLeadScore(calculator_type, inputs);
    const leadQuality = getLeadQuality(leadScore);

    logger.info('Calculator submission received', {
      calculator_type,
      email,
      leadScore,
      leadQuality,
    });

    // Store in database
    const [calculatorLead] = await db.insert(calculatorLeads).values({
      calculatorType: calculator_type as string,
      email,
      name: typeof inputs.name === 'string' ? inputs.name : null,
      company: typeof inputs.company === 'string' ? inputs.company : null,
      phone: typeof inputs.phone === 'string' ? inputs.phone : null,
      inputs: inputs,
      results: results || {},
      leadScore: leadScore,
      leadQuality: leadQuality,
    }).returning();

    if (!calculatorLead) {
      logger.error('Failed to store calculator lead - no row returned');
      return errorResponse('Failed to store submission', 500);
    }

    // Send immediate email with results
    if (isResendConfigured()) {
      try {
        const emailContent = generateResultsEmail(
          calculator_type,
          inputs,
          results
        );

        await getResendClient().emails.send({
          from: `Hudson Digital Solutions <${BUSINESS_INFO.email}>`,
          to: email,
          subject: `Your ${getCalculatorName(calculator_type)} Results`,
          html: emailContent,
        });

        logger.info('Results email sent', { email, calculator_type });
      } catch (emailError) {
        logger.error('Failed to send results email', emailError as Error);
        // Don't fail the request if email fails
      }
    }

    // Extract name for notifications
    const inputName = typeof inputs.name === 'string' ? inputs.name : '';
    const nameParts = inputName.split(' ');
    const firstName = nameParts[0] || email.split('@')[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Send high-value lead notifications to Slack/Discord
    try {
      await notifyHighValueLead({
        leadId: calculatorLead.id,
        firstName,
        lastName,
        email,
        phone: typeof inputs.phone === 'string' ? inputs.phone : undefined,
        company: typeof inputs.company === 'string' ? inputs.company : undefined,
        leadScore: leadScore,
        leadQuality: leadQuality,
        source: `Calculator - ${getCalculatorName(calculator_type)}`,
        calculatorType: calculator_type,
      });
    } catch (notificationError) {
      // Log but don't fail the submission if notifications fail
      logger.error('Failed to send lead notifications', notificationError as Error);
    }

    // Schedule follow-up emails based on lead quality
    const sequenceId = leadQuality === 'hot'
      ? 'calculator-hot-lead'
      : 'calculator-follow-up';

    try {
      await scheduleEmail({
        recipientEmail: email,
        recipientName: inputName || email.split('@')[0] || 'there',
        sequenceId,
        stepId: 'followup-1',
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        variables: {
          calculator_type: getCalculatorName(calculator_type),
          lead_score: leadScore.toString(),
        },
      });

      logger.info('Follow-up email scheduled', { email, sequenceId });
    } catch (scheduleError) {
      logger.error('Failed to schedule follow-up', scheduleError as Error);
    }

    return successResponse({
      lead_id: calculatorLead.id,
      lead_score: leadScore,
      lead_quality: leadQuality,
    });
  } catch (error) {
    logger.error('Calculator API error', error instanceof Error ? error : new Error(String(error)));
    return errorResponse('Failed to process submission', 500);
  }
}

export const POST = withRateLimit(handleCalculatorSubmit, 'contactForm');

// Helper functions
function getCalculatorName(type: string): string {
  const names: Record<string, string> = {
    'roi-calculator': 'ROI Calculator',
    'cost-estimator': 'Website Cost Estimator',
    'performance-calculator': 'Performance Savings Calculator',
  };
  return names[type] || 'Calculator';
}

function generateResultsEmail(
  calculatorType: string,
  _inputs: Record<string, unknown>,
  results: Record<string, unknown>
): string {
  const calculatorName = getCalculatorName(calculatorType);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #06b6d4, #0891b2); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your ${calculatorName} Results</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for using our ${calculatorName}! Here's a summary of your results:
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            ${Object.entries(results)
              .map(
                ([key, value]) => `
              <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">${key}</div>
                <div style="font-size: 20px; font-weight: bold; color: #06b6d4;">${value}</div>
              </div>
            `
              )
              .join('')}
          </div>

          <div style="background: #ecfeff; border-left: 4px solid #06b6d4; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px;">
              <strong>Next Steps:</strong> Our team will review your results and send you personalized recommendations within 24 hours.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://hudsondigitalsolutions.com/contact" style="display: inline-block; background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Schedule Free Consultation
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Hudson Digital Solutions. All rights reserved.</p>
          <p>
            <a href="https://hudsondigitalsolutions.com/privacy" style="color: #06b6d4; text-decoration: none;">Privacy Policy</a>
          </p>
        </div>
      </body>
    </html>
  `;
}
