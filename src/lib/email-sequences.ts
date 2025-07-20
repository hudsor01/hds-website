import { Resend } from 'resend';
import type { EmailTemplateData, EmailTemplatesRecord } from '@/types/email';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

// Define email sequences for different lead types
export const EMAIL_SEQUENCES: Record<string, EmailSequence> = {
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
    <h2>Welcome to Hudson Digital Solutions, ${data.name}!</h2>
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
    <h2>Hi ${data.name}, Let's Transform Your Business Together</h2>
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
    <h2>${data.name}, See What We've Built for Others</h2>
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
    <h2>${data.name}, Get Your Free Website Audit</h2>
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
  `
};

// Function to send a sequence email
export async function sendSequenceEmail(
  to: string,
  sequenceId: string,
  emailId: string,
  data: EmailTemplateData
) {
  if (!resend) {
    console.error('Resend API key not configured');
    return;
  }

  const sequence = EMAIL_SEQUENCES[sequenceId];
  if (!sequence) throw new Error(`Sequence ${sequenceId} not found`);
  
  const email = sequence.emails.find(e => e.id === emailId);
  if (!email) throw new Error(`Email ${emailId} not found in sequence ${sequenceId}`);
  
  const template = EMAIL_TEMPLATES[email.template];
  if (!template) throw new Error(`Template ${email.template} not found`);
  
  const html = template(data);
  
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
}

// Function to schedule email sequences
export async function scheduleEmailSequence(
  email: string,
  name: string,
  sequenceId: string,
  startDate: Date = new Date()
) {
  const sequence = EMAIL_SEQUENCES[sequenceId];
  if (!sequence) throw new Error(`Sequence ${sequenceId} not found`);
  
  // In a real implementation, you would store these in a database
  // and have a cron job or queue system process them
  const scheduledEmails = sequence.emails.map(seqEmail => ({
    to: email,
    sequenceId,
    emailId: seqEmail.id,
    sendAt: new Date(startDate.getTime() + seqEmail.delayDays * 24 * 60 * 60 * 1000),
    data: { name, email }
  }));
  
  // For now, we'll just send the immediate email
  const immediateEmail = scheduledEmails.find(e => e.sendAt <= new Date());
  if (immediateEmail) {
    await sendSequenceEmail(
      immediateEmail.to,
      immediateEmail.sequenceId,
      immediateEmail.emailId,
      immediateEmail.data
    );
  }
  
  return scheduledEmails;
}