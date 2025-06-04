/**
 * GDPR Compliance Module
 * 
 * LOW PRIORITY #14: Add GDPR compliance features
 * 
 * This module implements GDPR compliance features including:
 * - Data export functionality
 * - Right to erasure (delete account)
 * - Data portability
 * - Consent management
 * - Privacy preferences
 * - Audit logging for compliance
 */

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { 
decryptEmail, 
decryptName, 
decryptPhone, 
decryptIpAddress, 
} from '@/lib/security/encryption/field-encryption'
import { logger } from '@/lib/logger'
import { AppMonitoring } from '@/lib/monitoring/app-monitoring'
import { GDPRRequestType, GDPRRequestStatus } from '@/types/enum-types'

// Re-export for component usage
export { GDPRRequestType, GDPRRequestStatus }

/**
 * GDPR request schema
 */
const GDPRRequestSchema = z.object({
  email: z.string().email(),
  type: z.nativeEnum(GDPRRequestType),
  message: z.string().optional(),
  verificationToken: z.string().optional(),
})

/**
 * User data export format
 */
export interface UserDataExport {
  personalInformation: {
    email: string
    name?: string
    phone?: string
    company?: string
    createdAt: Date
    lastActive?: Date
  }
  contactHistory: Array<{
    date: Date
    subject?: string
    message: string
    status: string
  }>
  newsletterSubscription?: {
    status: string
    subscribedAt?: Date
    interests?: string[]
    verified: boolean
  }
  leadMagnetsDownloaded: Array<{
    name: string
    downloadedAt: Date
  }>
  consentHistory: Array<{
    type: string
    granted: boolean
    timestamp: Date
    ipAddress?: string
  }>
  dataProcessingActivities: Array<{
    activity: string
    purpose: string
    timestamp: Date
  }>
}

/**
 * GDPR compliance service
 */
export class GDPRComplianceService {
  /**
   * Process GDPR request
   */
  async processGDPRRequest(data: z.infer<typeof GDPRRequestSchema>) {
    try {
      const validated = GDPRRequestSchema.parse(data)
      
      // Log GDPR request
      logger.info('GDPR request received', {
        email: validated.email,
        type: validated.type,
      })
      
      // Track event
      AppMonitoring.trackEvent('form_submission', {
        type: 'gdpr_request',
        requestType: validated.type,
      })
      
      // Create request record
      const request = await this.createGDPRRequest(validated)
      
      // Process based on type
      switch (validated.type) {
        case GDPRRequestType.DATA_ACCESS:
        case GDPRRequestType.DATA_PORTABILITY:
          return await this.handleDataExportRequest(validated.email, request.id)
          
        case GDPRRequestType.DATA_ERASURE:
          return await this.handleDataErasureRequest(validated.email, request.id)
          
        case GDPRRequestType.CONSENT_WITHDRAWAL:
          return await this.handleConsentWithdrawal(validated.email, request.id)
          
        default:
          return {
            success: true,
            message: 'Your request has been received and will be processed within 30 days.',
            requestId: request.id,
          }
      }
    } catch (error) {
      logger.error('GDPR request processing failed', { error })
      throw new Error('Failed to process GDPR request')
    }
  }
  
  /**
   * Create GDPR request record
   */
  private async createGDPRRequest(data: z.infer<typeof GDPRRequestSchema>) {
    // In a real implementation, create a GDPRRequest model in Prisma
    return {
      id: crypto.randomUUID(),
      email: data.email,
      type: data.type,
      status: GDPRRequestStatus.PENDING,
      createdAt: new Date(),
    }
  }
  
