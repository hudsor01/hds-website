import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { 
  applySecurityHeaders,
  checkRateLimit,
  sanitizeInput 
} from '@/middleware/security';
import { verifyCSRFToken } from '@/lib/csrf';
import { validateRequestWithZod, createValidatedResponse } from '@/lib/validation';
import { contactFormSchema, type ContactFormData } from '@/schemas/contact';
import { logger } from '@/lib/logger';
import { 
  recordContactFormMetrics, 
  recordHttpMetrics, 
  emailSentTotal,
  recordSecurityEvent
} from '@/lib/metrics';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Calculate lead score based on contact form data
function calculateLeadScore(data: ContactFormData): number {
  let score = 0;
  
  // Budget scoring (0-30 points)
  if (data.budget) {
    if (data.budget.includes('50K+')) score += 30;
    else if (data.budget.includes('25-50K')) score += 25;
    else if (data.budget.includes('10-25K')) score += 20;
    else if (data.budget.includes('5-10K')) score += 15;
    else if (data.budget === 'tbd') score += 10;
  }
  
  // Timeline scoring (0-20 points)
  if (data.timeline) {
    const timelineLower = data.timeline.toLowerCase();
    if (timelineLower.includes('asap') || timelineLower.includes('urgent')) score += 20;
    else if (timelineLower.includes('1 month') || timelineLower.includes('4 week')) score += 15;
    else if (timelineLower.includes('2 month') || timelineLower.includes('8 week')) score += 10;
    else if (timelineLower.includes('3 month') || timelineLower.includes('quarter')) score += 5;
  }
  
  // Service specificity (0-15 points)
  if (data.service && data.service !== 'other') score += 15;
  
  // Company presence (0-10 points)
  if (data.company) score += 10;
  
  // Phone number provided (0-10 points)
  if (data.phone) score += 10;
  
  // Message quality (0-15 points)
  if (data.message.length > 200) score += 15;
  else if (data.message.length > 100) score += 10;
  else if (data.message.length > 50) score += 5;
  
  return Math.min(score, 100); // Cap at 100
}

// Helper function to generate admin notification HTML
function generateAdminNotificationHTML(data: ContactFormData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
      <div style="background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚀 NEW PROJECT INQUIRY</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">High-value lead incoming!</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0891b2; margin-top: 0; font-size: 20px; border-bottom: 2px solid #22d3ee; padding-bottom: 10px;">Contact Information</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <strong style="color: #1e293b;">Name:</strong><br>
            <span style="color: #475569;">${data.firstName} ${data.lastName}</span>
          </div>
          <div>
            <strong style="color: #1e293b;">Email:</strong><br>
            <a href="mailto:${data.email}" style="color: #0891b2; text-decoration: none;">${data.email}</a>
          </div>
        </div>
        
        ${data.phone ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #1e293b;">Phone:</strong><br>
            <a href="tel:${data.phone}" style="color: #0891b2; text-decoration: none;">${data.phone}</a>
          </div>
        ` : ''}
        
        ${data.company ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #1e293b;">Company:</strong><br>
            <span style="color: #475569;">${data.company}</span>
          </div>
        ` : ''}
      </div>

      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0891b2; margin-top: 0; font-size: 20px; border-bottom: 2px solid #22d3ee; padding-bottom: 10px;">Project Details</h2>
        ${data.service ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #1e293b;">Service Needed:</strong><br>
            <span style="color: #475569;">${data.service}</span>
          </div>
        ` : ''}
        
        ${data.budget ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #1e293b;">Budget:</strong><br>
            <span style="color: #475569; font-weight: bold; font-size: 18px;">💰 ${data.budget}</span>
          </div>
        ` : ''}
        
        ${data.timeline ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #1e293b;">Timeline:</strong><br>
            <span style="color: #475569;">⏰ ${data.timeline}</span>
          </div>
        ` : ''}
      </div>

      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h2 style="color: #0891b2; margin-top: 0; font-size: 20px; border-bottom: 2px solid #22d3ee; padding-bottom: 10px;">Message</h2>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; border-left: 4px solid #22d3ee;">
          <p style="margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${sanitizeInput(data.message)}</p>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">⚡ ACTION REQUIRED</h3>
        <p style="margin: 0; opacity: 0.9; font-size: 14px;">Respond within 1 hour for best conversion rates!</p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0; color: #64748b; font-size: 12px;">
          Submitted: ${new Date().toLocaleString()}<br>
          Source: Hudson Digital Solutions Contact Form
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Record HTTP request metrics (will be updated with status and duration later)
    
    // Check rate limiting first
    const rateLimitOk = await checkRateLimit(request, 5, 60000); // 5 requests per minute
    if (!rateLimitOk) {
      recordSecurityEvent('rate_limit', 'warning', true);
      recordHttpMetrics('POST', '/api/contact', 429, (Date.now() - startTime) / 1000);
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    
    // Verify CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !verifyCSRFToken(csrfToken, request)) {
      recordSecurityEvent('csrf_failure', 'warning', true);
      recordHttpMetrics('POST', '/api/contact', 403, (Date.now() - startTime) / 1000);
      return NextResponse.json(
        { error: 'Invalid security token. Please refresh the page and try again.' },
        { status: 403 }
      );
    }
    
    // Validate request body with Zod
    const validation = await validateRequestWithZod(request, contactFormSchema);
    
    if (!validation.success) {
      return createValidatedResponse(validation);
    }
    
    const data = validation.data;
    const leadScore = calculateLeadScore(data);

      // Process contact form submission with lead score
      logger.info('Processing contact form submission', {
        email: data.email,
        leadScore,
        isHighValue: leadScore >= 70
      });
      
      // Send admin notification email via Resend
      if (!resend) {
        logger.error('Resend is not configured - email not sent');
        throw new Error('Email service not configured');
      }

      // Send notification email
      await resend.emails.send({
        from: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',
        to: ['hello@hudsondigitalsolutions.com'],
        subject: `🚀 New Project Inquiry - ${data.firstName} ${data.lastName}`,
        html: generateAdminNotificationHTML(data)
      });

      emailSentTotal.inc({ type: 'admin', status: 'sent' });

      logger.info('Contact form processing completed', { email: data.email });

    // Record successful contact form submission metrics
    const processingTime = (Date.now() - startTime) / 1000;
    const leadType = leadScore >= 70 ? 'high' : leadScore >= 40 ? 'medium' : 'low';
    
    recordContactFormMetrics(leadScore, processingTime, 'success', leadType === 'high');
    
    // Record successful HTTP request metrics
    recordHttpMetrics('POST', '/api/contact', 200, processingTime);

    // Create response with security headers
    const response = NextResponse.json({
      message: 'Thank you for your inquiry! We\'ll be in touch within 24 hours.',
      success: true,
      leadScore // Include lead score in response for frontend tracking
    });
    
    // Apply security headers
    return applySecurityHeaders(response);

  } catch (error) {
    logger.error('Contact form error', error);
    
    // Record failed contact form submission metrics
    const processingTime = (Date.now() - startTime) / 1000;
    recordContactFormMetrics(0, processingTime, 'error', false);
    
    // Record failed HTTP request metrics
    recordHttpMetrics('POST', '/api/contact', 500, processingTime);
    
    const response = NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
    
    return applySecurityHeaders(response);
  }
}

// Complex sequence type determination removed with email sequences