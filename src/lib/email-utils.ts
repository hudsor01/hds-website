// Native email utilities - logic only, no template bloat

import emailTemplates from '@/data/email-templates.json'

interface EmailData {
  firstName?: string
  company?: string
  service?: string
}

/**
 * Get email template by type
 */
export function getEmailTemplate(type: keyof typeof emailTemplates) {
  return emailTemplates[type]
}

/**
 * Replace template variables with actual data
 */
export function replaceTemplateVariables(template: string, data: EmailData): string {
  return template
    .replace(/\{\{firstName\}\}/g, data.firstName || 'there')
    .replace(/\{\{company\}\}/g, data.company || 'your business')
    .replace(/\{\{service\}\}/g, data.service || 'your project')
}

/**
 * Generate personalized email content
 */
export function generateEmail(templateType: keyof typeof emailTemplates, data: EmailData) {
  const template = getEmailTemplate(templateType)

  return {
    subject: replaceTemplateVariables(template.subject, data),
    content: replaceTemplateVariables(template.content, data)
  }
}

/**
 * Get all email sequences (legacy compatibility)
 */
export function getEmailSequences() {
  return {
    'standard-welcome': emailTemplates.welcome,
    'high-value-consultation': emailTemplates.consultation,
    'targeted-service-consultation': emailTemplates.consultation,
    'enterprise-nurture': emailTemplates['follow-up'],
    ...emailTemplates
  }
}

/**
 * Process email template (legacy compatibility)
 */
export function processEmailTemplate(template: string, data: EmailData): string {
  return replaceTemplateVariables(template, data)
}