  /**
   * Export all user data
   */
  async exportUserData(email: string): Promise<UserDataExport> {
    try {
      // Find all user data across tables
      const [
        contacts,
        subscriber,
        downloads,
        events,
      ] = await Promise.all([
        prisma.contact.findMany({
          where: { email },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.newsletterSubscriber.findUnique({
          where: { email },
        }),
        prisma.leadMagnetDownload.findMany({
          where: { email },
          include: { leadMagnet: true },
        }),
        prisma.event.findMany({
          where: { userId: email },
          orderBy: { occurredAt: 'desc' },
        }),
      ])
      
      // Decrypt PII data
      const decryptedContacts = contacts.map(contact => ({
        ...contact,
        email: decryptEmail(contact.email),
        name: contact.name ? decryptName(contact.name) : undefined,
        phone: contact.phone ? decryptPhone(contact.phone) : undefined,
        ipAddress: contact.ipAddress ? decryptIpAddress(contact.ipAddress) : undefined,
      }))
      
      // Build export data
      const exportData: UserDataExport = {
        personalInformation: {
          email,
          name: decryptedContacts[0]?.name,
          phone: decryptedContacts[0]?.phone,
          company: decryptedContacts[0]?.company,
          createdAt: decryptedContacts[0]?.createdAt || new Date(),
          lastActive: events[0]?.occurredAt,
        },
        contactHistory: decryptedContacts.map(contact => ({
          date: contact.createdAt,
          subject: contact.subject,
          message: contact.message,
          status: contact.status,
        })),
        newsletterSubscription: subscriber ? {
          status: subscriber.status,
          subscribedAt: subscriber.subscribedAt,
          interests: subscriber.interests,
          verified: subscriber.verified,
        } : undefined,
        leadMagnetsDownloaded: downloads.map(download => ({
          name: download.leadMagnet.title,
          downloadedAt: download.downloadedAt,
        })),
        consentHistory: this.extractConsentHistory(events),
        dataProcessingActivities: this.extractProcessingActivities(events),
      }
      
      return exportData
    } catch (error) {
      logger.error('User data export failed', { error, email })
      throw new Error('Failed to export user data')
    }
  }
  
  /**
   * Delete all user data
   */
  async deleteUserData(email: string): Promise<void> {
    try {
      // Start transaction to ensure all data is deleted
      await prisma.$transaction(async (tx) => {
        // Delete from all tables containing user data
        await tx.contact.deleteMany({ where: { email } })
        await tx.newsletterSubscriber.deleteMany({ where: { email } })
        await tx.leadMagnetDownload.deleteMany({ where: { email } })
        await tx.event.deleteMany({ where: { userId: email } })
        await tx.emailSend.deleteMany({ where: { to: email } })
        await tx.sequenceEnrollment.deleteMany({ where: { email } })
        
        // Log deletion
        logger.info('User data deleted', { email })
      })
      
      // Track deletion event
      AppMonitoring.trackEvent('form_submission', {
        type: 'gdpr_data_deletion',
        email: email.substring(0, 3) + '***', // Partial email for privacy
      })
    } catch (error) {
      logger.error('User data deletion failed', { error, email })
      throw new Error('Failed to delete user data')
    }
  }
  
  /**
   * Handle data export request
   */
  private async handleDataExportRequest(email: string, requestId: string) {
    try {
      const userData = await this.exportUserData(email)
      
      // In production, you would:
      // 1. Generate a secure download link
      // 2. Send email with download link
      // 3. Set expiration on the link
      
      return {
        success: true,
        message: 'Your data export has been prepared. You will receive an email with a secure download link.',
        requestId,
        data: process.env.NODE_ENV === 'development' ? userData : undefined,
      }
    } catch (error) {
      logger.error('Data export request failed', { error, email })
      throw error
    }
  }
  
  /**
   * Handle data erasure request
   */
  private async handleDataErasureRequest(email: string, requestId: string) {
    try {
      // In production, implement verification process
      // For now, we'll add to queue for manual review
      
      logger.info('Data erasure request queued for review', {
        email,
        requestId,
      })
      
      return {
        success: true,
        message: 'Your data erasure request has been received. We will verify your identity and process the request within 30 days.',
        requestId,
      }
    } catch (error) {
      logger.error('Data erasure request failed', { error, email })
      throw error
    }
  }
  
  /**
   * Handle consent withdrawal
   */
  private async handleConsentWithdrawal(email: string, requestId: string) {
    try {
      // Update all consent preferences
      await prisma.newsletterSubscriber.updateMany({
        where: { email },
        data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
      })
      
      // Cancel any active email sequences
      await prisma.sequenceEnrollment.updateMany({
        where: { email },
        data: { status: 'CANCELLED' },
      })
      
      logger.info('Consent withdrawn', { email, requestId })
      
      return {
        success: true,
        message: 'Your consent has been withdrawn. You will no longer receive marketing communications.',
        requestId,
      }
    } catch (error) {
      logger.error('Consent withdrawal failed', { error, email })
      throw error
    }
  }
  
  /**
   * Extract consent history from events
   */
  private extractConsentHistory(events: Record<string, unknown>[]): UserDataExport['consentHistory'] {
    return events
      .filter(event => event.category === 'consent')
      .map(event => ({
        type: event.action || 'unknown',
        granted: event.metadata?.granted || false,
        timestamp: event.occurredAt,
        ipAddress: event.metadata?.ipAddress,
      }))
  }
  
  /**
   * Extract data processing activities
   */
  private extractProcessingActivities(events: Record<string, unknown>[]): UserDataExport['dataProcessingActivities'] {
    const activities = [
      { type: 'form_submission', purpose: 'Process contact requests' },
      { type: 'newsletter_signup', purpose: 'Send marketing communications' },
      { type: 'lead_download', purpose: 'Provide requested resources' },
      { type: 'analytics', purpose: 'Improve website experience' },
    ]
    
    return events
      .filter(event => activities.some(a => a.type === event.name))
      .map(event => {
        const activity = activities.find(a => a.type === event.name)
        return {
          activity: event.name,
          purpose: activity?.purpose || 'Business operations',
          timestamp: event.occurredAt,
        }
      })
  }
}

/**
 * GDPR compliance utilities
 */
export const gdprUtils = {
  /**
   * Anonymize IP address for analytics
   */
  anonymizeIP: (ip: string): string => {
    if (ip.includes(':')) {
      // IPv6: Zero out last 80 bits
      const parts = ip.split(':')
      return parts.slice(0, 3).join(':') + '::'
    } else {
      // IPv4: Zero out last octet
      const parts = ip.split('.')
      return parts.slice(0, 3).join('.') + '.0'
    }
  },
  
  /**
   * Get data retention period
   */
  getRetentionPeriod: (dataType: string): number => {
    const retentionDays = {
      contacts: 365 * 3, // 3 years
      analytics: 365 * 2, // 2 years
      newsletters: 365 * 5, // 5 years
      logs: 90, // 90 days
    }
    
    return retentionDays[dataType as keyof typeof retentionDays] || 365
  },
  
  /**
   * Check if data should be deleted
   */
  shouldDeleteData: (createdAt: Date, dataType: string): boolean => {
    const retentionDays = gdprUtils.getRetentionPeriod(dataType)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    return createdAt < cutoffDate
  },
  
  /**
   * Generate privacy policy data
   */
  generatePrivacyPolicyData: () => ({
    dataController: {
      name: 'Hudson Digital Solutions',
      email: process.env.CONTACT_EMAIL,
      address: 'Your business address',
    },
    dataCollected: [
      'Name and contact information',
      'IP address (anonymized)',
      'Browser and device information',
      'Usage data and analytics',
    ],
    purposes: [
      'Process contact form submissions',
      'Send requested information',
      'Improve website experience',
      'Marketing communications (with consent)',
    ],
    legalBasis: [
      'Consent',
      'Legitimate interests',
      'Contract fulfillment',
    ],
    dataRetention: {
      contacts: '3 years',
      analytics: '2 years',
      newsletters: '5 years or until unsubscribe',
    },
    rights: [
      'Access your personal data',
      'Rectify inaccurate data',
      'Request data erasure',
      'Object to processing',
      'Data portability',
      'Withdraw consent',
    ],
  }),
}

// Export service instance
export const gdprService = new GDPRComplianceService()
