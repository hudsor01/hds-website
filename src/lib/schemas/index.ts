/**
 * Consolidated Schema Exports
 *
 * This file provides a single entry point for all Zod validation schemas
 * used throughout the application.
 */

// Common validation schemas
export {
  emailSchema,
  phoneSchema,
  urlSchema,
  nameSchema,
  companySchema,
  messageSchema,
  serviceOptionsSchema,
  budgetOptionsSchema,
  timelineOptionsSchema,
  apiResponseSchema,
} from './common';

// Contact form schemas
export {
  contactFormSchema,
  contactFormRequestSchema,
  leadScoringSchema,
  emailSequenceConfigSchema,
  newsletterSchema,
  contactFormResponseSchema,
  scoreLeadFromContactData,
  type ContactFormData,
  type LeadScoring,
} from './contact';

// Ghost CMS validation schemas
export {
  ghostAuthorSchema,
  ghostTagSchema,
  ghostPostSchema,
  ghostSettingsSchema,
  parseGhostResponse,
  parseGhostPosts,
  parseGhostTags,
  parseGhostAuthors,
  type GhostAuthor,
  type GhostTag,
  type GhostPost,
  type GhostSettings,
} from './ghost';
