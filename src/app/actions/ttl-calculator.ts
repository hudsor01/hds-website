'use server';

import { logger } from '@/lib/logger';
import { getResendClient } from '@/lib/resend-client';
import type { Database } from '@/types/database';
import type { CalculationResults, VehicleInputs } from '@/types/ttl-types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    logger.error('Supabase environment variables are not configured');
    return null;
  }

  return createSupabaseClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Type for TTL calculation record (until Supabase types are regenerated)
interface TTLCalculationRecord {
  id: string;
  share_code: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  name: string | null;
  email: string | null;
  county: string | null;
  purchase_price: number | null;
  view_count: number;
  created_at: string;
  last_viewed_at: string | null;
  expires_at: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ttlTable = (client: NonNullable<ReturnType<typeof createServiceClient>>) => client.from('ttl_calculations' as any) as any;



// Validation schemas
const saveCalculationSchema = z.object({
  inputs: z.object({
    purchasePrice: z.number(),
    tradeInValue: z.number().optional(),
    vehicleWeight: z.number().optional(),
    isElectric: z.boolean().optional(),
    isNewVehicle: z.boolean().optional(),
    county: z.string(),
    loanTermMonths: z.number().optional(),
    interestRate: z.number().optional(),
    downPayment: z.number().optional(),
    paymentFrequency: z.string().optional(),
    zipCode: z.string().optional(),
    loanStartDate: z.string().optional(),
    leaseMileage: z.number().optional(),
    leaseBuyout: z.number().optional(),
    residualValue: z.number().optional(),
    moneyFactor: z.number().optional(),
  }),
  results: z.object({
    ttlResults: z.object({
      salesTax: z.number(),
      titleFee: z.number(),
      registrationFees: z.number(),
      processingFees: z.number().optional(),
      evFee: z.number().optional(),
      emissions: z.number().optional(),
      totalTTL: z.number(),
    }),
    paymentResults: z.object({
      loanAmount: z.number(),
      monthlyPayment: z.number(),
      biweeklyPayment: z.number().optional(),
      totalInterest: z.number(),
      totalFinanced: z.number(),
    }),
    tcoResults: z.any().optional(),
    leaseComparisonResults: z.any().optional(),
  }),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

const emailResultsSchema = z.object({
  shareCode: z.string().min(6),
  email: z.string().email(),
});

/**
 * Generate a unique, URL-safe share code
 */
function generateShareCode(): string {
  // Exclude ambiguous characters: 0, O, I, l, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Save calculation to database and return share code
 */
export async function saveCalculation(
  inputs: VehicleInputs,
  results: CalculationResults,
  name?: string,
  email?: string
): Promise<{ success: boolean; shareCode?: string; error?: string }> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    // Validate input
    const validation = saveCalculationSchema.safeParse({ inputs, results, name, email });
    if (!validation.success) {
      logger.warn('Invalid TTL calculation data', { errors: validation.error.issues });
      return { success: false, error: 'Invalid calculation data' };
    }

    // Generate unique share code (retry if collision)
    let shareCode = generateShareCode();
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const { data: existing } = await ttlTable(supabase)
        .select('share_code')
        .eq('share_code', shareCode)
        .single();

      if (!existing) {break;}
      shareCode = generateShareCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      logger.error('Failed to generate unique share code after max attempts');
      return { success: false, error: 'Unable to generate share link. Please try again.' };
    }

    // Insert into database
    const { error: insertError } = await ttlTable(supabase)
      .insert({
        share_code: shareCode,
        inputs: inputs as unknown as Record<string, unknown>,
        results: results as unknown as Record<string, unknown>,
        name: name || `$${inputs.purchasePrice.toLocaleString()} - ${inputs.county}`,
        email: email || null,
        county: inputs.county,
        purchase_price: Math.round(inputs.purchasePrice),
      });

    if (insertError) {
      logger.error('Failed to save TTL calculation', { error: insertError });
      return { success: false, error: 'Failed to save calculation' };
    }

    // If email provided, send results
    if (email) {
      await emailResults(shareCode, email).catch((err) => {
        logger.error('Failed to send TTL results email', { error: err });
      });
    }

    logger.info('TTL calculation saved', { shareCode, county: inputs.county });
    return { success: true, shareCode };
  } catch (error) {
    logger.error('Error saving TTL calculation', { error });
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Load calculation by share code
 */
export async function loadCalculation(
  shareCode: string
): Promise<{ success: boolean; data?: { inputs: VehicleInputs; results: CalculationResults; name?: string }; error?: string }> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    if (!shareCode || shareCode.length < 6) {
      return { success: false, error: 'Invalid share code' };
    }

    // Fetch calculation
    const { data, error: fetchError } = await ttlTable(supabase)
      .select('inputs, results, name, view_count')
      .eq('share_code', shareCode)
      .single() as { data: TTLCalculationRecord | null; error: unknown };

    if (fetchError || !data) {
      logger.warn('TTL calculation not found', { shareCode });
      return { success: false, error: 'Calculation not found or has expired' };
    }

    // Increment view count (fire-and-forget via service role)
    ttlTable(supabase)
      .update({
        view_count: (data.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('share_code', shareCode)
      .then(() => {/* fire and forget */})
      .catch((err: Error) => logger.error('Failed to update view count', { error: err }));

    return {
      success: true,
      data: {
        inputs: data.inputs as unknown as VehicleInputs,
        results: data.results as unknown as CalculationResults,
        name: data.name || undefined,
      },
    };
  } catch (error) {
    logger.error('Error loading TTL calculation', { error });
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Email calculation results to user
 */
export async function emailResults(
  shareCode: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return { success: false, error: 'Database not configured' };
    }

    // Validate input
    const validation = emailResultsSchema.safeParse({ shareCode, email });
    if (!validation.success) {
      return { success: false, error: 'Invalid email or share code' };
    }

    // Fetch calculation
    const { data, error: fetchError } = await ttlTable(supabase)
      .select('inputs, results, name')
      .eq('share_code', shareCode)
      .single() as { data: TTLCalculationRecord | null; error: unknown };

    if (fetchError || !data) {
      return { success: false, error: 'Calculation not found' };
    }

    const inputs = data.inputs as unknown as VehicleInputs;
    const results = data.results as unknown as CalculationResults;
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hudsondigitalsolutions.com'}/texas-ttl-calculator?c=${shareCode}`;

    // Ensure results have required properties
    const ttl = results.ttlResults || { salesTax: 0, titleFee: 0, registrationFees: 0, totalTTL: 0 };
    const payment = results.paymentResults || { monthlyPayment: 0 };

    // Send beautiful HTML email
    const { error: emailError } = await getResendClient().emails.send({
      from: 'Hudson Digital Solutions <hello@hudsondigitalsolutions.com>',
      to: email,
      subject: `Your Texas TTL Calculator Results - $${inputs.purchasePrice.toLocaleString()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Texas TTL Calculator Results</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="padding: 32px 24px; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Texas TTL Calculator</h1>
                <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your calculation results</p>
              </td>
            </tr>

            <!-- Vehicle Summary -->
            <tr>
              <td style="padding: 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                  <tr>
                    <td>
                      <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 18px;">Vehicle Details</h2>
                      <p style="margin: 4px 0; color: #64748b; font-size: 14px;"><strong>Purchase Price:</strong> $${inputs.purchasePrice.toLocaleString()}</p>
                      <p style="margin: 4px 0; color: #64748b; font-size: 14px;"><strong>County:</strong> ${inputs.county}</p>
                      <p style="margin: 4px 0; color: #64748b; font-size: 14px;"><strong>Down Payment:</strong> $${(inputs.downPayment || 0).toLocaleString()}</p>
                      ${inputs.tradeInValue ? `<p style="margin: 4px 0; color: #64748b; font-size: 14px;"><strong>Trade-In:</strong> $${inputs.tradeInValue.toLocaleString()}</p>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TTL Breakdown -->
            <tr>
              <td style="padding: 0 24px 24px;">
                <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 18px;">TTL Breakdown</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #64748b;">Sales Tax (6.25%)</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #1e293b; font-weight: 500;">$${ttl.salesTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #64748b;">Title & Fees</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #1e293b; font-weight: 500;">$${ttl.titleFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #64748b;">Registration</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #1e293b; font-weight: 500;">$${ttl.registrationFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #0891b2; font-weight: 600; font-size: 16px;">Total TTL</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #0891b2; font-weight: 700; font-size: 20px;">$${ttl.totalTTL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Monthly Payment -->
            <tr>
              <td style="padding: 0 24px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0891b2; border-radius: 8px; padding: 20px;">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0 0 4px; color: rgba(255,255,255,0.8); font-size: 14px;">Estimated Monthly Payment</p>
                      <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">$${payment.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">${inputs.loanTermMonths || 60} months @ ${inputs.interestRate || 6.5}% APR</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td style="padding: 0 24px 32px; text-align: center;">
                <a href="${shareUrl}" style="display: inline-block; padding: 12px 32px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Full Results</a>
                <p style="margin: 12px 0 0; color: #94a3b8; font-size: 12px;">This link will work for 90 days</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                  <strong>Disclaimer:</strong> This calculator provides estimates only. Actual fees may vary by county.
                </p>
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                  Powered by <a href="https://hudsondigitalsolutions.com" style="color: #0891b2; text-decoration: none;">Hudson Digital Solutions</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailError) {
      logger.error('Failed to send TTL results email', { error: emailError });
      return { success: false, error: 'Failed to send email' };
    }

    logger.info('TTL results email sent', { shareCode, email });
    return { success: true };
  } catch (error) {
    logger.error('Error emailing TTL results', { error });
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get calculator usage analytics (for admin dashboard)
 */
export async function getCalculatorAnalytics(): Promise<{
  totalCalculations: number;
  topCounties: Array<{ county: string; count: number }>;
  avgPurchasePrice: number;
  recentCalculations: number;
}> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return {
        totalCalculations: 0,
        topCounties: [],
        avgPurchasePrice: 0,
        recentCalculations: 0,
      };
    }

    // Total calculations
    const { count: totalCalculations } = await ttlTable(supabase)
      .select('*', { count: 'exact', head: true });

    // Top counties
    const { data: countyData } = await ttlTable(supabase)
      .select('county')
      .not('county', 'is', null) as { data: Array<{ county: string }> | null };

    const countyCounts = (countyData || []).reduce((acc: Record<string, number>, { county }) => {
      if (county) {
        acc[county] = (acc[county] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCounties = Object.entries(countyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([county, count]) => ({ county, count }));

    // Average purchase price
    const { data: priceData } = await ttlTable(supabase)
      .select('purchase_price')
      .not('purchase_price', 'is', null) as { data: Array<{ purchase_price: number }> | null };

    const avgPurchasePrice = priceData && priceData.length > 0
      ? priceData.reduce((sum: number, { purchase_price }) => sum + (purchase_price || 0), 0) / priceData.length
      : 0;

    // Recent calculations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentCalculations } = await ttlTable(supabase)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    return {
      totalCalculations: totalCalculations || 0,
      topCounties,
      avgPurchasePrice: Math.round(avgPurchasePrice),
      recentCalculations: recentCalculations || 0,
    };
  } catch (error) {
    logger.error('Error fetching calculator analytics', { error });
    return {
      totalCalculations: 0,
      topCounties: [],
      avgPurchasePrice: 0,
      recentCalculations: 0,
    };
  }
}
