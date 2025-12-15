import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  companySchema,
  messageSchema,
  serviceOptionsSchema,
  budgetOptionsSchema,
  timelineOptionsSchema,
  apiResponseSchema,
} from './common';
import {
  LEAD_SCORE_POINTS,
  MESSAGE_LENGTH_THRESHOLD,
  LEAD_CATEGORY_THRESHOLDS,
} from '@/lib/constants/lead-scoring';

// Main contact form schema
export const contactFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companySchema,
  service: serviceOptionsSchema.optional(),
  budget: budgetOptionsSchema.optional(),
  timeline: timelineOptionsSchema.optional(),
  bestTimeToContact: z.string().optional(),
  message: messageSchema,
  // Anti-spam fields
  honeypot: z.string().max(0, 'Invalid submission').optional(),
  timestamp: z.number().optional(),
});

// Type inference
export type ContactFormData = z.infer<typeof contactFormSchema>;

// Request schema with CSRF token
export const contactFormRequestSchema = contactFormSchema.extend({
  csrfToken: z.string().optional(),
});

// Lead scoring schema
export const leadScoringSchema = z.object({
  score: z.number().min(0).max(100),
  factors: z.object({
    hasHighBudget: z.boolean(),
    hasUrgentTimeline: z.boolean(),
    hasSpecificService: z.boolean(),
    hasCompany: z.boolean(),
    messageLength: z.number(),
    hasPhone: z.boolean(),
  }),
  category: z.enum(['high-value', 'qualified', 'standard', 'low']),
  sequenceType: z.enum([
    'high-value-consultation',
    'targeted-service-consultation',
    'enterprise-nurture',
    'standard-welcome',
  ]),
});

export type LeadScoring = z.infer<typeof leadScoringSchema>;

// Email sequence configuration
export const emailSequenceConfigSchema = z.object({
  sequenceType: leadScoringSchema.shape.sequenceType,
  recipientEmail: emailSchema,
  recipientName: z.string(),
  metadata: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    service: z.string().optional(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    leadScore: z.number().optional(),
  }),
});

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
  firstName: nameSchema.optional(),
  source: z.string().min(2).default('footer'),
});

// Contact form response
export const contactFormResponseSchema = apiResponseSchema(
  z.object({
    id: z.string().uuid().optional(),
    message: z.string(),
    leadScore: z.number().optional(),
  })
);


export function scoreLeadFromContactData(data: ContactFormData): LeadScoring {
  const factors = {
    hasHighBudget: !!data.budget && ['15k-50k', '50k-plus'].includes(data.budget),
    hasUrgentTimeline: !!data.timeline && ['asap', '1-month'].includes(data.timeline),
    hasSpecificService: !!data.service && data.service !== 'other',
    hasCompany: !!data.company,
    messageLength: data.message.length,
    hasPhone: !!data.phone,
  };

  // Calculate score using centralized point values
  let score = 0;
  if (factors.hasHighBudget) {score += LEAD_SCORE_POINTS.HIGH_BUDGET;}
  if (factors.hasUrgentTimeline) {score += LEAD_SCORE_POINTS.URGENT_TIMELINE;}
  if (factors.hasSpecificService) {score += LEAD_SCORE_POINTS.SPECIFIC_SERVICE;}
  if (factors.hasCompany) {score += LEAD_SCORE_POINTS.HAS_COMPANY;}
  if (factors.hasPhone) {score += LEAD_SCORE_POINTS.HAS_PHONE;}
  if (factors.messageLength > MESSAGE_LENGTH_THRESHOLD) {score += LEAD_SCORE_POINTS.LONG_MESSAGE;}

  // Determine category using centralized thresholds
  let category: LeadScoring['category'];
  if (score >= LEAD_CATEGORY_THRESHOLDS.HIGH_VALUE) {category = 'high-value';}
  else if (score >= LEAD_CATEGORY_THRESHOLDS.QUALIFIED) {category = 'qualified';}
  else if (score >= LEAD_CATEGORY_THRESHOLDS.STANDARD) {category = 'standard';}
  else {category = 'low';}

  // Determine sequence type
  let sequenceType: LeadScoring['sequenceType'];
  if (factors.hasHighBudget && factors.hasUrgentTimeline) {
    sequenceType = 'high-value-consultation';
  } else if (factors.hasSpecificService && (factors.hasHighBudget || factors.hasUrgentTimeline)) {
    sequenceType = 'targeted-service-consultation';
  } else if (factors.hasCompany) {
    sequenceType = 'enterprise-nurture';
  } else {
    sequenceType = 'standard-welcome';
  }

  return {
    score,
    factors,
    category,
    sequenceType,
  };
}
