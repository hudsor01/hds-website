/**
 * Email Sequences and Marketing Automation
 * Automated follow-up sequences for different types of leads
 */

import type { EmailSequence, LeadScoreFactors } from '@/types/analytics';

// Simple lead scoring based on basic contact info
export function calculateLeadScore(factors: LeadScoreFactors): number {
  let score = 30; // Base score for any inquiry

  // Business email gets higher score
  const isBusinessEmail = !factors.email.includes('@gmail.com') && 
                         !factors.email.includes('@yahoo.com') && 
                         !factors.email.includes('@outlook.com');
  if (isBusinessEmail) {
    score += 25;
  }

  // Company name provided
  if (factors.company && factors.company.length > 2) {
    score += 25;
  }

  // Phone number provided
  if (factors.phone && factors.phone.length > 9) {
    score += 20;
  }

  return Math.min(100, score); // Cap at 100
}

// Email sequence templates
export const EMAIL_SEQUENCES: Record<string, EmailSequence> = {
  // High-value consultation sequence (high budget + urgent timeline)
  'high-value-consultation': {
    id: 'high-value-prospect',
    name: 'High-Value Prospect Sequence',
    description: 'Personalized sequence for high-scoring leads',
    steps: [
      {
        id: 'hvp-001',
        subject: "Thanks for reaching out - let's discuss your project",
        delayDays: 0,
        content: `Hi {{firstName}},

Thank you for reaching out about your {{service}} needs. Based on your message, I can see you're looking for a professional solution that delivers real results.

I've helped similar businesses achieve:
• 340% average ROI on their web development investments
• 67% reduction in customer acquisition costs
• 156% increase in conversion rates

I'd love to discuss your specific goals and show you how we can create a competitive advantage for {{company}}.

Are you available for a 15-minute strategy call this week? I have openings:
• Tuesday 2:00 PM EST
• Wednesday 10:00 AM EST
• Thursday 3:00 PM EST

Or feel free to choose a time that works better for you: https://hudsondigitalsolutions.com/schedule

Looking forward to our conversation!

Richard Hudson
Hudson Digital Solutions
hello@hudsondigitalsolutions.com`
      },
      {
        id: 'hvp-002',
        subject: 'Quick question about your {{service}} project',
        delayDays: 3,
        content: `Hi {{firstName}},

I wanted to follow up on your {{service}} inquiry. I've been thinking about your project and have a few ideas that could really accelerate your results.

Quick question: What's the biggest challenge you're facing with your current digital presence?

Based on your answer, I can share some specific strategies that have worked well for businesses like {{company}}.

Also, I put together a case study of a similar project that generated $185,000 in additional revenue within 6 months. Would you like me to send it over?

Best regards,
Richard`
      },
      {
        id: 'hvp-003',
        subject: 'Case study: How we generated $185K in 6 months',
        delayDays: 7,
        content: `Hi {{firstName}},

I promised to send over that case study I mentioned. Here's exactly how we helped a business similar to {{company}} generate $185,000 in additional revenue within 6 months:

**The Challenge:** Low website conversion rate (1.8%) and high customer acquisition costs

**Our Approach:**
1. Conversion rate optimization focused on their specific customer journey
2. Performance optimization that improved load speeds by 73%
3. Strategic UX improvements that reduced bounce rate by 45%

**The Results:**
• Conversion rate increased from 1.8% to 6.2%
• Customer acquisition cost decreased by 58%
• Total revenue increase: $185,000 in 6 months
• ROI: 412%

The most interesting part? 80% of the impact came from just 3 strategic changes that most agencies would have overlooked.

Would you like to explore what this kind of transformation could look like for {{company}}? I'm happy to do a complimentary strategy session where I'll show you the exact opportunities I see for your business.

You can schedule directly here: https://hudsondigitalsolutions.com/schedule

Best regards,
Richard Hudson`
      }
    ]
  },

  // Targeted service consultation sequence (specific service + high budget/urgent timeline)
  'targeted-service-consultation': {
    id: 'standard-prospect',
    name: 'Standard Prospect Sequence',
    description: 'General nurturing sequence for qualified leads',
    steps: [
      {
        id: 'sp-001',
        subject: 'Thanks for your interest in {{service}}',
        delayDays: 0,
        content: `Hi {{firstName}},

Thanks for reaching out about {{service}}. I appreciate you taking the time to contact us.

At Hudson Digital Solutions, we specialize in creating websites and applications that don't just look good – they drive real business results. Our clients typically see:

• 340% average ROI within the first year
• 73% improvement in conversion rates
• 58% reduction in customer acquisition costs

I'd love to learn more about your specific goals and challenges. Could we schedule a brief 15-minute call this week?

In the meantime, I've attached our Website Performance Checklist – 47 points that can immediately improve your results.

Looking forward to our conversation!

Best regards,
Richard Hudson
Hudson Digital Solutions`
      },
      {
        id: 'sp-002',
        subject: 'Free resource: Website ROI Calculator',
        delayDays: 4,
        content: `Hi {{firstName}},

I wanted to share something that might be valuable for your {{service}} project planning.

I created a Website ROI Calculator that helps businesses understand the potential return on their web development investment. It takes into account factors like:

• Current conversion rates
• Monthly website traffic
• Average customer value
• Project scope and timeline

Many of our clients use this to make informed decisions about their digital strategy.

You can access it here: https://hudsondigitalsolutions.com/resources/roi-calculator

Also, I'm still happy to discuss your project if you'd like to schedule that brief call: https://hudsondigitalsolutions.com/schedule

Best regards,
Richard`
      },
      {
        id: 'sp-003',
        subject: 'Last check-in about your {{service}} project',
        delayDays: 10,
        content: `Hi {{firstName}},

I wanted to check in one last time about your {{service}} project. I know how busy things can get, so I don't want to fill up your inbox.

If you're still interested in exploring how we can help {{company}} achieve better results online, I'm here whenever you're ready.

A few recent wins from clients:
• 67% increase in qualified leads (SaaS company)
• 89% improvement in conversion rate (e-commerce)
• $234K additional revenue in Q1 (service business)

If you'd like to discuss what results might be possible for your business, you can schedule a time here: https://hudsondigitalsolutions.com/schedule

Otherwise, I'll add you to our monthly newsletter where I share strategies and case studies that might be helpful.

Best regards,
Richard Hudson`
      }
    ]
  },

  // Enterprise nurture sequence (company but lower urgency/budget)
  'enterprise-nurture': {
    id: 'educational-nurture',
    name: 'Educational Nurture Sequence',
    description: 'Value-first sequence for early-stage prospects',
    steps: [
      {
        id: 'en-001',
        subject: "Thanks for your interest - here's something valuable",
        delayDays: 0,
        content: `Hi {{firstName}},

Thank you for your interest in {{service}}. I appreciate you reaching out.

Whether you're ready to start a project now or just exploring your options, I want to make sure you have the information you need to make the best decision for your business.

I've put together some resources that might be helpful:

1. **Website Performance Checklist**: 47 points to immediately improve your site
2. **ROI Calculator**: Estimate the potential return on web development
3. **Blog**: Strategic insights on web development and business growth

You can access all of these at: https://hudsondigitalsolutions.com/resources

If you have any questions about {{service}} or need guidance on your project, feel free to reply to this email. I'm always happy to help.

Best regards,
Richard Hudson
Hudson Digital Solutions`
      },
      {
        id: 'en-002',
        subject: 'The #1 mistake businesses make with web development',
        delayDays: 7,
        content: `Hi {{firstName}},

I wanted to share something important I've learned after working with 150+ businesses on their web development projects.

The #1 mistake I see businesses make? Focusing on how their website looks instead of how it performs.

Beautiful design is important, but it means nothing if your website doesn't:
• Convert visitors into customers
• Generate qualified leads
• Support your business growth

Here's what actually matters:
• Strategic user experience design
• Conversion rate optimization
• Performance optimization
• Clear value proposition
• Trust-building elements

I wrote a detailed article about this: "Beyond 'Just Works': Why Businesses Need Websites That Dominate"

You can read it here: https://hudsondigitalsolutions.com/blog/beyond-just-works-why-businesses-need-websites-that-dominate

Hope this helps with your {{service}} planning!

Best regards,
Richard`
      },
      {
        id: 'en-003',
        subject: 'Case study: 340% ROI in 8 months',
        delayDays: 14,
        content: `Hi {{firstName}},

I thought you might find this case study interesting since you're exploring {{service}} options.

**Client:** Mid-size professional services firm
**Challenge:** Website generating only 2 qualified leads per month
**Timeline:** 8 months
**Investment:** $12,000

**Results:**
• Qualified leads increased from 2 to 23 per month
• Conversion rate improved from 1.2% to 4.8%
• Revenue attributed to website: $187,000
• ROI: 340%

**Key Success Factors:**
1. Strategic user experience design
2. Conversion-focused copywriting  
3. Performance optimization
4. Lead nurturing system
5. Analytics and optimization

The most important lesson? Small strategic changes can have massive business impact.

If you'd like to discuss what similar results might look like for {{company}}, I'm happy to schedule a brief strategy session.

Best regards,
Richard Hudson`
      }
    ]
  },

  // Standard welcome sequence (default for lower scoring leads)
  'standard-welcome': {
    id: 'lead-magnet-followup',
    name: 'Lead Magnet Follow-up Sequence',
    description: 'Nurture sequence for lead magnet downloads',
    steps: [
      {
        id: 'lm-001',
        subject: 'How did the {{resource}} work for you?',
        delayDays: 3,
        content: `Hi {{firstName}},

I hope you found the {{resource}} helpful! I'm curious – have you had a chance to implement any of the strategies yet?

Many businesses see immediate improvements just from implementing the first few items on the checklist. The most common quick wins are:

• Page speed optimization (often 30-50% improvement)
• Above-the-fold optimization (typically 15-25% conversion boost)  
• Trust signal placement (10-20% increase in form submissions)

If you have any questions about implementation or need clarification on any of the points, feel free to reply to this email. I'm always happy to help.

Also, if you're interested in having these optimizations handled professionally, we offer done-for-you implementation services. Our clients typically see 300-500% ROI within the first year.

You can learn more here: https://hudsondigitalsolutions.com/services

Best regards,
Richard Hudson`
      },
      {
        id: 'lm-002',
        subject: 'Advanced strategy: Beyond the basics',
        delayDays: 7,
        content: `Hi {{firstName}},

Since you downloaded the {{resource}}, I thought you might be interested in some advanced strategies that go beyond the basics.

Here are three techniques that consistently drive the best results for our clients:

**1. Psychology-Based Conversion Optimization**
Understanding user psychology and decision-making patterns can increase conversions by 200-400%.

**2. Predictive User Experience**
Using data to predict user behavior and optimize their journey before they even know what they want.

**3. Automated Revenue Operations**
Systems that automatically qualify, nurture, and convert leads without manual intervention.

These strategies require more sophisticated implementation, but the results are transformational.

I wrote about these in detail in our latest article: "How to Increase Website Conversion Rates: 2025 Complete Guide"

Read it here: https://hudsondigitalsolutions.com/blog/how-to-increase-website-conversion-rates-2025-guide

If you're interested in exploring professional implementation, I'd be happy to discuss your specific situation in a strategy call.

Best regards,
Richard`
      }
    ]
  }
};

// Function to determine which sequence to use based on lead score
export function getEmailSequenceForLead(leadScore: number, source?: string): string {
  if (source === 'lead-magnet') {
    return 'lead-magnet-followup';
  }
  
  if (leadScore >= 70) {
    return 'high-value-prospect';
  } else if (leadScore >= 40) {
    return 'standard-prospect';
  } else {
    return 'educational-nurture';
  }
}

// Function to process email template variables
export function processEmailTemplate(template: string, variables: Record<string, string>): string {
  let processed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(placeholder, value || '');
  });
  
  return processed;
}