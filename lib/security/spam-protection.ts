/**
 * Spam Protection System
 * 
 * Multi-layer spam protection without relying on external CAPTCHA services.
 * Works well with Clerk authentication for enhanced security.
 */

import { z } from 'zod'

// ============= Spam Detection Patterns =============

const SPAM_KEYWORDS = [
  // Common spam words
  'casino', 'viagra', 'cialis', 'loan', 'bitcoin', 'crypto',
  'investment', 'profit', 'money back', 'guarantee', 'free money',
  'make money fast', 'work from home', 'click here', 'limited time',
  'urgent', 'act now', 'congratulations', 'winner', 'prize',
  // Link spam patterns
  'bit.ly', 'tinyurl', 'shortened.link', 't.co',
  // Suspicious patterns
  'URGENT!!!', 'FREE!!!', '$$$$', '💰', '🤑',
]

const SUSPICIOUS_PATTERNS = [
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, // SSN patterns
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/g, // Multiple URLs
  /[A-Z]{5,}/, // Excessive caps
  /(.)\1{4,}/, // Repeated characters (5+ times)
]

const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
  'protonmail.com', 'icloud.com', 'aol.com', 'live.com',
]

// ============= Validation Schemas =============

export const spamProtectionSchema = z.object({
  // Content validation
  message: z.string()
    .min(10, 'Message too short - please provide more details')
    .max(2000, 'Message too long')
    .refine(
      (message) => {
        const lowerMessage = message.toLowerCase()
        const spamWordCount = SPAM_KEYWORDS.filter(word => 
          lowerMessage.includes(word.toLowerCase()),
        ).length
        return spamWordCount <= 2 // Allow up to 2 potential spam words
      },
      { message: 'Message contains suspicious content' },
    )
    .refine(
      (message) => !SUSPICIOUS_PATTERNS.some(pattern => pattern.test(message)),
      { message: 'Message contains suspicious patterns' },
    ),

  // Email validation with domain checking
  email: z.string()
    .email('Invalid email address')
    .refine(
      (email) => {
        const domain = email.split('@')[1]?.toLowerCase()
        if (!domain) return false
        
        // Allow business domains (more than 3 chars before TLD)
        const domainParts = domain.split('.')
        if (domainParts.length >= 2) {
          const domainName = domainParts[0]
          if (domainName && domainName.length > 3) return true
        }
        
        // Allow common email providers
        return ALLOWED_DOMAINS.includes(domain)
      },
      { message: 'Please use a valid email address' },
    ),

  // Timing validation (must spend at least 5 seconds on form)
  formStartTime: z.number()
    .refine(
      (startTime) => {
        const timeSpent = Date.now() - startTime
        return timeSpent >= 5000 // Minimum 5 seconds
      },
      { message: 'Please take more time to fill out the form' },
    ),

  // Honeypot field (should always be empty)
  website: z.string().max(0, 'Automated submission detected'),
})

// ============= Rate Limiting =============

interface RateLimitEntry {
  count: number
  firstAttempt: number
  lastAttempt: number
}

// In-memory rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

export class RateLimiter {
  private windowMs: number
  private maxAttempts: number

  constructor(windowMs = 15 * 60 * 1000, maxAttempts = 5) {
    this.windowMs = windowMs
    this.maxAttempts = maxAttempts
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    if (!entry) {
      rateLimitStore.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      })
      return false
    }

    // Reset if window has passed
    if (now - entry.firstAttempt > this.windowMs) {
      rateLimitStore.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      })
      return false
    }

    // Update attempt count
    entry.count++
    entry.lastAttempt = now
    rateLimitStore.set(identifier, entry)

    return entry.count > this.maxAttempts
  }

  getRemainingTime(identifier: string): number {
    const entry = rateLimitStore.get(identifier)
    if (!entry) return 0

    const elapsed = Date.now() - entry.firstAttempt
    return Math.max(0, this.windowMs - elapsed)
  }
}

// ============= Content Analysis =============

export class ContentAnalyzer {
  /**
   * Analyze message content for spam indicators
   */
  static analyzeContent(content: string): {
    score: number
    flags: string[]
    isSpam: boolean
  } {
    const flags: string[] = []
    let score = 0

    const lowerContent = content.toLowerCase()

    // Check for spam keywords
    const spamWords = SPAM_KEYWORDS.filter(word => 
      lowerContent.includes(word.toLowerCase()),
    )
    if (spamWords.length > 0) {
      score += spamWords.length * 10
      flags.push(`Contains spam keywords: ${spamWords.join(', ')}`)
    }

    // Check for suspicious patterns
    SUSPICIOUS_PATTERNS.forEach(pattern => {
      if (pattern.test(content)) {
        score += 15
        flags.push('Contains suspicious patterns')
      }
    })

    // Check for excessive caps
    const capsCount = (content.match(/[A-Z]/g) || []).length
    const capsRatio = capsCount / content.length
    if (capsRatio > 0.5 && content.length > 10) {
      score += 10
      flags.push('Excessive capital letters')
    }

    // Check for URL count
    const urlMatches = content.match(/https?:\/\/[^\s]+/g) || []
    if (urlMatches.length > 2) {
      score += urlMatches.length * 5
      flags.push('Multiple URLs detected')
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(content)) {
      score += 10
      flags.push('Repeated characters detected')
    }

    // Check message length vs content quality
    const wordCount = content.split(/\s+/).length
    const avgWordLength = content.replace(/\s/g, '').length / wordCount
    if (avgWordLength < 3 && wordCount > 5) {
      score += 5
      flags.push('Low quality content')
    }

    return {
      score,
      flags,
      isSpam: score >= 25, // Threshold for spam detection
    }
  }

