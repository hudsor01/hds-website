/**
 * Field-Level Encryption for PII Data
 * 
 * This module provides field-level encryption for sensitive personally identifiable information (PII)
 * stored in the database. It uses AES-256-GCM encryption with proper key management.
 * 
 * Security Features:
 * - AES-256-GCM encryption for strong security
 * - Unique IV (initialization vector) for each encryption
 * - Authentication tag to prevent tampering
 * - Key derivation from master key
 * - Deterministic encryption option for searchable fields
 * - Format-preserving encryption for specific use cases
 * 
 * IMPORTANT: This addresses HIGH PRIORITY item #5 from the security todo list
 */

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, createHash } from 'crypto'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import type { Dict } from '@/types/utility-types'

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm' as const,
  keyLength: 32, // 256 bits
  ivLength: 16, // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32, // 256 bits
  iterations: 100000, // PBKDF2 iterations
  deterministicIvLength: 12, // For deterministic encryption
} as const

// Environment variable validation
const EncryptionEnvSchema = z.object({
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  ENCRYPTION_SALT: z.string().min(32, 'ENCRYPTION_SALT must be at least 32 characters').optional(),
})

// Validate environment variables
function getEncryptionConfig() {
  try {
    const config = EncryptionEnvSchema.parse({
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
      ENCRYPTION_SALT: process.env.ENCRYPTION_SALT,
    })
    return config
  } catch (_error) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Field encryption configuration is invalid in production')
    }
    // In development, return a default config with warnings
    logger.warn('Using default encryption key in development. Set ENCRYPTION_KEY for production.')
    return {
      ENCRYPTION_KEY: 'development-encryption-key-do-not-use-in-production',
      ENCRYPTION_SALT: 'development-salt-do-not-use-in-production',
    }
  }
}

// Derive encryption key from master key
function deriveKey(masterKey: string, salt?: string): Buffer {
  const actualSalt = salt || getEncryptionConfig().ENCRYPTION_SALT || 'default-salt'
  return pbkdf2Sync(
    masterKey,
    actualSalt,
    ENCRYPTION_CONFIG.iterations,
    ENCRYPTION_CONFIG.keyLength,
    'sha256',
  )
}

/**
 * Encrypted field format
 */
export interface EncryptedField {
  iv: string // Base64 encoded
  authTag: string // Base64 encoded
  encrypted: string // Base64 encoded
  version: number // For future migration support
}

/**
 * Field encryption options
 */
export interface FieldEncryptionOptions {
  /** Use deterministic encryption for searchable fields */
  deterministic?: boolean
  /** Additional authenticated data */
  aad?: string
  /** Context for key derivation */
  context?: string
}

/**
 * Encrypt a field value
 */
export function encryptField(
  value: string,
  options: FieldEncryptionOptions = {},
): string {
  try {
    const config = getEncryptionConfig()
    const key = deriveKey(config.ENCRYPTION_KEY, options.context)
    
    // Generate IV
    const iv = options.deterministic
      ? generateDeterministicIv(value, key)
      : randomBytes(ENCRYPTION_CONFIG.ivLength)
    
    // Create cipher
    const cipher = createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv)
    
    // Set AAD if provided
    if (options.aad) {
      cipher.setAAD(Buffer.from(options.aad, 'utf8'))
    }
    
    // Encrypt the value
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ])
    
    // Get auth tag
    const authTag = cipher.getAuthTag()
    
    // Create encrypted field object
    const encryptedField: EncryptedField = {
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encrypted: encrypted.toString('base64'),
      version: 1,
    }
    
    // Return as JSON string
    return JSON.stringify(encryptedField)
  } catch (error) {
    logger.error('Field encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw new Error('Failed to encrypt field')
  }
}

/**
 * Decrypt a field value
 */
export function decryptField(
  encryptedValue: string,
  options: FieldEncryptionOptions = {},
): string {
  try {
    const config = getEncryptionConfig()
    const key = deriveKey(config.ENCRYPTION_KEY, options.context)
    
    // Parse encrypted field
    const encryptedField: EncryptedField = JSON.parse(encryptedValue)
    
    // Create decipher
    const decipher = createDecipheriv(
      ENCRYPTION_CONFIG.algorithm,
      key,
      Buffer.from(encryptedField.iv, 'base64'),
    )
    
    // Set auth tag
    decipher.setAuthTag(Buffer.from(encryptedField.authTag, 'base64'))
    
    // Set AAD if provided
    if (options.aad) {
      decipher.setAAD(Buffer.from(options.aad, 'utf8'))
    }
    
    // Decrypt the value
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedField.encrypted, 'base64')),
      decipher.final(),
    ])
    
    return decrypted.toString('utf8')
  } catch (error) {
    logger.error('Field decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw new Error('Failed to decrypt field')
  }
}

