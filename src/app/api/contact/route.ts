import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createN8nClient } from '@/lib/n8n-webhook';
import { EmailQueueItem } from '@/types/email-queue';
import { scheduleContactFormSequence } from '@/lib/email-sequences';
import { 
  applySecurityHeaders,
  checkRateLimit,
  sanitizeInput 
} from '@/middleware/security';
import { verifyCSRFToken } from '@/lib/csrf';
import { validateRequestWithZod, createValidatedResponse } from '@/lib/validation';
import { contactFormSchema, type ContactFormData } from '@/schemas/contact';
import { logger } from '@/lib/logger';
// Metrics imports commented out until implemented
// import { 
//   recordContactFormMetrics, 
//   recordHttpMetrics, 
//   emailSentTotal,
//   recordSecurityEvent,
//   conversionEvents 
// } from '@/lib/metrics';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const n8nClient = createN8nClient();

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
  try {
    // Check rate limiting first
    const rateLimitOk = await checkRateLimit(request, 5, 60000); // 5 requests per minute
    if (!rateLimitOk) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    
    // Verify CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !verifyCSRFToken(csrfToken, request)) {
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
      
      try {
          // Prepare admin notification email
          const adminEmail: EmailQueueItem = {
            to: 'hello@hudsondigitalsolutions.com',
            from: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',
            subject: `🚀 New Project Inquiry - ${data.firstName} ${data.lastName}`,
            html: generateAdminNotificationHTML(data),
            priority: 'high',
            metadata: {
              source: 'contact-form',
              formId: 'main-contact',
            }
          };

          // Try to use n8n webhook first, fallback to direct Resend
          let emailSent = false;
          
          if (n8nClient) {
            logger.debug('Sending emails via n8n webhook queue');
            
            // Send admin notification to queue
            const adminResult = await n8nClient.sendToQueue(adminEmail);
            
            if (!adminResult.success) {
              logger.error('Failed to queue admin email', adminResult.error);
            } else {
              emailSent = true;
              
              // Trigger email sequence for the client
              const sequenceResult = await n8nClient.triggerSequence(
                determineSequenceType(data),
                data.email,
                {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  company: data.company || '',
                  service: data.service || '',
                  budget: data.budget || '',
                  timeline: data.timeline || ''
                }
              );

              if (!sequenceResult.success) {
                logger.error('Failed to trigger email sequence', sequenceResult.error);
              }
            }
          }

          // Fallback to direct Resend if n8n failed or not configured
          if (!emailSent && resend) {
            logger.info('Falling back to direct Resend email');
            
            // Send notification email directly
            await resend.emails.send({
              from: adminEmail.from!,
              to: [adminEmail.to],
              subject: adminEmail.subject,
              html: adminEmail.html!
            });

            // Schedule the email sequence using existing method
            await scheduleContactFormSequence(data);
            emailSent = true;
          }

          if (!emailSent) {
            logger.error('Neither n8n nor Resend is properly configured - email not sent');
          }

          // Send lead attribution data to n8n for tracking
          try {
            const attributionData = {
              email: data.email,
              name: `${data.firstName} ${data.lastName}`,
              company: data.company || '',
              phone: data.phone || '',
              message: data.message,
              budget: data.budget,
              timeline: data.timeline,
              services: data.service,
              // UTM and attribution data from headers/request
              utm_source: request.nextUrl.searchParams.get('utm_source') || (request.headers.get('referer')?.includes('google') ? 'google' : 'direct'),
              utm_medium: request.nextUrl.searchParams.get('utm_medium') || 'none',
              utm_campaign: request.nextUrl.searchParams.get('utm_campaign') || '',
              utm_content: request.nextUrl.searchParams.get('utm_content') || '',
              utm_term: request.nextUrl.searchParams.get('utm_term') || '',
              referrer: request.headers.get('referer') || 'direct',
              page_url: request.headers.get('referer') || 'https://hudsondigitalsolutions.com/contact',
              user_agent: request.headers.get('user-agent') || '',
              ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
            };

            const n8nUrl = process.env.N8N_WEBHOOK_URL;
            if (!n8nUrl) {
              throw new Error('N8N webhook URL not configured');
            }
            
            await fetch(`${n8nUrl}/webhook/lead-attribution`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.N8N_API_KEY ? `Bearer ${process.env.N8N_API_KEY}` : ''
              },
              body: JSON.stringify(attributionData)
            });
            
            logger.debug('Lead attribution data sent to n8n');
          } catch (attributionError) {
            logger.warn('Lead attribution tracking failed', { error: attributionError });
          }

          logger.info('Contact form processing completed', { email: data.email });
        } catch (processingError) {
          logger.error('Error processing contact form', processingError);
          // Don't fail the request for background task errors
        }

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
    
    const response = NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
    
    return applySecurityHeaders(response);
  }
}

// Helper function to determine email sequence type based on lead score
function determineSequenceType(data: ContactFormData): string {
  const leadScore = calculateLeadScore(data);
  
  // Use lead score for more precise sequence selection
  if (leadScore >= 80) {
    return 'high-value-consultation';
  } else if (leadScore >= 60) {
    return 'targeted-service-consultation';
  } else if (leadScore >= 40 && data.company) {
    return 'enterprise-nurture';
  } else if (leadScore >= 30) {
    return 'qualified-lead-nurture';
  } else {
    return 'standard-welcome';
  }
}