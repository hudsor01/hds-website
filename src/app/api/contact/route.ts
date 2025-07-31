import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createN8nClient } from '@/lib/n8n-webhook';
import { EmailQueueItem } from '@/types/email-queue';
import { scheduleContactFormSequence } from '@/lib/email-sequences';
import { 
  securityMiddleware, 
  validateRequestBody, 
  validateEmail,
  validatePhone,
  sanitizeInput 
} from '@/middleware/security';
import { verifyCSRFToken } from '@/lib/csrf';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const n8nClient = createN8nClient();

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

// Define validation schema
const contactFormSchema = {
  firstName: { 
    required: true, 
    type: 'string' as const, 
    min: 1, 
    max: 50,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  lastName: { 
    required: true, 
    type: 'string' as const, 
    min: 1, 
    max: 50,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  email: { 
    required: true, 
    type: 'string' as const,
    validator: (value: unknown) => typeof value === 'string' && validateEmail(value)
  },
  phone: { 
    required: false, 
    type: 'string' as const,
    validator: (value: unknown) => !value || (typeof value === 'string' && validatePhone(value))
  },
  company: { 
    required: false, 
    type: 'string' as const, 
    max: 100
  },
  service: { 
    required: false, 
    type: 'string' as const,
    pattern: /^[a-zA-Z0-9\s\-,&]+$/
  },
  budget: { 
    required: false, 
    type: 'string' as const,
    pattern: /^[\$\d\s\-\+kKmM]+$/
  },
  timeline: { 
    required: false, 
    type: 'string' as const,
    max: 100
  },
  message: { 
    required: true, 
    type: 'string' as const, 
    min: 10, 
    max: 5000
  }
};

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
  return securityMiddleware(request, async (req) => {
    try {
      const body = await req.json();
      
      // Verify CSRF token
      const csrfToken = req.headers.get('x-csrf-token');
      if (!csrfToken || !verifyCSRFToken(csrfToken, req)) {
        return NextResponse.json(
          { error: 'Invalid security token. Please refresh the page and try again.' },
          { status: 403 }
        );
      }
      
      // Validate request body
      const validation = validateRequestBody<ContactFormData>(body, contactFormSchema);
      
      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
        return NextResponse.json(
          { error: 'Please check your input and try again' },
          { status: 400 }
        );
      }
      
      const data = validation.data!;

      // Process contact form submission
      console.log('Processing contact form submission for:', data.email);
      
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
            console.log('Sending emails via n8n webhook queue...');
            
            // Send admin notification to queue
            const adminResult = await n8nClient.sendToQueue(adminEmail);
            
            if (!adminResult.success) {
              console.error('Failed to queue admin email:', adminResult.error);
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
                console.error('Failed to trigger email sequence:', sequenceResult.error);
              }
            }
          }

          // Fallback to direct Resend if n8n failed or not configured
          if (!emailSent && resend) {
            console.log('Falling back to direct Resend email...');
            
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
            console.error('Neither n8n nor Resend is properly configured - email not sent');
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
              utm_source: request.nextUrl.searchParams.get('utm_source') || (req.headers.get('referer')?.includes('google') ? 'google' : 'direct'),
              utm_medium: request.nextUrl.searchParams.get('utm_medium') || 'none',
              utm_campaign: request.nextUrl.searchParams.get('utm_campaign') || '',
              utm_content: request.nextUrl.searchParams.get('utm_content') || '',
              utm_term: request.nextUrl.searchParams.get('utm_term') || '',
              referrer: req.headers.get('referer') || 'direct',
              page_url: req.headers.get('referer') || 'https://hudsondigitalsolutions.com/contact',
              user_agent: req.headers.get('user-agent') || '',
              ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
            };

            await fetch('https://n8n.thehudsonfam.com/webhook/lead-attribution', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(attributionData)
            });
            
            console.log('Lead attribution data sent to n8n');
          } catch (attributionError) {
            console.error('Lead attribution tracking failed:', attributionError);
          }

          console.log('Contact form processing completed for:', data.email);
        } catch (processingError) {
          console.error('Error processing contact form:', processingError);
          // Don't fail the request for background task errors
        }

      // Return success response after processing
      return NextResponse.json({
        message: 'Thank you for your inquiry! We\'ll be in touch within 24 hours.',
        success: true
      });

    } catch (error) {
      console.error('Contact form error:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred. Please try again later.' },
        { status: 500 }
      );
    }
  });
}

// Helper function to determine email sequence type based on form data
function determineSequenceType(data: ContactFormData): string {
  // High-intent indicators
  const hasHighBudget = data.budget && (
    data.budget.includes('25K') || 
    data.budget.includes('50K') || 
    data.budget.includes('+')
  );
  
  const hasUrgentTimeline = data.timeline && (
    data.timeline.toLowerCase().includes('asap') || 
    data.timeline.includes('1 month')
  );

  const hasSpecificService = data.service && 
    data.service !== 'other' && 
    data.service !== '';

  // Determine sequence
  if (hasHighBudget && hasUrgentTimeline) {
    return 'high-value-consultation';
  } else if (hasSpecificService && (hasHighBudget || hasUrgentTimeline)) {
    return 'targeted-service-consultation';
  } else if (data.company) {
    return 'enterprise-nurture';
  } else {
    return 'standard-welcome';
  }
}