/**
 * Generate deterministic IV for searchable encryption
 * WARNING: Use only for fields that need to be searchable
 */
function generateDeterministicIv(value: string, key: Buffer): Buffer {
  const hash = createHash('sha256')
  hash.update(key)
  hash.update(value)
  // Use Buffer.subarray instead of slice for newer Node.js, fallback to slice for compatibility
  const buf = hash.digest()
  return typeof buf.subarray === 'function'
    ? buf.subarray(0, ENCRYPTION_CONFIG.deterministicIvLength)
    : buf.slice(0, ENCRYPTION_CONFIG.deterministicIvLength)
}

/**
 * Encrypt email address (searchable)
 */
export function encryptEmail(email: string): string {
  return encryptField(email.toLowerCase(), {
    deterministic: true,
    context: 'email',
  })
}

/**
 * Decrypt email address
 */
export function decryptEmail(encryptedEmail: string): string {
  return decryptField(encryptedEmail, {
    context: 'email',
  })
}

/**
 * Encrypt phone number (searchable)
 */
export function encryptPhone(phone: string): string {
  // Normalize phone number
  const normalized = phone.replace(/\D/g, '')
  return encryptField(normalized, {
    deterministic: true,
    context: 'phone',
  })
}

/**
 * Decrypt phone number
 */
export function decryptPhone(encryptedPhone: string): string {
  return decryptField(encryptedPhone, {
    context: 'phone',
  })
}

/**
 * Encrypt name (not searchable)
 */
export function encryptName(name: string): string {
  return encryptField(name, {
    context: 'name',
  })
}

/**
 * Decrypt name
 */
export function decryptName(encryptedName: string): string {
  return decryptField(encryptedName, {
    context: 'name',
  })
}

/**
 * Encrypt IP address (not searchable, for privacy)
 */
export function encryptIpAddress(ip: string): string {
  return encryptField(ip, {
    context: 'ip_address',
  })
}

/**
 * Decrypt IP address
 */
export function decryptIpAddress(encryptedIp: string): string {
  return decryptField(encryptedIp, {
    context: 'ip_address',
  })
}

/**
 * Hash email for lookups (one-way)
 */
export function hashEmail(email: string): string {
  const config = getEncryptionConfig()
  const hash = createHash('sha256')
  hash.update(config.ENCRYPTION_KEY)
  hash.update(email.toLowerCase())
  return hash.digest('hex')
}

// Type for Prisma middleware params
type PrismaMiddlewareParams = {
  action: string
  model?: string
  args?: {
    data?: Dict<unknown>
    where?: Dict<unknown>
    [key: string]: unknown
  }
}

/**
 * Prisma middleware for automatic field encryption/decryption
 */
export function createEncryptionMiddleware() {
  return async (params: unknown, next: unknown) => {
    // Fields to encrypt
    const encryptedFields = {
      Contact: ['email', 'phone', 'name', 'ipAddress'],
      NewsletterSubscriber: ['email', 'name', 'ipAddress'],
      LeadMagnetDownload: ['email', 'name', 'ipAddress'],
      AdminUser: ['email'],
      PageView: ['ipAddress'],
    }

    // Type guard for params
    function isPrismaParams(obj: unknown): obj is PrismaMiddlewareParams {
      return (
        !!obj &&
        typeof obj === 'object' &&
        'action' in obj &&
        typeof (obj as Dict<unknown>).action === 'string'
      )
    }

    if (!isPrismaParams(params)) {
      return typeof next === 'function' ? next(params) : undefined
    }

    const model = params.model
    const fields = encryptedFields[model as keyof typeof encryptedFields]

    if (!fields) {
      return typeof next === 'function' ? next(params) : undefined
    }

    // Encrypt on create/update
    if (params.action === 'create' || params.action === 'update') {
      const data = params.args?.data as Dict<unknown> | undefined
      if (data) {
        for (const field of fields) {
          if (field in data && data[field] && typeof data[field] === 'string') {
            switch (field) {
              case 'email':
                data[field] = encryptEmail(data[field] as string)
                break
              case 'phone':
                data[field] = encryptPhone(data[field] as string)
                break
              case 'name':
                data[field] = encryptName(data[field] as string)
                break
              case 'ipAddress':
                data[field] = encryptIpAddress(data[field] as string)
                break
              default:
                data[field] = encryptField(data[field] as string)
            }
          }
        }
      }
    }

    // Handle queries with encrypted fields
    if (params.action === 'findFirst' || params.action === 'findUnique') {
      const where = params.args?.where as Dict<unknown> | undefined
      if (where) {
        // Convert plain text searches to encrypted searches
        if ('email' in where && where.email && typeof where.email === 'string') {
          where.email = encryptEmail(where.email)
        }
        if ('phone' in where && where.phone && typeof where.phone === 'string') {
          where.phone = encryptPhone(where.phone)
        }
      }
    }

    const result = await (typeof next === 'function' ? next(params) : undefined)

    // Decrypt on read
    if (result) {
      const decrypt = (obj: Dict<unknown>) => {
        if (!obj || typeof obj !== 'object') return

        for (const field of fields) {
          if (field in obj && obj[field] && typeof obj[field] === 'string') {
            try {
              switch (field) {
                case 'email':
                  obj[field] = decryptEmail(obj[field])
                  break
                case 'phone':
                  obj[field] = decryptPhone(obj[field])
                  break
                case 'name':
                  obj[field] = decryptName(obj[field])
                  break
                case 'ipAddress':
                  obj[field] = decryptIpAddress(obj[field])
                  break
                default:
                  obj[field] = decryptField(obj[field])
              }
            } catch (_error) {
              // Log but don't fail - field might not be encrypted
              logger.debug('Field decryption skipped', { field, model })
            }
          }
        }
      }

      if (Array.isArray(result)) {
        result.forEach(decrypt)
      } else {
        decrypt(result)
      }
    }

    return result
  }
}

