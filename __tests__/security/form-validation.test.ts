/**
 * Form Validation Tests
 * 
 * MEDIUM PRIORITY #11: Add form validation tests
 * 
 * Tests for all form inputs, validation rules, sanitization,
 * and security measures.
 */

import { describe, it, expect } from '@jest/globals'
import { z } from 'zod'

describe('Form Validation Tests', () => {
  
  describe('Contact Form Validation', () => {
    const ContactFormSchema = z.object({
      name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
      
      email: z.string()
        .email('Invalid email address')
        .max(255, 'Email must be less than 255 characters'),
      
      phone: z.string()
        .regex(/^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
        .optional()
        .or(z.literal('')),
      
      company: z.string()
        .max(100, 'Company name must be less than 100 characters')
        .optional(),
      
      message: z.string()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be less than 1000 characters'),
      
      service: z.enum(['web', 'revops', 'analytics', 'other']).optional(),
      
      budget: z.enum(['<5k', '5k-10k', '10k-25k', '25k-50k', '50k+']).optional(),
    })
    
    it('should validate valid contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        company: 'Acme Corp',
        message: 'I need help with my website redesign project.',
        service: 'web',
        budget: '10k-25k',
      }
      
      expect(() => ContactFormSchema.parse(validData)).not.toThrow()
    })
    
    it('should reject invalid names', () => {
      const invalidNames = [
        { name: 'J', reason: 'too short' },
        { name: 'John123', reason: 'contains numbers' },
        { name: 'John@Doe', reason: 'contains invalid characters' },
        { name: 'a'.repeat(101), reason: 'too long' },
        { name: '<script>alert("xss")</script>', reason: 'XSS attempt' },
      ]
      
      for (const { name, reason } of invalidNames) {
        expect(() => ContactFormSchema.parse({
          name,
          email: 'test@example.com',
          message: 'Valid message content',
        })).toThrow()
      }
    })
    
    it('should validate email addresses strictly', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user@subdomain.example.com',
      ]
      
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        'user@example',
      ]
      
      for (const email of validEmails) {
        expect(() => ContactFormSchema.parse({
          name: 'John Doe',
          email,
          message: 'Valid message content',
        })).not.toThrow()
      }
      
      for (const email of invalidEmails) {
        expect(() => ContactFormSchema.parse({
          name: 'John Doe',
          email,
          message: 'Valid message content',
        })).toThrow()
      }
    })
    
    it('should validate phone numbers', () => {
      const validPhones = [
        '+1-555-123-4567',
        '(555) 123-4567',
        '555.123.4567',
        '5551234567',
        '+44 20 7123 4567',
        '',  // Optional field
      ]
      
      const invalidPhones = [
        '123',  // Too short
        'abc-def-ghij',  // Letters
        '555-CALL-NOW',  // Letters
      ]
      
      for (const phone of validPhones) {
        expect(() => ContactFormSchema.parse({
          name: 'John Doe',
          email: 'test@example.com',
          phone,
          message: 'Valid message content',
        })).not.toThrow()
      }
      
      for (const phone of invalidPhones) {
        expect(() => ContactFormSchema.parse({
          name: 'John Doe',
          email: 'test@example.com',
          phone,
          message: 'Valid message content',
        })).toThrow()
      }
    })
    
    it('should enforce message length requirements', () => {
      const shortMessage = 'Too short'
      const validMessage = 'This is a valid message that meets the minimum length requirement.'
      const longMessage = 'x'.repeat(1001)
      
      expect(() => ContactFormSchema.parse({
        name: 'John Doe',
        email: 'test@example.com',
        message: shortMessage,
      })).toThrow()
      
      expect(() => ContactFormSchema.parse({
        name: 'John Doe',
        email: 'test@example.com',
        message: validMessage,
      })).not.toThrow()
      
      expect(() => ContactFormSchema.parse({
        name: 'John Doe',
        email: 'test@example.com',
        message: longMessage,
      })).toThrow()
    })
  })
  
  describe('Newsletter Signup Validation', () => {
    const NewsletterSchema = z.object({
      email: z.string()
        .email('Please enter a valid email address')
        .max(255),
      
      name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100)
        .optional(),
      
      interests: z.array(z.enum(['development', 'design', 'marketing', 'business']))
        .min(1, 'Please select at least one interest')
        .max(4),
      
      consent: z.boolean()
        .refine(val => val === true, 'You must agree to receive emails'),
    })
    
    it('should validate newsletter signup', () => {
      const validData = {
        email: 'subscriber@example.com',
        name: 'Jane Smith',
        interests: ['development', 'design'],
        consent: true,
      }
      
      expect(() => NewsletterSchema.parse(validData)).not.toThrow()
    })
    
    it('should require consent', () => {
      const dataWithoutConsent = {
        email: 'subscriber@example.com',
        interests: ['development'],
        consent: false,
      }
      
      expect(() => NewsletterSchema.parse(dataWithoutConsent)).toThrow('You must agree')
    })
    
    it('should require at least one interest', () => {
      const dataWithoutInterests = {
        email: 'subscriber@example.com',
        interests: [],
        consent: true,
      }
      
      expect(() => NewsletterSchema.parse(dataWithoutInterests)).toThrow('at least one interest')
    })
  })
  
  describe('Login Form Validation', () => {
    const LoginSchema = z.object({
      username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters'),
      
      rememberMe: z.boolean().optional(),
    })
    
    it('should validate login credentials', () => {
      const validLogin = {
        username: 'testuser123',
        password: 'SecurePassword123!',
        rememberMe: true,
      }
      
      expect(() => LoginSchema.parse(validLogin)).not.toThrow()
    })
    
    it('should reject SQL injection attempts', () => {
      const sqlInjectionAttempts = [
        "admin' OR '1'='1",
        "admin'; DROP TABLE users--",
        "' OR 1=1--",
        "admin'/*",
      ]
      
      for (const attempt of sqlInjectionAttempts) {
        expect(() => LoginSchema.parse({
          username: attempt,
          password: 'password',
        })).toThrow()
      }
    })
    
    it('should enforce username constraints', () => {
      // Too short
      expect(() => LoginSchema.parse({
        username: 'ab',
        password: 'ValidPassword123',
      })).toThrow()
      
      // Special characters
      expect(() => LoginSchema.parse({
        username: 'user@name',
        password: 'ValidPassword123',
      })).toThrow()
      
      // Too long
      expect(() => LoginSchema.parse({
        username: 'a'.repeat(51),
        password: 'ValidPassword123',
      })).toThrow()
    })
  })
  
  describe('File Upload Validation', () => {
    const FileUploadSchema = z.object({
      file: z.object({
        name: z.string()
          .regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'Invalid filename')
          .max(255),
        
        size: z.number()
          .max(5 * 1024 * 1024, 'File must be less than 5MB'),
        
        type: z.enum([
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ], {
          errorMap: () => ({ message: 'File type not allowed' }),
        }),
      }),
      
      description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    })
    
    it('should validate allowed file uploads', () => {
      const validFiles = [
        { name: 'document.pdf', size: 1024 * 1024, type: 'application/pdf' },
        { name: 'image.jpg', size: 500 * 1024, type: 'image/jpeg' },
        { name: 'photo.png', size: 2 * 1024 * 1024, type: 'image/png' },
      ]
      
      for (const file of validFiles) {
        expect(() => FileUploadSchema.parse({
          file,
          description: 'Test file upload',
        })).not.toThrow()
      }
    })
    
    it('should reject dangerous file types', () => {
      const dangerousFiles = [
        { name: 'script.exe', size: 1024, type: 'application/x-msdownload' },
        { name: 'virus.bat', size: 1024, type: 'application/x-bat' },
        { name: 'hack.sh', size: 1024, type: 'application/x-sh' },
        { name: 'malware.zip', size: 1024, type: 'application/zip' },
      ]
      
      for (const file of dangerousFiles) {
        expect(() => FileUploadSchema.parse({ file })).toThrow('File type not allowed')
      }
    })
    
    it('should reject files that are too large', () => {
      const largeFile = {
        name: 'large.pdf',
        size: 10 * 1024 * 1024, // 10MB
        type: 'application/pdf',
      }
      
      expect(() => FileUploadSchema.parse({ file: largeFile })).toThrow('less than 5MB')
    })
    
    it('should validate filenames', () => {
      const invalidFilenames = [
        '../../../etc/passwd',  // Path traversal
        'file<script>.pdf',     // XSS attempt
        'file\x00.pdf',         // Null byte
        'file;rm -rf /.pdf',    // Command injection
      ]
      
      for (const name of invalidFilenames) {
        expect(() => FileUploadSchema.parse({
          file: { name, size: 1024, type: 'application/pdf' },
        })).toThrow('Invalid filename')
      }
    })
  })
  
  describe('Input Sanitization', () => {
    const sanitizeInput = (input: string): string => 
       input
        .trim()
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/[<>\"']/g, '')  // Remove special characters
        .replace(/\s+/g, ' ')     // Normalize whitespace
    
    
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<p>Hello</p>')).toBe('Hello')
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert(xss)')
      expect(sanitizeInput('Hello <b>World</b>!')).toBe('Hello World!')
    })
    
    it('should normalize whitespace', () => {
      expect(sanitizeInput('  Hello   World  ')).toBe('Hello World')
      expect(sanitizeInput('Hello\n\nWorld')).toBe('Hello World')
      expect(sanitizeInput('Hello\t\tWorld')).toBe('Hello World')
    })
    
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('Hello "World"')).toBe('Hello World')
      expect(sanitizeInput("It's <great>")).toBe('Its great')
      expect(sanitizeInput('Test\'; DROP TABLE users--')).toBe('Test; DROP TABLE users--')
    })
  })
  
  describe('CSRF Token Validation', () => {
    const validateCSRFToken = (token: string | null, sessionToken: string): boolean => {
      if (!token || token.length < 32) return false
      return token === sessionToken
    }
    
    it('should validate CSRF tokens', () => {
      const sessionToken = 'a'.repeat(32)
      
      // Valid token
      expect(validateCSRFToken(sessionToken, sessionToken)).toBe(true)
      
      // Invalid tokens
      expect(validateCSRFToken(null, sessionToken)).toBe(false)
      expect(validateCSRFToken('wrong-token', sessionToken)).toBe(false)
      expect(validateCSRFToken('short', sessionToken)).toBe(false)
    })
  })
  
  describe('Honeypot Field Detection', () => {
    const checkHoneypot = (formData: any): boolean => {
      // Honeypot fields that should be empty
      const honeypotFields = ['email_confirm', 'url', 'website', 'fax']
      
      for (const field of honeypotFields) {
        if (formData[field] && formData[field].length > 0) {
          return true // Bot detected
        }
      }
      
      return false // Legitimate submission
    }
    
    it('should detect bot submissions', () => {
      // Bot filled honeypot fields
      const botSubmission = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
        email_confirm: 'john@example.com', // Honeypot field
      }
      
      expect(checkHoneypot(botSubmission)).toBe(true)
    })
    
    it('should allow legitimate submissions', () => {
      // Legitimate user left honeypot fields empty
      const legitimateSubmission = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
        email_confirm: '', // Empty honeypot
        url: '', // Empty honeypot
      }
      
      expect(checkHoneypot(legitimateSubmission)).toBe(false)
    })
  })
  
  describe('Time-based Validation', () => {
    it('should detect too-fast form submissions', () => {
      const validateSubmissionTime = (startTime: number, minTime: number = 3000): boolean => {
        const submissionTime = Date.now() - startTime
        return submissionTime >= minTime
      }
      
      // Too fast (likely bot)
      const fastSubmission = Date.now() - 500 // 500ms
      expect(validateSubmissionTime(fastSubmission)).toBe(false)
      
      // Normal speed
      const normalSubmission = Date.now() - 5000 // 5 seconds
      expect(validateSubmissionTime(normalSubmission)).toBe(true)
    })
  })
})
