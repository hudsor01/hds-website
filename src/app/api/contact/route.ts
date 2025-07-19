import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { scheduleEmailSequence } from '@/lib/email-sequences';
import { 
  securityMiddleware, 
  validateRequestBody, 
  validateEmail,
  validatePhone,
  sanitizeInput 
} from '@/middleware/security';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

export async function POST(request: NextRequest) {
  return securityMiddleware(request, async (req) => {
    try {
      const body = await req.json();
      
      // Validate request body
      const validation = validateRequestBody<ContactFormData>(body, contactFormSchema);
      
      if (!validation.valid) {
        // Log detailed errors for debugging
        console.error('Validation errors:', validation.errors);
        
        // Return generic message in production
        return NextResponse.json(
          { error: 'Please check your input and try again' },
          { status: 400 }
        );
      }
      
      const data = validation.data!;

    // Check if Resend is configured
    if (!resend) {
      console.error('Resend API key not configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Send notification email to you
    await resend.emails.send({
      from: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',
      to: ['hello@hudsondigitalsolutions.com'],
      subject: `🚀 New Project Inquiry - ${data.firstName} ${data.lastName}`,
      html: `
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
      `,
    });

    // Send welcome email to the client with nurturing sequence
    await resend.emails.send({
      from: 'Hudson Digital <hello@hudsondigitalsolutions.com>',
      to: [data.email],
      subject: '🚀 Your Project Inquiry Received - What Happens Next?',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Hi ${data.firstName}! 👋</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your project inquiry has been received</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h2 style="color: #0891b2; margin-top: 0; font-size: 20px;">What Happens Next?</h2>
            
            <div style="margin-bottom: 25px;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background: #22d3ee; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">1</div>
                <div>
                  <strong style="color: #1e293b;">Response Within 4 Hours</strong><br>
                  <span style="color: #475569; font-size: 14px;">I'll personally review your project and send you a detailed response</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background: #22d3ee; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">2</div>
                <div>
                  <strong style="color: #1e293b;">Free Strategy Call</strong><br>
                  <span style="color: #475569; font-size: 14px;">We'll discuss your goals and how I can help achieve them</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center;">
                <div style="background: #22d3ee; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">3</div>
                <div>
                  <strong style="color: #1e293b;">Custom Proposal</strong><br>
                  <span style="color: #475569; font-size: 14px;">Tailored solution with timeline and pricing</span>
                </div>
              </div>
            </div>
          </div>

          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h2 style="color: #0891b2; margin-top: 0; font-size: 20px;">Your Project Summary</h2>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; border-left: 4px solid #22d3ee;">
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Service:</strong> ${data.service || 'To be discussed'}</p>
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Budget:</strong> ${data.budget || 'To be discussed'}</p>
              <p style="margin: 0; color: #475569;"><strong>Timeline:</strong> ${data.timeline || 'To be discussed'}</p>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; font-size: 20px;">📅 Book Your Free Strategy Call</h3>
            <p style="margin: 0 0 20px 0; opacity: 0.9;">Let's discuss your project in detail</p>
            <a href="https://cal.com/hudsondigital/strategy-call" style="display: inline-block; background: white; color: #059669; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Schedule Now</a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
              Questions? Reply to this email or call me directly.
            </p>
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              Hudson Digital Solutions<br>
              hello@hudsondigitalsolutions.com
            </p>
          </div>
        </div>
      `,
    });

    // Schedule the lead nurturing email sequence
    try {
      await scheduleEmailSequence(
        data.email,
        data.firstName,
        'welcome'
      );
      
      // If they mentioned consultation or showed high intent, also schedule consultation sequence
      const messageLoweCase = data.message.toLowerCase();
      if (messageLoweCase.includes('consultation') || 
          messageLoweCase.includes('meeting') ||
          messageLoweCase.includes('call') ||
          data.budget?.includes('50K+')) {
        await scheduleEmailSequence(
          data.email,
          data.firstName,
          'consultation',
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Start 3 days later
        );
      }
    } catch (sequenceError) {
      console.error('Failed to schedule email sequence:', sequenceError);
      // Don't fail the whole request if sequence scheduling fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Your message has been sent successfully!' 
    });

    } catch (error) {
      console.error('Contact form error:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }
  });
}