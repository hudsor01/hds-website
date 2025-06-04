import { trackEmailDelivery } from './app-monitoring'

// Email monitoring middleware for Resend
export class EmailMonitoring {
  // Monitor email delivery with retry logic
  static async monitorEmailDelivery<T>(
    emailType: string,
    emailOperation: () => Promise<T>,
    maxRetries: number = 2,
  ): Promise<T> {
    let attempt = 0
    let lastError: Error | null = null

    while (attempt <= maxRetries) {
      try {
        const startTime = Date.now()
        const result = await emailOperation()
        const duration = Date.now() - startTime

        // Track successful delivery
        trackEmailDelivery(emailType, true, undefined, undefined)
        
        // Log timing
        console.log(`📧 Email sent successfully: ${emailType} (${duration}ms)`)
        
        return result
      } catch (error) {
        attempt++
        lastError = error as Error
        
        console.error(`❌ Email attempt ${attempt} failed for ${emailType}:`, error)

        if (attempt <= maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000
          console.log(`⏳ Retrying email delivery in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All attempts failed
    trackEmailDelivery(emailType, false, undefined, lastError?.message)
    throw lastError
  }

  // Monitor email configuration
  static validateEmailConfig(): { isValid: boolean; issues: string[] } {
    const issues: string[] = []

    if (!process.env.RESEND_API_KEY) {
      issues.push('RESEND_API_KEY is not configured')
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      issues.push('RESEND_FROM_EMAIL is not configured')
    }

    if (!process.env.CONTACT_EMAIL) {
      issues.push('CONTACT_EMAIL is not configured')
    }

    // Check email format validity
    if (process.env.RESEND_FROM_EMAIL && !this.isValidEmail(process.env.RESEND_FROM_EMAIL)) {
      issues.push('RESEND_FROM_EMAIL format is invalid')
    }

    if (process.env.CONTACT_EMAIL && !this.isValidEmail(process.env.CONTACT_EMAIL)) {
      issues.push('CONTACT_EMAIL format is invalid')
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Log email configuration status on startup
  static logEmailConfigStatus() {
    const validation = this.validateEmailConfig()
    
    if (validation.isValid) {
      console.log('✅ Email configuration is valid')
    } else {
      console.error('❌ Email configuration issues:', validation.issues)
    }

    return validation
  }

  // Monitor email rate limits (basic implementation)
  private static emailCounts = new Map<string, { count: number; resetTime: number }>()
  
  static checkRateLimit(emailType: string, maxPerHour: number = 100): boolean {
    const now = Date.now()
    const hourInMs = 60 * 60 * 1000
    
    if (!this.emailCounts.has(emailType)) {
      this.emailCounts.set(emailType, { count: 0, resetTime: now + hourInMs })
    }

    const stats = this.emailCounts.get(emailType)!
    
    // Reset counter if hour has passed
    if (now > stats.resetTime) {
      stats.count = 0
      stats.resetTime = now + hourInMs
    }

    // Check if limit exceeded
    if (stats.count >= maxPerHour) {
      console.warn(`⚠️ Email rate limit exceeded for ${emailType}: ${stats.count}/${maxPerHour}`)
      return false
    }

    stats.count++
    return true
  }

  // Get email stats
  static getEmailStats() {
    const stats: Record<string, unknown> = {}
    
    for (const [emailType, data] of this.emailCounts.entries()) {
      stats[emailType] = {
        count: data.count,
        resetTime: new Date(data.resetTime).toISOString(),
      }
    }

    return stats
  }
}

// Export monitoring functions
export const monitorEmailDelivery = EmailMonitoring.monitorEmailDelivery.bind(EmailMonitoring)
export const validateEmailConfig = EmailMonitoring.validateEmailConfig.bind(EmailMonitoring)
export const checkEmailRateLimit = EmailMonitoring.checkRateLimit.bind(EmailMonitoring)

// Initialize email monitoring
EmailMonitoring.logEmailConfigStatus()