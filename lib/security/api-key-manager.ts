/**
 * API Key Management System
 * 
 * Secure handling of API keys with encryption, rotation, and access control
 */

import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

/**
 * API key configuration
 */
interface ApiKeyConfig {
  name: string
  key: string
  encryptionRequired: boolean
  rotationInterval?: number // days
  lastRotated?: Date
  usageLimit?: number
  allowedDomains?: string[]
  allowedIPs?: string[]
  rateLimit?: {
    requests: number
    window: number // seconds
  }
}

/**
 * Encrypted API key storage
 */
class ApiKeyManager {
  private encryptionKey: Buffer
  private algorithm = 'aes-256-gcm'
  private keys: Map<string, ApiKeyConfig> = new Map()

  constructor() {
    // Get encryption key from environment
    const key = env.ENCRYPTION_KEY || env.JWT_SECRET
    if (!key || key.length < 32) {
      throw new Error('Encryption key must be at least 32 characters')
    }
    this.encryptionKey = Buffer.from(key.slice(0, 32))
    
    // Initialize API keys
    this.initializeKeys()
  }

  /**
   * Initialize API keys from environment
   */
  private initializeKeys() {
    // Resend API key
    if (env.RESEND_API_KEY) {
      this.registerKey({
        name: 'resend',
        key: env.RESEND_API_KEY,
        encryptionRequired: true,
        rotationInterval: 90, // Rotate every 90 days
      })
    }

    // Cal.com API key
    if (env.CAL_COM_API_KEY) {
      this.registerKey({
        name: 'cal.com',
        key: env.CAL_COM_API_KEY,
        encryptionRequired: true,
        rotationInterval: 180,
      })
    }

    // Add other API keys as needed
    const apiKeys = [
      { name: 'stripe', envKey: 'STRIPE_SECRET_KEY' },
      { name: 'openai', envKey: 'OPENAI_API_KEY' },
      { name: 'anthropic', envKey: 'ANTHROPIC_API_KEY' },
      { name: 'sentry', envKey: 'SENTRY_AUTH_TOKEN' },
    ]

    apiKeys.forEach(({ name, envKey }) => {
      const key = process.env[envKey]
      if (key) {
        this.registerKey({
          name,
          key,
          encryptionRequired: true,
          rotationInterval: 90,
        })
      }
    })
  }

