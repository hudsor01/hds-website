/**
 * Encryption setup script
 * 
 * This script helps generate secure encryption keys and test the encryption system
 */

import { randomBytes } from 'crypto'
import { testEncryption } from '../lib/security/encryption/field-encryption'

// Generate secure encryption key
function generateEncryptionKey(): string {
  return randomBytes(32).toString('base64')
}

// Generate secure salt
function generateSalt(): string {
  return randomBytes(32).toString('base64')
}

console.log('🔐 Field-Level Encryption Setup')
console.log('===============================\n')

console.log('1. Add these to your .env file:\n')
console.log(`ENCRYPTION_KEY=${generateEncryptionKey()}`)
console.log(`ENCRYPTION_SALT=${generateSalt()}\n`)

console.log('2. Testing encryption functionality...')
const testResult = testEncryption()
if (testResult) {
  console.log('✅ Encryption tests passed!\n')
} else {
  console.log('❌ Encryption tests failed. Check the logs.\n')
}

console.log('3. To use encryption in your Prisma client:\n')
console.log(`import { PrismaClient } from '@prisma/client'
import { createEncryptionMiddleware } from '@/lib/security/encryption/field-encryption'

const prisma = new PrismaClient()

// Add encryption middleware
prisma.$use(createEncryptionMiddleware())

export default prisma
`)

console.log('\n4. To migrate existing unencrypted data:\n')
console.log(`import { migrateUnencryptedData } from '@/lib/security/encryption/field-encryption'
import prisma from '@/lib/prisma'

// Migrate each model with PII
await migrateUnencryptedData(prisma, 'Contact', ['email', 'phone', 'name', 'ipAddress'])
await migrateUnencryptedData(prisma, 'NewsletterSubscriber', ['email', 'name', 'ipAddress'])
await migrateUnencryptedData(prisma, 'LeadMagnetDownload', ['email', 'name', 'ipAddress'])
await migrateUnencryptedData(prisma, 'AdminUser', ['email'])
await migrateUnencryptedData(prisma, 'PageView', ['ipAddress'])
`)

console.log('\n✅ Field encryption setup complete!')
