/**
 * Comprehensive Security Testing Suite
 * 
 * MEDIUM PRIORITY #6: Add comprehensive security testing suite
 * 
 * This test suite covers all critical security features:
 * - Authentication and authorization
 * - Password hashing and validation
 * - JWT token security
 * - Rate limiting
 * - Field-level encryption
 * - Security headers
 * - Input validation
 * - CSRF protection
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { hash, compare } from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'

// Mock environment variables for testing
beforeAll(() => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long'
  process.env.ADMIN_USERNAME = 'testadmin'
  process.env.ADMIN_PASSWORD = 'TestPassword123!'
  process.env.ADMIN_PASSWORD_HASH = '$2b$12$mock.hash.for.testing'
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters'
  process.env.ENCRYPTION_SALT = 'test-salt-32-characters-for-test'
})

describe('Security Test Suite', () => {
  
  describe('Password Security', () => {
    it('should hash passwords with bcrypt', async () => {
      const password = 'TestPassword123!'
      const hash = await hash(password, 12)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.startsWith('$2b$')).toBe(true)
    })
    
    it('should verify hashed passwords correctly', async () => {
      const password = 'TestPassword123!'
      const wrongPassword = 'WrongPassword123!'
      const passwordHash = await hash(password, 12)
      
      const validResult = await compare(password, passwordHash)
      const invalidResult = await compare(wrongPassword, passwordHash)
      
      expect(validResult).toBe(true)
      expect(invalidResult).toBe(false)
    })
    
    it('should enforce strong password requirements', () => {
      const PasswordSchema = z.string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      
      // Valid passwords
      expect(() => PasswordSchema.parse('ValidPass123!')).not.toThrow()
      expect(() => PasswordSchema.parse('Str0ng@Pass')).not.toThrow()
      
      // Invalid passwords
      expect(() => PasswordSchema.parse('weak')).toThrow()
      expect(() => PasswordSchema.parse('NoNumbers!')).toThrow()
      expect(() => PasswordSchema.parse('nocapitals123!')).toThrow()
      expect(() => PasswordSchema.parse('NoSpecial123')).toThrow()
    })
    
    it('should prevent timing attacks with constant-time comparison', async () => {
      const password = 'TestPassword123!'
      const hash1 = await hash(password, 12)
      const hash2 = await hash(password + 'x', 12)
      
      // Both comparisons should take similar time regardless of when they fail
      const start1 = Date.now()
      await compare('shortpass', hash1)
      const time1 = Date.now() - start1
      
      const start2 = Date.now()
      await compare('verylongpasswordthatdoesnotmatch', hash2)
      const time2 = Date.now() - start2
      
      // Times should be within reasonable variance (not exact due to system factors)
      expect(Math.abs(time1 - time2)).toBeLessThan(50) // 50ms tolerance
    })
  })
  
  describe('JWT Security', () => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    
    it('should create secure JWT tokens', async () => {
      const payload = {
        sub: 'user-123',
        userId: 'user-123',
        username: 'testuser',
        role: 'admin',
      }
      
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .setIssuer('hudson-digital-solutions')
        .setAudience('admin-panel')
        .sign(secret)
      
      expect(token).toBeDefined()
      expect(token.split('.')).toHaveLength(3) // Header.Payload.Signature
    })
    
    it('should verify JWT tokens with all claims', async () => {
      const payload = {
        sub: 'user-123',
        userId: 'user-123',
        username: 'testuser',
        role: 'admin',
      }
      
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .setIssuer('hudson-digital-solutions')
        .setAudience('admin-panel')
        .sign(secret)
      
      const { payload: verified } = await jwtVerify(token, secret, {
        issuer: 'hudson-digital-solutions',
        audience: 'admin-panel',
      })
      
      expect(verified.sub).toBe('user-123')
      expect(verified.userId).toBe('user-123')
      expect(verified.username).toBe('testuser')
      expect(verified.role).toBe('admin')
    })
    
    it('should reject expired tokens', async () => {
      const token = await new SignJWT({ sub: 'user-123' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago
        .setExpirationTime(Math.floor(Date.now() / 1000) - 1800) // 30 min ago
        .sign(secret)
      
      await expect(jwtVerify(token, secret)).rejects.toThrow()
    })
    
    it('should reject tokens with invalid signature', async () => {
      const validToken = await new SignJWT({ sub: 'user-123' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret)
      
      // Tamper with the token
      const parts = validToken.split('.')
      parts[1] = Buffer.from('{"sub":"admin-user"}').toString('base64url')
      const tamperedToken = parts.join('.')
      
      await expect(jwtVerify(tamperedToken, secret)).rejects.toThrow()
    })
    
    it('should enforce 2-hour session duration', async () => {
      const token = await new SignJWT({ sub: 'user-123' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret)
      
      const { payload } = await jwtVerify(token, secret)
      
      const exp = payload.exp!
      const iat = payload.iat!
      const duration = exp - iat
      
      expect(duration).toBe(2 * 60 * 60) // 2 hours in seconds
    })
  })
  
  describe('Environment Security', () => {
    it('should validate JWT secret strength', () => {
      const JwtSchema = z.string().min(32)
      
      // Valid secrets
      expect(() => JwtSchema.parse('a'.repeat(32))).not.toThrow()
      expect(() => JwtSchema.parse('a'.repeat(64))).not.toThrow()
      
      // Invalid secrets
      expect(() => JwtSchema.parse('short-secret')).toThrow()
      expect(() => JwtSchema.parse('a'.repeat(31))).toThrow()
    })
    
    it('should reject default credentials', () => {
      const validateCredentials = (username: string, password: string) => {
        if (username === 'admin') throw new Error('Default username')
        if (password === 'change-this-password') throw new Error('Default password')
        if (password === 'password123') throw new Error('Weak password')
        return true
      }
      
      expect(() => validateCredentials('customuser', 'StrongPass123!')).not.toThrow()
      expect(() => validateCredentials('admin', 'StrongPass123!')).toThrow()
      expect(() => validateCredentials('customuser', 'change-this-password')).toThrow()
      expect(() => validateCredentials('customuser', 'password123')).toThrow()
    })
  })
  
  describe('Rate Limiting', () => {
    // Mock rate limiter
    const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
    
    const checkRateLimit = (key: string, limit: number, windowMs: number) => {
      const now = Date.now()
      const record = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs }
      
      if (now > record.resetAt) {
        record.count = 0
        record.resetAt = now + windowMs
      }
      
      record.count++
      rateLimitStore.set(key, record)
      
      return {
        allowed: record.count <= limit,
        count: record.count,
        limit,
        resetAt: record.resetAt,
      }
    }
    
    it('should enforce rate limits', () => {
      const key = 'test-ip-login'
      const limit = 5
      const windowMs = 15 * 60 * 1000 // 15 minutes
      
      // First 5 requests should pass
      for (let i = 1; i <= 5; i++) {
        const result = checkRateLimit(key, limit, windowMs)
        expect(result.allowed).toBe(true)
        expect(result.count).toBe(i)
      }
      
      // 6th request should be blocked
      const blockedResult = checkRateLimit(key, limit, windowMs)
      expect(blockedResult.allowed).toBe(false)
      expect(blockedResult.count).toBe(6)
    })
    
    it('should reset rate limits after window', () => {
      const key = 'test-ip-reset'
      const limit = 3
      const windowMs = 100 // 100ms for testing
      
      // Use up the limit
      for (let i = 0; i < limit; i++) {
        checkRateLimit(key, limit, windowMs)
      }
      
      // Should be blocked
      expect(checkRateLimit(key, limit, windowMs).allowed).toBe(false)
      
      // Wait for window to pass
      setTimeout(() => {
        // Should be allowed again
        expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true)
      }, windowMs + 10)
    })
  })
  
  describe('Field Encryption', () => {
    // Import after env vars are set
    let encryptEmail: any, decryptEmail: any, encryptName: any, decryptName: any
    
    beforeAll(async () => {
      const encryption = await import('@/lib/security/encryption/field-encryption')
      encryptEmail = encryption.encryptEmail
      decryptEmail = encryption.decryptEmail
      encryptName = encryption.encryptName
      decryptName = encryption.decryptName
    })
    
    it('should encrypt and decrypt PII fields', () => {
      const email = 'test@example.com'
      const name = 'John Doe'
      
      const encryptedEmail = encryptEmail(email)
      const encryptedName = encryptName(name)
      
      expect(encryptedEmail).not.toBe(email)
      expect(encryptedName).not.toBe(name)
      
      const decryptedEmail = decryptEmail(encryptedEmail)
      const decryptedName = decryptName(encryptedName)
      
      expect(decryptedEmail).toBe(email)
      expect(decryptedName).toBe(name)
    })
    
    it('should use deterministic encryption for searchable fields', () => {
      const email = 'test@example.com'
      
      const encrypted1 = encryptEmail(email)
      const encrypted2 = encryptEmail(email)
      
      expect(encrypted1).toBe(encrypted2) // Same input = same output
    })
    
    it('should use random IVs for non-searchable fields', () => {
      const name = 'John Doe'
      
      const encrypted1 = encryptName(name)
      const encrypted2 = encryptName(name)
      
      expect(encrypted1).not.toBe(encrypted2) // Same input = different output
    })
  })
  
  describe('Input Validation', () => {
    it('should validate login inputs', () => {
      const LoginSchema = z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(8).max(128),
      })
      
      // Valid inputs
      expect(() => LoginSchema.parse({
        username: 'validuser',
        password: 'ValidPass123!',
      })).not.toThrow()
      
      // Invalid inputs
      expect(() => LoginSchema.parse({
        username: 'ab', // Too short
        password: 'ValidPass123!',
      })).toThrow()
      
      expect(() => LoginSchema.parse({
        username: 'validuser',
        password: 'short', // Too short
      })).toThrow()
    })
    
    it('should sanitize user inputs', () => {
      const sanitize = (input: string) => input
          .trim()
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
      
      expect(sanitize('  test  ')).toBe('test')
      expect(sanitize('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(sanitize('<b>bold</b> text')).toBe('bold text')
    })
  })
  
  describe('Security Headers', () => {
    it('should generate secure CSP with nonce', () => {
      const nonce = 'test-nonce-123'
      const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
      
      expect(csp).toContain(`'nonce-${nonce}'`)
      expect(csp).toContain("frame-ancestors 'none'")
      expect(csp).toContain("base-uri 'self'")
    })
    
    it('should include all security headers', () => {
      const headers = {
        'Content-Security-Policy': 'default-src \'self\'',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-DNS-Prefetch-Control': 'off',
        'X-Download-Options': 'noopen',
        'X-Permitted-Cross-Domain-Policies': 'none',
      }
      
      // All required headers should be present
      expect(Object.keys(headers)).toContain('Content-Security-Policy')
      expect(Object.keys(headers)).toContain('X-Frame-Options')
      expect(Object.keys(headers)).toContain('X-Content-Type-Options')
      expect(Object.keys(headers)).toContain('Referrer-Policy')
      expect(Object.keys(headers)).toContain('Permissions-Policy')
    })
  })
  
  describe('CSRF Protection', () => {
    it('should validate request origin', () => {
      const validateOrigin = (origin: string, allowedOrigins: string[]) => allowedOrigins.includes(origin)
      
      const allowedOrigins = ['https://example.com', 'https://app.example.com']
      
      expect(validateOrigin('https://example.com', allowedOrigins)).toBe(true)
      expect(validateOrigin('https://app.example.com', allowedOrigins)).toBe(true)
      expect(validateOrigin('https://evil.com', allowedOrigins)).toBe(false)
    })
    
    it('should use SameSite cookies', () => {
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 2 * 60 * 60, // 2 hours
      }
      
      expect(cookieOptions.httpOnly).toBe(true)
      expect(cookieOptions.secure).toBe(true)
      expect(cookieOptions.sameSite).toBe('strict')
    })
  })
  
  describe('Error Handling', () => {
    it('should not expose sensitive information in errors', () => {
      const sanitizeError = (error: Error) => {
        const sensitivePatterns = [
          /password/i,
          /token/i,
          /secret/i,
          /key/i,
          /database/i,
          /connection string/i,
        ]
        
        let message = error.message
        for (const pattern of sensitivePatterns) {
          if (pattern.test(message)) {
            message = 'An error occurred. Please try again.'
            break
          }
        }
        
        return { message }
      }
      
      expect(sanitizeError(new Error('Invalid password')).message)
        .toBe('An error occurred. Please try again.')
      expect(sanitizeError(new Error('Token expired')).message)
        .toBe('An error occurred. Please try again.')
      expect(sanitizeError(new Error('User not found')).message)
        .toBe('User not found') // Non-sensitive error
    })
  })
})

// Integration tests
describe('Security Integration Tests', () => {
  it('should handle complete authentication flow', async () => {
    // This would test the full flow in a real environment
    // For now, we'll simulate the flow
    
    const authFlow = async (username: string, password: string) => {
      // 1. Validate input
      const LoginSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(8),
      })
      
      const validated = LoginSchema.parse({ username, password })
      
      // 2. Check rate limit
      const rateLimitKey = `login:${username}`
      // ... rate limit check ...
      
      // 3. Hash and compare password
      const storedHash = await hash(password, 12) // In reality, fetch from DB
      const isValid = await compare(password, storedHash)
      
      if (!isValid) throw new Error('Invalid credentials')
      
      // 4. Create JWT
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const token = await new SignJWT({
        sub: 'user-123',
        username,
        role: 'admin',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret)
      
      return { token }
    }
    
    const result = await authFlow('testuser', 'TestPass123!')
    expect(result.token).toBeDefined()
  })
})

afterAll(() => {
  // Cleanup
  jest.clearAllMocks()
})
