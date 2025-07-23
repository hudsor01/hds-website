import { Resend } from 'resend';
import type { EmailTemplateData, EmailTemplatesRecord } from '@/types/email';
import { createN8nClient } from '@/lib/n8n-webhook';
import type { EmailQueueItem } from '@/types/email-queue';
// Removed unused import: sanitizeInput is already used in the contact form API

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const n8nClient = createN8nClient();

// Helper function to escape HTML content in email templates
function escapeHtml(unsafe: string | number | boolean | undefined): string {
  if (!unsafe) return '';
  
  const str = typeof unsafe === 'string' ? unsafe : String(unsafe);
  
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper function to safely encode URL parameters
function encodeUrlParam(param: string | number | boolean | undefined): string {
  if (!param) return '';
  
  const str = typeof param === 'string' ? param : String(param);
  return encodeURIComponent(str);
}

export interface EmailSequence {
  id: string;
  name: string;
  emails: SequenceEmail[];
}

export interface SequenceEmail {
  id: string;
  subject: string;
  delayDays: number;
  template: string;
}

// Map old sequence names to new n8n sequence names
export const SEQUENCE_MAPPING: Record<string, string> = {
  'welcome': 'standard-welcome',
  'consultation': 'high-value-consultation', 
  'nurture': 'enterprise-nurture'
};

// Define email sequences for different lead types
export const EMAIL_SEQUENCES: Record<string, EmailSequence> = {
  'standard-welcome': {
    id: 'standard-welcome',
    name: 'Standard Welcome Series',
    emails: [
      {
        id: 'welcome-1',
        subject: 'Welcome to Hudson Digital Solutions!',
        delayDays: 0,
        template: 'welcome-immediate'
      },
      {
        id: 'welcome-2',
        subject: 'How We Can Transform Your Business',
        delayDays: 3,
        template: 'value-proposition'
      },
      {
        id: 'welcome-3',
        subject: 'Success Stories from Our Clients',
        delayDays: 7,
        template: 'case-studies'
      },
      {
        id: 'welcome-4',
        subject: 'Your Free Website Audit',
        delayDays: 14,
        template: 'free-audit'
      }
    ]
  },
  'high-value-consultation': {
    id: 'high-value-consultation',
    name: 'High-Value Consultation Follow-up',
    emails: [
      {
        id: 'consult-1',
        subject: 'Thank You for Your Interest - Priority Response',
        delayDays: 0,
        template: 'high-value-immediate'
      },
      {
        id: 'consult-2',
        subject: 'Your Custom Enterprise Proposal',
        delayDays: 1,
        template: 'enterprise-proposal'
      },
      {
        id: 'consult-3',
        subject: 'Exclusive Enterprise Offer - Let&apos;s Schedule',
        delayDays: 3,
        template: 'enterprise-offer'
      }
    ]
  },
  'targeted-service-consultation': {
    id: 'targeted-service-consultation',
    name: 'Targeted Service Consultation',
    emails: [
      {
        id: 'service-1',
        subject: 'Thank You - Let&apos;s Discuss Your Project',
        delayDays: 0,
        template: 'service-specific-followup'
      },
      {
        id: 'service-2',
        subject: 'Your Tailored Service Proposal',
        delayDays: 2,
        template: 'targeted-proposal'
      },
      {
        id: 'service-3',
        subject: 'Ready to Get Started? Special Pricing Inside',
        delayDays: 5,
        template: 'service-offer'
      }
    ]
  },
  'enterprise-nurture': {
    id: 'enterprise-nurture',
    name: 'Enterprise Long-term Nurturing',
    emails: [
      {
        id: 'nurture-1',
        subject: 'Enterprise Development Best Practices',
        delayDays: 7,
        template: 'enterprise-educational-1'
      },
      {
        id: 'nurture-2',
        subject: 'Scaling Your Digital Infrastructure',
        delayDays: 21,
        template: 'enterprise-educational-2'
      },
      {
        id: 'nurture-3',
        subject: 'ROI Analysis: Enterprise Web Applications',
        delayDays: 45,
        template: 'enterprise-educational-3'
      }
    ]
  },
  // Legacy sequences for backward compatibility
  welcome: {
    id: 'welcome',
    name: 'Welcome Series',
    emails: [
      {
        id: 'welcome-1',
        subject: 'Welcome to Hudson Digital Solutions!',
        delayDays: 0,
        template: 'welcome-immediate'
      },
      {
        id: 'welcome-2',
        subject: 'How We Can Transform Your Business',
        delayDays: 3,
        template: 'value-proposition'
      },
      {
        id: 'welcome-3',
        subject: 'Success Stories from Our Clients',
        delayDays: 7,
        template: 'case-studies'
      },
      {
        id: 'welcome-4',
        subject: 'Your Free Website Audit',
        delayDays: 14,
        template: 'free-audit'
      }
    ]
  },
  consultation: {
    id: 'consultation',
    name: 'Post-Consultation Follow-up',
    emails: [
      {
        id: 'consult-1',
        subject: 'Thank You for Your Time',
        delayDays: 0,
        template: 'consultation-followup'
      },
      {
        id: 'consult-2',
        subject: 'Your Custom Development Proposal',
        delayDays: 2,
        template: 'proposal'
      },
      {
        id: 'consult-3',
        subject: 'Limited Time Offer - 20% Off Your First Project',
        delayDays: 5,
        template: 'special-offer'
      }
    ]
  },
  nurture: {
    id: 'nurture',
    name: 'Long-term Nurturing',
    emails: [
      {
        id: 'nurture-1',
        subject: '5 Signs Your Website Needs an Upgrade',
        delayDays: 30,
        template: 'educational-1'
      },
      {
        id: 'nurture-2',
        subject: 'React vs Vue: Which is Right for Your Business?',
        delayDays: 45,
        template: 'educational-2'
      },
      {
        id: 'nurture-3',
        subject: 'How to Measure Your Website ROI',
        delayDays: 60,
        template: 'educational-3'
      }
    ]
  }
};

// Email templates
export const EMAIL_TEMPLATES: EmailTemplatesRecord = {
  'welcome-immediate': (data) => `
    <h2>Welcome to Hudson Digital Solutions, ${escapeHtml(data.name)}!</h2>
    <p>Thank you for reaching out. We're excited to learn more about your project.</p>
    <p>Here's what you can expect from us:</p>
    <ul>
      <li>✓ Expert consultation within 24 hours</li>
      <li>✓ Custom solutions tailored to your business</li>
      <li>✓ Transparent pricing with no hidden fees</li>
      <li>✓ Ongoing support and maintenance</li>
    </ul>
    <p>In the meantime, check out our recent work:</p>
    <a href="https://hudsondigitalsolutions.com/services" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Our Services</a>
  `,
  
  'value-proposition': (data) => `
    <h2>Hi ${escapeHtml(data.name)}, Let's Transform Your Business Together</h2>
    <p>Did you know that businesses with modern web applications see an average of:</p>
    <ul>
      <li>📈 42% increase in conversion rates</li>
      <li>⚡ 3x faster page load times</li>
      <li>💰 28% reduction in operational costs</li>
    </ul>
    <p>We specialize in:</p>
    <ul>
      <li>Custom React/Next.js applications</li>
      <li>Performance optimization</li>
      <li>SEO enhancement</li>
      <li>Business automation</li>
    </ul>
    <p>Ready to see what we can do for you?</p>
    <a href="https://hudsondigitalsolutions.com/contact" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Schedule a Free Consultation</a>
  `,
  
  'case-studies': (data) => `
    <h2>${escapeHtml(data.name)}, See What We've Built for Others</h2>
    <p>Here are some recent success stories:</p>
    <div style="margin: 20px 0;">
      <h3>E-commerce Platform Rebuild</h3>
      <p>✓ 150% increase in mobile conversions<br>
         ✓ 80% faster checkout process<br>
         ✓ $2.3M additional revenue in first year</p>
    </div>
    <div style="margin: 20px 0;">
      <h3>SaaS Dashboard Optimization</h3>
      <p>✓ 65% reduction in load times<br>
         ✓ 90% user satisfaction score<br>
         ✓ 40% decrease in support tickets</p>
    </div>
    <p>Your success story could be next!</p>
    <a href="https://hudsondigitalsolutions.com/blog" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Read More Case Studies</a>
  `,
  
  'free-audit': (data) => `
    <h2>${escapeHtml(data.name)}, Get Your Free Website Audit</h2>
    <p>As a thank you for your interest, we're offering a complimentary website audit that includes:</p>
    <ul>
      <li>🔍 Performance analysis</li>
      <li>📱 Mobile responsiveness check</li>
      <li>🔒 Security vulnerability scan</li>
      <li>📈 SEO optimization report</li>
      <li>💡 Actionable recommendations</li>
    </ul>
    <p>This audit normally costs $500, but it's yours free - no strings attached.</p>
    <a href="https://hudsondigitalsolutions.com/contact?source=free-audit" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Claim Your Free Audit</a>
  `,
  
  'consultation-followup': (data) => `
    <h2>Thank You for Meeting with Us, ${data.name}</h2>
    <p>It was great discussing your project needs. Here's a summary of what we covered:</p>
    ${data.summary || '<p>We discussed your web development needs and potential solutions.</p>'}
    <p>Next steps:</p>
    <ol>
      <li>We'll prepare a detailed proposal within 48 hours</li>
      <li>Schedule a follow-up call to discuss any questions</li>
      <li>Begin development upon approval</li>
    </ol>
    <p>Have questions in the meantime? Just reply to this email.</p>
  `,
  
  'proposal': (data) => `
    <h2>${data.name}, Your Custom Proposal is Ready</h2>
    <p>Based on our discussion, we've prepared a comprehensive proposal for your project.</p>
    <div style="border: 2px solid #22d3ee; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Project Overview</h3>
      <p>${data.projectOverview || 'Custom web application development'}</p>
      <h3>Timeline</h3>
      <p>${data.timeline || '8-12 weeks'}</p>
      <h3>Investment</h3>
      <p>${data.investment || 'Custom quote available upon request'}</p>
    </div>
    <p>Ready to move forward?</p>
    <a href="https://hudsondigitalsolutions.com/contact?source=proposal" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Accept Proposal</a>
  `,
  
  'special-offer': (data) => `
    <h2>${data.name}, Exclusive Offer - Limited Time</h2>
    <p>As a valued prospect, we're extending a special offer just for you:</p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #10b981;">20% OFF Your First Project</h3>
      <p>Valid for projects starting before ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      <ul>
        <li>✓ Applies to all development services</li>
        <li>✓ Includes 3 months of free maintenance</li>
        <li>✓ Priority development queue</li>
      </ul>
    </div>
    <p>This offer expires soon. Don't miss out!</p>
    <a href="https://hudsondigitalsolutions.com/contact?source=special-offer&discount=20" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Claim Your Discount</a>
  `,
  
  'educational-1': (data) => `
    <h2>Hi ${data.name}, Is Your Website Holding You Back?</h2>
    <p>Here are 5 signs your website needs an upgrade:</p>
    <ol>
      <li><strong>Slow Load Times:</strong> If your site takes more than 3 seconds to load, you're losing 40% of visitors</li>
      <li><strong>Not Mobile-Friendly:</strong> 60% of searches come from mobile devices</li>
      <li><strong>Poor SEO Rankings:</strong> Can't find yourself on Google? Time for optimization</li>
      <li><strong>High Bounce Rate:</strong> Visitors leaving immediately? Your UX needs work</li>
      <li><strong>Outdated Design:</strong> First impressions matter - is yours from 2010?</li>
    </ol>
    <p>Experiencing any of these? We can help.</p>
    <a href="https://hudsondigitalsolutions.com/services" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Get a Free Assessment</a>
  `,
  
  'educational-2': (data) => `
    <h2>${data.name}, React vs Vue: Making the Right Choice</h2>
    <p>Choosing the right framework for your business is crucial. Here's our breakdown:</p>
    <h3>React (What we recommend for most businesses)</h3>
    <ul>
      <li>✓ Larger ecosystem and community</li>
      <li>✓ Better for complex, scalable applications</li>
      <li>✓ More developer availability</li>
      <li>✓ Backed by Meta</li>
    </ul>
    <h3>Vue</h3>
    <ul>
      <li>✓ Easier learning curve</li>
      <li>✓ Great for smaller projects</li>
      <li>✓ Excellent documentation</li>
    </ul>
    <p>Need help deciding? Let's discuss your specific needs.</p>
    <a href="https://hudsondigitalsolutions.com/blog" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Read Full Comparison</a>
  `,
  
  'educational-3': (data) => `
    <h2>${data.name}, Are You Measuring Your Website's ROI?</h2>
    <p>Most businesses don't track the right metrics. Here's what matters:</p>
    <h3>Key Metrics to Track:</h3>
    <ul>
      <li><strong>Conversion Rate:</strong> What percentage of visitors become customers?</li>
      <li><strong>Customer Acquisition Cost:</strong> How much to gain each customer?</li>
      <li><strong>Lifetime Value:</strong> What's each customer worth over time?</li>
      <li><strong>Page Load Speed:</strong> Every second delay = 7% loss in conversions</li>
      <li><strong>Mobile Performance:</strong> Are you capturing mobile traffic?</li>
    </ul>
    <p>We build analytics into every project to ensure you can measure success.</p>
    <a href="https://hudsondigitalsolutions.com/contact?source=roi-education" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Get ROI Analysis</a>
  `,
  
  // High-Value Consultation Templates
  'high-value-immediate': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚀 PRIORITY RESPONSE</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Thank you for your high-value inquiry, ${escapeHtml(data.name)}!</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 25px; border-left: 6px solid #10b981;">
        <h2 style="color: #059669; margin-top: 0; font-size: 22px;">Your Project is Our Priority</h2>
        <p>Based on your inquiry, we understand you're looking for enterprise-level solutions. You've reached the right team.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #059669; margin-top: 0;">What happens next:</h3>
          <ul style="color: #374151; line-height: 1.8;">
            <li><strong>Within 2 hours:</strong> Personal call from our senior consultant</li>
            <li><strong>Within 24 hours:</strong> Detailed project analysis and timeline</li>
            <li><strong>Within 48 hours:</strong> Custom proposal with transparent pricing</li>
          </ul>
        </div>
        
        <p><strong>Emergency contact:</strong> For urgent projects, call us directly at <a href="tel:+1234567890" style="color: #059669;">+1 (234) 567-8900</a></p>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">💎 Enterprise Advantage</h3>
        <p style="margin: 0; opacity: 0.95; font-size: 16px;">Dedicated project manager • Priority development queue • 24/7 support</p>
      </div>
    </div>
  `,
  
  'enterprise-proposal': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: bold;">🏆 Your Enterprise Proposal</h1>
        <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">${escapeHtml(data.name)}, we've crafted something special for you</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 25px;">
        <h2 style="color: #7c3aed; margin-top: 0; font-size: 22px;">Enterprise Development Package</h2>
        
        <div style="display: grid; gap: 20px; margin: 25px 0;">
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; background: #f9fafb;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">✅ What's Included:</h3>
            <ul style="margin: 0; color: #6b7280; line-height: 1.8;">
              <li>Custom architecture design & consultation</li>
              <li>Scalable React/Next.js enterprise application</li>
              <li>Advanced performance optimization</li>
              <li>Enterprise-grade security implementation</li>
              <li>Comprehensive testing & QA</li>
              <li>Dedicated project manager & team</li>
              <li>6 months of premium support included</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 20px;">💰 Investment: ${escapeHtml(data.budget || 'Custom Quote')}</h3>
            <p style="margin: 0; opacity: 0.9;">Timeline: ${escapeHtml(data.timeline || '12-16 weeks')} • ROI: 300%+ typical</p>
          </div>
        </div>
        
        <p style="color: #6b7280; margin-bottom: 25px;"><strong>Bonus:</strong> Schedule your consultation this week and receive a complimentary security audit (value: $2,500)</p>
        
        <div style="text-align: center;">
          <a href="https://hudsondigitalsolutions.com/contact?source=enterprise-proposal&priority=high" style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; display: inline-block;">Schedule Enterprise Consultation</a>
        </div>
      </div>
    </div>
  `,
  
  'enterprise-offer': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">⚡ EXCLUSIVE ENTERPRISE OFFER</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Limited time for ${data.name}</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 25px; border: 3px solid #dc2626;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #dc2626; margin: 0; font-size: 32px; font-weight: bold;">25% OFF</h2>
          <p style="color: #374151; margin: 5px 0; font-size: 18px;">Enterprise Development Package</p>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Save up to $15,000 on your project</p>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0;">🎯 Why This Offer?</h3>
          <p style="color: #374151; margin: 0; line-height: 1.6;">Your inquiry shows you're serious about scaling your business. We want to be your technology partner for the next phase of growth.</p>
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #059669; margin: 0 0 15px 0;">⏰ Offer Expires:</h3>
          <p style="color: #374151; margin: 0 0 10px 0; font-size: 20px; font-weight: bold;">${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Only 3 enterprise slots available this quarter</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://hudsondigitalsolutions.com/contact?source=enterprise-offer&discount=25&priority=urgent" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 12px; font-size: 20px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">Claim 25% Discount Now</a>
        </div>
      </div>
    </div>
  `,
  
  // Service-Specific Templates
  'service-specific-followup': (data) => `
    <h2>Thank You, ${escapeHtml(data.name)}!</h2>
    <p>We're excited about your ${escapeHtml(data.service || 'development project')} inquiry.</p>
    <p>Based on your specific service request, we'll prepare a targeted consultation that covers:</p>
    <ul>
      <li>✓ ${escapeHtml(data.service || 'Service')}-specific best practices</li>
      <li>✓ Technology recommendations for your use case</li>
      <li>✓ Timeline and budget optimization</li>
      <li>✓ Success metrics and KPI planning</li>
    </ul>
    <p>We'll be in touch within 12 hours with next steps.</p>
    <a href="https://hudsondigitalsolutions.com/services" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Learn More About Our Services</a>
  `,
  
  'targeted-proposal': (data) => `
    <h2>${escapeHtml(data.name)}, Your ${escapeHtml(data.service || 'Development')} Proposal</h2>
    <p>We've analyzed your specific needs and prepared a targeted solution:</p>
    <div style="border: 2px solid #22d3ee; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Recommended Solution</h3>
      <p><strong>Service:</strong> ${escapeHtml(data.service || 'Custom Development')}</p>
      <p><strong>Timeline:</strong> ${escapeHtml(data.timeline || 'To be determined')}</p>
      <p><strong>Budget Range:</strong> ${escapeHtml(data.budget || 'Custom quote')}</p>
    </div>
    <a href="https://hudsondigitalsolutions.com/contact?source=targeted-proposal&service=${encodeUrlParam(data.service || '')}" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Review Full Proposal</a>
  `,
  
  'service-offer': (data) => `
    <h2>${data.name}, Special Offer for ${data.service || 'Your Project'}</h2>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #10b981;">15% OFF ${data.service || 'Development Services'}</h3>
      <p>Plus complimentary project consultation and planning session</p>
    </div>
    <p>This targeted offer is valid until ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
    <a href="https://hudsondigitalsolutions.com/contact?source=service-offer&service=${data.service}&discount=15" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Accept Offer</a>
  `,
  
  // Enterprise Educational Templates
  'enterprise-educational-1': (data) => `
    <h2>Hi ${data.name}, Enterprise Development Best Practices</h2>
    <p>Here are the key principles we follow for enterprise-level applications:</p>
    <h3>Architecture & Scalability</h3>
    <ul>
      <li><strong>Microservices:</strong> Modular, independently deployable services</li>
      <li><strong>Load Balancing:</strong> Distribute traffic across multiple servers</li>
      <li><strong>Caching Strategy:</strong> Multi-level caching for optimal performance</li>
      <li><strong>Database Optimization:</strong> Proper indexing and query optimization</li>
    </ul>
    <h3>Security & Compliance</h3>
    <ul>
      <li><strong>Authentication:</strong> Multi-factor and role-based access</li>
      <li><strong>Data Encryption:</strong> End-to-end encryption at rest and in transit</li>
      <li><strong>Compliance:</strong> GDPR, HIPAA, SOX compliance frameworks</li>
    </ul>
    <p>Need help implementing these practices?</p>
    <a href="https://hudsondigitalsolutions.com/contact?source=enterprise-education" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Schedule Enterprise Consultation</a>
  `,
  
  'enterprise-educational-2': (data) => `
    <h2>${data.name}, Scaling Your Digital Infrastructure</h2>
    <p>As your business grows, your technology infrastructure must scale with it:</p>
    <h3>Infrastructure Scaling Strategies</h3>
    <ul>
      <li><strong>Cloud-First Approach:</strong> AWS, Azure, or GCP for flexibility</li>
      <li><strong>Container Orchestration:</strong> Kubernetes for container management</li>
      <li><strong>CI/CD Pipelines:</strong> Automated testing and deployment</li>
      <li><strong>Monitoring & Alerting:</strong> Proactive issue detection</li>
    </ul>
    <h3>Performance Optimization</h3>
    <ul>
      <li><strong>CDN Implementation:</strong> Global content delivery</li>
      <li><strong>Database Sharding:</strong> Distribute data across multiple databases</li>
      <li><strong>API Rate Limiting:</strong> Protect against traffic spikes</li>
    </ul>
    <p>Ready to scale your infrastructure?</p>
    <a href="https://hudsondigitalsolutions.com/services" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Learn About Our Infrastructure Services</a>
  `,
  
  'enterprise-educational-3': (data) => `
    <h2>${data.name}, ROI Analysis: Enterprise Web Applications</h2>
    <p>How to measure and maximize the return on your web application investment:</p>
    <h3>Key ROI Metrics for Enterprise Apps</h3>
    <ul>
      <li><strong>User Productivity:</strong> Time saved per user per day</li>
      <li><strong>Operational Efficiency:</strong> Process automation savings</li>
      <li><strong>Revenue Impact:</strong> Increased sales or customer retention</li>
      <li><strong>Cost Reduction:</strong> Reduced manual labor and errors</li>
    </ul>
    <h3>Typical ROI Ranges</h3>
    <ul>
      <li>Internal tools: 200-400% ROI within 18 months</li>
      <li>Customer-facing apps: 150-300% ROI within 12 months</li>
      <li>Process automation: 300-600% ROI within 24 months</li>
    </ul>
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Free ROI Calculator</h3>
      <p>We've created a custom ROI calculator specifically for enterprise web applications.</p>
    </div>
    <a href="https://hudsondigitalsolutions.com/contact?source=roi-calculator" style="background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Get Your ROI Analysis</a>
  `
};

// Function to send a sequence email (n8n first, Resend fallback)
export async function sendSequenceEmail(
  to: string,
  sequenceId: string,
  emailId: string,
  data: EmailTemplateData
) {
  const sequence = EMAIL_SEQUENCES[sequenceId];
  if (!sequence) throw new Error(`Sequence ${sequenceId} not found`);
  
  const email = sequence.emails.find(e => e.id === emailId);
  if (!email) throw new Error(`Email ${emailId} not found in sequence ${sequenceId}`);
  
  const template = EMAIL_TEMPLATES[email.template];
  if (!template) throw new Error(`Template ${email.template} not found`);
  
  const html = template(data);
  
  // Try n8n first
  if (n8nClient) {
    const emailItem: EmailQueueItem = {
      to,
      from: 'Hudson Digital Solutions <hello@hudsondigitalsolutions.com>',
      subject: email.subject,
      html,
      priority: 'normal',
      metadata: {
        source: 'email-sequence',
        sequenceId,
        formId: emailId
      }
    };
    
    const result = await n8nClient.sendToQueue(emailItem);
    if (result.success) {
      console.log(`Email sent via n8n queue: ${emailId} to ${to}`);
      return;
    }
    
    console.warn('n8n failed, falling back to Resend:', result.error);
  }
  
  // Fallback to direct Resend
  if (!resend) {
    throw new Error('Neither n8n nor Resend is configured');
  }
  
  await resend.emails.send({
    from: 'Hudson Digital Solutions <hello@hudsondigitalsolutions.com>',
    to,
    subject: email.subject,
    html,
    tags: [
      { name: 'sequence', value: sequenceId },
      { name: 'email', value: emailId }
    ]
  });
  
  console.log(`Email sent via Resend fallback: ${emailId} to ${to}`);
}

// Function to schedule email sequences (updated for n8n integration)
export async function scheduleEmailSequence(
  email: string,
  name: string,
  sequenceId: string,
  startDate: Date = new Date()
) {
  const sequence = EMAIL_SEQUENCES[sequenceId];
  if (!sequence) throw new Error(`Sequence ${sequenceId} not found`);
  
  // Try to trigger n8n sequence first
  if (n8nClient) {
    const result = await n8nClient.triggerSequence(sequenceId, email, {
      name,
      email,
      startDate: startDate.toISOString()
    });
    
    if (result.success) {
      console.log(`Email sequence triggered via n8n: ${sequenceId} for ${email}`);
      return result;
    }
    
    console.warn('n8n sequence failed, falling back to direct email:', result.error);
  }
  
  // Fallback to direct email scheduling
  const scheduledEmails = sequence.emails.map(seqEmail => ({
    to: email,
    sequenceId,
    emailId: seqEmail.id,
    sendAt: new Date(startDate.getTime() + seqEmail.delayDays * 24 * 60 * 60 * 1000),
    data: { name, email }
  }));
  
  // Send immediate emails (delay 0 days)
  const immediateEmails = scheduledEmails.filter(e => e.sendAt <= new Date());
  
  for (const immediateEmail of immediateEmails) {
    try {
      await sendSequenceEmail(
        immediateEmail.to,
        immediateEmail.sequenceId,
        immediateEmail.emailId,
        immediateEmail.data
      );
    } catch (error) {
      console.error(`Failed to send immediate email ${immediateEmail.emailId}:`, error);
    }
  }
  
  // For future emails, we would ideally store them in a database
  // and have a cron job process them. For now, log them.
  const futureEmails = scheduledEmails.filter(e => e.sendAt > new Date());
  if (futureEmails.length > 0) {
    console.log(`Scheduled ${futureEmails.length} future emails for ${email}:`, 
      futureEmails.map(e => `${e.emailId} at ${e.sendAt.toISOString()}`));
  }
  
  return scheduledEmails;
}

// New function for contact form integration (backward compatibility)
export async function scheduleContactFormSequence(data: {
  firstName: string;
  lastName: string; 
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
}) {
  const name = `${data.firstName} ${data.lastName}`;
  
  // Determine the best sequence based on the contact form data
  let sequenceId = 'standard-welcome'; // Default sequence
  
  // High-intent indicators for better sequence selection
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

  // Use the same logic as contact form
  if (hasHighBudget && hasUrgentTimeline) {
    sequenceId = 'high-value-consultation';
  } else if (hasSpecificService && (hasHighBudget || hasUrgentTimeline)) {
    sequenceId = 'targeted-service-consultation';
  } else if (data.company) {
    sequenceId = 'enterprise-nurture';
  } else {
    sequenceId = 'standard-welcome';
  }
  
  return scheduleEmailSequence(data.email, name, sequenceId, new Date());
}