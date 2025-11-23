import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { applySecurityHeaders } from '@/lib/security-headers';
import {
  escapeHtml,
  detectInjectionAttempt,
  sanitizeEmailHeader
} from '@/lib/utils';
import { createServerLogger, castError } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/fetch-utils';
import { generateLeadMagnetNotification, generateLeadMagnetWelcomeEmail } from '@/lib/email-templates';
import { env } from '@/env';
import { newsletterSchema } from '@/lib/schemas/contact';
import { z } from 'zod';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Lead magnet resources configuration
const LEAD_MAGNETS = {
  'website-performance-checklist': {
    title: 'Website Performance Checklist',
    fileName: 'Hudson-Digital-Website-Performance-Checklist-2025.pdf',
    downloadUrl: '/resources/downloads/website-performance-checklist.pdf', // This would be a real PDF file
    description: '47-point checklist to boost conversion rates and website performance'
  },
  'roi-calculator': {
    title: 'Website ROI Calculator',
    fileName: 'Hudson-Digital-ROI-Calculator-2025.xlsx',
    downloadUrl: '/resources/downloads/roi-calculator.xlsx',
    description: 'Calculate the potential ROI of your website investment'
  },
  'conversion-optimization-guide': {
    title: 'Conversion Optimization Guide',
    fileName: 'Hudson-Digital-Conversion-Guide-2025.pdf',
    downloadUrl: '/resources/downloads/conversion-optimization-guide.pdf',
    description: 'Complete guide to increasing website conversion rates'
  }
};

function validateLeadMagnetForm(body: Record<string, unknown>) {
  // Extended schema to include resource field
  const leadMagnetSchema = newsletterSchema.extend({
    resource: z.string().refine(
      (val) => val in LEAD_MAGNETS,
      { message: 'Invalid resource requested' }
    ),
  });

  const result = leadMagnetSchema.safeParse(body);
  
  if (result.success) {
    return {
      isValid: true,
      errors: {},
      data: {
        email: result.data.email.toLowerCase().trim(),
        firstName: result.data.firstName?.trim(),
        resource: result.data.resource
      }
    };
  } else {
    const errors: Record<string, string> = {};
    result.error.issues.forEach(issue => {
      errors[issue.path[0] as string] = issue.message;
    });
    
    return {
      isValid: false,
      errors,
      data: null
    };
  }
}

// Removed duplicate email template functions - now using shared templates from @/lib/email-templates

export async function POST(request: NextRequest) {
  const logger = createServerLogger('lead-magnet-api');

  try {
    logger.info('Lead magnet request received', {
      method: request.method,
      url: request.url
    });
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Validate form data
    const validation = validateLeadMagnetForm(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // TypeScript: validation.data is guaranteed to be non-null when isValid is true
    const data = validation.data;
    if (!data) {
      return NextResponse.json(
        { error: 'Invalid validation state' },
        { status: 500 }
      );
    }
    
    // Check for suspicious activity
    const fieldsToCheck = [data.firstName, data.email].filter((field): field is string => field !== undefined);
    const suspiciousActivity = fieldsToCheck.some(field => detectInjectionAttempt(field));
    
    if (suspiciousActivity) {
      logger.warn('Potential injection attempt detected in lead magnet form', {
        email: data.email,
        fields: fieldsToCheck
      });
    }
    
    // Send emails if Resend is configured
    if (resend) {
      try {
        const resource = LEAD_MAGNETS[data.resource as keyof typeof LEAD_MAGNETS];
        
        // Send download email to user
        await resend.emails.send({
          from: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',
          to: [data.email],
          subject: sanitizeEmailHeader(`Your ${resource.title} is Ready for Download`),
          html: generateLeadMagnetWelcomeEmail({
            firstName: data.firstName || 'there',
            resourceTitle: resource.title,
            downloadUrl: `https://hudsondigitalsolutions.com${resource.downloadUrl}`
          })
        });

        // Send notification to admin
        await resend.emails.send({
          from: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',
          to: ['hello@hudsondigitalsolutions.com'],
          subject: sanitizeEmailHeader(`New Lead Magnet Download: ${resource.title}`),
          html: generateLeadMagnetNotification({
            firstName: data.firstName || 'Anonymous',
            email: data.email,
            resourceTitle: resource.title
          })
        });
        
        // Send Discord notification if configured with timeout
        // Per MDN: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
        if (env.DISCORD_WEBHOOK_URL) {
          try {
            await fetchWithTimeout(env.DISCORD_WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                embeds: [{
                  title: 'New Lead Magnet Download',
                  color: 0x22c55e, // Green color
                  fields: [
                    {
                      name: 'Contact',
                      value: `**${escapeHtml(data.firstName || 'Anonymous')}**\n${escapeHtml(data.email)}`,
                      inline: true
                    },
                    {
                      name: 'Resource',
                      value: `**${resource.title}**\n${resource.description}`,
                      inline: true
                    }
                  ],
                  timestamp: new Date().toISOString(),
                  footer: {
                    text: 'Hudson Digital Solutions Lead Magnet'
                  }
                }]
              })
            }, 5000); // 5s timeout for Discord webhook
          } catch (discordError) {
            logger.error('Failed to send Discord notification', castError(discordError));
          }
        }
        
        const response = NextResponse.json({
          message: 'Success! Check your email for the download link.',
          success: true,
          downloadUrl: LEAD_MAGNETS[data.resource as keyof typeof LEAD_MAGNETS].downloadUrl
        });
        
        return applySecurityHeaders(response);
        
      } catch (emailError) {
        logger.error('Failed to send lead magnet emails', castError(emailError));
        
        // Still return success with download URL even if email fails
        const response = NextResponse.json({
          message: 'Download ready! Check your email for additional resources.',
          success: true,
          downloadUrl: LEAD_MAGNETS[data.resource as keyof typeof LEAD_MAGNETS].downloadUrl
        });
        
        return applySecurityHeaders(response);
      }
    } else {
      // No email service configured, just return download URL
      const response = NextResponse.json({
        message: 'Download ready!',
        success: true,
        downloadUrl: LEAD_MAGNETS[data.resource as keyof typeof LEAD_MAGNETS].downloadUrl
      });
      
      return applySecurityHeaders(response);
    }
    
  } catch (error) {
    logger.error('Lead magnet API error', castError(error));
    
    const response = NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
    
    return applySecurityHeaders(response);
  }
}