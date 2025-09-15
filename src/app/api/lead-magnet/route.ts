import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { applySecurityHeaders } from '@/lib/security-headers';
import {
  escapeHtml,
  sanitizeEmailHeader,
  detectInjectionAttempt
} from '@/lib/security-utils';
import { createServerLogger, castError } from '@/lib/logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  const errors: Record<string, string> = {};

  // Validate email
  if (!body.email || typeof body.email !== 'string') {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate first name
  if (!body.firstName || typeof body.firstName !== 'string' || body.firstName.trim().length < 1) {
    errors.firstName = 'First name is required';
  }

  // Validate resource
  if (!body.resource || !LEAD_MAGNETS[body.resource as keyof typeof LEAD_MAGNETS]) {
    errors.resource = 'Invalid resource requested';
  }

  const isValid = Object.keys(errors).length === 0;
  
  return {
    isValid,
    errors,
    data: isValid ? {
      email: (body.email as string).toLowerCase().trim(),
      firstName: (body.firstName as string).trim(),
      resource: body.resource as string
    } : null
  };
}

// Generate welcome email with download link
function generateLeadMagnetEmail(data: { email: string; firstName: string; resource: string }): string {
  const resource = LEAD_MAGNETS[data.resource as keyof typeof LEAD_MAGNETS];
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0891b2; margin-bottom: 10px;">Thank you, ${escapeHtml(data.firstName)}!</h1>
        <p style="color: #64748b; font-size: 16px;">Your ${resource.title} is ready for download</p>
      </div>
      
      <div style="background: #f1f5f9; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h2 style="color: #1e293b; margin-bottom: 15px;">${resource.title}</h2>
        <p style="color: #64748b; margin-bottom: 25px;">${resource.description}</p>
        
        <a href="https://hudsondigitalsolutions.com${resource.downloadUrl}" 
           style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Download Now
        </a>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 30px;">
        <h3 style="color: #1e293b; margin-bottom: 15px;">What's Next?</h3>
        
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0;">
          <h4 style="color: #0891b2; margin-bottom: 10px;">Ready to Implement?</h4>
          <p style="color: #64748b; margin-bottom: 15px;">
            Need help implementing these strategies? Our team has helped 150+ businesses achieve an average 340% ROI.
          </p>
          <a href="https://hudsondigitalsolutions.com/contact" 
             style="color: #0891b2; text-decoration: none; font-weight: bold;">
            Schedule Your Free Strategy Call →
          </a>
        </div>
        
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0;">
          <h4 style="color: #0891b2; margin-bottom: 10px;">More Resources</h4>
          <p style="color: #64748b; margin-bottom: 15px;">
            Get strategic insights delivered to your inbox. No spam, just valuable content to grow your business.
          </p>
          <a href="https://hudsondigitalsolutions.com/blog" 
             style="color: #0891b2; text-decoration: none; font-weight: bold;">
            Read Our Latest Articles →
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
          Questions? Reply to this email or contact us at 
          <a href="mailto:hello@hudsondigitalsolutions.com" style="color: #0891b2;">hello@hudsondigitalsolutions.com</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px;">
          Hudson Digital Solutions<br>
          Professional Web Development & Business Growth Strategy
        </p>
      </div>
    </div>
  `;
}

// Generate admin notification
function generateAdminNotificationEmail(data: { email: string; firstName: string; resource: string }): string {
  const resource = LEAD_MAGNETS[data.resource as keyof typeof LEAD_MAGNETS];
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0891b2;">New Lead Magnet Download</h1>
      
      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2>Lead Information</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.firstName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <p><strong>Resource Downloaded:</strong> ${resource.title}</p>
        <p><strong>Download Time:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
        <h2>Recommended Follow-up Actions</h2>
        <ul>
          <li>Add to CRM/email marketing system</li>
          <li>Tag as "${resource.title}" lead</li>
          <li>Schedule follow-up email sequence</li>
          <li>Consider for strategic consultation offer</li>
        </ul>
      </div>

      <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
        Submitted: ${new Date().toLocaleString()}<br>
        Source: Hudson Digital Solutions Lead Magnet System
      </p>
    </div>
  `;
}

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
    const fieldsToCheck = [data.firstName, data.email];
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
          html: generateLeadMagnetEmail(data)
        });
        
        // Send notification to admin
        await resend.emails.send({
          from: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',
          to: ['hello@hudsondigitalsolutions.com'],
          subject: sanitizeEmailHeader(`New Lead Magnet Download: ${resource.title}`),
          html: generateAdminNotificationEmail(data)
        });
        
        // Send Discord notification if configured
        if (process.env.DISCORD_WEBHOOK_URL) {
          try {
            await fetch(process.env.DISCORD_WEBHOOK_URL, {
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
                      value: `**${escapeHtml(data.firstName)}**\n${escapeHtml(data.email)}`,
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
            });
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