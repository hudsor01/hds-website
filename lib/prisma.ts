/**
 * Prisma Client with Field-Level Encryption
 * 
 * This module configures the Prisma client with automatic field-level encryption
 * for PII data. All sensitive fields are encrypted at rest and decrypted on read.
 * 
 * HIGH PRIORITY Security Feature #5: Field-level encryption for PII data
 */

import { PrismaClient } from '@prisma/client'
import { createEncryptionMiddleware } from '@/lib/security/encryption/field-encryption'
import { logger } from '@/lib/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add field-level encryption middleware
prisma.$use(createEncryptionMiddleware())

// Log encryption status
if (process.env.ENCRYPTION_KEY) {
  logger.info('Field-level encryption enabled for PII data')
} else {
  logger.warn('Field-level encryption not configured. Set ENCRYPTION_KEY in production.')
}

export default prisma