  /**
   * Encrypt API key
   */
  private encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    }
  }

  /**
   * Decrypt API key
   */
  private decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(iv, 'hex'),
    )
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Register a new API key
   */
  registerKey(config: ApiKeyConfig): void {
    if (config.encryptionRequired) {
      const { encrypted, iv, tag } = this.encrypt(config.key)
      this.keys.set(config.name, {
        ...config,
        key: `${encrypted}:${iv}:${tag}`,
      })
    } else {
      this.keys.set(config.name, config)
    }
    
    logger.info('API key registered', {
      name: config.name,
      encrypted: config.encryptionRequired,
    })
  }

  /**
   * Get decrypted API key
   */
  getKey(name: string): string | null {
    const config = this.keys.get(name)
    if (!config) {
      logger.warn('API key not found', { name })
      return null
    }

    // Check if rotation is needed
    if (config.rotationInterval && config.lastRotated) {
      const daysSinceRotation = Math.floor(
        (Date.now() - config.lastRotated.getTime()) / (1000 * 60 * 60 * 24),
      )
      
      if (daysSinceRotation > config.rotationInterval) {
        logger.warn('API key rotation overdue', {
          name,
          daysSinceRotation,
          rotationInterval: config.rotationInterval,
        })
      }
    }

    // Decrypt if encrypted
    if (config.encryptionRequired) {
      try {
        const [encrypted, iv, tag] = config.key.split(':')
        return this.decrypt(encrypted, iv, tag)
      } catch (error) {
        logger.error('Failed to decrypt API key', { name, error })
        return null
      }
    }

    return config.key
  }

  /**
   * Validate API key usage
   */
  async validateUsage(
    name: string,
    request: Request,
  ): Promise<{ valid: boolean; reason?: string }> {
    const config = this.keys.get(name)
    if (!config) {
      return { valid: false, reason: 'API key not found' }
    }

    // Check allowed domains
    if (config.allowedDomains?.length) {
      const origin = request.headers.get('origin')
      if (!origin || !config.allowedDomains.includes(origin)) {
        return { valid: false, reason: 'Domain not allowed' }
      }
    }

    // Check allowed IPs
    if (config.allowedIPs?.length) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip')
      if (!ip || !config.allowedIPs.includes(ip)) {
        return { valid: false, reason: 'IP not allowed' }
      }
    }

    // Rate limiting would go here (using Redis in production)

    return { valid: true }
  }

  /**
   * Rotate API key (manual process - requires updating in external service)
   */
  markRotated(name: string): void {
    const config = this.keys.get(name)
    if (config) {
      config.lastRotated = new Date()
      logger.info('API key marked as rotated', { name })
    }
  }

  /**
   * Get key status for monitoring
   */
  getKeyStatus(name: string): {
    exists: boolean
    encrypted: boolean
    rotationDue?: boolean
    lastRotated?: Date
  } | null {
    const config = this.keys.get(name)
    if (!config) return null

    const status = {
      exists: true,
      encrypted: config.encryptionRequired,
      lastRotated: config.lastRotated,
      rotationDue: false,
    }

    if (config.rotationInterval && config.lastRotated) {
      const daysSinceRotation = Math.floor(
        (Date.now() - config.lastRotated.getTime()) / (1000 * 60 * 60 * 24),
      )
      status.rotationDue = daysSinceRotation > config.rotationInterval
    }

    return status
  }

  /**
   * Get all key statuses for dashboard
   */
  getAllKeyStatuses(): Record<string, unknown> {
    const statuses: Record<string, unknown> = {}
    
    this.keys.forEach((_, name) => {
      statuses[name] = this.getKeyStatus(name)
    })
    
    return statuses
  }
}

// Singleton instance
let apiKeyManager: ApiKeyManager | null = null

/**
 * Get API key manager instance
 */
export function getApiKeyManager(): ApiKeyManager {
  if (!apiKeyManager) {
    apiKeyManager = new ApiKeyManager()
  }
  return apiKeyManager
}

/**
 * Helper functions for common API keys
 */
export const apiKeys = {
  /**
   * Get Resend API key
   */
  getResendKey: () => getApiKeyManager().getKey('resend'),
  
  /**
   * Get Cal.com API key
   */
  getCalKey: () => getApiKeyManager().getKey('cal.com'),
  
  /**
   * Get Stripe secret key
   */
  getStripeKey: () => getApiKeyManager().getKey('stripe'),
  
  /**
   * Get OpenAI API key
   */
  getOpenAIKey: () => getApiKeyManager().getKey('openai'),
  
  /**
   * Get Sentry auth token
   */
  getSentryToken: () => getApiKeyManager().getKey('sentry'),
}

/**
 * API key validation middleware
 */
export async function validateApiKey(
  request: Request,
  keyName: string,
): Promise<{ valid: boolean; reason?: string }> {
  const manager = getApiKeyManager()
  return manager.validateUsage(keyName, request)
}

/**
 * Secure API key header
 */
export function createSecureHeaders(keyName: string): HeadersInit {
  const key = getApiKeyManager().getKey(keyName)
  if (!key) {
    throw new Error(`API key not found: ${keyName}`)
  }
  
  return {
    'Authorization': `Bearer ${key}`,
    'X-Api-Version': '1',
    'X-Request-ID': crypto.randomUUID(),
  }
}

/**
 * API key rotation reminder
 */
export function checkApiKeyRotation(): void {
  const manager = getApiKeyManager()
  const statuses = manager.getAllKeyStatuses()
  
  Object.entries(statuses).forEach(([name, status]) => {
    if (status?.rotationDue) {
      logger.warn('API key rotation due', {
        name,
        lastRotated: status.lastRotated,
      })
    }
  })
}

/**
 * Initialize API key monitoring
 */
if (env.NODE_ENV === 'production') {
  // Check rotation status daily
  setInterval(() => {
    checkApiKeyRotation()
  }, 24 * 60 * 60 * 1000)
}
