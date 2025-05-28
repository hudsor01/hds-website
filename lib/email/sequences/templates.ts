// Pre-defined email sequence templates for Hudson Digital Solutions
import type { EmailSequence } from './types'

/**
 * Email sequence for website checklist lead magnet
 */
export const websiteChecklistSequence: EmailSequence = {
  id: 'website-checklist-sequence',
  name: 'Website Checklist Follow-up',
  description: 'Automated follow-up sequence for website checklist downloads',
  trigger: {
    type: 'lead_magnet',
    resourceId: 'website-checklist',
  },
  emails: [
    {
      id: 'website-checklist-1',
      subject: 'How did your website audit go?',
      delayDays: 3,
      template: {
        html: `
<h2>Hi {firstName},</h2>
<p>It's been a few days since you downloaded our website checklist. I wanted to check in and see how your website audit went.</p>
<p>Did you find any areas that need improvement? Here are the most common issues we see:</p>
<ul>
  <li><strong>Slow loading speeds</strong> - Google penalizes slow websites in search rankings</li>
  <li><strong>Not mobile-friendly</strong> - Over 60% of visitors come from mobile devices</li>
  <li><strong>Missing call-to-actions</strong> - Visitors don't know what to do next</li>
  <li><strong>Poor contact forms</strong> - Making it hard for customers to reach you</li>
</ul>
<p>If you'd like help fixing any of these issues, I'd be happy to provide a free consultation.</p>
<p><a href='https://hudsondigitalsolutions.com/contact' style='background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;'>Schedule a Free Consultation</a></p>
<p>Best,<br>Richard Hudson<br>Hudson Digital Solutions</p>
        `,
        dynamicFields: ['firstName'],
      },
    },
    {
      id: 'website-checklist-2',
      subject: 'Quick tip: The #1 website mistake I see',
      delayDays: 7,
      template: {
        html: `
<h2>Hi {firstName},</h2>
<p>After reviewing hundreds of small business websites, the #1 mistake I see is this:</p>
<p><strong>Not having a clear value proposition above the fold.</strong></p>
<p>Within 5 seconds, visitors should know:</p>
<ol>
  <li>What you do</li>
  <li>Who you help</li>
  <li>How they benefit</li>
</ol>
<p>Here's a simple formula that works:</p>
<blockquote style='background-color: #f5f5f5; padding: 15px; border-left: 4px solid #0070f3;'>
  'We help [target audience] achieve [desired outcome] through [your solution]'
</blockquote>
<p>Example: 'We help Dallas small businesses get more customers through modern websites that rank on Google.'</p>
<p>Simple, clear, and effective.</p>
<p>Need help crafting your value proposition? Let's talk.</p>
<p><a href='https://hudsondigitalsolutions.com/contact' style='background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;'>Get Help With Your Website</a></p>
<p>Best,<br>Richard</p>
        `,
        dynamicFields: ['firstName'],
      },
    },
    {
      id: 'website-checklist-3',
      subject: 'Case study: How we helped a Dallas plumber 3x their leads',
      delayDays: 14,
      template: {
        html: `
<h2>Hi {firstName},</h2>
<p>I wanted to share a quick success story that might resonate with you.</p>
<p>Last year, a Dallas plumbing company came to us with a common problem:</p>
<ul>
  <li>Their website was outdated and slow</li>
  <li>They weren't showing up in Google searches</li>
  <li>Competitors were getting all the online leads</li>
</ul>
<p><strong>Here's what we did:</strong></p>
<ol>
  <li>Rebuilt their website with modern, fast technology</li>
  <li>Optimized for 'plumber near me' searches</li>
  <li>Added clear calls-to-action and easy booking</li>
  <li>Implemented local SEO best practices</li>
</ol>
<p><strong>The results after 3 months:</strong></p>
<ul>
  <li>✅ Page 1 Google rankings for key terms</li>
  <li>✅ 3x increase in online leads</li>
  <li>✅ 50% reduction in cost per lead</li>
  <li>✅ Fully booked schedule</li>
</ul>
<p>Could your business benefit from similar results?</p>
<p><a href='https://hudsondigitalsolutions.com/contact' style='background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;'>Let's Discuss Your Website</a></p>
<p>Talk soon,<br>Richard</p>
        `,
        dynamicFields: ['firstName'],
      },
    },
  ],
}

/**
 * Email sequence for SEO basics lead magnet
 */
