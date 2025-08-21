import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RateLimiter } from '@/lib/rate-limiter';
import { applySecurityHeaders } from '@/lib/security-headers';
import { recordContactFormSubmission } from '@/lib/metrics';
import { 
  escapeHtml, 
  sanitizeEmailHeader, 
  validateContactForm,
  detectInjectionAttempt 
} from '@/lib/security-utils';
import { verifyCSRFToken } from '@/lib/csrf';
import type { ContactFormData } from '@/types/api';

// Initialize rate limiter for contact form
const rateLimiter = new RateLimiter();
const CONTACT_FORM_LIMITS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3, // 3 contact form submissions per 15 minutes
};

// Get client IP from request  
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Secure email template with HTML escaping
function generateAdminNotificationHTML(data: ContactFormData): string {
  // All user input is HTML-escaped to prevent injection
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0891b2;">New Contact Form Submission</h1>
      
      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2>Contact Information</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>` : ''}
        ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ''}
        ${data.service ? `<p><strong>Service Interest:</strong> ${escapeHtml(data.service)}</p>` : ''}
        ${data.bestTimeToContact ? `<p><strong>Best Time to Contact:</strong> ${escapeHtml(data.bestTimeToContact)}</p>` : ''}
      </div>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
        <h2>Message</h2>
        <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>

      <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
        Submitted: ${new Date().toLocaleString()}<br>
        Source: Hudson Digital Solutions Contact Form
      </p>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify CSRF token for security
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !verifyCSRFToken(csrfToken, request)) {
      return NextResponse.json(
        { error: 'Invalid security token. Please refresh the page and try again.' },
        { status: 403 }
      );
    }
    
    // Step 2: Check rate limiting
    const clientIP = getClientIP(request);
    const isLimited = await rateLimiter.checkLimit(
      `contact-form:${clientIP}`,
      CONTACT_FORM_LIMITS.maxRequests,
      CONTACT_FORM_LIMITS.windowMs
    );
    
    if (isLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }
    
    // Step 3: Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Step 4: Comprehensive validation and sanitization
    const validation = validateContactForm(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }
    
    const data = validation.data as ContactFormData;
    
    // Step 5: Detect potential injection attempts for monitoring
    const fieldsToCheck = [data.firstName, data.lastName, data.email, data.message, data.company].filter(Boolean);
    const suspiciousActivity = fieldsToCheck.some(field => detectInjectionAttempt(field as string));
    
    if (suspiciousActivity) {
      console.warn('Potential injection attempt detected from IP:', clientIP);
      // Log but still process if validation passed - the input is already sanitized
    }
    
    // Step 6: Send admin notification email with sanitized headers
    if (resend) {
      try {
        // Sanitize email subject to prevent header injection
        const safeSubject = sanitizeEmailHeader(`New Project Inquiry - ${data.firstName} ${data.lastName}`);
        
        await resend.emails.send({
          from: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',
          to: ['hello@hudsondigitalsolutions.com'],
          subject: safeSubject,
          html: generateAdminNotificationHTML(data)
        })
        
        // Send Discord notification if webhook URL is configured
        if (process.env.DISCORD_WEBHOOK_URL) {
          try {
            await fetch(process.env.DISCORD_WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                embeds: [{
                  title: '🚀 New Project Inquiry',
                  color: 0x0891b2, // Blue color
                  fields: [
                    {
                      name: 'Contact',
                      value: `**${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}**\n${escapeHtml(data.email)}${data.phone ? `\n${escapeHtml(data.phone)}` : ''}`,
                      inline: true
                    },
                    {
                      name: 'Details',
                      value: `**Service:** ${escapeHtml(data.service || 'Not specified')}\n**Company:** ${escapeHtml(data.company || 'Not specified')}\n**Best Time:** ${escapeHtml(data.bestTimeToContact || 'Not specified')}`,
                      inline: true
                    },
                    {
                      name: 'Message',
                      value: escapeHtml(data.message.length > 1000 ? data.message.substring(0, 1000) + '...' : data.message),
                      inline: false
                    }
                  ],
                  timestamp: new Date().toISOString(),
                  footer: {
                    text: 'Hudson Digital Solutions Contact Form'
                  }
                }]
              })
            })
          } catch (discordError) {
            console.error('Failed to send Discord notification:', discordError)
            // Don't fail the request if Discord fails
          }
        }
        
        // Record successful submission
        recordContactFormSubmission(true)
        
        const response = NextResponse.json({
          message: 'Thank you! Your message has been sent successfully.',
          success: true
        })
        
        return applySecurityHeaders(response)
        
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        recordContactFormSubmission(false)
        
        return NextResponse.json(
          { error: 'Failed to send message. Please try again.' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Contact form API error:', error)
    recordContactFormSubmission(false)
    
    const response = NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
    
    return applySecurityHeaders(response)
  }
}