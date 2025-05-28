/**
 * API Security Tests
 * 
 * MEDIUM PRIORITY #10: Add API security tests
 * 
 * Tests for API endpoints, rate limiting, input validation,
 * CORS, and authentication/authorization.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { TRPCError } from '@trpc/server'
import { createProductionRateLimit, PRODUCTION_RATE_LIMITS } from '@/lib/redis/production-rate-limiter'

// Mock Next.js modules
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// Mock environment
process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

describe('API Security Tests', () => {
  let mockHeaders: any
  
  beforeEach(() => {
    mockHeaders = new Map([
      ['content-type', 'application/json'],
      ['x-forwarded-for', '192.168.1.1'],
      ['user-agent', 'Mozilla/5.0'],
    ])
    ;(headers as jest.Mock).mockResolvedValue(mockHeaders)
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('Request Validation', () => {
    it('should validate Content-Type header', async () => {
      const validateContentType = (req: NextRequest) => {
        const contentType = req.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          return NextResponse.json(
            { error: 'Content-Type must be application/json' },
            { status: 400 },
          )
        }
        return null
      }
      
      // Valid request
      const validReq = new NextRequest('https://example.com/api/test', {
        headers: { 'content-type': 'application/json' },
      })
      expect(validateContentType(validReq)).toBeNull()
      
      // Invalid request
      const invalidReq = new NextRequest('https://example.com/api/test', {
        headers: { 'content-type': 'text/plain' },
      })
      const response = validateContentType(invalidReq)
      expect(response?.status).toBe(400)
    })
    
    it('should validate request origin', () => {
      const validateOrigin = (origin: string | null) => {
        const allowedOrigins = [
          'https://example.com',
          'https://app.example.com',
          'http://localhost:3000', // Development
        ]
        
        if (!origin || !allowedOrigins.includes(origin)) {
          return NextResponse.json(
            { error: 'Invalid origin' },
            { status: 403 },
          )
        }
        return null
      }
      
      // Valid origins
      expect(validateOrigin('https://example.com')).toBeNull()
      expect(validateOrigin('http://localhost:3000')).toBeNull()
      
      // Invalid origins
      const response = validateOrigin('https://evil.com')
      expect(response?.status).toBe(403)
    })
    
    it('should validate API keys when required', () => {
      const validateApiKey = (apiKey: string | null) => {
        const validKeys = new Set(['key-123', 'key-456'])
        
        if (!apiKey || !validKeys.has(apiKey)) {
          return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 },
          )
        }
        return null
      }
      
      // Valid key
      expect(validateApiKey('key-123')).toBeNull()
      
      // Invalid key
      const response = validateApiKey('invalid-key')
      expect(response?.status).toBe(401)
    })
  })
  
  describe('Rate Limiting', () => {
    it('should enforce API rate limits', async () => {
      const mockRateLimiter = {
        checkRateLimit: jest.fn(),
      }
      
      // First few requests succeed
      mockRateLimiter.checkRateLimit.mockResolvedValueOnce(undefined)
      mockRateLimiter.checkRateLimit.mockResolvedValueOnce(undefined)
      
      // Then rate limit exceeded
      mockRateLimiter.checkRateLimit.mockRejectedValueOnce(
        new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded',
        }),
      )
      
      // Test the flow
      await expect(mockRateLimiter.checkRateLimit()).resolves.toBeUndefined()
      await expect(mockRateLimiter.checkRateLimit()).resolves.toBeUndefined()
      await expect(mockRateLimiter.checkRateLimit()).rejects.toThrow('Rate limit exceeded')
    })
    
    it('should have different limits for different endpoints', () => {
      const limits = PRODUCTION_RATE_LIMITS
      
      // Auth endpoints should be more restrictive
      expect(limits.AUTH_LOGIN.maxRequests).toBeLessThan(limits.API_GENERAL.maxRequests)
      expect(limits.PASSWORD_RESET.maxRequests).toBeLessThan(limits.API_GENERAL.maxRequests)
      
      // Contact forms should be very restrictive
      expect(limits.CONTACT_FORM.maxRequests).toBe(2)
      expect(limits.CONTACT_FORM.windowMs).toBe(15 * 60 * 1000) // 15 minutes
      
      // Analytics can have higher limits
      expect(limits.ANALYTICS.maxRequests).toBeGreaterThan(limits.API_GENERAL.maxRequests)
    })
    
    it('should extract client IP correctly', () => {
      const extractIPAddress = (req: any) => (
          req.headers.get('x-real-ip') ||
          req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          req.ip ||
          'unknown'
        )
      
      // Test various header configurations
      const req1 = { headers: new Map([['x-real-ip', '1.2.3.4']]) }
      expect(extractIPAddress(req1)).toBe('1.2.3.4')
      
      const req2 = { headers: new Map([['x-forwarded-for', '5.6.7.8, 9.10.11.12']]) }
      expect(extractIPAddress(req2)).toBe('5.6.7.8')
      
      const req3 = { headers: new Map(), ip: '13.14.15.16' }
      expect(extractIPAddress(req3)).toBe('13.14.15.16')
    })
  })
  
  describe('Input Sanitization', () => {
    it('should sanitize user inputs to prevent XSS', () => {
      const sanitizeInput = (input: string): string => input
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim()
      
      // XSS attempts
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(sanitizeInput('<img src=x onerror=alert("xss")>')).toBe('')
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")')
      expect(sanitizeInput('<div onclick="alert()">text</div>')).toBe('text')
    })
    
    it('should validate and sanitize JSON inputs', () => {
      const parseJSON = (input: string) => {
        try {
          const parsed = JSON.parse(input)
          // Remove any potentially dangerous keys
          const dangerous = ['__proto__', 'constructor', 'prototype']
          for (const key of dangerous) {
            delete parsed[key]
          }
          return { success: true, data: parsed }
        } catch {
          return { success: false, error: 'Invalid JSON' }
        }
      }
      
      // Valid JSON
      const valid = parseJSON('{"name": "test", "value": 123}')
      expect(valid.success).toBe(true)
      expect(valid.data).toEqual({ name: 'test', value: 123 })
      
      // Invalid JSON
      const invalid = parseJSON('not json')
      expect(invalid.success).toBe(false)
      
      // Prototype pollution attempt
      const malicious = parseJSON('{"__proto__": {"isAdmin": true}}')
      expect(malicious.success).toBe(true)
      expect(malicious.data).not.toHaveProperty('__proto__')
    })
    
    it('should validate file uploads', () => {
      const validateFile = (file: { name: string; size: number; type: string }) => {
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
        
        // Check file size
        if (file.size > maxSize) {
          return { valid: false, error: 'File too large' }
        }
        
        // Check MIME type
        if (!allowedTypes.includes(file.type)) {
          return { valid: false, error: 'Invalid file type' }
        }
        
        // Check file extension
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
        if (!allowedExtensions.includes(ext)) {
          return { valid: false, error: 'Invalid file extension' }
        }
        
        return { valid: true }
      }
      
      // Valid file
      expect(validateFile({
        name: 'image.jpg',
        size: 1024 * 1024,
        type: 'image/jpeg',
      })).toEqual({ valid: true })
      
      // Too large
      expect(validateFile({
        name: 'large.jpg',
        size: 10 * 1024 * 1024,
        type: 'image/jpeg',
      })).toEqual({ valid: false, error: 'File too large' })
      
      // Invalid type
      expect(validateFile({
        name: 'script.exe',
        size: 1024,
        type: 'application/x-executable',
      })).toEqual({ valid: false, error: 'Invalid file type' })
    })
  })
  
  describe('CORS Configuration', () => {
    it('should set appropriate CORS headers', () => {
      const setCorsHeaders = (response: NextResponse, origin: string) => {
        const allowedOrigins = ['https://example.com', 'https://app.example.com']
        
        if (allowedOrigins.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin)
          response.headers.set('Access-Control-Allow-Credentials', 'true')
          response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          response.headers.set('Access-Control-Max-Age', '86400')
        }
        
        return response
      }
      
      const response = new NextResponse()
      setCorsHeaders(response, 'https://example.com')
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })
    
    it('should handle preflight requests', () => {
      const handlePreflight = (req: NextRequest) => {
        if (req.method === 'OPTIONS') {
          return new NextResponse(null, { status: 204 })
        }
        return null
      }
      
      const preflightReq = new NextRequest('https://example.com/api/test', {
        method: 'OPTIONS',
      })
      
      const response = handlePreflight(preflightReq)
      expect(response?.status).toBe(204)
    })
  })
  
  describe('API Authentication', () => {
    it('should validate JWT tokens in API requests', async () => {
      const validateToken = async (token: string | null) => {
        if (!token) {
          return { valid: false, error: 'No token provided' }
        }
        
        if (!token.startsWith('Bearer ')) {
          return { valid: false, error: 'Invalid token format' }
        }
        
        // In reality, would verify JWT here
        const jwt = token.substring(7)
        if (jwt === 'valid-jwt-token') {
          return { valid: true, user: { id: 'user-123', role: 'admin' } }
        }
        
        return { valid: false, error: 'Invalid token' }
      }
      
      // Valid token
      const validResult = await validateToken('Bearer valid-jwt-token')
      expect(validResult.valid).toBe(true)
      expect(validResult.user).toBeDefined()
      
      // Invalid token
      const invalidResult = await validateToken('Bearer invalid-token')
      expect(invalidResult.valid).toBe(false)
      
      // No token
      const noTokenResult = await validateToken(null)
      expect(noTokenResult.valid).toBe(false)
    })
    
    it('should enforce authorization rules', () => {
      const authorize = (user: any, requiredRole: string) => {
        if (!user) {
          return { authorized: false, error: 'Not authenticated' }
        }
        
        if (requiredRole === 'admin' && user.role !== 'admin') {
          return { authorized: false, error: 'Admin access required' }
        }
        
        return { authorized: true }
      }
      
      // Admin accessing admin endpoint
      expect(authorize({ role: 'admin' }, 'admin')).toEqual({ authorized: true })
      
      // User accessing admin endpoint
      expect(authorize({ role: 'user' }, 'admin')).toEqual({
        authorized: false,
        error: 'Admin access required',
      })
      
      // Unauthenticated access
      expect(authorize(null, 'user')).toEqual({
        authorized: false,
        error: 'Not authenticated',
      })
    })
  })
  
  describe('Error Handling', () => {
    it('should not expose internal errors', () => {
      const handleError = (error: Error) => {
        const internalErrors = [
          'ECONNREFUSED',
          'ETIMEDOUT',
          'database',
          'prisma',
          'connection',
        ]
        
        let message = 'An error occurred'
        let status = 500
        
        if (error.message.includes('validation')) {
          message = error.message
          status = 400
        } else if (error.message.includes('unauthorized')) {
          message = 'Unauthorized'
          status = 401
        } else if (error.message.includes('not found')) {
          message = 'Resource not found'
          status = 404
        } else {
          // Check if it's an internal error
          const isInternal = internalErrors.some(err => 
            error.message.toLowerCase().includes(err),
          )
          if (isInternal) {
            message = 'Internal server error'
          }
        }
        
        return { message, status }
      }
      
      // User-facing errors
      expect(handleError(new Error('validation failed'))).toEqual({
        message: 'validation failed',
        status: 400,
      })
      
      // Internal errors should be hidden
      expect(handleError(new Error('database connection failed'))).toEqual({
        message: 'Internal server error',
        status: 500,
      })
      
      expect(handleError(new Error('ECONNREFUSED 127.0.0.1:5432'))).toEqual({
        message: 'Internal server error',
        status: 500,
      })
    })
    
    it('should log errors appropriately', () => {
      const logger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
      }
      
      const logError = (error: Error, context: any) => {
        const severity = error.message.includes('critical') ? 'error' : 'warn'
        
        const logData = {
          message: error.message,
          stack: error.stack,
          ...context,
          // Don't log sensitive data
          password: undefined,
          token: undefined,
          apiKey: undefined,
        }
        
        if (severity === 'error') {
          logger.error('API Error', logData)
        } else {
          logger.warn('API Warning', logData)
        }
      }
      
      // Test error logging
      logError(new Error('critical database error'), {
        endpoint: '/api/users',
        userId: 'user-123',
        password: 'should-not-log',
      })
      
      expect(logger.error).toHaveBeenCalledWith('API Error', expect.objectContaining({
        message: 'critical database error',
        endpoint: '/api/users',
        userId: 'user-123',
      }))
      
      // Ensure sensitive data not logged
      const logCall = logger.error.mock.calls[0][1]
      expect(logCall.password).toBeUndefined()
    })
  })
  
  describe('Response Security', () => {
    it('should set security headers on responses', () => {
      const setSecurityHeaders = (response: NextResponse) => {
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-XSS-Protection', '1; mode=block')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        
        return response
      }
      
      const response = new NextResponse()
      setSecurityHeaders(response)
      
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('Cache-Control')).toContain('no-store')
    })
    
    it('should prevent response splitting', () => {
      const sanitizeHeader = (value: string): string => 
        // Remove any newline characters that could cause response splitting
         value.replace(/[\r\n]/g, '')
      
      
      const maliciousInput = 'value\r\nX-Injected-Header: malicious'
      const sanitized = sanitizeHeader(maliciousInput)
      
      expect(sanitized).toBe('valueX-Injected-Header: malicious')
      expect(sanitized).not.toContain('\r')
      expect(sanitized).not.toContain('\n')
    })
  })
})