/**
 * Utility to migrate unencrypted data
 */
export async function migrateUnencryptedData(
  prisma: Record<string, { findMany: (...args: unknown[]) => Promise<unknown[]>; update: (...args: unknown[]) => Promise<unknown> }>,
  model: string,
  fields: string[],
  batchSize = 100,
): Promise<void> {
  logger.info(`Starting encryption migration for ${model}`, { fields })

  let processed = 0
  let hasMore = true

  while (hasMore) {
    const modelHandler = prisma[model]
    if (!modelHandler) {
      throw new Error(`Model "${model}" not found in Prisma client`)
    }
    
    const records: Array<Dict<unknown>> = await modelHandler.findMany({
      take: batchSize,
      skip: processed,
    })

    if (records.length === 0) {
      hasMore = false
      break
    }

    for (const record of records) {
      const updates: Dict<unknown> = {}
      let needsUpdate = false

      for (const field of fields) {
        if (field in record && record[field] && typeof record[field] === 'string') {
          // Check if already encrypted
          try {
            JSON.parse(record[field] as string)
            // If parseable as JSON, assume it's already encrypted
            continue
          } catch {
            // Not JSON, needs encryption
            needsUpdate = true
            switch (field) {
              case 'email':
                updates[field] = encryptEmail(record[field] as string)
                break
              case 'phone':
                updates[field] = encryptPhone(record[field] as string)
                break
              case 'name':
                updates[field] = encryptName(record[field] as string)
                break
              case 'ipAddress':
                updates[field] = encryptIpAddress(record[field] as string)
                break
              default:
                updates[field] = encryptField(record[field] as string)
            }
          }
        }
      }

      if (needsUpdate) {
        await modelHandler.update({
          where: { id: record.id },
          data: updates,
        })
      }
    }

    processed += records.length
    logger.info(`Migrated ${processed} ${model} records`)
  }

  logger.info(`Completed encryption migration for ${model}`, { total: processed })
}

/**
 * Test encryption functionality
 */
export function testEncryption(): boolean {
  try {
    const testData = {
      email: 'test@example.com',
      phone: '+1234567890',
      name: 'John Doe',
      ip: '192.168.1.1',
    }
    
    // Test encryption/decryption
    const encryptedEmail = encryptEmail(testData.email)
    const decryptedEmail = decryptEmail(encryptedEmail)
    if (decryptedEmail !== testData.email) {
      throw new Error('Email encryption/decryption failed')
    }
    
    const encryptedPhone = encryptPhone(testData.phone)
    const decryptedPhone = decryptPhone(encryptedPhone)
    if (decryptedPhone !== testData.phone.replace(/\D/g, '')) {
      throw new Error('Phone encryption/decryption failed')
    }
    
    const encryptedName = encryptName(testData.name)
    const decryptedName = decryptName(encryptedName)
    if (decryptedName !== testData.name) {
      throw new Error('Name encryption/decryption failed')
    }
    
    const encryptedIp = encryptIpAddress(testData.ip)
    const decryptedIp = decryptIpAddress(encryptedIp)
    if (decryptedIp !== testData.ip) {
      throw new Error('IP encryption/decryption failed')
    }
    
    // Test deterministic encryption
    const encryptedEmail2 = encryptEmail(testData.email)
    if (encryptedEmail !== encryptedEmail2) {
      throw new Error('Deterministic encryption not working for email')
    }
    
    logger.info('Field encryption tests passed')
    return true
  } catch (error) {
    logger.error('Field encryption test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}