  /**
   * Validate email domain reputation
   */
  static validateEmailDomain(email: string): {
    isValid: boolean
    risk: 'low' | 'medium' | 'high'
    reason?: string
  } {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) {
      return { isValid: false, risk: 'high', reason: 'Invalid email format' }
    }

    // Check against disposable email services
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org',
    ]
    
    if (disposableDomains.includes(domain)) {
      return { 
        isValid: false, 
        risk: 'high', 
        reason: 'Disposable email address', 
      }
    }

    // Check for suspicious domain patterns
    if (domain.includes('temp') || domain.includes('fake') || domain.includes('test')) {
      return { 
        isValid: false, 
        risk: 'high', 
        reason: 'Suspicious domain pattern', 
      }
    }

    // Business domains are generally lower risk
    const domainParts = domain.split('.')
    if (domainParts.length >= 2 && domainParts[0] && domainParts[0].length > 5) {
      return { isValid: true, risk: 'low' }
    }

    // Common providers are medium risk
    if (ALLOWED_DOMAINS.includes(domain)) {
      return { isValid: true, risk: 'medium' }
    }

    return { isValid: true, risk: 'low' }
  }
}

// ============= IP-based Protection =============

export class IPProtection {
  private static suspiciousIPs = new Set<string>()
  private static ipAttempts = new Map<string, number>()

  /**
   * Check if IP address is flagged as suspicious
   */
  static isSuspiciousIP(ip: string): boolean {
    return this.suspiciousIPs.has(ip)
  }

  /**
   * Flag IP as suspicious after multiple failed attempts
   */
  static flagIP(ip: string): void {
    const attempts = this.ipAttempts.get(ip) || 0
    this.ipAttempts.set(ip, attempts + 1)

    if (attempts + 1 >= 3) {
      this.suspiciousIPs.add(ip)
    }
  }

  /**
   * Clear IP flag (for legitimate users)
   */
  static clearIPFlag(ip: string): void {
    this.suspiciousIPs.delete(ip)
    this.ipAttempts.delete(ip)
  }
}

// ============= Integration with Clerk =============

export interface SpamProtectionContext {
  userAgent?: string
  ip?: string
  clerkUserId?: string
  isAuthenticated: boolean
  userCreatedAt?: Date
}

/**
 * Enhanced spam protection that considers Clerk authentication
 */
export type SpamProtectionData = z.infer<typeof spamProtectionSchema>

export function validateWithClerkContext(
  data: Partial<SpamProtectionData>,
  context: SpamProtectionContext,
): { 
  isValid: boolean
  errors: string[]
  riskScore: number
} {
  const errors: string[] = []
  let riskScore = 0

  // Basic validation
  try {
    spamProtectionSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message))
      riskScore += 20
    }
  }

  // Content analysis
  if (data.message) {
    const analysis = ContentAnalyzer.analyzeContent(data.message)
    riskScore += analysis.score
    if (analysis.isSpam) {
      errors.push('Message flagged as potential spam')
    }
  }

  // Email validation
  if (data.email) {
    const emailValidation = ContentAnalyzer.validateEmailDomain(data.email)
    if (!emailValidation.isValid) {
      errors.push(emailValidation.reason || 'Invalid email domain')
      riskScore += 15
    } else if (emailValidation.risk === 'high') {
      riskScore += 10
    }
  }

  // Clerk authentication context
  if (context.isAuthenticated && context.clerkUserId) {
    // Authenticated users get lower risk scores
    riskScore = Math.max(0, riskScore - 15)
    
    // New accounts might be higher risk
    if (context.userCreatedAt) {
      const accountAge = Date.now() - context.userCreatedAt.getTime()
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24)
      
      if (daysSinceCreation < 1) {
        riskScore += 5 // Very new account
      } else if (daysSinceCreation < 7) {
        riskScore += 2 // New account
      }
    }
  } else {
    // Unauthenticated users get higher risk scores
    riskScore += 10
  }

  // IP-based checks
  if (context.ip) {
    if (IPProtection.isSuspiciousIP(context.ip)) {
      errors.push('Request from flagged IP address')
      riskScore += 25
    }
  }

  // User agent validation
  if (context.userAgent) {
    const suspiciousUAPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /requests/i,
    ]
    
    if (suspiciousUAPatterns.some(pattern => pattern.test(context.userAgent!))) {
      errors.push('Suspicious user agent detected')
      riskScore += 20
    }
  }

  return {
    isValid: errors.length === 0 && riskScore < 50,
    errors,
    riskScore,
  }
}

// ============= Export Types =============

export type {
  RateLimitEntry,
}