export const seoBasicsSequence: EmailSequence = {
  id: 'seo-basics-sequence',
  name: 'SEO Basics Follow-up',
  description:
    'Automated follow-up sequence for SEO basics cheat sheet downloads',
  trigger: {
    type: 'lead_magnet',
    resourceId: 'seo-basics',
  },
  emails: [
    {
      id: 'seo-basics-1',
      subject: 'The SEO mistake that costs you customers',
      delayDays: 2,
      template: {
        html: `
<h2>Hi {firstName},</h2>
<p>Thanks for downloading our SEO basics cheat sheet. I hope you found it helpful!</p>
<p>There's one SEO mistake I see small businesses make over and over:</p>
<p><strong>Not claiming and optimizing their Google Business Profile.</strong></p>
<p>This is huge because:</p>
<ul>
  <li>It's FREE (unlike ads)</li>
  <li>It shows up in map searches</li>
  <li>It displays reviews and ratings</li>
  <li>It can show your hours, photos, and more</li>
</ul>
<p>If you haven't claimed yours yet, do it today: <a href='https://business.google.com'>business.google.com</a></p>
<p>Need help optimizing your profile or improving your local SEO? I offer a free 15-minute consultation.</p>
<p><a href='https://hudsondigitalsolutions.com/contact' style='background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;'>Get Free SEO Advice</a></p>
<p>Best,<br>Richard</p>
        `,
        dynamicFields: ['firstName'],
      },
    },
    {
      id: 'seo-basics-2',
      subject: '3 quick SEO wins you can do today',
      delayDays: 5,
      template: {
        html: `
<h2>Hi {firstName},</h2>
<p>Want some quick wins for your SEO? Here are 3 things you can do today:</p>
<ol>
  <li><strong>Add your city to your homepage title</strong><br>
  Instead of 'Joe's Plumbing' use 'Joe's Plumbing - Dallas, TX'</li>
  
  <li><strong>Create a simple FAQ page</strong><br>
  Answer common questions your customers ask. Google loves this!</li>
  
  <li><strong>Speed up your website</strong><br>
  Compress images and remove unnecessary plugins. Faster sites rank better.</li>
</ol>
<p>These simple changes can make a real difference in your rankings.</p>
<p>Want more advanced SEO strategies? Let's chat about how I can help your business dominate local search results.</p>
<p><a href='https://hudsondigitalsolutions.com/services' style='background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;'>View Our SEO Services</a></p>
<p>Talk soon,<br>Richard</p>
        `,
        dynamicFields: ['firstName'],
      },
    },
  ],
}

/**
 * Email sequence for contact form submissions
 */
export const contactFormSequence: EmailSequence = {
  id: 'contact-form-sequence',
  name: 'Contact Form Follow-up',
  description: 'Automated follow-up for contact form submissions',
  trigger: {
    type: 'contact_form',
  },
  emails: [
    {
      id: 'contact-form-1',
      subject: 'Thanks for reaching out!',
      delayDays: 0, // Send immediately
      template: {
        html: `
<h2>Hi {firstName},</h2>
<p>Thanks for contacting Hudson Digital Solutions! I received your message and will get back to you within 24 hours.</p>
<p>In the meantime, you might find these resources helpful:</p>
<ul>
  <li><a href='https://hudsondigitalsolutions.com/services'>Our Services</a> - See how we help small businesses grow online</li>
  <li><a href='https://hudsondigitalsolutions.com/portfolio'>Portfolio</a> - Check out some of our recent projects</li>
  <li><a href='https://hudsondigitalsolutions.com/resources/website-checklist.pdf'>Website Checklist</a> - Free guide to audit your current site</li>
</ul>
<p>Looking forward to speaking with you soon!</p>
<p>Best,<br>Richard Hudson<br>Hudson Digital Solutions</p>
        `,
        dynamicFields: ['firstName'],
      },
    },
    {
      id: 'contact-form-2',
      subject: 'Following up on your inquiry',
      delayDays: 3,
      template: {
        html: `
<h2>Hi {firstName},</h2>
<p>I wanted to follow up on your recent inquiry. Did you receive my previous response?</p>
<p>I'm here to help with any questions about:</p>
<ul>
  <li>Building a new website</li>
  <li>Improving your current site</li>
  <li>Getting found on Google</li>
  <li>Automating your business processes</li>
</ul>
<p>Would you prefer to schedule a quick call to discuss your project?</p>
<p><a href='https://hudsondigitalsolutions.com/contact' style='background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;'>Schedule a Call</a></p>
<p>Best,<br>Richard</p>
        `,
        dynamicFields: ['firstName'],
      },
      skipIf: [{ type: 'has_responded' }],
    },
  ],
}

/**
 * Get all available email sequences
 */
export function getAllSequences(): EmailSequence[] {
  return [websiteChecklistSequence, seoBasicsSequence, contactFormSequence]
}

/**
 * Get sequence by ID
 */
export function getSequenceById(id: string): EmailSequence | undefined {
  return getAllSequences().find(seq => seq.id === id)
}

/**
 * Get sequences by trigger type
 */
export function getSequencesByTrigger(
  triggerType: string,
  resourceId?: string,
): EmailSequence[] {
  return getAllSequences().filter(seq => {
    if (seq.trigger.type !== triggerType) return false
    if (resourceId && seq.trigger.resourceId !== resourceId) return false
    return true
  })
}
